import { useState } from "react";

interface Props {
  cats: string[];
  qCounts: Record<string, number>;
  onBack: () => void;
  onStudy: (cat: string) => void;
  onTest: (cat: string) => void;
}

const META: Record<string, { icon: string; color: string; bg: string }> = {
  "قواعد السير والمرور":        { icon: "traffic-sign",  color: "#2563EB", bg: "#DBEAFE" },
  "الميكانيك":                  { icon: "wrench",         color: "#16A34A", bg: "#DCFCE7" },
  "السلامة على الطريق":         { icon: "shield-check",   color: "#DC2626", bg: "#FEE2E2" },
  "الإسعافات الأولية":          { icon: "first-aid-kit",  color: "#DB2777", bg: "#FCE7F3" },
  "الشواخص والخطوط والعلامات": { icon: "signpost",       color: "#D97706", bg: "#FEF3C7" },
  "المخالفات واحتساب النقاط":  { icon: "warning-circle", color: "#7C3AED", bg: "#EDE9FE" },
};
const DEF = { icon: "book-open", color: "#2563EB", bg: "#DBEAFE" };

export default function Categories({ cats, qCounts, onBack, onStudy, onTest }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>

      {/* ── Header ── */}
      <div style={{
        padding: "14px 16px",
        borderBottom: "1.5px solid #F3F4F6",
        display: "flex", alignItems: "center", gap: 12,
        background: "#fff", position: "sticky", top: 0, zIndex: 10,
      }}>
        <button onClick={onBack} style={{
          width: 40, height: 40, borderRadius: 12,
          border: "1.5px solid #E5E7EB", background: "#F9FAFB",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0,
        }}>
          <i className="ph ph-arrow-right" style={{ fontSize: 19, color: "#246BFD" }} />
        </button>
        <div>
          <div style={{ fontSize: 17, fontWeight: 900, color: "#111827" }}>أقسام الأسئلة</div>
          <div style={{ fontSize: 12, color: "#9CA3AF" }}>{cats.length} أقسام — اختر قسماً للبدء</div>
        </div>
      </div>

      {/* ── List ── */}
      <div className="screen-body" style={{ padding: "14px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {cats.map((cat, i) => {
          const m = META[cat] || DEF;
          const count = qCounts[cat] || 0;
          const open = expanded === cat;

          return (
            <div
              key={cat}
              className="fade-up"
              style={{
                background: "#fff",
                border: `1.5px solid ${open ? "#246BFD" : "#E5E7EB"}`,
                borderRadius: 18,
                overflow: "hidden",
                animationDelay: `${i * 0.05}s`,
                transition: "border-color 0.2s",
              }}
            >
              {/* ── Title row (tap to expand) ── */}
              <button
                onClick={() => setExpanded(open ? null : cat)}
                style={{
                  width: "100%", background: "none", border: "none",
                  padding: "14px 16px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 14,
                  fontFamily: "inherit", textAlign: "right",
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 50, height: 50, borderRadius: 15, flexShrink: 0,
                  background: open ? m.color : m.bg, color: open ? "#fff" : m.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, transition: "background 0.2s, color 0.2s",
                }}>
                  <i className={`ph ph-${m.icon}`} />
                </div>

                {/* Text */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>
                    {i + 1}. {cat}
                  </div>
                  {count > 0 && (
                    <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 3 }}>
                      {count} سؤال متاح
                    </div>
                  )}
                </div>

                {/* Chevron */}
                <i
                  className="ph ph-caret-down"
                  style={{
                    fontSize: 18, color: open ? "#246BFD" : "#D1D5DB",
                    transition: "transform 0.25s",
                    transform: open ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              {/* ── Expandable action buttons ── */}
              {open && (
                <div style={{
                  borderTop: "1.5px solid #F3F4F6",
                  padding: "12px 14px 14px",
                  display: "flex", flexDirection: "column", gap: 10,
                }}>
                  {/* Section hint */}
                  <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0, paddingRight: 2 }}>
                    اختر وضع الدراسة لهذا القسم:
                  </p>

                  {/* Study button */}
                  <button
                    onClick={() => onStudy(cat)}
                    style={{
                      width: "100%", height: 48, borderRadius: 13,
                      border: "1.5px solid #246BFD",
                      background: "#EEF4FF", color: "#246BFD",
                      fontSize: 15, fontWeight: 800,
                      cursor: "pointer", fontFamily: "inherit",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    <i className="ph ph-book-open" style={{ fontSize: 20 }} />
                    مراجعة — عرض الإجابات
                  </button>

                  {/* Test button */}
                  <button
                    onClick={() => onTest(cat)}
                    style={{
                      width: "100%", height: 48, borderRadius: 13,
                      border: "none",
                      background: "#246BFD", color: "#fff",
                      fontSize: 15, fontWeight: 800,
                      cursor: "pointer", fontFamily: "inherit",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    <i className="ph ph-pencil-line" style={{ fontSize: 20 }} />
                    اختبار — بدء تقييم
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Bottom spacer */}
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
