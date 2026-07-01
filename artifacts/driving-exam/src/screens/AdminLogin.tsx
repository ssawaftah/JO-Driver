import { useState } from "react";
import { auth } from "../lib/firebase";
import Header from "../components/Header";

interface Props {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError("أدخل البريد وكلمة المرور");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await auth.signInWithEmailAndPassword(email.trim(), password.trim());
      onLogin();
    } catch (err: any) {
      const msg = err.code === "auth/user-not-found" || err.code === "auth/wrong-password"
        ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
        : err.code === "auth/invalid-email"
        ? "بريد إلكتروني غير صالح"
        : "خطأ في تسجيل الدخول";
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh", background: "#0F1629", direction: "rtl" }}>
      <Header />
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", flex: 1, padding: "24px",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 22, background: "linear-gradient(135deg, #246BFD 0%, #1a54d4 100%)",
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24,
          boxShadow: "0 8px 32px rgba(36,107,253,0.3)",
        }}>
          <i className="ph ph-shield-check" style={{ fontSize: 36, color: "#fff" }} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, color: "#F0F2F7", letterSpacing: "-0.3px" }}>لوحة التحكم</h1>
        <p style={{ fontSize: 14, color: "#8B96B3", marginBottom: 32 }}>تسجيل الدخول للمشرف</p>
        <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} style={{ width: "100%", maxWidth: 320 }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="البريد الإلكتروني"
            autoComplete="email"
            style={{
              width: "100%", padding: "14px 16px", border: "1.5px solid #2A3650",
              borderRadius: 14, fontSize: 15, fontFamily: "inherit", marginBottom: 14,
              outline: "none", direction: "rtl", background: "#1A2236", color: "#F0F2F7",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)", transition: "border-color .15s",
            }}
            onFocus={e => e.currentTarget.style.borderColor = "#246BFD"}
            onBlur={e => e.currentTarget.style.borderColor = "#2A3650"}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            autoComplete="current-password"
            style={{
              width: "100%", padding: "14px 16px", border: "1.5px solid #2A3650",
              borderRadius: 14, fontSize: 15, fontFamily: "inherit", marginBottom: 14,
              outline: "none", direction: "rtl", background: "#1A2236", color: "#F0F2F7",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)", transition: "border-color .15s",
            }}
            onFocus={e => e.currentTarget.style.borderColor = "#246BFD"}
            onBlur={e => e.currentTarget.style.borderColor = "#2A3650"}
          />
          {error && <p style={{ color: "#EF4444", fontSize: 13, marginBottom: 14, fontWeight: 700 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "14px", borderRadius: 14, border: "none",
              background: "#246BFD", color: "#fff", fontSize: 15, fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
              fontFamily: "inherit", transition: "all .15s", boxShadow: "0 4px 16px rgba(36,107,253,0.3)",
            }}
          >
            {loading ? "جارٍ التحقق..." : "دخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
