# driverjo

## Overview
Static Arabic-language website for a Jordanian driving-schools directory ("driverjo"). Pages live in `pages/*.html` (no build step, plain HTML/CSS/JS). The real deployment target is **Blogger** — the user copies/pastes the HTML from these pages directly into Blogger posts/pages, so nothing here can rely on server-side templating or a backend at runtime. A Blogger XML template (`template`) and a Cloudflare Worker (`cloudflare-worker/upload-worker.js`) are also part of the project but are deployed/managed separately (via `wrangler`, not by the Repl workflow).

## Running (in this Repl, for editing/preview only)
- Workflow "Start application" runs `npx --yes serve pages -p 5000`, a plain static file server. This is just for previewing pages here — it does not reflect how the site is actually hosted (Blogger).

## Data architecture — centers / join-requests / governorates / areas
- Live in **Cloudflare D1** (database `driverjo-db`), managed entirely through the Cloudflare Worker at `https://upload.idriverjo.workers.dev`, exposed as `/api/governorates`, `/api/areas`, `/api/centers`, `/api/center-requests` (incl. `/api/center-requests/:id/approve`). Schema: `cloudflare-worker/schema.sql`.
- `admin.html` talks to this API directly (see the `CF`/`cfFetch` helper near `getDb()` in its inline script) — no more manual "export JSON from Firebase, upload to R2" step. Reads are public; every write requires the `X-Admin-Key` header (key is hardcoded client-side in `admin.html`, same accepted tradeoff as the existing `X-Upload-Key`/`UPLOAD_KEY` image-upload flow).
- `center-join.html` (public join form) posts new requests straight to `POST /api/center-requests` (no auth needed, matches the old open-write rule).
- `driving-schools.html`, `center-details.html` and the Blogger `template` were **not changed** — they still fetch `governorates.json` / `areas.json` / `centers.json` / `version.json` from `https://data.driverjo.online` (R2). The Worker keeps those files in sync automatically on every write (see `syncCenters`/`syncGovernorates`/`syncAreas`/`bumpVersion` in `upload-worker.js`), and bumps `version.json` so the template's existing client-side cache-busting picks up changes. That R2 domain has a ~60s edge cache, so public pages can lag a write by up to a minute.
- **Firebase is still used only for**: `pages/reviews.html` data + its login, `pages/theory-test-practice.html`, and the admin login itself (`admin.html`'s Firebase email/password + RTDB `users` role check via `JDAuth`) — only the *data* moved to Cloudflare, not admin auth.
- `cloudflare-worker/seed.sql` is the one-time migration dump (Firebase → D1) kept for historical reference; safe to delete once the migration has been stable for a while.

## Maps
- `center-join.html` (public "join as a center" form) and `admin.html` (admin panel's add/edit center form) use the Google Maps JavaScript API (Maps + Places + Geocoding) for the location picker, replacing the original Leaflet/OpenStreetMap/Nominatim implementation.
- Because the site is pasted directly into Blogger with no backend, the Google Maps API key is hardcoded directly in both HTML files (client-side, as is standard for browser-based Google Maps embeds). The user will restrict the key by HTTP referrer to their own domain in Google Cloud Console.
- The Maps script tag loads with `callback=`, so each page defines its ready callback (`window.jfOnGoogleMapsReady` / `window.admOnGoogleMapsReady`) and a pending-callback queue **before** the script tag, to avoid a load-order race.

## User preferences
- Site is hosted on Blogger (pages are copy-pasted there); no server-side backend in production. Don't design features that assume a Replit-hosted backend.
