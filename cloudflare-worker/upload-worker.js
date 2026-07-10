/**
 * Cloudflare Worker: رفع صور إلى R2 وإرجاع رابط مباشر مستضاف.
 *
 * خطوات النشر (من لوحة تحكم Cloudflare):
 * 1) أنشئ R2 bucket (مثال: driverjo-images) وفعّل "Public access" له عبر
 *    Settings > Public access > Allow Access (سيعطيك رابط r2.dev عام
 *    مثل: https://pub-xxxxxxxx.r2.dev)
 * 2) Workers & Pages > Create Worker، الصق هذا الكود.
 * 3) في إعدادات الـ Worker > Settings > Variables:
 *    - Bindings: أضف R2 bucket binding باسم BUCKET يشير إلى bucket الخطوة 1.
 *    - Environment Variables: أضف UPLOAD_KEY (كـ Secret) بقيمة سرّية من اختيارك،
 *      وأضف PUBLIC_BASE_URL بقيمة رابط r2.dev العام من الخطوة 1 (بدون / في النهاية).
 * 4) نشر (Deploy) والحصول على رابط الـ Worker (مثال: https://upload.xxxx.workers.dev)
 *    ثم زوّدني به مع قيمة UPLOAD_KEY لأربطهما بـ admin.html.
 *
 * ملاحظة أمنية: UPLOAD_KEY مُخزّن هنا داخل admin.html (كود عميل)، وهذا يعني أن
 * أي شخص يستطيع رؤية مصدر الصفحة يمكنه استخراجه. تم تقييد CORS إلى نطاقات
 * ALLOWED_ORIGINS أدناه لتقليل إساءة الاستخدام، لكن هذا لا يمنع طلبًا مباشرًا
 * (خارج المتصفح) يحمل نفس المفتاح ونفس Origin مزيّف بأدوات مثل curl. هذا يطابق
 * مستوى الحماية الحالي للوحة التحكم (تحقق UID بسيط دون مصادقة حقيقية)، وهو
 * مقبول لموقع صغير، لكن لأمان أقوى لاحقًا يُفضّل توليد رمز رفع مؤقت من خادم
 * موثوق بدل مفتاح ثابت دائم.
 */

// أضف هنا كل نطاق يُسمح له فعليًا بطلب الرفع (لوحة التحكم فقط).
const ALLOWED_ORIGINS = [
  'https://www.driverjo.online',
  'https://driverjo.online',
];

export default {
  async fetch(request, env) {
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

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const MAX_BYTES = 5 * 1024 * 1024; // 5MB
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
          resp = await fetch(sourceUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DriverjoImageMigrator/1.0)' } });
        } catch (e) {
          return new Response(JSON.stringify({ error: 'Could not reach source URL: ' + e.message }), { status: 502, headers: jsonHeaders });
        }
        if (!resp.ok) {
          return new Response(JSON.stringify({ error: `Source URL returned HTTP ${resp.status}` }), { status: 502, headers: jsonHeaders });
        }
        let mimeType = (resp.headers.get('Content-Type') || '').split(';')[0].trim();
        if (!ALLOWED_TYPES.includes(mimeType)) {
          return new Response(JSON.stringify({ error: 'Source is not a supported image type (got: ' + mimeType + ')' }), { status: 400, headers: jsonHeaders });
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
