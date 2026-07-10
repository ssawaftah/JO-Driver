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
 */

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
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

    const providedKey = request.headers.get('X-Upload-Key') || '';
    if (!env.UPLOAD_KEY || providedKey !== env.UPLOAD_KEY) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    try {
      const formData = await request.formData();
      const file = formData.get('file');
      if (!file || typeof file === 'string') {
        return new Response(JSON.stringify({ error: 'No file provided' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowed.includes(file.type)) {
        return new Response(JSON.stringify({ error: 'Unsupported file type' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const ext = (file.type.split('/')[1] || 'bin').replace('jpeg', 'jpg');
      const key = `questions/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

      await env.BUCKET.put(key, await file.arrayBuffer(), {
        httpMetadata: { contentType: file.type },
      });

      const base = (env.PUBLIC_BASE_URL || '').replace(/\/$/, '');
      const url = `${base}/${key}`;

      return new Response(JSON.stringify({ url }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Upload failed: ' + err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  },
};
