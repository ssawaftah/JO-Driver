/**
 * Cloudflare Worker: driverjo backend.
 *
 * Two responsibilities in one Worker (same deployment as before, extended):
 *
 * 1) Image upload -> R2 (unchanged from the original version): POST to the
 *    root path with either multipart/form-data (a `file` field) or a JSON
 *    body `{ url }` to mirror an external image into R2. Auth via the
 *    `X-Upload-Key` header. Used by admin.html and center-join.html.
 *
 * 2) `/api/*` -> a small REST API backed by a Cloudflare D1 database, which
 *    replaces the old Firebase Realtime Database for: centers, center-join
 *    requests, governorates and areas. Public GET endpoints serve the data
 *    that used to be manually exported to R2 as centers.json (now always
 *    live, no manual export/upload step). Admin write endpoints (create,
 *    update, delete; and reading pending requests) require the
 *    `X-Admin-Key` header. Submitting a new join request stays public
 *    (no key), same as the old Firebase write rules.
 *
 * Firebase is still used elsewhere in the project ONLY for pages/reviews.html
 * (its data + login) and pages/theory-test-practice.html - do not route those
 * through this Worker.
 *
 * خطوات النشر: تم النشر تلقائيًا عبر Wrangler (D1 binding DB + R2 binding BUCKET).
 * راجع cloudflare-worker/README.md لمعرفة كل الروابط والمفاتيح المُنشأة.
 */

const ALLOWED_ORIGINS = [
  'https://www.driverjo.online',
  'https://driverjo.online',
];

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

function corsHeadersFor(request) {
  const origin = request.headers.get('Origin') || '';
  const allowOrigin = origin ? origin : ALLOWED_ORIGINS[0]; // public GET data is meant to be fetched from anywhere (was public in Firebase too)
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Upload-Key, X-Admin-Key',
  };
}

function json(data, status, cors) {
  return new Response(JSON.stringify(data), { status: status || 200, headers: { 'Content-Type': 'application/json', ...cors } });
}

