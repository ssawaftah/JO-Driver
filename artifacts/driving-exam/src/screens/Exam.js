import { state } from "../state.js";
import { handleExamFinish } from "../app.js";
import { render as renderRules } from "./ExamRules.js";

const EXAM_TOTAL = 60;
const EXAM_MINS = 60;
const MAX_WRONG = 9;

function pad(n) { return String(n).padStart(2, "0"); }

export function render(container, ctx) {
  if (state.examQs.length === 0) {
    return renderRules(container, ctx);
  }

  const queue = [...state.examQs].sort(() => Math.random() - 0.5).slice(0, EXAM_TOTAL);
  const answers = new Array(EXAM_TOTAL).fill(null);
  let currentIdx = 0;
  let selected = null;
  let secsLeft = EXAM_MINS * 60;
  let wrongCount = 0;
  let answeredCount = 0;
  let timerId = null;

  function finish(forcedAnswers) {
    if (timerId) clearInterval(timerId);
    const ans = forcedAnswers || answers;
    let ok = 0, wr = 0, sk = 0;
    queue.forEach((q, i) => {
      const a = ans[i];
      if (a === null) sk++;
      else if (a === q.correctAnswer) ok++;
      else wr++;
    });
    handleExamFinish(ok, wr, queue.length, sk);
  }

  timerId = setInterval(() => {
    secsLeft--;
    if (secsLeft <= 0) {
      finish();
    } else {
      updateUI();
    }
  }, 1000);

  function updateUI() {
    const q = queue[currentIdx];
    const totalAnswered = answers.filter(a => a !== null).length;
    const mins = Math.floor(secsLeft / 60);
    const secs = secsLeft % 60;
    const timerWarning = secsLeft < 300;
    const qNum = currentIdx + 1;
    const isLast = currentIdx >= queue.length - 1;

    container.innerHTML = "";
    const el = document.createElement("div");
    el.style.cssText = "min-height:100dvh;display:flex;flex-direction:column;background:#fff;";

    // Status Bar
    const status = document.createElement("div");
    status.style.cssText = "flex-shrink:0;background:#fff;border-bottom:1.5px solid #F3F4F6;";
    status.innerHTML = `
      <div style="padding:10px 14px;display:flex;align-items:center;gap:10px;">
        <div style="display:flex;align-items:center;gap:6px;background:${timerWarning ? "#FEE2E2" : "#F3F6FF"};border-radius:12px;padding:7px 12px;flex-shrink:0;">
          <i class="ph ph-clock" style="font-size:16px;color:${timerWarning ? "#DC2626" : "#246BFD"};"></i>
          <span style="font-weight:900;font-size:16px;color:${timerWarning ? "#DC2626" : "#111827"};font-variant-numeric:tabular-nums;">${pad(mins)}:${pad(secs)}</span>
        </div>
        <div style="flex:1;text-align:center;">
          <span style="font-size:14px;font-weight:900;color:#111827;">${qNum} / ${queue.length}</span>
        </div>
        <div style="display:flex;align-items:center;gap:5px;background:${wrongCount >= 7 ? "#FEE2E2" : "#F9FAFB"};border-radius:12px;padding:7px 12px;flex-shrink:0;">
          <i class="ph ph-x-circle" style="font-size:16px;color:${wrongCount >= 7 ? "#DC2626" : "#9CA3AF"};"></i>
          <span style="font-weight:900;font-size:15px;color:${wrongCount >= 7 ? "#DC2626" : "#374151"};">${wrongCount}/${MAX_WRONG + 1}</span>
        </div>
      </div>
      <div style="height:5px;background:#F3F4F6;">
        <div style="height:100%;width:${(totalAnswered / EXAM_TOTAL) * 100}%;background:${wrongCount >= 7 ? "#DC2626" : "#246BFD"};transition:width 0.3s ease;"></div>
      </div>
    `;
    el.appendChild(status);

    // Body
    const body = document.createElement("div");
    body.style.cssText = "flex:1 1 0;min-height:0;overflow-y:auto;padding:14px;";
    el.appendChild(body);

    // Media
    if (q.mediaUrl && q.mediaType !== "text") {
      const mediaWrap = document.createElement("div");
      mediaWrap.style.cssText = "border-radius:14px;overflow:hidden;margin-bottom:12px;border:1px solid #E5E7EB;background:#fff;height:240px;display:flex;align-items:center;justify-content:center;";
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
    questionBox.style.cssText = "background:#F3F6FF;border-radius:14px;padding:14px 16px;margin-bottom:14px;font-size:16px;font-weight:700;color:#111827;line-height:1.75;";
    questionBox.textContent = q.question;
    body.appendChild(questionBox);

    // Options
    const optionsGrid = document.createElement("div");
    optionsGrid.style.cssText = "display:flex;flex-direction:column;gap:10px;";
    q.options.forEach((opt, i) => {
      const sel = selected === i;
      const btn = document.createElement("button");
      btn.style.cssText = `display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:14px;width:100%;text-align:right;background:${sel ? "#EEF4FF" : "#fff"};border:1.5px solid ${sel ? "#246BFD" : "#E5E7EB"};cursor:pointer;font-family:inherit;`;
      btn.innerHTML = `
        <div style="width:30px;height:30px;border-radius:50%;flex-shrink:0;background:${sel ? "#246BFD" : "#F3F4F6"};color:${sel ? "#fff" : "#9CA3AF"};display:flex;align-items:center;justify-content:center;font-size:${sel ? "14px" : "13px"};font-weight:800;">
          ${sel ? '<i class="ph ph-check" style="font-size:15px;"></i>' : String.fromCharCode(0x0041 + i)}
        </div>
        <span style="font-size:14px;font-weight:${sel ? "700" : "500"};color:#374151;">${opt}</span>
      `;
      btn.onclick = () => { selected = i; updateUI(); };
      optionsGrid.appendChild(btn);
    });
    body.appendChild(optionsGrid);

    // Footer Nav
    const footer = document.createElement("div");
    footer.style.cssText = "flex-shrink:0;padding:10px 14px 14px;border-top:1.5px solid #F3F4F6;background:#fff;display:flex;gap:8px;";
    
    const skipBtn = document.createElement("button");
    skipBtn.style.cssText = "width:46px;height:46px;border-radius:13px;flex-shrink:0;border:1.5px solid #E5E7EB;background:#F9FAFB;display:flex;align-items:center;justify-content:center;cursor:pointer;";
    skipBtn.innerHTML = `<i class="ph ph-skip-forward" style="font-size:20px;color:#6B7280;"></i>`;
    skipBtn.onclick = () => {
      const skipped = queue.splice(currentIdx, 1)[0];
      queue.push(skipped);
      const skippedAns = answers.splice(currentIdx, 1)[0];
      answers.push(skippedAns);
      selected = null;
      if (currentIdx >= queue.length) finish(); else updateUI();
    };
    footer.appendChild(skipBtn);

    const confirmBtn = document.createElement("button");
    confirmBtn.disabled = selected === null;
    confirmBtn.style.cssText = `flex:1;height:46px;border-radius:13px;border:none;background:${selected === null ? "#E5E7EB" : isLast ? "#16A34A" : "#246BFD"};color:${selected === null ? "#9CA3AF" : "#fff"};font-size:15px;font-weight:800;cursor:${selected === null ? "not-allowed" : "pointer"};font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;`;
    confirmBtn.innerHTML = `<i class="ph ph-${isLast ? "flag-checkered" : "arrow-left"}" style="font-size:20px;"></i>${isLast ? "إنهاء الاختبار" : "تأكيد والتالي"}`;
    confirmBtn.onclick = () => {
      if (selected === null) return;
      const isWrong = selected !== q.correctAnswer;
      answers[currentIdx] = selected;
      if (isWrong) wrongCount++;
      answeredCount++;
      selected = null;
      if (wrongCount > MAX_WRONG || isLast) finish(); else { currentIdx++; updateUI(); }
    };
    footer.appendChild(confirmBtn);
    el.appendChild(footer);

    container.appendChild(el);
  }

  updateUI();

  return () => {
    if (timerId) clearInterval(timerId);
  };
}
