---
name: Phosphor Icons Web CDN usage
description: Correct unpkg URL pattern for @phosphor-icons/web — using the wrong path silently breaks all icons with no console error visible at a glance.
---

`@phosphor-icons/web@2.1.1` (and likely other versions) ships **CSS stylesheets**, not loadable JS entry files, per weight. The per-weight `index.js` path does not exist on unpkg and 404s silently (icons just don't render — a "blank colored circle/square" where the icon should be, easy to mistake for a general "icons broken" or "not mobile compatible" bug).

**Correct:**
```html
<link rel="stylesheet" type="text/css" href="https://unpkg.com/@phosphor-icons/web@<VERSION>/src/<WEIGHT>/style.css">
```

**Wrong (404s):**
```html
<script src="https://unpkg.com/@phosphor-icons/web@<VERSION>/src/<WEIGHT>/index.js" defer></script>
```

**Why:** The package's webfont+CSS approach requires the stylesheet only; there is no meaningful per-weight JS module to load this way. A 404 on that URL doesn't throw a JS error users notice — it just leaves every `<i class="ph-... ph-...">` empty.

**How to apply:** Whenever debugging "icons not showing" with this library, check the network tab / curl the exact URL first — a wrong `.js` vs `.css` path is the most likely cause, not a class-name typo.
