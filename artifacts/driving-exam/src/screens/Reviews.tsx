import { useState, useEffect, useRef } from "react";
import { db } from "../lib/firebase";
import Header from "../components/Header";
import AppFooter from "../components/Footer";
import SideDrawer from "../components/SideDrawer";
import PhoneAuthModal from "../components/PhoneAuthModal";

const SESSION_KEY = "dex_user";
function loadSession(): { name: string; key: string } | null {
  try { const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "{}"); return s?.key ? s : null; } catch { return null; }
}

/* ── SVG Star ──────────────────────────────────────────── */
function StarIcon({ filled, size = 32 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#F59E0B" : "none"} stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "all .15s" }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/* ── Star Rating Input ─────────────────────────────────── */
function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const displayValue = hover || value;
  return (
    <div style={{ display: "flex", gap: 6, direction: "ltr", justifyContent: "center" }} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onTouchStart={() => { setHover(n); }}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 2, fontFamily: "inherit", touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}>
          <StarIcon filled={n <= displayValue} size={36} />
        </button>
      ))}
    </div>
  );
}

/* ── Review Card ─────────────────────────────────────────────── */
function ReviewCard({ name, stars, comment, date }: { name: string; stars: number; comment: string; date: string }) {
  return (
    <div style={{ background: "#fff", border: "1.5px solid #F0F1F3", borderRadius: 14, padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, direction: "rtl" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #246BFD, #4f86ff)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, flexShrink: 0 }}>
            {name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>{name}</div>
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>{date}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 3, direction: "ltr" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon key={i} filled={i < stars} size={16} />
          ))}
        </div>
      </div>
      {comment && (
        <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, marginTop: 4 }}>
          {comment}
        </div>
      )}
    </div>
  );
}

/* ── Reviews Screen ─────────────────────────────────────────────── */
export default function ReviewsScreen({ onBack }: { onBack: () => void }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");
  const [showReg, setShowReg] = useState(false);
  const [reviewsList, setReviewsList] = useState<{ id: string; name: string; stars: number; comment: string; createdAt: string }[]>([]);
  const [postAsAnonymous, setPostAsAnonymous] = useState(false);
  const msgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load reviews on mount
  useEffect(() => {
    db.ref("reviews").once("value").then(snap => {
      const val = snap.val() || {};
      const arr = Object.entries(val).map(([id, r]: [string, any]) => ({ id, ...r })).sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setReviewsList(arr);
    }).catch(() => {});
  }, []);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (reviewMsg && reviewMsg.includes("شكرا")) {
      if (msgTimerRef.current) clearTimeout(msgTimerRef.current);
      msgTimerRef.current = setTimeout(() => setReviewMsg(""), 3000);
    }
    return () => { if (msgTimerRef.current) clearTimeout(msgTimerRef.current); };
  }, [reviewMsg]);

  async function submitReview() {
    if (reviewStars === 0) { setReviewMsg("اختر تقييماً بالنجوم"); return; }
    const session = loadSession();

    // No session or anonymous session → show registration every time
    if (!session || session.key.startsWith("anon_")) { setShowReg(true); return; }

    // Registered user → verify key exists in DB
    setReviewSaving(true); setReviewMsg("");
    try {
      const userSnap = await db.ref("users/" + session.key).once("value");
      if (!userSnap.exists()) {
        // Key not found in DB → clear session and show registration
        localStorage.removeItem(SESSION_KEY);
        setShowReg(true);
        setReviewSaving(false);
        return;
      }
      // User exists → publish
      const displayName = postAsAnonymous ? "مجهول" : session.name;
      await db.ref("reviews").push({ name: displayName, stars: reviewStars, comment: reviewComment.trim(), createdAt: new Date().toISOString() });
      setReviewStars(0); setReviewComment(""); setPostAsAnonymous(false);
      setReviewMsg("شكراً! تم نشر رأيك بنجاح");
      const snap = await db.ref("reviews").once("value");
      const val = snap.val() || {};
      const arr = Object.entries(val).map(([id, r]: [string, any]) => ({ id, ...r })).sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setReviewsList(arr);
    } catch { setReviewMsg("حدث خطأ أثناء النشر"); }
    setReviewSaving(false);
  }

  const session = loadSession();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh", background: "#F3F6FF" }}>
      <Header onMenuOpen={() => setDrawerOpen(true)} />
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div style={{ padding: "16px", flex: 1 }}>
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #F59E0B, #F97316)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 10px" }}>
            <i className="ph ph-star" />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: "#111827", margin: 0 }}>سجل الزوار</h1>
          <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>شاركنا تجربتك وقيّم خدماتنا</p>
        </div>

        {/* Review Form */}
        <div style={{ background: "#fff", border: "1.5px solid #F0F1F3", borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#111827", marginBottom: 12, textAlign: "center" }}>أضف تقييمك</div>

          <div style={{ marginBottom: 12 }}>
            <StarInput value={reviewStars} onChange={setReviewStars} />
          </div>

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

          {/* Anonymous toggle for logged-in users */}
          {session && !session.key.startsWith("anon_") && (
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#6B7280", marginBottom: 12 }}>
              <input type="checkbox" checked={postAsAnonymous} onChange={e => setPostAsAnonymous(e.target.checked)} style={{ width: 18, height: 18, accentColor: "#246BFD" }} />
              التعليق كمجهول
            </label>
          )}

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
            <div style={{ marginTop: 10, textAlign: "center", fontSize: 12, fontWeight: 700, color: reviewMsg.includes("شكرا") ? "#16A34A" : "#DC2626", padding: "8px 12px", borderRadius: 10, background: reviewMsg.includes("شكرا") ? "#DCFCE7" : "#FEE2E2" }}>
              {reviewMsg}
            </div>
          )}
        </div>

        {/* Reviews list */}
        {reviewsList.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#9CA3AF", marginBottom: 10, textAlign: "center" }}>آخر التقييمات</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {reviewsList.map(r => (
                <ReviewCard key={r.id} name={r.name} stars={r.stars} comment={r.comment} date={r.createdAt ? new Date(r.createdAt).toLocaleDateString("ar-JO") : "-"} />
              ))}
            </div>
          </div>
        )}
      </div>
      <AppFooter />

      <PhoneAuthModal
        open={showReg}
        onClose={() => setShowReg(false)}
        onSuccess={(name, key) => {
          setShowReg(false);
          if (key.startsWith("anon_")) {
            if (reviewStars === 0) return;
            setReviewSaving(true);
            db.ref("reviews").push({ name: "مجهول", stars: reviewStars, comment: reviewComment.trim(), createdAt: new Date().toISOString() })
              .then(() => {
                setReviewStars(0); setReviewComment("");
                setReviewMsg("شكراً! تم نشر رأيك بنجاح");
                return db.ref("reviews").once("value");
              })
              .then(snap => {
                const val = snap.val() || {};
                const arr = Object.entries(val).map(([id, r]: [string, any]) => ({ id, ...r })).sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));
                setReviewsList(arr);
              })
              .catch(() => setReviewMsg("حدث خطأ أثناء النشر"))
              .finally(() => setReviewSaving(false));
          } else {
            submitReview();
          }
        }}
        showAnonymous={true}
        title="تسجيل الدخول"
        subtitle="سجّل بياناتك لنشر رأيك"
      />
    </div>
  );
}
