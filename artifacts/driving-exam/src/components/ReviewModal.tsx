import { useState, useEffect, useRef, useCallback } from "react";
import { db } from "../lib/firebase";
import PhoneAuthModal from "./PhoneAuthModal";

const SESSION_KEY = "dex_user";
function loadSession(): { name: string; key: string } | null {
  try { const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "{}"); return s?.key ? s : null; } catch { return null; }
}

interface Props {
  open: boolean;
  onClose: () => void;
  context: "test" | "exam";
  title?: string;
  subtitle?: string;
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
          <StarIcon filled={n <= displayValue} size={40} />
        </button>
      ))}
    </div>
  );
}

/* ── Check if user already reviewed ─────────────────────── */
async function hasReviewed(key: string): Promise<boolean> {
  try {
    const snap = await db.ref("reviews").once("value");
    const val = snap.val() || {};
    return Object.values(val).some((r: any) => r.reviewerKey === key);
  } catch { return false; }
}

export default function ReviewModal({ open, onClose, context, title, subtitle }: Props) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [postAnon, setPostAnon] = useState(false);
  const msgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) {
      setStars(0); setComment(""); setMsg(""); setSaving(false); setShowAuth(false); setPostAnon(false);
    }
  }, [open]);

  useEffect(() => {
    if (msg && msg.includes("شكر")) {
      if (msgTimerRef.current) clearTimeout(msgTimerRef.current);
      msgTimerRef.current = setTimeout(() => setMsg(""), 3000);
    }
    return () => { if (msgTimerRef.current) clearTimeout(msgTimerRef.current); };
  }, [msg]);

  const doPublish = useCallback(async (name: string, key: string, anonymous: boolean) => {
    if (stars === 0) { setMsg("اختر تقييماً بالنجوم"); return; }
    setSaving(true); setMsg("");
    try {
      await db.ref("reviews").push({
        name: anonymous ? "مجهول" : name,
        stars,
        comment: comment.trim(),
        reviewerKey: key,
        createdAt: new Date().toISOString(),
      });
      setMsg("شكراً! تم نشر رأيك بنجاح");
      setStars(0); setComment(""); setPostAnon(false);
      setTimeout(() => onClose(), 1500);
    } catch {
      setMsg("حدث خطأ أثناء النشر");
    }
    setSaving(false);
  }, [stars, comment, onClose]);

  async function handlePublish() {
    const session = loadSession();
    if (!session) {
      if (context === "exam") {
        // Shouldn't happen for exam, but handle gracefully
        setMsg("يجب تسجيل الدخول أولاً");
        return;
      }
      // Test context: not logged in → show auth modal
      setShowAuth(true);
      return;
    }

    // Verify user exists in DB (not deleted)
    try {
      const userSnap = await db.ref("users/" + session.key).once("value");
      if (!userSnap.exists()) {
        localStorage.removeItem(SESSION_KEY);
        setMsg("انتهت الجلسة، أعد تسجيل الدخول");
        if (context === "test") setShowAuth(true);
        return;
      }
    } catch {
      // continue even if check fails
    }

    await doPublish(session.name, session.key, postAnon);
  }

  if (!open) return null;

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 110, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, direction: "rtl" }} onClick={onClose}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "24px", width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", animation: "fadeUp 0.22s ease", animationFillMode: "both" }} onClick={e => e.stopPropagation()}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: "linear-gradient(135deg, #F59E0B, #F97316)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 10px" }}>
              <i className="ph ph-star" />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "#111827", marginBottom: 4 }}>{title || "قيّم تجربتك"}</h2>
            <p style={{ fontSize: 13, color: "#6B7280" }}>{subtitle || "شاركنا رأيك لتحسين الخدمة"}</p>
          </div>

          <div style={{ marginBottom: 16 }}>
            <StarInput value={stars} onChange={setStars} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="اكتب رأيك هنا (اختياري)..."
              rows={3}
              style={{
                width: "100%", padding: "12px 14px", border: "1.5px solid #E5E7EB", borderRadius: 12,
                background: "#F9FAFB", fontSize: 14, fontFamily: "inherit", color: "#111827", outline: "none", resize: "vertical",
                transition: "border-color .15s",
              }}
              autoComplete="off"
              spellCheck={false}
              className="review-field"
            />
          </div>

          {/* Anonymous toggle for exam (all registered) or test if logged in */}
          {loadSession() && !loadSession()!.key.startsWith("anon_") && (
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#6B7280", marginBottom: 14 }}>
              <input type="checkbox" checked={postAnon} onChange={e => setPostAnon(e.target.checked)} style={{ width: 18, height: 18, accentColor: "#246BFD" }} />
              نشر رأي كمجهول
            </label>
          )}

          <button
            onClick={handlePublish}
            disabled={saving || stars === 0}
            style={{
              width: "100%", padding: "12px", borderRadius: 12, border: "none",
              background: stars === 0 ? "#E5E7EB" : "#246BFD", color: stars === 0 ? "#9CA3AF" : "#fff",
              fontSize: 15, fontWeight: 800, cursor: stars === 0 ? "not-allowed" : "pointer",
              fontFamily: "inherit", transition: "all .15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            <i className="ph ph-paper-plane-right" style={{ fontSize: 18 }} />
            {saving ? "جارٍ النشر..." : "نشر الرأي"}
          </button>

          {msg && (
            <div style={{ marginTop: 10, textAlign: "center", fontSize: 13, fontWeight: 700, color: msg.includes("شكر") ? "#16A34A" : "#DC2626", padding: "10px 12px", borderRadius: 10, background: msg.includes("شكر") ? "#DCFCE7" : "#FEE2E2" }}>
              {msg}
            </div>
          )}

          <button type="button" onClick={onClose} style={{ width: "100%", height: 44, borderRadius: 12, border: "1.5px solid #E5E7EB", background: "#fff", color: "#6B7280", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: 10 }}>
            لاحقاً
          </button>
        </div>
      </div>

      {/* Auth modal for test context when not logged in */}
      <PhoneAuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={(name, key) => {
          setShowAuth(false);
          if (key.startsWith("anon_")) {
            doPublish("مجهول", key, true);
          } else {
            doPublish(name, key, postAnon);
          }
        }}
        showAnonymous={true}
        title="سجّل لنشر رأيك"
        subtitle="أدخل بياناتك أو انشر كمجهول"
      />
    </>
  );
}
