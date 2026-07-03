import { useState, useEffect, useCallback, useRef } from "react";
import { db } from "../lib/firebase";
import Header from "../components/Header";

interface Props { onBack: () => void; }

type View = "menu" | "users" | "questions" | "requests" | "geo-manage" | "centers-manage" | "add-center" | "edit-center" | "featured-centers" | "question-form" | "guide-admin" | "footer-admin" | "reviews";

const Q_CATS = [
  "قواعد السير والمرور",
  "الميكانيك",
  "السلامة على الطريق",
  "أسعافات أولية",
  "الشواخص والخطوط والعلامات",
  "المخالفات واحتساب النقاط",
  "الصور المتحركة",
];

// ── Design tokens (Modern — Clean Light) ────────────────────────────────
const C = {
  primary: "#2563EB", primaryLight: "#EFF6FF", primaryDark: "#1d4ed8",
  bg: "#FAFBFC", surface: "#FFFFFF", surface2: "#F8FAFC",
  border: "#E2E8F0", borderHover: "#2563EB",
  text: "#0F172A", textSec: "#64748B", textLight: "#94A3B8",
  green: "#059669", greenLight: "#ECFDF5",
  red: "#DC2626", redLight: "#FEF2F2",
  gold: "#D97706", goldLight: "#FFFBEB",
  purple: "#7C3AED", purpleLight: "#F5F3FF",
  cyan: "#0891B2", cyanLight: "#ECFEFF",
  pink: "#EC4899", pinkLight: "#FDF2F8",
};

// ── Reusable UI helpers ─────────────────────────────
function Card({ icon, color, colorBg, iconColor, title, desc, onClick, count }: { icon: string; color: string; colorBg: string; iconColor: string; title: string; desc: string; onClick: () => void; count?: number }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
      cursor: "pointer", fontFamily: "inherit", textAlign: "right",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "all .2s",
    }} onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: colorBg, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
        <i className={`ph ph-${icon}`} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{title}</span>
          {count !== undefined && <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: colorBg, color: iconColor }}>{count}</span>}
        </div>
        <div style={{ fontSize: 12, color: C.textSec, marginTop: 2, lineHeight: 1.5 }}>{desc}</div>
      </div>
      <i className="ph ph-caret-left" style={{ fontSize: 16, color: C.textLight, flexShrink: 0 }} />
    </button>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: "none", border: "none", color: C.primary,
      cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 800,
      display: "flex", alignItems: "center", gap: 6, marginBottom: 16, padding: "4px 0",
    }}>
      <i className="ph ph-arrow-right" style={{ fontSize: 16 }} />
      رجوع
    </button>
  );
}

function SectionTitle({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
      <div style={{ fontSize: 18, fontWeight: 900, color: C.text, letterSpacing: "-0.2px" }}>{children}</div>
      {count !== undefined && <span style={{ background: C.surface2, color: C.primary, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 800, border: `1px solid ${C.border}` }}>{count}</span>}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", ...rest }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; [k: string]: any }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: C.textSec }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoComplete="off" spellCheck={false} {...rest} style={{
        width: "100%", padding: "12px 14px", border: `1.5px solid ${C.border}`, borderRadius: 12,
        background: C.surface2, fontSize: 14, fontFamily: "inherit", color: C.text, outline: "none",
      }} className="admin-field" />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: C.textSec }}>{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} autoComplete="off" spellCheck={false} style={{
        width: "100%", padding: "12px 14px", border: `1.5px solid ${C.border}`, borderRadius: 12,
        background: C.surface2, fontSize: 14, fontFamily: "inherit", color: C.text, outline: "none", resize: "vertical",
      }} className="admin-field" />
    </div>
  );
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: C.textSec }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        width: "100%", padding: "12px 14px", border: `1.5px solid ${C.border}`, borderRadius: 12,
        background: C.surface2, fontSize: 14, fontFamily: "inherit", color: C.text, appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "left 14px center",
      }}>{children}</select>
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", style = {} }: { children: React.ReactNode; onClick: () => void; variant?: "primary" | "outline" | "danger" | "ghost"; style?: React.CSSProperties }) {
  const colors = {
    primary: { bg: C.primary, color: "#fff", border: "none", hoverBg: C.primaryDark },
    outline: { bg: "transparent", color: C.primary, border: `1.5px solid ${C.primary}`, hoverBg: "#E8F0FE" },
    danger: { bg: C.red, color: "#fff", border: "none", hoverBg: "#B91C1C" },
    ghost: { bg: C.bg, color: C.textSec, border: `1px solid ${C.border}`, hoverBg: C.surface2 },
  }[variant];
  return (
    <button onClick={onClick} style={{
      width: "100%", border: colors.border, background: colors.bg, color: colors.color,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      fontFamily: "inherit", fontSize: 14, fontWeight: 800,
      padding: "12px", borderRadius: 12, cursor: "pointer", transition: "all .15s",
      ...style,
    }} onMouseEnter={e => { e.currentTarget.style.background = colors.hoverBg; }}
      onMouseLeave={e => { e.currentTarget.style.background = colors.bg; }}>{children}</button>
  );
}

function StatCard({ label, value, icon, color, bg }: { label: string; value: number; icon: string; color: string; bg: string }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
      padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 12,
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
        <i className={`ph ph-${icon}`} />
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 900, color: C.text, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: C.textSec, marginTop: 4, fontWeight: 700 }}>{label}</div>
      </div>
    </div>
  );
}

function ListItem({ label, sub, actions }: { label: string; sub?: string; actions: React.ReactNode }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
      padding: "14px", marginBottom: 8, display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: 10, boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "block" }}>{label}</span>
        {sub && <span style={{ fontSize: 12, color: C.textSec, marginTop: 2, display: "block" }}>{sub}</span>}
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>{actions}</div>
    </div>
  );
}

function Empty({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ textAlign: "center", padding: "50px 20px", color: C.textLight }}>
      <i className={`ph ph-${icon}`} style={{ fontSize: 48, marginBottom: 14, opacity: 0.15, display: "block" }} />
      <div style={{ fontSize: 14, fontWeight: 600 }}>{text}</div>
    </div>
  );
}

function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)",
      background: C.surface2, color: C.text, padding: "12px 20px",
      borderRadius: 14, fontSize: 13, fontWeight: 700,
      textAlign: "center", zIndex: 200, whiteSpace: "nowrap",
      boxShadow: "0 4px 16px rgba(0,0,0,0.1)", border: `1px solid ${C.border}`,
    }}>{msg}</div>
  );
}

