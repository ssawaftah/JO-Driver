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
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>

      {/* ── Header ── */}
      <div style={{
        flexShrink: 0,
        padding: "14px 16px",
        borderBottom: "1.5px solid #F3F4F6",
        display: "flex", alignItems: "center", gap: 12,
        background: "#fff",
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
          <div style={{ fontSize: 12, color: "#9CA3AF" }}>اختر قسماً للمراجعة أو الاختبار</div>
        </div>
      </div>

      {/* ── Scrollable list ── */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        padding: "12px 14px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}>
        {cats.map((cat, i) => {
          const m = META[cat] || DEF;
          const count = qCounts[cat] || 0;

          return (
            <div
              key={cat}
              style={{
                background: "#fff",
                border: "1.5px solid #E5E7EB",
                borderRadius: 18,
                overflow: "hidden",
              }}
            >
              {/* ── Category header ── */}
              <div style={{
                padding: "14px 16px 12px",
                display: "flex", alignItems: "center", gap: 14,
                borderBottom: "1px solid #F3F4F6",
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: m.bg, color: m.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24,
                }}>
                  <i className={`ph ph-${m.icon}`} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>
                    {i + 1}. {cat}
                  </div>
                  <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 3 }}>
                    {count > 0 ? `${count} سؤال` : "لا توجد أسئلة بعد"}
                  </div>
                </div>
              </div>

              {/* ── Action buttons (always visible) ── */}
              <div style={{
                display: "flex", gap: 0,
              }}>
                <button
                  onClick={() => onStudy(cat)}
                  style={{
                    flex: 1, height: 46,
                    background: "#F8FAFF", color: "#246BFD",
                    border: "none", borderLeft: "1px solid #F3F4F6",
                    fontSize: 14, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  }}
                >
                  <i className="ph ph-book-open" style={{ fontSize: 18 }} />
                  مراجعة
                </button>
                <button
                  onClick={() => onTest(cat)}
                  style={{
                    flex: 1, height: 46,
                    background: "#246BFD", color: "#fff",
                    border: "none",
                    fontSize: 14, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  }}
                >
                  <i className="ph ph-pencil-line" style={{ fontSize: 18 }} />
                  اختبار
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
