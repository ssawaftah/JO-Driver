interface Props { onStart: () => void; }

export default function Landing({ onStart }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      {/* Blue hero */}
      <div style={{
        background: "linear-gradient(150deg, #1a57d4 0%, #246BFD 60%, #4f86ff 100%)",
        padding: "48px 24px 40px",
        textAlign: "center",
        color: "#fff",
      }}>
        <div style={{
          width: 80, height: 80,
          background: "rgba(255,255,255,0.18)",
          borderRadius: 24, margin: "0 auto 20px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 40,
        }}>
          <i className="ph ph-steering-wheel" />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 10 }}>
          اختبار الفحص النظري
        </h1>
        <p style={{ fontSize: 14, lineHeight: 1.8, opacity: 0.88 }}>
          استعد لاختبار القيادة النظري بأسئلة موثوقة<br />
          ومراكز تدريب معتمدة قريبة منك
        </p>
      </div>

      {/* Features */}
      <div style={{ padding: "24px 16px", flex: 1, background: "#fff" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          {[
            { icon: "shield-check", color: "#16A34A", bg: "#DCFCE7", label: "موثوق من دائرة الترخيص" },
            { icon: "target",       color: "#2563EB", bg: "#DBEAFE", label: "محاكاة واقعية للاختبار" },
            { icon: "list-checks",  color: "#D97706", bg: "#FEF3C7", label: "مطابق لأسئلة الاختبار" },
            { icon: "exam",         color: "#9333EA", bg: "#F3E8FF", label: "تجربة امتحان كاملة" },
          ].map(f => (
            <div key={f.label} style={{
              background: "#fff", border: "1.5px solid #E5E7EB",
              borderRadius: 16, padding: "16px 12px",
              textAlign: "center",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: f.bg, color: f.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, margin: "0 auto 10px",
              }}>
                <i className={`ph ph-${f.icon}`} />
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.5, color: "#111827" }}>{f.label}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{
          display: "flex", justifyContent: "space-around",
          background: "#F3F6FF", borderRadius: 16, padding: "16px 8px", marginBottom: 24,
        }}>
          {[["500+", "سؤال"], ["6", "أقسام"], ["مجاني", "100%"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#246BFD" }}>{v}</div>
              <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>{l}</div>
            </div>
          ))}
        </div>

        <button className="btn-primary" onClick={onStart} style={{ fontSize: 17 }}>
          <i className="ph ph-arrow-left" style={{ fontSize: 20 }} />
          ابدأ الآن
        </button>
      </div>
    </div>
  );
}
