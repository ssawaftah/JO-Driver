# 🎨 هوية تصميم منصة سند (SANAD) — Design Identity System

> **الغرض:** يُوجِّه هذا الملف أي مشروع أو وكيل ذكاء اصطناعي ليعتمد هوية تصميم منصة سند الحكومية الأردنية بالكامل — من الألوان والخطوط وحتى التفاصيل الدقيقة للمكونات والتوزيع.

---

## 1. 🏷️ هوية العلامة التجارية (Brand Identity)

| العنصر | القيمة |
|--------|--------|
| **اسم المنصة** | سند — SANAD |
| **الجهة** | منصة حكومية أردنية (دائرة الأحوال المدنية والجوازات) |
| **الشعور العام** | رسمي، موثوق، نظيف، حكومي حديث |
| **اتجاه التخطيط** | RTL — من اليمين إلى اليسار (العربية أساسية) |
| **الجمهور** | مواطنون أردنيون يستخدمون خدمات حكومية رقمية |

---

## 2. 🎨 نظام الألوان (Color System)

### الألوان الأساسية

```css
:root {
  /* الأزرق الأساسي - Primary Blue */
  --color-primary: #3355CC;
  --color-primary-hover: #2A44B5;
  --color-primary-light: #EEF0FA;   /* خلفية التبويب النشط */

  /* الأخضر - اللون الثاني للشعار والنجاح */
  --color-brand-green: #2D9E6B;     /* لون شعار SANAD الأخضر */
  --color-success: #22A86E;         /* المحطة فعالة */

  /* الأحمر - الخطأ والتحذير */
  --color-error: #E53E3E;           /* المحطة غير فعالة */
  --color-error-light: #FFF1F1;     /* خلفية البطاقة الحمراء */

  /* الأسود الداكن - الزر الثانوي الداكن */
  --color-dark-button: #3A3A3A;     /* زر البصمة / الدخول البيومتري */

  /* الرمادي البرتقالي - الاقتراحات */
  --color-suggestion-bg: #FFF8EE;   /* خلفية بطاقة الاقتراحات */
  --color-suggestion-border: #E8D5B0;

  /* الأزرق الفاتح - خلفية الموقع الإلكتروني */
  --color-info-bg: #EEF3FF;

  /* البيج الفاتح - التنفيذ القضائي / التوكيل */
  --color-beige-bg: #F5EFE6;
}
```

### الألوان المحايدة (Neutrals)

```css
:root {
  --color-bg-primary: #FFFFFF;       /* الخلفية الرئيسية */
  --color-bg-secondary: #F4F5F8;    /* خلفية الصفحات والأقسام */
  --color-bg-card: #FFFFFF;          /* خلفية البطاقات */
  --color-bg-input: #F4F5F8;        /* خلفية حقول الإدخال */
  --color-bg-account-header: #E8EAF5; /* خلفية رأس صفحة الحساب - لافندر فاتح */

  --color-text-primary: #1A1A2E;    /* النص الرئيسي */
  --color-text-secondary: #6B7280;  /* النص الثانوي / الوصف */
  --color-text-hint: #9CA3AF;       /* النص التلميحي */
  --color-text-link: #3355CC;       /* روابط النص */
  --color-text-success: #22A86E;    /* نص الحالة النشطة */
  --color-text-error: #E53E3E;      /* نص الحالة غير النشطة */

  --color-border: #E8E8EE;          /* حدود عامة */
  --color-border-input: #D1D5DB;    /* حدود حقول الإدخال */
  --color-separator: #F0F0F4;       /* خطوط الفصل بين الصفوف */

  --color-tab-bar-bg: #FFFFFF;      /* خلفية شريط التنقل السفلي */
  --color-tab-active: #3355CC;      /* لون التبويب النشط */
  --color-tab-inactive: #9CA3AF;    /* لون التبويب غير النشط */
}
```

---

## 3. 🔤 نظام الخطوط (Typography)

### الخطوط المستخدمة

```css
/* الخط العربي الأساسي */
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap');
/* أو بديل مقبول: */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap');

:root {
  --font-arabic: 'IBM Plex Sans Arabic', 'Noto Sans Arabic', 'Segoe UI', Arial, sans-serif;
  --font-english: 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;
}

body {
  font-family: var(--font-arabic);
  direction: rtl;
  text-align: right;
}
```

### مقاسات النصوص (Type Scale)

