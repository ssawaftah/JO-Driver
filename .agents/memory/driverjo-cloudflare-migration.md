---
name: driverjo centers/requests/governorates/areas moved to Cloudflare D1
description: Firebase RTDB replaced by a Cloudflare Worker + D1 for centers, CenterRequests, governorates, areas — read before touching admin.html, center-join.html, driving-schools.html, or the Worker.
---

## What moved and what didn't
- `centers`, `CenterRequests`, `governorates`, `areas` now live in Cloudflare D1, managed live via the existing Worker (`upload.idriverjo.workers.dev`) extended with `/api/*` REST routes (see `cloudflare-worker/upload-worker.js`, `schema.sql`).
- Firebase stays for `reviews.html` (+ its login), `theory-test-practice.html`, and the admin login itself in `admin.html` (Firebase email/password + RTDB `users` role check). Only the data moved, never touch admin auth without explicit ask — lockout risk.

## Key design choice: keep the R2 JSON mirror instead of rewriting public pages
`driving-schools.html`, `center-details.html`, and the Blogger `template` all read `governorates.json`/`areas.json`/`centers.json`/`version.json` from `https://data.driverjo.online` (R2) via `window.JDCDN`. Rather than rewrite those pages to call the new API, the Worker regenerates those same R2 JSON files (and bumps `version.json` to a fresh timestamp) on every write to centers/governorates/areas — see `syncCenters`/`syncGovernorates`/`syncAreas`/`bumpVersion` in the worker.
**Why:** the template's existing `JDPrefetch`/`checkVersion` client cache-busting already keys off `version.json`, so this got "no more manual export/upload" without touching three separate front-end files or their caching logic. That R2 custom domain has ~60s edge cache (`Cache-Control: public, max-age=60`), so public pages can lag an admin write by up to a minute — acceptable, no cache-purge wiring added.
**How to apply:** any new field/table added to this data model should also flow through the matching `sync*` helper, or the public JSON mirror will silently drift from D1.

## admin.html integration pattern
Rather than rewriting ~30 call sites individually, added a small shim (`CF`/`CFRef`/`cfFetch` near `getDb()`) that mimics the Firebase compat `ref().once('value')/.update()/.remove()/.push()/.orderByChild().equalTo()` surface but calls the Worker's REST API. Existing `d.ref('centers'...)` call sites were swapped to `CF.ref('centers'...)` with minimal edits; Firebase (`getDb()`) is still used unchanged for reviews/questions/users. The one exception is request-approval: it now calls a single atomic `POST /api/center-requests/:id/approve` endpoint (body = the new center payload) instead of a multi-path Firebase update — mirrors the old "publish center + archive request together" semantics.
**Why:** minimizes risk/diff size on a 3500+ line file while keeping write semantics (including Firebase's "set field to null = delete field" convention, which the Worker's PATCH handlers replicate).

## Admin auth
Every write endpoint requires `X-Admin-Key` header (Worker secret `ADMIN_KEY`), hardcoded client-side in `admin.html` (same accepted tradeoff as the pre-existing `UPLOAD_KEY`/`X-Upload-Key` image-upload flow). Public GET (all four resources) and public POST (`/api/center-requests` only) need no key.
