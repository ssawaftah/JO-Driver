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
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh", background: "#F6F8FB", direction: "rtl" }}>
      <Header />
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", flex: 1, padding: "24px",
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, background: "#246BFD",
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
        }}>
          <i className="ph ph-shield-check" style={{ fontSize: 32, color: "#fff" }} />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6, color: "#1A1D1F" }}>لوحة التحكم</h1>
        <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 28 }}>تسجيل الدخول للمشرف</p>
        <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} style={{ width: "100%", maxWidth: 320 }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="البريد الإلكتروني"
            autoComplete="email"
            style={{
              width: "100%", padding: "14px 16px", border: "1.5px solid #E8EAED",
              borderRadius: 14, fontSize: 15, fontFamily: "inherit", marginBottom: 14,
              outline: "none", direction: "rtl", background: "#fff", color: "#1A1D1F",
              transition: "border-color .15s, box-shadow .15s",
            }}
            onFocus={e => { e.currentTarget.style.borderColor = "#246BFD"; e.currentTarget.style.boxShadow = "0 0 0 3px #E8F0FE"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "#E8EAED"; e.currentTarget.style.boxShadow = "none"; }}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            autoComplete="current-password"
            style={{
              width: "100%", padding: "14px 16px", border: "1.5px solid #E8EAED",
              borderRadius: 14, fontSize: 15, fontFamily: "inherit", marginBottom: 14,
              outline: "none", direction: "rtl", background: "#fff", color: "#1A1D1F",
              transition: "border-color .15s, box-shadow .15s",
            }}
            onFocus={e => { e.currentTarget.style.borderColor = "#246BFD"; e.currentTarget.style.boxShadow = "0 0 0 3px #E8F0FE"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "#E8EAED"; e.currentTarget.style.boxShadow = "none"; }}
          />
          {error && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 14, fontWeight: 700 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "14px", borderRadius: 14, border: "none",
              background: "#246BFD", color: "#fff", fontSize: 15, fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
              fontFamily: "inherit", transition: "all .15s",
            }}
          >
            {loading ? "جارٍ التحقق..." : "دخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
