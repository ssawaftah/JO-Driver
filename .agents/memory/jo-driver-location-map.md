---
name: JO-Driver location map picker
description: How center location + coverage radius is captured in center-join.html
---

`center-join.html` replaced the plain "use my location" button with an interactive
Leaflet.js map (OpenStreetMap tiles, no API key needed) embedded directly in the
static/Blogger-style page via CDN `<link>`/`<script>` tags (no build step, no npm).

- User can click the map or drag the marker to place the center's pin; a circle
  overlay shows a coverage radius adjustable via a 1–30km range slider.
- A "locate me" button still exists below the map for convenience — it recenters
  the map/marker via `navigator.geolocation`.
- Submitted payload includes `lat`, `lng`, `coverageRadiusKm` (all `null` if the
  user never interacts with the map — no default/fake coordinates are ever sent).
- `admin.html`'s request-detail modal displays `lat`/`lng`/`coverageRadiusKm` from
  submitted requests so an admin can copy them into the Add/Edit Center form,
  which already has matching `lat`/`lng` input fields wired to load/save.

**Why:** Distance-to-user on `driving-schools.html` only works for centers with
real lat/lng; centers joined via a Google Maps *short* share link have no
parseable coordinates, so they never show a distance. This closes that gap at
the source (the join form) instead of patching the display logic.

**How to apply:** If the admin panel's own add/edit form is ever asked to get
the same map+radius picker (mentioned as a likely next step by the user), reuse
the same Leaflet/OSM approach for consistency — don't switch to a paid maps API
unless explicitly requested.

## Governorate/area auto-fill from pin (reverse geocoding)
When the pin is placed/dragged, `center-join.html` reverse-geocodes it via
Nominatim (`nominatim.openstreetmap.org/reverse`, free, no key) and auto-selects
the matching governorate + area dropdowns using Arabic-normalized name matching
(`bestMatch`: exact match first, then longest partial match).

**Why:** Async responses (geocode fetch, area list fetch, governorate list
fetch) can resolve out of order as the user drags the pin or manually changes
the governorate dropdown — naive fire-and-forget calls let stale results
silently overwrite newer user input.

**How to apply:** Any future async auto-fill chain here must keep: (1) a
monotonic sequence counter per async chain (`geocodeSeq`, `loadAreasSeq`)
checked before applying results, (2) a "not loaded yet" queue/gate
(`govsLoaded`/`pendingGeocode`) rather than assuming reference data is ready,
and (3) invalidation of in-flight auto-fill (bump the sequence counter) whenever
the user makes a manual/competing selection. Also never build geocoder-derived
text into `innerHTML` — build DOM nodes / use `textContent` to avoid DOM XSS,
since reverse-geocode text is external, uncontrolled input.

Pre-existing, out-of-scope issue noted (not fixed, low-risk): if the Firebase
`governorates.json` fetch fails, the hardcoded fallback list generates synthetic
IDs (`gov_0`, `gov_1`, …) that won't match `areas.json`'s real `governorateId`
values, so area auto-fill silently no-ops in that degraded network state.

## Superseded: governorate/area dropdowns removed entirely
As of the next iteration, `center-join.html` dropped the governorate/area
selects and the coverage-radius slider completely (the section above is kept
for historical context only — `govsMap`/`areasMap`/`GOV_ORDER`/`loadAreas`/
`findGovByName` etc. no longer exist in the file). The form is now: name → map
pin → free-text "العنوان" (address) field auto-filled from Nominatim reverse
geocoding (editable) → "رابط جوجل مابس" auto-filled as a generated
`google.com/maps/search/?api=1&query=lat,lng` URL (editable, can be replaced
with the real place link). Payload sends `lat/lng/address/mapsLink` directly —
no governorate/areas/coverageRadiusKm anymore. `admin.html`'s request-detail
modal shows `data.address` alongside lat/lng for admins reviewing requests.

**Why:** the user wants distance-based discovery instead of a city/area
picker; the location a user drops on the map is now the single source of
truth for both the human-readable address and the map link, removing
duplicate/inconsistent manual entry.
