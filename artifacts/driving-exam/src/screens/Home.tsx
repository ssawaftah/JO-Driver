import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import Header from "../components/Header";
import AppFooter from "../components/Footer";
import SideDrawer from "../components/SideDrawer";
import PhoneAuthModal from "../components/PhoneAuthModal";

const SESSION_KEY = "dex_user";
function loadSession(): { name: string; key: string } | null {
  try { const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "{}"); return s?.key ? s : null; } catch { return null; }
}

interface Props {
  name: string;
  onExam: () => void;
  onStudy: () => void;
  onCenters: () => void;
  onGuide: () => void;
  onReviews: () => void;
}

const cards = [
  { icon: "pencil-line",        color: "#16A34A", bg: "#DCFCE7", title: "الامتحان النظري",      desc: "محاكاة واقعية لاختبار القيادة",              badge: null, action: "onExam"    },
  { icon: "book-open",          color: "#2563EB", bg: "#DBEAFE", title: "دراسة الأسئلة",        desc: "مراجعة الأسئلة حسب الأقسام",                badge: null, action: "onStudy"   },
  { icon: "map-pin",            color: "#D97706", bg: "#FEF3C7", title: "مراكز تدريب القيادة", desc: "ابحث عن أقرب مركز تدريب معتمد",             badge: null, action: "onCenters" },
  { icon: "book-open-text",     color: "#7C3AED", bg: "#EDE9FE", title: "دليل الطالب",  desc: "خطوات، وثائق، رسوم، شروط وأسئلة شائعة",     badge: null, action: "onGuide"   },
];

const extraCards = [
  { icon: "star", color: "#F59E0B", bg: "#FEF3C7", title: "سجل الزوار", desc: "قيّم تجربتك واطلاع رأيك", action: "onReviews" },
];

/* ── Star Rating Input ─────────────────────────────────── */
function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const displayValue = hover || value;
  return (
    <div style={{ display: "flex", gap: 4, direction: "ltr", justifyContent: "center" }} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => { onChange(n); setHover(0); }} onMouseEnter={() => setHover(n)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 2, fontFamily: "inherit", touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}>
          <i className={`ph ${n <= displayValue ? "ph-star-fill" : "ph-star"}`}
            style={{ fontSize: 28, color: n <= displayValue ? "#F59E0B" : "#D1D5DB", transition: "color .15s" }} />
        </button>
      ))}
    </div>
  );
}

/* ── Review Card ─────────────────────────────────────────────── */
function ReviewCard({ name, stars, comment, date }: { name: string; stars: number; comment: string; date: string }) {
  return (
    <div style={{ background: "#fff", border: "1.5px solid #F0F1F3", borderRadius: 14, padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #246BFD, #4f86ff)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, flexShrink: 0 }}>
            {name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>{name}</div>
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>{date}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 2, direction: "ltr" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <i key={i} className={`ph ph-star${i < stars ? "-fill" : ""}`} style={{ fontSize: 13, color: i < stars ? "#F59E0B" : "#D1D5DB" }} />
          ))}
        </div>
      </div>
      {comment && (
        <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#374151", lineHeight: 1.7 }}>
          <i className="ph ph-quotes" style={{ color: "#9CA3AF", fontSize: 16, display: "block", marginBottom: 4 }} />
          {comment}
        </div>
      )}
    </div>
  );
}

export default function Home({ name, onExam, onStudy, onCenters, onGuide, onReviews }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const actions: Record<string, () => void> = { onExam, onStudy, onCenters, onGuide, onReviews };
  const hour = new Date().getHours();
  const greet = hour < 12 ? "صباح الخير" : hour < 18 ? "مساء الخير" : "مساء النور";

  // Review states
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");
  const [showReg, setShowReg] = useState(false);
  const [reviewsList, setReviewsList] = useState<{ id: string; name: string; stars: number; comment: string; createdAt: string }[]>([]);

  useEffect(() => {
    db.ref("reviews").once("value").then(snap => {
      const val = snap.val() || {};
      const arr = Object.entries(val).map(([id, r]: [string, any]) => ({ id, ...r })).sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setReviewsList(arr);
    }).catch(() => {});
  }, []);

  async function submitReview() {
    if (reviewStars === 0) { setReviewMsg("اختر تقييماً بالنجوم"); return; }
    const session = loadSession();
    if (!session) { setShowReg(true); return; }
    setReviewSaving(true); setReviewMsg("");
    try {
      await db.ref("reviews").push({ name: session.name, stars: reviewStars, comment: reviewComment.trim(), createdAt: new Date().toISOString() });
      setReviewStars(0); setReviewComment(""); setReviewMsg("شكراً! تم نشر رأيك بنجاح");
      const snap = await db.ref("reviews").once("value");
      const val = snap.val() || {};
      const arr = Object.entries(val).map(([id, r]: [string, any]) => ({ id, ...r })).sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setReviewsList(arr);
    } catch { setReviewMsg("حدث خطأ أثناء النشر"); }
    setReviewSaving(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh", background: "#F3F6FF" }}>
      <Header onMenuOpen={() => setDrawerOpen(true)} />
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div style={{ padding: "20px 16px", flex: 1 }}>
        {/* Greeting */}
        <div style={{
          background: "linear-gradient(135deg, #246BFD 0%, #4f86ff 100%)",
          borderRadius: 20, padding: "20px", marginBottom: 20, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <p style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>{greet}،</p>
            <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>{name || "مرحباً بك!"}</h1>
            <p style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>جاهز لامتحان القيادة النظري في الأردن؟</p>
          </div>
          <div style={{ fontSize: 48, opacity: 0.25 }}>
            <i className="ph ph-student" />
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {cards.map(c => (
            <button
              key={c.title}
              onClick={actions[c.action]}
              style={{
                background: "#fff", border: "1.5px solid #E5E7EB",
                borderRadius: 16, padding: "16px",
                display: "flex", alignItems: "center", gap: 14,
                cursor: "pointer", fontFamily: "inherit", textAlign: "right",
                width: "100%", transition: "border-color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "#246BFD")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "#E5E7EB")}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                background: c.bg, color: c.color,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
              }}>
                <i className={`ph ph-${c.icon}`} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>{c.title}</span>
                  {c.badge && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 8px",
                      borderRadius: 20, background: "#FEF3C7", color: "#92400E",
                    }}>{c.badge}</span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: "#6B7280" }}>{c.desc}</p>
              </div>
              <i className="ph ph-caret-left" style={{ fontSize: 18, color: "#D1D5DB", flexShrink: 0 }} />
            </button>
          ))}

          {extraCards.map(c => (
            <button
              key={c.title}
              onClick={actions[c.action]}
              style={{
                background: "#fff", border: "1.5px solid #E5E7EB",
                borderRadius: 16, padding: "16px",
                display: "flex", alignItems: "center", gap: 14,
                cursor: "pointer", fontFamily: "inherit", textAlign: "right",
                width: "100%", transition: "border-color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "#F59E0B")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "#E5E7EB")}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                background: c.bg, color: c.color,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
              }}>
                <i className={`ph ph-${c.icon}`} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>{c.title}</span>
                </div>
                <p style={{ fontSize: 13, color: "#6B7280" }}>{c.desc}</p>
              </div>
              <i className="ph ph-caret-left" style={{ fontSize: 18, color: "#D1D5DB", flexShrink: 0 }} />
            </button>
          ))}
        </div>
      </div>
      <AppFooter />

      {/* Inline review form on home is simplified - just navigate to reviews page */}
    </div>
  );
}
