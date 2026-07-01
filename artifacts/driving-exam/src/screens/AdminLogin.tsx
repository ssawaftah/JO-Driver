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
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh", background: "#fff" }}>
      <Header />
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", flex: 1, padding: "24px",
      }}>
      <div style={{
        width: 64, height: 64, borderRadius: 20, background: "#246BFD",
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24,
      }}>
        <i className="ph ph-shield-check" style={{ fontSize: 32, color: "#fff" }} />
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8, color: "#111827" }}>لوحة التحكم</h1>
      <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 24 }}>تسجيل الدخول للمشرف</p>
      <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} style={{ width: "100%", maxWidth: 320 }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="البريد الإلكتروني"
          autoComplete="email"
          style={{
            width: "100%", padding: "14px 16px", border: "1.5px solid #E5E7EB",
            borderRadius: 12, fontSize: 15, fontFamily: "inherit", marginBottom: 12,
            outline: "none", direction: "rtl",
          }}
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="كلمة المرور"
          autoComplete="current-password"
          style={{
            width: "100%", padding: "14px 16px", border: "1.5px solid #E5E7EB",
            borderRadius: 12, fontSize: 15, fontFamily: "inherit", marginBottom: 12,
            outline: "none", direction: "rtl",
          }}
        />
        {error && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none",
            background: "#246BFD", color: "#fff", fontSize: 15, fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
            fontFamily: "inherit",
          }}
        >
          {loading ? "جارٍ التحقق..." : "دخول"}
        </button>
      </form>
      </div>
    </div>
  );
}