```css
:root {
  /* العناوين */
  --text-page-title: 20px;    /* عنوان الصفحة - font-weight: 700 */
  --text-section-title: 17px; /* عنوان القسم - font-weight: 700 */
  --text-card-title: 16px;    /* عنوان البطاقة - font-weight: 700 */

  /* النصوص */
  --text-body-lg: 16px;       /* نص أساسي كبير - font-weight: 400 */
  --text-body: 15px;          /* نص أساسي - font-weight: 400 */
  --text-body-sm: 14px;       /* نص ثانوي - font-weight: 400 */
  --text-caption: 12px;       /* تسميات صغيرة - font-weight: 400 */
  --text-version: 12px;       /* رقم الإصدار - font-weight: 400 */

  /* الأزرار */
  --text-btn-primary: 16px;   /* font-weight: 600 */
  --text-btn-secondary: 15px; /* font-weight: 500 */
  --text-btn-small: 14px;     /* font-weight: 500 */

  /* التبويبات */
  --text-tab-label: 11px;     /* font-weight: 500 */
}
```

### أوزان الخط

| الاستخدام | الوزن (Weight) |
|-----------|----------------|
| عناوين الصفحات والأقسام | **700 (Bold)** |
| أزرار رئيسية، عناوين بطاقات | **600 (SemiBold)** |
| نص أساسي، عناوين قوائم | **500 (Medium)** |
| نص وصفي ثانوي، تواريخ | **400 (Regular)** |
| نصوص مساعدة، إصدار التطبيق | **300 (Light)** |

---

## 4. 📐 نظام التباعد والأبعاد (Spacing & Sizing)

```css
:root {
  /* الهوامش الأساسية */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-2xl: 24px;
  --spacing-3xl: 32px;

  /* الحشو الأفقي للصفحة */
  --page-padding-x: 16px;

  /* حشو البطاقات */
  --card-padding: 16px;

  /* ارتفاعات العناصر */
  --btn-height-lg: 52px;    /* الأزرار الرئيسية الكاملة العرض */
  --btn-height-md: 44px;    /* الأزرار المتوسطة */
  --btn-height-sm: 36px;    /* الأزرار الصغيرة (خاصة بالبطاقات) */
  --input-height: 52px;     /* حقول الإدخال والقوائم المنسدلة */
  --search-bar-height: 44px; /* شريط البحث */
  --tab-bar-height: 83px;   /* شريط التنقل السفلي (مع safe area) */
  --list-row-height: 52px;  /* صفوف القوائم */

  /* نصف القطر (Border Radius) */
  --radius-sm: 8px;         /* عناصر صغيرة، شارات */
  --radius-md: 12px;        /* البطاقات الصغيرة، الأزرار الصغيرة */
  --radius-lg: 14px;        /* الأزرار الرئيسية، حقول الإدخال */
  --radius-xl: 16px;        /* البطاقات الرئيسية */
  --radius-2xl: 20px;       /* البطاقات الكبيرة والصور */
  --radius-full: 9999px;    /* الشكل الكامل (أزرار حبة الدواء، الدوائر) */

  /* الظلال */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-card: 0 4px 16px rgba(0, 0, 0, 0.06);
}
```

---

## 5. 🔘 مكونات الأزرار (Button Components)

### الأنماط المتاحة

#### 1. الزر الأزرق الأساسي — Primary Blue Button
```css
.btn-primary {
  background-color: #3355CC;
  color: #FFFFFF;
  border: none;
  border-radius: 14px;
  height: 52px;
  width: 100%;
  font-size: 16px;
  font-weight: 600;
  padding: 0 20px;
  cursor: pointer;
}
.btn-primary:active {
  background-color: #2A44B5;
}
```
**الاستخدام:** تسجيل الدخول، الإجراءات الرئيسية.

#### 2. الزر الداكن الثانوي — Dark Secondary Button
```css
.btn-dark {
  background-color: #3A3A3A;
  color: #FFFFFF;
  border: none;
  border-radius: 14px;
  height: 52px;
  width: 100%;
  font-size: 16px;
  font-weight: 600;
}
```
**الاستخدام:** الدخول بالبصمة أو Face ID.

#### 3. زر الحدود الشفاف — Outline Button
```css
.btn-outline {
  background-color: transparent;
  color: #3355CC;
  border: 1.5px solid #3355CC;
  border-radius: 14px;
  height: 52px;
  width: 100%;
  font-size: 16px;
  font-weight: 600;
}
```
**الاستخدام:** إنشاء حساب، الإجراءات الثانوية.

