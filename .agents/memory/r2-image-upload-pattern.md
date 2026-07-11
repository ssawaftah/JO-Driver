---
name: R2 image upload pattern
description: Reusable client-side dropzone/upload flow used for image fields across driverjo static pages.
---

driverjo has no backend at runtime (pages are pasted into Blogger), so image uploads go straight from the browser to a Cloudflare Worker (`https://upload.idriverjo.workers.dev`) that writes to R2, using a static `X-Upload-Key` header value.

The established client flow (first built in admin.html for question images, then reused in center-join.html for center photos):
1. Dropzone `<label>` wrapping a transparent `<input type=file accept="image/*">`, with drag-over styling.
2. On file select: validate `file.type.startsWith('image/')`.
3. Non-GIF images are resized client-side via canvas (max 800px on the long edge, quality 0.82) before upload; GIFs are uploaded as-is (canvas would kill animation).
4. Upload via `FormData` POST to the worker URL with `X-Upload-Key` header; response `{url}` becomes the stored field value.
5. Show inline status (loading/ok/err) and a preview `<img>`.

**Why:** Keeps every page self-contained with zero server code, matching the Blogger-hosted, backend-less deployment model. The upload key being visible client-side is a known, accepted tradeoff here — not a bug to "fix" per project convention.

**How to apply:** When adding any new image-upload field to a driverjo page, copy this exact flow rather than inventing a new one, and guard form submission so it can't fire while an upload is still in-flight (the async URL isn't ready yet).

admin.html's add/edit/review-center form (`adm-ctr-form`) now uses this same dropzone flow for the center photo (was a manual "paste image URL" text input before) — kept consistent with center-join.html per explicit user request that admin's center forms mirror center-join.html exactly, field for field.
