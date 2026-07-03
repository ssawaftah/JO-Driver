import { state } from "../state.js";
import { openExam, openCategories, openCenters } from "../app.js";
import { db } from "../lib/firebase.js";

const cards = [
  {
    icon: "pencil-line",
    color: "#16A34A",
    bg: "#DCFCE7",
    title: "الامتحان النظري",
    desc: "محاكاة واقعية لاختبار القيادة",
    badge: null,
    action: "onExam",
  },
  {
    icon: "book-open",
    color: "#2563EB",
    bg: "#DBEAFE",
    title: "دراسة الأسئلة",
    desc: "مراجعة الأسئلة حسب الأقسام",
    badge: null,
    action: "onStudy",
  },
  {
    icon: "map-pin",
    color: "#D97706",
    bg: "#FEF3C7",
    title: "مراكز تدريب القيادة",
    desc: "ابحث عن أقرب مركز تدريب معتمد",
    badge: null,
    action: "onCenters",
  },
  {
    icon: "book-open-text",
    color: "#7C3AED",
    bg: "#EDE9FE",
    title: "دليل الطالب",
    desc: "خطوات، وثائق، رسوم، شروط وأسئلة شائعة",
    badge: null,
    action: "onGuide",
  },
];

const extraCards = [
  {
    icon: "star",
    color: "#F59E0B",
    bg: "#FEF3C7",
    title: "سجل الزوار",
    desc: "قيّم تجربتك واطلاع رأيك",
    action: "onReviews",
  },
];

export function render(container, ctx) {
  const name = state.userName;
  const hour = new Date().getHours();
  const greet =
    hour < 12 ? "صباح الخير" : hour < 18 ? "مساء الخير" : "مساء النور";

  const actions = {
    onExam: () => openExam(),
    onStudy: () => openCategories(),
    onCenters: () => openCenters(),
    onGuide: () => ctx.navigate("/guide"),
    onReviews: () => ctx.navigate("/reviews"),
  };

  container.innerHTML = "";
  const el = document.createElement("div");
  el.style.cssText =
    "display:flex;flex-direction:column;min-height:100dvh;background:#F3F6FF;";

  const content = document.createElement("div");
  content.style.cssText = "padding:20px 16px;flex:1;";
  el.appendChild(content);

  // Greeting
  const greeting = document.createElement("div");
  greeting.style.cssText =
    "background:linear-gradient(135deg, #246BFD 0%, #4f86ff 100%);border-radius:20px;padding:20px;marginBottom:20px;color:#fff;display:flex;align-items:center;justify-content:space-between;";
  greeting.innerHTML = `
    <div>
      <p style="font-size:13px;opacity:0.85;margin-bottom:4px;">${greet}،</p>
      <h1 style="font-size:20px;font-weight:900;margin:0;">${name || "مرحباً بك!"}</h1>
      <p style="font-size:13px;opacity:0.8;margin-top:4px;">جاهز لامتحان القيادة النظري في الأردن؟</p>
    </div>
    <div style="font-size:48px;opacity:0.25;">
      <i class="ph ph-student"></i>
    </div>
  `;
  content.appendChild(greeting);

  // Cards container
  const cardsGrid = document.createElement("div");
  cardsGrid.style.cssText = "display:flex;flex-direction:column;gap:12px;";
  content.appendChild(cardsGrid);

  const allCards = [...cards, ...extraCards];
  allCards.forEach((c) => {
    const btn = document.createElement("button");
    btn.style.cssText =
      "background:#fff;border:1.5px solid #E5E7EB;border-radius:16px;padding:16px;display:flex;align-items:center;gap:14px;cursor:pointer;font-family:inherit;text-align:right;width:100%;transition:border-color 0.15s;";

    const iconColor = c.action === "onReviews" ? "#F59E0B" : c.color;

    btn.innerHTML = `
      <div style="width:52px;height:52px;border-radius:16px;flex-shrink:0;background:${c.bg};color:${c.color};display:flex;align-items:center;justify-content:center;font-size:26px;">
        <i class="ph ph-${c.icon}"></i>
      </div>
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <span style="font-size:16px;font-weight:800;color:#111827;">${c.title}</span>
          ${c.badge ? `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:#FEF3C7;color:#92400E;">${c.badge}</span>` : ""}
        </div>
        <p style="font-size:13px;color:#6B7280;margin:0;">${c.desc}</p>
      </div>
      <i class="ph ph-caret-left" style="font-size:18px;color:#D1D5DB;flex-shrink:0;"></i>
    `;

    btn.addEventListener("mouseenter", () => {
      btn.style.borderColor = iconColor;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.borderColor = "#E5E7EB";
    });
    btn.addEventListener("click", actions[c.action]);
    cardsGrid.appendChild(btn);
  });

  container.appendChild(el);
}
