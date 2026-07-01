import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import Header from "../components/Header";
import AppFooter from "../components/Footer";
import type { GuideSection, GuideSectionType, GuideSectionItem } from "../types";

const SESSION_KEY = "dex_user";
function loadSession(): { name: string; key: string } | null {
  try { const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "{}"); return s?.key ? s : null; } catch { return null; }
}

interface Props { initialSections?: GuideSection[] | null; }

/* ── Accordion ─────────────────────────────────── */
function Accordion({ icon, iconColor, iconBg, title, children, defaultOpen = false }: {
  icon: string; iconColor: string; iconBg: string; title: string;
  children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #F0F1F3", overflow: "hidden" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", padding: "14px 16px", display: "flex", flexDirection: "row", alignItems: "center",
        gap: 12, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0,
          background: iconBg, color: iconColor,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19,
        }}><i className={`ph ph-${icon}`} /></div>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 800, color: "#111827", textAlign: "right", display: "block" }}>{title}</span>
        <i className={`ph ph-caret-${open ? "up" : "down"}`} style={{ fontSize: 15, color: "#9CA3AF", flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{ padding: "4px 16px 14px" }}>
          <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: 10 }}>{children}</div>
        </div>
      )}
    </div>
  );
}

/* ── Step (numbered) ────────────────────────── */
function Step({ n, title, desc, last }: { n: number; title: string; desc: string; last?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "row", gap: 12, paddingBottom: last ? 0 : 14 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "#246BFD", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 900,
        }}>{n}</div>
        {!last && <div style={{ width: 2, flex: 1, background: "#E5E7EB", marginTop: 5 }} />}
      </div>
      <div style={{ paddingTop: 3, textAlign: "right", flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#111827", marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.6 }}>{desc}</div>
      </div>
    </div>
  );
}

