---
    name: driverjo Google Maps migration
    description: How the driverjo static site loads Google Maps (server-side key injection, callback race avoidance)
    ---

    driverjo (pages/*.html, no build step) is served by a custom server.js, not the `serve` npm package.
    server.js templates `{{GOOGLE_MAPS_API_KEY}}` into center-join.html and admin.html from the
    GOOGLE_MAPS_API_KEY env var at request time, and re-implements clean URLs (no .html suffix) since
    switching away from `serve` would otherwise break existing links/bookmarks.

    **Why:** the site has no build/bundler, so there's no other way to keep an API key out of the
    static HTML source while still letting client-side Google Maps JS use it.

    **Google Maps callback race:** the Maps script tag uses `callback=` with `async defer`. Because the
    script can execute before later inline `<script>` blocks run, both pages define their ready
    callback (window.jfOnGoogleMapsReady / window.admOnGoogleMapsReady) and a pending-callback array
    *before* the Maps <script src> tag, then push the real init logic into that queue further down the
    page. Defining the callback only at its "logical" point later in the page is a real (if narrow) race.
    