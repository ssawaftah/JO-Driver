import { useState, useEffect, useCallback } from "react";
import { db } from "../lib/firebase";

interface Props { onBack: () => void; }

type View = "menu" | "users" | "questions" | "requests" | "add-gov" | "add-area" | "add-center" | "edit-list" | "delete-list" | "question-form" | "admins";

const Q_CATS = [
  "قواعد السير والمرور",
  "الميكانيك",
  "السلامة على الطريق",
  "أسعافات أولية",
  "الشواخص والخطوط والعلامات",
  "المخالفات واحتساب النقاط",
];

// ── Reusable UI helpers ──────────────────────────────────
type IconColor = "green" | "blue" | "gold" | "red" | "purple" | "cyan";
const iconBg: Record<IconColor, string> = { green: "#ECFDF3", blue: "#EEF4FF", gold: "#FEF3C7", red: "#FEF2F2", purple: "#EDE9FE", cyan: "#CFFAFE" };
const iconColor: Record<IconColor, string> = { green: "#16A34A", blue: "#246BFD", gold: "#D97706", red: "#DC2626", purple: "#7C3AED", cyan: "#0891B2" };

function Card({ icon, color, title, desc, onClick }: { icon: string; color: IconColor; title: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", background: "#fff", border: "1.5px solid #F0F1F3",
      borderRadius: 16, padding: "14px", display: "flex", alignItems: "center", gap: 13,
      cursor: "pointer", fontFamily: "inherit", textAlign: "right",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "border-color .15s",
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: iconBg[color], color: iconColor[color], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21 }}>
        <i className={`ph ph-${icon}`} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#111827", marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5 }}>{desc}</div>
      </div>
      <i className="ph ph-caret-left" style={{ fontSize: 17, color: "#D1D5DB", flexShrink: 0 }} />
    </button>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: "none", border: "none", color: "#246BFD",
      cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 800,
      display: "flex", alignItems: "center", gap: 6, marginBottom: 14, padding: "4px 0",
    }}>
      <i className="ph ph-arrow-right" style={{ fontSize: 16 }} />
      رجوع
    </button>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 17, fontWeight: 900, color: "#111827", marginBottom: 14 }}>{children}</div>;
}

function Input({ label, value, onChange, placeholder, type = "text", ...rest }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; [k: string]: any }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: "#111827" }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} {...rest} style={{
        width: "100%", padding: "14px", border: "1.5px solid #F0F1F3", borderRadius: 12,
        background: "#fff", fontSize: 14, fontFamily: "inherit", color: "#111827",
      }} />
    </div>
  );
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: "#111827" }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        width: "100%", padding: "14px", border: "1.5px solid #F0F1F3", borderRadius: 12,
        background: "#fff", fontSize: 14, fontFamily: "inherit", color: "#111827", appearance: "none",
      }}>{children}</select>
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", style = {} }: { children: React.ReactNode; onClick: () => void; variant?: "primary" | "outline" | "danger"; style?: React.CSSProperties }) {
  const bg = variant === "primary" ? "#246BFD" : variant === "danger" ? "#DC2626" : "#fff";
  const color = variant === "outline" ? "#246BFD" : "#fff";
  const border = variant === "outline" ? "1.5px solid #246BFD" : "none";
  return (
    <button onClick={onClick} style={{
      width: "100%", border, background: bg, color,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      fontFamily: "inherit", fontSize: 14, fontWeight: 800,
      padding: "14px", borderRadius: 12, cursor: "pointer", marginBottom: 10, ...style,
    }}>{children}</button>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      background: "#fff", border: "1.5px solid #F0F1F3", borderRadius: 16,
      padding: "16px 12px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div style={{ fontSize: 26, fontWeight: 900, color: "#246BFD", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#6B7280", marginTop: 6, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function ListItem({ label, actions }: { label: string; actions: React.ReactNode }) {
  return (
    <div style={{
      background: "#fff", border: "1.5px solid #F0F1F3", borderRadius: 12,
      padding: "14px", marginBottom: 8, display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#111827", flex: 1 }}>{label}</span>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>{actions}</div>
    </div>
  );
}

function Empty({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ textAlign: "center", padding: "50px 20px", color: "#6B7280" }}>
      <i className={`ph ph-${icon}`} style={{ fontSize: 44, marginBottom: 12, opacity: 0.3, display: "block" }} />
      <div style={{ fontSize: 13 }}>{text}</div>
    </div>
  );
}

