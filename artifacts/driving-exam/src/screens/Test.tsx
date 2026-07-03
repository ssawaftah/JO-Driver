import { useState } from "react";
import type { Question } from "../types";
import Header from "../components/Header";

interface Props {
  qs: Question[];
  cat: string;
  onBack: () => void;
  onFinish: (ok: number, total: number) => void;
}

export default function Test({ qs, cat, onBack, onFinish }: Props) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => new Array(qs.length).fill(null));
  const total = qs.length;
  const q = qs[idx];
  const pct = Math.round(((idx + 1) / total) * 100);
  const answered = answers.filter(a => a !== null).length;
  const isAnswered = answers[idx] !== null;

  function pick(i: number) {
    if (answers[idx] !== null) return; // locked once answered — no editing
    setAnswers(prev => {
      const next = [...prev];
      next[idx] = i;
      return next;
    });
  }

  function finish() {
    let ok = 0;
    for (let i = 0; i < qs.length; i++) {
      if (answers[i] === qs[i].correctAnswer) ok++;
    }
    onFinish(ok, total);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <Header />
      <div style={{ padding: "12px 16px", background: "#fff", borderBottom: "1px solid #E5E7EB" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cat}</div>
            <div style={{ fontSize: 12, color: "#6B7280" }}>أُجيب: {answered} / {total}</div>
          </div>
          <div style={{
            fontSize: 13, fontWeight: 700, color: "#6B7280",
            background: "#F3F6FF", padding: "4px 10px", borderRadius: 20, flexShrink: 0,
          }}>
            {idx + 1} / {total}
          </div>
        </div>
        <div style={{ height: 6, background: "#E5E7EB", borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            height: "100%", background: "#246BFD", borderRadius: 99,
            width: `${pct}%`, transition: "width 0.3s ease",
          }} />
        </div>
      </div>

      {/* Body */}
      <div className="screen-body" style={{ padding: 16, flex: 1 }}>
        {/* Media */}
        {q.mediaUrl && q.mediaType !== "text" && (
          <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 14, border: "1px solid #E5E7EB", background: "#fff", height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {q.mediaType === "video"
              ? <video controls src={q.mediaUrl} preload="auto" style={{ width: "100%", maxHeight: 240, display: "block", objectFit: "contain" }} />
              : <img src={q.mediaUrl} alt={q.question ? "صورة توضيحية: " + q.question.slice(0, 60) : "صورة توضيحية للسؤال"} loading="eager" style={{ width: "100%", maxHeight: 240, display: "block", objectFit: "contain" }} />
            }
          </div>
        )}

        {/* Question */}
        <div style={{
          background: "#F3F6FF", borderRadius: 14, padding: "14px 16px",
          fontSize: 16, fontWeight: 700, color: "#111827", lineHeight: 1.75, marginBottom: 14,
        }}>
          {q.question}
        </div>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.options.map((opt, i) => {
            const sel = answers[idx] === i;
            const isCorrectOpt = i === q.correctAnswer;

            let bg = "#fff";
            let border = "#E5E7EB";
            let circleBg = "#F3F4F6";
            let circleColor = "#9CA3AF";
            let icon: string | null = null;

            if (isAnswered) {
              if (isCorrectOpt) {
                bg = "#ECFDF3"; border = "#16A34A"; circleBg = "#16A34A"; circleColor = "#fff"; icon = "ph-check";
              } else if (sel) {
                bg = "#FEF2F2"; border = "#DC2626"; circleBg = "#DC2626"; circleColor = "#fff"; icon = "ph-x";
              }
            } else if (sel) {
              bg = "#EEF4FF"; border = "#246BFD"; circleBg = "#246BFD"; circleColor = "#fff"; icon = "ph-check";
            }

            return (
              <button
                key={i}
                onClick={() => pick(i)}
                disabled={isAnswered}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "13px 14px", borderRadius: 13, width: "100%", textAlign: "right",
                  background: bg,
                  border: `1.5px solid ${border}`,
                  cursor: isAnswered ? "default" : "pointer", fontFamily: "inherit",
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: circleBg,
                  color: circleColor,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: icon ? 14 : 12, fontWeight: 800,
                  transition: "background 0.15s",
                }}>
                  {icon
                    ? <i className={`ph ${icon}`} style={{ fontSize: 14 }} />
                    : String.fromCharCode(0x0041 + i)}
                </div>
                <span style={{ fontSize: 14, fontWeight: (sel || (isAnswered && isCorrectOpt)) ? 700 : 500, color: "#374151" }}>
                  {opt}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Nav */}
      <div style={{
        padding: "12px 16px", borderTop: "1px solid #E5E7EB",
        display: "flex", gap: 10, background: "#fff",
      }}>
        {idx < total - 1 ? (
          <button
            onClick={() => setIdx(i => i + 1)}
            disabled={!isAnswered}
            style={{
              flex: 1, height: 48, borderRadius: 13, border: "none",
              background: isAnswered ? "#246BFD" : "#E5E7EB",
              color: isAnswered ? "#fff" : "#9CA3AF",
              fontSize: 15, fontWeight: 700, cursor: isAnswered ? "pointer" : "not-allowed", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            التالي <i className="ph ph-arrow-left" style={{ fontSize: 18 }} />
          </button>
        ) : (
          <button
            onClick={finish}
            disabled={!isAnswered}
            style={{
              flex: 1, height: 48, borderRadius: 13, border: "none",
              background: isAnswered ? "#16A34A" : "#E5E7EB",
              color: isAnswered ? "#fff" : "#9CA3AF",
              fontSize: 15, fontWeight: 700, cursor: isAnswered ? "pointer" : "not-allowed", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <i className="ph ph-flag-checkered" style={{ fontSize: 18 }} />
            إنهاء الاختبار
          </button>
        )}
      </div>
    </div>
  );
}
