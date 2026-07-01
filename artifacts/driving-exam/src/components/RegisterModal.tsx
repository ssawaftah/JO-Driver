import { useState } from "react";
import { db } from "../lib/firebase";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (name: string, key: string) => void;
}

export default function RegisterModal({ open, onClose, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const n = name.trim(), p = phone.trim();
    if (!n) { setErr("الرجاء إدخال الاسم الكامل"); return; }
    if (p.length < 10) { setErr("الرجاء إدخال رقم هاتف صحيح (10 أرقام)"); return; }

    setSaving(true);
    try {
      const key = "u_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
      await db.ref("users/" + key).set({
        name: n,
        phone: p,
        registeredAt: new Date().toISOString(),
      });
      onSuccess(n, key);
    } catch {
      setSaving(false);
      setErr("حدث خطأ، حاول مرة أخرى");
    }
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, direction: "rtl",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff", borderRadius: 20, padding: "24px",
          width: "100%", maxWidth: 400,
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          animation: "fadeUp 0.22s ease", animationFillMode: "both",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "linear-gradient(135deg, #246BFD, #4f86ff)",
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, margin: "0 auto 12px",
          }}>
            <i className="ph ph-steering-wheel" />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: "#111827", marginBottom: 4 }}>
            سجل بياناتك
          </h2>
          <p style={{ fontSize: 13, color: "#6B7280" }}>
            أدخل اسمك ورقم هاتفك لبدء الامتحان
          </p>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block", color: "#374151" }}>
              الاسم الكامل
            </label>
            <input
              className="inp"
              type="text"
              placeholder="أدخل اسمك الكامل"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block", color: "#374151" }}>
              رقم الهاتف
            </label>
            <input
              className="inp"
              type="tel"
              placeholder="07xxxxxxxx"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{ direction: "ltr", textAlign: "right" }}
            />
          </div>

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

          <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: 2 }}>
            <i className="ph ph-check" style={{ fontSize: 18 }} />
            {saving ? "جارٍ التسجيل..." : "بدء الامتحان"}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: "100%", height: 48, borderRadius: 14,
              border: "1.5px solid #E5E7EB", background: "#fff",
              color: "#6B7280", fontSize: 15, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            إلغاء
          </button>
        </form>
      </div>
    </div>
  );
}