#### 4. زر صغير ملوّن في البطاقة — Small Colored Card Button
```css
/* أزرق */
.btn-card-blue {
  background-color: transparent;
  color: #3355CC;
  border: 1.5px solid #3355CC;
  border-radius: 8px;
  height: 36px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 500;
}
/* أخضر */
.btn-card-green {
  color: #22A86E;
  border-color: #22A86E;
}
/* أحمر */
.btn-card-red {
  color: #E53E3E;
  border-color: #E53E3E;
}
```
**الاستخدام:** "تصفح الموقع"، "قدم الآن"، "عرض الأرقام".

#### 5. أزرار التبديل (Toggle Segments)
```css
.segment-group {
  display: flex;
  border: 1.5px solid #E8E8EE;
  border-radius: 12px;
  overflow: hidden;
}
.segment-btn {
  flex: 1;
  height: 44px;
  background: transparent;
  color: #6B7280;
  font-size: 15px;
  font-weight: 500;
  border: none;
}
.segment-btn.active {
  background-color: #3355CC;
  color: #FFFFFF;
  font-weight: 600;
}
```
**الاستخدام:** الفصل الأول / الفصل الثاني.

---

## 6. 📋 مكونات قوائم البيانات (List & Row Components)

### صف القائمة العادي
```css
.list-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--page-padding-x);
  height: 52px;
  background: #FFFFFF;
  border-bottom: 1px solid #F0F0F4;
  direction: rtl;
}
.list-row-title {
  font-size: 15px;
  font-weight: 400;
  color: #1A1A2E;
}
.list-row-chevron {
  /* السهم على اليسار للـ RTL */
  font-size: 14px;
  color: #9CA3AF;
  transform: scaleX(-1); /* قلب السهم للـ RTL */
}
```

### صف قائمة مع عنوان فرعي ووصف
```css
.list-row-detailed {
  padding: 12px 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.list-row-icon {
  width: 20px;
  height: 20px;
  color: #9CA3AF;
  flex-shrink: 0;
  margin-top: 2px;
}
.list-row-content {
  flex: 1;
  text-align: right;
}
.list-row-main-text {
  font-size: 15px;
  font-weight: 500;
  color: #1A1A2E;
}
.list-row-sub-text {
  font-size: 13px;
  color: #22A86E; /* أخضر للحالة الفعالة */
  margin-top: 2px;
}
.list-row-sub-text.inactive {
  color: #E53E3E; /* أحمر للحالة غير الفعالة */
}
```

---

## 7. 🃏 مكونات البطاقات (Card Components)

### البطاقة العادية (Info Card)
```css
.card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 16px;
  margin: 0 16px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  direction: rtl;
}
.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #1A1A2E;
  text-align: right;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: flex-end;
}
.card-body {
  font-size: 14px;
  color: #6B7280;
  line-height: 1.6;
  text-align: right;
}
```

### بطاقة ملونة الخلفية (Colored Background Card)

```css
/* الأزرق الفاتح */
.card-blue {
  background: #EEF3FF;
  border-radius: 16px;
}
/* الأصفر الدافئ - الاقتراحات */
.card-yellow {
  background: #FFF8EE;
  border-radius: 16px;
}
/* الأحمر الفاتح - الطوارئ */
.card-red {
  background: #FFF1F1;
  border-radius: 16px;
}
/* البيج - التنفيذ القضائي */
.card-beige {
  background: #F5EFE6;
  border-radius: 16px;
}
```

### بطاقة شبكة الخدمات (Grid Card)
```css
.service-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 0 16px;
}
.service-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  text-align: center;
  gap: 8px;
}
.service-icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #F4F5F8;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.service-name {
  font-size: 13px;
  font-weight: 500;
  color: #1A1A2E;
  text-align: center;
  line-height: 1.4;
}
.service-count {
  font-size: 12px;
  color: #3355CC;
  font-weight: 500;
}
```

### بطاقة الوصول السريع (Quick Access Card — Grid 3 cols)
```css
.quick-access-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 0 16px;
}
.quick-access-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  background: #F4F5F8;
  border-radius: 12px;
  gap: 8px;
}
.quick-access-icon {
  width: 32px;
  height: 32px;
  color: #3355CC;
}
.quick-access-label {
  font-size: 12px;
  font-weight: 500;
  color: #1A1A2E;
  text-align: center;
  line-height: 1.4;
}
```

