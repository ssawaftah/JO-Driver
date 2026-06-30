interface Props { onStart: () => void; }

export default function Landing({ onStart }: Props) {
  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      background: "#fff",
      direction: "rtl",
    }}>

      {/* ── Header ── */}
      <header style={{
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <div style={{
          width: 38, height: 38,
          background: "#246BFD",
          borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <i className="ph ph-steering-wheel" style={{ fontSize: 20, color: "#fff" }} />
        </div>
        <span style={{ fontSize: 18, fontWeight: 900, color: "#111827", letterSpacing: "-0.3px" }}>
          JO Driver
        </span>
      </header>

      {/* ── Hero ── */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 28px 48px",
        gap: 0,
      }}>

        {/* Badge */}
        <div style={{ marginBottom: 24 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 12, fontWeight: 700, color: "#246BFD",
            background: "#EEF4FF",
            borderRadius: 20, padding: "6px 12px",
          }}>
            <i className="ph ph-seal-check" style={{ fontSize: 14 }} />
            دائرة ترخيص السير — الأردن
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 30,
          fontWeight: 900,
          color: "#111827",
          lineHeight: 1.4,
          marginBottom: 14,
          letterSpacing: "-0.5px",
        }}>
          استعد لاختبار<br />القيادة النظري
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 15,
          color: "#6B7280",
          lineHeight: 1.8,
          marginBottom: 36,
          maxWidth: 300,
        }}>
          أسئلة مطابقة للامتحان الرسمي، محاكاة واقعية، ومراكز تدريب معتمدة بالقرب منك.
        </p>

        {/* CTA */}
        <button
          onClick={onStart}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            padding: "16px",
            background: "#246BFD",
            color: "#fff",
            border: "none",
            borderRadius: 16,
            fontSize: 16,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "inherit",
            marginBottom: 14,
          }}
        >
          ابدأ الآن
          <i className="ph ph-arrow-left" style={{ fontSize: 18 }} />
        </button>

        {/* Secondary note */}
        <p style={{ textAlign: "center", fontSize: 12, color: "#9CA3AF" }}>
          مجاني بالكامل · لا يلزم تسجيل
        </p>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: "#F3F4F6", margin: "36px 0" }} />

        {/* ── 3 Features ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {[
            { icon: "exam",           title: "امتحان نظري كامل",    desc: "60 سؤال · 60 دقيقة · نفس معايير دائرة الترخيص" },
            { icon: "books",          title: "دراسة حسب الأقسام",   desc: "مراجعة موضوع بموضوع مع شرح تفصيلي لكل إجابة"   },
            { icon: "map-pin-simple", title: "مراكز التدريب",        desc: "ابحث عن أقرب مركز معتمد حسب المحافظة والمنطقة"  },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{
                width: 40, height: 40,
                background: "#F3F6FF",
                borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                marginTop: 2,
              }}>
                <i className={`ph ph-${icon}`} style={{ fontSize: 20, color: "#246BFD" }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#111827", marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
