# JO Driver - امتحان القيادة النظري الأردني

منصة مجانية عربية (RTL) للتحضير لامتحان القيادة النظري في الأردن. تتضمن محاكاة امتحان كامل (60 سؤال)، مراجعة حسب الأقسام، دليل مراكز التدريب المعتمدة، دليل الطالب، وسجل زوار.

## ما يقدمه الموقع

| القسم | الوصف |
|-------|-------|
| **الامتحان النظري** | 60 سؤال عشوائي مطابق لمعايير دائرة ترخيص السواقين، مع توقيت 60 دقيقة وتصحيح فوري |
| **دراسة الأسئلة** | مراجعة موضوع بموضوع (7 أقسام) مع شرح مفصل لكل إجابة |
| **مراكز التدريب** | دليل تفاعلي لمراكز التدريب المعتمدة حسب المحافظة والمنطقة مع تقييمات Google Maps |
| **دليل الطالب** | خطوات التقديم، الوثائق المطلوبة، الرسوم، الشروط، الأسئلة الشائعة |
| **سجل الزوار** | تقييمات وآراء الزوار حول تجربتهم في المراكز |
| **لوحة التحكم** | إدارة كاملة للمحتوى: أسئلة، مراكز، محافظات، مناطق، مستخدمين، طلبات انتساب، آراء الزوار |

## المتطلبات المسبقة

- **Node.js** >= 20 (يفضل 24)
- **pnpm** >= 9
- **Firebase Realtime Database** (مجاني — يكفي لكل البيانات)
- **Google Places API Key** (لجلب بيانات المراكز من Google Maps)

## هيكل المشروع

```
├── artifacts/
│   ├── driving-exam/           ← الواجهة الأمامية (React + Vite + Firebase)
│   │   ├── src/
│   │   │   ├── main.tsx        ← نقطة الدخول
│   │   │   ├── App.tsx         ← التوجيه (react-router-dom)
│   │   │   ├── lib/firebase.ts ← إعداد Firebase (Database + Auth)
│   │   │   ├── types/index.ts  ← أنواع TypeScript
│   │   │   ├── index.css       ← الأنماط العامة + Tailwind
│   │   │   ├── screens/        ← الصفحات (16 شاشة)
│   │   │   │   ├── Home.tsx           ← الشاشة الرئيسية
│   │   │   │   ├── Test.tsx           ← الامتحان الكامل (60 سؤال)
│   │   │   │   ├── Exam.tsx           ← امتحان محاكاة
│   │   │   │   ├── ExamResult.tsx     ← نتيجة الامتحان
│   │   │   │   ├── Study.tsx          ← مراجعة الأسئلة حسب القسم
│   │   │   │   ├── Categories.tsx     ← اختيار القسم
│   │   │   │   ├── Result.tsx         ← نتيجة الاختبار
│   │   │   │   ├── Centers.tsx        ← دليل المراكز
│   │   │   │   ├── CenterDetail.tsx   ← تفاصيل مركز + تقييمات
│   │   │   │   ├── CentersJoin.tsx    ← طلب إضافة مركز
│   │   │   │   ├── Reviews.tsx        ← سجل الزوار
│   │   │   │   ├── Faq.tsx            ← دليل الطالب
│   │   │   │   ├── ExamRules.tsx      ← شروط الامتحان
│   │   │   │   ├── AdminLogin.tsx     ← تسجيل دخول لوحة التحكم
│   │   │   │   └── Admin.tsx          ← لوحة التحكم الكاملة
│   │   │   └── components/     ← المكوّنات المشتركة
│   │   │       ├── Header.tsx
│   │   │       ├── Footer.tsx
│   │   │       ├── Loading.tsx
│   │   │       ├── PhoneAuthModal.tsx ← تأكيد الهاتف بالرمز
│   │   │       ├── ReviewModal.tsx    ← مراجعة إجابة السؤال
│   │   │       └── SideDrawer.tsx     ← القائمة الجانبية
│   │   ├── public/             ← الملفات الثابتة
│   │   │   ├── favicon.svg
│   │   │   ├── opengraph.png    ← صورة المشاركة الاجتماعية
│   │   │   ├── robots.txt
│   │   │   ├── sitemap.xml      ← 10 صفحات SEO ثابتة
│   │   │   └── *.html           ← صفحات SEO (قواعد السير، الشواخص، الميكانيك...)
│   │   ├── index.html           ← HTML الرئيسي (SEO + OG + JSON-LD)
│   │   └── vite.config.ts       ← إعداد Vite + proxy للـ API
│   │
│   └── api-server/             ← خادم واجهات برمجية (Express + esbuild)
│       ├── src/
│       │   ├── index.ts         ← نقطة الدخول (PORT)
│       │   ├── app.ts           ← إعداد Express (CORS + JSON + logger)
│       │   ├── lib/logger.ts    ← تسجيل الأحداث (Pino)
│       │   └── routes/
│       │       ├── index.ts     ← توجيه API
│       │       ├── health.ts    ← فحص الصحة (/api/healthz)
│       │       └── places.ts    ← Google Places API proxy
│       ├── build.mjs            ← بناء esbuild → dist/index.mjs
│       └── package.json
│
├── package.json               ← root (pnpm workspaces)
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── replit.md
```

