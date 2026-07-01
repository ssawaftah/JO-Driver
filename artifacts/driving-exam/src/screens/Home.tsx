import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import Header from "../components/Header";
import AppFooter from "../components/Footer";
import SideDrawer from "../components/SideDrawer";

const SESSION_KEY = "dex_user";
function loadSession(): { name: string; key: string } | null {
  try { const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "{}"); return s?.key ? s : null; } catch { return null; }
}
function saveSession(name: string, key: string) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify({ name, key })); } catch {}
}

interface Props {
  name: string;
  onExam: () => void;
  onStudy: () => void;
  onCenters: () => void;
  onGuide: () => void;
}

const cards = [
  { icon: "pencil-line",        color: "#16A34A", bg: "#DCFCE7", title: "الامتحان النظري",      desc: "محاكاة واقعية لاختبار القيادة",              badge: null, action: "onExam"    },
  { icon: "book-open",          color: "#2563EB", bg: "#DBEAFE", title: "دراسة الأسئلة",        desc: "مراجعة الأسئلة حسب الأقسام",                badge: null, action: "onStudy"   },
  { icon: "map-pin",            color: "#D97706", bg: "#FEF3C7", title: "مراكز تدريب القيادة", desc: "ابحث عن أقرب مركز تدريب معتمد",             badge: null, action: "onCenters" },
  { icon: "book-open-text",     color: "#7C3AED", bg: "#EDE9FE", title: "دليل الامتحان النظري",  desc: "خطوات، وثائق، رسوم، شروط وأسئلة شائعة",     badge: null, action: "onGuide"   },
];

/* ── Star Rating Input ──────────────────────────────────────────── */
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

/* ── Review Card ───────────────────────────────────────────────────────── */
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

/* ── Register Modal for Review ─────────────────────────────────────────────── */
function ReviewRegModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: (name: string, key: string) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  if (!open) return null;
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    const n = name.trim(), p = phone.trim();
    if (!anonymous && !n) { setErr("الرجاء إدخال الاسم"); return; }
    if (p.length < 10) { setErr("الرجاء إدخال رقم هاتف صحيح (عشر أرقام)"); return; }
    setSaving(true);
    try {
      const key = "u_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
      await db.ref("users/" + key).set({ name: anonymous ? "مجهول" : n, phone: p, registeredAt: new Date().toISOString() });
      saveSession(anonymous ? "مجهول" : n, key);
      onSuccess(anonymous ? "مجهول" : n, key);
    } catch { setSaving(false); setErr("حدث خطأ، حاول مرة أخرى"); }
  }
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, direction: "rtl" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "24px", width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", animation: "fadeUp 0.22s ease", animationFillMode: "both" }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #246BFD, #4f86ff)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 12px" }}>
            <i className="ph ph-user-plus" />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: "#111827", marginBottom: 4 }}>تسجيل الدخول</h2>
          <p style={{ fontSize: 13, color: "#6B7280" }}>سجّل بياناتك لنشر رأيك</p>
        </div>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {!anonymous && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block", color: "#374151" }}>الاسم الكامل</label>
              <input className="inp" type="text" placeholder="أدخل اسمك" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block", color: "#374151" }}>رقم الهاتف <span style={{ color: "#9CA3AF", fontWeight: 400, fontSize: 11 }}>(لن يتم نشر الرقم علنياً)</span></label>
            <input className="inp" type="tel" placeholder="07xxxxxxxx" value={phone} onChange={e => setPhone(e.target.value)} style={{ direction: "ltr", textAlign: "right" }} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#6B7280" }}>
            <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} style={{ width: 18, height: 18, accentColor: "#246BFD" }} />
            التعليق كمجهول
          </label>
          {err && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", color: "#DC2626", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              <i className="ph ph-warning-circle" style={{ fontSize: 16, flexShrink: 0 }} />{err}
            </div>
          )}
          <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: 2 }}>
            <i className="ph ph-check" style={{ fontSize: 18 }} />{saving ? "جارٍ التسجيل..." : "تسجيل ونشر"}
          </button>
          <button type="button" onClick={onClose} style={{ width: "100%", height: 48, borderRadius: 14, border: "1.5px solid #E5E7EB", background: "#fff", color: "#6B7280", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            إلغاء
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Home({ name, onExam, onStudy, onCenters, onGuide, footerData }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const actions: Record<string, () => void> = { onExam, onStudy, onCenters, onGuide };
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
        </div>

        {/* ── Visitor Log Section ── */}
        <div style={{ background: "#fff", border: "1.5px solid #F0F1F3", borderRadius: 16, padding: 16, marginTop: 16 }}>
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #F59E0B, #F97316)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, margin: "0 auto 10px" }}>
              <i className="ph ph-star" />
            </div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#111827", marginBottom: 4 }}>سجل الزوار</div>
            <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.7 }}>
              إذا استفدت من الموقع، رأيك هو أكبر داعم لنا للاستمرار. شاركنا تجربتك!
            </div>
          </div>

          {/* Star input */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", textAlign: "center", marginBottom: 8 }}>قيّم تجربتك</div>
            <StarInput value={reviewStars} onChange={setReviewStars} />
          </div>

          {/* Comment */}
          <div style={{ marginBottom: 12 }}>
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="اكتب رأيك هنا..."
              rows={3}
              style={{
                width: "100%", padding: "12px 14px", border: "1.5px solid #E5E7EB", borderRadius: 12,
                background: "#F9FAFB", fontSize: 14, fontFamily: "inherit", color: "#111827", outline: "none", resize: "vertical",
                transition: "border-color .15s",
              }}
              onFocus={e => e.currentTarget.style.borderColor = "#246BFD"}
              onBlur={e => e.currentTarget.style.borderColor = "#E5E7EB"}
            />
          </div>

          {/* Submit */}
          <button
            onClick={submitReview}
            disabled={reviewSaving}
            style={{
              width: "100%", padding: "12px", borderRadius: 12, border: "none",
              background: "#246BFD", color: "#fff", fontSize: 14, fontWeight: 800,
              cursor: reviewSaving ? "not-allowed" : "pointer", opacity: reviewSaving ? 0.6 : 1,
              fontFamily: "inherit", transition: "all .15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            <i className="ph ph-paper-plane-right" style={{ fontSize: 16 }} />
            {reviewSaving ? "جارٍ النشر..." : "نشر الرأي"}
          </button>

          {reviewMsg && (
            <div style={{ marginTop: 10, textAlign: "center", fontSize: 12, fontWeight: 700, color: reviewMsg.includes("شكراً") ? "#16A34A" : "#DC2626", padding: "8px 12px", borderRadius: 10, background: reviewMsg.includes("شكراً") ? "#DCFCE7" : "#FEE2E2" }}>
              {reviewMsg}
            </div>
          )}

          {/* Reviews list */}
          {reviewsList.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#9CA3AF", marginBottom: 10, textAlign: "center" }}>آخر التقييمات</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {reviewsList.slice(0, 10).map(r => (
                  <ReviewCard key={r.id} name={r.name} stars={r.stars} comment={r.comment} date={r.createdAt ? new Date(r.createdAt).toLocaleDateString("ar-JO") : "-"} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <AppFooter />

      {/* Registration modal for reviews */}
      <ReviewRegModal open={showReg} onClose={() => setShowReg(false)} onSuccess={(name, key) => { setShowReg(false); submitReview(); }} />
    </div>
  );
}
