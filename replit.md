# driverjo

## Overview
Arabic-language website for a Jordanian driving-schools directory ("driverjo"). The project has two distinct deployment targets:

- **الموقع العام** — الصفحات في `pages/*.html` (HTML+CSS+JS خام، بلا build step). المستخدم ينسخ محتواها يدوياً ويلصقه في Blogger. لا يوجد خادم خلفي — كل المنطق يعمل في المتصفح.
- **لوحة التحكم الإدارية** — `admin.html` في جذر المشروع، مستند HTML مستقل كامل (`<!DOCTYPE html>` + RTL + كل المكتبات). مُنشورة على **Cloudflare Pages** بشكل مستقل تماماً عن Blogger.

A Blogger XML template (`template`) and a Cloudflare Worker (`cloudflare-worker/upload-worker.js`) are also part of the project but are deployed/managed separately (via `wrangler`).

## Running (in this Repl, for editing/preview only)
- Workflow "Start application" runs `npx --yes serve pages -p 5000`, a plain static file server. This is just for previewing the Blogger pages here — it does not reflect how the site is actually hosted.
- `admin.html` (project root) is **not** served by this workflow — it lives outside `pages/` and is deployed separately to Cloudflare Pages (see below).

## Data architecture — centers / join-requests / governorates / areas / questions
- Live in **Cloudflare D1** (database `driverjo-db`), managed entirely through the Cloudflare Worker at `https://upload.idriverjo.workers.dev`, exposed as `/api/governorates`, `/api/areas`, `/api/centers`, `/api/center-requests` (incl. `/api/center-requests/:id/approve`), `/api/questions`. Schema: `cloudflare-worker/schema.sql`. A `POST /api/resync` admin endpoint regenerates all R2 JSON mirrors from D1 on demand (useful after a manual/bulk D1 write that bypasses the API).
- `admin.html` talks to this API directly (see the `CF`/`cfFetch` helper near `getDb()` in its inline script) — no more manual "export JSON from Firebase, upload to R2" step. Reads are public; every write requires the `X-Admin-Key` header (key is hardcoded client-side in `admin.html`, same accepted tradeoff as the existing `X-Upload-Key`/`UPLOAD_KEY` image-upload flow).
- `center-join.html` (public join form) posts new requests straight to `POST /api/center-requests` (no auth needed, matches the old open-write rule).
- `driving-schools.html`, `theory-test-practice.html`, `driving-theory-questions.html`, and the Blogger `template` were **not changed** — they still fetch `governorates.json` / `areas.json` / `centers.json` / `questions.json` / `version.json` from `https://data.driverjo.online` (R2). The Worker keeps those files in sync automatically on every write (see `syncCenters`/`syncGovernorates`/`syncAreas`/`syncQuestions`/`bumpVersion` in `upload-worker.js`), and bumps `version.json` so the template's existing client-side cache-busting picks up changes. That R2 domain has a ~60s edge cache, so public pages can lag a write by up to a minute.
- **Firebase is still used only for**: `pages/reviews.html` data + its login, and the admin login itself (`admin.html`'s Firebase email/password + RTDB `users` role check via `JDAuth`) — only the *data* moved to Cloudflare, not admin auth.

## Maps
- `center-join.html` (public "join as a center" form) and `admin.html` (admin panel's add/edit center form) use the Google Maps JavaScript API (Maps + Places + Geocoding) for the location picker, replacing the original Leaflet/OpenStreetMap/Nominatim implementation.
- Because the site is pasted directly into Blogger with no backend, the Google Maps API key is hardcoded directly in both HTML files (client-side, as is standard for browser-based Google Maps embeds). The user will restrict the key by HTTP referrer to their own domain in Google Cloud Console.
- The Maps script tag loads with `callback=`, so each page defines its ready callback (`window.jfOnGoogleMapsReady` / `window.admOnGoogleMapsReady`) and a pending-callback queue **before** the script tag, to avoid a load-order race.

## لوحة التحكم الإدارية — Cloudflare Pages

- **الملف**: `admin.html` في **جذر المشروع** (وليس داخل `pages/`)
- **الاستضافة**: Cloudflare Pages — مشروع `admin-panell` على `https://admin-panell.pages.dev/`
- **هيكل المستند**: مستند HTML مستقل كامل (`<!DOCTYPE html>`, `<html dir="rtl" lang="ar">`, `<head>`, `<body>`) — لا يعتمد على قالب Blogger لتشغيله
- **المكتبات المضمّنة مباشرة في الـ head**:
  - خطوط Google Fonts (IBM Plex Sans Arabic) عبر `<link>`
  - Phosphor Icons عبر `<script defer>`
  - Firebase compat SDK (app + database + auth) من `gstatic.com`
  - كائن `JDAuth` لإدارة الجلسة (مُعرَّف داخل الملف نفسه، بدل الاعتماد على قالب Blogger)
- **تسجيل الدخول**: Firebase Auth (بريد/كلمة مرور) + تحقق من صلاحية admin في Firebase RTDB
- **دومين Cloudflare Pages مضاف إلى**: Firebase Authorized Domains
- **التوافق مع الهاتف**: RTL على مستوى `<html>`، `width:100%; overflow-x:hidden` على `#adm-root` و`#adm-main`، breakpoints للشاشات 380px/420px/480px/520px، safe-area-inset للـ notch
- **لنشر تحديث**: عدّل `admin.html` هنا ثم ارفع الملف مجدداً على Cloudflare Pages (Direct Upload)

## Admin panel design system
- `admin.html` uses a mobile-app-style shell inspired by the Jordanian "SANAD" government app: fixed top bar + fixed bottom tab bar (`#adm-bottomnav`, dash/qs/centers/more) + a "more" bottom sheet (`#adm-more-sheet`) for the remaining sections (users/reviews/logout), instead of the old desktop sidebar. This applies at all screen widths, not just mobile — the user explicitly chose full mobile-app style over a desktop-sidebar-with-reskin approach.
- Design tokens (colors/radius/shadows) live in the `#adm-root` CSS variables at the top of the `<style>` block; primary blue `#1454F0`, green accent `#12A150`, heavily rounded cards/pills. Most list/card components (question/center/user/review cards, modals, forms) are generated by JS via `innerHTML` using fixed CSS class hooks, so visual restyles can be done almost entirely in CSS without touching that JS.
- The admin UI has **no governorates/areas management panel** (removed by user request) — `admin.html` no longer has any CRUD UI for `/api/governorates` or `/api/areas`. That D1 data and its Worker endpoints still exist and are still consumed by the public site (see "Data architecture" below); editing them now requires calling the Worker API directly or updating D1, not the admin panel.

## User preferences
- Site is hosted on Blogger (pages are copy-pasted there); no server-side backend in production. Don't design features that assume a Replit-hosted backend.