// ── Main component ──────────────────────────────────────────────────
export default function Admin({ onBack }: Props) {
  const [view, setView] = useState<View>("menu");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ gov: 0, area: 0, center: 0, user: 0, req: 0, q: 0, guide: 0, reviews: 0 });

  const [govs, setGovs] = useState<Record<string, { name: string }>>({});
  const [areas, setAreas] = useState<Record<string, { name: string; governorateId: string }>>({});
  const [centers, setCenters] = useState<Record<string, any>>({});
  const [users, setUsers] = useState<Record<string, any>>({});
  const [questions, setQuestions] = useState<Record<string, any>>({});
  const [requests, setRequests] = useState<Record<string, any>>({});
  const [guideSections, setGuideSections] = useState<Record<string, any>>({});
  const [reviews, setReviews] = useState<Record<string, any>>({});

  /* ── Review request modal state ── */
  const [reviewingReqId, setReviewingReqId] = useState<string | null>(null);
  const [reviewingData, setReviewingData] = useState<any>(null);
  const [reviewName, setReviewName] = useState("");
  const [reviewAddress, setReviewAddress] = useState("");
  const [reviewPhone, setReviewPhone] = useState("");
  const [reviewWhatsapp, setReviewWhatsapp] = useState("");
  const [reviewMapLink, setReviewMapLink] = useState("");
  const [reviewImageUrl, setReviewImageUrl] = useState("");
  const [reviewDesc, setReviewDesc] = useState("");
  const [reviewRating, setReviewRating] = useState("");
  const [reviewReviewCount, setReviewReviewCount] = useState("");
  const [reviewGovId, setReviewGovId] = useState("");
  const [reviewAreaIds, setReviewAreaIds] = useState<string[]>([]);
  const [reviewWorkingDays, setReviewWorkingDays] = useState<string[]>([]);
  const [reviewWorkingHours, setReviewWorkingHours] = useState("");
  const [reviewPromoted, setReviewPromoted] = useState(false);
  type ReviewDaySchedule = { closed: boolean; from: string; to: string };
  const [reviewSchedule, setReviewSchedule] = useState<ReviewDaySchedule[]>([]);
  const [showAddAreaModal, setShowAddAreaModal] = useState(false);

  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [govSnap, areaSnap, centerSnap, userSnap, qSnap, reqSnap, guideSnap, revSnap] = await Promise.all([
        db.ref("governorates").once("value"), db.ref("areas").once("value"), db.ref("centers").once("value"),
        db.ref("users").once("value"), db.ref("questions").once("value"), db.ref("centerRequests").once("value"),
        db.ref("guide/sections").once("value"), db.ref("reviews").once("value"),
      ]);
      const g = govSnap.val() || {}, a = areaSnap.val() || {}, c = centerSnap.val() || {};
      const u = userSnap.val() || {}, q = qSnap.val() || {}, r = reqSnap.val() || {}, gs = guideSnap.val() || {}, rv = revSnap.val() || {};
      setGovs(g); setAreas(a); setCenters(c); setUsers(u); setQuestions(q); setRequests(r); setGuideSections(gs); setReviews(rv);
      const guideCount = Object.keys(gs).length || Object.keys(DEFAULT_GUIDE_SECTIONS).length;
      setStats({ gov: Object.keys(g).length, area: Object.keys(a).length, center: Object.keys(c).length,
        user: Object.keys(u).length, req: Object.keys(r).length, q: Object.keys(q).length, guide: guideCount, reviews: Object.keys(rv).length });
    } catch { showToast("خطأ في التحميل"); }
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  // ── USERS ────────────────────────────────────────────
  type UsersView = "list" | "detail";
  const [usersView, setUsersView] = useState<UsersView>("list");
  const [selectedUser, setSelectedUser] = useState<{ id: string; data: any } | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [userSort, setUserSort] = useState<"newest" | "tests" | "score">("newest");
  const [editUser, setEditUser] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");

  function UsersSection() {
    let entries = Object.entries(users);
    // search
    if (userSearch.trim()) {
      const q = userSearch.trim().toLowerCase();
      entries = entries.filter(([_, u]) => ((u.name || "") + (u.phone || "") + (u.firstName || "") + (u.lastName || "")).toLowerCase().includes(q));
    }
    // sort
    entries = [...entries].sort((a, b) => {
      if (userSort === "newest") return (b[1].registeredAt || "").localeCompare(a[1].registeredAt || "");
      if (userSort === "tests") return (b[1].testsTaken || 0) - (a[1].testsTaken || 0);
      return (b[1].bestScore || 0) - (a[1].bestScore || 0);
    });

    if (usersView === "detail" && selectedUser) {
      const u = selectedUser.data;
      const initials = (u.name || u.firstName || "U").charAt(0).toUpperCase();
      const best = u.bestScore || 0; const tests = u.testsTaken || 0;
      const reg = u.registeredAt ? new Date(u.registeredAt).toLocaleDateString("ar-JO") : "-";
      const lastActive = u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleDateString("ar-JO") : "-";
      const catScores = u.categoryScores || {};
      const catEntries = Object.entries(catScores);
      return (
        <div>
          <BackBtn onClick={() => setUsersView("list")} />
          <SectionTitle>تفاصيل المستخدم</SectionTitle>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
            {/* Profile header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg, ${C.primary}, ${C.cyan})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, flexShrink: 0 }}>{initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 900, color: C.text }}>{u.name || u.firstName || "مستخدم"} {u.lastName || ""}</div>
                <div style={{ fontSize: 12, color: C.textSec, marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}>
                  <i className="ph ph-phone" /> {u.phone || "-"}
                </div>
                {u.email && <div style={{ fontSize: 12, color: C.textSec, marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}><i className="ph ph-envelope" /> {u.email}</div>}
                {u.governorate && <div style={{ fontSize: 12, color: C.textSec, marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}><i className="ph ph-map-pin" /> {u.governorate}</div>}
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20, background: tests > 0 ? C.greenLight : C.surface2, color: tests > 0 ? C.green : C.textSec, whiteSpace: "nowrap", border: `1px solid ${tests > 0 ? C.green : C.border}` }}>{tests > 0 ? "نشط" : "جديد"}</span>
            </div>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              {[
                { label: "أفضل نتيجة", value: best + "%", icon: "trophy", color: C.gold },
                { label: "اختبارات", value: tests, icon: "exam", color: C.primary },
                { label: "متوسط", value: (u.averageScore || 0) + "%", icon: "chart-bar", color: C.cyan },
              ].map(s => (
                <div key={s.label} style={{ background: C.surface2, border: `1px solid ${C.border}`, padding: "10px", borderRadius: 10, textAlign: "center" }}>
                  <i className={`ph ph-${s.icon}`} style={{ color: s.color, fontSize: 18, marginBottom: 4, display: "block" }} />
                  <span style={{ display: "block", color: C.text, fontWeight: 900, fontSize: 15 }}>{s.value}</span>
                  <span style={{ fontSize: 10, color: C.textSec, marginTop: 2, display: "block" }}>{s.label}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              <div style={{ background: C.surface2, border: `1px solid ${C.border}`, padding: "10px", borderRadius: 10, fontSize: 11, color: C.textSec }}>
                <i className="ph ph-calendar-blank" style={{ marginLeft: 4 }} />التسجيل<span style={{ display: "block", marginTop: 3, color: C.text, fontWeight: 800, fontSize: 13 }}>{reg}</span>
              </div>
              <div style={{ background: C.surface2, border: `1px solid ${C.border}`, padding: "10px", borderRadius: 10, fontSize: 11, color: C.textSec }}>
                <i className="ph ph-clock" style={{ marginLeft: 4 }} />آخر نشاط<span style={{ display: "block", marginTop: 3, color: C.text, fontWeight: 800, fontSize: 13 }}>{lastActive}</span>
              </div>
            </div>
            {/* Category scores */}
            {catEntries.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.textSec, marginBottom: 8 }}>نتائج الأقسام</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {catEntries.map(([cat, score]: [string, any]) => (
                    <div key={cat} style={{ display: "flex", alignItems: "center", gap: 8, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.text, flex: 1 }}>{cat}</div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: (score || 0) >= 70 ? C.green : (score || 0) >= 50 ? C.gold : C.red }}>{score || 0}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Edit / Delete */}
            {!editUser ? (
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="outline" style={{ flex: 1 }} onClick={() => { setEditName(u.name || ""); setEditPhone(u.phone || ""); setEditEmail(u.email || ""); setEditUser(true); }}>
                  <i className="ph ph-pencil" /> تعديل
                </Btn>
                <Btn variant="danger" style={{ flex: 1 }} onClick={async () => {
                  if (!confirm("حذف المستخدم؟")) return;
                  setLoading(true); try { await db.ref("users/" + selectedUser.id).remove(); showToast("تم الحذف"); await loadAll(); setUsersView("list"); }
                  catch { showToast("حدث خطأ"); } setLoading(false);
                }}><i className="ph ph-trash" /> حذف</Btn>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.textSec, marginBottom: 4 }}>تعديل بيانات المستخدم</div>
                <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="الاسم" style={{
                  width: "100%", padding: "10px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10,
                  background: C.surface, fontSize: 14, fontFamily: "inherit", color: C.text, outline: "none",
                }} />
                <input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="رقم الهاتف" style={{
                  width: "100%", padding: "10px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10,
                  background: C.surface, fontSize: 14, fontFamily: "inherit", color: C.text, outline: "none", direction: "ltr", textAlign: "right",
                }} />
                <input value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="البريد الإلكتروني" style={{
                  width: "100%", padding: "10px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10,
                  background: C.surface, fontSize: 14, fontFamily: "inherit", color: C.text, outline: "none", direction: "ltr", textAlign: "right",
                }} />
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <Btn variant="primary" style={{ flex: 1 }} onClick={async () => {
                    setLoading(true);
                    try {
                      await db.ref("users/" + selectedUser.id).update({
                        name: editName.trim(), phone: editPhone.trim(), email: editEmail.trim()
                      });
                      showToast("تم التحديث");
                      await loadAll();
                      setEditUser(false);
                    } catch { showToast("حدث خطأ"); }
                    setLoading(false);
                  }}><i className="ph ph-check" /> حفظ</Btn>
                  <Btn variant="ghost" style={{ flex: 1 }} onClick={() => setEditUser(false)}>إلغاء</Btn>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    if (entries.length === 0) return (
      <div>
        <BackBtn onClick={() => setView("menu")} />
        <SectionTitle>المستخدمين</SectionTitle>
        <div style={{ marginBottom: 12 }}>
          <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="البحث بالاسم أو الهاتف..." style={{
            width: "100%", padding: "10px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10, background: C.surface, fontSize: 14, fontFamily: "inherit", color: C.text, outline: "none",
          }} />
        </div>
        <Empty icon="users" text={userSearch.trim() ? "لا توجد نتائج للبحث" : "لا يوجد مستخدمون"} />
      </div>
    );
    return (
      <div>
        <BackBtn onClick={() => setView("menu")} />
        <SectionTitle count={entries.length}>المستخدمين</SectionTitle>
        {/* Search + Sort */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ position: "relative", marginBottom: 8 }}>
            <i className="ph ph-magnifying-glass" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: C.textLight, fontSize: 16 }} />
            <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="البحث بالاسم أو الهاتف..." autoComplete="off" spellCheck={false} className="admin-field" style={{
              width: "100%", padding: "10px 14px 10px 40px", border: `1.5px solid ${C.border}`, borderRadius: 10,
              background: C.surface, fontSize: 14, fontFamily: "inherit", color: C.text, outline: "none",
            }} />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(["newest", "tests", "score"] as const).map(s => (
              <button key={s} onClick={() => setUserSort(s)} style={{
                padding: "5px 12px", borderRadius: 20, border: "none", fontSize: 11, fontWeight: 800, fontFamily: "inherit", cursor: "pointer",
                background: userSort === s ? C.primary : C.bg, color: userSort === s ? "#fff" : C.textSec,
                transition: "all .15s",
              }}>
                {s === "newest" ? "الأحدث" : s === "tests" ? "الأكثر اختباراً" : "الأعلى نتيجة"}
              </button>
            ))}
          </div>
        </div>
        {/* User list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map(([id, u]) => {
            const initials = (u.name || u.firstName || "U").charAt(0).toUpperCase();
            const tests = u.testsTaken || 0;
            const best = u.bestScore || 0;
            const isNew = tests === 0;
            return (
              <div key={id} onClick={() => { setSelectedUser({ id, data: u }); setUsersView("detail"); }} style={{
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14,
                display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "all .15s",
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              }} onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderHover; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.03)"; }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: isNew ? C.surface2 : `linear-gradient(135deg, ${C.primary}, ${C.cyan})`, color: isNew ? C.textLight : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, flexShrink: 0, border: `1px solid ${isNew ? C.border : "transparent"}` }}>{initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{u.name || u.firstName || "مستخدم"}</span>
                    {isNew && <span style={{ fontSize: 9, fontWeight: 900, padding: "1px 6px", borderRadius: 10, background: C.goldLight, color: C.gold }}>جديد</span>}
                  </div>
                  <div style={{ fontSize: 12, color: C.textSec, marginTop: 3, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <span>{u.phone || id}</span>
                    {tests > 0 && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><i className="ph ph-exam" style={{ fontSize: 11 }} />{tests} اختبار</span>}
                    {best > 0 && <span style={{ display: "flex", alignItems: "center", gap: 3, color: best >= 70 ? C.green : best >= 50 ? C.gold : C.red }}><i className="ph ph-trophy" style={{ fontSize: 11 }} />{best}%</span>}
                  </div>
                </div>
                <i className="ph ph-caret-left" style={{ fontSize: 16, color: C.textLight, flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── QUESTIONS ────────────────────────────────────────────
  type QSubView = "menu" | "list" | "form";
  const [qSub, setQSub] = useState<QSubView>("menu");
  const [qCat, setQCat] = useState("");
  const [qSearch, setQSearch] = useState("");
  const [editingQ, setEditingQ] = useState<string | null>(null);
  const [qForm, setQForm] = useState({
    category: Q_CATS[0], type: "text" as "text" | "image" | "video",
    mediaUrl: "", text: "", explanation: "", correct: 0, options: ["", ""],
  });

  function resetQForm() {
    setQForm({ category: Q_CATS[0], type: "text", mediaUrl: "", text: "", explanation: "", correct: 0, options: ["", ""] });
    setEditingQ(null);
  }

  async function saveQ() {
    const { text, options, type, mediaUrl } = qForm;
    const cleanOpts = options.map(o => o.trim()).filter(Boolean);
    if (!text.trim()) { showToast("أدخل نص السؤال"); return; }
    if (cleanOpts.length < 2) { showToast("يجب خيارين على الأقل"); return; }
    if (type !== "text" && !mediaUrl.trim()) { showToast("أدخل رابط الوسائط"); return; }
    setLoading(true);
    try {
      const payload = {
        category: qForm.category, mediaType: qForm.type,
        mediaUrl: qForm.type !== "text" ? qForm.mediaUrl.trim() : null,
        question: qForm.text.trim(), options: cleanOpts,
        correctAnswer: qForm.correct,
        explanation: qForm.explanation.trim() || null,
      };
      if (editingQ) await db.ref("questions/" + editingQ).update(payload);
      else await db.ref("questions").push(payload);
      showToast(editingQ ? "تم التحديث" : "تم الإضافة");
      await loadAll(); setQSub("list");
    } catch { showToast("حدث خطأ"); }
    setLoading(false);
  }

  function QuestionsSection() {
    if (qSub === "menu") {
      // category stats
      const catStats = Q_CATS.map(cat => {
        const count = Object.values(questions).filter((q: any) => q.category === cat).length;
        return { cat, count };
      });
      return (
        <div>
          <BackBtn onClick={() => setView("menu")} />
          <SectionTitle count={stats.q}>إدارة الأسئلة</SectionTitle>
          {/* Category distribution */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, marginBottom: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.textSec, marginBottom: 10 }}>توزيع الأسئلة بالأقسام</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {catStats.map(({ cat, count }) => (
                <div key={cat} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.text, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cat}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <div style={{ width: 80, height: 6, borderRadius: 3, background: C.bg, overflow: "hidden" }}>
                      <div style={{ width: stats.q ? `${(count / stats.q) * 80}px` : 0, height: "100%", background: C.primary, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: C.primary, minWidth: 20, textAlign: "left" }}>{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Btn variant="primary" onClick={() => { resetQForm(); setQSub("form"); }}><i className="ph ph-plus" /> إضافة سؤال جديد</Btn>
            <Btn variant="outline" onClick={() => setQSub("list")}><i className="ph ph-list" /> عرض وتعديل الأسئلة</Btn>
          </div>
        </div>
      );
    }
    if (qSub === "form") {
      const isMedia = qForm.type !== "text";
      return (
        <div>
          <BackBtn onClick={() => { editingQ ? setQSub("list") : setQSub("menu"); }} />
          <SectionTitle>{editingQ ? "تعديل السؤال" : "سؤال جديد"}</SectionTitle>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.primary, marginBottom: 10, padding: "4px 10px", background: C.primaryLight, borderRadius: 8, display: "inline-block" }}>المعلومات الأساسية</div>
            <Select label="القسم" value={qForm.category} onChange={v => setQForm(f => ({ ...f, category: v }))}>
              {Q_CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select label="نوع السؤال" value={qForm.type} onChange={v => setQForm(f => ({ ...f, type: v as any }))}>
              <option value="text">نصي (بدون وسائط)</option>
              <option value="image">صورة</option>
              <option value="gif">صور متحركة (GIF)</option>
              <option value="video">فيديو</option>
            </Select>
            {isMedia && (
              <>
                <Input label="رابط الوسائط" value={qForm.mediaUrl} onChange={v => setQForm(f => ({ ...f, mediaUrl: v }))} placeholder="https://..." />
                {qForm.mediaUrl.trim() && (
                  <div style={{ marginBottom: 14, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}`, background: C.bg }}>
                    {qForm.type === "video" ? (
                      <video src={qForm.mediaUrl} controls style={{ width: "100%", height: 160, objectFit: "cover" }} onError={e => { (e.target as HTMLVideoElement).style.display = "none"; }} />
                    ) : (
                      <img src={qForm.mediaUrl} alt="preview" style={{ width: "100%", height: 160, objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    )}
                  </div>
                )}
              </>
            )}
            <TextArea label="نص السؤال" value={qForm.text} onChange={v => setQForm(f => ({ ...f, text: v }))} placeholder="اكتب السؤال هنا..." rows={3} />
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.primary, marginBottom: 10, padding: "4px 10px", background: C.primaryLight, borderRadius: 8, display: "inline-block" }}>الخيارات</div>
            {qForm.options.map((opt, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <div onClick={() => setQForm(f => ({ ...f, correct: i }))} style={{ width: 28, height: 28, borderRadius: 8, background: qForm.correct === i ? C.greenLight : C.bg, color: qForm.correct === i ? C.green : C.textLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, flexShrink: 0, border: `1.5px solid ${qForm.correct === i ? C.green : C.border}`, cursor: "pointer" }}>{i + 1}</div>
                <input value={opt} onChange={e => { const opts = [...qForm.options]; opts[i] = e.target.value; setQForm(f => ({ ...f, options: opts })); }} placeholder={`الخيار ${i + 1}`} autoComplete="off" spellCheck={false} className="admin-field" style={{ flex: 1, padding: "12px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
                <button onClick={() => { const opts = qForm.options.filter((_, idx) => idx !== i); setQForm(f => ({ ...f, options: opts, correct: Math.min(f.correct, opts.length - 1) })); }} style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${C.border}`, background: C.surface, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.red, flexShrink: 0 }}><i className="ph ph-x" /></button>
              </div>
            ))}
            <button onClick={() => setQForm(f => ({ ...f, options: [...f.options, ""] }))} style={{
              padding: "8px 14px", borderRadius: 8, border: `1.5px dashed ${C.primary}`, background: C.surface, color: C.primary,
              fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 4,
            }}><i className="ph ph-plus" /> إضافة خيار</button>
            <div style={{ marginTop: 12 }}>
              <Select label="الإجابة الصحيحة" value={String(qForm.correct)} onChange={v => setQForm(f => ({ ...f, correct: parseInt(v) }))}>
                {qForm.options.map((_, i) => <option key={i} value={i}>الخيار {i + 1}</option>)}
              </Select>
            </div>
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.primary, marginBottom: 10, padding: "4px 10px", background: C.primaryLight, borderRadius: 8, display: "inline-block" }}>شرح الإجابة (اختياري)</div>
            <TextArea label="" value={qForm.explanation} onChange={v => setQForm(f => ({ ...f, explanation: v }))} placeholder="اكتب شرحًا مفصلًا لماذا هذا الإجابة صحيحة..." rows={3} />
          </div>

          <Btn variant="primary" onClick={saveQ}><i className="ph ph-floppy-disk" /> {editingQ ? "حفظ التعديلات" : "حفظ السؤال"}</Btn>
        </div>
      );
    }
    // list
    let qs = Object.entries(questions).map(([id, q]) => ({ id, ...q }));
    // filter by category
    if (qCat) qs = qs.filter(q => q.category === qCat);
    // search by text
    if (qSearch.trim()) {
      const s = qSearch.trim().toLowerCase();
      qs = qs.filter(q => (q.question || "").toLowerCase().includes(s));
    }
    return (
      <div>
        <BackBtn onClick={() => setQSub("menu")} />
        <SectionTitle count={qs.length}>الأسئلة</SectionTitle>
        {/* Search + Filter */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ position: "relative", marginBottom: 8 }}>
            <i className="ph ph-magnifying-glass" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: C.textLight, fontSize: 16 }} />
            <input value={qSearch} onChange={e => setQSearch(e.target.value)} placeholder="البحث بنص السؤال..." autoComplete="off" spellCheck={false} className="admin-field" style={{
              width: "100%", padding: "10px 14px 10px 40px", border: `1.5px solid ${C.border}`, borderRadius: 10,
              background: C.surface, fontSize: 14, fontFamily: "inherit", color: C.text, outline: "none",
            }} />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button onClick={() => setQCat("")} style={{
              padding: "5px 12px", borderRadius: 20, border: "none", fontSize: 11, fontWeight: 800, fontFamily: "inherit", cursor: "pointer",
              background: qCat === "" ? C.primary : C.bg, color: qCat === "" ? "#fff" : C.textSec, transition: "all .15s",
            }}>كل الأقسام</button>
            {Q_CATS.map(c => {
              const count = Object.values(questions).filter((q: any) => q.category === c).length;
              return (
                <button key={c} onClick={() => setQCat(c)} style={{
                  padding: "5px 10px", borderRadius: 20, border: "none", fontSize: 11, fontWeight: 800, fontFamily: "inherit", cursor: "pointer",
                  background: qCat === c ? C.primary : C.bg, color: qCat === c ? "#fff" : C.textSec, transition: "all .15s", whiteSpace: "nowrap",
                }}>{c} ({count})</button>
              );
            })}
          </div>
        </div>
        {qs.length === 0 ? <Empty icon="question" text={qSearch.trim() || qCat ? "لا توجد نتائج للبحث" : "لا توجد أسئلة"} /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {qs.map((q, idx) => {
              const correctOpt = q.options?.[q.correctAnswer ?? 0] ?? "";
              const typeBadge = q.mediaType === "image" ? { icon: "image", bg: C.primaryLight, color: C.primary, label: "صورة" }
                : q.mediaType === "video" ? { icon: "video", bg: C.goldLight, color: C.gold, label: "فيديو" }
                : null;
              return (
                <div key={q.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "start", marginBottom: 8 }}>
                    {q.mediaType !== "text" && q.mediaUrl && (
                      <div style={{ width: 56, height: 56, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: C.bg }}>
                        {q.mediaType === "image" ? (
                          <img src={q.mediaUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: C.goldLight }}><i className="ph ph-video" style={{ color: C.gold, fontSize: 22 }} /></div>
                        )}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 900, color: C.textLight, minWidth: 24 }}>#{idx + 1}</span>
                        {typeBadge && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 6, background: typeBadge.bg, color: typeBadge.color, display: "flex", alignItems: "center", gap: 3 }}><i className={`ph ph-${typeBadge.icon}`} />{typeBadge.label}</span>}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, lineHeight: 1.5 }}>{q.question.substring(0, 90)}{q.question.length > 90 ? "..." : ""}</div>
                      <div style={{ fontSize: 11, color: C.textSec, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span>{q.category}</span>
                        <span>·</span>
                        <span>{q.options?.length || 0} خيارات</span>
                        {correctOpt && <span style={{ color: C.green, display: "flex", alignItems: "center", gap: 3 }}><i className="ph ph-check-circle" style={{ fontSize: 10 }} />الصحيح: {correctOpt.substring(0, 25)}{correctOpt.length > 25 ? "..." : ""}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => {
                      setEditingQ(q.id);
                      setQForm({ category: q.category || Q_CATS[0], type: q.mediaType || "text", mediaUrl: q.mediaUrl || "", text: q.question || "", explanation: q.explanation || "", correct: q.correctAnswer || 0, options: q.options || ["", ""] });
                      setQSub("form");
                    }} style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${C.primary}`, background: C.surface, color: C.primary, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}><i className="ph ph-pencil-simple" /> تعديل</button>
                    <button onClick={async () => { if (!confirm("حذف السؤال؟")) return; setLoading(true); try { await db.ref("questions/" + q.id).remove(); showToast("تم الحذف"); await loadAll(); } catch { showToast("حدث خطأ"); } setLoading(false); }}
                      style={{ padding: "7px 12px", borderRadius: 8, border: "none", background: C.redLight, color: C.red, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}><i className="ph ph-trash" /> حذف</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── REQUESTS ────────────────────────────────────────────
  function openReviewModal(reqId: string, req: any) {
    setReviewingReqId(reqId);
    setReviewingData(req);
    setReviewName(req.name || "");
    setReviewAddress(req.address || "");
    setReviewPhone(req.phone || "");
    setReviewWhatsapp(req.whatsapp || "");
    setReviewMapLink(req.mapLink || "");
    setReviewImageUrl(req.imageUrl || "");
    setReviewDesc(req.description || "");
    setReviewRating(String(req.rating || ""));
    setReviewReviewCount(String(req.reviewCount || ""));
    setReviewGovId(req.governorateId || "");
    setReviewAreaIds((req.areas || []).map((a: any) => a.id));
    setReviewWorkingDays(req.workingDays || []);
    setReviewWorkingHours(req.workingHours || "");
    setReviewPromoted(req.promoted || false);
    if (req.schedule) {
      setReviewSchedule(req.schedule);
    } else {
      const closedSet = new Set(req.workingDays || []);
      setReviewSchedule(ALL_DAYS_FULL.map((day, i) => ({
        closed: !closedSet.has(day),
        from: "08:00", to: "16:00",
      })));
    }
  }

  function closeReviewModal() {
    setReviewingReqId(null);
    setReviewingData(null);
    setShowAddAreaModal(false);
  }

  async function publishReviewedCenter() {
    if (!reviewingReqId || !reviewingData) return;
    setLoading(true);
    try {
      const areaObjs = reviewAreaIds.map(id => ({ id, name: areas[id]?.name || "" }));
      const workingDays = ALL_DAYS_FULL.filter((_, i) => !reviewSchedule[i].closed);
      const firstOpen = reviewSchedule.find(d => !d.closed);
      const workingHours = firstOpen ? `${firstOpen.from} – ${firstOpen.to}` : "";
      await db.ref("centers").push({
        name: reviewName.trim() || reviewingData.name,
        address: reviewAddress.trim() || reviewingData.address || null,
        mapLink: reviewMapLink.trim() || reviewingData.mapLink || null,
        phone: reviewPhone.trim() || reviewingData.phone || null,
        whatsapp: reviewWhatsapp.trim() || reviewingData.whatsapp || null,
        rating: parseFloat(reviewRating) || reviewingData.rating || 0,
        reviewCount: parseInt(reviewReviewCount) || reviewingData.reviewCount || 0,
        imageUrl: reviewImageUrl.trim() || null,
        description: reviewDesc.trim() || null,
        workingDays,
        workingHours,
        schedule: reviewSchedule,
        areas: areaObjs,
        areaId: areaObjs[0]?.id || "",
        governorateId: reviewGovId || reviewingData.governorateId || "",
        promoted: reviewPromoted,
        createdAt: new Date().toISOString(),
      });
      await db.ref("centerRequests/" + reviewingReqId).remove();
      showToast("تم النشر");
      closeReviewModal();
      await loadAll();
    } catch { showToast("حدث خطأ"); }
    setLoading(false);
  }

  function RequestsSection() {
    const entries = Object.entries(requests).sort((a, b) => (b[1].submittedAt || "").localeCompare(a[1].submittedAt || ""));
    return (
      <div>
        <BackBtn onClick={() => setView("menu")} />
        <SectionTitle count={entries.length}>طلبات الانتساب</SectionTitle>
        {entries.length === 0 ? <Empty icon="clipboard-text" text="لا توجد طلبات" /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {entries.map(([reqId, req]) => {
              const areaObjs = req.areas || [];
              const sch = req.schedule || [];
              const status = req.status === "pending" ? { bg: "rgba(245,158,11,0.15)", color: C.gold, txt: "قيد المراجعة" }
                : req.status === "approved" ? { bg: "rgba(34,197,94,0.15)", color: C.green, txt: "تم النشر" }
                : { bg: "rgba(239,68,68,0.15)", color: C.red, txt: "مرفوض" };
              return (
                <div key={reqId} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", direction: "rtl" }}>
                  {/* Header: avatar + name + status */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: 14, overflow: "hidden", flexShrink: 0,
                        background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {req.imageUrl ? (
                          <img src={req.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <span style={{ color: "#fff", fontSize: 22, fontWeight: 900 }}>{(req.name || "?").charAt(0)}</span>
                        )}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 900, color: C.text, lineHeight: 1.4, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{req.name}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.textSec, display: "flex", alignItems: "center", gap: 4 }}>
                          <i className="ph ph-calendar-blank" style={{ fontSize: 11 }} />
                          {req.submittedAt ? new Date(req.submittedAt).toLocaleDateString("ar-JO") : "-"}
                        </div>
                      </div>
                    </div>
                    <span style={{ background: status.bg, color: status.color, padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800, whiteSpace: "nowrap", flexShrink: 0 }}>{status.txt}</span>
                  </div>

                  {/* Info grid cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                    {req.phone && (
                      <div style={{ background: C.surface2, borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="ph ph-phone" style={{ color: C.primary, fontSize: 16 }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: C.textSec, marginBottom: 1 }}>الهاتف</div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{req.phone}</div>
                        </div>
                      </div>
                    )}
                    {req.whatsapp && (
                      <div style={{ background: C.surface2, borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="ph ph-whatsapp-logo" style={{ color: C.green, fontSize: 16 }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: C.textSec, marginBottom: 1 }}>واتساب</div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{req.whatsapp}</div>
                        </div>
                      </div>
                    )}
                    {req.governorateId && (
                      <div style={{ background: C.surface2, borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#FFFBEB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="ph ph-map-pin" style={{ color: C.gold, fontSize: 16 }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: C.textSec, marginBottom: 1 }}>المحافظة</div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{govs[req.governorateId]?.name || "-"}</div>
                        </div>
                      </div>
                    )}
                    {req.rating != null && (
                      <div style={{ background: C.surface2, borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="ph ph-star-fill" style={{ color: C.gold, fontSize: 16 }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: C.textSec, marginBottom: 1 }}>التقييم</div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{req.rating} / 5</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  {req.address && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10, padding: "10px 12px", background: C.surface2, borderRadius: 12 }}>
                      <i className="ph ph-map-trifold" style={{ color: C.primary, fontSize: 16, flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 12, color: C.textSec, lineHeight: 1.6 }}>{req.address}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => openReviewModal(reqId, req)}
                      style={{
                        flex: 1, padding: "11px 14px", borderRadius: 12, border: "none",
                        background: C.primary, color: "#fff", fontSize: 13, fontWeight: 800,
                        cursor: "pointer", fontFamily: "inherit",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      }}>
                      <i className="ph ph-eye" /> مراجعة المركز
                    </button>
                    <button onClick={async () => { if (!confirm(`رفض "${req.name}" ؟`)) return; try { await db.ref("centerRequests/" + reqId).remove(); showToast("تم الرفض"); await loadAll(); } catch { showToast("حدث خطأ"); } }}
                      style={{
                        padding: "11px 14px", borderRadius: 12, border: "none",
                        background: C.red, color: "#fff", fontSize: 13, fontWeight: 800,
                        cursor: "pointer", fontFamily: "inherit",
                        display: "flex", alignItems: "center", gap: 6,
                      }}>
                      <i className="ph ph-x-circle" /> رفض
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Review Modal ── */}
        {reviewingReqId && reviewingData && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 150,
            background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16,
          }} onClick={(e) => { if (e.target === e.currentTarget) closeReviewModal(); }}>
            <div style={{
              background: C.surface, borderRadius: 18, width: "100%", maxWidth: 520, maxHeight: "90vh",
              display: "flex", flexDirection: "column", overflow: "hidden",
              boxShadow: "0 16px 48px rgba(0,0,0,0.2)", direction: "rtl",
            }}>
              {/* Modal header */}
              <div style={{
                padding: "16px 20px", borderBottom: `1px solid ${C.border}`,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: C.text }}>مراجعة ونشر المركز</div>
                <button onClick={closeReviewModal} style={{
                  width: 32, height: 32, borderRadius: 8, border: "none",
                  background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}><i className="ph ph-x" style={{ fontSize: 18, color: C.textLight }} /></button>
              </div>

              {/* Modal body (scrollable) */}
              <div style={{ padding: 20, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                <CenterFormFields
                  value={{
                    name: reviewName, address: reviewAddress, mapLink: reviewMapLink,
                    phone: reviewPhone, whatsapp: reviewWhatsapp, imageUrl: reviewImageUrl,
                    description: reviewDesc, rating: reviewRating, reviewCount: reviewReviewCount,
                    govId: reviewGovId, areaIds: reviewAreaIds, schedule: reviewSchedule,
                  }}
                  onChange={patch => {
                    if (patch.name !== undefined) setReviewName(patch.name);
                    if (patch.address !== undefined) setReviewAddress(patch.address);
                    if (patch.mapLink !== undefined) setReviewMapLink(patch.mapLink);
                    if (patch.phone !== undefined) setReviewPhone(patch.phone);
                    if (patch.whatsapp !== undefined) setReviewWhatsapp(patch.whatsapp);
                    if (patch.imageUrl !== undefined) setReviewImageUrl(patch.imageUrl);
                    if (patch.description !== undefined) setReviewDesc(patch.description);
                    if (patch.rating !== undefined) setReviewRating(patch.rating);
                    if (patch.reviewCount !== undefined) setReviewReviewCount(patch.reviewCount);
                    if (patch.govId !== undefined) setReviewGovId(patch.govId);
                    if (patch.areaIds !== undefined) setReviewAreaIds(patch.areaIds);
                    if (patch.schedule !== undefined) setReviewSchedule(patch.schedule);
                  }}
                  onOpenAddArea={() => setShowAddAreaModal(true)}
                />
              </div>

              {/* Modal footer */}
              <div style={{
                padding: "14px 20px", borderTop: `1px solid ${C.border}`,
                display: "flex", gap: 10,
              }}>
                <button onClick={publishReviewedCenter}
                  style={{
                    flex: 1, padding: "10px 14px", borderRadius: 10, border: "none",
                    background: C.green, color: "#fff", fontSize: 13, fontWeight: 800,
                    cursor: "pointer", fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}>
                  <i className="ph ph-check-circle" /> نشر المركز
                </button>
                <button onClick={closeReviewModal}
                  style={{
                    padding: "10px 18px", borderRadius: 10, border: `1px solid ${C.border}`,
                    background: C.surface, color: C.text, fontSize: 13, fontWeight: 800,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Add Area Modal (inside review) ── */}
        <QuickAddAreaModal
          govId={reviewGovId}
          open={showAddAreaModal}
          onClose={() => setShowAddAreaModal(false)}
          onAdded={id => setReviewAreaIds(prev => [...prev, id])}
        />
      </div>
    );
  }

  // ── ADD FORMS ────────────────────────────────────────
  const [addGovName, setAddGovName] = useState("");
  const [addAreaGov, setAddAreaGov] = useState("");
  const [addAreaName, setAddAreaName] = useState("");

  // ── GEO INFO MANAGEMENT ─────────────────────────────
  const [geoExpandedGov, setGeoExpandedGov] = useState<string | null>(null);
  const [showAddGovModal, setShowAddGovModal] = useState(false);
  const [geoAddAreaGovId, setGeoAddAreaGovId] = useState<string | null>(null);
  const [editGovId, setEditGovId] = useState<string | null>(null);
  const [editAreaId, setEditAreaId] = useState<string | null>(null);

  // ── FEATURED CENTERS ─────────────────────────────────
  const [showFeaturedPicker, setShowFeaturedPicker] = useState(false);
  const [featuredPickerSearch, setFeaturedPickerSearch] = useState("");

  const ALL_DAYS_SHORT = ["س","ح","ن","ث","ر","خ","ج"];
  const ALL_DAYS_FULL = ["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];

  type DaySchedule = { closed: boolean; from: string; to: string };
  const DEFAULT_SCHEDULE: DaySchedule[] = ALL_DAYS_FULL.map((_, i) => ({ closed: i === 6, from: "08:00", to: "16:00" }));

  /* ── Shared center form (identical across review / add / edit) ── */
  type CenterFormValue = {
    name: string; address: string; mapLink: string; phone: string; whatsapp: string;
    imageUrl: string; description: string; rating: string; reviewCount: string;
    govId: string; areaIds: string[]; schedule: DaySchedule[];
  };
  const DEFAULT_CENTER_FORM: CenterFormValue = {
    name: "", address: "", mapLink: "", phone: "", whatsapp: "",
    imageUrl: "", description: "", rating: "", reviewCount: "",
    govId: "", areaIds: [], schedule: DEFAULT_SCHEDULE,
  };

  function CenterFormFields({ value, onChange, onOpenAddArea }: {
    value: CenterFormValue;
    onChange: (patch: Partial<CenterFormValue>) => void;
    onOpenAddArea: () => void;
  }) {
    return (
      <>
        {/* Image preview */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{
            width: 80, height: 80, borderRadius: 12, overflow: "hidden", flexShrink: 0,
            background: C.surface2, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {value.imageUrl ? (
              <img src={value.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{
                width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark || "#1d4ed8"})`, color: "#fff",
                fontSize: 28, fontWeight: 800,
              }}>{(value.name || "?").charAt(0)}</div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, fontWeight: 800, color: C.textSec, display: "block", marginBottom: 6 }}>صورة المركز (URL)</label>
            <input value={value.imageUrl} onChange={e => onChange({ imageUrl: e.target.value })} placeholder="رابط الصورة..." style={{
              width: "100%", padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.border}`,
              fontSize: 13, fontFamily: "inherit", direction: "ltr", background: C.surface2,
            }} />
          </div>
        </div>

        {/* Name */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 800, color: C.textSec, display: "block", marginBottom: 6 }}>اسم المركز</label>
          <input value={value.name} onChange={e => onChange({ name: e.target.value })} style={{
            width: "100%", padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.border}`,
            fontSize: 13, fontFamily: "inherit", background: C.surface2,
          }} />
        </div>

        {/* Address + map link */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: C.textSec, display: "block", marginBottom: 6 }}>العنوان</label>
            <input value={value.address} onChange={e => onChange({ address: e.target.value })} style={{
              width: "100%", padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.border}`,
              fontSize: 13, fontFamily: "inherit", background: C.surface2,
            }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: C.textSec, display: "block", marginBottom: 6 }}>رابط Google Maps</label>
            <input value={value.mapLink} onChange={e => onChange({ mapLink: e.target.value })} style={{
              width: "100%", padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.border}`,
              fontSize: 13, fontFamily: "inherit", direction: "ltr", background: C.surface2,
            }} />
          </div>
        </div>

        {/* Phone + whatsapp */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: C.textSec, display: "block", marginBottom: 6 }}>الهاتف</label>
            <input value={value.phone} onChange={e => onChange({ phone: e.target.value })} style={{
              width: "100%", padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.border}`,
              fontSize: 13, fontFamily: "inherit", direction: "ltr", background: C.surface2,
            }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: C.textSec, display: "block", marginBottom: 6 }}>WhatsApp</label>
            <input value={value.whatsapp} onChange={e => onChange({ whatsapp: e.target.value })} style={{
              width: "100%", padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.border}`,
              fontSize: 13, fontFamily: "inherit", direction: "ltr", background: C.surface2,
            }} />
          </div>
        </div>

        {/* Governorate + area chips */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 800, color: C.textSec, display: "block", marginBottom: 6 }}>المحافظة</label>
          <select value={value.govId} onChange={e => onChange({ govId: e.target.value, areaIds: [] })} style={{
            width: "100%", padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.border}`,
            fontSize: 13, fontFamily: "inherit", background: C.surface2,
            marginBottom: 10,
          }}>
            <option value="">اختر المحافظة</option>
            {Object.entries(govs).map(([id, g]) => <option key={id} value={id}>{g.name}</option>)}
          </select>
          <label style={{ fontSize: 12, fontWeight: 800, color: C.textSec, display: "block", marginBottom: 6 }}>المناطق المخدّمة</label>
          {value.govId ? (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {Object.entries(areas).filter(([_, a]) => a.governorateId === value.govId).sort((a, b) => a[1].name.localeCompare(b[1].name, "ar")).map(([id, a]) => {
                const selected = value.areaIds.includes(id);
                return (
                  <button key={id} onClick={() => {
                    onChange({ areaIds: selected ? value.areaIds.filter(x => x !== id) : [...value.areaIds, id] });
                  }} style={{
                    padding: "6px 12px", borderRadius: 10,
                    border: `1.5px solid ${selected ? C.primary : C.border}`,
                    background: selected ? C.primaryLight : C.surface2,
                    color: selected ? C.primary : C.textSec,
                    fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                    display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap",
                  }}>
                    <i className={`ph ${selected ? "ph-check-circle" : "ph-circle"}`} style={{ fontSize: 14 }} />
                    {a.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: C.textLight, padding: "6px 0" }}>اختر المحافظة أولاً</div>
          )}
          {value.govId && (
            <button onClick={onOpenAddArea} style={{
              marginTop: 8,
              padding: "6px 12px", borderRadius: 10,
              border: `1.5px dashed ${C.primary}`,
              background: C.surface,
              color: C.primary,
              fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap",
            }}>
              <i className="ph ph-plus" style={{ fontSize: 14 }} />
              إضافة منطقة جديدة
            </button>
          )}
        </div>

        {/* Rating + review count */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: C.textSec, display: "block", marginBottom: 6 }}>التقييم (0–5)</label>
            <input type="number" min="0" max="5" step="0.1" value={value.rating} onChange={e => onChange({ rating: e.target.value })} style={{
              width: "100%", padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.border}`,
              fontSize: 13, fontFamily: "inherit", direction: "ltr", background: C.surface2,
            }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: C.textSec, display: "block", marginBottom: 6 }}>عدد التقييمات</label>
            <input type="number" min="0" value={value.reviewCount} onChange={e => onChange({ reviewCount: e.target.value })} style={{
              width: "100%", padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.border}`,
              fontSize: 13, fontFamily: "inherit", direction: "ltr", background: C.surface2,
            }} />
          </div>
        </div>

        {/* Working hours table */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 800, color: C.textSec, display: "block", marginBottom: 6 }}>أوقات الدوام</label>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, background: C.surface2, borderRadius: 10, overflow: "hidden" }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 700, color: C.textSec, fontSize: 10 }}>اليوم</th>
                  <th style={{ textAlign: "center", padding: "6px 8px", fontWeight: 700, color: C.textSec, fontSize: 10 }}>من</th>
                  <th style={{ textAlign: "center", padding: "6px 8px", fontWeight: 700, color: C.textSec, fontSize: 10 }}>إلى</th>
                  <th style={{ textAlign: "center", padding: "6px 8px", fontWeight: 700, color: C.red, fontSize: 10 }}>مغلق</th>
                </tr>
              </thead>
              <tbody>
                {ALL_DAYS_FULL.map((day, i) => {
                  const row = value.schedule[i] || { closed: false, from: "08:00", to: "16:00" };
                  return (
                    <tr key={day} style={{ borderBottom: "1px solid " + C.border, background: row.closed ? "rgba(239,68,68,0.04)" : "transparent" }}>
                      <td style={{ padding: "6px 8px", fontWeight: 700, color: row.closed ? C.textLight : C.text }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                          <span style={{
                            width: 22, height: 22, borderRadius: 6, fontSize: 10, fontWeight: 800,
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            background: row.closed ? C.surface2 : C.primaryLight,
                            color: row.closed ? C.textLight : C.primary,
                          }}>{ALL_DAYS_SHORT[i]}</span>
                          <span>{day}</span>
                        </span>
                      </td>
                      <td style={{ padding: "6px 8px", textAlign: "center" }}>
                        <input type="time" value={row.from} disabled={row.closed}
                          onChange={e => onChange({ schedule: value.schedule.map((d, idx) => idx === i ? { ...d, from: e.target.value } : d) })}
                          style={{ padding: "4px 6px", borderRadius: 6, fontSize: 11, border: `1.5px solid ${C.border}`, fontFamily: "inherit", background: row.closed ? "#F3F4F6" : C.surface, color: row.closed ? C.textLight : C.text, width: 70 }} />
                      </td>
                      <td style={{ padding: "6px 8px", textAlign: "center" }}>
                        <input type="time" value={row.to} disabled={row.closed}
                          onChange={e => onChange({ schedule: value.schedule.map((d, idx) => idx === i ? { ...d, to: e.target.value } : d) })}
                          style={{ padding: "4px 6px", borderRadius: 6, fontSize: 11, border: `1.5px solid ${C.border}`, fontFamily: "inherit", background: row.closed ? "#F3F4F6" : C.surface, color: row.closed ? C.textLight : C.text, width: 70 }} />
                      </td>
                      <td style={{ padding: "6px 8px", textAlign: "center" }}>
                        <input type="checkbox" checked={row.closed}
                          onChange={e => onChange({ schedule: value.schedule.map((d, idx) => idx === i ? { ...d, closed: e.target.checked } : d) })}
                          style={{ width: 16, height: 16, accentColor: C.red, cursor: "pointer" }} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 800, color: C.textSec, display: "block", marginBottom: 6 }}>وصف المركز</label>
          <textarea value={value.description} onChange={e => onChange({ description: e.target.value })} placeholder="أوصف المركز..." rows={3} style={{
            width: "100%", padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.border}`,
            fontSize: 13, fontFamily: "inherit", background: C.surface2, resize: "vertical",
          }} />
        </div>
      </>
    );
  }

  function QuickAddAreaModal({ govId, open, onClose, onAdded }: {
    govId: string; open: boolean; onClose: () => void; onAdded: (id: string) => void;
  }) {
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (open) {
        setName(""); setError("");
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }, [open]);

    async function save() {
      if (!govId) { setError("اختر المحافظة أولاً"); return; }
      if (!name.trim()) { setError("أدخل اسم المنطقة"); return; }
      setSaving(true); setError("");
      try {
        const ref = db.ref("areas").push();
        await ref.set({ name: name.trim(), governorateId: govId });
        const id = ref.key!;
        setAreas(prev => ({ ...prev, [id]: { id, name: name.trim(), governorateId: govId } }));
        onAdded(id);
        onClose();
        showToast("تم إضافة المنطقة");
      } catch { setError("حدث خطأ أثناء الحفظ. حاول مجدداً."); }
      setSaving(false);
    }

    if (!open) return null;
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(15,23,42,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div style={{
          background: "#fff", borderRadius: 20,
          width: "100%", maxWidth: 420,
          padding: 24,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A" }}>إضافة منطقة جديدة</div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 10,
              border: "1.5px solid #E2E8F0", background: "#F8FAFC",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontFamily: "inherit",
            }}>
              <i className="ph ph-x" style={{ fontSize: 16, color: "#64748B" }} />
            </button>
          </div>
          <div style={{ fontSize: 13, color: "#64748B", marginBottom: 12, lineHeight: 1.6 }}>
            سيتم حفظ المنطقة تلقائياً في قاعدة البيانات وارتباطها بمحافظة <b>{govs[govId]?.name || "المحافظة المختارة"}</b>.
          </div>
          <input ref={inputRef} value={name}
            onChange={e => { setName(e.target.value); setError(""); }}
            onKeyDown={e => { if (e.key === "Enter") save(); }}
            placeholder="أدخل اسم المنطقة..."
            autoComplete="off"
            spellCheck={false}
            className="admin-field"
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 12,
              border: `1.5px solid ${error ? "#DC2626" : "#E5E7EB"}`,
              background: "#F9FAFB", fontSize: 14, fontFamily: "inherit", color: "#0F172A",
              outline: "none", boxSizing: "border-box",
            }}
          />
          {error && (
            <div style={{ fontSize: 12, color: "#DC2626", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
              <i className="ph ph-warning-circle" style={{ fontSize: 13 }} />
              {error}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: "12px", borderRadius: 12,
              border: "1.5px solid #E2E8F0", background: "#F8FAFC",
              color: "#64748B", fontSize: 14, fontWeight: 800,
              cursor: "pointer", fontFamily: "inherit",
            }}>
              إلغاء
            </button>
            <button onClick={save} disabled={saving} style={{
              flex: 1, padding: "12px", borderRadius: 12,
              border: "none", background: C.primary,
              color: "#fff", fontSize: 14, fontWeight: 800,
              cursor: saving ? "wait" : "pointer", fontFamily: "inherit",
              opacity: saving ? 0.7 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              {saving ? (
                <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              ) : (
                <i className="ph ph-floppy-disk" />
              )}
              {saving ? "جارٍ الحفظ..." : "حفظ"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [addCF, setAddCF] = useState<CenterFormValue>(DEFAULT_CENTER_FORM);
  const [showAddCFArea, setShowAddCFArea] = useState(false);
  const [addCenterStep, setAddCenterStep] = useState<1|2>(1);
  const [addMapsFetching, setAddMapsFetching] = useState(false);
  const [addFetchError, setAddFetchError] = useState("");
  const [addFetchDone, setAddFetchDone] = useState(false);

  useEffect(() => {
    if (view === "add-center") {
      const gids = Object.keys(govs);
      if (gids.length && !addCF.govId) setAddCF(s => ({ ...s, govId: gids[0], areaIds: [] }));
    }
  }, [view, govs]);

  function AddSection() {
    const [showAddCFAreaModal, setShowAddCFAreaModal] = useState(false);

    function resetAddCenter() {
      setAddCF({ ...DEFAULT_CENTER_FORM, govId: Object.keys(govs)[0] || "" });
      setAddFetchError("");
      setAddFetchDone(false);
    }

    function isMapsUrl(url: string) {
      return /google\.(com|jo)\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/i.test(url);
    }

    async function fetchFromMaps(url: string) {
      if (!url.trim()) return;
      setAddMapsFetching(true);
      setAddFetchError("");
      setAddFetchDone(false);

      try {
        const res = await fetch("/api/places/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = await res.json() as { name?: string; address?: string; error?: string; };
        if (!res.ok) { setAddFetchError(data.error || "حدث خطأ"); return; }
        setAddCF(s => ({
          ...s,
          name: data.name || s.name,
          address: data.address || s.address,
        }));
        setAddFetchDone(true);
      } catch {
        setAddFetchError("تعذر الاتصال بالخادم");
      } finally {
        setAddMapsFetching(false);
      }
    }

    const workingDays = ALL_DAYS_FULL.filter((_, i) => !addCF.schedule[i]?.closed);
    const firstOpen = addCF.schedule.find(d => !d.closed);
    const workingHours = firstOpen ? `${firstOpen.from} – ${firstOpen.to}` : "";

    return (
      <div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <BackBtn onClick={() => { resetAddCenter(); setView("centers-manage"); }} />
        <SectionTitle>إضافة مركز تدريب</SectionTitle>

        {/* Maps URL lookup convenience */}
        <div style={{ background: C.surface, border: `2px solid ${C.primary}`, borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: `0 0 0 4px ${C.primaryLight}` }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.primary, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <i className="ph ph-map-pin" style={{ fontSize: 14 }} />
            رابط المركز على Google Maps
          </div>
          <div style={{ fontSize: 11, color: C.textSec, marginBottom: 10 }}>الصق رابط المركز لجلب الاسم والعنوان تلقائياً</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="url"
              value={addCF.mapLink}
              onChange={e => setAddCF(s => ({ ...s, mapLink: e.target.value }))}
              onPaste={e => {
                const pasted = e.clipboardData.getData("text");
                if (isMapsUrl(pasted)) setTimeout(() => fetchFromMaps(pasted), 80);
              }}
              placeholder="https://maps.google.com/maps/place/..."
              style={{
                flex: 1, padding: "10px 14px", borderRadius: 10,
                border: `1.5px solid ${C.border}`, background: C.bg,
                fontSize: 13, fontFamily: "inherit", color: C.text,
                outline: "none", direction: "ltr", textAlign: "right",
              }}
            />
            <button
              onClick={() => fetchFromMaps(addCF.mapLink)}
              disabled={addMapsFetching || !addCF.mapLink.trim()}
              style={{
                padding: "10px 14px", borderRadius: 10,
                background: addMapsFetching || !addCF.mapLink.trim() ? C.textLight : C.primary,
                color: "#fff", border: "none",
                cursor: addMapsFetching || !addCF.mapLink.trim() ? "default" : "pointer",
                fontSize: 13, fontWeight: 800, fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
              }}
            >
              {addMapsFetching
                ? <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                : <i className="ph ph-magnifying-glass" />}
              {addMapsFetching ? "جاري..." : "جلب البيانات"}
            </button>
          </div>
          {addFetchError && (
            <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8, background: "#FEF2F2", color: "#DC2626", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "flex-start", gap: 6 }}>
              <i className="ph ph-warning-circle" style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }} />
              {addFetchError}
            </div>
          )}
          {addFetchDone && (
            <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8, background: "#F0FDF4", color: "#16A34A", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="ph ph-check-circle" style={{ fontSize: 14 }} />
              تم جلب البيانات — يمكنك التعديل
            </div>
          )}
        </div>

        {/* Form fields — identical to review/publish form */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: 20, marginBottom: 14, display: "flex", flexDirection: "column", gap: 14 }}>
          <CenterFormFields
            value={addCF}
            onChange={patch => setAddCF(s => ({ ...s, ...patch }))}
            onOpenAddArea={() => setShowAddCFAreaModal(true)}
          />
        </div>

        <Btn variant="primary" onClick={async () => {
          if (!addCF.name.trim()) { showToast("أدخل اسم المركز"); return; }
          if (!addCF.govId) { showToast("اختر المحافظة"); return; }
          if (addCF.areaIds.length === 0) { showToast("اختر منطقة واحدة على الأقل"); return; }
          if (workingDays.length === 0) { showToast("حدد يوم دوام واحد على الأقل"); return; }
          const areaObjs = addCF.areaIds.map(id => ({ id, name: areas[id]?.name || "" }));
          setLoading(true); try {
            // Compute next publicId
            let nextPublicId = 1;
            const snap = await db.ref("centers").once("value");
            const existing = snap.val() || {};
            for (const c of Object.values(existing)) {
              const pub = (c as any).publicId;
              if (pub && pub >= nextPublicId) nextPublicId = pub + 1;
            }
            await db.ref("centers").push({
            publicId: nextPublicId,
            name: addCF.name.trim(),
            governorateId: addCF.govId,
            areaId: addCF.areaIds[0],
            areas: areaObjs,
            address: addCF.address.trim() || null,
            phone: addCF.phone.trim() || null,
            whatsapp: addCF.whatsapp.trim() || null,
            mapLink: addCF.mapLink.trim() || null,
            imageUrl: addCF.imageUrl.trim() || null,
            description: addCF.description.trim() || null,
            rating: parseFloat(addCF.rating) || 0,
            reviewCount: parseInt(addCF.reviewCount) || 0,
            workingHours,
            workingDays,
            schedule: addCF.schedule,
            promoted: false,
            createdAt: new Date().toISOString(),
          }); showToast("تم الإضافة"); resetAddCenter(); await loadAll(); setView("centers-manage"); } catch { showToast("حدث خطأ"); } setLoading(false);
        }}><i className="ph ph-floppy-disk" /> حفظ المركز</Btn>

        <QuickAddAreaModal
          govId={addCF.govId}
          open={showAddCFAreaModal}
          onClose={() => setShowAddCFAreaModal(false)}
          onAdded={id => setAddCF(s => ({ ...s, areaIds: [...s.areaIds, id] }))}
        />
      </div>
    );
  }

  // ── EDIT CENTER ──────────────────────────────────────────────
  const [editId, setEditId] = useState<string | null>(null);
  const [editGovName, setEditGovName] = useState("");
  const [editAreaGov, setEditAreaGov] = useState("");
  const [editAreaName, setEditAreaName] = useState("");
  const [editCF, setEditCF] = useState<CenterFormValue>(DEFAULT_CENTER_FORM);
  const [showEditCFArea, setShowEditCFArea] = useState(false);

  function openEditCenter(id: string, item: any) {
    setEditId(id);
    const existingAreas = item.areas || (item.areaId ? [{ id: item.areaId, name: areas[item.areaId]?.name || "" }] : []);
    const areaIds = existingAreas.map((a: any) => a.id);
    let schedule: DaySchedule[];
    if (item.schedule) {
      schedule = item.schedule;
    } else {
      const closedSet = new Set(item.workingDays || []);
      schedule = ALL_DAYS_FULL.map(day => ({
        closed: !closedSet.has(day),
        from: "08:00", to: "16:00",
      }));
    }
    setEditCF({
      name: item.name || "", address: item.address || "", mapLink: item.mapLink || "",
      phone: item.phone || "", whatsapp: item.whatsapp || "", imageUrl: item.imageUrl || "",
      description: item.description || "", rating: String(item.rating || ""), reviewCount: String(item.reviewCount || ""),
      govId: item.governorateId || "", areaIds, schedule,
    });
    setView("edit-center");
  }

  function EditCenterSection() {
    if (!editId || !centers[editId]) return <Empty icon="buildings" text="لم يتم اختيار مركز" />;

    const workingDays = ALL_DAYS_FULL.filter((_, i) => !editCF.schedule[i]?.closed);
    const firstOpen = editCF.schedule.find(d => !d.closed);
    const workingHours = firstOpen ? `${firstOpen.from} – ${firstOpen.to}` : "";

    return (
      <div>
        <BackBtn onClick={() => { setEditId(null); setView("centers-manage"); }} />
        <SectionTitle>تعديل مركز</SectionTitle>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: 20, marginBottom: 14, display: "flex", flexDirection: "column", gap: 14 }}>
          <CenterFormFields
            value={editCF}
            onChange={patch => setEditCF(s => ({ ...s, ...patch }))}
            onOpenAddArea={() => setShowEditCFArea(true)}
          />
        </div>

        <Btn variant="primary" onClick={async () => {
          if (!editCF.name.trim()) { showToast("أدخل اسم المركز"); return; }
          if (editCF.phone.trim() && !/^07\d{8}$/.test(editCF.phone.trim())) { showToast("رقم الهاتف غير صالح"); return; }
          if (!editCF.govId) { showToast("اختر المحافظة"); return; }
          if (editCF.areaIds.length === 0) { showToast("اختر منطقة واحدة على الأقل"); return; }
          if (workingDays.length === 0) { showToast("اختر يوم دوام واحد على الأقل"); return; }
          const areaObjs = editCF.areaIds.map(id => ({ id, name: areas[id]?.name || "" }));
          setLoading(true); try {
            await db.ref("centers/" + editId).update({
              name: editCF.name.trim(),
              governorateId: editCF.govId,
              areaId: editCF.areaIds[0],
              areas: areaObjs,
              address: editCF.address.trim() || null,
              phone: editCF.phone.trim() || null,
              whatsapp: editCF.whatsapp.trim() || null,
              mapLink: editCF.mapLink.trim() || null,
              imageUrl: editCF.imageUrl.trim() || null,
              description: editCF.description.trim() || null,
              rating: parseFloat(editCF.rating) || 0,
              reviewCount: parseInt(editCF.reviewCount) || 0,
              workingHours,
              workingDays,
              schedule: editCF.schedule,
            });
            showToast("تم التحديث");
            await loadAll(); setEditId(null); setView("centers-manage");
          } catch { showToast("حدث خطأ"); }
          setLoading(false);
        }}><i className="ph ph-check" /> حفظ التغييرات</Btn>

        <QuickAddAreaModal
          govId={editCF.govId}
          open={showEditCFArea}
          onClose={() => setShowEditCFArea(false)}
          onAdded={id => setEditCF(s => ({ ...s, areaIds: [...s.areaIds, id] }))}
        />
      </div>
    );
  }

  // ── GEO INFO MANAGEMENT ──────────────────────────────────────
  function GeoManageSection() {
    const govEntries = Object.entries(govs).sort((a, b) => a[1].name.localeCompare(b[1].name, "ar"));

    async function deleteGov(id: string, name: string) {
      const areaCount = Object.values(areas).filter(a => a.governorateId === id).length;
      if (areaCount > 0) { showToast("احذف مناطق هذه المحافظة أولاً"); return; }
      if (!confirm(`حذف محافظة "${name}"؟`)) return;
      setLoading(true); try { await db.ref("governorates/" + id).remove(); showToast("تم الحذف"); await loadAll(); } catch { showToast("حدث خطأ"); } setLoading(false);
    }
    async function deleteArea(id: string, name: string) {
      const inUse = Object.values(centers).some(c => c.areaId === id || c.areas?.some((a: any) => a.id === id));
      if (inUse) { showToast("لا يمكن حذف منطقة مرتبطة بمركز"); return; }
      if (!confirm(`حذف منطقة "${name}"؟`)) return;
      setLoading(true); try { await db.ref("areas/" + id).remove(); showToast("تم الحذف"); await loadAll(); } catch { showToast("حدث خطأ"); } setLoading(false);
    }

    return (
      <div>
        <BackBtn onClick={() => setView("menu")} />
        <SectionTitle count={govEntries.length}>إدارة المعلومات الجغرافية</SectionTitle>

        <Btn variant="outline" style={{ marginBottom: 16 }} onClick={() => { setAddGovName(""); setShowAddGovModal(true); }}>
          <i className="ph ph-plus" /> إضافة محافظة جديدة
        </Btn>

        {govEntries.length === 0 ? <Empty icon="map-trifold" text="لا توجد محافظات بعد" /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {govEntries.map(([govId, gov]) => {
              const govAreaEntries = Object.entries(areas).filter(([, a]) => a.governorateId === govId);
              const expanded = geoExpandedGov === govId;
              return (
                <div key={govId} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 14 }}>
                    <button onClick={() => setGeoExpandedGov(expanded ? null : govId)} style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "right", padding: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: C.cyanLight, color: C.cyan, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                        <i className="ph ph-map-trifold" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{gov.name}</div>
                        <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>{govAreaEntries.length} منطقة</div>
                      </div>
                      <i className={`ph ph-caret-${expanded ? "up" : "down"}`} style={{ fontSize: 16, color: C.textLight }} />
                    </button>
                    <button onClick={() => { setEditGovName(gov.name); setEditGovId(govId); }} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface2, color: C.primary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <i className="ph ph-pencil-simple" style={{ fontSize: 14 }} />
                    </button>
                    <button onClick={() => deleteGov(govId, gov.name)} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: C.redLight, color: C.red, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <i className="ph ph-trash" style={{ fontSize: 14 }} />
                    </button>
                  </div>
                  {expanded && (
                    <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${C.surface2}` }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
                        {govAreaEntries.length === 0 && <div style={{ fontSize: 12, color: C.textLight, padding: "6px 2px" }}>لا توجد مناطق في هذه المحافظة</div>}
                        {govAreaEntries.map(([areaId, area]) => (
                          <div key={areaId} style={{ display: "flex", alignItems: "center", gap: 8, background: C.surface2, borderRadius: 10, padding: "8px 10px" }}>
                            <i className="ph ph-map-pin" style={{ fontSize: 14, color: C.primary }} />
                            <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: C.text }}>{area.name}</div>
                            <button onClick={() => { setEditAreaName(area.name); setEditAreaGov(area.governorateId); setEditAreaId(areaId); }} style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.primary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <i className="ph ph-pencil-simple" style={{ fontSize: 12 }} />
                            </button>
                            <button onClick={() => deleteArea(areaId, area.name)} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: C.redLight, color: C.red, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <i className="ph ph-trash" style={{ fontSize: 12 }} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => { setAddAreaName(""); setAddAreaGov(govId); setGeoAddAreaGovId(govId); }} style={{
                        marginTop: 10, width: "100%", padding: "8px 12px", borderRadius: 10,
                        border: `1.5px dashed ${C.primary}`, background: C.surface,
                        color: C.primary, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                      }}>
                        <i className="ph ph-plus" style={{ fontSize: 14 }} /> إضافة منطقة إلى {gov.name}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add governorate modal */}
        {showAddGovModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={e => { if (e.target === e.currentTarget) setShowAddGovModal(false); }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 400, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: C.text }}>إضافة محافظة جديدة</div>
                <button onClick={() => setShowAddGovModal(false)} style={{ width: 32, height: 32, borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.surface2, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <i className="ph ph-x" style={{ fontSize: 16, color: C.textSec }} />
                </button>
              </div>
              <Input label="اسم المحافظة" value={addGovName} onChange={setAddGovName} placeholder="مثال: عمان" />
              <Btn variant="primary" onClick={async () => {
                if (!addGovName.trim()) { showToast("أدخل اسم المحافظة"); return; }
                setLoading(true); try { await db.ref("governorates").push({ name: addGovName.trim() }); showToast("تم الإضافة"); setAddGovName(""); setShowAddGovModal(false); await loadAll(); } catch { showToast("حدث خطأ"); } setLoading(false);
              }}><i className="ph ph-floppy-disk" /> حفظ</Btn>
            </div>
          </div>
        )}

        {/* Edit governorate modal */}
        {editGovId && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={e => { if (e.target === e.currentTarget) setEditGovId(null); }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 400, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: C.text }}>تعديل محافظة</div>
                <button onClick={() => setEditGovId(null)} style={{ width: 32, height: 32, borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.surface2, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <i className="ph ph-x" style={{ fontSize: 16, color: C.textSec }} />
                </button>
              </div>
              <Input label="اسم المحافظة" value={editGovName} onChange={setEditGovName} />
              <Btn variant="primary" onClick={async () => {
                if (!editGovName.trim()) { showToast("أدخل اسم المحافظة"); return; }
                setLoading(true); try { await db.ref("governorates/" + editGovId).update({ name: editGovName.trim() }); showToast("تم التحديث"); setEditGovId(null); await loadAll(); } catch { showToast("حدث خطأ"); } setLoading(false);
              }}><i className="ph ph-check" /> حفظ</Btn>
            </div>
          </div>
        )}

        {/* Add area modal */}
        {geoAddAreaGovId && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={e => { if (e.target === e.currentTarget) setGeoAddAreaGovId(null); }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 400, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: C.text }}>إضافة منطقة إلى {govs[geoAddAreaGovId]?.name}</div>
                <button onClick={() => setGeoAddAreaGovId(null)} style={{ width: 32, height: 32, borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.surface2, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <i className="ph ph-x" style={{ fontSize: 16, color: C.textSec }} />
                </button>
              </div>
              <Input label="اسم المنطقة" value={addAreaName} onChange={setAddAreaName} placeholder="مثال: خلدا" />
              <Btn variant="primary" onClick={async () => {
                if (!addAreaName.trim()) { showToast("أدخل اسم المنطقة"); return; }
                setLoading(true); try { await db.ref("areas").push({ name: addAreaName.trim(), governorateId: geoAddAreaGovId }); showToast("تم الإضافة"); setAddAreaName(""); setGeoAddAreaGovId(null); await loadAll(); } catch { showToast("حدث خطأ"); } setLoading(false);
              }}><i className="ph ph-floppy-disk" /> حفظ</Btn>
            </div>
          </div>
        )}

        {/* Edit area modal */}
        {editAreaId && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={e => { if (e.target === e.currentTarget) setEditAreaId(null); }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 400, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: C.text }}>تعديل منطقة</div>
                <button onClick={() => setEditAreaId(null)} style={{ width: 32, height: 32, borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.surface2, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <i className="ph ph-x" style={{ fontSize: 16, color: C.textSec }} />
                </button>
              </div>
              <Select label="المحافظة" value={editAreaGov} onChange={setEditAreaGov}>
                {Object.entries(govs).map(([id, g]) => <option key={id} value={id}>{g.name}</option>)}
              </Select>
              <Input label="اسم المنطقة" value={editAreaName} onChange={setEditAreaName} />
              <Btn variant="primary" onClick={async () => {
                if (!editAreaName.trim()) { showToast("أدخل اسم المنطقة"); return; }
                setLoading(true); try { await db.ref("areas/" + editAreaId).update({ name: editAreaName.trim(), governorateId: editAreaGov }); showToast("تم التحديث"); setEditAreaId(null); await loadAll(); } catch { showToast("حدث خطأ"); } setLoading(false);
              }}><i className="ph ph-check" /> حفظ</Btn>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── CENTERS MANAGEMENT ────────────────────────────────────────
  function CentersManageSection() {
    const entries = Object.entries(centers).sort((a, b) => (a[1].name || "").localeCompare(b[1].name || "", "ar"));

    async function toggleSuspend(id: string, suspended: boolean) {
      setLoading(true); try { await db.ref("centers/" + id).update({ suspended: !suspended }); showToast(!suspended ? "تم تعليق النشر" : "تم استئناف النشر"); await loadAll(); } catch { showToast("حدث خطأ"); } setLoading(false);
    }
    async function deleteCenter(id: string, name: string) {
      if (!confirm(`حذف مركز "${name}"؟ هذا الإجراء نهائي.`)) return;
      setLoading(true); try { await db.ref("centers/" + id).remove(); showToast("تم الحذف"); await loadAll(); } catch { showToast("حدث خطأ"); } setLoading(false);
    }

    return (
      <div>
        <BackBtn onClick={() => setView("menu")} />
        <SectionTitle count={entries.length}>إدارة المراكز</SectionTitle>

        <Btn variant="outline" style={{ marginBottom: 16 }} onClick={() => setView("add-center")}>
          <i className="ph ph-plus" /> إضافة مركز جديد
        </Btn>

        {entries.length === 0 ? <Empty icon="buildings" text="لا توجد مراكز بعد" /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {entries.map(([id, c]) => {
              const suspended = !!c.suspended;
              const govName = govs[c.governorateId]?.name || "";
              const areaNames = (c.areas || []).map((a: any) => a.name).join("، ") || (areas[c.areaId]?.name || "");
              return (
                <div key={id} style={{ background: C.surface, border: `1px solid ${suspended ? C.red : C.border}`, borderRadius: 14, padding: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: c.imageUrl ? "transparent" : C.goldLight, color: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, overflow: "hidden" }}>
                      {c.imageUrl ? <img src={c.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <i className="ph ph-buildings" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{c.name}</span>
                        {c.promoted && <i className="ph-fill ph-crown" style={{ color: C.gold, fontSize: 13 }} />}
                      </div>
                      <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>{areaNames}{areaNames && govName ? " · " : ""}{govName}</div>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 20,
                      background: suspended ? C.redLight : C.greenLight, color: suspended ? C.red : C.green, flexShrink: 0, whiteSpace: "nowrap",
                    }}>{suspended ? "معلق النشر" : "منشور"}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => openEditCenter(id, c)} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.primary}`, background: C.surface, color: C.primary, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                      <i className="ph ph-pencil-simple" /> تعديل
                    </button>
                    <button onClick={() => toggleSuspend(id, suspended)} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1px solid ${suspended ? C.green : C.gold}`, background: C.surface, color: suspended ? C.green : C.gold, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                      <i className={`ph ph-${suspended ? "eye" : "eye-slash"}`} /> {suspended ? "استئناف النشر" : "تعليق النشر"}
                    </button>
                    <button onClick={() => deleteCenter(id, c.name)} style={{ padding: "8px 10px", borderRadius: 8, border: "none", background: C.redLight, color: C.red, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="ph ph-trash" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── FEATURED CENTERS ──────────────────────────────────────────
  function FeaturedCentersSection() {
    const featured = Object.entries(centers).filter(([, c]) => c.promoted);
    const pickable = Object.entries(centers).filter(([, c]) => !c.promoted && c.name?.toLowerCase().includes(featuredPickerSearch.trim().toLowerCase()));

    async function setPromoted(id: string, promoted: boolean) {
      setLoading(true); try { await db.ref("centers/" + id).update({ promoted }); showToast(promoted ? "تمت الإضافة للمميزين" : "تمت الإزالة من المميزين"); await loadAll(); } catch { showToast("حدث خطأ"); } setLoading(false);
    }

    return (
      <div>
        <BackBtn onClick={() => setView("menu")} />
        <SectionTitle count={featured.length}>المراكز المميزة</SectionTitle>

        <Btn variant="outline" style={{ marginBottom: 16 }} onClick={() => { setFeaturedPickerSearch(""); setShowFeaturedPicker(true); }}>
          <i className="ph ph-plus" /> إضافة مركز مميز
        </Btn>

        {featured.length === 0 ? <Empty icon="crown-simple" text="لا توجد مراكز مميزة بعد" /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {featured.map(([id, c]) => {
              const govName = govs[c.governorateId]?.name || "";
              const areaNames = (c.areas || []).map((a: any) => a.name).join("، ") || (areas[c.areaId]?.name || "");
              return (
                <div key={id} style={{ background: C.surface, border: `1.5px solid ${C.gold}`, borderRadius: 14, padding: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: c.imageUrl ? "transparent" : C.goldLight, color: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, overflow: "hidden" }}>
                      {c.imageUrl ? <img src={c.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <i className="ph-fill ph-crown" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>{areaNames}{areaNames && govName ? " · " : ""}{govName}</div>
                    </div>
                  </div>
                  <button onClick={() => setPromoted(id, false)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "none", background: C.redLight, color: C.red, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    <i className="ph ph-x-circle" /> إزالة من المميزين
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {showFeaturedPicker && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={e => { if (e.target === e.currentTarget) setShowFeaturedPicker(false); }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 440, maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 12px" }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: C.text }}>إضافة مركز مميز</div>
                <button onClick={() => setShowFeaturedPicker(false)} style={{ width: 32, height: 32, borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.surface2, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <i className="ph ph-x" style={{ fontSize: 16, color: C.textSec }} />
                </button>
              </div>
              <div style={{ padding: "0 24px 12px" }}>
                <input value={featuredPickerSearch} onChange={e => setFeaturedPickerSearch(e.target.value)} placeholder="بحث عن مركز..." style={{
                  width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`,
                  background: C.surface2, fontSize: 13, fontFamily: "inherit", color: C.text, outline: "none",
                }} />
              </div>
              <div style={{ overflowY: "auto", padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
                {pickable.length === 0 && <div style={{ textAlign: "center", padding: 20, fontSize: 13, color: C.textLight }}>لا توجد نتائج</div>}
                {pickable.map(([id, c]) => (
                  <button key={id} onClick={() => { setPromoted(id, true); setShowFeaturedPicker(false); }} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10,
                    border: `1px solid ${C.border}`, background: C.surface2, cursor: "pointer", fontFamily: "inherit", textAlign: "right", width: "100%",
                  }}>
                    <i className="ph ph-buildings" style={{ color: C.gold, fontSize: 16 }} />
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: C.text }}>{c.name}</span>
                    <i className="ph ph-plus-circle" style={{ color: C.primary, fontSize: 16 }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── GUIDE ADMIN ───────────────────────────────────────────
  const GUIDE_ICONS = [
    "list-numbers", "folder-open", "currency-circle-dollar", "user-check",
    "chat-circle-question", "device-mobile-speaker", "globe", "map-pin",
    "buildings", "car", "traffic-signal", "book-open-text",
    "identification-card", "book-open", "image-square", "heart-pulse",
    "receipt", "calendar-blank", "eye", "shield-check",
    "graduation-cap", "warning", "check-circle", "x-circle",
    "question", "info", "arrow-right", "arrow-left",
    "clock", "money", "file-text", "certificate",
  ];
  const GUIDE_COLORS: { color: string; bg: string; label: string }[] = [
    { color: "#7C3AED", bg: "#EDE9FE", label: "بنفسجي" },
    { color: "#D97706", bg: "#FEF3C7", label: "برتقالي" },
    { color: "#16A34A", bg: "#DCFCE7", label: "أخضر" },
    { color: "#0891B2", bg: "#CFFAFE", label: "سماوي" },
    { color: "#DC2626", bg: "#FEE2E2", label: "أحمر" },
    { color: "#246BFD", bg: "#EEF4FF", label: "أزرق" },
    { color: "#1A1D1F", bg: "#F3F4F6", label: "أسود" },
  ];
  type GuideType = "steps" | "documents" | "fees" | "conditions" | "faq";
  const GUIDE_TYPE_LABELS: Record<GuideType, string> = {
    steps: "خطوات", documents: "وثائق", fees: "رسوم", conditions: "شروط", faq: "أسئلة شائعة",
  };

  /* ── Default guide sections (shown as fallback when Firebase empty) ── */
  const DEFAULT_GUIDE_SECTIONS: Record<string, any> = {
    "default-steps": {
      title: "خطوات الحصول على رخصة القيادة",
      icon: "list-numbers", iconColor: "#A855F7", iconBg: "rgba(168,85,247,0.15)", type: "steps", order: 1,
      items: [
        { text: "التسجيل في مدرسة سواقة معتمدة", sub: "اختر مدرسة معتمدة لدى دائرة الترخيص وسجّل باسمك برقم هويتك الوطنية." },
        { text: "إتمام الدروس النظرية والعملية", sub: "أكمل الساعات المطلوبة من الدروس النظرية والعملية مع المدرسة." },
        { text: "انتظار رسالة SMS من دائرة الترخيص", sub: "بعد إدخال المدرسة بياناتك في النظام، ستصلك رسالة تأكيد خلال أيام." },
        { text: "التوجه لدائرة الترخيص", sub: "احضر مع وثائقك المطلوبة، ادفع الرسوم، وتقدم لحجز موعد الفحص النظري." },
        { text: "اجتياز الفحص النظري", sub: "60 سؤال خلال 60 دقيقة. تحتاج الإجابة على 51 سؤالاً على الأقل للنجاح." },
        { text: "اجتياز الفحص العملي واستلام الرخصة", sub: "بعد النجاح في النظري تحدد موعداً للفحص العملي، وعند النجاح تستلم رخصتك." },
      ],
    },
    "default-docs": {
      title: "الأوراق والوثائق المطلوبة",
      icon: "folder-open", iconColor: "#F59E0B", iconBg: "rgba(245,158,11,0.15)", type: "documents", order: 2,
      items: [
        { text: "بطاقة هوية وطنية سارية المفعول", sub: "للأردنيين — جواز سفر ساري للمقيمين", icon: "identification-card" },
        { text: "دفتر خدمة العلم أو وثيقة الإعفاء", sub: "للذكور دون سن الأربعين", icon: "book-open" },
        { text: "صورتان شخصيتان", sub: "خلفية بيضاء، حديثتان", icon: "image-square" },
        { text: "شهادة اللياقة الطبية", sub: "تُستخرج من أي مركز صحي معتمد", icon: "heart-pulse" },
        { text: "إيصال دفع رسوم التقديم", sub: "يُدفع في الدائرة أو عبر منظومة موحد", icon: "receipt" },
      ],
    },
    "default-fees": {
      title: "الرسوم التقريبية",
      icon: "currency-circle-dollar", iconColor: "#22C55E", iconBg: "rgba(34,197,94,0.15)", type: "fees", order: 3,
      items: [
        { text: "رسوم تسجيل طلب التقديم", amount: "3 د.أ", note: "تُدفع لدى دائرة الترخيص" },
        { text: "رسوم الفحص النظري", amount: "10 د.أ", note: "في حال الرسوب تُعاد الرسوم" },
        { text: "رسوم الفحص العملي", amount: "20 د.أ", note: "لكل محاولة" },
        { text: "رسوم استخراج الرخصة", amount: "30 د.أ", note: "عند النجاح في الفحصين" },
      ],
    },
    "default-conditions": {
      title: "شروط التقديم",
      icon: "user-check", iconColor: "#06B6D4", iconBg: "rgba(6,182,212,0.15)", type: "conditions", order: 4,
      items: [
        { text: "الحد الأدنى للعمر: 18 سنة", icon: "calendar-blank" },
        { text: "اجتياز فحص النظر في المركز الصحي", icon: "eye" },
        { text: "لا يوجد سجل جنائي يمنع استخراج الرخصة", icon: "shield-check" },
        { text: "إكمال الدروس المقررة في المدرسة المسجّل بها", icon: "graduation-cap" },
      ],
    },
    "default-faq": {
      title: "أسئلة شائعة",
      icon: "chat-circle-question", iconColor: "#246BFD", iconBg: "#EEF4FF", type: "faq", order: 5,
      items: [
        { text: "ماذا لو رسبت في الامتحان النظري؟", answer: "يمكنك إعادة التقديم بعد 24 ساعة، وتُسدَّد رسوم جديدة لكل محاولة." },
        { text: "هل يمكن تقديم الامتحان بدون رسالة SMS؟", answer: "لا. الرسالة شرط إلزامي، وهي تؤكد أن المدرسة سجّلت إتمام دروسك في نظام دائرة الترخيص." },
        { text: "كم عدد المحاولات المسموحة في الفحص النظري؟", answer: "لا يوجد حد أقصى للمحاولات، غير أن كل محاولة تحتاج رسوماً جديدة." },
        { text: "هل يختلف الامتحان بين المحافظات؟", answer: "الاختبار موحَّد ورقمي في جميع فروع دائرة الترخيص في المملكة." },
        { text: "هل تُقبل الهوية منتهية الصلاحية؟", answer: "لا. يجب أن تكون الهوية الوطنية سارية المفعول يوم التقديم." },
      ],
    },
  };

  const [guideEditorOpen, setGuideEditorOpen] = useState(false);
  const [editingGuideId, setEditingGuideId] = useState<string | null>(null);
  const [guideForm, setGuideForm] = useState({
    title: "", icon: "list-numbers", iconColor: "#A855F7", iconBg: "rgba(168,85,247,0.15)",
    type: "steps" as GuideType, order: 0, items: [] as { text: string; sub?: string; note?: string; amount?: string; answer?: string; icon?: string }[],
  });

  function resetGuideForm() {
    setGuideForm({ title: "", icon: "list-numbers", iconColor: "#A855F7", iconBg: "rgba(168,85,247,0.15)", type: "steps", order: 0, items: [] });
  }

  function openGuideEditor(id?: string) {
    if (id) {
      const merged = mergeGuideSections();
      const s = merged[id];
      if (!s) return;
      setGuideForm({
        title: s.title || "", icon: s.icon || "list-numbers",
        iconColor: s.iconColor || "#A855F7", iconBg: s.iconBg || "rgba(168,85,247,0.15)",
        type: s.type || "steps", order: s.order || 0,
        items: s.items ? [...s.items] : [],
      });
      setEditingGuideId(id);
    } else {
      const maxOrder = Object.values(guideSections).reduce((max: number, s: any) => Math.max(max, s.order || 0), 0);
      resetGuideForm();
      setGuideForm(f => ({ ...f, order: maxOrder + 1 }));
      setEditingGuideId(null);
    }
    setGuideEditorOpen(true);
  }

  function addGuideItem() {
    const blank = guideForm.type === "faq"
      ? { text: "", answer: "" }
      : guideForm.type === "documents" || guideForm.type === "conditions"
        ? { text: "", sub: "", icon: "check-circle" }
        : guideForm.type === "fees"
          ? { text: "", amount: "", note: "" }
          : { text: "", sub: "" };
    setGuideForm(f => ({ ...f, items: [...f.items, blank] }));
  }

  function updateGuideItem(idx: number, field: string, value: string) {
    setGuideForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...f, items };
    });
  }

  function removeGuideItem(idx: number) {
    setGuideForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  }

  function moveGuideItem(idx: number, dir: -1 | 1) {
    setGuideForm(f => {
      const items = [...f.items];
      const swap = idx + dir;
      if (swap < 0 || swap >= items.length) return f;
      [items[idx], items[swap]] = [items[swap], items[idx]];
      return { ...f, items };
    });
  }

  async function saveGuideSection() {
    if (!guideForm.title.trim()) { showToast("أدخل عنوان القسم"); return; }
    if (guideForm.items.length === 0) { showToast("أضف عنصر واحد على الأقل"); return; }
    setLoading(true);
    try {
      const payload = {
        title: guideForm.title.trim(),
        icon: guideForm.icon,
        iconColor: guideForm.iconColor,
        iconBg: guideForm.iconBg,
        type: guideForm.type,
        order: guideForm.order,
        items: guideForm.items.map(it => {
          const base: any = { text: it.text.trim() };
          if (it.sub?.trim()) base.sub = it.sub.trim();
          if (it.note?.trim()) base.note = it.note.trim();
          if (it.amount?.trim()) base.amount = it.amount.trim();
          if (it.answer?.trim()) base.answer = it.answer.trim();
          if (it.icon?.trim()) base.icon = it.icon.trim();
          return base;
        }),
      };
      if (editingGuideId) {
        if (guideSections[editingGuideId]) await db.ref("guide/sections/" + editingGuideId).update(payload);
        else await db.ref("guide/sections/" + editingGuideId).set(payload);
      } else await db.ref("guide/sections").push(payload);
      showToast(editingGuideId ? "تم التحديث" : "تم الإضافة");
      setGuideEditorOpen(false); resetGuideForm(); setEditingGuideId(null);
      await loadAll();
    } catch { showToast("حدث خطأ"); }
    setLoading(false);
  }

  async function reorderSection(id: string, dir: -1 | 1) {
    const arr = Object.entries(guideSections).map(([id, s]) => ({ id, ...s as any })).sort((a, b) => (a.order || 0) - (b.order || 0));
    const idx = arr.findIndex(x => x.id === id);
    if (idx < 0) return;
    const swap = idx + dir;
    if (swap < 0 || swap >= arr.length) return;
    const aOrder = arr[idx].order || 0;
    const bOrder = arr[swap].order || 0;
    setLoading(true);
    try {
      await db.ref("guide/sections/" + arr[idx].id).update({ order: bOrder });
      await db.ref("guide/sections/" + arr[swap].id).update({ order: aOrder });
      await loadAll();
      showToast("تم إعادة الترتيب");
    } catch { showToast("حدث خطأ"); }
    setLoading(false);
  }

  function mergeGuideSections() {
    const merged: Record<string, any> = { ...DEFAULT_GUIDE_SECTIONS };
    for (const [id, s] of Object.entries(guideSections)) {
      merged[id] = s;
    }
    return merged;
  }

  function GuideAdminSection() {
    const rawSections = mergeGuideSections();
    const arr = Object.entries(rawSections).map(([id, s]) => ({ id, ...s as any })).sort((a, b) => (a.order || 0) - (b.order || 0));

    if (guideEditorOpen) {
      return (
        <div>
          <BackBtn onClick={() => { setGuideEditorOpen(false); resetGuideForm(); setEditingGuideId(null); }} />
          <SectionTitle>{editingGuideId ? "تعديل القسم" : "قسم جديد"}</SectionTitle>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.primary, marginBottom: 12, padding: "4px 10px", background: C.primaryLight, borderRadius: 8, display: "inline-block" }}>إعدادات القسم</div>
            <Input label="العنوان" value={guideForm.title} onChange={v => setGuideForm(f => ({ ...f, title: v }))} placeholder="مثال: خطوات الحصول على رخصة القيادة" />
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: C.text }}>نوع القسم</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(Object.keys(GUIDE_TYPE_LABELS) as GuideType[]).map(t => (
                  <button key={t} onClick={() => setGuideForm(f => ({ ...f, type: t, items: [] }))} style={{
                    padding: "6px 14px", borderRadius: 10, fontSize: 12, fontWeight: 800, fontFamily: "inherit", cursor: "pointer",
                    border: `1.5px solid ${guideForm.type === t ? C.primary : C.border}`,
                    background: guideForm.type === t ? C.primaryLight : C.surface,
                    color: guideForm.type === t ? C.primary : C.textSec,
                  }}>{GUIDE_TYPE_LABELS[t]}</button>
                ))}
              </div>
            </div>
            {/* Icon picker */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: C.text }}>الأيقونة</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 6 }}>
                {GUIDE_ICONS.map(ic => (
                  <button key={ic} onClick={() => setGuideForm(f => ({ ...f, icon: ic }))} style={{
                    width: 36, height: 36, borderRadius: 8, border: `1.5px solid ${guideForm.icon === ic ? C.primary : C.border}`,
                    background: guideForm.icon === ic ? C.primaryLight : C.surface,
                    color: guideForm.icon === ic ? C.primary : C.textSec,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, cursor: "pointer", fontFamily: "inherit",
                  }} title={ic}><i className={`ph ph-${ic}`} /></button>
                ))}
              </div>
            </div>
            {/* Color picker */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: C.text }}>اللون</label>
              <div style={{ display: "flex", gap: 8 }}>
                {GUIDE_COLORS.map(c => (
                  <button key={c.label} onClick={() => setGuideForm(f => ({ ...f, iconColor: c.color, iconBg: c.bg }))} style={{
                    width: 32, height: 32, borderRadius: "50%",
                    border: `2.5px solid ${guideForm.iconColor === c.color ? C.primary : "transparent"}`,
                    background: c.bg, cursor: "pointer",
                  }} title={c.label} />
                ))}
              </div>
            </div>
          </div>

          {/* Items editor */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.primary, marginBottom: 12, padding: "4px 10px", background: C.primaryLight, borderRadius: 8, display: "inline-block" }}>
              محتويات القسم ({guideForm.items.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {guideForm.items.map((it, i) => (
                <div key={i} style={{ background: C.bg, borderRadius: 10, padding: 12, border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: C.primary, background: C.primaryLight, borderRadius: 6, padding: "2px 8px" }}>#{i + 1}</span>
                    <div style={{ flex: 1 }} />
                    <button onClick={() => moveGuideItem(i, -1)} disabled={i === 0} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`, background: C.surface, cursor: i === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: i === 0 ? 0.4 : 1, fontFamily: "inherit" }}><i className="ph ph-arrow-up" style={{ fontSize: 12, color: C.textSec }} /></button>
                    <button onClick={() => moveGuideItem(i, 1)} disabled={i === guideForm.items.length - 1} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`, background: C.surface, cursor: i === guideForm.items.length - 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: i === guideForm.items.length - 1 ? 0.4 : 1, fontFamily: "inherit" }}><i className="ph ph-arrow-down" style={{ fontSize: 12, color: C.textSec }} /></button>
                    <button onClick={() => removeGuideItem(i)} style={{ width: 26, height: 26, borderRadius: 6, border: "none", background: C.redLight, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}><i className="ph ph-trash" style={{ fontSize: 12, color: C.red }} /></button>
                  </div>
                  {guideForm.type === "faq" ? (
                    <>
                      <Input label="السؤال" value={it.text} onChange={v => updateGuideItem(i, "text", v)} placeholder="اكتب السؤال..." />
                      <TextArea label="الإجابة" value={it.answer || ""} onChange={v => updateGuideItem(i, "answer", v)} placeholder="اكتب الإجابة..." rows={2} />
                    </>
                  ) : guideForm.type === "fees" ? (
                    <>
                      <Input label="البند" value={it.text} onChange={v => updateGuideItem(i, "text", v)} placeholder="مثال: رسوم تسجيل طلب" />
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <Input label="المبلغ" value={it.amount || ""} onChange={v => updateGuideItem(i, "amount", v)} placeholder="3 د.أ" />
                        <Input label="ملاحظة" value={it.note || ""} onChange={v => updateGuideItem(i, "note", v)} placeholder="تفاصيل إضافية..." />
                      </div>
                    </>
                  ) : (
                    <>
                      {(guideForm.type === "documents" || guideForm.type === "conditions") && (
                        <div style={{ marginBottom: 10 }}>
                          <label style={{ display: "block", marginBottom: 4, fontSize: 12, fontWeight: 700, color: C.text }}>الأيقونة الداخلية</label>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 4 }}>
                            {["check-circle", "identification-card", "book-open", "image-square", "heart-pulse", "receipt", "calendar-blank", "eye", "shield-check", "graduation-cap", "warning", "file-text", "car", "map-pin", "book-open-text", "ph-book"].map(ic => (
                              <button key={ic} onClick={() => updateGuideItem(i, "icon", ic)} style={{
                                width: 28, height: 28, borderRadius: 6, border: `1.5px solid ${it.icon === ic ? C.primary : C.border}`,
                                background: it.icon === ic ? C.primaryLight : C.surface, color: it.icon === ic ? C.primary : C.textSec,
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer", fontFamily: "inherit",
                              }}><i className={`ph ph-${ic}`} /></button>
                            ))}
                          </div>
                        </div>
                      )}
                      <Input label="النص" value={it.text} onChange={v => updateGuideItem(i, "text", v)} placeholder={guideForm.type === "steps" ? "عنوان الخطوة" : "النص الرئيسي"} />
                      <Input label="تفاصيل / وصف (اختياري)" value={it.sub || ""} onChange={v => updateGuideItem(i, "sub", v)} placeholder="اوصاف إضافي..." />
                    </>
                  )}
                </div>
              ))}
            </div>
            <Btn variant="outline" style={{ marginTop: 10, width: "100%" }} onClick={addGuideItem}><i className="ph ph-plus" /> إضافة عنصر</Btn>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="primary" style={{ flex: 1 }} onClick={saveGuideSection}><i className="ph ph-floppy-disk" /> {editingGuideId ? "حفظ التعديل" : "إضافة القسم"}</Btn>
            <Btn variant="ghost" style={{ flex: 1 }} onClick={() => { setGuideEditorOpen(false); resetGuideForm(); setEditingGuideId(null); }}><i className="ph ph-x" /> إلغاء</Btn>
          </div>
        </div>
      );
    }

    return (
      <div>
        <BackBtn onClick={() => setView("menu")} />
        <SectionTitle count={arr.length}>إدارة دليل المستخدم</SectionTitle>
        <Btn variant="primary" style={{ marginBottom: 14, width: "100%" }} onClick={() => openGuideEditor()}><i className="ph ph-plus" /> إضافة قسم جديد</Btn>
        {arr.length === 0 ? <Empty icon="book-open-text" text="لا توجد أقسام" /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {arr.map((s, idx) => (
              <div key={s.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.03)", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0 }}>
                  <button onClick={() => reorderSection(s.id, -1)} disabled={idx === 0} style={{ width: 22, height: 22, borderRadius: 5, border: `1px solid ${C.border}`, background: C.bg, cursor: idx === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: idx === 0 ? 0.4 : 1, fontFamily: "inherit" }}><i className="ph ph-arrow-up" style={{ fontSize: 11, color: C.textSec }} /></button>
                  <button onClick={() => reorderSection(s.id, 1)} disabled={idx === arr.length - 1} style={{ width: 22, height: 22, borderRadius: 5, border: `1px solid ${C.border}`, background: C.bg, cursor: idx === arr.length - 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: idx === arr.length - 1 ? 0.4 : 1, fontFamily: "inherit" }}><i className="ph ph-arrow-down" style={{ fontSize: 11, color: C.textSec }} /></button>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: s.iconBg || "rgba(168,85,247,0.15)", color: s.iconColor || "#A855F7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}><i className={`ph ph-${s.icon || "list-numbers"}`} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{s.title}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: "1px 7px", borderRadius: 20, background: C.primaryLight, color: C.primary }}>{GUIDE_TYPE_LABELS[s.type as GuideType] || s.type}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: "1px 7px", borderRadius: 20, background: C.greenLight, color: C.green }}>{(s.items || []).length} عناصر</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <button onClick={() => openGuideEditor(s.id)} style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.primary}`, background: C.surface, color: C.primary, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontFamily: "inherit" }}><i className="ph ph-pencil-simple" style={{ fontSize: 13 }} /></button>
                  <button onClick={async () => { if (!confirm(`حذف قسم "${s.title}"؟`)) return; setLoading(true); try { await db.ref("guide/sections/" + s.id).remove(); showToast("تم الحذف"); await loadAll(); } catch { showToast("حدث خطأ"); } setLoading(false); }}
                    style={{ width: 30, height: 30, borderRadius: 7, border: "none", background: C.redLight, color: C.red, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontFamily: "inherit" }}><i className="ph ph-trash" style={{ fontSize: 13 }} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── FOOTER ADMIN ────────────────────────────────────────────
  const [footerSponsors, setFooterSponsors] = useState<Record<string, any>>({});
  const [footerSocial, setFooterSocial] = useState<Record<string, string>>({});
  const [footerAbout, setFooterAbout] = useState("");
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorLink, setSponsorLink] = useState("");
  const [socialKey, setSocialKey] = useState("facebook");
  const [socialUrl, setSocialUrl] = useState("");

  const SOCIAL_OPTIONS = [
    { key: "facebook",  label: "فيسبوك",     icon: "facebook-logo" },
    { key: "whatsapp",  label: "واتساب",      icon: "whatsapp-logo" },
    { key: "instagram", label: "انستغرام",    icon: "instagram-logo" },
    { key: "x",         label: "تويتر / X",   icon: "x-logo" },
  ];

  async function loadFooter() {
    const [spSnap, soSnap, atSnap] = await Promise.all([
      db.ref("footer/sponsors").once("value"),
      db.ref("footer/social").once("value"),
      db.ref("footer/aboutText").once("value"),
    ]);
    setFooterSponsors(spSnap.val() || {});
    setFooterSocial(soSnap.val() || {});
    setFooterAbout(atSnap.val() || "");
  }

  function FooterAdminSection() {

    async function addSponsor() {
      if (!sponsorName.trim()) { showToast("أدخل اسم الراعي"); return; }
      setLoading(true);
      try {
        await db.ref("footer/sponsors").push({ name: sponsorName.trim(), link: sponsorLink.trim() || "https://wa.me/962778244772?text=" });
        setSponsorName(""); setSponsorLink("");
        showToast("تمت الإضافة"); await loadFooter();
      } catch { showToast("حدث خطأ"); }
      setLoading(false);
    }

    async function removeSponsor(id: string) {
      if (!confirm("حذف هذا الراعي؟")) return;
      setLoading(true);
      try { await db.ref("footer/sponsors/" + id).remove(); showToast("تم الحذف"); await loadFooter(); }
      catch { showToast("حدث خطأ"); }
      setLoading(false);
    }

    async function saveSocial() {
      if (!socialUrl.trim()) { showToast("أدخل الرابط"); return; }
      setLoading(true);
      try {
        await db.ref("footer/social/" + socialKey).set(socialUrl.trim());
        setSocialUrl(""); showToast("تم الحفظ"); await loadFooter();
      } catch { showToast("حدث خطأ"); }
      setLoading(false);
    }

    async function removeSocial(key: string) {
      if (!confirm("حذف هذا الحساب؟")) return;
      setLoading(true);
      try { await db.ref("footer/social/" + key).remove(); showToast("تم الحذف"); await loadFooter(); }
      catch { showToast("حدث خطأ"); }
      setLoading(false);
    }

    const sponsorArr = Object.entries(footerSponsors);

    return (
      <div>
        <BackBtn onClick={() => setView("menu")} />
        <SectionTitle>إدارة الفوتر</SectionTitle>

        {/* ── Sponsors ── */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ph ph-crown" style={{ color: C.gold }} /> بطاقات الرعاة
            <span style={{ fontSize: 11, background: C.goldLight, color: C.gold, padding: "1px 8px", borderRadius: 20 }}>{sponsorArr.length}</span>
          </div>

          <Input label="اسم الراعي" value={sponsorName} onChange={setSponsorName} placeholder="مثال: مركز السلام للتدريب" />
          <Input label="رابط عند الضغط (اختياري)" value={sponsorLink} onChange={setSponsorLink} placeholder="https://..." />
          <Btn variant="primary" onClick={addSponsor}><i className="ph ph-plus" /> إضافة بطاقة</Btn>

          {sponsorArr.length > 0 && (
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              {sponsorArr.map(([id, sp]) => (
                <div key={id} style={{ display: "flex", alignItems: "center", gap: 10, background: C.bg, borderRadius: 10, padding: "10px 12px", border: `1px solid ${C.border}` }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: C.primaryLight, color: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                    <i className="ph ph-steering-wheel" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{sp.name || "بدون اسم"}</div>
                    <div style={{ fontSize: 11, color: C.textSec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {sp.link ? <a href={sp.link} target="_blank" rel="noreferrer" style={{ color: C.primary }}>{sp.link}</a> : <span style={{ color: C.textLight }}>بدون رابط</span>}
                    </div>
                  </div>
                  <button onClick={() => removeSponsor(id)} style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: C.redLight, color: C.red, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "inherit" }}>
                    <i className="ph ph-trash" style={{ fontSize: 13 }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Social Media ── */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ph ph-share-network" style={{ color: C.primary }} /> مواقع التواصل الاجتماعي
          </div>

          <Select label="المنصة" value={socialKey} onChange={setSocialKey}>
            {SOCIAL_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </Select>
          <Input label="الرابط" value={socialUrl} onChange={setSocialUrl} placeholder="https://facebook.com/mypage" />
          <Btn variant="primary" onClick={saveSocial}><i className="ph ph-floppy-disk" /> حفظ</Btn>

          {Object.keys(footerSocial).length > 0 && (
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              {SOCIAL_OPTIONS.filter(o => footerSocial[o.key]).map(o => (
                <div key={o.key} style={{ display: "flex", alignItems: "center", gap: 10, background: C.bg, borderRadius: 10, padding: "10px 12px", border: `1px solid ${C.border}` }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: C.primaryLight, color: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    <i className={`ph ph-${o.icon}`} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{o.label}</div>
                    <div style={{ fontSize: 11, color: C.textSec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {footerSocial[o.key]}
                    </div>
                  </div>
                  <button onClick={() => removeSocial(o.key)} style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: C.redLight, color: C.red, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "inherit" }}>
                    <i className="ph ph-trash" style={{ fontSize: 13 }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── About text ── */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ph ph-text-align-right" style={{ color: C.primary }} /> نص قسم "من نحن" في الفوتر
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: C.text }}>الوصف (اختياري)</label>
            <textarea
              value={footerAbout}
              onChange={e => setFooterAbout(e.target.value)}
              placeholder="منصة JO Driver هي دليلك الأول لاجتياز..."
              rows={4}
              autoComplete="off"
              spellCheck={false}
              className="admin-field"
              style={{
                width: "100%", padding: "12px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10,
                background: C.surface, fontSize: 14, fontFamily: "inherit", color: C.text, outline: "none",
                resize: "vertical", lineHeight: 1.7,
              }}
            />
          </div>
          <Btn variant="primary" onClick={async () => {
            setLoading(true);
            try {
              await db.ref("footer/aboutText").set(footerAbout.trim() || null);
              showToast("تم الحفظ");
            } catch { showToast("حدث خطأ"); }
            setLoading(false);
          }}><i className="ph ph-floppy-disk" /> حفظ الوصف</Btn>
        </div>
      </div>
    );
  }

  // ── REVIEWS ──────────────────────────────────────────────────
  function ReviewsSection() {
    const [revSearch, setRevSearch] = useState("");
    const revEntriesRaw = Object.entries(reviews).sort((a, b) => (b[1].createdAt || "").localeCompare(a[1].createdAt || ""));
    const revEntries = revEntriesRaw.filter(([, r]) => {
      if (!revSearch.trim()) return true;
      const q = revSearch.trim().toLowerCase();
      return (r.name || "").toLowerCase().includes(q) || (r.comment || "").toLowerCase().includes(q);
    });

    const avgStars = revEntriesRaw.length
      ? (revEntriesRaw.reduce((sum, [, r]) => sum + (r.stars || 0), 0) / revEntriesRaw.length).toFixed(1)
      : "0";

    const ratingBreakdown = (() => {
      const counts = [0, 0, 0, 0, 0];
      revEntriesRaw.forEach(([, r]) => {
        const idx = Math.min(5, Math.max(1, Math.round(r.stars || 0))) - 1;
        counts[idx]++;
      });
      return [5, 4, 3, 2, 1].map(star => ({
        star,
        count: counts[star - 1],
        pct: revEntriesRaw.length ? Math.round((counts[star - 1] / revEntriesRaw.length) * 100) : 0,
      }));
    })();

    function timeAgo(iso: string) {
      if (!iso) return "-";
      const diffMs = Date.now() - new Date(iso).getTime();
      const day = 86400000;
      if (diffMs < 0 || isNaN(diffMs)) return new Date(iso).toLocaleDateString("ar-JO");
      if (diffMs < 3600000) return "قبل قليل";
      if (diffMs < day) return `منذ ${Math.floor(diffMs / 3600000)} ساعة`;
      if (diffMs < day * 30) return `منذ ${Math.floor(diffMs / day)} يوم`;
      return new Date(iso).toLocaleDateString("ar-JO");
    }

    return (
      <div>
        <BackBtn onClick={() => setView("menu")} />
        <SectionTitle count={revEntriesRaw.length}>آراء الزوار</SectionTitle>

        {/* Rating summary */}
        {revEntriesRaw.length > 0 && (
          <div style={{
            display: "flex", gap: 20, alignItems: "center",
            background: `linear-gradient(135deg, ${C.primaryLight}, ${C.surface})`,
            border: `1.5px solid ${C.border}`, borderRadius: 18,
            padding: "18px 20px", marginBottom: 18, flexWrap: "wrap",
          }}>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 38, fontWeight: 900, color: C.text, lineHeight: 1 }}>{avgStars}</div>
              <div style={{ display: "flex", gap: 2, justifyContent: "center", marginTop: 6 }}>
                {[1,2,3,4,5].map(i => (
                  <i key={i} className={i <= Math.round(parseFloat(avgStars)) ? "ph-fill ph-star" : "ph ph-star"} style={{ fontSize: 13, color: i <= Math.round(parseFloat(avgStars)) ? "#F59E0B" : "#E2E8F0" }} />
                ))}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textSec, marginTop: 6, whiteSpace: "nowrap" }}>{revEntriesRaw.length} تقييم</div>
            </div>
            <div style={{ flex: 1, minWidth: 140, display: "flex", flexDirection: "column", gap: 5 }}>
              {ratingBreakdown.map(({ star, pct, count }) => (
                <div key={star} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.textSec, width: 10, textAlign: "center" }}>{star}</span>
                  <i className="ph-fill ph-star" style={{ fontSize: 10, color: "#F59E0B" }} />
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.border, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: "#F59E0B", transition: "width 0.4s ease" }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.textLight, width: 16, textAlign: "left" }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          <i className="ph ph-magnifying-glass" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: C.textSec }} />
          <input
            value={revSearch}
            onChange={e => setRevSearch(e.target.value)}
            placeholder="البحث بالاسم أو التعليق..."
            style={{
              width: "100%", padding: "10px 14px 10px 40px", borderRadius: 12,
              border: `1.5px solid ${C.border}`, background: C.surface, fontSize: 14,
              fontFamily: "inherit", color: C.text, outline: "none",
            }}
          />
        </div>

        {/* List */}
        {revEntries.length === 0 ? (
          revSearch.trim() ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: C.textLight }}>
              <i className="ph ph-magnifying-glass" style={{ fontSize: 32, display: "block", marginBottom: 10 }} />
              <div style={{ fontSize: 14, fontWeight: 700 }}>لا توجد نتائج مطابقة</div>
            </div>
          ) : (
            <Empty icon="star" text="لا يوجد آراء بعد" />
          )
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {revEntries.map(([id, r]) => (
              <div key={id} style={{
                display: "flex", gap: 12,
                background: C.surface, borderRadius: 16, padding: 14,
                border: `1.5px solid ${C.border}`,
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                  background: `linear-gradient(135deg, ${C.primary}, ${C.cyan})`,
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 900,
                }}>
                  {(r.name || "م").charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name || "مجهول"}</span>
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: C.textLight, flexShrink: 0 }}>{timeAgo(r.createdAt)}</span>
                    </div>
                    <div style={{ display: "flex", gap: 1.5, flexShrink: 0, direction: "ltr" }}>
                      {[1,2,3,4,5].map(i => (
                        <i key={i} className={i <= (r.stars || 0) ? "ph-fill ph-star" : "ph ph-star"} style={{ fontSize: 12, color: i <= (r.stars || 0) ? "#F59E0B" : "#E2E8F0" }} />
                      ))}
                    </div>
                  </div>
                  {r.comment && (
                    <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.65, marginBottom: 6 }}>{r.comment}</div>
                  )}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button onClick={async () => { if (!confirm("حذف هذا الرأي؟")) return; setLoading(true); try { await db.ref("reviews/" + id).remove(); showToast("تم الحذف"); await loadAll(); } catch { showToast("حدث خطأ"); } setLoading(false); }}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: C.redLight, color: C.red, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
                      <i className="ph ph-trash" /> حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── RENDER ──────────────────────────────────────────────────
  const renderView = (): React.ReactNode => {
    switch (view) {
      case "menu": return (
        <div>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: C.text }}>JO Driver</div>
              <div style={{ fontSize: 12, color: C.textSec, fontWeight: 600 }}>لوحة التحكم</div>
            </div>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: C.primary, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            }}>
              <i className="ph ph-steering-wheel" />
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
            <StatCard label="محافظة" value={stats.gov} icon="map-trifold" color={C.cyan} bg={C.cyanLight} />
            <StatCard label="منطقة" value={stats.area} icon="map-pin" color={C.primary} bg={C.primaryLight} />
            <StatCard label="مركز" value={stats.center} icon="buildings" color={C.gold} bg={C.goldLight} />
            <StatCard label="مستخدم" value={stats.user} icon="users" color={C.green} bg={C.greenLight} />
          </div>

          {/* Management */}
          <div style={{ fontSize: 11, fontWeight: 800, color: C.textLight, marginBottom: 12, padding: "0 4px", letterSpacing: "0.5px" }}>الإدارة</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Card icon="users" color={C.primary} colorBg={C.primaryLight} iconColor={C.primary} title="المستخدمين" desc="عرض وحذف المستخدمين" onClick={() => setView("users")} count={stats.user} />
            <Card icon="question" color={C.gold} colorBg={C.goldLight} iconColor={C.gold} title="الأسئلة" desc="إضافة، تعديل، حذف" onClick={() => { setQSub("menu"); setView("questions"); }} count={stats.q} />
            <Card icon="book-open-text" color={C.purple} colorBg={C.purpleLight} iconColor={C.purple} title="دليل المستخدم" desc="إدارة أقسام الدليل" onClick={() => { resetGuideForm(); setGuideEditorOpen(false); setEditingGuideId(null); setView("guide-admin"); }} count={stats.guide} />
            <Card icon="clipboard-text" color={C.pink} colorBg={C.pinkLight} iconColor={C.pink} title="طلبات الانتساب" desc="مراجعة ونشر أو رفض" onClick={() => setView("requests")} count={stats.req} />
            <Card icon="layout" color={C.cyan} colorBg={C.cyanLight} iconColor={C.cyan} title="إدارة الفوتر" desc="الراعي، سوشيال، من نحن" onClick={() => { loadFooter(); setView("footer-admin"); }} />
            <Card icon="star" color={C.gold} colorBg={C.goldLight} iconColor={C.gold} title="آراء الزوار" desc="سجل التقييمات" onClick={() => setView("reviews")} count={stats.reviews} />
          </div>

          {/* Geographic Data */}
          <div style={{ fontSize: 11, fontWeight: 800, color: C.textLight, marginTop: 20, marginBottom: 12, padding: "0 4px", letterSpacing: "0.5px" }}>البيانات الجغرافية</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Card icon="map-trifold" color={C.cyan} colorBg={C.cyanLight} iconColor={C.cyan} title="إدارة المعلومات الجغرافية" desc="المحافظات والمناطق" onClick={() => setView("geo-manage")} />
            <Card icon="buildings" color={C.gold} colorBg={C.goldLight} iconColor={C.gold} title="إدارة المراكز" desc="عرض، تعديل، حذف، تعليق النشر" onClick={() => setView("centers-manage")} count={Object.keys(centers).length} />
            <Card icon="crown-simple" color={C.gold} colorBg={C.goldLight} iconColor={C.gold} title="المراكز المميزة" desc="إدارة المراكز المميزة" onClick={() => setView("featured-centers")} />
          </div>
        </div>
      );
      case "users": return <UsersSection />;
      case "questions": return QuestionsSection();
      case "requests": return <RequestsSection />;
      case "add-center": return <AddSection />;
      case "edit-center": return <EditCenterSection />;
      case "geo-manage": return <GeoManageSection />;
      case "centers-manage": return <CentersManageSection />;
      case "featured-centers": return <FeaturedCentersSection />;
      case "guide-admin": return <GuideAdminSection />;
      case "footer-admin": return FooterAdminSection();
      case "reviews": return <ReviewsSection />;
      default: return null;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh", background: C.bg, direction: "rtl" }}>
      <Header />

      {/* Body */}
      <div style={{ flex: "1 1 0", minHeight: 0, overflowY: "auto", padding: "16px 14px" }}>
        {renderView()}
        <div style={{ height: 20 }} />
      </div>

      {/* Toast & Loading */}
      <Toast msg={toast} />
      {loading && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 999,
        }}>
          <div style={{
            width: 44, height: 44, border: `3px solid ${C.border}`, borderTopColor: C.primary,
            borderRadius: "50%", animation: "spin .8s linear infinite", marginBottom: 12,
          }} />
          <div style={{ fontWeight: 800, color: C.textSec, fontSize: 14 }}>جارٍ التحميل...</div>
        </div>
      )}
    </div>
  );
}
