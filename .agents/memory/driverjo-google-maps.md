---
name: driverjo Google Maps usage
description: How driverjo pages get center coordinates for distance sorting, and the short-link pitfall that breaks it.
---

No page embeds an interactive map anymore; admin.html and center-join.html both use a link-only flow (paste a Google Maps URL, guess the center name from it client-side by regex — no Places/Geocoding API call).

**Coordinate pitfall (root cause of "distance doesn't show for newly added centers"):** most users share the mobile short-link format (`maps.app.goo.gl/...` / `goo.gl/maps/...`), which contains **no embedded lat/lng** — coordinates only appear after following the redirect, and a browser can't read that cross-origin redirect target (opaque redirect / CORS). Client-side regex over the raw pasted link therefore silently fails to find coordinates for these links, so `driving-schools.html`'s `haversine()` distance never renders for such centers, even though the center itself displays fine.

**Fix in place:** the Cloudflare Worker (`cloudflare-worker/upload-worker.js`) has a public `POST /api/resolve-maps-link` endpoint that follows the redirect server-side and extracts `{lat,lng}` (patterns: `@lat,lng`, `?q=`, `?ll=`, `!3d..!4d..`). Both admin.html's center form and center-join.html's submit handler call this before saving, and store `lat`/`lng` directly on the center record — `getCoords()` in driving-schools.html always prefers stored `lat`/`lng` over regex-parsing the link.

**Why:** short links can't be resolved client-side at all; storing resolved coordinates once at write time avoids re-parsing an unresolvable link on every page view.

**How to apply:** if a future report says "center X shows but has no distance", check whether it has `lat`/`lng` saved (most likely missing because it predates this fix, or the resolve call failed/timed out). admin.html has a "تحديث الإحداثيات" bulk-fix button on the centers panel that re-resolves and patches any center missing `lat`/`lng`.

**Deployment gotcha:** the Worker is deployed separately via `wrangler`, not through the Replit workflow (per replit.md) — editing `upload-worker.js` in this repo does NOT take effect on `upload.idriverjo.workers.dev` until the user runs `wrangler deploy` themselves (no Cloudflare credentials are available in this environment to do it automatically).
