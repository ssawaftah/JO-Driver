import { useState, useEffect } from "react";
import Header from "../components/Header";
import AppFooter from "../components/Footer";
import ReviewModal from "../components/ReviewModal";
import { db } from "../lib/firebase";

const SESSION_KEY = "dex_user";
function loadSession(): { name: string; key: string } | null {
  try { const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "{}"); return s?.key ? s : null; } catch { return null; }
}

interface Props {
  ok: number;
  total: number;
  onBack: () => void;
  onRetry: () => void;
}

export default function Result({ ok, total, onBack, onRetry }: Props) {
  const [showReview, setShowReview] = useState(false);
  const pct = total > 0 ? Math.round((ok / total) * 100) : 0;
  const passed = pct >= 70;
  const wrong = total - ok;

  useEffect(() => {
    const session = loadSession();
    if (!session) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    db.ref("reviews").once("value").then(snap => {
      const val = snap.val() || {};
      const already = Object.values(val).some((r: any) => r.reviewerKey === session.key);
      if (!already) {
        timer = setTimeout(() => setShowReview(true), 800);
      }
    }).catch(() => {});
    return () => { if (timer) clearTimeout(timer); };
  }, []);

  const grade =
    pct >= 90 ? "ممتاز 🌟" :
    pct >= 80 ? "جيد جداً" :
    pct >= 70 ? "جيد ✅" :
    pct >= 50 ? "مقبول" : "يحتاج مراجعة";

  const color = passed ? "#16A34A" : "#DC2626";
  const bgColor = passed ? "#DCFCE7" : "#FEE2E2";

  // Circle SVG
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = circ - (pct / 100) * circ;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh", background: "#fff" }}>
      <Header />
      {/* Top colored bar */}
      <div style={{ height: 5, background: passed ? "#16A34A" : "#DC2626" }} />

      {/* Hero */}
      <div style={{
        padding: "36px 24px 28px", textAlign: "center",
        borderBottom: "1px solid #E5E7EB",
      }}>
        {/* Circle progress */}
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <svg width={130} height={130} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={65} cy={65} r={r} fill="none" stroke="#E5E7EB" strokeWidth={9} />
            <circle
              cx={65} cy={65} r={r} fill="none"
              stroke={color} strokeWidth={9}
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={dash}
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
          </svg>
          <div style={{
            position: "absolute", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{pct}%</span>
          </div>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111827", marginBottom: 6 }}>{grade}</h2>
        <p style={{ fontSize: 14, color: "#6B7280" }}>
          {passed ? "أحسنت! لقد اجتزت الاختبار بنجاح" : "لم تجتز الاختبار هذه المرة، حاول مجدداً"}
        </p>
      </div>

      {/* Stats */}
      <div style={{ padding: "20px 16px", display: "flex", gap: 10 }}>
        {[
          { label: "إجابة صحيحة", val: ok,    color: "#16A34A", bg: "#DCFCE7" },
          { label: "إجابة خاطئة", val: wrong, color: "#DC2626", bg: "#FEE2E2" },
          { label: "إجمالي",      val: total, color: "#2563EB", bg: "#DBEAFE" },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, background: s.bg, borderRadius: 14, padding: "14px 8px", textAlign: "center",
          }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: s.color, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Message */}
      <div style={{ padding: "0 16px 20px" }}>
        <div style={{
          background: bgColor, borderRadius: 14, padding: "14px 16px",
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <i className={`ph ph-${passed ? "check-circle" : "lightbulb"}`}
             style={{ fontSize: 22, color, flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 14, color: passed ? "#15803D" : "#DC2626", lineHeight: 1.7 }}>
            {passed
              ? "أداء رائع! استمر في المراجعة للوصول إلى نتيجة أفضل."
              : "لا تيأس! راجع الأسئلة جيداً وستحقق نتيجة أفضل في المرة القادمة."}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ padding: "0 16px 32px", display: "flex", flexDirection: "column", gap: 10 }}>
        <button className="btn-primary" onClick={onRetry}>
          <i className="ph ph-arrow-clockwise" style={{ fontSize: 20 }} />
          إعادة الاختبار
        </button>
        <button className="btn-outline" onClick={onBack}>
          <i className="ph ph-folder-open" style={{ fontSize: 20 }} />
          العودة للأقسام
        </button>
      </div>
      <AppFooter />

      <ReviewModal
        open={showReview}
        onClose={() => setShowReview(false)}
        context="test"
        title="قيّم تجربة الاختبار"
        subtitle="كيف كان الاختبار ؟"
      />
    </div>
  );
}
