/**
 * Minimal pushState-based router.
 * Each route entry: { pattern: "/study/:id", render(container, ctx) }
 * ctx passed to render: { params, navigate, path }
 */

const routes = [];
let rootEl = null;
let notFoundRender = null;
let currentCleanup = null;

export function registerRoute(pattern, render) {
  const paramNames = [];
  const regexStr =
    "^" +
    pattern
      .split("/")
      .map((seg) => {
        if (seg.startsWith(":")) {
          paramNames.push(seg.slice(1));
          return "([^/]+)";
        }
        return seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      })
      .join("/") +
    "$";
  routes.push({ pattern, regex: new RegExp(regexStr), paramNames, render });
}

export function setNotFound(render) {
  notFoundRender = render;
}

export function init(root) {
  rootEl = root;
  window.addEventListener("popstate", () => renderCurrent());
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-link]");
    if (a) {
      e.preventDefault();
      navigate(a.getAttribute("href"));
    }
  });
  renderCurrent();
}

export function navigate(path, { replace = false } = {}) {
  const current = window.location.pathname;
  if (current === path) {
    renderCurrent();
    return;
  }
  if (replace) {
    window.history.replaceState({}, "", path);
  } else {
    window.history.pushState({}, "", path);
  }
  renderCurrent();
}

function matchRoute(path) {
  for (const r of routes) {
    const m = path.match(r.regex);
    if (m) {
      const params = {};
      r.paramNames.forEach((name, i) => {
        params[name] = decodeURIComponent(m[i + 1]);
      });
      return { route: r, params };
    }
  }
  return null;
}

function renderCurrent() {
  if (!rootEl) return;
  const path = window.location.pathname || "/";
  const matched = matchRoute(path);

  if (typeof currentCleanup === "function") {
    try {
      currentCleanup();
    } catch {}
    currentCleanup = null;
  }
  rootEl.innerHTML = "";

  if (matched) {
    const ctx = { params: matched.params, navigate, path };
    const cleanup = matched.route.render(rootEl, ctx);
    if (typeof cleanup === "function") currentCleanup = cleanup;
  } else if (notFoundRender) {
    notFoundRender(rootEl, { params: {}, navigate, path });
  }

  window.scrollTo(0, 0);
  document.dispatchEvent(new CustomEvent("app:navigated", { detail: { path } }));
}

export function getCurrentPath() {
  return window.location.pathname || "/";
}
