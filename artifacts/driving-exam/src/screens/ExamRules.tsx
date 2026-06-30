import AppFooter from "../components/Footer";

interface Props {
  onStart: () => void;
  onBack: () => void;
}

const rules = [
  { icon: "list-numbers",   color: "#2563EB", bg: "#DBEAFE", text: "عدد الأسئلة: 60 سؤالاً من جميع الأقسام بشكل عشوائي" },
  { icon: "clock",          color: "#D97706", bg: "#FEF3C7", text: "مدة الاختبار: 60 دقيقة" },
  { icon: "check-circle",   color: "#16A34A", bg: "#DCFCE7", text: "شرط النجاح: الإجابة الصحيحة على 51 سؤالاً أو أكثر" },
  { icon: "x-circle",       color: "#DC2626", bg: "#FEE2E2", text: "الرسوب الفوري: عند الإجابة الخاطئة على 10 أسئلة أو أكثر يُوقف الاختبار" },
  { icon: "arrow-u-up-left",color: "#7C3AED", bg: "#EDE9FE", text: "يمكنك الرجوع للسؤال السابق وتغيير إجابتك" },
  { icon: "skip-forward",   color: "#0891B2", bg: "#CFFAFE", text: "يمكنك تخطي السؤال وسيعود في نهاية الاختبار تلقائياً" },
];

export default function ExamRules({ onStart, onBack }: Props) {
  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: "#F3F6FF" }}>

      {/* Header */}
      <div style={{
        flexShrink: 0,
        padding: "14px 16px",
        background: "#fff",
        borderBottom: "1.5px solid #F3F4F6",
        display: "flex", alignItems: "center", gap: 12,
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
          <div style={{ fontSize: 17, fontWeight: 900, color: "#111827" }}>الامتحان النظري</div>
          <div style={{ fontSize: 12, color: "#9CA3AF" }}>محاكاة اختبار دائرة الترخيص</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: "1 1 0", minHeight: 0, overflowY: "auto", padding: "16px 14px" }}>

        {/* Official notice */}
        <div style={{
          background: "linear-gradient(135deg, #1a57d4, #246BFD)",
          borderRadius: 18, padding: "18px 16px", marginBottom: 16,
          color: "#fff", display: "flex", alignItems: "flex-start", gap: 12,
        }}>
          <i className="ph ph-seal-check" style={{ fontSize: 32, flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 5 }}>محاكاة رسمية لاختبار دائرة الترخيص</div>
            <div style={{ fontSize: 13, lineHeight: 1.75, opacity: 0.9 }}>
              هذا الاختبار يُطابق آلية الفحص النظري المعتمدة في دائرة الترخيص الأردنية تماماً،
              بما في ذلك عدد الأسئلة والوقت ومعايير النجاح والرسوب.
            </div>
          </div>
        </div>

        {/* Rules */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#374151", marginBottom: 10, paddingRight: 4 }}>
            قواعد الاختبار:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {rules.map((r, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 14,
                border: "1.5px solid #E5E7EB",
                padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: r.bg, color: r.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20,
                }}>
                  <i className={`ph ph-${r.icon}`} />
                </div>
                <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, margin: 0 }}>{r.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Warning box */}
        <div style={{
          background: "#FFFBEB", border: "1.5px solid #FDE68A",
          borderRadius: 14, padding: "12px 14px", marginBottom: 16,
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <i className="ph ph-warning" style={{ fontSize: 20, color: "#D97706", flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, color: "#92400E", lineHeight: 1.7, margin: 0 }}>
            بمجرد بدء الاختبار يبدأ العد التنازلي ولا يمكن إيقافه. تأكد من جهوزيتك قبل الضغط على بدء.
          </p>
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          style={{
            width: "100%", padding: "15px",
            borderRadius: 16, border: "none",
            background: "#246BFD", color: "#fff",
            fontSize: 17, fontWeight: 900,
            cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            marginBottom: 8,
          }}
        >
          <i className="ph ph-play-circle" style={{ fontSize: 24 }} />
          بدء الاختبار
        </button>
        <AppFooter initialData={null} />
      </div>
    </div>
  );
}