## التقنيات المستخدمة

### الواجهة الأمامية
- **React 19** + **TypeScript** + **Vite**
- **react-router-dom** — التوجيه
- **Firebase 12** — Realtime Database + Authentication
- **Phosphor Icons** — أيقونات (`<i className="ph ph-...">`)
- **Google Fonts (Tajawal)** — خط عربي
- **TailwindCSS** — أنماط CSS
- **SEO**: Open Graph, Twitter Cards, JSON-LD Structured Data, sitemap, robots.txt

### الخادم الخلفي
- **Express 5** — إطار العمل
- **Pino** — تسجيل الأحداث
- **esbuild** — البناء إلى وحدة ESM واحدة
- **Google Places API** — جلب بيانات المراكز من روابط Google Maps

### قاعدة البيانات
- **Firebase Realtime Database** — JSON tree، لا يحتاج إلى Schema migrations

## إعداد Firebase

المشروع متصل بمشروع Firebase موجود (`al3arbicv`). إذا أردت إعداد مشروعك الخاص:

1. أنشئ مشروع جديد في [Firebase Console](https://console.firebase.google.com/)
2. فعّل **Realtime Database** واختر منطقة `asia-southeast1`
3. فعّل **Authentication** → **Email/Password**
4. عدّل `artifacts/driving-exam/src/lib/firebase.ts`:

```ts
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "YOUR_PROJECT",
});
```

5. أضف أول مشرف في Authentication ببريد `admin@jodriver.app` (أو أي بريد) — لوحة التحكم تتحقق من `user.email`

## تشغيل المشروع محلياً

### 1. تثبيت الاعتماديات

```bash
# في مجلد المشروع الجذر
pnpm install
```

### 2. تشغيل الواجهة الأمامية

```bash
# منفذ Vite (مثلاً 3000)
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/driving-exam run dev
```

> **ملاحظة:** يتطلب Vite متغيرات بيئة `PORT` و `BASE_PATH`. في Replit يتم ضبطهما تلقائياً.

### 3. تشغيل خادم API (اختياري — فقط لجلب بيانات Google Maps)

```bash
# يحتاج GOOGLE_PLACES_API_KEY
GOOGLE_PLACES_API_KEY=your_key PORT=8080 pnpm --filter @workspace/api-server run dev
```

> في بيئة التطوير، Vite يعمل كـ proxy لـ `/api/places` → `http://localhost:8080`

### 4. فحص النوع (TypeScript)

```bash
pnpm run typecheck
```

### 5. البناء للإنتاج

```bash
pnpm run build
```

ينتج:
- `artifacts/driving-exam/dist/public/` ← ملفات الواجهة الأمامية
- `artifacts/api-server/dist/index.mjs` ← الخادم الخلفي

## المسارات (Routes)

| المسار | الوصف |
|--------|-------|
| `/` | الشاشة الرئيسية |
| `/test` | امتحان كامل (60 سؤال) |
| `/exam` | امتحان محاكاة |
| `/exam-rules` | شروط الامتحان |
| `/exam-result/:cat/:id` | نتيجة الامتحان |
| `/categories` | اختيار قسم للمراجعة |
| `/study/:catId` | مراجعة أسئلة القسم |
| `/result` | نتيجة الاختبار السريع |
| `/centers` | دليل مراكز التدريب |
| `/centers/:id` | تفاصيل مركز + تقييمات |
| `/join` | طلب إضافة مركز جديد |
| `/reviews` | سجل الزوار |
| `/guide` | دليل الطالب |
| `/admin` | تسجيل دخول لوحة التحكم |
| `/admin/dashboard` | لوحة التحكم |

## هيكل بيانات Firebase

```
/├── governorates/          ← { id: { name } }
│   ├── areas/               ← { id: { name, governorateId } }
│   ├── centers/             ← { id: Center }
│   ├── centerReviews/       ← { centerId: { reviewId: { name, comment, rating, createdAt } } }
│   ├── questions/           ← { id: Question }
│   ├── users/               ← { id: { name, phone, createdAt } }
│   ├── reviews/             ← { id: { name, stars, comment, createdAt } }
│   ├── requests/            ← { id: { name, phone, governorateId, areaId, status, createdAt } }
│   ├── guide/sections/      ← { id: { title, content, icon, order } }
│   ├── footer/              ← { aboutText, sponsor: { name, logoUrl, linkUrl } }
│   └── featuredCenters/     ← [ { centerId, order } ]
```

### نوع `Center`

```ts
interface Center {
  name: string;
  governorateId: string;
  areaId: string;
  areas: { id: string; name: string }[];
  address?: string;
  phone?: string;
  whatsapp?: string;
  mapLink?: string;
  imageUrl?: string;
  description?: string;
  rating: number;
  reviewCount: number;
  workingHours: string;       // e.g. "08:00 – 16:00"
  workingDays: string[];      // e.g. ["السبت", "الأحد", ...]
  schedule?: DaySchedule[];    // [{ closed, from, to }, ...] for 7 days
  promoted?: boolean;
  suspended?: boolean;
  publicId?: number;
  createdAt?: string;
}
```

## متغيرات البيئة

| المتغير | الوصف | مطلوب؟ |
|---------|-------|--------|
| `PORT` | منفذ التشغيل | ✅ نعم |
| `BASE_PATH` | مسار الأساس للـ Vite | ✅ نعم |
| `GOOGLE_PLACES_API_KEY` | مفتاح Google Places API | ❌ اختياري (لجلب بيانات المراكز) |
| `NODE_ENV` | `development` أو `production` | ❌ يُكتشف تلقائياً |

## إدارة المراكز المميزة

من لوحة التحكم → "المراكز المميزة"، يمكن إضافة مراكز إلى القسم المميز في الشاشة الرئيسية. يتم تخزينها في `featuredCenters/` مع `order` لتحديد الترتيب.

## صفحات SEO الثابتة

8 صفحات HTML ثابتة في `public/` مُحسّنة لمحركات البحث:
- قواعد السير والمرور
- الميكانيك
- الشواخص والخطوط والعلامات
- السلامة على الطريق
- الأسعافات الأولية
- المخالفات واحتساب النقاط
- الصور المتحركة
- دليل الامتحان + مراكز التدريب

## نشر على استضافة

### إذا استضافتك تدعم Node.js (مثل Replit, Railway, Render):

1. `pnpm install`
2. `pnpm run build`
3. شغّل الخادم الخلفي: `PORT=8080 node artifacts/api-server/dist/index.mjs`
4. شغّل الواجهة الأمامية: `PORT=3000 BASE_PATH=/ node -e "require('vite').preview({...})"`

### إذا استضافتك ثابتة فقط (مثل Netlify, Vercel, GitHub Pages):

1. `pnpm run build`
2. انشر محتويات `artifacts/driving-exam/dist/public/`
3. الخادم الخلفي (Google Places proxy) يمكن استبداله بـ Cloud Function أو Edge Function

### ملاحظات الأمان

- Firebase Database Rules يجب أن تكون:
  - `questions` — read: public, write: admin only
  - `centers`, `governorates`, `areas` — read: public, write: admin only
  - `users`, `reviews`, `requests`, `centerReviews` — read: admin only, write: authenticated (أو public حسب سياسة الموقع)
- لوحة التحكم تتحقق من `auth.currentUser.email` — تأكد من تسجيل الدخول عبر Firebase Auth

## ترخيص

MIT — مفتوح المصدر ومجاني بالكامل.
