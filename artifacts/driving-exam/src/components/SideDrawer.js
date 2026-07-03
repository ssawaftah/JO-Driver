const links = [
  { icon: "pencil-line", color: "#16A34A", path: "/exam-rules", label: "الامتحان النظري" },
  { icon: "book-open", color: "#2563EB", path: "/categories", label: "دراسة الأسئلة" },
  { icon: "map-pin", color: "#D97706", path: "/centers", label: "مراكز التدريب" },
  { icon: "book-open-text", color: "#7C3AED", path: "/guide", label: "دليل الطالب" },
];

/**
 * renderSideDrawer({ navigate, onClose }) -> DOM node (or null-ish empty node if not needed)
 * Caller controls mount/unmount by attaching/removing the returned node.
 */
export function renderSideDrawer({ navigate, onClose }) {
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.4);animation:fadeIn 0.2s ease;";
  overlay.addEventListener("click", onClose);

  const panel = document.createElement("div");
  panel.style.cssText =
    "position:absolute;top:0;right:0;bottom:0;width:min(320px,85vw);background:#fff;box-shadow:-4px 0 24px rgba(0,0,0,0.15);display:flex;flex-direction:column;animation:slideInRight 0.25s ease;";
  panel.addEventListener("click", (e) => e.stopPropagation());
  overlay.appendChild(panel);

  const header = document.createElement("div");
  header.style.cssText = "padding:16px;border-bottom:1px solid #F3F4F6;display:flex;align-items:center;justify-content:space-between;";
  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#246BFD,#4f86ff);display:flex;align-items:center;justify-content:center;font-size:18px;color:#fff;">
        <i class="ph ph-steering-wheel"></i>
      </div>
      <div style="font-size:15px;font-weight:900;color:#111827;">JO Driver</div>
    </div>
  `;
  const closeBtn = document.createElement("button");
  closeBtn.style.cssText = "width:36px;height:36px;border-radius:10px;border:1.5px solid #E5E7EB;background:#F9FAFB;display:flex;align-items:center;justify-content:center;cursor:pointer;";
  closeBtn.innerHTML = `<i class="ph ph-x" style="font-size:18px;color:#6B7280;"></i>`;
  closeBtn.addEventListener("click", onClose);
  header.appendChild(closeBtn);
  panel.appendChild(header);

  const nav = document.createElement("div");
  nav.style.cssText = "padding:12px 8px;flex:1;overflow-y:auto;";
  links.forEach((l) => {
    const btn = document.createElement("button");
    btn.style.cssText =
      "width:100%;display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;border:none;background:transparent;cursor:pointer;font-family:inherit;text-align:right;direction:rtl;transition:background 0.15s;";
    btn.innerHTML = `
      <div style="width:34px;height:34px;border-radius:10px;background:${l.color}15;color:${l.color};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">
        <i class="ph ph-${l.icon}"></i>
      </div>
      <span style="font-size:14px;font-weight:700;color:#111827;flex:1;">${l.label}</span>
      <i class="ph ph-caret-left" style="font-size:14px;color:#D1D5DB;"></i>
    `;
    btn.addEventListener("mouseenter", () => (btn.style.background = "#F9FAFB"));
    btn.addEventListener("mouseleave", () => (btn.style.background = "transparent"));
    btn.addEventListener("click", () => {
      navigate(l.path);
      onClose();
    });
    nav.appendChild(btn);
  });
  panel.appendChild(nav);

  const footer = document.createElement("div");
  footer.style.cssText = "padding:14px 16px;border-top:1px solid #F3F4F6;text-align:center;font-size:11px;color:#9CA3AF;";
  footer.textContent = "JO Driver · تحضير مجاني لامتحان القيادة النظري";
  panel.appendChild(footer);

  return overlay;
}
