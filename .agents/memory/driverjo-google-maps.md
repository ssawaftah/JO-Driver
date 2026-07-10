---
    name: driverjo Google Maps migration
    description: Durable lessons from swapping driverjo's Leaflet/OSM map picker for Google Maps
    ---

    - driverjo is deployed by copy-pasting the page HTML directly into Blogger — there is no backend at
    runtime in production. Never design a fix that relies on server-side templating/env injection for
    this project; the Replit static server here is only for local editing/preview.
    - Because of that, client-side API keys (e.g. Google Maps) are hardcoded directly in the HTML, same
    as any standard browser-based Google Maps embed. Key restriction is done via HTTP referrer in
    Google Cloud Console, not via secret-hiding — there's nowhere server-side to hide it.
    - Google Maps' `callback=` script param can fire before later inline `<script>` blocks on the page
    run. Define the ready callback (and a pending-callback queue) in a `<script>` placed *before* the
    Maps `<script src>` tag, not after — otherwise there's a real load-order race.
    