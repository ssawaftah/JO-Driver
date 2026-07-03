import { state, CATS } from "../state.js";
import { getQCounts, startStudy, startTest } from "../app.js";

const META = {
  "قواعد السير والمرور":        { icon: "traffic-sign",   color: "#2563EB", bg: "#DBEAFE" },
  "الميكانيك":                  { icon: "wrench",          color: "#16A34A", bg: "#DCFCE7" },
  "السلامة على الطريق":         { icon: "shield-check",    color: "#DC2626", bg: "#FEE2E2" },
  "أسعافات أولية":              { icon: "first-aid-kit",   color: "#DB2777", bg: "#FCE7F3" },
  "الشواخص والخطوط والعلامات": { icon: "signpost",        color: "#D97706", bg: "#FEF3C7" },
  "المخالفات واحتساب النقاط":  { icon: "warning-circle",  color: "#7C3AED", bg: "#EDE9FE" },
  "الصور المتحركة":             { icon: "gif",             color: "#0891B2", bg: "#CFFAFE" },
};
const DEF = { icon: "book-open", color: "#2563EB", bg: "#DBEAFE" };

export function render(container, ctx) {
  const cats = CATS;
  const qCounts = getQCounts();
  const totalQs = cats.reduce((sum, c) => sum + (qCounts[c] || 0), 0);

  container.innerHTML = "";
  const el = document.createElement("div");
  el.style.cssText = "min-height:100dvh;display:flex;flex-direction:column;background:#F3F6FF;";

  const body = document.createElement("div");
  body.style.cssText = "flex:1 1 0;min-height:0;overflow-y:auto;padding:14px;";
  el.appendChild(body);

  // Info card
  const infoCard = document.createElement("div");
  infoCard.style.cssText = "background:#fff;border-radius:16px;padding:16px 18px;border:1.5px solid #E5E7EB;margin-bottom:14px;display:flex;align-items:center;gap:14px;";
  infoCard.innerHTML = `
    <div style="width:44px;height:44px;border-radius:12px;flex-shrink:0;background:#246BFD;color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;">
      <i class="ph ph-books"></i>
    </div>
    <div>
      <div style="font-size:15px;font-weight:800;color:#111827;">الأقسام والأسئلة</div>
      <div style="font-size:12px;color:#6B7280;margin-top:2px;">اختر قسمًا لبدء المراجعة أو الاختبار — ${totalQs} سؤال</div>
    </div>
  `;
  body.appendChild(infoCard);

  cats.forEach((cat, i) => {
    const m = META[cat] || DEF;
    const count = qCounts[cat] || 0;

    const catEl = document.createElement("div");
    catEl.style.cssText = "margin-bottom:12px;background:#fff;border-radius:18px;border:1.5px solid #E5E7EB;overflow:hidden;";
    
    const info = document.createElement("div");
    info.style.cssText = "padding:14px 16px 12px;display:flex;align-items:center;gap:14px;border-bottom:1.5px solid #F3F4F6;";
    info.innerHTML = `
      <div style="width:48px;height:48px;border-radius:14px;flex-shrink:0;background:${m.bg};color:${m.color};display:flex;align-items:center;justify-content:center;font-size:24px;">
        <i class="ph ph-${m.icon}"></i>
      </div>
      <div>
        <div style="font-size:15px;font-weight:800;color:#111827;">${i + 1}. ${cat}</div>
        <div style="font-size:12px;color:#9CA3AF;margin-top:3px;">${count > 0 ? `${count} سؤال` : "لا توجد أسئلة بعد"}</div>
      </div>
    `;
    catEl.appendChild(info);

    const actions = document.createElement("div");
    actions.style.cssText = "display:grid;grid-template-columns:1fr 1fr;";
    
    const studyBtn = document.createElement("button");
    studyBtn.style.cssText = "padding:13px 8px;background:#EEF4FF;color:#246BFD;border:none;border-right:1.5px solid #E5E7EB;fontSize:14px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px;";
    studyBtn.innerHTML = `<i class="ph ph-book-open" style="font-size:18px;flex-shrink:0;"></i><span>مراجعة</span>`;
    studyBtn.onclick = () => startStudy(cat);
    
    const testBtn = document.createElement("button");
    testBtn.style.cssText = "padding:13px 8px;background:#246BFD;color:#fff;border:none;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px;";
    testBtn.innerHTML = `<i class="ph ph-pencil-line" style="font-size:18px;flex-shrink:0;"></i><span>اختبار</span>`;
    testBtn.onclick = () => startTest(cat);

    actions.appendChild(studyBtn);
    actions.appendChild(testBtn);
    catEl.appendChild(actions);
    body.appendChild(catEl);
  });

  const spacer = document.createElement("div");
  spacer.style.height = "20px";
  body.appendChild(spacer);

  container.appendChild(el);
}
