---
    name: center-join link-first flow
    description: Design of the driverjo "join" form's two-step, link-first flow (no Google Places/Geocoding dependency)
    ---

    pages/center-join.html now collects the center's Google Maps link *first*, then reveals the rest of
    the form. The candidate center name is guessed by regex-parsing the URL itself
    (`/maps/place/<name>/` or `?q=<name>`) — purely client-side, no Places/Geocoding API call, so it
    works even though the project's Google Maps API key has billing/Places API not enabled.

    **Why:** short share links (maps.app.goo.gl) can't be resolved client-side (CORS blocks following
    the redirect without a backend), and the site has no backend in production (hosted on Blogger). The
    regex approach degrades gracefully — leaves the name field blank for manual entry — instead of
    failing hard.

    **How to apply:** if asked to extend this to other auto-fill fields (address, rating) from a Maps
    link without a backend, the same constraint applies — only the URL path/query is available
    client-side, not the resolved place data.
    