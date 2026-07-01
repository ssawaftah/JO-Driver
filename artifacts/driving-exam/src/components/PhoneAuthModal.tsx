import { useState, useEffect, useRef } from "react";
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
  const [step, setStep] = useState<"login" | "checking" | "details" | "success">("login");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [googleUser, setGoogleUser] = useState<firebase.User | null>(null);
  const savingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) {
      setName(""); setPhone(""); setAnonymous(false);
      setStep("login"); setErr(""); setSaving(false);
      setGoogleUser(null);
      if (savingTimerRef.current) {
        clearTimeout(savingTimerRef.current);
        savingTimerRef.current = null;
      }
    }
  }, [open]);

  async function signInWithGoogle() {
    setErr(""); setSaving(true);
    // Safety timeout: if popup hangs silently, reset button after 10 seconds
    savingTimerRef.current = setTimeout(() => {
      setSaving(false);
      savingTimerRef.current = null;
    }, 10000);

    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope("email");
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await auth.signInWithPopup(provider);
      const user = result.user;
      if (!user) throw new Error("فشل تسجيل الدخول");

      // Show checking spinner while we verify user in DB
      setStep("checking");

      // Check if user already exists in our DB by firebaseUid
      const usersSnap = await db.ref("users").once("value");
      const users = usersSnap.val() || {};
      let existingKey: string | null = null;
      let existingName: string | null = null;

      for (const [key, userData] of Object.entries(users)) {
        const u = userData as any;
        if (u.firebaseUid === user.uid) { existingKey = key; existingName = u.name; break; }
      }

      if (existingKey) {
        // Already registered — update email/photo then show success
        await db.ref("users/" + existingKey).update({ email: user.email || "", photoURL: user.photoURL || "" });
        saveSession(existingName || user.displayName || "مستخدم", existingKey);
        setSaving(false);
        setStep("success");
        setTimeout(() => onSuccess(existingName || user.displayName || "مستخدم", existingKey), 1500);
      } else {
        // New user — ask for name + phone
        setGoogleUser(user);
        setName(user.displayName || "");
        setSaving(false);
        setStep("details");
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      let userMsg = "فشل تسجيل الدخول بواسطة Google. حاول مجدداً.";
      const code = error?.code || "";
      if (code.includes("popup-closed-by-user")) userMsg = "تم إغلاق نافذة Google قبل إتمام التسجيل.";
      else if (code.includes("popup-blocked")) userMsg = "تم حظر النافذة المنبثقة. تأكد من السماح بالنوافذ المنبثقة في المتصفح أو أغلق مانع الإعلانات.";
      else if (code.includes("account-exists-with-different-credential")) userMsg = "هذا البريد مسجل بطريقة أخرى.";
      else if (code.includes("unauthorized-domain")) userMsg = "هذا النطاق غير مصرح له. أضفه إلى Firebase Console > Auth > Settings > Authorized domains.";
      else if (code.includes("operation-not-allowed")) userMsg = "تسجيل الدخول بواسطة Google غير مفعل. اذهب إلى Authentication > Sign-in method وفعّل 'Google'.";
      else if (error?.message) userMsg = error.message;
      setErr(userMsg);
    } finally {
      if (savingTimerRef.current) {
        clearTimeout(savingTimerRef.current);
        savingTimerRef.current = null;
      }
      setSaving(false);
    }
  }

  async function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const n = name.trim();
    const p = phone.trim();
    if (!n) { setErr("الرجاء إدخال الاسم"); return; }
    if (p.length < 10) { setErr("الرجاء إدخال رقم هاتف صالح (عشر أرقام)"); return; }

    setSaving(true);
    try {
      const user = googleUser;
      if (!user) { setErr("انتهت الجلسة، أعد تسجيل الدخول"); setSaving(false); return; }

      const key = "u_" + user.uid;
      await db.ref("users/" + key).set({
        name: n,
        phone: p,
        email: user.email || "",
        photoURL: user.photoURL || "",
        registeredAt: new Date().toISOString(),
        firebaseUid: user.uid,
      });
      saveSession(n, key);
      setSaving(false);
      setStep("success");
      setTimeout(() => onSuccess(n, key), 1500);
    } catch (error: any) {
      setErr(error?.message || "حدث خطأ أثناء الحفظ");
      setSaving(false);
    }
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
          <p style={{ fontSize: 13, color: "#6B7280" }}>{subtitle || "سجّل بواسطة Google للمتابعة"}</p>
        </div>

        {step === "success" ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "20px 0" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#22C55E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, animation: "popIn 0.35s cubic-bezier(0.175,0.885,0.32,1.275)" }}>
              <i className="ph ph-check" />
            </div>
            <p style={{ fontSize: 16, fontWeight: 900, color: "#111827" }}>تم تسجيل الدخول بنجاح</p>
            <p style={{ fontSize: 13, color: "#6B7280" }}>جارٍ الانتقال...</p>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #E5E7EB", borderTopColor: "#246BFD", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : step === "checking" ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "20px 0" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid #E5E7EB", borderTopColor: "#246BFD", animation: "spin 0.8s linear infinite" }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: "#374151" }}>جارٍ التحقق من البيانات...</p>
            <p style={{ fontSize: 12, color: "#6B7280" }}>تم تسجيل الدخول بواسطة Google</p>
          </div>
        ) : step === "login" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Google Sign In button */}
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={saving}
              style={{
                width: "100%", height: 52, borderRadius: 14, border: "1.5px solid #E5E7EB",
                background: "#fff", color: "#374151", fontSize: 15, fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {saving ? "جارٍ التسجيل..." : "سجّل بواسطة Google"}
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
              تم تسجيل الدخول بواسطة Google
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block", color: "#374151" }}>الاسم الكامل *</label>
              <input className="inp" type="text" placeholder="أدخل اسمك" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block", color: "#374151" }}>رقم الهاتف *</label>
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
