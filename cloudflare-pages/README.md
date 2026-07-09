# driverjo-cdn — Cloudflare Pages CDN للأسئلة

مجلد بسيط يحتوي على بيانات الأسئلة الثابتة مستضافاً على Cloudflare Pages.  
**لا يحتاج سيرفر، لا تكلفة bandwidth، CDN عالمي تلقائي.**

---

## الإعداد الأول (مرة واحدة فقط)

### الخطوة 1 — تصدير الأسئلة من Firebase

1. افتح [Firebase Console → driverjo-default-rtdb](https://console.firebase.google.com)
2. اضغط على **⋮ (النقاط الثلاث)** بجانب عنوان قاعدة البيانات
3. اختر **Export JSON**
4. سيُنزَّل ملف `driverjo-default-rtdb-export.json`
5. افتح الملف، انسخ محتوى الكائن `"questions"` فقط، احفظه بأسم **`questions.json`**
6. ضع الملف في هذا المجلد (`cloudflare-pages/questions.json`)

> **ملاحظة:** الملف يجب أن يبدأ بـ `{` مباشرةً (كائن الأسئلة)، وليس كل قاعدة البيانات.

---

### الخطوة 2 — رفع المشروع على GitHub

```bash
# من مجلد مشروعك (هذا الـ repl):
git add cloudflare-pages/
git commit -m "add cloudflare pages cdn"
git push
```

أو أنشئ مستودع GitHub جديد واسمه `driverjo-cdn` وارفع محتويات `cloudflare-pages/` عليه.

---

### الخطوة 3 — إنشاء مشروع Cloudflare Pages

1. افتح [dash.cloudflare.com → Workers & Pages → Create](https://dash.cloudflare.com/)
2. اختر **Pages → Connect to Git**
3. اختر المستودع الذي رفعت عليه الملفات
4. إعدادات البناء:
   - **Project name:** `driverjo-cdn`
   - **Root directory:** `cloudflare-pages`
   - **Build command:** *(اتركه فارغاً)*
   - **Output directory:** `/` (أو اتركه فارغاً)
5. اضغط **Save and Deploy**

بعد النشر ستحصل على:
```
https://driverjo-cdn.pages.dev/questions.json
```

---

### الخطوة 4 — تحديث الـ template (إن غيّرت اسم المشروع)

في ملف `template` ابحث عن السطر:
```javascript
window.JDQURL='https://driverjo-cdn.pages.dev/questions.json';
```
واستبدل الرابط برابطك الفعلي. **هذا السطر الوحيد يتحكم في كل الصفحات.**

---

## التحديث الأسبوعي

1. صدّر `questions.json` من Firebase (نفس الخطوة 1 أعلاه)
2. ضع الملف في `cloudflare-pages/questions.json` واستبدل القديم
3. `git add questions.json && git commit -m "update questions" && git push`
4. Cloudflare Pages يتحدث تلقائياً خلال **~30 ثانية** ✅

---

## Domain مخصص (اختياري)

إذا أردت `cdn.driverjo.online/questions.json` بدلاً من `.pages.dev`:

1. في Cloudflare Pages → المشروع → **Custom domains**
2. أضف `cdn.driverjo.online`
3. Cloudflare ينشئ DNS record تلقائياً (لأن الدومين بالفعل على Cloudflare)
4. حدّث `window.JDQURL` في template إلى الدومين الجديد

---

## هيكل الملفات

```
cloudflare-pages/
├── _headers          ← CORS + Cache-Control تلقائي
├── questions.json    ← البيانات (أنت تضيفها)
└── README.md         ← هذا الملف
```

---

## مقارنة الحل القديم والجديد

| | Firebase RTDB (قديم) | Cloudflare Pages (جديد) |
|---|---|---|
| التكلفة | يتجاوز الحد المجاني | **مجاني دائماً** |
| Bandwidth | محدود (10GB/شهر) | **غير محدود** |
| CDN | ❌ لا | ✅ 200+ موقع عالمي |
| CORS | يحتاج قواعد | **تلقائي** |
| سرعة القراءة | ~200-500ms | **~20-80ms** |
| التحديث | فوري | ~30 ثانية بعد push |
