import { useState } from "react";
import { db } from "../lib/firebase";
import { getTelegramUser } from "../lib/telegram";

interface Props {
  onSuccess: (name: string) => void;
  onLoad: (msg: string) => void;
  onUnload: () => void;
}

export default function Register({ onSuccess, onLoad, onUnload }: Props) {
  const tgUser = getTelegramUser();
  const [name, setName] = useState(tgUser?.first_name || "");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const n = name.trim(), p = phone.trim();
    if (!n) { setErr("الرجاء إدخال الاسم الكامل"); return; }
    if (p.length < 10) { setErr("الرجاء إدخال رقم هاتف صحيح (10 أرقام)"); return; }
    if (!tgUser?.id) { setErr("تعذر التحقق من حساب تيليغرام"); return; }

    onLoad("جارٍ التسجيل...");
    try {
      await db.ref("users/" + tgUser.id).set({
        name: n, phone: p,
        username: tgUser.username || "",
        userId: tgUser.id,
        registeredAt: new Date().toISOString(),
      });
      onUnload();
      onSuccess(n);
    } catch {
      onUnload();
      setErr("حدث خطأ، حاول مرة أخرى");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(150deg, #1a57d4 0%, #246BFD 100%)",
        padding: "40px 24px 32px", textAlign: "center", color: "#fff",
      }}>
        <div style={{
          width: 72, height: 72, background: "rgba(255,255,255,0.18)",
          borderRadius: 22, margin: "0 auto 16px",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36,
        }}>
          <i className="ph ph-user-circle" />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>أهلاً بك!</h1>
        <p style={{ fontSize: 14, opacity: 0.85 }}>أدخل بياناتك للمتابعة</p>
      </div>

      {/* Form */}
      <div style={{ padding: "28px 20px", flex: 1, background: "#fff" }}>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Name */}
          <div>
            <label style={{ display: "block", fontWeight: 700, fontSize: 14, marginBottom: 8, color: "#374151" }}>
              الاسم الكامل
            </label>
            <div style={{ position: "relative" }}>
              <i className="ph ph-user" style={{
                position: "absolute", right: 14, top: "50%",
                transform: "translateY(-50%)", fontSize: 20, color: "#9CA3AF",
              }} />
              <input
                className="inp"
                type="text"
                placeholder="أدخل اسمك الكامل"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label style={{ display: "block", fontWeight: 700, fontSize: 14, marginBottom: 8, color: "#374151" }}>
              رقم الهاتف
            </label>
            <div style={{ position: "relative" }}>
              <i className="ph ph-phone" style={{
                position: "absolute", right: 14, top: "50%",
                transform: "translateY(-50%)", fontSize: 20, color: "#9CA3AF",
              }} />
              <input
                className="inp"
                type="tel"
                placeholder="07xxxxxxxx"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{ direction: "ltr", textAlign: "right" }}
              />
            </div>
          </div>

          {/* Error */}
          {err && (
            <div style={{
              background: "#FEF2F2", border: "1px solid #FECACA",
              borderRadius: 10, padding: "10px 14px",
              color: "#DC2626", fontSize: 13, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <i className="ph ph-warning-circle" style={{ fontSize: 18, flexShrink: 0 }} />
              {err}
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ marginTop: 4 }}>
            <i className="ph ph-check" style={{ fontSize: 20 }} />
            تسجيل ومتابعة
          </button>
        </form>
      </div>
    </div>
  );
}
