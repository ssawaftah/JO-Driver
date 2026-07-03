import { state } from "../state.js";
import { db } from "../lib/firebase.js";

const DEFAULT_SECTIONS = [
  {
    id: "default-steps", title: "خطوات الحصول على رخصة القيادة",
    icon: "list-numbers", iconColor: "#7C3AED", iconBg: "#EDE9FE", type: "steps", order: 1,
    items: [
      { text: "التسجيل في مدرسة سواقة معتمدة", sub: "اختر مدرسة معتمدة لدى دائرة الترخيص وسجّل باسمك برقم هويتك الوطنية." },
      { text: "إتمام الدروس النظرية والعملية", sub: "أكمل الساعات المطلوبة من الدروس النظرية والعملية مع المدرسة." },
      { text: "انتظار رسالة SMS من دائرة الترخيص", sub: "بعد إدخال المدرسة بياناتك في النظام، ستصلك رسالة تأكيد خلال أيام." },
      { text: "التوجه لدائرة الترخيص", sub: "احضر مع وثائقك المطلوبة، ادفع الرسوم، وتقدم لحجز موعد الفحص النظري." },
      { text: "اجتياز الفحص النظري", sub: "60 سؤال خلال 60 دقيقة. تحتاج الإجابة على 51 سؤالاً على الأقل للنجاح." },
      { text: "اجتياز الفحص العملي واستلام الرخصة", sub: "بعد النجاح في النظري تحدد موعداً للفحص العملي، وعند النجاح تستلم رخصتك." },
    ],
  },
  {
    id: "default-docs", title: "الأوراق والوثائق المطلوبة",
    icon: "folder-open", iconColor: "#D97706", iconBg: "#FEF3C7", type: "documents", order: 2,
    items: [
      { text: "بطاقة هوية وطنية سارية المفعول", sub: "للأردنيين — جواز سفر ساري للمقيمين", icon: "identification-card" },
      { text: "دفتر خدمة العلم أو وثيقة الإعفاء", sub: "للذكور دون سن الأربعين", icon: "book-open" },
      { text: "صورتان شخصيتان", sub: "خلفية بيضاء، حديثتان", icon: "image-square" },
      { text: "شهادة اللياقة الطبية", sub: "تُستخرج من أي مركز صحي معتمد", icon: "heart-pulse" },
      { text: "إيصال دفع رسوم التقديم", sub: "يُدفع في الدائرة أو عبر منظومة موحد", icon: "receipt" },
    ],
  },
  {
    id: "default-fees", title: "الرسوم التقريبية",
    icon: "currency-circle-dollar", iconColor: "#16A34A", iconBg: "#DCFCE7", type: "fees", order: 3,
    items: [
      { text: "رسوم تسجيل طلب التقديم", amount: "3 د.أ", note: "تُدفع لدى دائرة الترخيص" },
      { text: "رسوم الفحص النظري", amount: "10 د.أ", note: "في حال الرسوب تُعاد الرسوم" },
      { text: "رسوم الفحص العملي", amount: "20 د.أ", note: "لكل محاولة" },
      { text: "رسوم استخراج الرخصة", amount: "30 د.أ", note: "عند النجاح في الفحصين" },
    ],
  },
  {
    id: "default-conditions", title: "شروط التقديم",
    icon: "user-check", iconColor: "#0891B2", iconBg: "#CFFAFE", type: "conditions", order: 4,
    items: [
      { text: "الحد الأدنى للعمر: 18 سنة", icon: "calendar-blank" },
      { text: "اجتياز فحص النظر في المركز الصحي", icon: "eye" },
      { text: "لا يوجد سجل جنائي يمنع استخراج الرخصة", icon: "shield-check" },
      { text: "إكمال الدروس المقررة في المدرسة المسجّل بها", icon: "graduation-cap" },
    ],
  },
  {
    id: "default-faq", title: "أسئلة شائعة",
    icon: "chat-circle-question", iconColor: "#246BFD", iconBg: "#EEF4FF", type: "faq", order: 5,
    items: [
      { text: "ماذا لو رسبت في الامتحان النظري؟", answer: "يمكنك إعادة التقديم بعد 24 ساعة، وتُسدَّد رسوم جديدة لكل محاولة." },
      { text: "هل يمكن تقديم الامتحان بدون رسالة SMS؟", answer: "لا. الرسالة شرط إلزامي، وهي تؤكد أن المدرسة سجّلت إتمام دروسك في نظام دائرة الترخيص." },
      { text: "كم عدد المحاولات المسموحة في الفحص النظري؟", answer: "لا يوجد حد أقصى للمحاولات، غير أن كل محاولة تحتاج رسوماً جديدة." },
      { text: "هل يختلف الامتحان بين المحافظات؟", answer: "الاختبار موحَّد ورقمي في جميع فروع دائرة الترخيص في المملكة." },
      { text: "هل تُقبل الهوية منتهية الصلاحية؟", answer: "لا. يجب أن تكون الهوية الوطنية سارية المفعول يوم التقديم." },
    ],
  },
];