function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", top: 60, right: 14, left: 14,
      background: "#111827", color: "#fff", padding: "12px 16px",
      borderRadius: 12, fontSize: 13, fontWeight: 700,
      textAlign: "center", zIndex: 200, transition: "opacity .3s",
    }}>{msg}</div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function Admin({ onBack }: Props) {
  const [view, setView] = useState<View>("menu");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ gov: 0, area: 0, center: 0, user: 0, req: 0 });

  // Data caches
  const [govs, setGovs] = useState<Record<string, { name: string }>>({});
  const [areas, setAreas] = useState<Record<string, { name: string; governorateId: string }>>({});
  const [centers, setCenters] = useState<Record<string, any>>({});
  const [users, setUsers] = useState<Record<string, any>>({});
  const [questions, setQuestions] = useState<Record<string, any>>({});
  const [requests, setRequests] = useState<Record<string, any>>({});
  const [admins, setAdmins] = useState<Record<string, { email: string; password: string }>>({});

  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [govSnap, areaSnap, centerSnap, userSnap, qSnap, reqSnap, adminSnap] = await Promise.all([
        db.ref("governorates").once("value"),
        db.ref("areas").once("value"),
        db.ref("centers").once("value"),
        db.ref("users").once("value"),
        db.ref("questions").once("value"),
        db.ref("centerRequests").once("value"),
        db.ref("admin/admins").once("value"),
      ]);
      const g = govSnap.val() || {}; const a = areaSnap.val() || {};
      const c = centerSnap.val() || {}; const u = userSnap.val() || {};
      const q = qSnap.val() || {}; const r = reqSnap.val() || {}; const adm = adminSnap.val() || {};
      setGovs(g); setAreas(a); setCenters(c); setUsers(u); setQuestions(q); setRequests(r); setAdmins(adm);
      setStats({ gov: Object.keys(g).length, area: Object.keys(a).length, center: Object.keys(c).length, user: Object.keys(u).length, req: Object.keys(r).length });
    } catch(e) { showToast("خطأ في التحميل"); }
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  // ── USERS ───────────────────────────────
type UsersView = "list" | "detail";
  const [usersView, setUsersView] = useState<UsersView>("list");
  const [selectedUser, setSelectedUser] = useState<{ id: string; data: any } | null>(null);

  function UsersSection() {
    const entries = Object.entries(users);
    if (usersView === "detail" && selectedUser) {
      const u = selectedUser.data;
      const initials = (u.name || u.firstName || "U").charAt(0).toUpperCase();
      const best = u.bestScore || 0; const tests = u.testsTaken || 0;
      const reg = u.registeredAt ? new Date(u.registeredAt).toLocaleDateString("ar-JO") : "-";
      return (
        <div>
          <BackBtn onClick={() => setUsersView("list")} />
          <Title>تفاصيل المستخدم</Title>
          <div style={{ background: "#fff", border: "1.5px solid #F0F1F3", borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: "#246BFD", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900 }}>{initials}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800 }}>{u.name || u.firstName || "مستخدم"} {u.lastName || ""}</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>{u.phone || selectedUser.id}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              <div style={{ background: "#F9FAFB", border: "1.5px solid #F0F1F3", padding: "10px 11px", borderRadius: 10, fontSize: 11, color: "#6B7280" }}>
                أفضل نتيجة<span style={{ display: "block", marginTop: 3, color: "#111827", fontWeight: 800, fontSize: 13 }}>{best}%</span>
              </div>
              <div style={{ background: "#F9FAFB", border: "1.5px solid #F0F1F3", padding: "10px 11px", borderRadius: 10, fontSize: 11, color: "#6B7280" }}>
                اختبارات<span style={{ display: "block", marginTop: 3, color: "#111827", fontWeight: 800, fontSize: 13 }}>{tests}</span>
              </div>
              <div style={{ background: "#F9FAFB", border: "1.5px solid #F0F1F3", padding: "10px 11px", borderRadius: 10, fontSize: 11, color: "#6B7280" }}>
                التسجيل<span style={{ display: "block", marginTop: 3, color: "#111827", fontWeight: 800, fontSize: 13 }}>{reg}</span>
              </div>
              <div style={{ background: "#F9FAFB", border: "1.5px solid #F0F1F3", padding: "10px 11px", borderRadius: 10, fontSize: 11, color: "#6B7280" }}>
                المحافظة<span style={{ display: "block", marginTop: 3, color: "#111827", fontWeight: 800, fontSize: 13 }}>{u.governorate || "-"}</span>
              </div>
            </div>
            <Btn variant="danger" onClick={async () => {
              if (!confirm("حذف المستخدم؟")) return;
              setLoading(true);
              try { await db.ref("users/" + selectedUser.id).remove(); showToast("تم الحذف"); await loadAll(); setUsersView("list"); }
              catch { showToast("حدث خطأ"); }
              setLoading(false);
            }}>حذف المستخدم</Btn>
          </div>
        </div>
      );
    }
    if (entries.length === 0) return <Empty icon="users" text="لا يوجد مستخدمون" />;
    return (
      <div>
        <BackBtn onClick={() => setView("menu")} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <Title>المستخدمين</Title>
          <span style={{ background: "#ECFDF3", color: "#16A34A", padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 800 }}>{entries.length}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map(([id, u]) => {
            const initials = (u.name || u.firstName || "U").charAt(0).toUpperCase();
            return (
              <div key={id} onClick={() => { setSelectedUser({ id, data: u }); setUsersView("detail"); }} style={{
                background: "#fff", border: "1.5px solid #F0F1F3", borderRadius: 16, padding: 14,
                display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "#246BFD", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 900, flexShrink: 0 }}>{initials}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{u.name || u.firstName || "مستخدم"}</div>
                  <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{u.phone || id}</div>
                </div>
                <i className="ph ph-caret-left" style={{ fontSize: 16, color: "#D1D5DB" }} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── QUESTIONS ───────────────────────────────
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
        category: qForm.category,
        mediaType: qForm.type,
        mediaUrl: qForm.type !== "text" ? qForm.mediaUrl.trim() : null,
        question: qForm.text.trim(),
        options: cleanOpts,
        correctAnswer: qForm.correct,
        explanation: qForm.explanation.trim() || null,
      };
      if (editingQ) await db.ref("questions/" + editingQ).update(payload);
      else await db.ref("questions").push(payload);
      showToast(editingQ ? "تم التحديث" : "تم الإضافة");
      await loadAll();
      setQSub("list");
    } catch { showToast("حدث خطأ"); }
    setLoading(false);
  }

  function QuestionsSection() {
    if (qSub === "menu") {
      return (
        <div>
          <BackBtn onClick={() => setView("menu")} />
          <Title>إدارة الأسئلة</Title>
          <Btn variant="primary" onClick={() => { resetQForm(); setQSub("form"); }}><i className="ph ph-plus" /> إضافة سؤال</Btn>
          <Btn variant="outline" onClick={() => setQSub("list")}><i className="ph ph-pencil-simple" /> تعديل أو حذف</Btn>
        </div>
      );
    }
    if (qSub === "form") {
      return (
        <div>
          <BackBtn onClick={() => { editingQ ? setQSub("list") : setQSub("menu"); }} />
          <Title>{editingQ ? "تعديل سؤال" : "إضافة سؤال جديد"}</Title>
          <Select label="القسم" value={qForm.category} onChange={v => setQForm(f => ({ ...f, category: v }))}>
            {Q_CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select label="نوع السؤال" value={qForm.type} onChange={v => setQForm(f => ({ ...f, type: v as any }))}>
            <option value="text">نصي</option><option value="image">صورة</option><option value="video">فيديو / GIF</option>
          </Select>
          {qForm.type !== "text" && (
            <Input label="رابط الوسائط" value={qForm.mediaUrl} onChange={v => setQForm(f => ({ ...f, mediaUrl: v }))} placeholder="https://..." />
          )}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700 }}>السؤال</label>
            <textarea value={qForm.text} onChange={e => setQForm(f => ({ ...f, text: e.target.value }))} rows={3} placeholder="نص السؤال..." style={{
              width: "100%", padding: "14px", border: "1.5px solid #F0F1F3", borderRadius: 12, background: "#fff", fontSize: 14, fontFamily: "inherit",
            }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700 }}>الخيارات</label>
            {qForm.options.map((opt, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <input value={opt} onChange={e => {
                  const opts = [...qForm.options]; opts[i] = e.target.value; setQForm(f => ({ ...f, options: opts }));
                }} placeholder={`الخيار ${i + 1}`} style={{ flex: 1, padding: "14px", border: "1.5px solid #F0F1F3", borderRadius: 12, fontSize: 14, fontFamily: "inherit" }} />
                <button onClick={() => {
                  const opts = qForm.options.filter((_, idx) => idx !== i);
                  setQForm(f => ({ ...f, options: opts, correct: Math.min(f.correct, opts.length - 1) }));
                }} style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid #F0F1F3", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#DC2626" }}><i className="ph ph-x" /></button>
              </div>
            ))}
            <button onClick={() => setQForm(f => ({ ...f, options: [...f.options, ""] }))} style={{
              width: "auto", padding: "8px 14px", borderRadius: 10, border: "1.5px solid #246BFD",
              background: "#fff", color: "#246BFD", fontSize: 12, fontWeight: 800, cursor: "pointer",
              fontFamily: "inherit",
            }}><i className="ph ph-plus" /> خيار</button>
          </div>
          <Select label="الإجابة الصحيحة" value={String(qForm.correct)} onChange={v => setQForm(f => ({ ...f, correct: parseInt(v) }))}>
            {qForm.options.map((_, i) => <option key={i} value={i}>الخيار {i + 1}</option>)}
          </Select>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700 }}>شرح الإجابة (اختياري)</label>
            <textarea value={qForm.explanation} onChange={e => setQForm(f => ({ ...f, explanation: e.target.value }))} rows={2} placeholder="شرح مختصر..." style={{
              width: "100%", padding: "14px", border: "1.5px solid #F0F1F3", borderRadius: 12, background: "#fff", fontSize: 14, fontFamily: "inherit",
            }} />
          </div>
          <Btn variant="primary" onClick={saveQ}><i className="ph ph-floppy-disk" /> {editingQ ? "تحديث" : "حفظ"}</Btn>
        </div>
      );
    }
    // list
    const qs = Object.entries(questions).filter(([_, q]) => !qCat || q.category === qCat).map(([id, q]) => ({ id, ...q }));
    return (
      <div>
        <BackBtn onClick={() => setQSub("menu")} />
        <Title>الأسئلة</Title>
        <div style={{ marginBottom: 12 }}>
          <select value={qCat} onChange={e => setQCat(e.target.value)} style={{
            width: "100%", padding: "12px", border: "1.5px solid #F0F1F3", borderRadius: 12,
            background: "#fff", fontSize: 14, fontFamily: "inherit",
          }}>
            <option value="">كل الأقسام</option>
            {Q_CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {qs.length === 0 ? <Empty icon="question" text="لا توجد أسئلة" /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {qs.map(q => (
              <div key={q.id} style={{ background: "#fff", border: "1.5px solid #F0F1F3", borderRadius: 12, padding: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, lineHeight: 1.5 }}>{q.question.substring(0, 60)}{q.question.length > 60 ? "..." : ""}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => {
                    setEditingQ(q.id);
                    setQForm({
                      category: q.category || Q_CATS[0],
                      type: q.mediaType || "text",
                      mediaUrl: q.mediaUrl || "",
                      text: q.question || "",
                      explanation: q.explanation || "",
                      correct: q.correctAnswer || 0,
                      options: q.options || ["", ""],
                    });
                    setQSub("form");
                  }} style={{ padding: "7px 12px", borderRadius: 10, border: "1.5px solid #246BFD", background: "#fff", color: "#246BFD", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}><i className="ph ph-pencil-simple" /> تعديل</button>
                  <button onClick={async () => {
                    if (!confirm("حذف السؤال؟")) return;
                    setLoading(true); try { await db.ref("questions/" + q.id).remove(); showToast("تم الحذف"); await loadAll(); }
                    catch { showToast("حدث خطأ"); } setLoading(false);
                  }} style={{ padding: "7px 12px", borderRadius: 10, border: "none", background: "#DC2626", color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}><i className="ph ph-trash" /> حذف</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── REQUESTS ───────────────────────────────
  function RequestsSection() {
    const entries = Object.entries(requests).sort((a, b) => (b[1].submittedAt || "").localeCompare(a[1].submittedAt || ""));
    return (
      <div>
        <BackBtn onClick={() => setView("menu")} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <Title>طلبات الانتساب</Title>
          <span style={{ background: "#FEF3C7", color: "#92400E", padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 800 }}>{entries.length}</span>
        </div>
        {entries.length === 0 ? <Empty icon="clipboard-text" text="لا توجد طلبات" /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {entries.map(([reqId, req]) => {
              const areasList = (req.areas || []).map((a: any) => a.name).join("، ");
              const daysList = (req.workingDays || []).join("، ");
              const status = req.status === "pending" ? { bg: "#FEF3C7", color: "#92400E", txt: "قيد المراجعة" }
                : req.status === "approved" ? { bg: "#ECFDF3", color: "#059669", txt: "تم النشر" }
                : { bg: "#FEF2F2", color: "#DC2626", txt: "مرفوض" };
              return (
                <div key={reqId} style={{ background: "#fff", border: "1.5px solid #F0F1F3", borderRadius: 16, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, flex: 1 }}>{req.name}</div>
                    <span style={{ background: status.bg, color: status.color, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, marginRight: 6, whiteSpace: "nowrap" }}>{status.txt}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12, color: "#6B7280", marginBottom: 8 }}>
                    <div><i className="ph ph-map-pin" style={{ color: "#246BFD" }} /> {req.governorateName || "-"}</div>
                    <div><i className="ph ph-buildings" style={{ color: "#246BFD" }} /> {areasList || "-"}</div>
                    <div><i className="ph ph-phone" style={{ color: "#246BFD" }} /> {req.phone || "-"}</div>
                    <div><i className="ph ph-star" style={{ color: "#F59E0B" }} /> {req.rating || 0}/5</div>
                  </div>
                  {req.address && <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}><i className="ph ph-map-pin" /> {req.address}</div>}
                  {daysList && <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}><i className="ph ph-calendar" /> {daysList}</div>}
                  {req.workingHours && <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 10 }}><i className="ph ph-clock" /> {req.workingHours}</div>}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button onClick={async () => {
                      if (!confirm(`نشر "${req.name}"؟`)) return;
                      setLoading(true);
                      try {
                        await db.ref("centers").push({
                          name: req.name, address: req.address, mapLink: req.mapLink, phone: req.phone,
                          rating: req.rating || 0, workingDays: req.workingDays || [], workingHours: req.workingHours || "",
                          areas: req.areas || [], areaId: req.areas?.[0]?.id || "", governorateId: req.governorateId || "",
                          publishedAt: new Date().toISOString(),
                        });
                        await db.ref("centerRequests/" + reqId).remove();
                        showToast("تم النشر"); await loadAll();
                      } catch { showToast("حدث خطأ"); }
                      setLoading(false);
                    }} style={{ padding: "7px 12px", borderRadius: 10, border: "none", background: "#16A34A", color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}><i className="ph ph-check-circle" /> نشر</button>
                    <button onClick={async () => {
                      if (!confirm(`رفض "${req.name}"؟`)) return;
                      try { await db.ref("centerRequests/" + reqId).remove(); showToast("تم الرفض"); await loadAll(); }
                      catch { showToast("حدث خطأ"); }
                    }} style={{ padding: "7px 12px", borderRadius: 10, border: "none", background: "#DC2626", color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}><i className="ph ph-x-circle" /> رفض</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── ADD FORMS ─────────────────────────────
type AddView = "gov" | "area" | "center";
  const [addV, setAddV] = useState<AddView>("gov");
  const [addGovName, setAddGovName] = useState("");
  const [addAreaGov, setAddAreaGov] = useState("");
  const [addAreaName, setAddAreaName] = useState("");
  const [addCenter, setAddCenter] = useState({ name: "", gov: "", area: "", address: "", phone: "", mapLink: "", rating: "0", hours: "", days: "" });

  useEffect(() => {
    if (view === "add-area") {
      const ids = Object.keys(govs);
      if (ids.length && !addAreaGov) setAddAreaGov(ids[0]);
    }
    if (view === "add-center") {
      const gids = Object.keys(govs); const aids = Object.keys(areas);
      if (gids.length && !addCenter.gov) setAddCenter(s => ({ ...s, gov: gids[0] }));
      if (aids.length && !addCenter.area) setAddCenter(s => ({ ...s, area: aids[0] }));
    }
  }, [view, govs, areas]);

  function AddSection() {
    if (view === "add-gov") {
      return (
        <div>
          <BackBtn onClick={() => setView("menu")} />
          <Title>إضافة محافظة</Title>
          <Input label="اسم المحافظة" value={addGovName} onChange={setAddGovName} placeholder="مثال: عمّان" />
          <Btn variant="primary" onClick={async () => {
            if (!addGovName.trim()) { showToast("أدخل اسم المحافظة"); return; }
            setLoading(true);
            try { await db.ref("governorates").push({ name: addGovName.trim() }); showToast("تم الإضافة"); setAddGovName(""); await loadAll(); setView("menu"); }
            catch { showToast("حدث خطأ"); }
            setLoading(false);
          }}><i className="ph ph-floppy-disk" /> حفظ</Btn>
        </div>
      );
    }
    if (view === "add-area") {
      const opts = Object.entries(govs).map(([id, g]) => <option key={id} value={id}>{g.name}</option>);
      return (
        <div>
          <BackBtn onClick={() => setView("menu")} />
          <Title>إضافة منطقة</Title>
          <Select label="المحافظة" value={addAreaGov} onChange={setAddAreaGov}>{opts}</Select>
          <Input label="اسم المنطقة" value={addAreaName} onChange={setAddAreaName} placeholder="مثال: خلدا" />
          <Btn variant="primary" onClick={async () => {
            if (!addAreaName.trim()) { showToast("أدخل اسم المنطقة"); return; }
            setLoading(true);
            try { await db.ref("areas").push({ name: addAreaName.trim(), governorateId: addAreaGov }); showToast("تم الإضافة"); setAddAreaName(""); await loadAll(); setView("menu"); }
            catch { showToast("حدث خطأ"); }
            setLoading(false);
          }}><i className="ph ph-floppy-disk" /> حفظ</Btn>
        </div>
      );
    }
    // add-center
    const gopts = Object.entries(govs).map(([id, g]) => <option key={id} value={id}>{g.name}</option>);
    const aopts = Object.entries(areas).map(([id, a]) => <option key={id} value={id}>{a.name}</option>);
    return (
      <div>
        <BackBtn onClick={() => setView("menu")} />
        <Title>إضافة مركز تدريب</Title>
        <Input label="الاسم" value={addCenter.name} onChange={v => setAddCenter(s => ({ ...s, name: v }))} placeholder="اسم المركز" />
        <Select label="المحافظة" value={addCenter.gov} onChange={v => setAddCenter(s => ({ ...s, gov: v }))}>{gopts}</Select>
        <Select label="المنطقة" value={addCenter.area} onChange={v => setAddCenter(s => ({ ...s, area: v }))}>{aopts}</Select>
        <Input label="العنوان" value={addCenter.address} onChange={v => setAddCenter(s => ({ ...s, address: v }))} placeholder="العنوان التفصيلي" />
        <Input label="رقم الهاتف" value={addCenter.phone} onChange={v => setAddCenter(s => ({ ...s, phone: v }))} placeholder="07XXXXXXXX" />
        <Input label="رابط الخريطة" value={addCenter.mapLink} onChange={v => setAddCenter(s => ({ ...s, mapLink: v }))} placeholder="Google Maps" />
        <Input label="التقييم (0-5)" value={addCenter.rating} onChange={v => setAddCenter(s => ({ ...s, rating: v }))} type="number" min="0" max="5" step="0.1" />
        <Input label="ساعات الدوام" value={addCenter.hours} onChange={v => setAddCenter(s => ({ ...s, hours: v }))} placeholder="8:00 ص - 4:00 م" />
        <Input label="أيام الدوام (مفصولة بفاصلة)" value={addCenter.days} onChange={v => setAddCenter(s => ({ ...s, days: v }))} placeholder="الأحد,الإثنين,الثلاثاء" />
        <Btn variant="primary" onClick={async () => {
          if (!addCenter.name.trim()) { showToast("أدخل اسم المركز"); return; }
          const days = addCenter.days.split(",").map(s => s.trim()).filter(Boolean);
          setLoading(true);
          try {
            await db.ref("centers").push({
              name: addCenter.name.trim(), governorateId: addCenter.gov, areaId: addCenter.area,
              address: addCenter.address.trim() || null, phone: addCenter.phone.trim() || null,
              mapLink: addCenter.mapLink.trim() || null, rating: parseFloat(addCenter.rating) || 0,
              workingHours: addCenter.hours.trim() || null, workingDays: days.length ? days : null,
            });
            showToast("تم الإضافة");
            setAddCenter({ name: "", gov: "", area: "", address: "", phone: "", mapLink: "", rating: "0", hours: "", days: "" });
            await loadAll(); setView("menu");
          } catch { showToast("حدث خطأ"); }
          setLoading(false);
        }}><i className="ph ph-floppy-disk" /> حفظ</Btn>
      </div>
    );
  }

  // ── EDIT & DELETE LISTS ─────────────────────────
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
          <Title>تعديل البيانات</Title>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div onClick={() => setEditType("governorates")} style={{ background: "#fff", border: "1.5px solid #F0F1F3", borderRadius: 16, padding: 18, textAlign: "center", fontWeight: 800, fontSize: 14, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>المحافظات</div>
            <div onClick={() => setEditType("areas")} style={{ background: "#fff", border: "1.5px solid #F0F1F3", borderRadius: 16, padding: 18, textAlign: "center", fontWeight: 800, fontSize: 14, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>المناطق</div>
            <div onClick={() => setEditType("centers")} style={{ background: "#fff", border: "1.5px solid #F0F1F3", borderRadius: 16, padding: 18, textAlign: "center", fontWeight: 800, fontSize: 14, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>مراكز التدريب</div>
          </div>
        </div>
      );
    }
    const data = editType === "governorates" ? govs : editType === "areas" ? areas : centers;
    const entries = Object.entries(data);
    if (entries.length === 0) return <Empty icon="folder-open" text="لا توجد بيانات" />;
    if (editId) {
      // Edit form
      const item = data[editId];
      if (editType === "governorates") {
        return (
          <div>
            <BackBtn onClick={() => setEditId(null)} />
            <Title>تعديل محافظة</Title>
            <Input label="الاسم" value={editGovName} onChange={setEditGovName} />
            <Btn variant="primary" onClick={async () => {
              setLoading(true);
              try { await db.ref("governorates/" + editId).update({ name: editGovName.trim() }); showToast("تم التحديث"); await loadAll(); setEditId(null); }
              catch { showToast("حدث خطأ"); }
              setLoading(false);
            }}><i className="ph ph-check" /> حفظ</Btn>
          </div>
        );
      }
      if (editType === "areas") {
        const opts = Object.entries(govs).map(([id, g]) => <option key={id} value={id}>{g.name}</option>);
        return (
          <div>
            <BackBtn onClick={() => setEditId(null)} />
            <Title>تعديل منطقة</Title>
            <Select label="المحافظة" value={editAreaGov} onChange={setEditAreaGov}>{opts}</Select>
            <Input label="الاسم" value={editAreaName} onChange={setEditAreaName} />
            <Btn variant="primary" onClick={async () => {
              setLoading(true);
              try { await db.ref("areas/" + editId).update({ name: editAreaName.trim(), governorateId: editAreaGov }); showToast("تم التحديث"); await loadAll(); setEditId(null); }
              catch { showToast("حدث خطأ"); }
              setLoading(false);
            }}><i className="ph ph-check" /> حفظ</Btn>
          </div>
        );
      }
      // centers
      const gopts = Object.entries(govs).map(([id, g]) => <option key={id} value={id}>{g.name}</option>);
      const aopts = Object.entries(areas).map(([id, a]) => <option key={id} value={id}>{a.name}</option>);
      return (
        <div>
          <BackBtn onClick={() => setEditId(null)} />
          <Title>تعديل مركز</Title>
          <Input label="الاسم" value={editCenter.name} onChange={v => setEditCenter(s => ({ ...s, name: v }))} />
          <Select label="المحافظة" value={editCenter.gov} onChange={v => setEditCenter(s => ({ ...s, gov: v }))}>{gopts}</Select>
          <Select label="المنطقة" value={editCenter.area} onChange={v => setEditCenter(s => ({ ...s, area: v }))}>{aopts}</Select>
          <Input label="العنوان" value={editCenter.address} onChange={v => setEditCenter(s => ({ ...s, address: v }))} />
          <Input label="الهاتف" value={editCenter.phone} onChange={v => setEditCenter(s => ({ ...s, phone: v }))} />
          <Input label="رابط الخريطة" value={editCenter.mapLink} onChange={v => setEditCenter(s => ({ ...s, mapLink: v }))} />
          <Input label="التقييم" value={editCenter.rating} onChange={v => setEditCenter(s => ({ ...s, rating: v }))} type="number" min="0" max="5" step="0.1" />
          <Input label="ساعات الدوام" value={editCenter.hours} onChange={v => setEditCenter(s => ({ ...s, hours: v }))} />
          <Input label="أيام الدوام (مفصولة)" value={editCenter.days} onChange={v => setEditCenter(s => ({ ...s, days: v }))} />
          <Btn variant="primary" onClick={async () => {
            const days = editCenter.days.split(",").map(s => s.trim()).filter(Boolean);
            setLoading(true);
            try {
              await db.ref("centers/" + editId).update({
                name: editCenter.name.trim(), governorateId: editCenter.gov, areaId: editCenter.area,
                address: editCenter.address.trim() || null, phone: editCenter.phone.trim() || null,
                mapLink: editCenter.mapLink.trim() || null, rating: parseFloat(editCenter.rating) || 0,
                workingHours: editCenter.hours.trim() || null, workingDays: days.length ? days : null,
              });
              showToast("تم التحديث"); await loadAll(); setEditId(null);
            } catch { showToast("حدث خطأ"); }
            setLoading(false);
          }}><i className="ph ph-check" /> حفظ</Btn>
        </div>
      );
    }
    return (
      <div>
        <BackBtn onClick={() => setEditType(null)} />
        <Title>تعديل {editType === "governorates" ? "المحافظات" : editType === "areas" ? "المناطق" : "مراكز التدريب"}</Title>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map(([id, item]) => (
            <ListItem key={id} label={item.name} actions={
              <button onClick={() => {
                setEditId(id);
                if (editType === "governorates") setEditGovName(item.name);
                else if (editType === "areas") { setEditAreaName(item.name); setEditAreaGov(item.governorateId || ""); }
                else {
                  setEditCenter({
                    name: item.name || "", gov: item.governorateId || "", area: item.areaId || "",
                    address: item.address || "", phone: item.phone || "", mapLink: item.mapLink || "",
                    rating: String(item.rating || 0), hours: item.workingHours || "", days: (item.workingDays || []).join(","),
                  });
                }
              }} style={{ padding: "7px 12px", borderRadius: 10, border: "1.5px solid #246BFD", background: "#fff", color: "#246BFD", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}><i className="ph ph-pencil-simple" /> تعديل</button>
            } />
          ))}
        </div>
      </div>
    );
  }

  // Delete section
  const [delType, setDelType] = useState<EditType | null>(null);

  // ── ADMINS ────────────────────────────
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  function AdminsSection() {
    const entries = Object.entries(admins);
    return (
      <div>
        <BackBtn onClick={() => setView("menu")} />
        <Title>إدارة المشرفين</Title>
        <div style={{ background: "#fff", border: "1.5px solid #F0F1F3", borderRadius: 16, padding: 16, marginBottom: 14 }}>
          <Input label="البريد الإلكتروني" value={adminEmail} onChange={v => setAdminEmail(v)} placeholder="admin@example.com" />
          <Input label="كلمة المرور" value={adminPassword} onChange={v => setAdminPassword(v)} type="password" placeholder="********" />
          <Btn variant="primary" onClick={async () => {
            if (!adminEmail.trim() || !adminPassword.trim()) { showToast("أدخل البريد وكلمة المرور"); return; }
            setLoading(true);
            try {
              await db.ref("admin/admins").push({ email: adminEmail.trim(), password: adminPassword.trim() });
              showToast("تم إضافة المشرف");
              setAdminEmail(""); setAdminPassword("");
              await loadAll();
            } catch { showToast("حدث خطأ"); }
            setLoading(false);
          }}><i className="ph ph-plus" /> إضافة مشرف</Btn>
        </div>
        {entries.length === 0 ? <Empty icon="user-plus" text="لا يوجد مشرفون" /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {entries.map(([id, a]) => (
              <ListItem key={id} label={a.email} actions={
                <button onClick={async () => {
                  if (!confirm(`حذف المشرف ${a.email}؟`)) return;
                  setLoading(true);
                  try { await db.ref("admin/admins/" + id).remove(); showToast("تم الحذف"); await loadAll(); }
                  catch { showToast("حدث خطأ"); }
                  setLoading(false);
                }} style={{ padding: "7px 12px", borderRadius: 10, border: "none", background: "#DC2626", color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}><i className="ph ph-trash" /> حذف</button>
              } />
            ))}
          </div>
        )}
      </div>
    );
  }
  function DeleteSection() {
    if (!delType) {
      return (
        <div>
          <BackBtn onClick={() => setView("menu")} />
          <Title>حذف البيانات</Title>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div onClick={() => setDelType("governorates")} style={{ background: "#fff", border: "1.5px solid #F0F1F3", borderRadius: 16, padding: 18, textAlign: "center", fontWeight: 800, fontSize: 14, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>المحافظات</div>
            <div onClick={() => setDelType("areas")} style={{ background: "#fff", border: "1.5px solid #F0F1F3", borderRadius: 16, padding: 18, textAlign: "center", fontWeight: 800, fontSize: 14, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>المناطق</div>
            <div onClick={() => setDelType("centers")} style={{ background: "#fff", border: "1.5px solid #F0F1F3", borderRadius: 16, padding: 18, textAlign: "center", fontWeight: 800, fontSize: 14, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>مراكز التدريب</div>
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
        <Title>حذف {delType === "governorates" ? "المحافظات" : delType === "areas" ? "المناطق" : "مراكز التدريب"}</Title>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map(([id, item]) => (
            <ListItem key={id} label={item.name} actions={
              <button onClick={async () => {
                if (!confirm(`حذف "${item.name}"؟`)) return;
                setLoading(true);
                try { await db.ref(delType + "/" + id).remove(); showToast("تم الحذف"); await loadAll(); }
                catch { showToast("حدث خطأ"); }
                setLoading(false);
              }} style={{ padding: "7px 12px", borderRadius: 10, border: "none", background: "#DC2626", color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}><i className="ph ph-trash" /> حذف</button>
            } />
          ))}
        </div>
      </div>
    );
  }

  // ── RENDER ──────────────────────────────────────────
type RenderView = View;
  const renderView = (): React.ReactNode => {
    switch (view) {
      case "menu": return (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <StatCard label="محافظة" value={stats.gov} />
            <StatCard label="منطقة" value={stats.area} />
            <StatCard label="مركز تدريب" value={stats.center} />
            <StatCard label="مستخدم" value={stats.user} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Card icon="users" color="blue" title="إدارة المستخدمين" desc="عرض وحذف المستخدمين المسجلين" onClick={() => setView("users")} />
            <Card icon="question" color="gold" title="إدارة الأسئلة" desc="إضافة، تعديل، حذف أسئلة الفحص" onClick={() => { setQSub("menu"); setView("questions"); }} />
            <Card icon="clipboard-text" color="purple" title="طلبات الانتساب" desc="مراجعة ونشر أو رفض طلبات المراكز" onClick={() => setView("requests")} />
            <Card icon="map-trifold" color="cyan" title="إضافة محافظة" desc="إنشاء محافظة جديدة" onClick={() => setView("add-gov")} />
            <Card icon="map-pin" color="blue" title="إضافة منطقة" desc="ربط منطقة بمحافظة" onClick={() => setView("add-area")} />
            <Card icon="buildings" color="gold" title="إضافة مركز" desc="إضافة مركز تدريب جديد" onClick={() => setView("add-center")} />
            <Card icon="pencil-simple" color="blue" title="تعديل البيانات" desc="تعديل المحافظات والمناطق والمراكز" onClick={() => { setEditType(null); setView("edit-list"); }} />
            <Card icon="trash" color="red" title="حذف البيانات" desc="إزالة المحافظات أو المناطق أو المراكز" onClick={() => { setDelType(null); setView("delete-list"); }} />
            <Card icon="user-plus" color="purple" title="إدارة المشرفين" desc="إضافة أو حذف مشرفين" onClick={() => { setAdminEmail(""); setAdminPassword(""); setView("admins"); }} />
          </div>
        </div>
      );
      case "users": return <UsersSection />;
      case "questions": return <QuestionsSection />;
      case "requests": return <RequestsSection />;
      case "add-gov": case "add-area": case "add-center": return <AddSection />;
      case "edit-list": return <EditListSection />;
      case "delete-list": return <DeleteSection />;
      case "admins": return <AdminsSection />;
      default: return null;
    }
  };

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: "#F9FAFB", direction: "rtl" }}>
      {/* Header */}
      <div style={{
        background: "#fff", borderBottom: "1.5px solid #F0F1F3", padding: "14px 16px",
        display: "flex", flexDirection: "row", alignItems: "center", gap: 12, flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          width: 40, height: 40, borderRadius: 12, border: "1.5px solid #E5E7EB",
          background: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0,
        }}><i className="ph ph-arrow-right" style={{ fontSize: 19, color: "#246BFD" }} /></button>
        <div style={{ flex: 1, textAlign: "right" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#111827" }}>لوحة التحكم</div>
          <div style={{ fontSize: 12, color: "#9CA3AF" }}>JO Driver</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: "1 1 0", minHeight: 0, overflowY: "auto", padding: "14px 14px" }}>
        {renderView()}
        <div style={{ height: 16 }} />
      </div>

      {/* Toast & Loading */}
      <Toast msg={toast} />
      {loading && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(249,250,251,0.95)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 999,
        }}>
          <div style={{
            width: 48, height: 48, border: "3.5px solid #F0F1F3", borderTopColor: "#246BFD",
            borderRadius: "50%", animation: "spin .8s linear infinite", marginBottom: 14,
          }} />
          <div style={{ fontWeight: 800, color: "#6B7280", fontSize: 14 }}>جارٍ التحميل...</div>
        </div>
      )}
    </div>
  );
}