### بطاقة التواصل (Contact Card)
```css
.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.contact-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.contact-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.contact-icon-whatsapp { background: #25D366; }
.contact-icon-phone    { background: #1A1A2E; }
.contact-title {
  font-size: 15px;
  font-weight: 700;
  color: #1A1A2E;
}
.contact-desc {
  font-size: 12px;
  color: #6B7280;
  text-align: center;
  line-height: 1.5;
}
```

---

## 8. 🔍 مكون البحث (Search Bar)

```css
.search-bar-wrap {
  padding: 8px 16px;
}
.search-bar {
  display: flex;
  align-items: center;
  background: #F4F5F8;
  border-radius: 9999px;
  padding: 0 16px;
  height: 44px;
  gap: 8px;
  direction: rtl;
}
.search-icon {
  width: 18px;
  height: 18px;
  color: #9CA3AF;
}
.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  color: #6B7280;
  text-align: right;
  direction: rtl;
  outline: none;
}
.search-input::placeholder {
  color: #9CA3AF;
}
```

---

## 9. 🏷️ مكون الفلاتر (Filter Chips / Segments)

```css
.filter-chips {
  display: flex;
  flex-direction: row-reverse; /* RTL */
  gap: 8px;
  padding: 8px 16px;
  overflow-x: auto;
  scrollbar-width: none;
}
.filter-chip {
  flex-shrink: 0;
  padding: 6px 16px;
  border-radius: 9999px;
  border: 1.5px solid #E8E8EE;
  background: #FFFFFF;
  font-size: 14px;
  font-weight: 400;
  color: #6B7280;
  cursor: pointer;
  white-space: nowrap;
}
.filter-chip.active {
  border-color: #1A1A2E;
  color: #1A1A2E;
  font-weight: 600;
}
```

---

## 10. 🧭 شريط التنقل السفلي (Bottom Tab Navigation)

```css
.tab-bar {
  display: flex;
  flex-direction: row;        /* العناصر من اليسار لليمين لكن ترتيبها RTL */
  direction: rtl;
  background: #FFFFFF;
  border-top: 1px solid #F0F0F4;
  height: 83px;
  padding-bottom: 20px;       /* safe area للـ iPhone */
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 100;
}
.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
}
.tab-icon {
  width: 24px;
  height: 24px;
  color: #9CA3AF;
}
.tab-label {
  font-size: 11px;
  font-weight: 500;
  color: #9CA3AF;
}
/* الحالة النشطة */
.tab-item.active .tab-icon { color: #3355CC; }
.tab-item.active .tab-label { color: #3355CC; }
.tab-item.active .tab-icon-wrap {
  background: #EEF0FA;
  border-radius: 12px;
  padding: 6px 16px;
}
```

### تبويبات التطبيق الرئيسية

| الترتيب (RTL) | الاسم | الأيقونة |
|---------------|-------|-----------|
| 1 (يمين) | الرئيسية | 🏠 home |
| 2 | المستندات | 📄 document |
| 3 | الخدمات | 🛒 grid/shop |
| 4 (يسار) | الحساب | 👤 person-lines |

> تبويبات "الدخول" الخارجية (قبل تسجيل الدخول):

| الترتيب (RTL) | الاسم | الأيقونة |
|---------------|-------|-----------|
| 1 (يمين) | محطات سند | 🌐 globe |
| 2 | الدخول | 👤 person (نشط افتراضياً) |
| 3 (يسار) | المساعدة | ❓ question-circle |

---

## 11. 📝 حقول الإدخال والقوائم المنسدلة (Input Fields & Dropdowns)

```css
.form-field {
  margin-bottom: 16px;
}
.form-label {
  font-size: 13px;
  color: #9CA3AF;
  text-align: right;
  margin-bottom: 4px;
  display: block;
}
/* حقل الإدخال */
.input-field {
  width: 100%;
  height: 52px;
  border: 1.5px solid #E8E8EE;
  border-radius: 14px;
  padding: 0 16px;
  font-size: 15px;
  color: #1A1A2E;
  background: #FFFFFF;
  text-align: right;
  direction: rtl;
  outline: none;
  box-sizing: border-box;
}
.input-field:focus {
  border-color: #3355CC;
}
/* القائمة المنسدلة */
.dropdown-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  cursor: pointer;
}
.dropdown-arrow {
  color: #9CA3AF;
  font-size: 14px;
}
```

