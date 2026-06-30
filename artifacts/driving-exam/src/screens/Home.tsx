import AppFooter from "../components/Footer";

interface Props {
  name: string;
  onExam: () => void;
  onStudy: () => void;
  onCenters: () => void;
  onGuide: () => void;
}

const cards = [
  { icon: "pencil-line",        color: "#16A34A", bg: "#DCFCE7", title: "الامتحان النظري",      desc: "محاكاة واقعية لاختبار القيادة",              badge: null, action: "onExam"    },
  { icon: "book-open",          color: "#2563EB", bg: "#DBEAFE", title: "دراسة الأسئلة",        desc: "مراجعة الأسئلة حسب الأقسام",                badge: null, action: "onStudy"   },
  { icon: "map-pin",            color: "#D97706", bg: "#FEF3C7", title: "مراكز تدريب القيادة", desc: "ابحث عن أقرب مركز تدريب معتمد",             badge: null, action: "onCenters" },
  { icon: "book-open-text",     color: "#7C3AED", bg: "#EDE9FE", title: "دليل الامتحان النظري",  desc: "خطوات، وثائق، رسوم، شروط وأسئلة شائعة",     badge: null, action: "onGuide"   },
];

export default function Home({ name, onExam, onStudy, onCenters, onGuide }: Props) {
  const actions: Record<string, () => void> = { onExam, onStudy, onCenters, onGuide };
  const hour = new Date().getHours();
  const greet = hour < 12 ? "صباح الخير" : hour < 18 ? "مساء الخير" : "مساء النور";

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh", background: "#fff" }}>
      {/* Top bar */}
      <div style={{
        padding: "16px 20px", borderBottom: "1px solid #E5E7EB",
        display: "flex", alignItems: "center", gap: 12,
        background: "#fff",
      }}>
        <div style={{
          width: 46, height: 46, borderRadius: 14,
          background: "#246BFD",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, color: "#fff", flexShrink: 0,
        }}>
          <i className="ph ph-car" />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#111827" }}>JO Driver</div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>منصتك للتحضير لاختبار القيادة الأردني</div>
        </div>
      </div>

      <div style={{ padding: "20px 16px", flex: 1 }}>
        {/* Greeting */}
        <div style={{
          background: "linear-gradient(135deg, #246BFD 0%, #4f86ff 100%)",
          borderRadius: 20, padding: "20px", marginBottom: 20, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <p style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>{greet}،</p>
            <h2 style={{ fontSize: 20, fontWeight: 900 }}>{name || "مرحباً بك!"}</h2>
            <p style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>جاهز للاختبار؟</p>
          </div>
          <div style={{ fontSize: 48, opacity: 0.25 }}>
            <i className="ph ph-student" />
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {cards.map(c => (
            <button
              key={c.title}
              onClick={actions[c.action]}
              style={{
                background: "#fff", border: "1.5px solid #E5E7EB",
                borderRadius: 16, padding: "16px",
                display: "flex", alignItems: "center", gap: 14,
                cursor: "pointer", fontFamily: "inherit", textAlign: "right",
                width: "100%", transition: "border-color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "#246BFD")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "#E5E7EB")}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                background: c.bg, color: c.color,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
              }}>
                <i className={`ph ph-${c.icon}`} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>{c.title}</span>
                  {c.badge && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 8px",
                      borderRadius: 20, background: "#FEF3C7", color: "#92400E",
                    }}>{c.badge}</span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: "#6B7280" }}>{c.desc}</p>
              </div>
              <i className="ph ph-caret-left" style={{ fontSize: 18, color: "#D1D5DB", flexShrink: 0 }} />
            </button>
          ))}
        </div>
      </div>
      <AppFooter />
    </div>
  );
}
