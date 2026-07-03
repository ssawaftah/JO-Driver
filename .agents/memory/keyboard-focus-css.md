---
name: Mobile Keyboard Auto-close Fix
description: Root cause and fix for keyboard closing after each character on mobile forms
---

**Why:** In React, attaching `onFocus={e => e.currentTarget.style.borderColor = ...}` and `onBlur={e => e.currentTarget.style.borderColor = ...}` directly to inputs causes inline DOM mutations on every focus/blur. On mobile Safari/WebKit, these mutations trigger layout recalculations that cause the keyboard to dismiss unexpectedly after typing a character.

**CRITICAL second cause:** Defining a form sub-component **inside** a parent component (e.g. `function CenterFormFields() { ... }` declared inside `function Admin() { ... }`) means React re-creates that function on every render. React sees it as an entirely new component type each time, so it **unmounts and remounts all child inputs** on every keystroke — which closes the mobile keyboard. The fix is to move the sub-component to the **top level** (outside the parent) and pass data via props.

**How to apply:**
1. Remove ALL inline `onFocus`/`onBlur` handlers that mutate `style.borderColor` or `style.boxShadow` from input/textarea elements.
2. Replace with a CSS class (e.g. `.admin-field`, `.review-field`) and define `:focus` styles in `index.css`.
3. **Most importantly:** Never define a component function inside another component function. Move it to module scope and pass state as props.
4. Also add `autoComplete="off"` and `spellCheck={false}` to inputs to prevent browser autocorrect from interfering.

**Example CSS:**
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

**Affected patterns in this project:**
- `Admin.tsx`: `CenterFormFields` was defined inside `Admin()` — moved to top level with `govs` and `areas` passed as props. All input/textarea fields in it also got `className="admin-field"` + CSS focus instead of inline handlers.
- `Input`/`TextArea` components, inline search inputs, option inputs, area name input, footer textarea — all already fixed in previous passes with the same CSS pattern.
