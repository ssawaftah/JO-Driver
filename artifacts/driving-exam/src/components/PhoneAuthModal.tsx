import { useState, useRef, useEffect } from "react";
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
  const [otp, setOtp] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const confirmRef = useRef<firebase.auth.ConfirmationResult | null>(null);
  const recaptchaRef = useRef<HTMLDivElement | null>(null);
  const recaptchaVerifierRef = useRef<firebase.auth.RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (!open) {
      // Reset state when modal closes
      setName(""); setPhone(""); setOtp(""); setAnonymous(false);
      setStep("phone"); setErr(""); setSaving(false); setCountdown(0);
      confirmRef.current = null;
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
      return;
    }
    // Setup invisible recaptcha
    const timer = setTimeout(() => {
      if (recaptchaRef.current && !recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new firebase.auth.RecaptchaVerifier(
          recaptchaRef.current, {
            size: "invisible",
            callback: () => {},
            "expired-callback": () => {},
          }
        );
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [open]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  async function sendOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setErr("");

    if (anonymous) {
      // Anonymous → no phone needed
      const anonKey = "anon_" + Date.now();
      saveSession("مجهول", anonKey);
      onSuccess("مجهول", anonKey);
      return;
    }

    const n = name.trim();
    const p = phone.trim();
    if (!n) { setErr("الرجاء إدخال الاسم"); return; }
    if (p.length < 10) { setErr("الرجاء إدخال رقم هاتف صحيح (عشر أرقام)"); return; }

    setSaving(true);
    try {
      const verifier = recaptchaVerifierRef.current;
      if (!verifier) { setErr("حدث خطأ في تحضير الميزان الأمني"); setSaving(false); return; }

      const normalized = p.startsWith("+") ? p : "+962" + p.replace(/^0/, "");
      const confirmation = await auth.signInWithPhoneNumber(normalized, verifier);
      confirmRef.current = confirmation;
      setStep("otp");
      setCountdown(60);
    } catch (error: any) {
      setErr(error?.message || "حدث خطأ أثناء إرسال رمز التحقق");
    }
    setSaving(false);
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const code = otp.trim();
    if (code.length !== 6) { setErr("الرجاء إدخال رمز التحقق بالكامل (6 أرقام)"); return; }

    setSaving(true);
    try {
      const confirmation = confirmRef.current;
      if (!confirmation) { setErr("انتهت صلاحية المرة ، أعد إرسال الرمز"); setSaving(false); return; }

      const result = await confirmation.confirm(code);
      const fbUser = result.user;
      const phoneNum = fbUser.phoneNumber || phone.trim();

      // Check if user already exists by phone
      const usersSnap = await db.ref("users").once("value");
      const users = usersSnap.val() || {};
      let existingKey: string | null = null;
      let existingName: string | null = null;
      for (const [key, user] of Object.entries(users)) {
        const u = user as any;
        if (u.phone === phoneNum) { existingKey = key; existingName = u.name; break; }
      }

      if (existingKey) {
        saveSession(existingName || name.trim(), existingKey);
        onSuccess(existingName || name.trim(), existingKey);
      } else {
        const key = "u_" + fbUser.uid;
        await db.ref("users/" + key).set({
          name: name.trim(),
          phone: phoneNum,
          registeredAt: new Date().toISOString(),
          firebaseUid: fbUser.uid,
        });
        saveSession(name.trim(), key);
        onSuccess(name.trim(), key);
      }
    } catch (error: any) {
      if (error?.code === "auth/invalid-verification-code") {
        setErr("رمز التحقق خاطئ ، حاول مرة أخرى");
      } else {
        setErr(error?.message || "حدث خطأ أثناء التحقق");
      }
    }
    setSaving(false);
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
          <p style={{ fontSize: 13, color: "#6B7280" }}>{subtitle || "أدخل بياناتك وتأكد من الرقم"}</p>
        </div>

        {step === "phone" ? (
          <form onSubmit={sendOtp} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {!anonymous && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block", color: "#374151" }}>الاسم الكامل</label>
                <input className="inp" type="text" placeholder="أدخل اسمك" value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}
            {!anonymous && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block", color: "#374151" }}>رقم الهاتف</label>
                <input className="inp" type="tel" placeholder="07xxxxxxxx" value={phone} onChange={e => setPhone(e.target.value)} style={{ direction: "ltr", textAlign: "right" }} />
              </div>
            )}
            {showAnonymous && (
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#6B7280" }}>
                <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} style={{ width: 18, height: 18, accentColor: "#246BFD" }} />
                التعليق كمجهول (بدون تأكيد الرقم)
              </label>
            )}
            {err && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", color: "#DC2626", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                <i className="ph ph-warning-circle" style={{ fontSize: 16, flexShrink: 0 }} />{err}
              </div>
            )}
            <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: 2 }}>
              <i className="ph ph-paper-plane-right" style={{ fontSize: 18 }} />
              {saving ? "جارٍ إرسال..." : (anonymous ? "نشر كمجهول" : "إرسال رمز التحقق")}
            </button>
            <button type="button" onClick={onClose} style={{ width: "100%", height: 48, borderRadius: 14, border: "1.5px solid #E5E7EB", background: "#fff", color: "#6B7280", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              إلغاء
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#F3F6FF", borderRadius: 12, padding: "12px 14px", fontSize: 13, color: "#246BFD", fontWeight: 700, textAlign: "center" }}>
              <i className="ph ph-envelope" style={{ marginLeft: 6 }} />
              تم إرسال رمز التحقق إلى {phone}
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block", color: "#374151" }}>رمز التحقق (6 أرقام)</label>
              <input className="inp" type="tel" placeholder="123456" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))} style={{ direction: "ltr", textAlign: "center", fontSize: 20, letterSpacing: 8, fontWeight: 900 }} />
            </div>
            {err && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", color: "#DC2626", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                <i className="ph ph-warning-circle" style={{ fontSize: 16, flexShrink: 0 }} />{err}
              </div>
            )}
            <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: 2 }}>
              <i className="ph ph-check" style={{ fontSize: 18 }} />
              {saving ? "جارٍ التحقق..." : "تأكيد وتسجيل"}
            </button>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={() => setStep("phone")} style={{ flex: 1, height: 44, borderRadius: 12, border: "1.5px solid #E5E7EB", background: "#fff", color: "#6B7280", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                <i className="ph ph-arrow-right" /> تعديل الرقم
              </button>
              <button type="button" onClick={sendOtp} disabled={countdown > 0 || saving} style={{ flex: 1, height: 44, borderRadius: 12, border: "1.5px solid #E5E7EB", background: "#fff", color: countdown > 0 ? "#9CA3AF" : "#246BFD", fontSize: 14, fontWeight: 700, cursor: countdown > 0 ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {countdown > 0 ? `إعادة الإرسال (${countdown})` : "إعادة الإرسال"}
              </button>
            </div>
            <button type="button" onClick={onClose} style={{ width: "100%", height: 48, borderRadius: 14, border: "1.5px solid #E5E7EB", background: "#fff", color: "#6B7280", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              إلغاء
            </button>
          </form>
        )}

        {/* Invisible reCAPTCHA container */}
        <div ref={recaptchaRef} style={{ position: "absolute", bottom: 0, left: 0, opacity: 0, pointerEvents: "none" }} />
      </div>
    </div>
  );
}