export function render(container, ctx) {
  let sections = state.guideSections;
  let loading = !sections;
  const openStates = {};

  function update() {
    container.innerHTML = "";
    const el = document.createElement("div");
    el.style.cssText = "min-height:100dvh;display:flex;flex-direction:column;background:#F9FAFB;direction:rtl;";

    const body = document.createElement("div");
    body.style.cssText = "flex:1 1 0;min-height:0;overflow-y:auto;padding:14px 14px;";
    el.appendChild(body);

    if (loading) {
      const l = document.createElement("div");
      l.style.cssText = "text-align:center;padding:40px;color:#9CA3AF;font-size:13px;";
      l.textContent = "جارٍ التحميل...";
      body.appendChild(l);
    } else if (!sections || sections.length === 0) {
      const empty = document.createElement("div");
      empty.style.cssText = "text-align:center;padding:40px;color:#9CA3AF;font-size:13px;";
      empty.textContent = "لا توجد أقسام";
      body.appendChild(empty);
    } else {
      const content = document.createElement("div");
      content.style.cssText = "display:flex;flex-direction:column;gap:10px;";
      
      // Page info
      const info = document.createElement("div");
      info.style.cssText = "background:#fff;border-radius:16px;padding:16px 18px;border:1.5px solid #E5E7EB;margin-bottom:4px;display:flex;align-items:center;gap:14px;";
      info.innerHTML = `
        <div style="width:44px;height:44px;border-radius:12px;flex-shrink:0;background:#0891B2;color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;">
          <i class="ph ph-compass"></i>
        </div>
        <div>
          <div style="font-size:15px;font-weight:800;color:#111827;">دليل الطالب</div>
          <div style="font-size:12px;color:#6B7280;margin-top:2px;">خطوات، أوراق، رسوم، شروط، وإجابات على أسئلتك</div>
        </div>
      `;
      content.appendChild(info);

      // SMS box
      const sms = document.createElement("div");
      sms.style.cssText = "background:linear-gradient(135deg, #246BFD 0%, #4f86ff 100%);border-radius:18px;padding:16px;color:#fff;text-align:right;";
      sms.innerHTML = `
        <div style="display:flex;flex-direction:row;align-items:center;gap:12px;margin-bottom:10px;">
          <div style="width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;"><i class="ph ph-device-mobile-speaker"></i></div>
          <div style="flex:1;font-size:14px;font-weight:900;">متى تذهب لدائرة الترخيص؟</div>
        </div>
        <div style="font-size:12px;line-height:1.7;opacity:0.92;margin-bottom:8px;">انتظر رسالة SMS على هاتفك تحمل النص:</div>
        <div style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);border-radius:10px;padding:10px 12px;font-size:12px;font-weight:700;line-height:1.8;">"تم استكمال دروس النظري والعملي المطلوبة للتقدم للفحص لدى الترخيص"</div>
        <div style="font-size:12px;opacity:0.85;margin-top:8px;line-height:1.6;">عند وصول هذه الرسالة فقط يمكنك التوجه لأقرب دائرة ترخيص وتقديم طلبك.</div>
      `;
      content.appendChild(sms);

      sections.forEach(s => {
        const acc = document.createElement("div");
        acc.style.cssText = "background:#fff;border-radius:16px;border:1.5px solid #F0F1F3;overflow:hidden;";
        
        const open = !!openStates[s.id];
        
        const head = document.createElement("button");
        head.style.cssText = "width:100%;padding:14px 16px;display:flex;flex-direction:row;align-items:center;gap:12px;background:none;border:none;cursor:pointer;font-family:inherit;";
        head.innerHTML = `
          <div style="width:38px;height:38px;border-radius:11px;flex-shrink:0;background:${s.iconBg};color:${s.iconColor};display:flex;align-items:center;justify-content:center;font-size:19px;"><i class="ph ph-${s.icon}"></i></div>
          <span style="flex:1;font-size:14px;font-weight:800;color:#111827;text-align:right;display:block;">${s.title}</span>
          <i class="ph ph-caret-${open ? "up" : "down"}" style="font-size:15px;color:#9CA3AF;flex-shrink:0;"></i>
        `;
        head.onclick = () => { openStates[s.id] = !open; update(); };
        acc.appendChild(head);

        if (open) {
          const inner = document.createElement("div");
          inner.style.cssText = "padding:4px 16px 14px;";
          const sep = document.createElement("div");
          sep.style.cssText = "border-top:1px solid #F3F4F6;padding-top:10px;";
          
          if (s.type === "steps") {
            s.items.forEach((it, i) => {
              const step = document.createElement("div");
              step.style.cssText = `display:flex;flex-direction:row;gap:12px;padding-bottom:${i === s.items.length - 1 ? "0" : "14px"};`;
              step.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;">
                  <div style="width:28px;height:28px;border-radius:50%;background:#246BFD;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;">${i + 1}</div>
                  ${i < s.items.length - 1 ? '<div style="width:2px;flex:1;background:#E5E7EB;margin-top:5px;"></div>' : ""}
                </div>
                <div style="padding-top:3px;text-align:right;flex:1;">
                  <div style="font-size:13px;font-weight:800;color:#111827;margin-bottom:3px;">${it.text}</div>
                  <div style="font-size:12px;color:#6B7280;line-height:1.6;">${it.sub || ""}</div>
                </div>
              `;
              sep.appendChild(step);
            });
          } else if (s.type === "documents" || s.type === "conditions") {
            s.items.forEach(it => {
              const row = document.createElement("div");
              row.style.cssText = "display:flex;flex-direction:row;align-items:flex-start;gap:10px;padding-bottom:10px;margin-bottom:2px;border-bottom:1px solid #F9FAFB;";
              row.innerHTML = `
                <i class="ph ph-${it.icon || (s.type === "conditions" ? "check-circle" : "file-text")}" style="font-size:16px;color:#246BFD;margin-top:2px;flex-shrink:0;"></i>
                <div style="flex:1;text-align:right;">
                  <div style="font-size:13px;color:#374151;font-weight:600;line-height:1.5;">${it.text}</div>
                  ${it.sub ? `<div style="font-size:11px;color:#9CA3AF;margin-top:2px;">${it.sub}</div>` : ""}
                </div>
              `;
              sep.appendChild(row);
            });
          } else if (s.type === "fees") {
            s.items.forEach(it => {
              const row = document.createElement("div");
              row.style.cssText = "display:flex;flex-direction:row;align-items:center;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid #F9FAFB;margin-bottom:2px;";
              row.innerHTML = `
                <div style="flex:1;text-align:right;padding-left:10px;">
                  <div style="font-size:13px;font-weight:700;color:#374151;">${it.text}</div>
                  ${it.note ? `<div style="font-size:11px;color:#9CA3AF;margin-top:2px;">${it.note}</div>` : ""}
                </div>
                <span style="font-size:13px;font-weight:900;color:#246BFD;background:#EEF4FF;border-radius:10px;padding:4px 10px;flex-shrink:0;">${it.amount || ""}</span>
              `;
              sep.appendChild(row);
            });
            const warn = document.createElement("div");
            warn.style.cssText = "margin-top:8px;background:#FFFBEB;border-radius:10px;padding:9px 12px;font-size:12px;color:#92400E;display:flex;flex-direction:row;gap:8px;align-items:flex-start;text-align:right;";
            warn.innerHTML = `<i class="ph ph-warning" style="font-size:15px;flex-shrink:0;margin-top:1px;"></i><span>الرسوم قابلة للتغيير — تحقق من دائرة الترخيص قبل الذهاب.</span>`;
            sep.appendChild(warn);
          } else if (s.type === "faq") {
            s.items.forEach(it => {
              const item = document.createElement("div");
              item.style.cssText = "margin-bottom:14px;";
              item.innerHTML = `
                <div style="display:flex;flex-direction:row;align-items:flex-start;gap:8px;margin-bottom:5px;">
                  <i class="ph ph-question" style="font-size:15px;color:#246BFD;flex-shrink:0;margin-top:2px;"></i>
                  <div style="flex:1;font-size:13px;font-weight:800;color:#111827;text-align:right;">${it.text}</div>
                </div>
                <div style="font-size:12px;color:#6B7280;line-height:1.7;padding-right:23px;text-align:right;">${it.answer || ""}</div>
              `;
              sep.appendChild(item);
            });
          }

          inner.appendChild(sep);
          acc.appendChild(inner);
        }
        content.appendChild(acc);
      });

      const wa = document.createElement("a");
      wa.href = "https://wa.me/962778244772?text=";
      wa.target = "_blank";
      wa.rel = "noreferrer";
      wa.style.cssText = "display:flex;flex-direction:row;align-items:center;justify-content:center;gap:8px;padding:14px;border-radius:14px;border:1.5px solid #E5E7EB;background:#fff;font-size:13px;font-weight:700;color:#246BFD;text-decoration:none;";
      wa.innerHTML = `<i class="ph ph-whatsapp-logo" style="font-size:18px;"></i>لم تجد جواب لسؤالك ؟ تواصل معنا عبر واتساب`;
      content.appendChild(wa);
      
      body.appendChild(content);
    }

    container.appendChild(el);
  }

  if (!sections) {
    db.ref("guide/sections").once("value")
      .then(snap => {
        const val = snap.val() || {};
        let arr;
        if (Object.keys(val).length === 0) arr = DEFAULT_SECTIONS.map(s => ({ ...s }));
        else arr = Object.entries(val).map(([id, s]) => ({ id, ...s }));
        arr.sort((a, b) => (a.order || 0) - (b.order || 0));
        sections = arr;
        loading = false;
        update();
      })
      .catch(() => {
        sections = DEFAULT_SECTIONS.map(s => ({ ...s }));
        loading = false;
        update();
      });
  } else {
    update();
  }
}