---

## 12. 🔄 مكون Toggle (أزرار التبديل)

```css
.toggle-switch {
  width: 51px;
  height: 31px;
  border-radius: 9999px;
  background: #3355CC;   /* نشط */
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
}
.toggle-switch.off {
  background: #D1D5DB;
}
.toggle-thumb {
  width: 27px;
  height: 27px;
  border-radius: 50%;
  background: #FFFFFF;
  position: absolute;
  top: 2px;
  right: 2px;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}
.toggle-switch.off .toggle-thumb {
  transform: translateX(20px); /* ينتقل لليسار في RTL */
}
```

---

## 13. 🏷️ الشارات والحالات (Badges & Status)

```css
/* شارة "خدمة تجريبية" */
.badge-experimental {
  background: #EEF0FA;
  color: #3355CC;
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
}
/* شارة الحالة الفعالة */
.status-active {
  color: #22A86E;
  font-size: 13px;
  font-weight: 500;
}
/* شارة الحالة غير الفعالة */
.status-inactive {
  color: #E53E3E;
  font-size: 13px;
  font-weight: 500;
}
/* شارة الإصدار */
.app-version {
  font-size: 12px;
  color: #9CA3AF;
  text-align: center;
}
```

---

## 14. 📸 رأس صفحة المستخدم (User Profile Header)

```css
.profile-header {
  background: #E8EAF5;       /* لافندر فاتح */
  padding: 24px 16px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.profile-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #FFFFFF;
}
.profile-name {
  font-size: 17px;
  font-weight: 700;
  color: #1A1A2E;
}
.profile-id {
  font-size: 14px;
  color: #6B7280;
}
```

---

## 15. 🗂️ القوائم المجمّعة (Grouped Settings Lists)

```css
.settings-section {
  margin-bottom: 24px;
}
.settings-section-title {
  font-size: 17px;
  font-weight: 700;
  color: #1A1A2E;
  padding: 0 16px;
  margin-bottom: 4px;
  text-align: right;
}
.settings-list {
  background: #FFFFFF;
  border-radius: 16px;
  margin: 0 16px;
  overflow: hidden;
}
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #F0F0F4;
  direction: rtl;
}
.settings-row:last-child {
  border-bottom: none;
}
.settings-row-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.settings-row-icon {
  width: 22px;
  height: 22px;
  color: #6B7280;
}
.settings-row-text {
  text-align: right;
}
.settings-row-title {
  font-size: 15px;
  font-weight: 400;
  color: #1A1A2E;
}
.settings-row-subtitle {
  font-size: 13px;
  color: #9CA3AF;
  margin-top: 2px;
}
.settings-row-subtitle.active-green {
  color: #22A86E;
}
.settings-row-chevron {
  color: #D1D5DB;
  font-size: 14px;
}
```

---

## 16. 🌐 رأس الصفحة (Page Header)

```css
/* رأس صفحة عادية */
.page-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;  /* RTL: العنوان على اليمين */
  padding: 16px;
  background: #FFFFFF;
}
.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #1A1A2E;
  text-align: right;
}

/* رأس الصفحة مع رابط "عرض الكل" */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  margin-bottom: 12px;
  flex-direction: row-reverse;  /* RTL */
}
.section-title {
  font-size: 17px;
  font-weight: 700;
  color: #1A1A2E;
}
.section-link {
  font-size: 14px;
  color: #3355CC;
  font-weight: 500;
}

/* رأس الصفحة مع زر رجوع */
.page-header-back {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  direction: rtl;
}
.back-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #F4F5F8;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## 17. 🔔 مكون الإشعار (Notification Bell)

```css
.notification-bell {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.notification-bell-icon {
  width: 22px;
  height: 22px;
  color: #1A1A2E;
}
```

---

## 18. 🌡️ مؤشرات الصفحات (Page Indicators / Dots)

```css
.page-dots {
  display: flex;
  gap: 6px;
  justify-content: center;
  align-items: center;
}
.page-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #D1D5DB;
}
.page-dot.active {
  width: 20px;
  border-radius: 9999px;
  background: #3355CC;
}
```

---

## 19. 🗺️ شاشة الخريطة (Map Screen)

```css
/* نمط الخريطة الداكنة */
.map-container {
  width: 100%;
  flex: 1;
  /* استخدم Google Maps أو Mapbox بالنمط الداكن */
  /* Google Maps Style ID: night mode / dark */
  filter: brightness(0.9) contrast(1.1);
}

