import { useState } from "react";

interface Props { onBack: () => void; }

/* ── Accordion item ──────────────────────────────────────── */
function Accordion({
  icon, iconColor, iconBg, title, children,
}: {
  icon: string; iconColor: string; iconBg: string;
  title: string; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: "#fff", borderRadius: 16,
      border: "1.5px solid #F0F1F3",
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", padding: "15px 16px",
          display: "flex", alignItems: "center", gap: 13,
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "inherit", textAlign: "right",
        }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: iconBg, color: iconColor,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>
          <i className={`ph ph-${icon}`} />
        </div>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 800, color: "#111827" }}>{title}</span>
        <i
          className={`ph ph-caret-${open ? "up" : "down"}`}
          style={{ fontSize: 16, color: "#9CA3AF", flexShrink: 0, transition: "transform 0.2s" }}
        />
      </button>
      {open && (
        <div style={{ padding: "0 16px 16px" }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ── Info row inside accordion ───────────────────────────── */
function Row({ icon, text, sub }: { icon: string; text: string; sub?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 0", borderBottom: "1px solid #F9FAFB" }}>
      <i className={`ph ph-${icon}`} style={{ fontSize: 16, color: "#246BFD", marginTop: 2, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 13, color: "#374151", fontWeight: 600, lineHeight: 1.5 }}>{text}</div>
        {sub && <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ── Fee badge ───────────────────────────────────────────── */
function Fee({ label, amount, note }: { label: string; amount: string; note?: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "11px 0", borderBottom: "1px solid #F9FAFB",
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{label}</div>
        {note && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{note}</div>}
      </div>
      <span style={{
        fontSize: 14, fontWeight: 900, color: "#246BFD",
        background: "#EEF4FF", borderRadius: 10, padding: "4px 12px",
      }}>
        {amount}
      </span>
    </div>
  );
}

/* ── Step ────────────────────────────────────────────────── */
function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div style={{ display: "flex", gap: 13, paddingBottom: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          background: "#246BFD", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 900,
        }}>{n}</div>
        {n < 6 && <div style={{ width: 2, flex: 1, background: "#E5E7EB", marginTop: 6 }} />}
      </div>
      <div style={{ paddingTop: 4, paddingBottom: n < 6 ? 10 : 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#111827", marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>{desc}</div>
      </div>
    </div>
  );
}

/* ── Root ────────────────────────────────────────────────── */
export default function Faq({ onBack }: Props) {
  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: "#F9FAFB" }}>

      {/* Header */}
      <div style={{
        background: "#fff", borderBottom: "1.5px solid #F0F1F3",
        padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
        position: "sticky", top: 0, zIndex: 20, flexShrink: 0,
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
          <div style={{ fontSize: 17, fontWeight: 900, color: "#111827" }}>دليل الامتحان النظري</div>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 1 }}>كل ما تحتاجه قبل يوم الاختبار</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: "1 1 0", minHeight: 0, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>

        {/* SMS Notice card */}
        <div style={{
          background: "linear-gradient(135deg, #246BFD 0%, #4f86ff 100%)",
          borderRadius: 18, padding: "18px 16px", color: "#fff",
          display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 4,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 13, background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, flexShrink: 0,
          }}>
            <i className="ph ph-device-mobile-speaker" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 6 }}>
              متى تذهب لدائرة الترخيص؟
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.8, opacity: 0.92 }}>
              انتظر رسالة SMS على هاتفك تحمل النص:
            </div>
            <div style={{
              marginTop: 8, background: "rgba(255,255,255,0.15)",
              borderRadius: 10, padding: "9px 12px",
              fontSize: 12, fontWeight: 700, lineHeight: 1.7,
              border: "1px solid rgba(255,255,255,0.2)",
            }}>
              "تم استكمال دروس النظري والعملي المطلوبة للتقدم للفحص لدى الترخيص"
            </div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 8 }}>
              عند وصول هذه الرسالة فقط يمكنك التوجه لأقرب دائرة ترخيص وتقديم طلبك.
            </div>
          </div>
        </div>

        {/* 1 - Steps */}
        <Accordion icon="list-numbers" iconColor="#7C3AED" iconBg="#EDE9FE" title="خطوات الحصول على رخصة القيادة">
          <div style={{ paddingTop: 8 }}>
            <Step n={1} title="التسجيل في مدرسة سواقة معتمدة"
              desc="اختر مدرسة معتمدة لدى دائرة الترخيص وسجّل باسمك برقم هويتك الوطنية." />
            <Step n={2} title="إتمام الدروس النظرية والعملية"
              desc="أكمل الساعات المطلوبة من الدروس النظرية (Theory) والعملية (Practical) مع المدرسة." />
            <Step n={3} title="انتظار رسالة SMS من دائرة الترخيص"
              desc="بعد إدخال المدرسة بياناتك في النظام، ستصلك رسالة تأكيد خلال أيام." />
            <Step n={4} title="التوجه لدائرة الترخيص"
              desc="احضر مع وثائقك المطلوبة، ادفع الرسوم، وتقدم لحجز موعد الفحص النظري." />
            <Step n={5} title="اجتياز الفحص النظري"
              desc="60 سؤال خلال 60 دقيقة. تحتاج الإجابة على 51 سؤالاً على الأقل للنجاح." />
            <Step n={6} title="اجتياز الفحص العملي واستلام الرخصة"
              desc="بعد النجاح في النظري تحدد موعداً للفحص العملي، وعند النجاح تستلم رخصتك." />
          </div>
        </Accordion>

        {/* 2 - Required documents */}
        <Accordion icon="folder-open" iconColor="#D97706" iconBg="#FEF3C7" title="الأوراق والوثائق المطلوبة">
          <div style={{ paddingTop: 4 }}>
            <Row icon="identification-card" text="بطاقة هوية وطنية سارية المفعول" sub="للأردنيين — جواز سفر ساري للمقيمين" />
            <Row icon="book-open-text" text="دفتر خدمة العلم أو وثيقة الإعفاء" sub="للذكور دون سن الأربعين" />
            <Row icon="image-square" text="صورتان شخصيتان" sub="خلفية بيضاء، حديثتان" />
            <Row icon="heart-pulse" text="شهادة اللياقة الطبية" sub="تُستخرج من أي مركز صحي معتمد" />
            <Row icon="receipt" text="إيصال دفع رسوم التقديم" sub="يُدفع في الدائرة أو عبر منظومة موحد" />
          </div>
        </Accordion>

        {/* 3 - Fees */}
        <Accordion icon="currency-circle-dollar" iconColor="#16A34A" iconBg="#DCFCE7" title="الرسوم التقريبية">
          <div style={{ paddingTop: 4 }}>
            <Fee label="رسوم تسجيل طلب التقديم" amount="3 د.أ" note="تُدفع لدى دائرة الترخيص" />
            <Fee label="رسوم الفحص النظري" amount="10 د.أ" note="في حال الرسوب تُعاد الرسوم" />
            <Fee label="رسوم الفحص العملي" amount="20 د.أ" note="لكل محاولة" />
            <Fee label="رسوم استخراج الرخصة" amount="30 د.أ" note="عند النجاح في الفحصين" />
            <div style={{
              marginTop: 10, background: "#FFFBEB", borderRadius: 10,
              padding: "10px 12px", fontSize: 12, color: "#92400E",
              display: "flex", gap: 8, alignItems: "flex-start",
            }}>
              <i className="ph ph-warning" style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }} />
              الرسوم قد تتغير — تحقق من الموقع الرسمي لدائرة الترخيص أو اتصل بأقرب فرع قبل الذهاب.
            </div>
          </div>
        </Accordion>

        {/* 4 - Age & conditions */}
        <Accordion icon="user-check" iconColor="#0891B2" iconBg="#CFFAFE" title="شروط التقديم">
          <div style={{ paddingTop: 4 }}>
            <Row icon="calendar-blank" text="الحد الأدنى للعمر: 18 سنة" />
            <Row icon="shield-check" text="لا يوجد سجل جنائي يمنع استخراج الرخصة" />
            <Row icon="eye" text="اجتياز فحص النظر في المركز الصحي" />
            <Row icon="graduation-cap" text="إكمال الدروس المقررة في المدرسة المسجّل بها" />
          </div>
        </Accordion>

        {/* 5 - FAQ */}
        <Accordion icon="chat-circle-question" iconColor="#246BFD" iconBg="#EEF4FF" title="أسئلة شائعة">
          <div style={{ paddingTop: 8, display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              {
                q: "ماذا لو رسبت في الامتحان النظري؟",
                a: "يمكنك إعادة التقديم بعد 24 ساعة، وتُسدَّد رسوم جديدة لكل محاولة.",
              },
              {
                q: "هل يمكن تقديم الامتحان بدون رسالة SMS؟",
                a: "لا. الرسالة شرط إلزامي، وهي تؤكد أن المدرسة سجّلت إتمام دروسك في نظام دائرة الترخيص.",
              },
              {
                q: "كم عدد المحاولات المسموحة في الفحص النظري؟",
                a: "لا يوجد حد أقصى للمحاولات، غير أن كل محاولة تحتاج رسوماً جديدة.",
              },
              {
                q: "هل يختلف الامتحان بين المحافظات؟",
                a: "الاختبار موحّد ورقمي في جميع فروع دائرة الترخيص في المملكة.",
              },
              {
                q: "هل تُقبل الهوية منتهية الصلاحية؟",
                a: "لا. يجب أن تكون الهوية الوطنية سارية المفعول يوم التقديم.",
              },
            ].map(({ q, a }) => (
              <div key={q}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#111827", marginBottom: 5, display: "flex", gap: 8 }}>
                  <i className="ph ph-question" style={{ fontSize: 16, color: "#246BFD", flexShrink: 0, marginTop: 1 }} />
                  {q}
                </div>
                <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.7, paddingRight: 24 }}>{a}</div>
              </div>
            ))}
          </div>
        </Accordion>

        {/* Official link */}
        <a
          href="https://www.motc.gov.jo"
          target="_blank"
          rel="noreferrer"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "14px", borderRadius: 14,
            border: "1.5px solid #E5E7EB", background: "#fff",
            fontSize: 13, fontWeight: 700, color: "#246BFD",
            textDecoration: "none",
          }}
        >
          <i className="ph ph-globe" style={{ fontSize: 18 }} />
          الموقع الرسمي لوزارة الداخلية — دائرة الترخيص
        </a>

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
