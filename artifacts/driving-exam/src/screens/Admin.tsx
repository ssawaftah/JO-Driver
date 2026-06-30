import { useState, useEffect, useCallback } from "react";
import { db } from "../lib/firebase";

interface Props { onBack: () => void; }

type View = "menu" | "users" | "questions" | "requests" | "add-gov" | "add-area" | "add-center" | "edit-list" | "delete-list" | "question-form" | "faq-admin";

const Q_CATS = [
  "قواعد السير والمرور",
  "الميكانيك",
  "السلامة على الطريق",
  "أسعافات أولية",
  "الشواخص والخطوط والعلامات",
  "المخالفات واحتساب النقاط",
];

// ── Design tokens ────────────────────────────────
const C = {
  primary: "#246BFD", primaryLight: "#E8F0FE",
  bg: "#F6F8FB", surface: "#FFFFFF",
  border: "#E8EAED", borderHover: "#246BFD",
  text: "#1A1D1F", textSec: "#6B7280", textLight: "#9CA3AF",
  green: "#16A34A", greenLight: "#DCFCE7",
  red: "#DC2626", redLight: "#FEE2E2",
  gold: "#D97706", goldLight: "#FEF3C7",
  purple: "#7C3AED", purpleLight: "#EDE9FE",
  cyan: "#0891B2", cyanLight: "#CFFAFE",
};

// ── Reusable UI helpers ─────────────────────────────
function Card({ icon, color, colorBg, title, desc, onClick, count }: { icon: string; color: string; colorBg: string; title: string; desc: string; onClick: () => void; count?: number }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
      cursor: "pointer", fontFamily: "inherit", textAlign: "right",
      boxShadow: "0 1px 2px rgba(0,0,0,0.03)", transition: "all .15s",
    }} onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.03)"; }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: colorBg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
        <i className={`ph ph-${icon}`} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{title}</span>
          {count !== undefined && <span style={{ fontSize: 11, fontWeight: 800, padding: "1px 7px", borderRadius: 20, background: colorBg, color }}>{count}</span>}
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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <div style={{ fontSize: 18, fontWeight: 900, color: C.text }}>{children}</div>
      {count !== undefined && <span style={{ background: C.primaryLight, color: C.primary, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 800 }}>{count}</span>}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", ...rest }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; [k: string]: any }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: C.text }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} {...rest} style={{
        width: "100%", padding: "12px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10,
        background: C.surface, fontSize: 14, fontFamily: "inherit", color: C.text, outline: "none",
        transition: "border-color .15s",
      }} onFocus={e => e.currentTarget.style.borderColor = C.primary} onBlur={e => e.currentTarget.style.borderColor = C.border} />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: C.text }}>{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{
        width: "100%", padding: "12px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10,
        background: C.surface, fontSize: 14, fontFamily: "inherit", color: C.text, outline: "none", resize: "vertical",
        transition: "border-color .15s",
      }} onFocus={e => e.currentTarget.style.borderColor = C.primary} onBlur={e => e.currentTarget.style.borderColor = C.border} />
    </div>
  );
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: C.text }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        width: "100%", padding: "12px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10,
        background: C.surface, fontSize: 14, fontFamily: "inherit", color: C.text, appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "left 14px center",
      }}>{children}</select>
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", style = {} }: { children: React.ReactNode; onClick: () => void; variant?: "primary" | "outline" | "danger" | "ghost"; style?: React.CSSProperties }) {
  const colors = {
    primary: { bg: C.primary, color: "#fff", border: "none" },
    outline: { bg: "#fff", color: C.primary, border: `1.5px solid ${C.primary}` },
    danger: { bg: C.red, color: "#fff", border: "none" },
    ghost: { bg: "transparent", color: C.textSec, border: `1px solid ${C.border}` },
  }[variant];
  return (
    <button onClick={onClick} style={{
      width: "100%", border: colors.border, background: colors.bg, color: colors.color,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      fontFamily: "inherit", fontSize: 14, fontWeight: 800,
      padding: "12px", borderRadius: 10, cursor: "pointer", ...style,
    }}>{children}</button>
  );
}

function StatCard({ label, value, icon, color, bg }: { label: string; value: number; icon: string; color: string; bg: string }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
      padding: "14px", boxShadow: "0 1px 2px rgba(0,0,0,0.03)", display: "flex", alignItems: "center", gap: 12,
    }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
        <i className={`ph ph-${icon}`} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 900, color: C.text, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: C.textSec, marginTop: 3, fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  );
}

function ListItem({ label, sub, actions }: { label: string; sub?: string; actions: React.ReactNode }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
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
    <div style={{ textAlign: "center", padding: "50px 20px", color: C.textSec }}>
      <i className={`ph ph-${icon}`} style={{ fontSize: 44, marginBottom: 12, opacity: 0.25, display: "block" }} />
      <div style={{ fontSize: 13 }}>{text}</div>
    </div>
  );
}

