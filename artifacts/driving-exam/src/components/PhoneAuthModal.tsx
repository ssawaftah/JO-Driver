import { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import firebase from "firebase/compat/app";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (name: string, key: string) => void;
  showAnonymous?: boolean;
  title?: string;
  subtitle?: string;
}

const SESSION_KEY = "dex_user";
function saveSession(name: string, key: string) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify({ name, key })); } catch {}
}

export default function PhoneAuthModal({
  open, onClose, onSuccess, showAnonymous = false, title, subtitle,
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [step, setStep] = useState<"login" | "details">("login");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [anonUser, setAnonUser] = useState<firebase.User | null>(null);

  useEffect(() => {
    if (!open) {
      setName(""); setPhone(""); setAnonymous(false);
      setStep("login"); setErr(""); setSaving(false);
      setAnonUser(null);
    }
  }, [open]);

  async function signInAnonymously() {
    setErr(""); setSaving(true);
    try {
      const result = await auth.signInAnonymously();
      const user = result.user;
      if (!user) throw new Error("فشل إنشاء الجلسة");
      setAnonUser(user);
      setStep("details");
    } catch (error: any) {
      console.error("Anonymous auth error:", error);
      let userMsg = "فشل تسجيل الدخول. حاول مجدداً.";
      const code = error?.code || "";
      if (code.includes("operation-not-allowed")) userMsg = "تسجيل الدخول المجهول غير مفعل في Firebase Console. اذهب إلى Authentication > Sign-in method وفعّل 'Anonymous'.";
      else if (error?.message) userMsg = error.message;
      setErr(userMsg);
    }
    setSaving(false);
  }

  async function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const n = name.trim();
    const p = phone.trim();
    if (!n) { setErr("الرجاء إدخال الاسم"); return; }

    setSaving(true);
    try {
      const user = anonUser;
      if (!user) { setErr("انتهت الجلسة، أعد المحاولة"); setSaving(false); return; }

      const key = "u_" + user.uid;
      await db.ref("users/" + key).set({
        name: n,
        phone: p,
        registeredAt: new Date().toISOString(),
        firebaseUid: user.uid,
      });
      saveSession(n, key);
      onSuccess(n, key);
    } catch (error: any) {
      setErr(error?.message || "حدث خطأ أثناء الحفظ");
    }
    setSaving(false);
  }

  function handleAnonymous() {
    const anonKey = "anon_" + Date.now();
    saveSession("مجهول", anonKey);
    onSuccess("مجهول", anonKey);
  }

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, direction: "rtl" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "24px", width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", animation: "fadeUp 0.22s ease", animationFillMode: "both" }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #246BFD, #4f86ff)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 12px" }}>
            <i className="ph ph-shield-check" />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: "#111827", marginBottom: 4 }}>{title || "تسجيل الدخول"}</h2>
          <p style={{ fontSize: 13, color: "#6B7280" }}>{subtitle || "سجّل بياناتك للمتابعة"}</p>
        </div>

        {step === "login" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Primary: Register with name + phone */}
            <button
              type="button"
              onClick={signInAnonymously}
              disabled={saving}
              className="btn-primary"
              style={{ width: "100%", height: 52, borderRadius: 14, fontSize: 15, fontWeight: 700 }}
            >
              <i className="ph ph-user-plus" style={{ fontSize: 18 }} />
              {saving ? "جارٍ التسجيل..." : "سجّل بياناتك"}
            </button>

            {/* Anonymous option */}
            {showAnonymous && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#9CA3AF" }}>
                  <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
                  <span style={{ fontSize: 12, fontWeight: 700 }}>أو</span>
                  <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#6B7280" }}>
                  <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} style={{ width: 18, height: 18, accentColor: "#246BFD" }} />
                  التعليق كمجهول (بدون تسجيل)
                </label>
                <button
                  type="button"
                  onClick={handleAnonymous}
                  disabled={!anonymous || saving}
                  style={{
                    width: "100%", height: 48, borderRadius: 14, border: "1.5px solid #E5E7EB",
                    background: anonymous ? "#F9FAFB" : "#fff", color: anonymous ? "#374151" : "#9CA3AF",
                    fontSize: 15, fontWeight: 700, cursor: anonymous ? "pointer" : "not-allowed", fontFamily: "inherit",
                  }}
                >
                  <i className="ph ph-user-circle" style={{ fontSize: 18, marginLeft: 6 }} />
                  نشر كمجهول
                </button>
              </>
            )}

            {err && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", color: "#DC2626", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                <i className="ph ph-warning-circle" style={{ fontSize: 16, flexShrink: 0 }} />{err}
              </div>
            )}

            <button type="button" onClick={onClose} style={{ width: "100%", height: 48, borderRadius: 14, border: "1.5px solid #E5E7EB", background: "#fff", color: "#6B7280", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              إلغاء
            </button>
          </div>
        ) : (
          <form onSubmit={saveDetails} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#F3F6FF", borderRadius: 12, padding: "12px 14px", fontSize: 13, color: "#246BFD", fontWeight: 700, textAlign: "center" }}>
              <i className="ph ph-check-circle" style={{ marginLeft: 6 }} />
              تم إنشاء جلسة آمنة
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block", color: "#374151" }}>الاسم الكامل *</label>
              <input className="inp" type="text" placeholder="أدخل اسمك" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block", color: "#374151" }}>رقم الهاتف (اختياري)</label>
              <input className="inp" type="tel" placeholder="07xxxxxxxx" value={phone} onChange={e => setPhone(e.target.value)} style={{ direction: "ltr", textAlign: "right" }} />
            </div>
            {err && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", color: "#DC2626", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                <i className="ph ph-warning-circle" style={{ fontSize: 16, flexShrink: 0 }} />{err}
              </div>
            )}
            <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: 2 }}>
              <i className="ph ph-check" style={{ fontSize: 18 }} />
              {saving ? "جارٍ الحفظ..." : "حفظ والمتابعة"}
            </button>
            <button type="button" onClick={() => setStep("login")} style={{ width: "100%", height: 48, borderRadius: 14, border: "1.5px solid #E5E7EB", background: "#fff", color: "#6B7280", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              <i className="ph ph-arrow-right" /> العودة
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
