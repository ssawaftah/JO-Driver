# driverjo

## Overview
Static Arabic-language website for a Jordanian driving-schools directory ("driverjo"). Pages live in `pages/*.html` (no build step, plain HTML/CSS/JS). The real deployment target is **Blogger** — the user copies/pastes the HTML from these pages directly into Blogger posts/pages, so nothing here can rely on server-side templating or a backend at runtime. A Blogger XML template (`template`) and a Cloudflare Worker (`cloudflare-worker/upload-worker.js`, for uploading images to R2) are also part of the project but are deployed/managed separately.

## Running (in this Repl, for editing/preview only)
- Workflow "Start application" runs `npx --yes serve pages -p 5000`, a plain static file server. This is just for previewing pages here — it does not reflect how the site is actually hosted (Blogger).

## Maps
- `center-join.html` (public "join as a center" form) and `admin.html` (admin panel's add/edit center form) use the Google Maps JavaScript API (Maps + Places + Geocoding) for the location picker, replacing the original Leaflet/OpenStreetMap/Nominatim implementation.
- Because the site is pasted directly into Blogger with no backend, the Google Maps API key is hardcoded directly in both HTML files (client-side, as is standard for browser-based Google Maps embeds). The user will restrict the key by HTTP referrer to their own domain in Google Cloud Console.
- The Maps script tag loads with `callback=`, so each page defines its ready callback (`window.jfOnGoogleMapsReady` / `window.admOnGoogleMapsReady`) and a pending-callback queue **before** the script tag, to avoid a load-order race.

## User preferences
- Site is hosted on Blogger (pages are copy-pasted there); no server-side backend in production. Don't design features that assume a Replit-hosted backend.
