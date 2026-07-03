import { state, loadSession } from "../state.js";
import { startTest } from "../app.js";
import { db } from "../lib/firebase.js";
import { renderReviewModal } from "../components/ReviewModal.js";

export function render(container, ctx) {
  const ok = state.resultOk;
  const total = state.resultTotal;
  const pct = total > 0 ? Math.round((ok / total) * 100) : 0;
  const passed = pct >= 70;
  const wrong = total - ok;

  const grade =
    pct >= 90 ? "ممتاز 🌟" :
    pct >= 80 ? "جيد جداً" :
    pct >= 70 ? "جيد ✅" :
    pct >= 50 ? "مقبول" : "يحتاج مراجعة";

  const color = passed ? "#16A34A" : "#DC2626";
  const bgColor = passed ? "#DCFCE7" : "#FEE2E2";

  // Circle SVG calculations
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = circ - (pct / 100) * circ;

  container.innerHTML = "";
  const el = document.createElement("div");
  el.style.cssText = "display:flex;flex-direction:column;min-height:100dvh;background:#fff;";

  // Top colored bar
  const topBar = document.createElement("div");
  topBar.style.cssText = `height:5px;background:${color};`;
  el.appendChild(topBar);

  // Hero
  const hero = document.createElement("div");
  hero.style.cssText = "padding:36px 24px 28px;textAlign:center;border-bottom:1px solid #E5E7EB;display:flex;flex-direction:column;align-items:center;";
  hero.innerHTML = `
    <div style="position:relative;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
      <svg width="130" height="130" style="transform:rotate(-90deg);">
        <circle cx="65" cy="65" r="${r}" fill="none" stroke="#E5E7EB" stroke-width="9" />
        <circle cx="65" cy="65" r="${r}" fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${dash}" style="transition:stroke-dashoffset 1s ease;" />
      </svg>
      <div style="position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;">
        <span style="font-size:28px;font-weight:900;color:${color};line-height:1;">${pct}%</span>
      </div>
    </div>
    <h2 style="font-size:22px;font-weight:900;color:#111827;margin-bottom:6px;">${grade}</h2>
    <p style="font-size:14px;color:#6B7280;margin:0;">
      ${passed ? "أحسنت! لقد اجتزت الاختبار بنجاح" : "لم تجتز الاختبار هذه المرة، حاول مجدداً"}
    </p>
  `;
  el.appendChild(hero);

  // Stats
  const statsWrap = document.createElement("div");
  statsWrap.style.cssText = "padding:20px 16px;display:flex;gap:10px;";
  [
    { label: "إجابة صحيحة", val: ok,    color: "#16A34A", bg: "#DCFCE7" },
    { label: "إجابة خاطئة", val: wrong, color: "#DC2626", bg: "#FEE2E2" },
    { label: "إجمالي",      val: total, color: "#2563EB", bg: "#DBEAFE" },
  ].forEach(s => {
    const sEl = document.createElement("div");
    sEl.style.cssText = `flex:1;background:${s.bg};border-radius:14px;padding:14px 8px;text-align:center;`;
    sEl.innerHTML = `
      <div style="font-size:24px;font-weight:900;color:${s.color};">${s.val}</div>
      <div style="font-size:11px;font-weight:700;color:${s.color};margin-top:3px;">${s.label}</div>
    `;
    statsWrap.appendChild(sEl);
  });
  el.appendChild(statsWrap);

  // Message
  const msgWrap = document.createElement("div");
  msgWrap.style.cssText = "padding:0 16px 20px;";
  msgWrap.innerHTML = `
    <div style="background:${bgColor};border-radius:14px;padding:14px 16px;display:flex;align-items:flex-start;gap:10px;">
      <i class="ph ph-${passed ? "check-circle" : "lightbulb"}" style="font-size:22px;color:${color};flex-shrink:0;margin-top:1px;"></i>
      <p style="font-size:14px;color:${passed ? "#15803D" : "#DC2626"};line-height:1.7;margin:0;">
        ${passed ? "أداء رائع! استمر في المراجعة للوصول إلى نتيجة أفضل." : "لا تيأس! راجع الأسئلة جيداً وستحقق نتيجة أفضل في المرة القادمة."}
      </p>
    </div>
  `;
  el.appendChild(msgWrap);

  // Buttons
  const btnsWrap = document.createElement("div");
  btnsWrap.style.cssText = "padding:0 16px 32px;display:flex;flex-direction:column;gap:10px;";
  
  const retryBtn = document.createElement("button");
  retryBtn.className = "btn-primary";
  retryBtn.innerHTML = `<i class="ph ph-arrow-clockwise" style="font-size:20px;"></i>إعادة الاختبار`;
  retryBtn.onclick = () => startTest(state.testCat || state.studyCat);
  btnsWrap.appendChild(retryBtn);

  const backBtn = document.createElement("button");
  backBtn.className = "btn-outline";
  backBtn.innerHTML = `<i class="ph ph-folder-open" style="font-size:20px;"></i>العودة للأقسام`;
  backBtn.onclick = () => ctx.navigate("/categories");
  btnsWrap.appendChild(backBtn);

  el.appendChild(btnsWrap);
  container.appendChild(el);

  // Review modal trigger
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
            context: "test",
            title: "قيّم تجربة الاختبار",
            subtitle: "كيف كان الاختبار ؟"
          });
          container.appendChild(modal);
        }, 800);
      }
    }).catch(() => {});
  }
}
