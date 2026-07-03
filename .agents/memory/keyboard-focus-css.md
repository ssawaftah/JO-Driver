---
name: Mobile Keyboard Auto-close Fix
description: Root cause and fix for keyboard closing after each character on mobile forms
---

**Why:** In React, attaching `onFocus={e => e.currentTarget.style.borderColor = ...}` and `onBlur={e => e.currentTarget.style.borderColor = ...}` directly to inputs causes inline DOM mutations on every focus/blur. On mobile Safari/WebKit, these mutations trigger layout recalculations that cause the keyboard to dismiss unexpectedly after typing a character.

**How to apply:**
- Remove ALL inline `onFocus`/`onBlur` handlers that mutate `style.borderColor` or `style.boxShadow` from input/textarea elements.
- Replace with a CSS class (e.g. `.admin-field`, `.review-field`) and define `:focus` styles in `index.css`.
- Example CSS:
  ```css
  .admin-field:focus {
    border-color: #2563EB !important;
    outline: none;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
  }
  .admin-field {
    transition: border-color .15s, box-shadow .15s;
  }
  ```
- Also add `autoComplete="off"` and `spellCheck={false}` to inputs to prevent browser autocorrect from interfering.

**Affected patterns in this project:**
- `Admin.tsx`: `Input`, `TextArea` components, inline search inputs, option inputs, area name input, footer textarea.
- `CenterDetail.tsx`, `Reviews.tsx`, `ReviewModal.tsx`, `AdminLogin.tsx`: All already fixed previously with the same pattern.
