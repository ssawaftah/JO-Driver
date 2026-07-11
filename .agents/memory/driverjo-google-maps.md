---
name: driverjo Google Maps usage
description: Where/why Google Maps JS API is (and isn't) used across driverjo pages, and the link-only convention for center location.
---

- `center-join.html` (public join form) never embedded an interactive map — it only asks for a pasted Google Maps share link and guesses the center name client-side from the URL (`/maps/place/<name>` or `?q=`). No lat/lng field, no Places/Geocoding calls.
- `admin.html`'s add/edit/review-center form was migrated to match that same link-only convention (2026-07-11): no embedded map, no Places search, no Geocoder, and no lat/lng fields at all. It still guesses the name from the pasted maps link, mirroring center-join.html's `extractNameFromMapsLink`.
- **Why:** the user explicitly wanted the admin center form to be "exactly like" the join form, and decided the "nearest center" distance feature (which relied on lat/lng) can go stale for new/edited centers rather than keep the map UI.
- **How to apply:** the public "nearest center" distance sort on `driving-schools.html` already guards with `if (c.lat && c.lng)`, so centers without coordinates just don't get a distance value — no crash. Existing centers created before this change may still have stored lat/lng in D1 (untouched since admin now sends partial updates without those keys); only new/edited centers going forward lack them.
- The Google Maps JS API script tag/key was removed entirely from `admin.html` (no longer used anywhere in that file). It remains unused elsewhere in the project as of this note — if map-based location picking is ever wanted again, treat it as a fresh feature decision, not a revert.
