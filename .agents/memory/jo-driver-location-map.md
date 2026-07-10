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
