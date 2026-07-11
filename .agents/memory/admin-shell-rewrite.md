---
name: admin.html shell rewrite pitfalls
description: What broke (and how to avoid it) when replacing admin.html's desktop sidebar nav with a mobile bottom-tab-bar shell.
---

`pages/admin.html` is a single inline `<script>` with no module boundaries — a `var` declared once near the top (e.g. the
sidebar item collection) is referenced by name in several unrelated feature blocks further down the file (dashboard nav,
per-panel data loaders, category grid wiring, etc.).

When the sidebar nav (`.adm-sb-item`, `#adm-sidebar`, `#adm-mobile-bar`, `#adm-ham-btn`, `#adm-sb-overlay`) was replaced with
a bottom tab bar + "more" sheet (`.adm-nav-item`/`.adm-more-item`, `#adm-bottomnav`, `#adm-more-sheet`, `#adm-more-overlay`,
`#adm-more-btn`), the top-level nav variable was renamed (`sbItems` → `navItems`, `openSidebar/closeSidebar` →
`openMoreSheet/closeMoreSheet`). One later, unrelated block (question-panel click wiring, used to lazy-load categories)
still referenced the old `sbItems` name.

**Why this matters:** a `ReferenceError` thrown partway through this single top-level script silently aborts *all*
subsequent top-level code in that IIFE — including data-fetch wiring for other panels — even though the error has nothing
to do with data fetching. The symptom reported ("nothing loads data") looked unrelated to the actual nav rename that caused it.

**How to apply:** after renaming/removing any shared variable, DOM id, or function in this file, grep the *entire* file for
every old identifier (not just the block you edited) before considering the change done. A syntax check alone (`new
Function(script)`) does NOT catch this — it's a valid reference to an undeclared variable, only a runtime `ReferenceError`.
Load-test by screenshotting a bypassed/forced-authenticated copy and checking the browser console log, not just the visual
layout.
