import { state, loadSession } from "../state.js";
import { renderReviewModal } from "../components/ReviewModal.js";
import { db } from "../lib/firebase.js";

export function render(container, ctx) {
  const ok = state.examOk;
  const wrong = state.examWrong;
  const total = state.examTotal;
  const skipped = state.examSkipped;
  const passed = wrong <= 9 && ok >= 51;
  const pct = total > 0 ? Math.round((ok / total) * 100) : 0;

  const color = passed ? "#16A34A" : "#DC2626";
  const r = 52, circ = 2 * Math.PI * r;
  const dash = circ - (pct / 100) * circ;

  container.innerHTML = "";
  const el = document.createElement("div");
  el.style.cssText = "display:flex;flex-direction:column;min-height:100dvh;background:#fff;";

  const accent = document.createElement("div");
  accent.style.cssText = `height:6px;background:${color};flex-shrink:0;`;
  el.appendChild(accent);

  // Hero
  const hero = document.createElement("div");
  hero.style.cssText = "padding:30px 20px 20px;text-align:center;border-bottom:1px solid #F3F4F6;flex-shrink:0;display:flex;flex-direction:column;align-items:center;";
  hero.innerHTML = `
    <div style="width:72px;height:72px;border-radius:24px;margin:0 auto 16px;background:${passed ? "#DCFCE7" : "#FEE2E2"};display:flex;align-items:center;justify-content:center;fontSize:38px;color:${color};">
      <i class="ph ph-${passed ? "seal-check" : "seal-warning"}" style="font-size:38px;"></i>
    </div>
    <h1 style="font-size:24px;font-weight:900;color:${color};margin-bottom:6px;">${passed ? "مبروك! اجتزت الاختبار 🎉" : "لم تجتز الاختبار"}</h1>
    <p style="font-size:14px;color:#6B7280;margin-bottom:20px;">
      ${passed ? "أداء ممتاز! أنت مؤهل لاجتياز الفحص النظري الرسمي" : (wrong > 9 ? "تم إيقاف الاختبار لتجاوز الحد الأقصى للإجابات الخاطئة" : "راجع المزيد من الأسئلة وحاول مجدداً")}
    </p>
    <div style="position:relative;display:inline-flex;margin-bottom:8px;">
      <svg width="130" height="130" style="transform:rotate(-90deg);">
        <circle cx="65" cy="65" r="${r}" fill="none" stroke="#E5E7EB" stroke-width="9" />
        <circle cx="65" cy="65" r="${r}" fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${dash}" />
      </svg>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
        <span style="font-size:26px;font-weight:900;color:${color};line-height:1;">${pct}%</span>
        <span style="font-size:11px;color:#9CA3AF;margin-top:2px;">النتيجة</span>
      </div>
    </div>
  `;
  el.appendChild(hero);

  // Stats
  const stats = document.createElement("div");
  stats.style.cssText = "padding:16px 14px;flex-shrink:0;";
  const grid = document.createElement("div");
  grid.style.cssText = "display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;";
  [
    { label: "صحيح",    val: ok,      color: "#16A34A", bg: "#DCFCE7" },
    { label: "خاطئ",    val: wrong,   color: "#DC2626", bg: "#FEE2E2" },
    { label: "متخطى",   val: skipped, color: "#D97706", bg: "#FEF3C7" },
    { label: "المجموع", val: total,   color: "#2563EB", bg: "#DBEAFE" },
  ].forEach(s => {
    const sEl = document.createElement("div");
    sEl.style.cssText = `background:${s.bg};border-radius:14px;padding:12px 6px;text-align:center;`;
    sEl.innerHTML = `
      <div style="font-size:22px;font-weight:900;color:${s.color};">${s.val}</div>
      <div style="font-size:11px;font-weight:700;color:${s.color};margin-top:2px;">${s.label}</div>
    `;
    grid.appendChild(sEl);
  });
  stats.appendChild(grid);
  el.appendChild(stats);

  // Detail
  const detail = document.createElement("div");
  detail.style.cssText = "padding:0 14px 16px;flex-shrink:0;";
  detail.innerHTML = `
    <div style="background:${passed ? "#DCFCE7" : "#FEE2E2"};border-radius:14px;padding:14px 16px;display:flex;align-items:flex-start;gap:10px;">
      <i class="ph ph-${passed ? "check-circle" : "x-circle"}" style="font-size:22px;color:${color};flex-shrink:0;margin-top:1px;"></i>
      <div style="font-size:13px;line-height:1.7;color:${passed ? "#15803D" : "#DC2626"};">
        ${passed ? `أجبت على <strong>${ok}</strong> من <strong>${total}</strong> سؤال بشكل صحيح، بمعدل <strong>${pct}%</strong>. الحد الأدنى للنجاح هو 51 سؤالاً وقد تجاوزته!` : 
          (wrong > 9 ? `تجاوزت الحد الأقصى للإجابات الخاطئة (<strong>10 أخطاء</strong>). وفقاً لمعايير دائرة الترخيص يُوقف الاختبار فوراً عند ذلك.` : 
          `أجبت على <strong>${ok}</strong> من <strong>${total}</strong> سؤال بشكل صحيح. تحتاج إلى <strong>51</strong> إجابة صحيحة على الأقل للنجاح.`)}
      </div>
    </div>
  `;
  el.appendChild(detail);

  // Buttons
  const btns = document.createElement("div");
  btns.style.cssText = "padding:0 14px 32px;display:flex;flex-direction:column;gap:10px;flex-shrink:0;";
  
  const retryBtn = document.createElement("button");
  retryBtn.style.cssText = "width:100%;padding:14px;border-radius:14px;border:none;background:#246BFD;color:#fff;font-size:16px;font-weight:800;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;";
  retryBtn.innerHTML = `<i class="ph ph-arrow-clockwise" style="font-size:20px;"></i>إعادة الاختبار`;
  retryBtn.onclick = () => ctx.navigate("/exam-rules");
  btns.appendChild(retryBtn);

  const homeBtn = document.createElement("button");
  homeBtn.style.cssText = "width:100%;padding:14px;border-radius:14px;border:1.5px solid #E5E7EB;background:#fff;color:#6B7280;font-size:16px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;";
  homeBtn.innerHTML = `<i class="ph ph-house" style="font-size:20px;"></i>العودة للرئيسية`;
  homeBtn.onclick = () => ctx.navigate("/");
  btns.appendChild(homeBtn);
  el.appendChild(btns);

  container.appendChild(el);

  const session = loadSession();
  if (session) {
    db.ref("reviews").once("value").then(snap => {
      const val = snap.val() || {};
      const already = Object.values(val).some(r => r.reviewerKey === session.key);
      if (!already) {
        setTimeout(() => {
          const modal = renderReviewModal({
            open: true,
            onClose: () => modal.remove(),
            context: "exam",
            title: "قيّم تجربة الامتحان",
            subtitle: "كيف كان الامتحان النظري ؟"
          });
          container.appendChild(modal);
        }, 800);
      }
    }).catch(() => {});
  }
}