/* ── DocRow ─────────────────────────────────── */
function DocRow({ icon, text, sub }: { icon: string; text: string; sub?: string }) {
  return (
    <div style={{
      display: "flex", flexDirection: "row", alignItems: "flex-start",
      gap: 10, paddingBottom: 10, marginBottom: 2,
      borderBottom: "1px solid #F9FAFB",
    }}>
      <i className={`ph ph-${icon}`} style={{ fontSize: 16, color: "#246BFD", marginTop: 2, flexShrink: 0 }} />
      <div style={{ flex: 1, textAlign: "right" }}>
        <div style={{ fontSize: 13, color: "#374151", fontWeight: 600, lineHeight: 1.5 }}>{text}</div>
        {sub && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ── FeeRow ─────────────────────────────────── */
function FeeRow({ label, amount, note }: { label: string; amount: string; note?: string }) {
  return (
    <div style={{
      display: "flex", flexDirection: "row", alignItems: "center",
      justifyContent: "space-between", paddingBottom: 10,
      borderBottom: "1px solid #F9FAFB", marginBottom: 2,
    }}>
      <div style={{ flex: 1, textAlign: "right", paddingLeft: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{label}</div>
        {note && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{note}</div>}
      </div>
      <span style={{
        fontSize: 13, fontWeight: 900, color: "#246BFD",
        background: "#EEF4FF", borderRadius: 10, padding: "4px 10px",
        flexShrink: 0,
      }}>{amount}</span>
    </div>
  );
}

/* ── FaqItem ─────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 5 }}>
        <i className="ph ph-question" style={{ fontSize: 15, color: "#246BFD", flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1, fontSize: 13, fontWeight: 800, color: "#111827", textAlign: "right" }}>{q}</div>
      </div>
      <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.7, paddingRight: 23, textAlign: "right" }}>{a}</div>
    </div>
  );
}

/* ── Section renderer by type ────────────────────── */
function SectionContent({ type, items }: { type: GuideSectionType; items: GuideSectionItem[] }) {
  switch (type) {
    case "steps":
      return (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {items.map((it, i) => (
            <Step key={i} n={i + 1} title={it.text} desc={it.sub || ""} last={i === items.length - 1} />
          ))}
        </div>
      );
    case "documents":
      return (
        <div>
          {items.map((it, i) => (
            <DocRow key={i} icon={it.icon || "file-text"} text={it.text} sub={it.sub} />
          ))}
        </div>
      );
    case "fees":
      return (
        <div>
          {items.map((it, i) => (
            <FeeRow key={i} label={it.text} amount={it.amount || ""} note={it.note} />
          ))}
          <div style={{
            marginTop: 8, background: "#FFFBEB", borderRadius: 10,
            padding: "9px 12px", fontSize: 12, color: "#92400E",
            display: "flex", flexDirection: "row", gap: 8, alignItems: "flex-start", textAlign: "right",
          }}>
            <i className="ph ph-warning" style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }} />
            <span>الرسوم قابلة للتغيير — تحقق من دائرة الترخيص قبل الذهاب.</span>
          </div>
        </div>
      );
    case "conditions":
      return (
        <div>
          {items.map((it, i) => (
            <DocRow key={i} icon={it.icon || "check-circle"} text={it.text} sub={it.sub} />
          ))}
        </div>
      );
    case "faq":
      return (
        <div>
          {items.map((it, i) => (
            <FaqItem key={i} q={it.text} a={it.answer || ""} />
          ))}
        </div>
      );
    default:
      return <div style={{ fontSize: 12, color: "#9CA3AF" }}>---</div>;
  }
}

/* ── Default sections (fallback when Firebase is empty) ── */
const DEFAULT_SECTIONS: GuideSection[] = [
  {
    id: "default-steps", title: "خطوات الحصول على رخصة القيادة",
    icon: "list-numbers", iconColor: "#7C3AED", iconBg: "#EDE9FE", type: "steps", order: 1,
    items: [
      { text: "التسجيل في مدرسة سواقة معتمدة", sub: "اختر مدرسة معتمدة لدى دائرة الترخيص وسجّل باسمك برقم هويتك الوطنية." },
      { text: "إتمام الدروس النظرية والعملية", sub: "أكمل الساعات المطلوبة من الدروس النظرية والعملية مع المدرسة." },
      { text: "انتظار رسالة SMS من دائرة الترخيص", sub: "بعد إدخال المدرسة بياناتك في النظام، ستصلك رسالة تأكيد خلال أيام." },
      { text: "التوجه لدائرة الترخيص", sub: "احضر مع وثائقك المطلوبة، ادفع الرسوم، وتقدم لحجز موعد الفحص النظري." },
      { text: "اجتياز الفحص النظري", sub: "60 سؤال خلال 60 دقيقة. تحتاج الإجابة على 51 سؤالاً على الأقل للنجاح." },
      { text: "اجتياز الفحص العملي واستلام الرخصة", sub: "بعد النجاح في النظري تحدد موعداً للفحص العملي، وعند النجاح تستلم رخصتك." },
    ],
  },
  {
    id: "default-docs", title: "الأوراق والوثائق المطلوبة",
    icon: "folder-open", iconColor: "#D97706", iconBg: "#FEF3C7", type: "documents", order: 2,
    items: [
      { text: "بطاقة هوية وطنية سارية المفعول", sub: "للأردنيين — جواز سفر ساري للمقيمين", icon: "identification-card" },
      { text: "دفتر خدمة العلم أو وثيقة الإعفاء", sub: "للذكور دون سن الأربعين", icon: "book-open" },
      { text: "صورتان شخصيتان", sub: "خلفية بيضاء، حديثتان", icon: "image-square" },
      { text: "شهادة اللياقة الطبية", sub: "تُستخرج من أي مركز صحي معتمد", icon: "heart-pulse" },
      { text: "إيصال دفع رسوم التقديم", sub: "يُدفع في الدائرة أو عبر منظومة موحد", icon: "receipt" },
    ],
  },
  {
    id: "default-fees", title: "الرسوم التقريبية",
    icon: "currency-circle-dollar", iconColor: "#16A34A", iconBg: "#DCFCE7", type: "fees", order: 3,
    items: [
      { text: "رسوم تسجيل طلب التقديم", amount: "3 د.أ", note: "تُدفع لدى دائرة الترخيص" },
      { text: "رسوم الفحص النظري", amount: "10 د.أ", note: "في حال الرسوب تُعاد الرسوم" },
      { text: "رسوم الفحص العملي", amount: "20 د.أ", note: "لكل محاولة" },
      { text: "رسوم استخراج الرخصة", amount: "30 د.أ", note: "عند النجاح في الفحصين" },
    ],
  },
  {
    id: "default-conditions", title: "شروط التقديم",
    icon: "user-check", iconColor: "#0891B2", iconBg: "#CFFAFE", type: "conditions", order: 4,
    items: [
      { text: "الحد الأدنى للعمر: 18 سنة", icon: "calendar-blank" },
      { text: "اجتياز فحص النظر في المركز الصحي", icon: "eye" },
      { text: "لا يوجد سجل جنائي يمنع استخراج الرخصة", icon: "shield-check" },
      { text: "إكمال الدروس المقررة في المدرسة المسجّل بها", icon: "graduation-cap" },
    ],
  },
  {
    id: "default-faq", title: "أسئلة شائعة",
    icon: "chat-circle-question", iconColor: "#246BFD", iconBg: "#EEF4FF", type: "faq", order: 5,
    items: [
      { text: "ماذا لو رسبت في الامتحان النظري؟", answer: "يمكنك إعادة التقديم بعد 24 ساعة، وتُسدَّد رسوم جديدة لكل محاولة." },
      { text: "هل يمكن تقديم الامتحان بدون رسالة SMS؟", answer: "لا. الرسالة شرط إلزامي، وهي تؤكد أن المدرسة سجّلت إتمام دروسك في نظام دائرة الترخيص." },
      { text: "كم عدد المحاولات المسموحة في الفحص النظري؟", answer: "لا يوجد حد أقصى للمحاولات، غير أن كل محاولة تحتاج رسوماً جديدة." },
      { text: "هل يختلف الامتحان بين المحافظات؟", answer: "الاختبار موحَّد ورقمي في جميع فروع دائرة الترخيص في المملكة." },
      { text: "هل تُقبل الهوية منتهية الصلاحية؟", answer: "لا. يجب أن تكون الهوية الوطنية سارية المفعول يوم التقديم." },
    ],
  },
];

/* ── Star Rating Input ─────────────────────────── */
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

/* ── Review Card ─────────────────────────────────── */
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

/* ── Register Modal for Review ───────────────────── */
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

function saveSession(name: string, key: string) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify({ name, key })); } catch {}
}

