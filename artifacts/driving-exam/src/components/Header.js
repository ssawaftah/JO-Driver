function getParentRoute(path) {
  if (path.startsWith("/centers/") && path !== "/centers/join") return "/centers";
  if (path === "/centers/join") return "/centers";
  if (path.startsWith("/study/")) return "/categories";
  if (path.startsWith("/test/")) return "/categories";
  if (path === "/result") return "/categories";
  if (path === "/exam-rules") return "/";
  if (path === "/exam") return "/exam-rules";
  if (path === "/exam-result") return "/";
  if (path === "/guide") return "/";
  if (path === "/reviews") return "/";
  if (path === "/admin-login") return "/";
  if (path === "/admin") return "/admin-login";
  return "/";
}

/**
 * renderHeader({ navigate, onMenuOpen })
 * Renders based on current window.location.pathname.
 */
export function renderHeader({ navigate, onMenuOpen }) {
  const path = window.location.pathname;
  const isHome = path === "/" || path === "";
  const isCenters = path === "/centers";

  const header = document.createElement("header");
  header.style.cssText =
    "position:sticky;top:0;z-index:50;background:#fff;border-bottom:1px solid #E5E7EB;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;";

  const left = document.createElement("div");
  left.style.cssText = "display:flex;align-items:center;gap:12px;";

  const navBtn = document.createElement("button");
  navBtn.setAttribute("aria-label", isHome ? "فتح القائمة" : "رجوع");
  navBtn.style.cssText =
    "width:40px;height:40px;border-radius:12px;border:1.5px solid #E5E7EB;background:#F9FAFB;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;";
  if (isHome) {
    navBtn.innerHTML = `<i class="ph ph-list" style="font-size:22px;color:#111827;"></i>`;
    navBtn.addEventListener("click", () => onMenuOpen && onMenuOpen());
  } else {
    navBtn.innerHTML = `<i class="ph ph-arrow-right" style="font-size:20px;color:#246BFD;"></i>`;
    navBtn.addEventListener("click", () => navigate(getParentRoute(path)));
  }
  left.appendChild(navBtn);

  const logo = document.createElement("div");
  logo.style.cssText = "display:flex;align-items:center;gap:10px;cursor:pointer;";
  logo.innerHTML = `
    <div style="width:38px;height:38px;border-radius:12px;background:linear-gradient(135deg,#246BFD,#4f86ff);display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff;flex-shrink:0;">
      <i class="ph ph-steering-wheel"></i>
    </div>
    <div>
      <div style="font-size:16px;font-weight:900;color:#111827;letter-spacing:-0.3px;">JO Driver</div>
      <div style="font-size:11px;color:#6B7280;font-weight:500;">تحضير لامتحان القيادة النظري</div>
    </div>
  `;
  logo.addEventListener("click", () => navigate("/"));
  left.appendChild(logo);

  header.appendChild(left);

  if (isCenters) {
    const joinBtn = document.createElement("button");
    joinBtn.style.cssText =
      "padding:8px 14px;border-radius:10px;background:#246BFD;color:#fff;font-size:12px;font-weight:800;border:none;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:5px;flex-shrink:0;";
    joinBtn.innerHTML = `<i class="ph ph-plus"></i>انضمام`;
    joinBtn.addEventListener("click", () => navigate("/centers/join"));
    header.appendChild(joinBtn);
  }

  return header;
}