function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", top: 60, left: "50%", transform: "translateX(-50%)",
      background: C.text, color: "#fff", padding: "10px 18px",
      borderRadius: 12, fontSize: 13, fontWeight: 700,
      textAlign: "center", zIndex: 200, whiteSpace: "nowrap",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    }}>{msg}</div>
  );
}

// ── Main component ──────────────────────────────────────────────────
export default function Admin({ onBack }: Props) {
  const [view, setView] = useState<View>("menu");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ gov: 0, area: 0, center: 0, user: 0, req: 0, q: 0, faq: 0 });

  const [govs, setGovs] = useState<Record<string, { name: string }>>({});
  const [areas, setAreas] = useState<Record<string, { name: string; governorateId: string }>>({});
  const [centers, setCenters] = useState<Record<string, any>>({});
  const [users, setUsers] = useState<Record<string, any>>({});
  const [questions, setQuestions] = useState<Record<string, any>>({});
  const [requests, setRequests] = useState<Record<string, any>>({});
  const [faqItems, setFaqItems] = useState<Record<string, { question: string; answer: string }>>({});

  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [govSnap, areaSnap, centerSnap, userSnap, qSnap, reqSnap, faqSnap] = await Promise.all([
        db.ref("governorates").once("value"), db.ref("areas").once("value"), db.ref("centers").once("value"),
        db.ref("users").once("value"), db.ref("questions").once("value"), db.ref("centerRequests").once("value"),
        db.ref("faq/items").once("value"),
      ]);
      const g = govSnap.val() || {}, a = areaSnap.val() || {}, c = centerSnap.val() || {};
      const u = userSnap.val() || {}, q = qSnap.val() || {}, r = reqSnap.val() || {}, f = faqSnap.val() || {};
      setGovs(g); setAreas(a); setCenters(c); setUsers(u); setQuestions(q); setRequests(r); setFaqItems(f);
      setStats({ gov: Object.keys(g).length, area: Object.keys(a).length, center: Object.keys(c).length,
        user: Object.keys(u).length, req: Object.keys(r).length, q: Object.keys(q).length, faq: Object.keys(f).length });
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
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg, ${C.primary}, #5B8DEF)`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, flexShrink: 0 }}>{initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 900, color: C.text }}>{u.name || u.firstName || "مستخدم"} {u.lastName || ""}</div>
                <div style={{ fontSize: 12, color: C.textSec, marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}>
                  <i className="ph ph-phone" /> {u.phone || selectedUser.id}
                </div>
                {u.governorate && <div style={{ fontSize: 12, color: C.textSec, marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}><i className="ph ph-map-pin" /> {u.governorate}</div>}
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20, background: tests > 0 ? C.greenLight : C.bg, color: tests > 0 ? C.green : C.textSec, whiteSpace: "nowrap" }}>{tests > 0 ? "نشط" : "جديد"}</span>
            </div>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              {[
                { label: "أفضل نتيجة", value: best + "%", icon: "trophy", color: C.gold, bg: C.goldLight },
                { label: "اختبارات", value: tests, icon: "exam", color: C.primary, bg: C.primaryLight },
                { label: "متوسط", value: (u.averageScore || 0) + "%", icon: "chart-bar", color: C.cyan, bg: C.cyanLight },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, border: `1px solid ${C.border}`, padding: "10px", borderRadius: 10, textAlign: "center" }}>
                  <i className={`ph ph-${s.icon}`} style={{ color: s.color, fontSize: 18, marginBottom: 4, display: "block" }} />
                  <span style={{ display: "block", color: C.text, fontWeight: 900, fontSize: 15 }}>{s.value}</span>
                  <span style={{ fontSize: 10, color: C.textSec, marginTop: 2, display: "block" }}>{s.label}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: "10px", borderRadius: 10, fontSize: 11, color: C.textSec }}>
                <i className="ph ph-calendar-blank" style={{ marginLeft: 4 }} />التسجيل<span style={{ display: "block", marginTop: 3, color: C.text, fontWeight: 800, fontSize: 13 }}>{reg}</span>
              </div>
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: "10px", borderRadius: 10, fontSize: 11, color: C.textSec }}>
                <i className="ph ph-clock" style={{ marginLeft: 4 }} />آخر نشاط<span style={{ display: "block", marginTop: 3, color: C.text, fontWeight: 800, fontSize: 13 }}>{lastActive}</span>
              </div>
            </div>
            {/* Category scores */}
            {catEntries.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.textSec, marginBottom: 8 }}>نتائج الأقسام</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {catEntries.map(([cat, score]: [string, any]) => (
                    <div key={cat} style={{ display: "flex", alignItems: "center", gap: 8, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.text, flex: 1 }}>{cat}</div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: (score || 0) >= 70 ? C.green : (score || 0) >= 50 ? C.gold : C.red }}>{score || 0}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="danger" style={{ flex: 1 }} onClick={async () => {
                if (!confirm("حذف المستخدم؟")) return;
                setLoading(true); try { await db.ref("users/" + selectedUser.id).remove(); showToast("تم الحذف"); await loadAll(); setUsersView("list"); }
                catch { showToast("حدث خطأ"); } setLoading(false);
              }}><i className="ph ph-trash" /> حذف</Btn>
            </div>
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
            <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="البحث بالاسم أو الهاتف..." style={{
              width: "100%", padding: "10px 14px 10px 40px", border: `1.5px solid ${C.border}`, borderRadius: 10,
              background: C.surface, fontSize: 14, fontFamily: "inherit", color: C.text, outline: "none",
              transition: "border-color .15s",
            }} onFocus={e => e.currentTarget.style.borderColor = C.primary} onBlur={e => e.currentTarget.style.borderColor = C.border} />
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
                <div style={{ width: 44, height: 44, borderRadius: 12, background: isNew ? C.bg : `linear-gradient(135deg, ${C.primary}, #5B8DEF)`, color: isNew ? C.textLight : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, flexShrink: 0 }}>{initials}</div>
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
              <option value="video">فيديو / GIF</option>
            </Select>
            {isMedia && (
              <>
                <Input label="رابط الوسائط" value={qForm.mediaUrl} onChange={v => setQForm(f => ({ ...f, mediaUrl: v }))} placeholder="https://..." />
                {qForm.mediaUrl.trim() && (
                  <div style={{ marginBottom: 14, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}`, background: C.bg }}>
                    {qForm.type === "image" ? (
                      <img src={qForm.mediaUrl} alt="preview" style={{ width: "100%", height: 160, objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <video src={qForm.mediaUrl} controls style={{ width: "100%", height: 160, objectFit: "cover" }} onError={e => { (e.target as HTMLVideoElement).style.display = "none"; }} />
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
                <input value={opt} onChange={e => { const opts = [...qForm.options]; opts[i] = e.target.value; setQForm(f => ({ ...f, options: opts })); }} placeholder={`الخيار ${i + 1}`} style={{ flex: 1, padding: "12px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none" }} onFocus={e => e.currentTarget.style.borderColor = C.primary} onBlur={e => e.currentTarget.style.borderColor = C.border} />
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
    const [qSearch, setQSearch] = useState("");
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
            <input value={qSearch} onChange={e => setQSearch(e.target.value)} placeholder="البحث بنص السؤال..." style={{
              width: "100%", padding: "10px 14px 10px 40px", border: `1.5px solid ${C.border}`, borderRadius: 10,
              background: C.surface, fontSize: 14, fontFamily: "inherit", color: C.text, outline: "none",
              transition: "border-color .15s",
            }} onFocus={e => e.currentTarget.style.borderColor = C.primary} onBlur={e => e.currentTarget.style.borderColor = C.border} />
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
  function RequestsSection() {
    const entries = Object.entries(requests).sort((a, b) => (b[1].submittedAt || "").localeCompare(a[1].submittedAt || ""));
    return (
      <div>
        <BackBtn onClick={() => setView("menu")} />
        <SectionTitle count={entries.length}>طلبات الانتساب</SectionTitle>
        {entries.length === 0 ? <Empty icon="clipboard-text" text="لا توجد طلبات" /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {entries.map(([reqId, req]) => {
              const areasList = (req.areas || []).map((a: any) => a.name).join("، ");
              const daysList = (req.workingDays || []).join("، ");
              const status = req.status === "pending" ? { bg: "#FEF3C7", color: "#92400E", txt: "قيد المراجعة" }
                : req.status === "approved" ? { bg: "#ECFDF3", color: "#059669", txt: "تم النشر" }
                : { bg: "#FEF2F2", color: "#DC2626", txt: "مرفوض" };
              return (
                <div key={reqId} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
                    <div style={{ fontSize: 15, fontWeight: 900, flex: 1 }}>{req.name}</div>
                    <span style={{ background: status.bg, color: status.color, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, whiteSpace: "nowrap" }}>{status.txt}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12, color: C.textSec, marginBottom: 10 }}>
                    <div><i className="ph ph-map-pin" style={{ color: C.primary }} /> {req.governorateName || "-"}</div>
                    <div><i className="ph ph-buildings" style={{ color: C.primary }} /> {areasList || "-"}</div>
                    <div><i className="ph ph-phone" style={{ color: C.primary }} /> {req.phone || "-"}</div>
                    <div><i className="ph ph-star" style={{ color: C.gold }} /> {req.rating || 0}/5</div>
                  </div>
                  {req.address && <div style={{ fontSize: 12, color: C.textSec, marginBottom: 6 }}><i className="ph ph-map-pin" /> {req.address}</div>}
                  {daysList && <div style={{ fontSize: 12, color: C.textSec, marginBottom: 6 }}><i className="ph ph-calendar" /> {daysList}</div>}
                  {req.workingHours && <div style={{ fontSize: 12, color: C.textSec, marginBottom: 12 }}><i className="ph ph-clock" /> {req.workingHours}</div>}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button onClick={async () => { if (!confirm(`نشر "${req.name}"؟`)) return; setLoading(true); try { await db.ref("centers").push({ name: req.name, address: req.address, mapLink: req.mapLink, phone: req.phone, rating: req.rating || 0, workingDays: req.workingDays || [], workingHours: req.workingHours || "", areas: req.areas || [], areaId: req.areas?.[0]?.id || "", governorateId: req.governorateId || "", publishedAt: new Date().toISOString() }); await db.ref("centerRequests/" + reqId).remove(); showToast("تم النشر"); await loadAll(); } catch { showToast("حدث خطأ"); } setLoading(false); }}
                      style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: C.green, color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}><i className="ph ph-check-circle" /> نشر</button>
                    <button onClick={async () => { if (!confirm(`رفض "${req.name}"؟`)) return; try { await db.ref("centerRequests/" + reqId).remove(); showToast("تم الرفض"); await loadAll(); } catch { showToast("حدث خطأ"); } }}
                      style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: C.red, color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}><i className="ph ph-x-circle" /> رفض</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── ADD FORMS ────────────────────────────────────────
  const [addGovName, setAddGovName] = useState("");
  const [addAreaGov, setAddAreaGov] = useState("");
  const [addAreaName, setAddAreaName] = useState("");
  const [addCenter, setAddCenter] = useState({ name: "", gov: "", area: "", address: "", phone: "", mapLink: "", rating: "0", hours: "", days: "" });

  useEffect(() => {
    if (view === "add-area") { const ids = Object.keys(govs); if (ids.length && !addAreaGov) setAddAreaGov(ids[0]); }
    if (view === "add-center") {
      const gids = Object.keys(govs), aids = Object.keys(areas);
      if (gids.length && !addCenter.gov) setAddCenter(s => ({ ...s, gov: gids[0] }));
      if (aids.length && !addCenter.area) setAddCenter(s => ({ ...s, area: aids[0] }));
    }
  }, [view, govs, areas]);

  function AddSection() {
    if (view === "add-gov") {
      return (
        <div>
          <BackBtn onClick={() => setView("menu")} />
          <SectionTitle>إضافة محافظة</SectionTitle>
          <Input label="اسم المحافظة" value={addGovName} onChange={setAddGovName} placeholder="مثال: عمان" />
          <Btn variant="primary" onClick={async () => {
            if (!addGovName.trim()) { showToast("أدخل اسم المحافظة"); return; }
            setLoading(true); try { await db.ref("governorates").push({ name: addGovName.trim() }); showToast("تم الإضافة"); setAddGovName(""); await loadAll(); setView("menu"); } catch { showToast("حدث خطأ"); } setLoading(false);
          }}><i className="ph ph-floppy-disk" /> حفظ</Btn>
        </div>
      );
    }
    if (view === "add-area") {
      const opts = Object.entries(govs).map(([id, g]) => <option key={id} value={id}>{g.name}</option>);
      return (
        <div>
          <BackBtn onClick={() => setView("menu")} />
          <SectionTitle>إضافة منطقة</SectionTitle>
          <Select label="المحافظة" value={addAreaGov} onChange={setAddAreaGov}>{opts}</Select>
          <Input label="اسم المنطقة" value={addAreaName} onChange={setAddAreaName} placeholder="مثال: خلدا" />
          <Btn variant="primary" onClick={async () => {
            if (!addAreaName.trim()) { showToast("أدخل اسم المنطقة"); return; }
            setLoading(true); try { await db.ref("areas").push({ name: addAreaName.trim(), governorateId: addAreaGov }); showToast("تم الإضافة"); setAddAreaName(""); await loadAll(); setView("menu"); } catch { showToast("حدث خطأ"); } setLoading(false);
          }}><i className="ph ph-floppy-disk" /> حفظ</Btn>
        </div>
      );
    }
    const gopts = Object.entries(govs).map(([id, g]) => <option key={id} value={id}>{g.name}</option>);
    const aopts = Object.entries(areas).map(([id, a]) => <option key={id} value={id}>{a.name}</option>);
    return (
      <div>
        <BackBtn onClick={() => setView("menu")} />
        <SectionTitle>إضافة مركز تدريب</SectionTitle>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.primary, marginBottom: 10, padding: "4px 10px", background: C.primaryLight, borderRadius: 8, display: "inline-block" }}>المعلومات الأساسية</div>
          <Input label="اسم المركز" value={addCenter.name} onChange={v => setAddCenter(s => ({ ...s, name: v }))} placeholder="اسم المركز" />
          <Select label="المحافظة" value={addCenter.gov} onChange={v => setAddCenter(s => ({ ...s, gov: v }))}>{gopts}</Select>
          <Select label="المنطقة" value={addCenter.area} onChange={v => setAddCenter(s => ({ ...s, area: v }))}>{aopts}</Select>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.primary, marginBottom: 10, padding: "4px 10px", background: C.primaryLight, borderRadius: 8, display: "inline-block" }}>تفاصيل التواصل</div>
          <Input label="العنوان" value={addCenter.address} onChange={v => setAddCenter(s => ({ ...s, address: v }))} placeholder="العنوان التفصيلي" />
          <Input label="رقم الهاتف" value={addCenter.phone} onChange={v => setAddCenter(s => ({ ...s, phone: v }))} placeholder="07XXXXXXXX" />
          <Input label="رابط الخريطة" value={addCenter.mapLink} onChange={v => setAddCenter(s => ({ ...s, mapLink: v }))} placeholder="Google Maps URL" />
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.primary, marginBottom: 10, padding: "4px 10px", background: C.primaryLight, borderRadius: 8, display: "inline-block" }}>الدوام</div>
          <Input label="التقييم (0–5)" value={addCenter.rating} onChange={v => setAddCenter(s => ({ ...s, rating: v }))} type="number" min="0" max="5" step="0.1" />
          <Input label="ساعات الدوام" value={addCenter.hours} onChange={v => setAddCenter(s => ({ ...s, hours: v }))} placeholder="8:00 ص – 4:00 م" />
          <Input label="أيام الدوام (مفصولة بفاصلة)" value={addCenter.days} onChange={v => setAddCenter(s => ({ ...s, days: v }))} placeholder="الأحد,الإثنين,الثلاثاء" />
        </div>
        <Btn variant="primary" onClick={async () => {
          if (!addCenter.name.trim()) { showToast("أدخل اسم المركز"); return; }
          const days = addCenter.days.split(",").map(s => s.trim()).filter(Boolean);
          setLoading(true); try { await db.ref("centers").push({ name: addCenter.name.trim(), governorateId: addCenter.gov, areaId: addCenter.area, address: addCenter.address.trim() || null, phone: addCenter.phone.trim() || null, mapLink: addCenter.mapLink.trim() || null, rating: parseFloat(addCenter.rating) || 0, workingHours: addCenter.hours.trim() || null, workingDays: days.length ? days : null }); showToast("تم الإضافة"); setAddCenter({ name: "", gov: "", area: "", address: "", phone: "", mapLink: "", rating: "0", hours: "", days: "" }); await loadAll(); setView("menu"); } catch { showToast("حدث خطأ"); } setLoading(false);
        }}><i className="ph ph-floppy-disk" /> حفظ المركز</Btn>
      </div>
    );
  }

  // ── EDIT ──────────────────────────────────────────────────
  type EditType = "governorates" | "areas" | "centers";
  const [editType, setEditType] = useState<EditType | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editGovName, setEditGovName] = useState("");
  const [editAreaGov, setEditAreaGov] = useState("");
  const [editAreaName, setEditAreaName] = useState("");
  const [editCenter, setEditCenter] = useState({ name: "", gov: "", area: "", address: "", phone: "", mapLink: "", rating: "0", hours: "", days: "" });

  function EditListSection() {
    if (!editType) {
      return (
        <div>
          <BackBtn onClick={() => setView("menu")} />
          <SectionTitle>تعديل البيانات</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "المحافظات", icon: "map-trifold", color: C.cyan, bg: C.cyanLight, type: "governorates" as EditType },
              { label: "المناطق", icon: "map-pin", color: C.primary, bg: C.primaryLight, type: "areas" as EditType },
              { label: "مراكز التدريب", icon: "buildings", color: C.gold, bg: C.goldLight, type: "centers" as EditType },
            ].map(item => (
              <button key={item.type} onClick={() => setEditType(item.type)} style={{
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16,
                display: "flex", alignItems: "center", gap: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "right",
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)", transition: "all .15s", width: "100%",
              }} onMouseEnter={e => { e.currentTarget.style.borderColor = item.color; }} onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: item.bg, color: item.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}><i className={`ph ph-${item.icon}`} /></div>
                <div style={{ flex: 1, fontSize: 15, fontWeight: 800, color: C.text }}>{item.label}</div>
                <i className="ph ph-caret-left" style={{ fontSize: 16, color: C.textLight }} />
              </button>
            ))}
          </div>
        </div>
      );
    }
    const data = editType === "governorates" ? govs : editType === "areas" ? areas : centers;
    const entries = Object.entries(data);
    if (entries.length === 0) return <Empty icon="folder-open" text="لا توجد بيانات" />;
    if (editId) {
      const item = data[editId];
      if (editType === "governorates") {
        return (
          <div>
            <BackBtn onClick={() => setEditId(null)} />
            <SectionTitle>تعديل محافظة</SectionTitle>
            <Input label="الاسم" value={editGovName} onChange={setEditGovName} />
            <Btn variant="primary" onClick={async () => { setLoading(true); try { await db.ref("governorates/" + editId).update({ name: editGovName.trim() }); showToast("تم التحديث"); await loadAll(); setEditId(null); } catch { showToast("حدث خطأ"); } setLoading(false); }}><i className="ph ph-check" /> حفظ</Btn>
          </div>
        );
      }
      if (editType === "areas") {
        const opts = Object.entries(govs).map(([id, g]) => <option key={id} value={id}>{g.name}</option>);
        return (
          <div>
            <BackBtn onClick={() => setEditId(null)} />
            <SectionTitle>تعديل منطقة</SectionTitle>
            <Select label="المحافظة" value={editAreaGov} onChange={setEditAreaGov}>{opts}</Select>
            <Input label="الاسم" value={editAreaName} onChange={setEditAreaName} />
            <Btn variant="primary" onClick={async () => { setLoading(true); try { await db.ref("areas/" + editId).update({ name: editAreaName.trim(), governorateId: editAreaGov }); showToast("تم التحديث"); await loadAll(); setEditId(null); } catch { showToast("حدث خطأ"); } setLoading(false); }}><i className="ph ph-check" /> حفظ</Btn>
          </div>
        );
      }
      const gopts = Object.entries(govs).map(([id, g]) => <option key={id} value={id}>{g.name}</option>);
      const aopts = Object.entries(areas).map(([id, a]) => <option key={id} value={id}>{a.name}</option>);
      return (
        <div>
          <BackBtn onClick={() => setEditId(null)} />
          <SectionTitle>تعديل مركز</SectionTitle>
          <Input label="الاسم" value={editCenter.name} onChange={v => setEditCenter(s => ({ ...s, name: v }))} />
          <Select label="المحافظة" value={editCenter.gov} onChange={v => setEditCenter(s => ({ ...s, gov: v }))}>{gopts}</Select>
          <Select label="المنطقة" value={editCenter.area} onChange={v => setEditCenter(s => ({ ...s, area: v }))}>{aopts}</Select>
          <Input label="العنوان" value={editCenter.address} onChange={v => setEditCenter(s => ({ ...s, address: v }))} />
          <Input label="الهاتف" value={editCenter.phone} onChange={v => setEditCenter(s => ({ ...s, phone: v }))} />
          <Input label="رابط الخريطة" value={editCenter.mapLink} onChange={v => setEditCenter(s => ({ ...s, mapLink: v }))} />
          <Input label="التقييم" value={editCenter.rating} onChange={v => setEditCenter(s => ({ ...s, rating: v }))} type="number" min="0" max="5" step="0.1" />
          <Input label="ساعات الدوام" value={editCenter.hours} onChange={v => setEditCenter(s => ({ ...s, hours: v }))} />
          <Input label="أيام الدوام (مفصولة)" value={editCenter.days} onChange={v => setEditCenter(s => ({ ...s, days: v }))} />
          <Btn variant="primary" onClick={async () => { const days = editCenter.days.split(",").map(s => s.trim()).filter(Boolean); setLoading(true); try { await db.ref("centers/" + editId).update({ name: editCenter.name.trim(), governorateId: editCenter.gov, areaId: editCenter.area, address: editCenter.address.trim() || null, phone: editCenter.phone.trim() || null, mapLink: editCenter.mapLink.trim() || null, rating: parseFloat(editCenter.rating) || 0, workingHours: editCenter.hours.trim() || null, workingDays: days.length ? days : null }); showToast("تم التحديث"); await loadAll(); setEditId(null); } catch { showToast("حدث خطأ"); } setLoading(false); }}><i className="ph ph-check" /> حفظ</Btn>
        </div>
      );
    }
    return (
      <div>
        <BackBtn onClick={() => setEditType(null)} />
        <SectionTitle>تعديل {editType === "governorates" ? "المحافظات" : editType === "areas" ? "المناطق" : "مراكز التدريب"}</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map(([id, item]) => (
            <ListItem key={id} label={item.name} sub={editType === "areas" ? govs[item.governorateId]?.name : editType === "centers" ? `${areas[item.areaId]?.name || ""} · ${govs[item.governorateId]?.name || ""}` : undefined} actions={
              <button onClick={() => {
                setEditId(id);
                if (editType === "governorates") setEditGovName(item.name);
                else if (editType === "areas") { setEditAreaName(item.name); setEditAreaGov(item.governorateId || ""); }
                else { setEditCenter({ name: item.name || "", gov: item.governorateId || "", area: item.areaId || "", address: item.address || "", phone: item.phone || "", mapLink: item.mapLink || "", rating: String(item.rating || 0), hours: item.workingHours || "", days: (item.workingDays || []).join(",") }); }
              }} style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${C.primary}`, background: C.surface, color: C.primary, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}><i className="ph ph-pencil-simple" /> تعديل</button>
            } />
          ))}
        </div>
      </div>
    );
  }

  // ── DELETE ──────────────────────────────────────────────────
  const [delType, setDelType] = useState<EditType | null>(null);
  function DeleteSection() {
    if (!delType) {
      return (
        <div>
          <BackBtn onClick={() => setView("menu")} />
          <SectionTitle>حذف البيانات</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "المحافظات", type: "governorates" as EditType },
              { label: "المناطق", type: "areas" as EditType },
              { label: "مراكز التدريب", type: "centers" as EditType },
            ].map(d => (
              <button key={d.type} onClick={() => setDelType(d.type)} style={{
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18,
                textAlign: "center", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)", width: "100%",
              }} onMouseEnter={e => e.currentTarget.style.borderColor = C.red} onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
      );
    }
    const data = delType === "governorates" ? govs : delType === "areas" ? areas : centers;
    const entries = Object.entries(data);
    if (entries.length === 0) return <Empty icon="folder-open" text="لا توجد بيانات" />;
    return (
      <div>
        <BackBtn onClick={() => setDelType(null)} />
        <SectionTitle>حذف {delType === "governorates" ? "المحافظات" : delType === "areas" ? "المناطق" : "مراكز التدريب"}</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map(([id, item]) => (
            <ListItem key={id} label={item.name} actions={
              <button onClick={async () => { if (!confirm(`حذف "${item.name}"؟`)) return; setLoading(true); try { await db.ref(delType + "/" + id).remove(); showToast("تم الحذف"); await loadAll(); } catch { showToast("حدث خطأ"); } setLoading(false); }}
                style={{ padding: "7px 12px", borderRadius: 8, border: "none", background: C.redLight, color: C.red, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}><i className="ph ph-trash" /> حذف</button>
            } />
          ))}
        </div>
      </div>
    );
  }

  // ── FAQ ADMIN ──────────────────────────────────────────────────
  const [faqForm, setFaqForm] = useState({ question: "", answer: "" });
  const [editingFaq, setEditingFaq] = useState<string | null>(null);
  function FaqAdminSection() {
    const entries = Object.entries(faqItems);
    return (
      <div>
        <BackBtn onClick={() => setView("menu")} />
        <SectionTitle count={entries.length}>إدارة الأسئلة الشائعة</SectionTitle>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.primary, marginBottom: 10, padding: "4px 10px", background: C.primaryLight, borderRadius: 8, display: "inline-block" }}>{editingFaq ? "تعديل السؤال" : "سؤال جديد"}</div>
          <TextArea label="السؤال" value={faqForm.question} onChange={v => setFaqForm(f => ({ ...f, question: v }))} placeholder="اكتب السؤال..." rows={2} />
          <TextArea label="الإجابة" value={faqForm.answer} onChange={v => setFaqForm(f => ({ ...f, answer: v }))} placeholder="اكتب الإجابة المفصلة..." rows={4} />
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="primary" style={{ flex: 1 }} onClick={async () => {
              if (!faqForm.question.trim() || !faqForm.answer.trim()) { showToast("أدخل السؤال والإجابة"); return; }
              setLoading(true);
              try {
                if (editingFaq) await db.ref("faq/items/" + editingFaq).update({ question: faqForm.question.trim(), answer: faqForm.answer.trim() });
                else await db.ref("faq/items").push({ question: faqForm.question.trim(), answer: faqForm.answer.trim() });
                showToast(editingFaq ? "تم التحديث" : "تم الإضافة");
                setFaqForm({ question: "", answer: "" }); setEditingFaq(null);
                await loadAll();
              } catch { showToast("حدث خطأ"); }
              setLoading(false);
            }}><i className="ph ph-floppy-disk" /> {editingFaq ? "حفظ التعديل" : "إضافة السؤال"}</Btn>
            {editingFaq && <Btn variant="ghost" style={{ flex: 1 }} onClick={() => { setFaqForm({ question: "", answer: "" }); setEditingFaq(null); }}><i className="ph ph-x" /> إلغاء</Btn>}
          </div>
        </div>
        {entries.length === 0 ? <Empty icon="chat-circle-text" text="لا توجد أسئلة شائعة" /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {entries.map(([id, f]) => (
              <div key={id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 4 }}>{f.question}</div>
                <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.6, marginBottom: 10 }}>{f.answer.substring(0, 120)}{f.answer.length > 120 ? "..." : ""}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => { setEditingFaq(id); setFaqForm({ question: f.question, answer: f.answer }); }} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${C.primary}`, background: C.surface, color: C.primary, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}><i className="ph ph-pencil-simple" /> تعديل</button>
                  <button onClick={async () => { if (!confirm("حذف السؤال؟")) return; setLoading(true); try { await db.ref("faq/items/" + id).remove(); showToast("تم الحذف"); await loadAll(); } catch { showToast("حدث خطأ"); } setLoading(false); }}
                    style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: C.redLight, color: C.red, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}><i className="ph ph-trash" /> حذف</button>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            <StatCard label="محافظة" value={stats.gov} icon="map-trifold" color={C.cyan} bg={C.cyanLight} />
            <StatCard label="منطقة" value={stats.area} icon="map-pin" color={C.primary} bg={C.primaryLight} />
            <StatCard label="مركز" value={stats.center} icon="buildings" color={C.gold} bg={C.goldLight} />
            <StatCard label="مستخدم" value={stats.user} icon="users" color={C.green} bg={C.greenLight} />
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.textSec, marginBottom: 10, padding: "0 4px" }}>الإدارة</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Card icon="users" color={C.primary} colorBg={C.primaryLight} title="المستخدمين" desc="عرض وحذف المستخدمين" onClick={() => setView("users")} count={stats.user} />
            <Card icon="question" color={C.gold} colorBg={C.goldLight} title="الأسئلة" desc="إضافة، تعديل، حذف الأسئلة" onClick={() => { setQSub("menu"); setView("questions"); }} count={stats.q} />
            <Card icon="chat-circle-text" color={C.purple} colorBg={C.purpleLight} title="الأسئلة الشائعة" desc="إدارة الأسئلة المتكررة" onClick={() => { setFaqForm({ question: "", answer: "" }); setEditingFaq(null); setView("faq-admin"); }} count={stats.faq} />
            <Card icon="clipboard-text" color={C.purple} colorBg={C.purpleLight} title="طلبات الانتساب" desc="مراجعة ونشر أو رفض" onClick={() => setView("requests")} count={stats.req} />
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.textSec, marginTop: 16, marginBottom: 10, padding: "0 4px" }}>البيانات الجغرافية</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Card icon="map-trifold" color={C.cyan} colorBg={C.cyanLight} title="إضافة محافظة" desc="إنشاء محافظة جديدة" onClick={() => setView("add-gov")} />
            <Card icon="map-pin" color={C.primary} colorBg={C.primaryLight} title="إضافة منطقة" desc="ربط منطقة بمحافظة" onClick={() => setView("add-area")} />
            <Card icon="buildings" color={C.gold} colorBg={C.goldLight} title="إضافة مركز" desc="إضافة مركز تدريب جديد" onClick={() => setView("add-center")} />
            <Card icon="pencil-simple" color={C.primary} colorBg={C.primaryLight} title="تعديل البيانات" desc="تعديل المحافظات والمناطق والمراكز" onClick={() => { setEditType(null); setView("edit-list"); }} />
            <Card icon="trash" color={C.red} colorBg={C.redLight} title="حذف البيانات" desc="إزالة المحافظات أو المناطق أو المراكز" onClick={() => { setDelType(null); setView("delete-list"); }} />
          </div>
        </div>
      );
      case "users": return <UsersSection />;
      case "questions": return <QuestionsSection />;
      case "requests": return <RequestsSection />;
      case "add-gov": case "add-area": case "add-center": return <AddSection />;
      case "edit-list": return <EditListSection />;
      case "delete-list": return <DeleteSection />;
      case "faq-admin": return <FaqAdminSection />;
      default: return null;
    }
  };

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: C.bg, direction: "rtl" }}>
      {/* Header */}
      <div style={{
        background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "12px 16px",
        display: "flex", flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 0, boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
      }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 10, border: `1px solid ${C.border}`,
          background: C.bg, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0,
        }}><i className="ph ph-sign-out" style={{ fontSize: 18, color: C.red }} /></button>
        <div style={{ flex: 1, textAlign: "right" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: C.text }}>لوحة التحكم</div>
          <div style={{ fontSize: 11, color: C.textLight, marginTop: 1 }}>JO Driver — إدارة المنصة</div>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: C.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, flexShrink: 0 }}>
          <i className="ph ph-shield-check" />
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: "1 1 0", minHeight: 0, overflowY: "auto", padding: "16px 14px" }}>
        {renderView()}
        <div style={{ height: 20 }} />
      </div>

      {/* Toast & Loading */}
      <Toast msg={toast} />
      {loading && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(246,248,251,0.95)",
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