/* شريط الفلتر فوق الخريطة */
.map-filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  direction: rtl;
  gap: 8px;
}
.map-filter-btn {
  background: #FFFFFF;
  border: 1px solid #E8E8EE;
  border-radius: 9999px;
  padding: 8px 16px;
  font-size: 14px;
  color: #1A1A2E;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}

/* زر الموقع الحالي */
.map-location-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  border: 1px solid #E8E8EE;
}

/* بطاقة تفاصيل المحطة */
.station-detail-sheet {
  background: #FFFFFF;
  border-radius: 20px 20px 0 0;
  padding: 16px 16px 40px;
}
.sheet-handle {
  width: 36px;
  height: 4px;
  background: #D1D5DB;
  border-radius: 2px;
  margin: 0 auto 16px;
}
```

---

## 20. 📊 بطاقة البيانات المُنظَّمة (Structured Data Card)

```css
/* بطاقة عرض بيانات مُنظَّمة مثل كشف الغياب */
.data-card {
  background: #F4F5F8;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
}
.data-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #E8E8EE;
  direction: rtl;
}
.data-row:last-child {
  border-bottom: none;
}
.data-label {
  font-size: 14px;
  color: #6B7280;
  font-weight: 400;
}
.data-value {
  font-size: 14px;
  color: #1A1A2E;
  font-weight: 600;
}
```

---

## 21. 🖼️ بطاقة الهوية الوطنية (ID Card Component)

```css
.id-card {
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(135deg, #DBEAFE 0%, #EEF3FF 50%, #E0E7FF 100%);
  padding: 20px;
  position: relative;
  min-height: 180px;
}
.id-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}
.id-card-body {
  display: flex;
  gap: 12px;
}
.id-card-photo {
  width: 64px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  filter: grayscale(100%);
  border: 1px solid rgba(0,0,0,0.1);
}
.id-card-info {
  flex: 1;
  font-size: 13px;
  color: #1A3A7A;
  line-height: 1.8;
  text-align: right;
}
```

---

## 22. 🏗️ هيكل الصفحات (Page Layout Architecture)

```
صفحة نموذجية (RTL)
├── StatusBar (نظام iOS/Android)
├── Page Header
│   ├── عنوان الصفحة (يمين)
│   └── أيقونة إجراء (يسار) — اختياري
├── ScrollView / Content Area
│   ├── Search Bar — إذا لزم
│   ├── Filter Chips — إذا لزم
│   ├── Section Header + "عرض الكل"
│   │   └── Cards / List Rows
│   ├── Section Header
│   │   └── Cards / List Rows
│   └── ... (أقسام إضافية)
└── Tab Bar (ثابت في الأسفل)
```

### صفحة الدخول (Login Page)
```
├── Header Bar (اختيار اللغة + الطقس)
├── Spacer (مساحة كبيرة)
├── Logo (شعار سند + SANAD نصي)
├── Spacer (مساحة كبيرة)
├── Btn Dark (الدخول بالبصمة)
├── Btn Primary (تسجيل الدخول)
├── Btn Outline (إنشاء حساب)
├── Grid 2 cols (التحقق من التوقيع + التحقق من المستندات)
└── Tab Bar
```

---

## 23. 🎯 قواعد التصميم الإلزامية (Design Rules)

### ✅ يجب دائماً:
1. **RTL دائماً** — كل شيء من اليمين إلى اليسار
2. **الخلفية بيضاء أو رمادية فاتحة جداً** — لا ألوان صاخبة في الخلفية
3. **الأزرق الأساسي `#3355CC`** للأزرار الرئيسية والروابط والأيقونات النشطة
4. **نصف قطر كبير** للبطاقات (14-20px) والأزرار (14px)
5. **الهوامش الداخلية `16px`** من الجوانب
6. **الفراغ الهوائي** بين الأقسام — لا تكديس
7. **النصوص العربية أولاً** — اللغة الإنجليزية ثانوية فقط عند الحاجة
8. **الأيقونات خطية** (outline) وليست مملوءة في الغالب

