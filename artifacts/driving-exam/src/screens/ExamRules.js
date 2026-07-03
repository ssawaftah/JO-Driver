import { startExam } from "../app.js";

const rules = [
  { icon: "list-numbers",   color: "#2563EB", bg: "#DBEAFE", text: "عدد الأسئلة: 60 سؤالاً من جميع الأقسام بشكل عشوائي" },
  { icon: "clock",          color: "#D97706", bg: "#FEF3C7", text: "مدة الاختبار: 60 دقيقة" },
  { icon: "check-circle",   color: "#16A34A", bg: "#DCFCE7", text: "شرط النجاح: الإجابة الصحيحة على 51 سؤالاً أو أكثر" },
  { icon: "x-circle",       color: "#DC2626", bg: "#FEE2E2", text: "الرسوب الفوري: عند الإجابة الخاطئة على 10 أسئلة أو أكثر يُوقف الاختبار" },
  { icon: "arrow-u-up-left",color: "#7C3AED", bg: "#EDE9FE", text: "يمكنك الرجوع للسؤال السابق وتغيير إجابتك" },
  { icon: "skip-forward",   color: "#0891B2", bg: "#CFFAFE", text: "يمكنك تخطي السؤال وسيعود في نهاية الاختبار تلقائياً" },
];

export function render(container, ctx) {
  container.innerHTML = "";
  const el = document.createElement("div");
  el.style.cssText = "min-height:100dvh;display:flex;flex-direction:column;background:#F3F6FF;";

  const body = document.createElement("div");
  body.style.cssText = "flex:1 1 0;min-height:0;overflow-y:auto;padding:16px 14px;";
  el.appendChild(body);

  // Info card
  const infoCard = document.createElement("div");
  infoCard.style.cssText = "background:#fff;border-radius:16px;padding:16px 18px;border:1.5px solid #E5E7EB;margin-bottom:14px;display:flex;align-items:center;gap:14px;";
  infoCard.innerHTML = `
    <div style="width:44px;height:44px;border-radius:12px;flex-shrink:0;background:#DC2626;color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;">
      <i class="ph ph-exam"></i>
    </div>
    <div>
      <div style="font-size:15px;font-weight:800;color:#111827;">الامتحان النظري</div>
      <div style="font-size:12px;color:#6B7280;margin-top:2px;">60 سؤال من جميع الأقسام بشكل عشوائي — 60 دقيقة — 51 إجابة للنجاح</div>
    </div>
  `;
  body.appendChild(infoCard);

  // Official notice
  const notice = document.createElement("div");
  notice.style.cssText = "background:#fff;border-radius:14px;border:1.5px solid #DBEAFE;padding:12px 14px;margin-bottom:14px;display:flex;align-items:center;gap:10px;";
  notice.innerHTML = `
    <div style="width:32px;height:32px;border-radius:10px;flex-shrink:0;background:#DBEAFE;color:#2563EB;display:flex;align-items:center;justify-content:center;font-size:16px;">
      <i class="ph ph-seal-check"></i>
    </div>
    <div style="font-size:12px;color:#475569;line-height:1.6;">هذا الاختبار يُطابق آلية الفحص النظري المعتمدة في دائرة الترخيص الأردنية</div>
  `;
  body.appendChild(notice);

  // Rules list
  const rulesHeader = document.createElement("div");
  rulesHeader.style.cssText = "font-size:14px;font-weight:900;color:#374151;margin-bottom:10px;padding-right:4px;";
  rulesHeader.textContent = "قواعد الاختبار:";
  body.appendChild(rulesHeader);

  const rulesGrid = document.createElement("div");
  rulesGrid.style.cssText = "display:flex;flex-direction:column;gap:9px;margin-bottom:16px;";
  rules.forEach(r => {
    const rEl = document.createElement("div");
    rEl.style.cssText = "background:#fff;border-radius:14px;border:1.5px solid #E5E7EB;padding:12px 14px;display:flex;align-items:center;gap:12px;";
    rEl.innerHTML = `
      <div style="width:40px;height:40px;border-radius:12px;flex-shrink:0;background:${r.bg};color:${r.color};display:flex;align-items:center;justify-content:center;font-size:20px;">
        <i class="ph ph-${r.icon}"></i>
      </div>
      <p style="font-size:13px;color:#374151;line-height:1.6;margin:0;">${r.text}</p>
    `;
    rulesGrid.appendChild(rEl);
  });
  body.appendChild(rulesGrid);

  // Warning
  const warning = document.createElement("div");
  warning.style.cssText = "background:#FFFBEB;border:1.5px solid #FDE68A;border-radius:14px;padding:12px 14px;margin-bottom:16px;display:flex;align-items:flex-start;gap:10px;";
  warning.innerHTML = `
    <i class="ph ph-warning" style="font-size:20px;color:#D97706;flex-shrink:0;margin-top:1px;"></i>
    <p style="font-size:13px;color:#92400E;line-height:1.7;margin:0;">بمجرد بدء الاختبار يبدأ العد التنازلي ولا يمكن إيقافه. تأكد من جهوزيتك قبل الضغط على بدء.</p>
  `;
  body.appendChild(warning);

  // Start button
  const startBtn = document.createElement("button");
  startBtn.style.cssText = "width:100%;padding:15px;border-radius:16px;border:none;background:#246BFD;color:#fff;font-size:17px;font-weight:900;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:8px;";
  startBtn.innerHTML = `<i class="ph ph-play-circle" style="font-size:24px;"></i>بدء الاختبار`;
  startBtn.onclick = () => startExam();
  body.appendChild(startBtn);

  container.appendChild(el);
}
