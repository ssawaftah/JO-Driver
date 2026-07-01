import { useState } from "react";
import type { Question } from "../types";

interface Props {
  qs: Question[];
  cat: string;
  onBack: () => void;
}

export default function Study({ qs, cat, onBack }: Props) {
  const [idx, setIdx] = useState(0);
  const q = qs[idx];
  const total = qs.length;
  const pct = Math.round(((idx + 1) / total) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid #E5E7EB",
        background: "#fff", position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <button onClick={onBack} style={{
            width: 36, height: 36, borderRadius: 11, border: "1.5px solid #E5E7EB",
            background: "#F9FAFB", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <i className="ph ph-arrow-right" style={{ fontSize: 17, color: "#246BFD" }} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cat}</div>
          </div>
          <div style={{
            fontSize: 13, fontWeight: 700, color: "#6B7280",
            background: "#F3F6FF", padding: "4px 10px", borderRadius: 20, flexShrink: 0,
          }}>
            {idx + 1} / {total}
          </div>
        </div>
        {/* Progress */}
        <div style={{ height: 6, background: "#E5E7EB", borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            height: "100%", background: "#246BFD", borderRadius: 99,
            width: `${pct}%`, transition: "width 0.3s ease",
          }} />
        </div>
      </div>

      {/* Body */}
      <div className="screen-body" style={{ padding: 16, flex: 1 }}>
        {/* Review badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "#DCFCE7", color: "#16A34A",
          borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 700, marginBottom: 14,
        }}>
          <i className="ph ph-eye" style={{ fontSize: 14 }} />
          وضع المراجعة — الإجابة الصحيحة ظاهرة
        </div>

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
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          {q.options.map((opt, i) => {
            const correct = i === q.correctAnswer;
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "13px 14px", borderRadius: 13,
                background: correct ? "#DCFCE7" : "#fff",
                border: `1.5px solid ${correct ? "#16A34A" : "#E5E7EB"}`,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: correct ? "#16A34A" : "#F3F4F6",
                  color: correct ? "#fff" : "#9CA3AF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: correct ? 14 : 12, fontWeight: 800,
                }}>
                  {correct
                    ? <i className="ph ph-check" style={{ fontSize: 14 }} />
                    : String.fromCharCode(0x0041 + i)}
                </div>
                <span style={{ fontSize: 14, fontWeight: correct ? 700 : 500, color: correct ? "#15803D" : "#374151" }}>
                  {opt}
                </span>
              </div>
            );
          })}
        </div>

        {/* Explanation */}
        {q.explanation && (
          <div style={{
            display: "flex", gap: 10, background: "#FEF3C7",
            border: "1px solid #FDE68A", borderRadius: 13, padding: "12px 14px", marginBottom: 14,
          }}>
            <i className="ph ph-lightbulb" style={{ fontSize: 20, color: "#D97706", flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: "#92400E", lineHeight: 1.7 }}>{q.explanation}</p>
          </div>
        )}
      </div>

      {/* Nav buttons */}
      <div style={{
        padding: "12px 16px", borderTop: "1px solid #E5E7EB",
        display: "flex", gap: 10, background: "#fff",
      }}>
        <button
          onClick={() => setIdx(i => Math.max(0, i - 1))}
          disabled={idx === 0}
          style={{
            width: 48, height: 48, borderRadius: 13, flexShrink: 0,
            border: "1.5px solid #E5E7EB", background: "#F9FAFB",
            cursor: idx === 0 ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: idx === 0 ? 0.4 : 1,
          }}
        >
          <i className="ph ph-arrow-right" style={{ fontSize: 20, color: "#246BFD" }} />
        </button>

        {idx < total - 1
          ? (
            <button
              onClick={() => setIdx(i => i + 1)}
              style={{
                flex: 1, height: 48, borderRadius: 13, border: "none",
                background: "#246BFD", color: "#fff",
                fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              التالي <i className="ph ph-arrow-left" style={{ fontSize: 18 }} />
            </button>
          ) : (
            <button
              onClick={onBack}
              style={{
                flex: 1, height: 48, borderRadius: 13, border: "none",
                background: "#16A34A", color: "#fff",
                fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              <i className="ph ph-check-circle" style={{ fontSize: 18 }} />
              إنهاء المراجعة
            </button>
          )}
      </div>
    </div>
  );
}
