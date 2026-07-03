import { state, catFromId } from "../state.js";
import { renderReviewModal } from "../components/ReviewModal.js";
import { db } from "../lib/firebase.js";
import { loadSession } from "../state.js";

export function render(container, ctx) {
  let idx = 0;
  const cat = catFromId(ctx.params.id);
  const qs = state.studyQs;
  const total = qs.length;

  function update() {
    const q = qs[idx];
    const pct = Math.round(((idx + 1) / total) * 100);

    container.innerHTML = "";
    const el = document.createElement("div");
    el.style.cssText = "display:flex;flex-direction:column;min-height:100dvh;";

    // Progress Bar Header
    const progressHeader = document.createElement("div");
    progressHeader.style.cssText = "padding:12px 16px;background:#fff;border-bottom:1px solid #E5E7EB;";
    progressHeader.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <div style="flex:1;min-width:0;">
          <div style="font-size:14px;font-weight:800;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${cat}</div>
        </div>
        <div style="font-size:13px;font-weight:700;color:#6B7280;background:#F3F6FF;padding:4px 10px;border-radius:20px;flex-shrink:0;">
          ${idx + 1} / ${total}
        </div>
      </div>
      <div style="height:6px;background:#E5E7EB;border-radius:99px;overflow:hidden;">
        <div style="height:100%;background:#246BFD;border-radius:99px;width:${pct}%;transition:width 0.3s ease;"></div>
      </div>
    `;
    el.appendChild(progressHeader);

    // Body
    const body = document.createElement("div");
    body.className = "screen-body";
    body.style.cssText = "padding:16px;flex:1;";
    el.appendChild(body);

    // Review badge
    const badge = document.createElement("div");
    badge.style.cssText = "display:inline-flex;align-items:center;gap:6px;background:#DCFCE7;color:#16A34A;border-radius:20px;padding:5px 12px;font-size:12px;font-weight:700;margin-bottom:14px;";
    badge.innerHTML = `<i class="ph ph-eye" style="font-size:14px;"></i>وضع المراجعة — الإجابة الصحيحة ظاهرة`;
    body.appendChild(badge);

    // Media
    if (q.mediaUrl && q.mediaType !== "text") {
      const mediaWrap = document.createElement("div");
      mediaWrap.style.cssText = "border-radius:14px;overflow:hidden;margin-bottom:14px;border:1px solid #E5E7EB;background:#fff;height:240px;display:flex;align-items:center;justify-content:center;";
      if (q.mediaType === "video") {
        const video = document.createElement("video");
        video.controls = true;
        video.src = q.mediaUrl;
        video.style.cssText = "width:100%;max-height:240px;display:block;object-fit:contain;";
        mediaWrap.appendChild(video);
      } else {
        const img = document.createElement("img");
        img.src = q.mediaUrl;
        img.style.cssText = "width:100%;max-height:240px;display:block;object-fit:contain;";
        mediaWrap.appendChild(img);
      }
      body.appendChild(mediaWrap);
    }

    // Question
    const questionBox = document.createElement("div");
    questionBox.style.cssText = "background:#F3F6FF;border-radius:14px;padding:14px 16px;font-size:16px;font-weight:700;color:#111827;line-height:1.75;margin-bottom:14px;";
    questionBox.textContent = q.question;
    body.appendChild(questionBox);

    // Options
    const optionsGrid = document.createElement("div");
    optionsGrid.style.cssText = "display:flex;flex-direction:column;gap:10px;margin-bottom:14px;";
    q.options.forEach((opt, i) => {
      const correct = i === q.correctAnswer;
      const optEl = document.createElement("div");
      optEl.style.cssText = `display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:13px;background:${correct ? "#DCFCE7" : "#fff"};border:1.5px solid ${correct ? "#16A34A" : "#E5E7EB"};`;
      optEl.innerHTML = `
        <div style="width:28px;height:28px;border-radius:50%;flex-shrink:0;background:${correct ? "#16A34A" : "#F3F4F6"};color:${correct ? "#fff" : "#9CA3AF"};display:flex;align-items:center;justify-content:center;font-size:${correct ? "14px" : "12px"};font-weight:800;">
          ${correct ? '<i class="ph ph-check" style="font-size:14px;"></i>' : String.fromCharCode(0x0041 + i)}
        </div>
        <span style="font-size:14px;font-weight:${correct ? "700" : "500"};color:${correct ? "#15803D" : "#374151"};">${opt}</span>
      `;
      optionsGrid.appendChild(optEl);
    });
    body.appendChild(optionsGrid);

    // Explanation
    if (q.explanation) {
      const expl = document.createElement("div");
      expl.style.cssText = "display:flex;gap:10px;background:#FEF3C7;border:1px solid #FDE68A;border-radius:13px;padding:12px 14px;margin-bottom:14px;";
      expl.innerHTML = `
        <i class="ph ph-lightbulb" style="font-size:20px;color:#D97706;flex-shrink:0;margin-top:1px;"></i>
        <p style="font-size:13px;color:#92400E;line-height:1.7;margin:0;">${q.explanation}</p>
      `;
      body.appendChild(expl);
    }

    // Nav footer
    const navFooter = document.createElement("div");
    navFooter.style.cssText = "padding:12px 16px;border-top:1px solid #E5E7EB;display:flex;gap:10px;background:#fff;";
    
    const prevBtn = document.createElement("button");
    prevBtn.disabled = idx === 0;
    prevBtn.style.cssText = `width:48px;height:48px;border-radius:13px;flex-shrink:0;border:1.5px solid #E5E7EB;background:#F9FAFB;cursor:${idx === 0 ? "not-allowed" : "pointer"};display:flex;align-items:center;justify-content:center;opacity:${idx === 0 ? "0.4" : "1"};`;
    prevBtn.innerHTML = `<i class="ph ph-arrow-right" style="font-size:20px;color:#246BFD;"></i>`;
    prevBtn.onclick = () => { idx--; update(); };
    navFooter.appendChild(prevBtn);

    const nextBtn = document.createElement("button");
    nextBtn.style.cssText = "flex:1;height:48px;border-radius:13px;border:none;background:#246BFD;color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;";
    if (idx < total - 1) {
      nextBtn.innerHTML = `التالي <i class="ph ph-arrow-left" style="font-size:18px;"></i>`;
      nextBtn.onclick = () => { idx++; update(); };
    } else {
      nextBtn.style.background = "#16A34A";
      nextBtn.innerHTML = `<i class="ph ph-check-circle" style="font-size:18px;"></i>إنهاء المراجعة`;
      nextBtn.onclick = async () => {
        const session = loadSession();
        if (session) {
          try {
            const snap = await db.ref("reviews").once("value");
            const val = snap.val() || {};
            const already = Object.values(val).some(r => r.reviewerKey === session.key);
            if (!already) {
              const modal = renderReviewModal({
                open: true,
                onClose: () => ctx.navigate("/categories"),
                context: "test",
                title: "قيّم تجربة المراجعة",
                subtitle: "كيف كانت تجربة المراجعة معنا؟"
              });
              container.appendChild(modal);
              return;
            }
          } catch {}
        }
        ctx.navigate("/categories");
      };
    }
    navFooter.appendChild(nextBtn);
    el.appendChild(navFooter);

    container.appendChild(el);
  }

  update();
}