/* ── Root ──────────────────────────────────────────── */
export default function GuideScreen({ initialSections }: Props) {
  const [sections, setSections] = useState<GuideSection[]>(initialSections ?? []);
  const [loading, setLoading] = useState(!initialSections);

  // Review states
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");
  const [showReg, setShowReg] = useState(false);
  const [reviewsList, setReviewsList] = useState<{ id: string; name: string; stars: number; comment: string; createdAt: string }[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    // Skip Firebase load if data was pre-loaded by App.tsx
    if (initialSections && initialSections.length > 0) {
      setSections(initialSections);
      setLoading(false);
    } else {
      db.ref("guide/sections").once("value")
        .then(snap => {
          const val = snap.val() || {};
          let arr: GuideSection[];
          if (Object.keys(val).length === 0) {
            arr = DEFAULT_SECTIONS.map(s => ({ ...s }));
          } else {
            arr = Object.entries(val).map(([id, s]: [string, any]) => ({ id, ...s }));
          }
          arr.sort((a, b) => (a.order || 0) - (b.order || 0));
          setSections(arr);
          setLoading(false);
        })
        .catch(() => { setSections(DEFAULT_SECTIONS.map(s => ({ ...s }))); setLoading(false); });
    }
    // Load reviews
    db.ref("reviews").once("value").then(snap => {
      const val = snap.val() || {};
      const arr = Object.entries(val).map(([id, r]: [string, any]) => ({ id, ...r })).sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setReviewsList(arr);
      setReviewsLoading(false);
    }).catch(() => setReviewsLoading(false));
  }, [initialSections]);

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
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      background: "#F9FAFB", direction: "rtl",
    }}>
      <Header />

      {/* Body */}
      <div style={{ flex: "1 1 0", minHeight: 0, overflowY: "auto", padding: "14px 14px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF", fontSize: 13 }}>جارٍ التحميل...</div>
        ) : sections.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF", fontSize: 13 }}>لا توجد أقسام</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* SMS notice card */}
            <div style={{
              background: "linear-gradient(135deg, #246BFD 0%, #4f86ff 100%)",
              borderRadius: 18, padding: "16px", color: "#fff", textAlign: "right",
            }}>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "rgba(255,255,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0,
                }}><i className="ph ph-device-mobile-speaker" /></div>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 900 }}>متى تذهب لدائرة الترخيص؟</div>
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.7, opacity: 0.92, marginBottom: 8 }}>
                انتظر رسالة SMS على هاتفك تحمل النص:
              </div>
              <div style={{
                background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: 10, padding: "10px 12px", fontSize: 12, fontWeight: 700, lineHeight: 1.8,
              }}>
                "تم استكمال دروس النظري والعملي المطلوبة للتقدم للفحص لدى الترخيص"
              </div>
              <div style={{ fontSize: 12, opacity: 0.85, marginTop: 8, lineHeight: 1.6 }}>
                عند وصول هذه الرسالة فقط يمكنك التوجه لأقرب دائرة ترخيص وتقديم طلبك.
              </div>
            </div>

            {/* Sections from Firebase */}
            {sections.map(s => (
              <Accordion
                key={s.id}
                icon={s.icon}
                iconColor={s.iconColor}
                iconBg={s.iconBg}
                title={s.title}
              >
                <SectionContent type={s.type} items={s.items} />
              </Accordion>
            ))}

            {/* ── Visitor Log Section (standalone) ── */}
            <div style={{ background: "#fff", border: "1.5px solid #F0F1F3", borderRadius: 16, padding: 16, marginTop: 4 }}>
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

            {/* Official link */}
            <a href="https://wa.me/9620778244772?text=" target="_blank" rel="noreferrer" style={{
              display: "flex", flexDirection: "row", alignItems: "center",
              justifyContent: "center", gap: 8, padding: "14px",
              borderRadius: 14, border: "1.5px solid #E5E7EB", background: "#fff",
              fontSize: 13, fontWeight: 700, color: "#246BFD", textDecoration: "none",
            }}>
              <i className="" style={{ fontSize: 18 }} />
              لم تجد جواب لسؤالك ؟ تواصل معنا عبر واتساب
            </a>
            <div style={{ height: 16 }} />
          </div>
        )}
        <AppFooter />
      </div>

      {/* Registration modal for reviews */}
      <ReviewRegModal open={showReg} onClose={() => setShowReg(false)} onSuccess={(name, key) => { setShowReg(false); submitReview(); }} />
    </div>
  );
}
