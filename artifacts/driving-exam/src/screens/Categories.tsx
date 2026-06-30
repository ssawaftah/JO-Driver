interface Props {
  cats: string[];
  qCounts: Record<string, number>;
  onBack: () => void;
  onStudy: (cat: string) => void;
  onTest: (cat: string) => void;
}

const META: Record<string, { icon: string; color: string; bg: string }> = {
  "قواعد السير والمرور":          { icon: "traffic-sign",   color: "#2563EB", bg: "#DBEAFE" },
  "الميكانيك":                    { icon: "wrench",          color: "#16A34A", bg: "#DCFCE7" },
  "السلامة على الطريق":           { icon: "shield-check",    color: "#DC2626", bg: "#FEE2E2" },
  "الإسعافات الأولية":            { icon: "first-aid-kit",   color: "#DB2777", bg: "#FCE7F3" },
  "الشواخص والخطوط والعلامات":   { icon: "signpost",        color: "#D97706", bg: "#FEF3C7" },
  "المخالفات واحتساب النقاط":    { icon: "warning-circle",  color: "#7C3AED", bg: "#EDE9FE" },
};
const DEF = { icon: "book-open", color: "#2563EB", bg: "#DBEAFE" };

export default function Categories({ cats, qCounts, onBack, onStudy, onTest }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      {/* Header */}
      <div style={{
        padding: "14px 16px", borderBottom: "1px solid #E5E7EB",
        display: "flex", alignItems: "center", gap: 12, background: "#fff",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <button onClick={onBack} style={{
          width: 38, height: 38, borderRadius: 12, border: "1.5px solid #E5E7EB",
          background: "#F9FAFB", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <i className="ph ph-arrow-right" style={{ fontSize: 18, color: "#246BFD" }} />
        </button>
        <div>
          <div style={{ fontWeight: 900, fontSize: 17, color: "#111827" }}>أقسام الأسئلة</div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>{cats.length} أقسام</div>
        </div>
      </div>

      {/* List */}
      <div className="screen-body" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {cats.map((cat, i) => {
          const m = META[cat] || DEF;
          const count = qCounts[cat] || 0;
          return (
            <div
              key={cat}
              className="fade-up"
              style={{
                background: "#fff", border: "1.5px solid #E5E7EB",
                borderRadius: 16, overflow: "hidden",
                animationDelay: `${i * 0.05}s`,
              }}
            >
              {/* Title row */}
              <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                  background: m.bg, color: m.color,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                }}>
                  <i className={`ph ph-${m.icon}`} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>{i + 1}. {cat}</div>
                  {count > 0 && (
                    <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{count} سؤال</div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{
                borderTop: "1px solid #F3F4F6",
                padding: "10px 12px",
                display: "flex", gap: 8,
              }}>
                <button
                  onClick={() => onStudy(cat)}
                  style={{
                    flex: 1, height: 38, borderRadius: 10, border: "1.5px solid #246BFD",
                    background: "#EEF4FF", color: "#246BFD",
                    fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}
                >
                  <i className="ph ph-book-open" style={{ fontSize: 15 }} />
                  مراجعة
                </button>
                <button
                  onClick={() => onTest(cat)}
                  style={{
                    flex: 1, height: 38, borderRadius: 10, border: "none",
                    background: "#246BFD", color: "#fff",
                    fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}
                >
                  <i className="ph ph-pencil-line" style={{ fontSize: 15 }} />
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
