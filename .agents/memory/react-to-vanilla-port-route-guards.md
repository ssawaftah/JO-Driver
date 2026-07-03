---
name: React-to-vanilla-JS port route guards
description: When porting a React SPA (react-router-dom) to a vanilla-JS router, conditional route elements (e.g. `path="/admin" element={loggedIn ? <Admin/> : <Login/>}`) are easy to drop since they look like plain route registrations once extracted screen-by-screen.
---

When a React app renders different components for the *same* route based on state
(auth guards, feature flags, etc.), that conditional lives in the `<Route element={...}>`
JSX, not in the child component itself. A subagent/port that works screen-by-screen from
component files will faithfully port each screen but can miss this route-level guard,
since the guard logic isn't in either component — it's in the router wiring.

**Why:** During a React→vanilla-JS rewrite of a multi-screen app, `/admin` was wired to
always render the Admin dashboard regardless of login state, because the guard
(`adminLoggedIn ? <Admin/> : <AdminLogin/>`) had lived in the old `<Routes>` block and was
easy to overlook when re-registering routes in the new router.

**How to apply:** When porting a React Router app to any other router, explicitly grep
the old routing file for ternaries/conditionals inside `element={...}` (or equivalent)
and reproduce each one as an explicit guard at the new route-registration site, not just
as a 1:1 file-to-file port of screen components.
