import { useState } from "react";
import { db } from "../lib/firebase";

interface Props {
  onSuccess: (name: string, key: string) => void;
  onLoad: (msg: string) => void;
  onUnload: () => void;
}

const FEATURES = [
  { icon: "exam",           title: "امتحان نظري كامل",      desc: "60 سؤال · 60 دقيقة · نفس معايير دائرة الترخيص" },
  { icon: "books",          title: "دراسة حسب الأقسام",     desc: "مراجعة موضوع بموضوع مع شرح تفصيلي لكل إجابة"   },
  { icon: "map-pin-simple", title: "مراكز التدريب",         desc: "ابحث عن أقرب مركز معتمد حسب المحافظة والمنطقة"  },
  { icon: "book-open-text",  title: "دليل الطالب",   desc: "خطوات، وثائق، رسوم، شروط وأسئلة شائعة"         },
];

export default function Register({ onSuccess, onLoad, onUnload }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const n = name.trim(), p = phone.trim();
    if (!n) { setErr("الرجاء إدخال الاسم الكامل"); return; }
    if (p.length < 10) { setErr("الرجاء إدخال رقم هاتف صحيح (10 أرقام)"); return; }

    onLoad("جارً التسجيل...");
    try {
      const key = "u_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);

      await db.ref("users/" + key).set({
        name: n,
        phone: p,
        registeredAt: new Date().toISOString(),
      });
      onUnload();
      onSuccess(n, key);
    } catch {
      onUnload();
      setErr("حدث خطأ، حاول مرة أخرى");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh", background: "#F6F8FB", direction: "rtl" }}>

      {/* ── Hero Header ── */}
      <div style={{
        background: "linear-gradient(150deg, #1a4fd4 0%, #246BFD 60%, #4f86ff 100%)",
        padding: "36px 24px 28px", textAlign: "center", color: "#fff",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -30, left: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            width: 68, height: 68, background: "rgba(255,255,255,0.15)",
            borderRadius: 20, margin: "0 auto 14px",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
            backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.2)",
          }}>
            <i className="ph ph-steering-wheel" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4, letterSpacing: "-0.5px" }}>JO Driver</h1>
          <p style={{ fontSize: 13, opacity: 0.8 }}>منصتك للتحضير لامتحان القيادة النظري</p>
        </div>
      </div>

      {/* ── Features ── */}
      <div style={{ padding: "20px 20px 8px" }}>
        <div style={{
          background: "#fff", borderRadius: 16, padding: "18px 16px",
          border: "1.5px solid #F0F1F3", boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#111827", marginBottom: 14, textAlign: "center" }}>
            ما ذا يميز المنصة؟
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ textAlign: "center", padding: "8px 4px" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "#EEF4FF", color: "#246BFD",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, margin: "0 auto 8px",
                }}>
                  <i className={`ph ph-${f.icon}`} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#111827", marginBottom: 3 }}>{f.title}</div>
                <div style={{ fontSize: 11, color: "#9CA3AF", lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Registration Form ── */}
      <div style={{ padding: "12px 20px 24px", flex: 1 }}>
        <div style={{
          background: "#fff", borderRadius: 16, padding: "22px 20px",
          border: "1.5px solid #F0F1F3", boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#111827", marginBottom: 16, textAlign: "center" }}>
            <i className="ph ph-user-circle-plus" style={{ color: "#246BFD", marginLeft: 6, fontSize: 18 }} />
            ابدأ الآن
          </div>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Name */}
            <div>
              <label style={{ display: "block", fontWeight: 700, fontSize: 12, marginBottom: 6, color: "#374151" }}>
                الاسم الكامل
              </label>
              <div style={{ position: "relative" }}>
                <i className="ph ph-user" style={{
                  position: "absolute", right: 14, top: "50%",
                  transform: "translateY(-50%)", fontSize: 18, color: "#9CA3AF",
                }} />
                <input
                  className="inp"
                  type="text"
                  placeholder="أدخل اسمك الكامل"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ paddingRight: 42 }}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: "block", fontWeight: 700, fontSize: 12, marginBottom: 6, color: "#374151" }}>
                رقم الهاتف
              </label>
              <div style={{ position: "relative" }}>
                <i className="ph ph-phone" style={{
                  position: "absolute", right: 14, top: "50%",
                  transform: "translateY(-50%)", fontSize: 18, color: "#9CA3AF",
                }} />
                <input
                  className="inp"
                  type="tel"
                  placeholder="07xxxxxxxx"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={{ direction: "ltr", textAlign: "right", paddingRight: 42 }}
                />
              </div>
            </div>

            {/* Error */}
            {err && (
              <div style={{
                background: "#FEF2F2", border: "1px solid #FECACA",
                borderRadius: 10, padding: "10px 14px",
                color: "#DC2626", fontSize: 12, fontWeight: 700,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <i className="ph ph-warning-circle" style={{ fontSize: 16, flexShrink: 0 }} />
                {err}
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ marginTop: 2 }}>
              <i className="ph ph-check" style={{ fontSize: 18 }} />
              تسجيل والدخول
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 11, color: "#9CA3AF", marginTop: 14 }}>
            مجاني بالكامل · لا يلزم التسجيل
          </p>
        </div>
      </div>
    </div>
  );
}
