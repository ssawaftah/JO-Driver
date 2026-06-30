import { useState, useEffect, useRef, useCallback } from "react";
import type { Question } from "../types";

interface Props {
  allQuestions: Question[];
  onFinish: (ok: number, wrong: number, total: number, skipped: number) => void;
  onBack: () => void;
}

const EXAM_TOTAL   = 60;
const EXAM_MINS    = 60;
const MAX_WRONG    = 9;   // >9 wrong = instant fail

function pad(n: number) { return String(n).padStart(2, "0"); }

export default function Exam({ allQuestions, onFinish, onBack }: Props) {
  // Build shuffled queue of 60 questions
  const [queue, setQueue] = useState<Question[]>(() => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, EXAM_TOTAL);
  });

  // History stack for answered indices (to enable back navigation)
  const [history, setHistory] = useState<number[]>([]);          // stack of queue indices already answered
  const [answers, setAnswers] = useState<(number | null)[]>(() => new Array(EXAM_TOTAL).fill(null));
  const [currentIdx, setCurrentIdx] = useState(0);               // index into queue
  const [selected, setSelected] = useState<number | null>(null);
  const [secsLeft, setSecsLeft] = useState(EXAM_MINS * 60);
  const [wrongCount, setWrongCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Compute finish ─────────────────────────────────────────
  const finish = useCallback((forcedAnswers?: (number | null)[]) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const ans = forcedAnswers ?? answers;
    let ok = 0, wr = 0, sk = 0;
    queue.forEach((q, i) => {
      const a = ans[i];
      if (a === null) sk++;
      else if (a === q.correctAnswer) ok++;
      else wr++;
    });
    onFinish(ok, wr, queue.length, sk);
  }, [answers, queue, onFinish]);

  // ── Timer ──────────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecsLeft(s => {
        if (s <= 1) { finish(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [finish]);

  const mins = Math.floor(secsLeft / 60);
  const secs = secsLeft % 60;
  const timerWarning = secsLeft < 300; // last 5 mins

  // ── Current question ───────────────────────────────────────
  const q = queue[currentIdx];
  const totalAnswered = answers.filter(a => a !== null).length;

  // ── Confirm answer ────────────────────────────────────────
  function confirmAnswer() {
    if (selected === null) return;

    const isWrong = selected !== q.correctAnswer;
    const newAnswers = [...answers];
    newAnswers[currentIdx] = selected;

    const newWrong = wrongCount + (isWrong ? 1 : 0);
    const newAnswered = answeredCount + 1;

    setAnswers(newAnswers);
    setWrongCount(newWrong);
    setAnsweredCount(newAnswered);
    setSelected(null);

    // Instant fail
    if (newWrong > MAX_WRONG) {
      finish(newAnswers);
      return;
    }

    // If this was the last question, finish
    if (currentIdx >= queue.length - 1) {
      finish(newAnswers);
      return;
    }

    setHistory(h => [...h, currentIdx]);
    setCurrentIdx(i => i + 1);
  }

  // ── Skip question → push to end ───────────────────────────
  function skipQuestion() {
    const newQueue = [...queue];
    const skipped = newQueue.splice(currentIdx, 1)[0];
    newQueue.push(skipped);

    const newAnswers = [...answers];
    newAnswers.splice(currentIdx, 1);
    newAnswers.push(null);

    setQueue(newQueue);
    setAnswers(newAnswers);
    setSelected(null);

    // Don't push to history when skipping
    if (currentIdx >= newQueue.length) {
      // edge case: all remaining skipped
      finish(newAnswers);
    }
  }

  // ── Go back ───────────────────────────────────────────────
  function goBack() {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setCurrentIdx(prev);
    setSelected(answers[prev] ?? null);
  }

  const canBack = history.length > 0;
  const isLast = currentIdx >= queue.length - 1;
  const qNum = currentIdx + 1;

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: "#fff" }}>

      {/* ── Status bar ─────────────────────────────────────── */}
      <div style={{ flexShrink: 0, background: "#fff", borderBottom: "1.5px solid #F3F4F6" }}>

        {/* Top row */}
        <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>

          {/* Timer */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: timerWarning ? "#FEE2E2" : "#F3F6FF",
            borderRadius: 12, padding: "7px 12px", flexShrink: 0,
          }}>
            <i className="ph ph-clock" style={{ fontSize: 16, color: timerWarning ? "#DC2626" : "#246BFD" }} />
            <span style={{
              fontWeight: 900, fontSize: 16,
              color: timerWarning ? "#DC2626" : "#111827",
              fontVariantNumeric: "tabular-nums",
            }}>
              {pad(mins)}:{pad(secs)}
            </span>
          </div>

          {/* Question counter */}
          <div style={{ flex: 1, textAlign: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 900, color: "#111827" }}>
              {qNum} / {queue.length}
            </span>
          </div>

          {/* Wrong counter */}
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            background: wrongCount >= 7 ? "#FEE2E2" : "#F9FAFB",
            borderRadius: 12, padding: "7px 12px", flexShrink: 0,
          }}>
            <i className="ph ph-x-circle" style={{ fontSize: 16, color: wrongCount >= 7 ? "#DC2626" : "#9CA3AF" }} />
            <span style={{
              fontWeight: 900, fontSize: 15,
              color: wrongCount >= 7 ? "#DC2626" : "#374151",
            }}>
              {wrongCount}/{MAX_WRONG + 1}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 5, background: "#F3F4F6" }}>
          <div style={{
            height: "100%",
            width: `${(totalAnswered / EXAM_TOTAL) * 100}%`,
            background: wrongCount >= 7 ? "#DC2626" : "#246BFD",
            transition: "width 0.3s ease",
          }} />
        </div>
      </div>

      {/* ── Question body ───────────────────────────────────── */}
      <div style={{ flex: "1 1 0", minHeight: 0, overflowY: "auto", padding: "14px" }}>

        {/* Media */}
        {q.mediaUrl && q.mediaType !== "text" && (
          <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 12, border: "1px solid #E5E7EB", maxHeight: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {q.mediaType === "video"
              ? <video controls src={q.mediaUrl} preload="auto" style={{ width: "100%", maxHeight: 240, display: "block" }} />
              : <img src={q.mediaUrl} alt="" loading="eager" style={{ width: "100%", maxHeight: 240, display: "block", objectFit: "contain" }} />
            }
          </div>
        )}

        {/* Question text */}
        <div style={{
          background: "#F3F6FF", borderRadius: 14,
          padding: "14px 16px", marginBottom: 14,
          fontSize: 16, fontWeight: 700, color: "#111827", lineHeight: 1.75,
        }}>
          {q.question}
        </div>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.options.map((opt, i) => {
            const sel = selected === i;
            return (
              <button
                key={i}
                onClick={() => setSelected(i)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "13px 14px", borderRadius: 14, width: "100%", textAlign: "right",
                  background: sel ? "#EEF4FF" : "#fff",
                  border: `1.5px solid ${sel ? "#246BFD" : "#E5E7EB"}`,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                  background: sel ? "#246BFD" : "#F3F4F6",
                  color: sel ? "#fff" : "#9CA3AF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: sel ? 14 : 13, fontWeight: 800,
                }}>
                  {sel
                    ? <i className="ph ph-check" style={{ fontSize: 15 }} />
                    : String.fromCharCode(0x0041 + i)}
                </div>
                <span style={{ fontSize: 14, fontWeight: sel ? 700 : 500, color: "#374151" }}>
                  {opt}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Navigation bar ──────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        padding: "10px 14px 14px",
        borderTop: "1.5px solid #F3F4F6",
        background: "#fff",
        display: "flex", gap: 8,
      }}>
        {/* Back */}
        <button
          onClick={goBack}
          disabled={!canBack}
          title="رجوع"
          style={{
            width: 46, height: 46, borderRadius: 13, flexShrink: 0,
            border: "1.5px solid #E5E7EB", background: "#F9FAFB",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: canBack ? "pointer" : "not-allowed",
            opacity: canBack ? 1 : 0.35,
          }}
        >
          <i className="ph ph-arrow-right" style={{ fontSize: 20, color: "#246BFD" }} />
        </button>

        {/* Skip */}
        <button
          onClick={skipQuestion}
          title="تخطي"
          style={{
            width: 46, height: 46, borderRadius: 13, flexShrink: 0,
            border: "1.5px solid #E5E7EB", background: "#F9FAFB",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <i className="ph ph-skip-forward" style={{ fontSize: 20, color: "#6B7280" }} />
        </button>

        {/* Confirm / Finish */}
        <button
          onClick={confirmAnswer}
          disabled={selected === null}
          style={{
            flex: 1, height: 46, borderRadius: 13, border: "none",
            background: selected === null ? "#E5E7EB" : isLast ? "#16A34A" : "#246BFD",
            color: selected === null ? "#9CA3AF" : "#fff",
            fontSize: 15, fontWeight: 800,
            cursor: selected === null ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          <i className={`ph ph-${isLast ? "flag-checkered" : "arrow-left"}`} style={{ fontSize: 20 }} />
          {isLast ? "إنهاء الاختبار" : "تأكيد والتالي"}
        </button>
      </div>
    </div>
  );
}
