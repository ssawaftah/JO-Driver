import AppFooter from "../components/Footer";

interface Props {
  ok: number;
  wrong: number;
  total: number;
  skipped: number;
  onRetry: () => void;
  onHome: () => void;
}

export default function ExamResult({ ok, wrong, total, skipped, onRetry, onHome }: Props) {
  const passed = wrong <= 9 && ok >= 51;
  const pct = total > 0 ? Math.round((ok / total) * 100) : 0;

  // Circle SVG
  const r = 52, circ = 2 * Math.PI * r;
  const dash = circ - (pct / 100) * circ;
  const color = passed ? "#16A34A" : "#DC2626";

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh", background: "#fff" }}>

      {/* Top accent */}
      <div style={{ height: 6, background: passed ? "#16A34A" : "#DC2626", flexShrink: 0 }} />

      {/* Hero */}
      <div style={{ padding: "30px 20px 20px", textAlign: "center", borderBottom: "1px solid #F3F4F6", flexShrink: 0 }}>

        {/* Result icon */}
        <div style={{
          width: 72, height: 72, borderRadius: 24, margin: "0 auto 16px",
          background: passed ? "#DCFCE7" : "#FEE2E2",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 38, color,
        }}>
          <i className={`ph ph-${passed ? "seal-check" : "seal-warning"}`} />
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 900, color, marginBottom: 6 }}>
          {passed ? "مبروك! اجتزت الاختبار 🎉" : "لم تجتز الاختبار"}
        </h1>
        <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 20 }}>
          {passed
            ? "أداء ممتاز! أنت مؤهل لاجتياز الفحص النظري الرسمي"
            : wrong > 9
              ? "تم إيقاف الاختبار لتجاوز الحد الأقصى للإجابات الخاطئة"
              : "راجع المزيد من الأسئلة وحاول مجدداً"}
        </p>

        {/* Circle progress */}
        <div style={{ position: "relative", display: "inline-flex", marginBottom: 8 }}>
          <svg width={130} height={130} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={65} cy={65} r={r} fill="none" stroke="#E5E7EB" strokeWidth={9} />
            <circle cx={65} cy={65} r={r} fill="none"
              stroke={color} strokeWidth={9} strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={dash} />
          </svg>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{pct}%</span>
            <span style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>النتيجة</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: "16px 14px", flexShrink: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
          {[
            { label: "صحيح",    val: ok,      color: "#16A34A", bg: "#DCFCE7" },
            { label: "خاطئ",    val: wrong,   color: "#DC2626", bg: "#FEE2E2" },
            { label: "متخطى",   val: skipped, color: "#D97706", bg: "#FEF3C7" },
            { label: "المجموع", val: total,   color: "#2563EB", bg: "#DBEAFE" },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg, borderRadius: 14, padding: "12px 6px", textAlign: "center",
            }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: s.color, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pass/fail detail */}
      <div style={{ padding: "0 14px 16px", flexShrink: 0 }}>
        <div style={{
          background: passed ? "#DCFCE7" : "#FEE2E2",
          borderRadius: 14, padding: "14px 16px",
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <i className={`ph ph-${passed ? "check-circle" : "x-circle"}`}
            style={{ fontSize: 22, color, flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 13, lineHeight: 1.7, color: passed ? "#15803D" : "#DC2626" }}>
            {passed ? (
              <>
                أجبت على <strong>{ok}</strong> من <strong>{total}</strong> سؤال بشكل صحيح،
                بمعدل <strong>{pct}%</strong>. الحد الأدنى للنجاح هو 51 سؤالاً وقد تجاوزته!
              </>
            ) : wrong > 9 ? (
              <>
                تجاوزت الحد الأقصى للإجابات الخاطئة (<strong>10 أخطاء</strong>).
                وفقاً لمعايير دائرة الترخيص يُوقف الاختبار فوراً عند ذلك.
              </>
            ) : (
              <>
                أجبت على <strong>{ok}</strong> من <strong>{total}</strong> سؤال بشكل صحيح.
                تحتاج إلى <strong>51</strong> إجابة صحيحة على الأقل للنجاح.
              </>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ padding: "0 14px 32px", display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
        <button onClick={onRetry} style={{
          width: "100%", padding: "14px",
          borderRadius: 14, border: "none",
          background: "#246BFD", color: "#fff",
          fontSize: 16, fontWeight: 800,
          cursor: "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <i className="ph ph-arrow-clockwise" style={{ fontSize: 20 }} />
          إعادة الاختبار
        </button>
        <button onClick={onHome} style={{
          width: "100%", padding: "14px",
          borderRadius: 14, border: "1.5px solid #E5E7EB",
          background: "#fff", color: "#6B7280",
          fontSize: 16, fontWeight: 700,
          cursor: "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <i className="ph ph-house" style={{ fontSize: 20 }} />
          العودة للرئيسية
        </button>
      </div>
      <AppFooter initialData={null} />
    </div>
  );
}