function newId(prefix) {
  return (prefix ? prefix + '-' : '') + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function isAdmin(request, env) {
  const key = request.headers.get('X-Admin-Key') || '';
  return !!env.ADMIN_KEY && key === env.ADMIN_KEY;
}

/* ════════════════════════════════════════════════════
   D1 helpers: each table stores { id, data JSON, ...index cols }
   and rows are returned Firebase-style as { [id]: {...fields} }.
════════════════════════════════════════════════════ */

async function rowsToDict(stmt) {
  const { results } = await stmt.all();
  const out = {};
  for (const row of results) {
    out[row.id] = JSON.parse(row.data);
  }
  return out;
}

/* ════════════════════════════════════════════════════
   Keep the R2 JSON snapshots (centers.json / governorates.json / areas.json /
   version.json served from data.driverjo.online) in sync on every write, so
   driving-schools.html / center-details.html / the Blogger template keep
   working unchanged - no manual export+upload step, it just always reflects D1.
════════════════════════════════════════════════════ */

async function syncSnapshot(env, table, filename) {
  if (!env.BUCKET) return;
  const dict = await rowsToDict(env.DB.prepare(`SELECT id, data FROM ${table}`));
  await env.BUCKET.put(filename, JSON.stringify(dict), { httpMetadata: { contentType: 'application/json' } });
}

async function bumpVersion(env) {
  if (!env.BUCKET) return;
  await env.BUCKET.put('version.json', JSON.stringify({ v: Date.now() }), { httpMetadata: { contentType: 'application/json' } });
}

async function syncCenters(env)      { await syncSnapshot(env, 'centers', 'centers.json'); await bumpVersion(env); }
async function syncGovernorates(env) { await syncSnapshot(env, 'governorates', 'governorates.json'); await bumpVersion(env); }
async function syncAreas(env)        { await syncSnapshot(env, 'areas', 'areas.json'); await bumpVersion(env); }

async function handleApi(request, env, url) {
  const cors = corsHeadersFor(request);
  if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (!env.DB) return json({ error: 'Worker misconfigured: missing DB (D1) binding' }, 500, cors);

  const parts = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean); // e.g. ['centers', 'abc123']
  const resource = parts[0];
  const id = parts[1];
  const sub = parts[2];
  const nowIso = () => new Date().toISOString();

  try {
    /* ── governorates ── */
    if (resource === 'governorates') {
      if (request.method === 'GET') {
        return json(await rowsToDict(env.DB.prepare('SELECT id, data FROM governorates')), 200, cors);
      }
      if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, cors);
      if (request.method === 'POST') {
        const body = await request.json();
        const govId = body.id || newId('JO');
        const data = { name: body.name };
        await env.DB.prepare('INSERT INTO governorates (id, data, updated_at) VALUES (?, ?, ?)').bind(govId, JSON.stringify(data), nowIso()).run();
        await syncGovernorates(env);
        return json({ id: govId, ...data }, 201, cors);
      }
      if (id && request.method === 'PATCH') {
        const body = await request.json();
        const existing = await env.DB.prepare('SELECT data FROM governorates WHERE id = ?').bind(id).first();
        if (!existing) return json({ error: 'Not found' }, 404, cors);
        const merged = { ...JSON.parse(existing.data), ...body };
        await env.DB.prepare('UPDATE governorates SET data = ?, updated_at = ? WHERE id = ?').bind(JSON.stringify(merged), nowIso(), id).run();
        await syncGovernorates(env);
        return json({ id, ...merged }, 200, cors);
      }
      if (id && request.method === 'DELETE') {
        await env.DB.prepare('DELETE FROM governorates WHERE id = ?').bind(id).run();
        await syncGovernorates(env);
        return json({ ok: true }, 200, cors);
      }
    }

    /* ── areas ── */
    if (resource === 'areas') {
      if (request.method === 'GET') {
        const govId = url.searchParams.get('governorateId');
        const stmt = govId
          ? env.DB.prepare('SELECT id, data FROM areas WHERE governorate_id = ?').bind(govId)
          : env.DB.prepare('SELECT id, data FROM areas');
        return json(await rowsToDict(stmt), 200, cors);
      }
      if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, cors);
      if (request.method === 'POST') {
        const body = await request.json();
        if (!body.governorateId || !body.name) return json({ error: 'governorateId and name are required' }, 400, cors);
        const areaId = newId('AREA');
        const data = { governorateId: body.governorateId, name: body.name };
        await env.DB.prepare('INSERT INTO areas (id, governorate_id, data, updated_at) VALUES (?, ?, ?, ?)').bind(areaId, body.governorateId, JSON.stringify(data), nowIso()).run();
        await syncAreas(env);
        return json({ id: areaId, ...data }, 201, cors);
      }
      if (id && request.method === 'PATCH') {
        const body = await request.json();
        const existing = await env.DB.prepare('SELECT data FROM areas WHERE id = ?').bind(id).first();
        if (!existing) return json({ error: 'Not found' }, 404, cors);
        const merged = { ...JSON.parse(existing.data), ...body };
        await env.DB.prepare('UPDATE areas SET data = ?, governorate_id = ?, updated_at = ? WHERE id = ?').bind(JSON.stringify(merged), merged.governorateId, nowIso(), id).run();
        await syncAreas(env);
        return json({ id, ...merged }, 200, cors);
      }
      if (id && request.method === 'DELETE') {
        await env.DB.prepare('DELETE FROM areas WHERE id = ?').bind(id).run();
        await syncAreas(env);
        return json({ ok: true }, 200, cors);
      }
    }

    /* ── centers ── */
    if (resource === 'centers') {
      if (request.method === 'GET') {
        if (id) {
          const row = await env.DB.prepare('SELECT data FROM centers WHERE id = ?').bind(id).first();
          if (!row) return json({ error: 'Not found' }, 404, cors);
          return json({ id, ...JSON.parse(row.data) }, 200, cors);
        }
        return json(await rowsToDict(env.DB.prepare('SELECT id, data FROM centers')), 200, cors);
      }
      if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, cors);
      if (request.method === 'POST') {
        const body = await request.json();
        const centerId = newId();
        await env.DB.prepare('INSERT INTO centers (id, data, updated_at) VALUES (?, ?, ?)').bind(centerId, JSON.stringify(body), nowIso()).run();
        await syncCenters(env);
        return json({ id: centerId, ...body }, 201, cors);
      }
      if (id && request.method === 'PATCH') {
        const body = await request.json();
        const existing = await env.DB.prepare('SELECT data FROM centers WHERE id = ?').bind(id).first();
        if (!existing) return json({ error: 'Not found' }, 404, cors);
        const merged = { ...JSON.parse(existing.data) };
        for (const k of Object.keys(body)) {
          if (body[k] === null) delete merged[k]; else merged[k] = body[k];
        }
        await env.DB.prepare('UPDATE centers SET data = ?, updated_at = ? WHERE id = ?').bind(JSON.stringify(merged), nowIso(), id).run();
        await syncCenters(env);
        return json({ id, ...merged }, 200, cors);
      }
      if (id && request.method === 'DELETE') {
        await env.DB.prepare('DELETE FROM centers WHERE id = ?').bind(id).run();
        await syncCenters(env);
        return json({ ok: true }, 200, cors);
      }
    }

    /* ── center-requests ── */
    if (resource === 'center-requests') {
      if (request.method === 'GET') {
        if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, cors);
        const status = url.searchParams.get('status');
        const stmt = status
          ? env.DB.prepare('SELECT id, data FROM center_requests WHERE status = ?').bind(status)
          : env.DB.prepare('SELECT id, data FROM center_requests');
        return json(await rowsToDict(stmt), 200, cors);
      }
      if (request.method === 'POST' && !id) {
        // Public: anyone can submit a join request (same as the old Firebase write rule).
        const body = await request.json();
        const reqId = newId();
        const data = { ...body, status: 'pending', submittedAt: nowIso() };
        await env.DB.prepare('INSERT INTO center_requests (id, status, data, updated_at) VALUES (?, ?, ?, ?)').bind(reqId, 'pending', JSON.stringify(data), nowIso()).run();
        return json({ id: reqId, ...data }, 201, cors);
      }
      if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, cors);
      if (id && sub === 'approve' && request.method === 'POST') {
        // Atomically: create the published center + mark the request approved.
        const existing = await env.DB.prepare('SELECT data FROM center_requests WHERE id = ?').bind(id).first();
        if (!existing) return json({ error: 'Not found' }, 404, cors);
        const centerPayload = await request.json();
        const centerId = newId();
        const reqData = { ...JSON.parse(existing.data), status: 'approved', reviewedAt: nowIso(), publishedCenterId: centerId };
        await env.DB.batch([
          env.DB.prepare('INSERT INTO centers (id, data, updated_at) VALUES (?, ?, ?)').bind(centerId, JSON.stringify(centerPayload), nowIso()),
          env.DB.prepare('UPDATE center_requests SET data = ?, status = ?, updated_at = ? WHERE id = ?').bind(JSON.stringify(reqData), 'approved', nowIso(), id),
        ]);
        await syncCenters(env);
        return json({ centerId, request: { id, ...reqData } }, 200, cors);
      }
      if (id && request.method === 'PATCH') {
        const body = await request.json();
        const existing = await env.DB.prepare('SELECT data FROM center_requests WHERE id = ?').bind(id).first();
        if (!existing) return json({ error: 'Not found' }, 404, cors);
        const merged = { ...JSON.parse(existing.data), ...body };
        await env.DB.prepare('UPDATE center_requests SET data = ?, status = ?, updated_at = ? WHERE id = ?').bind(JSON.stringify(merged), merged.status || 'pending', nowIso(), id).run();
        return json({ id, ...merged }, 200, cors);
      }
      if (id && request.method === 'DELETE') {
        await env.DB.prepare('DELETE FROM center_requests WHERE id = ?').bind(id).run();
        return json({ ok: true }, 200, cors);
      }
    }

    return json({ error: 'Not found' }, 404, cors);
  } catch (err) {
    return json({ error: 'API error: ' + err.message }, 500, cors);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      return handleApi(request, env, url);
    }

    /* ══════════ original image-upload behaviour (unchanged) ══════════ */
    const origin = request.headers.get('Origin') || '';
    const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowOrigin,
      'Vary': 'Origin',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Upload-Key',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!env.BUCKET || !env.PUBLIC_BASE_URL) {
      return new Response(JSON.stringify({ error: 'Worker misconfigured: missing BUCKET binding or PUBLIC_BASE_URL' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const providedKey = request.headers.get('X-Upload-Key') || '';
    if (!env.UPLOAD_KEY || providedKey !== env.UPLOAD_KEY) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const base = (env.PUBLIC_BASE_URL || '').replace(/\/$/, '');
    const jsonHeaders = { 'Content-Type': 'application/json', ...corsHeaders };

    function keyFor(mimeType) {
      const ext = (mimeType.split('/')[1] || 'bin').replace('jpeg', 'jpg');
      return `questions/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    }

    try {
      const contentType = request.headers.get('Content-Type') || '';

      /* ── Mode 1: direct file upload (multipart/form-data) ── */
      if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        const file = formData.get('file');
        if (!file || typeof file === 'string') {
          return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400, headers: jsonHeaders });
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
          return new Response(JSON.stringify({ error: 'Unsupported file type' }), { status: 400, headers: jsonHeaders });
        }
        if (file.size > MAX_BYTES) {
          return new Response(JSON.stringify({ error: 'File too large (max 5MB)' }), { status: 400, headers: jsonHeaders });
        }

        const key = keyFor(file.type);
        await env.BUCKET.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
        return new Response(JSON.stringify({ url: `${base}/${key}` }), { status: 200, headers: jsonHeaders });
      }

      /* ── Mode 2: migrate an existing external URL (server-side fetch, avoids browser CORS) ── */
      if (contentType.includes('application/json')) {
        const body = await request.json();
        const sourceUrl = body && body.url;
        if (!sourceUrl || typeof sourceUrl !== 'string' || !/^https?:\/\//i.test(sourceUrl)) {
          return new Response(JSON.stringify({ error: 'Invalid or missing url' }), { status: 400, headers: jsonHeaders });
        }

        let resp;
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 15000);
          resp = await fetch(sourceUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DriverjoImageMigrator/1.0)' },
            signal: controller.signal,
          }).finally(() => clearTimeout(timer));
        } catch (e) {
          return new Response(JSON.stringify({ error: 'Could not reach source URL (timeout or network error): ' + e.message }), { status: 502, headers: jsonHeaders });
        }
        if (!resp.ok) {
          return new Response(JSON.stringify({ error: `Source URL returned HTTP ${resp.status}` }), { status: 502, headers: jsonHeaders });
        }
        let mimeType = (resp.headers.get('Content-Type') || '').split(';')[0].trim();
        if (!ALLOWED_TYPES.includes(mimeType)) {
          return new Response(JSON.stringify({ error: 'Source is not a supported image type (got: ' + mimeType + ')' }), { status: 400, headers: jsonHeaders });
        }
        const declaredLen = parseInt(resp.headers.get('Content-Length') || '0', 10);
        if (declaredLen > MAX_BYTES) {
          return new Response(JSON.stringify({ error: 'Source image too large (max 5MB)' }), { status: 400, headers: jsonHeaders });
        }

        const buf = await resp.arrayBuffer();
        if (buf.byteLength > MAX_BYTES) {
          return new Response(JSON.stringify({ error: 'Source image too large (max 5MB)' }), { status: 400, headers: jsonHeaders });
        }

        const key = keyFor(mimeType);
        await env.BUCKET.put(key, buf, { httpMetadata: { contentType: mimeType } });
        return new Response(JSON.stringify({ url: `${base}/${key}` }), { status: 200, headers: jsonHeaders });
      }

      return new Response(JSON.stringify({ error: 'Unsupported Content-Type' }), { status: 400, headers: jsonHeaders });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Upload failed: ' + err.message }), { status: 500, headers: jsonHeaders });
    }
  },
};
