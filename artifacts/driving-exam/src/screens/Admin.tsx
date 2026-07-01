import { useState, useEffect, useCallback } from "react";
import { db } from "../lib/firebase";
import Header from "../components/Header";
import AppFooter from "../components/Footer";

interface Props { onBack: () => void; }

type View = "menu" | "users" | "questions" | "requests" | "add-gov" | "add-area" | "add-center" | "edit-list" | "delete-list" | "question-form" | "guide-admin" | "footer-admin";

const Q_CATS = [
  "قواعد السير والمرور",
  "الميكانيك",
  "السلامة على الطريق",
  "أسعافات أولية",
  "الشواخص والخطوط والعلامات",
  "المخالفات واحتساب النقاط",
  "الصور المتحركة",
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
  const [stats, setStats] = useState({ gov: 0, area: 0, center: 0, user: 0, req: 0, q: 0, guide: 0 });

  const [govs, setGovs] = useState<Record<string, { name: string }>>({});
  const [areas, setAreas] = useState<Record<string, { name: string; governorateId: string }>>({});
  const [centers, setCenters] = useState<Record<string, any>>({});
  const [users, setUsers] = useState<Record<string, any>>({});
  const [questions, setQuestions] = useState<Record<string, any>>({});
  const [requests, setRequests] = useState<Record<string, any>>({});
  const [guideSections, setGuideSections] = useState<Record<string, any>>({});

  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [govSnap, areaSnap, centerSnap, userSnap, qSnap, reqSnap, guideSnap] = await Promise.all([
        db.ref("governorates").once("value"), db.ref("areas").once("value"), db.ref("centers").once("value"),
        db.ref("users").once("value"), db.ref("questions").once("value"), db.ref("centerRequests").once("value"),
        db.ref("guide/sections").once("value"),
      ]);
      const g = govSnap.val() || {}, a = areaSnap.val() || {}, c = centerSnap.val() || {};
      const u = userSnap.val() || {}, q = qSnap.val() || {}, r = reqSnap.val() || {}, gs = guideSnap.val() || {};
      setGovs(g); setAreas(a); setCenters(c); setUsers(u); setQuestions(q); setRequests(r); setGuideSections(gs);
      const guideCount = Object.keys(gs).length || Object.keys(DEFAULT_GUIDE_SECTIONS).length;
      setStats({ gov: Object.keys(g).length, area: Object.keys(a).length, center: Object.keys(c).length,
        user: Object.keys(u).length, req: Object.keys(r).length, q: Object.keys(q).length, guide: guideCount });
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
              const activeDays = req.workingDays || [];
              const status = req.status === "pending" ? { bg: "#FEF3C7", color: "#92400E", txt: "قيد المراجعة" }
                : req.status === "approved" ? { bg: "#ECFDF3", color: "#059669", txt: "تم النشر" }
                : { bg: "#FEF2F2", color: "#DC2626", txt: "مرفوض" };
              return (
                <div key={reqId} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.03)", direction: "rtl" }}>
                  {/* Header: name + status */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 8 }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: C.text, flex: 1, lineHeight: 1.4 }}>{req.name}</div>
                    <span style={{ background: status.bg, color: status.color, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, whiteSpace: "nowrap", flexShrink: 0 }}>{status.txt}</span>
                  </div>

                  {/* Info rows */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.textSec }}>
                      <i className="ph ph-phone" style={{ color: C.primary, fontSize: 14, flexShrink: 0 }} />
                      <span style={{ fontWeight: 700, color: C.text }}>{req.phone || "-"}</span>
                    </div>
                    {areasList && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.textSec }}>
                        <i className="ph ph-map-pin" style={{ color: C.primary, fontSize: 14, flexShrink: 0 }} />
                        <span>{govs[req.governorateId]?.name || "-"} — {areasList}</span>
                      </div>
                    )}
                    {req.address && (
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: C.textSec }}>
                        <i className="ph ph-map-trifold" style={{ color: C.primary, fontSize: 14, flexShrink: 0, marginTop: 2 }} />
                        <span style={{ lineHeight: 1.5 }}>{req.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Working days + hours */}
                  {(activeDays.length > 0 || req.workingHours) && (
                    <div style={{
                      background: "#F9FAFB", borderRadius: 10, padding: 10,
                      marginBottom: 10, border: "1px solid #F0F1F3",
                    }}>
                      {req.workingHours && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.textSec, marginBottom: 6 }}>
                          <i className="ph ph-clock" style={{ color: C.primary, fontSize: 13 }} />
                          <span style={{ fontWeight: 700, color: C.text }}>{req.workingHours}</span>
                        </div>
                      )}
                      {activeDays.length > 0 && (
                        <div style={{ display: "flex", gap: 5 }}>
                          {ALL_DAYS_SHORT.map((d, i) => {
                            const on = activeDays.includes(ALL_DAYS_FULL[i]);
                            return (
                              <div key={d} style={{
                                width: 26, height: 26, borderRadius: 7,
                                background: on ? "#246BFD" : "#E5E7EB",
                                color: on ? "#fff" : "#9CA3AF",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 11, fontWeight: 800,
                              }}>{d}</div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rating */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                    <i className="ph ph-star-fill" style={{ fontSize: 14, color: "#F59E0B" }} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#92400E" }}>{req.rating || 0} / 5</span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={async () => { if (!confirm(`نشر "${req.name}" ؟`)) return; setLoading(true); try { await db.ref("centers").push({ name: req.name, address: req.address || null, mapLink: req.mapLink || null, phone: req.phone || null, rating: req.rating || 0, workingDays: req.workingDays || [], workingHours: req.workingHours || "", areas: req.areas || [], areaId: req.areas?.[0]?.id || "", governorateId: req.governorateId || "", publishedAt: new Date().toISOString() }); await db.ref("centerRequests/" + reqId).remove(); showToast("تم النشر"); await loadAll(); } catch { showToast("حدث خطأ"); } setLoading(false); }}
                      style={{
                        flex: 1, padding: "10px 14px", borderRadius: 10, border: "none",
                        background: C.green, color: "#fff", fontSize: 13, fontWeight: 800,
                        cursor: "pointer", fontFamily: "inherit",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      }}>
                      <i className="ph ph-check-circle" /> نشر المركز
                    </button>
                    <button onClick={async () => { if (!confirm(`رفض "${req.name}" ؟`)) return; try { await db.ref("centerRequests/" + reqId).remove(); showToast("تم الرفض"); await loadAll(); } catch { showToast("حدث خطأ"); } }}
                      style={{
                        padding: "10px 14px", borderRadius: 10, border: "none",
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
      </div>
    );
  }

  // ── ADD FORMS ────────────────────────────────────────
  const [addGovName, setAddGovName] = useState("");
  const [addAreaGov, setAddAreaGov] = useState("");
  const [addAreaName, setAddAreaName] = useState("");
  const ALL_DAYS_SHORT = ["س","ح","ن","ث","ر","خ","ج"];
  const ALL_DAYS_FULL = ["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];

  const [addCenter, setAddCenter] = useState({ name: "", gov: "", areaIds: [] as string[], address: "", phone: "", mapLink: "", rating: "0", startHour: "08:00", endHour: "16:00", selectedDays: [] as string[] });

  useEffect(() => {
    if (view === "add-area") { const ids = Object.keys(govs); if (ids.length && !addAreaGov) setAddAreaGov(ids[0]); }
    if (view === "add-center") {
      const gids = Object.keys(govs);
      if (gids.length && !addCenter.gov) setAddCenter(s => ({ ...s, gov: gids[0], areaIds: [] }));
    }
  }, [view, govs]);

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
    const govAreas = addCenter.gov
      ? Object.entries(areas).filter(([, a]) => a.governorateId === addCenter.gov)
      : [];

    function toggleArea(id: string) {
      setAddCenter(s => ({
        ...s,
        areaIds: s.areaIds.includes(id) ? s.areaIds.filter(x => x !== id) : [...s.areaIds, id]
      }));
    }
    function toggleDay(day: string) {
      setAddCenter(s => ({
        ...s,
        selectedDays: s.selectedDays.includes(day) ? s.selectedDays.filter(x => x !== day) : [...s.selectedDays, day]
      }));
    }
    function resetAddCenter() {
      setAddCenter({ name: "", gov: Object.keys(govs)[0] || "", areaIds: [], address: "", phone: "", mapLink: "", rating: "0", startHour: "08:00", endHour: "16:00", selectedDays: [] });
    }

    return (
      <div>
        <BackBtn onClick={() => setView("menu")} />
        <SectionTitle>إضافة مركز تدريب</SectionTitle>

        {/* Basic info */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.primary, marginBottom: 10, padding: "4px 10px", background: C.primaryLight, borderRadius: 8, display: "inline-block" }}>المعلومات الأساسية</div>
          <Input label="اسم المركز" value={addCenter.name} onChange={v => setAddCenter(s => ({ ...s, name: v }))} placeholder="اسم المركز التدريبي" />
          <Input label="العنوان" value={addCenter.address} onChange={v => setAddCenter(s => ({ ...s, address: v }))} placeholder="العنوان التفصيلي" />
          <Input label="رقم الهاتف" value={addCenter.phone} onChange={v => setAddCenter(s => ({ ...s, phone: v }))} placeholder="07XXXXXXXX" type="tel" />
          <Input label="رابط الخريطة" value={addCenter.mapLink} onChange={v => setAddCenter(s => ({ ...s, mapLink: v }))} placeholder="Google Maps URL (اختياري)" />
        </div>

        {/* Location */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.primary, marginBottom: 10, padding: "4px 10px", background: C.primaryLight, borderRadius: 8, display: "inline-block" }}>الموقع</div>
          <Select label="المحافظة" value={addCenter.gov} onChange={v => setAddCenter(s => ({ ...s, gov: v, areaIds: [] }))}>{gopts}</Select>
          {govAreas.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.textSec, display: "block", marginBottom: 6 }}>المناطق المخدّمة (اختر واحدة أو أكثر)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {govAreas.map(([id, a]) => (
                  <button key={id} onClick={() => toggleArea(id)}
                    style={{
                      padding: "6px 12px", borderRadius: 10,
                      border: `1.5px solid ${addCenter.areaIds.includes(id) ? C.primary : C.border}`,
                      background: addCenter.areaIds.includes(id) ? C.primaryLight : C.bg,
                      color: addCenter.areaIds.includes(id) ? C.primary : C.textSec,
                      fontSize: 12, fontWeight: 700,
                      cursor: "pointer", fontFamily: "inherit",
                      transition: "all 0.15s",
                    }}>
                    <i className={`ph ph-${addCenter.areaIds.includes(id) ? "check-square" : "square"}`} style={{ fontSize: 13, marginLeft: 4 }} />
                    {a.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Working hours */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.primary, marginBottom: 10, padding: "4px 10px", background: C.primaryLight, borderRadius: 8, display: "inline-block" }}>أوقات وإيام الدوام</div>

          <Input label="التقييم (0–5)" value={addCenter.rating} onChange={v => setAddCenter(s => ({ ...s, rating: v }))} type="number" min="0" max="5" step="0.1" />

          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.textSec, display: "block", marginBottom: 6 }}>من</label>
              <input type="time" value={addCenter.startHour}
                onChange={e => setAddCenter(s => ({ ...s, startHour: e.target.value }))}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.bg, fontSize: 14, fontFamily: "inherit", color: C.text }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.textSec, display: "block", marginBottom: 6 }}>إلى</label>
              <input type="time" value={addCenter.endHour}
                onChange={e => setAddCenter(s => ({ ...s, endHour: e.target.value }))}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.bg, fontSize: 14, fontFamily: "inherit", color: C.text }}
              />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: C.textSec, display: "block", marginBottom: 8 }}>أيام الدوام</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {ALL_DAYS_FULL.map((day, i) => (
                <button key={day} onClick={() => toggleDay(day)}
                  style={{
                    width: 42, height: 42, borderRadius: 10,
                    border: `1.5px solid ${addCenter.selectedDays.includes(day) ? C.primary : C.border}`,
                    background: addCenter.selectedDays.includes(day) ? C.primary : C.bg,
                    color: addCenter.selectedDays.includes(day) ? "#fff" : C.textSec,
                    fontSize: 14, fontWeight: 800,
                    cursor: "pointer", fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}>
                  {ALL_DAYS_SHORT[i]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save */}
        <Btn variant="primary" onClick={async () => {
          if (!addCenter.name.trim()) { showToast("أدخل اسم المركز"); return; }
          if (addCenter.phone.trim() && !/^07\d{8}$/.test(addCenter.phone.trim())) { showToast("رقم الهاتف غير صالح"); return; }
          if (addCenter.areaIds.length === 0) { showToast("اختر منطقة واحدة على الأقل"); return; }
          if (addCenter.selectedDays.length === 0) { showToast("اختر يوم دوام واحد على الأقل"); return; }
          const areaObjs = addCenter.areaIds.map(id => ({ id, name: areas[id]?.name || "" }));
          setLoading(true); try { await db.ref("centers").push({
            name: addCenter.name.trim(),
            governorateId: addCenter.gov,
            areaId: addCenter.areaIds[0],
            areas: areaObjs,
            address: addCenter.address.trim() || null,
            phone: addCenter.phone.trim() || null,
            mapLink: addCenter.mapLink.trim() || null,
            rating: parseFloat(addCenter.rating) || 0,
            workingHours: `${addCenter.startHour.trim()} – ${addCenter.endHour.trim()}`,
            workingDays: addCenter.selectedDays,
          }); showToast("تم الإضافة"); resetAddCenter(); await loadAll(); setView("menu"); } catch { showToast("حدث خطأ"); } setLoading(false);
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
  const [editCenter, setEditCenter] = useState({ name: "", gov: "", areaIds: [] as string[], address: "", phone: "", mapLink: "", rating: "0", startHour: "08:00", endHour: "16:00", selectedDays: [] as string[] });

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
      const editGovAreas = editCenter.gov
        ? Object.entries(areas).filter(([, a]) => a.governorateId === editCenter.gov)
        : [];
      function editToggleArea(id: string) {
        setEditCenter(s => ({
          ...s,
          areaIds: s.areaIds.includes(id) ? s.areaIds.filter(x => x !== id) : [...s.areaIds, id]
        }));
      }
      function editToggleDay(day: string) {
        setEditCenter(s => ({
          ...s,
          selectedDays: s.selectedDays.includes(day) ? s.selectedDays.filter(x => x !== day) : [...s.selectedDays, day]
        }));
      }
      return (
        <div>
          <BackBtn onClick={() => setEditId(null)} />
          <SectionTitle>تعديل مركز</SectionTitle>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.primary, marginBottom: 10, padding: "4px 10px", background: C.primaryLight, borderRadius: 8, display: "inline-block" }}>المعلومات الأساسية</div>
            <Input label="اسم المركز" value={editCenter.name} onChange={v => setEditCenter(s => ({ ...s, name: v }))} />
            <Input label="العنوان" value={editCenter.address} onChange={v => setEditCenter(s => ({ ...s, address: v }))} />
            <Input label="رقم الهاتف" value={editCenter.phone} onChange={v => setEditCenter(s => ({ ...s, phone: v }))} type="tel" />
            <Input label="رابط الخريطة" value={editCenter.mapLink} onChange={v => setEditCenter(s => ({ ...s, mapLink: v }))} />
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.primary, marginBottom: 10, padding: "4px 10px", background: C.primaryLight, borderRadius: 8, display: "inline-block" }}>الموقع</div>
            <Select label="المحافظة" value={editCenter.gov} onChange={v => setEditCenter(s => ({ ...s, gov: v, areaIds: [] }))}>{gopts}</Select>
            {editGovAreas.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: C.textSec, display: "block", marginBottom: 6 }}>المناطق المخدّمة (اختر واحدة أو أكثر)</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {editGovAreas.map(([id, a]) => (
                    <button key={id} onClick={() => editToggleArea(id)}
                      style={{
                        padding: "6px 12px", borderRadius: 10,
                        border: `1.5px solid ${editCenter.areaIds.includes(id) ? C.primary : C.border}`,
                        background: editCenter.areaIds.includes(id) ? C.primaryLight : C.bg,
                        color: editCenter.areaIds.includes(id) ? C.primary : C.textSec,
                        fontSize: 12, fontWeight: 700,
                        cursor: "pointer", fontFamily: "inherit",
                        transition: "all 0.15s",
                      }}>
                      <i className={`ph ph-${editCenter.areaIds.includes(id) ? "check-square" : "square"}`} style={{ fontSize: 13, marginLeft: 4 }} />
                      {a.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.primary, marginBottom: 10, padding: "4px 10px", background: C.primaryLight, borderRadius: 8, display: "inline-block" }}>أوقات وإيام الدوام</div>
            <Input label="التقييم (0–5)" value={editCenter.rating} onChange={v => setEditCenter(s => ({ ...s, rating: v }))} type="number" min="0" max="5" step="0.1" />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: C.textSec, display: "block", marginBottom: 6 }}>من</label>
                <input type="time" value={editCenter.startHour}
                  onChange={e => setEditCenter(s => ({ ...s, startHour: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.bg, fontSize: 14, fontFamily: "inherit", color: C.text }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: C.textSec, display: "block", marginBottom: 6 }}>إلى</label>
                <input type="time" value={editCenter.endHour}
                  onChange={e => setEditCenter(s => ({ ...s, endHour: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.bg, fontSize: 14, fontFamily: "inherit", color: C.text }}
                />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.textSec, display: "block", marginBottom: 8 }}>أيام الدوام</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {ALL_DAYS_FULL.map((day, i) => (
                  <button key={day} onClick={() => editToggleDay(day)}
                    style={{
                      width: 42, height: 42, borderRadius: 10,
                      border: `1.5px solid ${editCenter.selectedDays.includes(day) ? C.primary : C.border}`,
                      background: editCenter.selectedDays.includes(day) ? C.primary : C.bg,
                      color: editCenter.selectedDays.includes(day) ? "#fff" : C.textSec,
                      fontSize: 14, fontWeight: 800,
                      cursor: "pointer", fontFamily: "inherit",
                      transition: "all 0.15s",
                    }}>
                    {ALL_DAYS_SHORT[i]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Btn variant="primary" onClick={async () => {
            if (!editCenter.name.trim()) { showToast("أدخل اسم المركز"); return; }
            if (editCenter.phone.trim() && !/^07\d{8}$/.test(editCenter.phone.trim())) { showToast("رقم الهاتف غير صالح"); return; }
            if (editCenter.areaIds.length === 0) { showToast("اختر منطقة واحدة على الأقل"); return; }
            if (editCenter.selectedDays.length === 0) { showToast("اختر يوم دوام واحد على الأقل"); return; }
            const areaObjs = editCenter.areaIds.map(id => ({ id, name: areas[id]?.name || "" }));
            setLoading(true); try {
              await db.ref("centers/" + editId).update({
                name: editCenter.name.trim(),
                governorateId: editCenter.gov,
                areaId: editCenter.areaIds[0],
                areas: areaObjs,
                address: editCenter.address.trim() || null,
                phone: editCenter.phone.trim() || null,
                mapLink: editCenter.mapLink.trim() || null,
                rating: parseFloat(editCenter.rating) || 0,
                workingHours: `${editCenter.startHour.trim()} – ${editCenter.endHour.trim()}`,
                workingDays: editCenter.selectedDays,
              });
              showToast("تم التحديث");
              await loadAll(); setEditId(null);
            } catch { showToast("حدث خطأ"); }
            setLoading(false);
          }}><i className="ph ph-check" /> حفظ التغييرات</Btn>
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
                else {
                  const existingAreas = item.areas || (item.areaId ? [{ id: item.areaId, name: areas[item.areaId]?.name || "" }] : []);
                  const areaIds = existingAreas.map((a: any) => a.id);
                  let startHour = "08:00", endHour = "16:00";
                  if (item.workingHours && item.workingHours.includes("–")) {
                    const parts = item.workingHours.split("–").map((s: string) => s.trim());
                    if (parts.length === 2) { startHour = parts[0]; endHour = parts[1]; }
                  }
                  setEditCenter({ name: item.name || "", gov: item.governorateId || "", areaIds, address: item.address || "", phone: item.phone || "", mapLink: item.mapLink || "", rating: String(item.rating || 0), startHour, endHour, selectedDays: item.workingDays || [] });
                }
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
    { color: "#2563EB", bg: "#DBEAFE", label: "أزرق" },
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
    "default-docs": {
      title: "الأوراق والوثائق المطلوبة",
      icon: "folder-open", iconColor: "#D97706", iconBg: "#FEF3C7", type: "documents", order: 2,
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
      icon: "currency-circle-dollar", iconColor: "#16A34A", iconBg: "#DCFCE7", type: "fees", order: 3,
      items: [
        { text: "رسوم تسجيل طلب التقديم", amount: "3 د.أ", note: "تُدفع لدى دائرة الترخيص" },
        { text: "رسوم الفحص النظري", amount: "10 د.أ", note: "في حال الرسوب تُعاد الرسوم" },
        { text: "رسوم الفحص العملي", amount: "20 د.أ", note: "لكل محاولة" },
        { text: "رسوم استخراج الرخصة", amount: "30 د.أ", note: "عند النجاح في الفحصين" },
      ],
    },
    "default-conditions": {
      title: "شروط التقديم",
      icon: "user-check", iconColor: "#0891B2", iconBg: "#CFFAFE", type: "conditions", order: 4,
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
    title: "", icon: "list-numbers", iconColor: "#7C3AED", iconBg: "#EDE9FE",
    type: "steps" as GuideType, order: 0, items: [] as { text: string; sub?: string; note?: string; amount?: string; answer?: string; icon?: string }[],
  });

  function resetGuideForm() {
    setGuideForm({ title: "", icon: "list-numbers", iconColor: "#7C3AED", iconBg: "#EDE9FE", type: "steps", order: 0, items: [] });
  }

  function openGuideEditor(id?: string) {
    if (id) {
      const merged = mergeGuideSections();
      const s = merged[id];
      if (!s) return;
      setGuideForm({
        title: s.title || "", icon: s.icon || "list-numbers",
        iconColor: s.iconColor || "#7C3AED", iconBg: s.iconBg || "#EDE9FE",
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
                <div style={{ width: 36, height: 36, borderRadius: 9, background: s.iconBg || "#EDE9FE", color: s.iconColor || "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}><i className={`ph ph-${s.icon || "list-numbers"}`} /></div>
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
  const [footerDefaultLink, setFooterDefaultLink] = useState("");
  const [footerAbout, setFooterAbout] = useState("");
  const [sponsorImgUrl, setSponsorImgUrl] = useState("");
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
    const [spSnap, soSnap, dlSnap, atSnap] = await Promise.all([
      db.ref("footer/sponsors").once("value"),
      db.ref("footer/social").once("value"),
      db.ref("footer/defaultSponsorLink").once("value"),
      db.ref("footer/aboutText").once("value"),
    ]);
    setFooterSponsors(spSnap.val() || {});
    setFooterSocial(soSnap.val() || {});
    setFooterDefaultLink(dlSnap.val() || "");
    setFooterAbout(atSnap.val() || "");
  }

  function FooterAdminSection() {

    async function addSponsor() {
      if (!sponsorImgUrl.trim()) { showToast("أدخل رابط الصورة"); return; }
      setLoading(true);
      try {
        await db.ref("footer/sponsors").push({ imageUrl: sponsorImgUrl.trim(), link: sponsorLink.trim() || null });
        setSponsorImgUrl(""); setSponsorLink("");
        showToast("تمت الإضافة"); await loadFooter();
      } catch { showToast("حدث خطأ"); }
      setLoading(false);
    }

    async function removeSponsor(id: string) {
      if (!confirm("حذف هذه الصورة؟")) return;
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

        {/* ── Default Sponsor Link ── */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ph ph-link" style={{ color: C.primary }} /> رابط الصورة الافتراضية
          </div>
          <Input label="الرابط عند الضغط على الصورة الافتراضية" value={footerDefaultLink} onChange={setFooterDefaultLink} placeholder="https://t.me/jodriver" />
          <Btn variant="primary" onClick={async () => {
            setLoading(true);
            try {
              await db.ref("footer/defaultSponsorLink").set(footerDefaultLink.trim() || null);
              showToast("تم الحفظ");
            } catch { showToast("حدث خطأ"); }
            setLoading(false);
          }}><i className="ph ph-floppy-disk" /> حفظ الرابط</Btn>
        </div>

        {/* ── About text ── */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
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
              style={{
                width: "100%", padding: "12px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10,
                background: C.surface, fontSize: 14, fontFamily: "inherit", color: C.text, outline: "none",
                resize: "vertical", lineHeight: 1.7,
              }}
              onFocus={e => e.currentTarget.style.borderColor = C.primary}
              onBlur={e => e.currentTarget.style.borderColor = C.border}
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

        {/* ── Sponsors ── */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ph ph-image" style={{ color: C.gold }} /> صور الراعي الرسمي (رعاة مدفوعون)
            <span style={{ fontSize: 11, background: C.goldLight, color: C.gold, padding: "1px 8px", borderRadius: 20 }}>{sponsorArr.length}</span>
          </div>

          <Input label="رابط الصورة (URL)" value={sponsorImgUrl} onChange={setSponsorImgUrl} placeholder="https://example.com/logo.jpg" />
          <Input label="رابط الضغط (اختياري)" value={sponsorLink} onChange={setSponsorLink} placeholder="https://example.com" />
          {sponsorImgUrl.trim() && (
            <div style={{ marginBottom: 12, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}`, background: "#F9FAFB" }}>
              <img src={sponsorImgUrl} alt="preview" style={{ width: "100%", height: 80, objectFit: "contain", display: "block" }}
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
          )}
          <Btn variant="primary" onClick={addSponsor}><i className="ph ph-plus" /> إضافة صورة</Btn>

          {sponsorArr.length > 0 && (
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              {sponsorArr.map(([id, sp]) => (
                <div key={id} style={{ display: "flex", alignItems: "center", gap: 10, background: C.bg, borderRadius: 10, padding: "10px 12px", border: `1px solid ${C.border}` }}>
                  <img src={sp.imageUrl} alt="" style={{ width: 56, height: 40, objectFit: "contain", borderRadius: 6, background: "#fff", border: `1px solid ${C.border}`, flexShrink: 0 }}
                    onError={e => { (e.target as HTMLImageElement).style.opacity = "0.3"; }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
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
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
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
            <Card icon="book-open-text" color={C.purple} colorBg={C.purpleLight} title="دليل المستخدم" desc="إدارة أقسام الدليل" onClick={() => { resetGuideForm(); setGuideEditorOpen(false); setEditingGuideId(null); setView("guide-admin"); }} count={stats.guide} />
            <Card icon="clipboard-text" color={C.purple} colorBg={C.purpleLight} title="طلبات الانتساب" desc="مراجعة ونشر أو رفض" onClick={() => setView("requests")} count={stats.req} />
          </div>
          <Card icon="layout" color="#0891B2" colorBg={C.cyanLight} title="إدارة الفوتر" desc="الراعي الرسمي، سوشيال ميديا، من نحن" onClick={() => { loadFooter(); setView("footer-admin"); }} />
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
      case "questions": return QuestionsSection();
      case "requests": return <RequestsSection />;
      case "add-gov": case "add-area": case "add-center": return <AddSection />;
      case "edit-list": return <EditListSection />;
      case "delete-list": return <DeleteSection />;
      case "guide-admin": return <GuideAdminSection />;
      case "footer-admin": return FooterAdminSection();
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

      <AppFooter />

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
