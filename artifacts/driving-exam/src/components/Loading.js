export function renderLoading(msg) {
  const el = document.createElement("div");
  el.style.cssText =
    "position:fixed;inset:0;z-index:100;background:rgba(255,255,255,0.94);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;";
  el.innerHTML = `
    <div class="spinner"></div>
    <p style="font-weight:700;color:#374151;font-size:15px;">${escapeHtml(msg || "")}</p>
  `;
  return el;
}

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}
