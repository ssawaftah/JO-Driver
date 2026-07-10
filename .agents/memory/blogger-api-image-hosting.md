---
name: Blogger API v3 image hosting limitation
description: Whether Blogger API v3 can be used to upload/host images for third-party apps (it cannot).
---

Blogger's own image hosting (`blogger.googleusercontent.com`) is only produced by the
web Compose editor's internal upload pipeline. Sending a post via Blogger API v3
(`posts.insert`/`update`) with an `<img src="data:...">` base64 tag does **not**
get rehosted — Blogger stores the base64 content verbatim. Confirmed via a live
test (created a draft post with an embedded base64 image, refetched it, and the
returned content still contained the raw base64, not a hosted URL).

**Why:** No documented or undocumented Blogger API v3 endpoint exists for media
upload; this was verified empirically rather than assumed from docs alone.

**How to apply:** If a project needs external image hosting and is Blogger-based,
skip Blogger API entirely — use an actual storage/CDN service instead (Cloudflare
R2, Firebase Storage, Cloudinary, Google Drive API, etc.), each with different
free-tier/credit-card tradeoffs worth surfacing to the user before picking one.
