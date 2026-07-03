# Persistent Memory

## Mobile Keyboard Auto-close Root Cause
- [keyboard-focus-css](keyboard-focus-css.md) — Inline onFocus/onBlur style mutations cause React re-renders that close mobile keyboards. CSS `:focus` pseudo-class is the correct fix.

## Porting React Router apps
- [react-to-vanilla-port-route-guards](react-to-vanilla-port-route-guards.md) — conditional `element={cond ? A : B}` route guards live in router wiring, not screen files; screen-by-screen ports miss them.
