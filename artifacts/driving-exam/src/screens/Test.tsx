import { useState } from "react";
import type { Question } from "../types";

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

  function pick(i: number) {
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
          <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 14, border: "1px solid #E5E7EB", height: 200 }}>
            {q.mediaType === "video"
              ? <video controls src={q.mediaUrl} preload="auto" style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }} />
              : <img src={q.mediaUrl} alt="" loading="eager" style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }} />
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
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "13px 14px", borderRadius: 13, width: "100%", textAlign: "right",
                  background: sel ? "#EEF4FF" : "#fff",
                  border: `1.5px solid ${sel ? "#246BFD" : "#E5E7EB"}`,
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: sel ? "#246BFD" : "#F3F4F6",
                  color: sel ? "#fff" : "#9CA3AF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: sel ? 14 : 12, fontWeight: 800,
                  transition: "background 0.15s",
                }}>
                  {sel
                    ? <i className="ph ph-check" style={{ fontSize: 14 }} />
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

      {/* Nav */}
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

        {idx < total - 1 ? (
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
            onClick={finish}
            style={{
              flex: 1, height: 48, borderRadius: 13, border: "none",
              background: "#16A34A", color: "#fff",
              fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
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
