# driverjo

## Overview
Static Arabic-language website for a Jordanian driving-schools directory ("driverjo"). Pages live in `pages/*.html` (no build step, plain HTML/CSS/JS). A Blogger XML template (`template`) and a Cloudflare Worker (`cloudflare-worker/upload-worker.js`, for uploading images to R2) are also part of the project but are deployed/managed separately from this Repl.

## Running
- Workflow "Start application" runs `node server.js`, a small custom Node HTTP server (no framework) that:
  - Serves static files from `pages/` on port 5000.
  - Supports clean URLs without `.html` (e.g. `/center-join` resolves to `pages/center-join.html`), matching the previous `serve` package's behavior.
  - Templates `{{GOOGLE_MAPS_API_KEY}}` into `center-join.html` and `admin.html` at request time, injecting the `GOOGLE_MAPS_API_KEY` environment variable so the key isn't hardcoded in the repo.

## Maps
- `center-join.html` (public "join as a center" form) and `admin.html` (admin panel's add/edit center form) use the Google Maps JavaScript API (Maps + Places + Geocoding) for the location picker, replacing the original Leaflet/OpenStreetMap/Nominatim implementation.
- The Maps script tag loads with `callback=`, so each page defines its ready callback (`window.jfOnGoogleMapsReady` / `window.admOnGoogleMapsReady`) and a pending-callback queue **before** the script tag, to avoid a load-order race.
- `GOOGLE_MAPS_API_KEY` must have Maps JavaScript API, Places API, and Geocoding API enabled in Google Cloud, with an HTTP referrer restriction for the deployed domain(s).

## User preferences
None recorded yet.