### ❌ يجب تجنّب:
1. الألوان الصاخبة أو المشبعة في الخلفيات
2. الخطوط الزخرفية أو المزخرفة — الخط يجب أن يكون نظيفاً وواضحاً
3. الأزرار المدوّرة تماماً للأزرار الكبيرة (استخدم `14px` وليس `50%`)
4. الظلال القوية — ظلال خفيفة جداً فقط
5. التخطيط من اليسار إلى اليمين (LTR) في أي مكون
6. الخطوط الفاصلة السميكة — فقط `1px solid #F0F0F4`
7. عدم وجود مسافة سفلية لـ tab bar (يجب مراعاة safe area)

---

## 24. 🌙 الوضع الفاتح فقط (Light Mode Only)

منصة سند تعتمد **الوضع الفاتح فقط** — لا يوجد دعم للوضع الداكن. جميع الألوان المحددة أعلاه للوضع الفاتح.

---

## 25. ♿ إمكانية الوصول (Accessibility)

- **حجم الخط الأدنى:** 12px
- **حجم مناطق اللمس الأدنى:** 44×44px
- **نسبة التباين:** 4.5:1 للنصوص العادية
- **مؤشرات الحالة** لا تعتمد على اللون فقط (نص + لون)

---

## 26. 📱 متغيرات Tailwind CSS (إذا كنت تستخدم Tailwind)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3355CC',
        'primary-light': '#EEF0FA',
        'brand-green': '#2D9E6B',
        success: '#22A86E',
        error: '#E53E3E',
        'dark-btn': '#3A3A3A',
        'bg-secondary': '#F4F5F8',
        'bg-account': '#E8EAF5',
        'text-primary': '#1A1A2E',
        'text-secondary': '#6B7280',
        'text-hint': '#9CA3AF',
        border: '#E8E8EE',
        separator: '#F0F0F4',
      },
      borderRadius: {
        'btn': '14px',
        'card': '16px',
        'card-lg': '20px',
        'chip': '9999px',
      },
      fontFamily: {
        arabic: ['IBM Plex Sans Arabic', 'Noto Sans Arabic', 'sans-serif'],
      },
    },
  },
};
```

---

## 27. 🖌️ CSS Variables — ملف واحد للاستيراد

```css
/* sanad-design-tokens.css */
/* استورد هذا الملف في أي مشروع لتطبيق هوية سند */

:root {
  /* Colors */
  --sanad-primary: #3355CC;
  --sanad-primary-hover: #2A44B5;
  --sanad-primary-light: #EEF0FA;
  --sanad-green: #2D9E6B;
  --sanad-success: #22A86E;
  --sanad-error: #E53E3E;
  --sanad-dark-btn: #3A3A3A;
  --sanad-bg: #FFFFFF;
  --sanad-bg-secondary: #F4F5F8;
  --sanad-bg-card: #FFFFFF;
  --sanad-bg-account: #E8EAF5;
  --sanad-bg-blue-light: #EEF3FF;
  --sanad-bg-yellow-light: #FFF8EE;
  --sanad-bg-red-light: #FFF1F1;
  --sanad-bg-beige: #F5EFE6;
  --sanad-text-primary: #1A1A2E;
  --sanad-text-secondary: #6B7280;
  --sanad-text-hint: #9CA3AF;
  --sanad-text-link: #3355CC;
  --sanad-border: #E8E8EE;
  --sanad-separator: #F0F0F4;

  /* Typography */
  --sanad-font: 'IBM Plex Sans Arabic', 'Noto Sans Arabic', sans-serif;

  /* Spacing */
  --sanad-page-x: 16px;
  --sanad-card-padding: 16px;

  /* Border Radius */
  --sanad-radius-btn: 14px;
  --sanad-radius-card: 16px;
  --sanad-radius-card-lg: 20px;
  --sanad-radius-pill: 9999px;
  --sanad-radius-chip: 8px;

  /* Heights */
  --sanad-btn-height: 52px;
  --sanad-input-height: 52px;
  --sanad-search-height: 44px;
  --sanad-tab-height: 83px;
  --sanad-row-height: 52px;

  /* Shadows */
  --sanad-shadow-card: 0 2px 8px rgba(0, 0, 0, 0.06);
  --sanad-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
}

/* Global RTL base styles */
html { direction: rtl; }
body {
  font-family: var(--sanad-font);
  background-color: var(--sanad-bg-secondary);
  color: var(--sanad-text-primary);
  direction: rtl;
  text-align: right;
  margin: 0;
  padding: 0;
}
```

---

*📌 هذا الملف مُستخلص بالكامل من تحليل شاشات تطبيق سند الأردني الحكومي.*
*الإصدار: 7.2.6 — آخر تحديث: 2026*
