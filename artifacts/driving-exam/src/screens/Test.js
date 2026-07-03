import { state, catFromId } from "../state.js";
import { handleResult } from "../app.js";

export function render(container, ctx) {
  let idx = 0;
  const cat = catFromId(ctx.params.id);
  const qs = state.testQs;
  const total = qs.length;
  const answers = new Array(total).fill(null);

  function update() {
    const q = qs[idx];
    const pct = Math.round(((idx + 1) / total) * 100);
    const answeredCount = answers.filter(a => a !== null).length;
    const isAnswered = answers[idx] !== null;

    container.innerHTML = "";
    const el = document.createElement("div");
    el.style.cssText = "display:flex;flex-direction:column;min-height:100dvh;";

    // Header
    const header = document.createElement("div");
    header.style.cssText = "padding:12px 16px;background:#fff;border-bottom:1px solid #E5E7EB;";
    header.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <div style="flex:1;min-width:0;">
          <div style="font-size:14px;font-weight:800;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${cat}</div>
          <div style="font-size:12px;color:#6B7280;">أُجيب: ${answeredCount} / ${total}</div>
        </div>
        <div style="font-size:13px;font-weight:700;color:#6B7280;background:#F3F6FF;padding:4px 10px;border-radius:20px;flex-shrink:0;">
          ${idx + 1} / ${total}
        </div>
      </div>
      <div style="height:6px;background:#E5E7EB;border-radius:99px;overflow:hidden;">
        <div style="height:100%;background:#246BFD;border-radius:99px;width:${pct}%;transition:width 0.3s ease;"></div>
      </div>
    `;
    el.appendChild(header);

    // Body
    const body = document.createElement("div");
    body.className = "screen-body";
    body.style.cssText = "padding:16px;flex:1;";
    el.appendChild(body);

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
    optionsGrid.style.cssText = "display:flex;flex-direction:column;gap:10px;";
    q.options.forEach((opt, i) => {
      const sel = answers[idx] === i;
      const isCorrectOpt = i === q.correctAnswer;

      let bg = "#fff";
      let border = "#E5E7EB";
      let circleBg = "#F3F4F6";
      let circleColor = "#9CA3AF";
      let icon = null;

      if (isAnswered) {
        if (isCorrectOpt) {
          bg = "#ECFDF3"; border = "#16A34A"; circleBg = "#16A34A"; circleColor = "#fff"; icon = "ph-check";
        } else if (sel) {
          bg = "#FEF2F2"; border = "#DC2626"; circleBg = "#DC2626"; circleColor = "#fff"; icon = "ph-x";
        }
      } else if (sel) {
        bg = "#EEF4FF"; border = "#246BFD"; circleBg = "#246BFD"; circleColor = "#fff"; icon = "ph-check";
      }

      const btn = document.createElement("button");
      btn.disabled = isAnswered;
      btn.style.cssText = `display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:13px;width:100%;text-align:right;background:${bg};border:1.5px solid ${border};cursor:${isAnswered ? "default" : "pointer"};font-family:inherit;transition:border-color 0.15s, background 0.15s;`;
      btn.innerHTML = `
        <div style="width:28px;height:28px;border-radius:50%;flex-shrink:0;background:${circleBg};color:${circleColor};display:flex;align-items:center;justify-content:center;font-size:${icon ? "14px" : "12px"};font-weight:800;transition:background 0.15s;">
          ${icon ? `<i class="ph ${icon}" style="font-size:14px;"></i>` : String.fromCharCode(0x0041 + i)}
        </div>
        <span style="font-size:14px;font-weight:${(sel || (isAnswered && isCorrectOpt)) ? "700" : "500"};color:#374151;">${opt}</span>
      `;
      btn.onclick = () => {
        if (answers[idx] === null) {
          answers[idx] = i;
          update();
        }
      };
      optionsGrid.appendChild(btn);
    });
    body.appendChild(optionsGrid);

    // Nav footer
    const navFooter = document.createElement("div");
    navFooter.style.cssText = "padding:12px 16px;border-top:1px solid #E5E7EB;display:flex;gap:10px;background:#fff;";
    
    const nextBtn = document.createElement("button");
    nextBtn.disabled = !isAnswered;
    nextBtn.style.cssText = `flex:1;height:48px;border-radius:13px;border:none;background:${isAnswered ? (idx < total - 1 ? "#246BFD" : "#16A34A") : "#E5E7EB"};color:${isAnswered ? "#fff" : "#9CA3AF"};font-size:15px;font-weight:700;cursor:${isAnswered ? "pointer" : "not-allowed"};font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;`;
    
    if (idx < total - 1) {
      nextBtn.innerHTML = `التالي <i class="ph ph-arrow-left" style="font-size:18px;"></i>`;
      nextBtn.onclick = () => { idx++; update(); };
    } else {
      nextBtn.innerHTML = `<i class="ph ph-flag-checkered" style="font-size:18px;"></i>إنهاء الاختبار`;
      nextBtn.onclick = () => {
        let ok = 0;
        qs.forEach((q, i) => {
          if (answers[i] === q.correctAnswer) ok++;
        });
        handleResult(ok, total);
      };
    }
    navFooter.appendChild(nextBtn);
    el.appendChild(navFooter);

    container.appendChild(el);
  }

  update();
}
