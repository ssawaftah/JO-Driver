import { db, auth } from "../lib/firebase.js";
import { handleAdminLogout } from "../app.js";

const Q_CATS = [
  "قواعد السير والمرور",
  "الميكانيك",
  "السلامة على الطريق",
  "أسعافات أولية",
  "الشواخص والخطوط والعلامات",
  "المخالفات واحتساب النقاط",
  "الصور المتحركة",
];

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

const ALL_DAYS_SHORT = ["س","ح","ن","ث","ر","خ","ج"];
const ALL_DAYS_FULL = ["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];

export function render(container, ctx) {
  let view = "menu";
  let toast = "";
  let loading = false;
  
  // Data state
  let stats = { gov: 0, area: 0, center: 0, user: 0, q: 0, req: 0, reviews: 0, guide: 0 };
  let users = {};
  let questions = {};
  let requests = {};
  let governorates = {};
  let areas = {};
  let centers = {};
  let reviews = {};
  let guideSections = {};
  
  // View specific state
  let qSub = "menu"; // menu | list | form
  let qSearch = "";
  let qCat = "";
  let editingQ = null;
  let qForm = { category: Q_CATS[0], type: "text", mediaUrl: "", text: "", explanation: "", correct: 0, options: ["", ""] };

  let geoExpandedGov = null;
  let showAddGovModal = false;
  let addGovName = "";
  let editGovId = null;
  let editGovName = "";
  let geoAddAreaGovId = null;
  let addAreaName = "";
  let editAreaId = null;
  let editAreaName = "";
  let editAreaGov = "";

  let showAddCenterModal = false;
  const DEFAULT_SCHEDULE = ALL_DAYS_FULL.map((_, i) => ({ closed: i === 6, from: "08:00", to: "16:00" }));
  const DEFAULT_CENTER_FORM = {
    name: "", address: "", mapLink: "", phone: "", whatsapp: "",
    imageUrl: "", description: "", rating: "", reviewCount: "",
    govId: "", areaIds: [], schedule: DEFAULT_SCHEDULE,
  };
  let addCF = JSON.parse(JSON.stringify(DEFAULT_CENTER_FORM));
  let addMapsFetching = false;
  let addFetchError = "";
  let addFetchDone = false;
  let showAddCFAreaModal = false;

  let editId = null;
  let editCF = JSON.parse(JSON.stringify(DEFAULT_CENTER_FORM));
  let showEditCFArea = false;

  let reviewingReqId = null;
  let reviewingData = null;
  let reviewName = "";
  let reviewAddress = "";
  let reviewPhone = "";
  let reviewWhatsapp = "";
  let reviewMapLink = "";
  let reviewImageUrl = "";
  let reviewDesc = "";
  let reviewRating = "";
  let reviewReviewCount = "";
  let reviewGovId = "";
  let reviewAreaIds = [];
  let reviewSchedule = JSON.parse(JSON.stringify(DEFAULT_SCHEDULE));
  let reviewPromoted = false;
  let showAddAreaModal = false;

  let guideEditorOpen = false;
  let editingGuideId = null;
  let guideForm = { title: "", icon: "list-numbers", iconColor: "#A855F7", iconBg: "rgba(168,85,247,0.15)", type: "steps", items: [] };

  let footerSponsors = {};
  let footerSocial = {};
  let footerAbout = "";
  let sponsorName = "";
  let sponsorLink = "";
  let socialKey = "facebook";
  let socialUrl = "";

  let revSearch = "";

  function showToast(msg) {
    toast = msg;
    renderAll();
    setTimeout(() => {
      if (toast === msg) {
        toast = "";
        renderAll();
      }
    }, 3000);
  }

  async function loadAll() {
    setLoading(true);
    try {
      const [u, q, r, g, a, c, rev, gs] = await Promise.all([
        db.ref("users").once("value"),
        db.ref("questions").once("value"),
        db.ref("centerRequests").once("value"),
        db.ref("governorates").once("value"),
        db.ref("areas").once("value"),
        db.ref("centers").once("value"),
        db.ref("reviews").once("value"),
        db.ref("guide/sections").once("value"),
      ]);
      users = u.val() || {};
      questions = q.val() || {};
      requests = r.val() || {};
      governorates = g.val() || {};
      areas = a.val() || {};
      centers = c.val() || {};
      reviews = rev.val() || {};
      guideSections = gs.val() || {};
      
      stats = {
        gov: Object.keys(governorates).length,
        area: Object.keys(areas).length,
        center: Object.keys(centers).length,
        user: Object.keys(users).length,
        q: Object.keys(questions).length,
        req: Object.keys(requests).length,
        reviews: Object.keys(reviews).length,
        guide: Object.keys(guideSections).length,
      };
    } catch (e) {
      console.error(e);
      showToast("فشل تحميل البيانات");
    }
    setLoading(false);
  }

  function setLoading(val) {
    loading = val;
    renderAll();
  }

  // Helper UI functions
  function Card({ icon, color, colorBg, iconColor, title, desc, onClick, count }) {
    const btn = document.createElement("button");
    btn.style.cssText = `width: 100%; background: ${C.surface}; border: 1px solid ${C.border}; borderRadius: 14px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; fontFamily: inherit; textAlign: right; boxShadow: 0 1px 3px rgba(0,0,0,0.04); transition: all .2s;`;
    btn.addEventListener("mouseenter", () => {
      btn.style.borderColor = color;
      btn.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.borderColor = C.border;
      btn.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
    });
    btn.addEventListener("click", onClick);

    btn.innerHTML = `
      <div style="width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; background: ${colorBg}; color: ${iconColor}; display: flex; align-items: center; justify-content: center; font-size: 20px;">
        <i class="ph ph-${icon}"></i>
      </div>
      <div style="flex: 1; min-width: 0;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 14px; font-weight: 800; color: ${C.text};">${title}</span>
          ${count !== undefined ? `<span style="font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 20px; background: ${colorBg}; color: ${iconColor};">${count}</span>` : ""}
        </div>
        <div style="font-size: 12px; color: ${C.textSec}; margin-top: 2px; line-height: 1.5;">${desc}</div>
      </div>
      <i class="ph ph-caret-left" style="font-size: 16px; color: ${C.textLight}; flex-shrink: 0;"></i>
    `;
    return btn;
  }

  function BackBtn({ onClick }) {
    const btn = document.createElement("button");
    btn.style.cssText = `background: none; border: none; color: ${C.primary}; cursor: pointer; fontFamily: inherit; fontSize: 13px; fontWeight: 800; display: flex; align-items: center; gap: 6px; marginBottom: 16px; padding: 4px 0;`;
    btn.innerHTML = `<i class="ph ph-arrow-right" style="font-size: 16px;"></i>رجوع`;
    btn.addEventListener("click", onClick);
    return btn;
  }

  function SectionTitle({ title, count }) {
    const div = document.createElement("div");
    div.style.cssText = "display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;";
    div.innerHTML = `
      <div style="font-size: 18px; font-weight: 900; color: ${C.text}; letter-spacing: -0.2px;">${title}</div>
      ${count !== undefined ? `<span style="background: ${C.surface2}; color: ${C.primary}; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 800; border: 1px solid ${C.border};">${count}</span>` : ""}
    `;
    return div;
  }

  function Btn({ children, onClick, variant = "primary", style = {} }) {
    const variants = {
      primary: { bg: C.primary, color: "#fff", border: "none", hoverBg: C.primaryDark },
      outline: { bg: "transparent", color: C.primary, border: `1.5px solid ${C.primary}`, hoverBg: "#E8F0FE" },
      danger: { bg: C.red, color: "#fff", border: "none", hoverBg: "#B91C1C" },
      ghost: { bg: C.bg, color: C.textSec, border: `1px solid ${C.border}`, hoverBg: C.surface2 },
    };
    const colors = variants[variant];
    const btn = document.createElement("button");
    Object.assign(btn.style, {
      width: "100%", border: colors.border, background: colors.bg, color: colors.color,
      display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
      fontFamily: "inherit", fontSize: "14px", fontWeight: "800",
      padding: "12px", borderRadius: "12px", cursor: "pointer", transition: "all .15s",
      ...style
    });
    btn.innerHTML = children;
    btn.addEventListener("mouseenter", () => { btn.style.background = colors.hoverBg; });
    btn.addEventListener("mouseleave", () => { btn.style.background = colors.bg; });
    btn.addEventListener("click", onClick);
    return btn;
  }

  function Input({ label, value, onChange, placeholder, type = "text", ...rest }) {
    const div = document.createElement("div");
    div.style.marginBottom = "14px";
    div.innerHTML = `<label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 700; color: ${C.textSec};">${label}</label>`;
    const input = document.createElement("input");
    input.type = type;
    input.value = value;
    input.placeholder = placeholder || "";
    input.className = "admin-field";
    input.style.cssText = `width: 100%; padding: 12px 14px; border: 1.5px solid ${C.border}; borderRadius: 12px; background: ${C.surface2}; fontSize: 14px; fontFamily: inherit; color: ${C.text}; outline: none;`;
    input.addEventListener("input", (e) => onChange(e.target.value));
    div.appendChild(input);
    return div;
  }

  function TextArea({ label, value, onChange, placeholder, rows = 3 }) {
    const div = document.createElement("div");
    div.style.marginBottom = "14px";
    div.innerHTML = `<label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 700; color: ${C.textSec};">${label}</label>`;
    const area = document.createElement("textarea");
    area.value = value;
    area.placeholder = placeholder || "";
    area.rows = rows;
    area.className = "admin-field";
    area.style.cssText = `width: 100%; padding: 12px 14px; border: 1.5px solid ${C.border}; borderRadius: 12px; background: ${C.surface2}; fontSize: 14px; fontFamily: inherit; color: ${C.text}; outline: none; resize: vertical;`;
    area.addEventListener("input", (e) => onChange(e.target.value));
    div.appendChild(area);
    return div;
  }

  function Select({ label, value, onChange, options }) {
    const div = document.createElement("div");
    div.style.marginBottom = "14px";
    div.innerHTML = `<label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 700; color: ${C.textSec};">${label}</label>`;
    const select = document.createElement("select");
    select.className = "admin-field";
    select.style.cssText = `width: 100%; padding: 12px 14px; border: 1.5px solid ${C.border}; borderRadius: 12px; background: ${C.surface2}; fontSize: 14px; fontFamily: inherit; color: ${C.text}; appearance: none; backgroundImage: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); backgroundRepeat: no-repeat; backgroundPosition: left 14px center;`;
    options.forEach(opt => {
      const o = document.createElement("option");
      o.value = opt.value;
      o.textContent = opt.label;
      if (opt.value === value) o.selected = true;
      select.appendChild(o);
    });
    select.addEventListener("change", (e) => onChange(e.target.value));
    div.appendChild(select);
    return div;
  }

  function StatCard({ label, value, icon, color, bg }) {
    const div = document.createElement("div");
    div.style.cssText = `background: ${C.surface}; border: 1px solid ${C.border}; borderRadius: 16px; padding: 16px; boxShadow: 0 1px 3px rgba(0,0,0,0.04); display: flex; align-items: center; gap: 12px;`;
    div.innerHTML = `
      <div style="width: 44px; height: 44px; border-radius: 12px; background: ${bg}; color: ${color}; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">
        <i class="ph ph-${icon}"></i>
      </div>
      <div>
        <div style="font-size: 24px; font-weight: 900; color: ${C.text}; line-height: 1;">${value}</div>
        <div style="font-size: 12px; color: ${C.textSec}; margin-top: 4px; font-weight: 700;">${label}</div>
      </div>
    `;
    return div;
  }

  function ListItem({ label, sub, actions }) {
    const div = document.createElement("div");
    div.style.cssText = `background: ${C.surface}; border: 1px solid ${C.border}; borderRadius: 14px; padding: 14px; marginBottom: 8px; display: flex; align-items: center; justify-content: space-between; gap: 10px; boxShadow: 0 1px 2px rgba(0,0,0,0.03);`;
    
    const content = document.createElement("div");
    content.style.cssText = "flex: 1; min-width: 0;";
    content.innerHTML = `
      <span style="font-size: 13px; font-weight: 700; color: ${C.text}; display: block;">${label}</span>
      ${sub ? `<span style="font-size: 12px; color: ${C.textSec}; margin-top: 2px; display: block;">${sub}</span>` : ""}
    `;
    div.appendChild(content);
    
    const acts = document.createElement("div");
    acts.style.cssText = "display: flex; gap: 6px; flex-shrink: 0;";
    if (Array.isArray(actions)) {
      actions.forEach(a => acts.appendChild(a));
    } else {
      acts.appendChild(actions);
    }
    div.appendChild(acts);
    
    return div;
  }

  function Empty({ icon, text }) {
    const div = document.createElement("div");
    div.style.cssText = `text-align: center; padding: 50px 20px; color: ${C.textLight};`;
    div.innerHTML = `
      <i class="ph ph-${icon}" style="font-size: 48px; margin-bottom: 14px; opacity: 0.15; display: block;"></i>
      <div style="font-size: 14px; font-weight: 600;">${text}</div>
    `;
    return div;
  }

  function ToastEl({ msg }) {
    if (!msg) return null;
    const div = document.createElement("div");
    div.style.cssText = `position: fixed; top: 70px; left: 50%; transform: translateX(-50%); background: ${C.surface2}; color: ${C.text}; padding: 12px 20px; borderRadius: 14px; fontSize: 13px; fontWeight: 700; textAlign: center; zIndex: 200; whiteSpace: nowrap; boxShadow: 0 4px 16px rgba(0,0,0,0.1); border: 1px solid ${C.border};`;
    div.textContent = msg;
    return div;
  }

  function LoadingEl() {
    if (!loading) return null;
    const div = document.createElement("div");
    div.style.cssText = "position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: flex; flexDirection: column; align-items: center; justify-content: center; z-index: 999;";
    div.innerHTML = `
      <div style="width: 44px; height: 44px; border: 3px solid ${C.border}; border-top-color: ${C.primary}; border-radius: 50%; animation: spin .8s linear infinite; margin-bottom: 12px;"></div>
      <div style="font-weight: 800; color: ${C.textSec}; font-size: 14px;">جارٍ التحميل...</div>
    `;
    return div;
  }

  function renderMenu() {
    const content = document.createElement("div");
    
    // Header
    const header = document.createElement("div");
    header.style.cssText = "display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;";
    header.innerHTML = `
      <div>
        <div style="font-size: 20px; font-weight: 900; color: ${C.text};">JO Driver</div>
        <div style="font-size: 12px; color: ${C.textSec}; font-weight: 600;">لوحة التحكم</div>
      </div>
      <div style="width: 40px; height: 40px; border-radius: 12px; background: ${C.primary}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px;">
        <i class="ph ph-steering-wheel"></i>
      </div>
    `;
    content.appendChild(header);

    // Stats
    const statsGrid = document.createElement("div");
    statsGrid.style.cssText = "display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px;";
    statsGrid.appendChild(StatCard({ label: "محافظة", value: stats.gov, icon: "map-trifold", color: C.cyan, bg: C.cyanLight }));
    statsGrid.appendChild(StatCard({ label: "منطقة", value: stats.area, icon: "map-pin", color: C.primary, bg: C.primaryLight }));
    statsGrid.appendChild(StatCard({ label: "مركز", value: stats.center, icon: "buildings", color: C.gold, bg: C.goldLight }));
    statsGrid.appendChild(StatCard({ label: "مستخدم", value: stats.user, icon: "users", color: C.green, bg: C.greenLight }));
    content.appendChild(statsGrid);

    // Management section
    const mgmtTitle = document.createElement("div");
    mgmtTitle.style.cssText = `font-size: 11px; font-weight: 800; color: ${C.textLight}; margin-bottom: 12px; padding: 0 4px; letter-spacing: 0.5px;`;
    mgmtTitle.textContent = "الإدارة";
    content.appendChild(mgmtTitle);

    const mgmtGrid = document.createElement("div");
    mgmtGrid.style.cssText = "display: flex; flex-direction: column; gap: 10px;";
    mgmtGrid.appendChild(Card({ icon: "users", color: C.primary, colorBg: C.primaryLight, iconColor: C.primary, title: "المستخدمين", desc: "عرض وحذف المستخدمين", onClick: () => { view = "users"; renderAll(); }, count: stats.user }));
    mgmtGrid.appendChild(Card({ icon: "question", color: C.gold, colorBg: C.goldLight, iconColor: C.gold, title: "الأسئلة", desc: "إضافة، تعديل، حذف", onClick: () => { qSub = "menu"; view = "questions"; renderAll(); }, count: stats.q }));
    mgmtGrid.appendChild(Card({ icon: "book-open-text", color: C.purple, colorBg: C.purpleLight, iconColor: C.purple, title: "دليل المستخدم", desc: "إدارة أقسام الدليل", onClick: () => { guideEditorOpen = false; editingGuideId = null; view = "guide-admin"; renderAll(); }, count: stats.guide }));
    mgmtGrid.appendChild(Card({ icon: "clipboard-text", color: C.pink, colorBg: C.pinkLight, iconColor: C.pink, title: "طلبات الانتساب", desc: "مراجعة ونشر أو رفض", onClick: () => { view = "requests"; renderAll(); }, count: stats.req }));
    mgmtGrid.appendChild(Card({ icon: "layout", color: C.cyan, colorBg: C.cyanLight, iconColor: C.cyan, title: "إدارة الفوتر", desc: "الراعي، سوشيال، من نحن", onClick: () => { loadFooter(); view = "footer-admin"; renderAll(); } }));
    mgmtGrid.appendChild(Card({ icon: "star", color: C.gold, colorBg: C.goldLight, iconColor: C.gold, title: "آراء الزوار", desc: "سجل التقييمات", onClick: () => { view = "reviews"; renderAll(); }, count: stats.reviews }));
    content.appendChild(mgmtGrid);

    // Geographic section
    const geoTitle = document.createElement("div");
    geoTitle.style.cssText = `font-size: 11px; font-weight: 800; color: ${C.textLight}; margin-top: 20px; margin-bottom: 12px; padding: 0 4px; letter-spacing: 0.5px;`;
    geoTitle.textContent = "البيانات الجغرافية";
    content.appendChild(geoTitle);

    const geoGrid = document.createElement("div");
    geoGrid.style.cssText = "display: flex; flex-direction: column; gap: 10px;";
    geoGrid.appendChild(Card({ icon: "map-trifold", color: C.cyan, colorBg: C.cyanLight, iconColor: C.cyan, title: "إدارة المعلومات الجغرافية", desc: "المحافظات والمناطق", onClick: () => { view = "geo-manage"; renderAll(); } }));
    geoGrid.appendChild(Card({ icon: "buildings", color: C.gold, colorBg: C.goldLight, iconColor: C.gold, title: "إدارة المراكز", desc: "عرض، تعديل، حذف، تعليق النشر", onClick: () => { view = "centers-manage"; renderAll(); }, count: Object.keys(centers).length }));
    geoGrid.appendChild(Card({ icon: "crown-simple", color: C.gold, colorBg: C.goldLight, iconColor: C.gold, title: "المراكز المميزة", desc: "إدارة المراكز المميزة", onClick: () => { view = "featured-centers"; renderAll(); } }));
    content.appendChild(geoGrid);

    // Logout
    const logoutBtn = document.createElement("div");
    logoutBtn.style.marginTop = "24px";
    logoutBtn.appendChild(Btn({ children: '<i class="ph ph-sign-out"></i> تسجيل الخروج', variant: "outline", onClick: handleAdminLogout }));
    content.appendChild(logoutBtn);

    return content;
  }

  function renderAll() {
    container.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `display: flex; flex-direction: column; min-height: 100dvh; background: ${C.bg}; direction: rtl;`;
    
    const body = document.createElement("div");
    body.style.cssText = "flex: 1 1 0; min-height: 0; overflow-y: auto; padding: 16px 14px;";
    
    let viewEl;
    switch(view) {
      case "menu": viewEl = renderMenu(); break;
      case "users": viewEl = renderUsers(); break;
      case "questions": viewEl = renderQuestions(); break;
      case "requests": viewEl = renderRequests(); break;
      case "geo-manage": viewEl = renderGeoManage(); break;
      case "centers-manage": viewEl = renderCentersManage(); break;
      case "add-center": viewEl = renderAddCenter(); break;
      case "edit-center": viewEl = renderEditCenter(); break;
      case "featured-centers": viewEl = renderFeaturedCenters(); break;
      case "guide-admin": viewEl = renderGuideAdmin(); break;
      case "footer-admin": viewEl = renderFooterAdmin(); break;
      case "reviews": viewEl = renderReviewsView(); break;
    }
    
    if (viewEl) body.appendChild(viewEl);
    
    const spacer = document.createElement("div");
    spacer.style.height = "20px";
    body.appendChild(spacer);
    
    wrapper.appendChild(body);
    
    const t = ToastEl({ msg: toast });
    if (t) wrapper.appendChild(t);
    
    const l = LoadingEl();
    if (l) wrapper.appendChild(l);
    
    container.appendChild(wrapper);
  }

  // View stubs (will be filled in following steps)
  function renderUsers() {
    const content = document.createElement("div");
    content.appendChild(BackBtn({ onClick: () => { view = "menu"; renderAll(); } }));
    content.appendChild(SectionTitle({ title: "المستخدمين", count: stats.user }));
    
    const userList = Object.entries(users).sort((a, b) => (b[1].registeredAt || "").localeCompare(a[1].registeredAt || ""));
    
    if (userList.length === 0) {
      content.appendChild(Empty({ icon: "users", text: "لا يوجد مستخدمين" }));
    } else {
      const listDiv = document.createElement("div");
      listDiv.style.cssText = "display: flex; flex-direction: column; gap: 8px;";
      userList.forEach(([id, u]) => {
        const delBtn = document.createElement("button");
        delBtn.style.cssText = `width: 28px; height: 28px; border-radius: 7px; border: none; background: ${C.redLight}; color: ${C.red}; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;`;
        delBtn.innerHTML = `<i class="ph ph-trash" style="font-size: 14px;"></i>`;
        delBtn.addEventListener("click", async () => {
          if (!confirm(`حذف المستخدم "${u.name}"؟`)) return;
          setLoading(true);
          try {
            await db.ref("users/" + id).remove();
            showToast("تم الحذف");
            await loadAll();
          } catch (e) {
            showToast("حدث خطأ");
          }
          setLoading(false);
        });
        
        const item = ListItem({
          label: u.name || "مستخدم بدون اسم",
          sub: `${u.phone || "-"} · ${u.email || "-"}`,
          actions: delBtn
        });
        listDiv.appendChild(item);
      });
      content.appendChild(listDiv);
    }
    return content;
  }
  function renderQuestions() {
    const content = document.createElement("div");

    function resetQForm() {
      qForm = { category: Q_CATS[0], type: "text", mediaUrl: "", text: "", explanation: "", correct: 0, options: ["", ""] };
      editingQ = null;
    }

    async function saveQ() {
      if (!qForm.text.trim()) { showToast("أدخل نص السؤال"); return; }
      const cleanOpts = qForm.options.map(o => o.trim()).filter(o => o);
      if (cleanOpts.length < 2) { showToast("أدخل خيارين على الأقل"); return; }
      
      setLoading(true);
      try {
        const payload = {
          category: qForm.category,
          mediaType: qForm.type,
          mediaUrl: qForm.type === "text" ? null : (qForm.mediaUrl.trim() || null),
          question: qForm.text.trim(),
          options: cleanOpts,
          correctAnswer: qForm.correct,
          explanation: qForm.explanation.trim() || null,
        };
        if (editingQ) await db.ref("questions/" + editingQ).update(payload);
        else await db.ref("questions").push(payload);
        showToast(editingQ ? "تم التحديث" : "تم الإضافة");
        await loadAll();
        qSub = "list";
        renderAll();
      } catch (e) {
        showToast("حدث خطأ");
      }
      setLoading(false);
    }

    if (qSub === "menu") {
      content.appendChild(BackBtn({ onClick: () => { view = "menu"; renderAll(); } }));
      content.appendChild(SectionTitle({ title: "إدارة الأسئلة", count: stats.q }));
      
      const catStats = Q_CATS.map(cat => {
        const count = Object.values(questions).filter(q => q.category === cat).length;
        return { cat, count };
      });

      const statsBox = document.createElement("div");
      statsBox.style.cssText = `background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 14px; padding: 14px; margin-bottom: 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);`;
      statsBox.innerHTML = `<div style="font-size: 12px; font-weight: 800; color: ${C.textSec}; margin-bottom: 10px;">توزيع الأسئلة بالأقسام</div>`;
      
      const listWrapper = document.createElement("div");
      listWrapper.style.cssText = "display: flex; flex-direction: column; gap: 6px;";
      catStats.forEach(({ cat, count }) => {
        const row = document.createElement("div");
        row.style.cssText = "display: flex; align-items: center; gap: 8px;";
        const pct = stats.q ? (count / stats.q) * 80 : 0;
        row.innerHTML = `
          <div style="font-size: 11px; font-weight: 700; color: ${C.text}; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${cat}</div>
          <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
            <div style="width: 80px; height: 6px; border-radius: 3px; background: ${C.bg}; overflow: hidden;">
              <div style="width: ${pct}px; height: 100%; background: ${C.primary}; border-radius: 3px;"></div>
            </div>
            <span style="font-size: 11px; font-weight: 800; color: ${C.primary}; min-width: 20px; text-align: left;">${count}</span>
          </div>
        `;
        listWrapper.appendChild(row);
      });
      statsBox.appendChild(listWrapper);
      content.appendChild(statsBox);

      const btnWrap = document.createElement("div");
      btnWrap.style.cssText = "display: flex; flex-direction: column; gap: 10px;";
      btnWrap.appendChild(Btn({ children: '<i class="ph ph-plus"></i> إضافة سؤال جديد', onClick: () => { resetQForm(); qSub = "form"; renderAll(); } }));
      btnWrap.appendChild(Btn({ children: '<i class="ph ph-list"></i> عرض وتعديل الأسئلة', variant: "outline", onClick: () => { qSub = "list"; renderAll(); } }));
      content.appendChild(btnWrap);

    } else if (qSub === "form") {
      content.appendChild(BackBtn({ onClick: () => { if (editingQ) qSub = "list"; else qSub = "menu"; renderAll(); } }));
      content.appendChild(SectionTitle({ title: editingQ ? "تعديل السؤال" : "سؤال جديد" }));

      const card = document.createElement("div");
      card.style.cssText = `background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 14px; padding: 16px; margin-bottom: 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);`;
      card.innerHTML = `<div style="font-size: 12px; font-weight: 800; color: ${C.primary}; margin-bottom: 10px; padding: 4px 10px; background: ${C.primaryLight}; border-radius: 8px; display: inline-block;">المعلومات الأساسية</div>`;
      
      card.appendChild(Select({ label: "القسم", value: qForm.category, options: Q_CATS.map(c => ({ label: c, value: c })), onChange: v => { qForm.category = v; renderAll(); } }));
      card.appendChild(Select({ label: "نوع السؤال", value: qForm.type, options: [
        { label: "نصي (بدون وسائط)", value: "text" },
        { label: "صورة", value: "image" },
        { label: "صور متحركة (GIF)", value: "gif" },
        { label: "فيديو", value: "video" }
      ], onChange: v => { qForm.type = v; renderAll(); } }));

      if (qForm.type !== "text") {
        card.appendChild(Input({ label: "رابط الوسائط", value: qForm.mediaUrl, placeholder: "https://...", onChange: v => { qForm.mediaUrl = v; renderAll(); } }));
        if (qForm.mediaUrl.trim()) {
          const preview = document.createElement("div");
          preview.style.cssText = `margin-bottom: 14px; border-radius: 10px; overflow: hidden; border: 1px solid ${C.border}; background: ${C.bg};`;
          if (qForm.type === "video") {
            preview.innerHTML = `<video src="${qForm.mediaUrl}" controls style="width: 100%; height: 160px; object-fit: cover;"></video>`;
          } else {
            preview.innerHTML = `<img src="${qForm.mediaUrl}" alt="preview" style="width: 100%; height: 160px; object-fit: cover;">`;
          }
          card.appendChild(preview);
        }
      }
      card.appendChild(TextArea({ label: "نص السؤال", value: qForm.text, placeholder: "اكتب السؤال هنا...", rows: 3, onChange: v => { qForm.text = v; } }));
      content.appendChild(card);

      const optsCard = document.createElement("div");
      optsCard.style.cssText = `background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 14px; padding: 16px; margin-bottom: 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);`;
      optsCard.innerHTML = `<div style="font-size: 12px; font-weight: 800; color: ${C.primary}; margin-bottom: 10px; padding: 4px 10px; background: ${C.primaryLight}; border-radius: 8px; display: inline-block;">الخيارات</div>`;
      
      qForm.options.forEach((opt, i) => {
        const row = document.createElement("div");
        row.style.cssText = "display: flex; gap: 8px; align-items: center; margin-bottom: 8px;";
        
        const badge = document.createElement("div");
        badge.style.cssText = `width: 28px; height: 28px; border-radius: 8px; background: ${qForm.correct === i ? C.greenLight : C.bg}; color: ${qForm.correct === i ? C.green : C.textLight}; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; flex-shrink: 0; border: 1.5px solid ${qForm.correct === i ? C.green : C.border}; cursor: pointer;`;
        badge.textContent = i + 1;
        badge.addEventListener("click", () => { qForm.correct = i; renderAll(); });
        row.appendChild(badge);

        const inp = document.createElement("input");
        inp.value = opt;
        inp.placeholder = `الخيار ${i + 1}`;
        inp.className = "admin-field";
        inp.style.cssText = `flex: 1; padding: 12px 14px; border: 1.5px solid ${C.border}; borderRadius: 10px; fontSize: 14px; fontFamily: inherit; outline: none;`;
        inp.addEventListener("input", (e) => { qForm.options[i] = e.target.value; });
        row.appendChild(inp);

        const del = document.createElement("button");
        del.style.cssText = `width: 32px; height: 32px; border-radius: 8px; border: 1.5px solid ${C.border}; background: ${C.surface}; cursor: pointer; display: flex; align-items: center; justify-content: center; color: ${C.red}; flex-shrink: 0;`;
        del.innerHTML = `<i class="ph ph-x"></i>`;
        del.addEventListener("click", () => {
          qForm.options.splice(i, 1);
          if (qForm.correct >= qForm.options.length) qForm.correct = Math.max(0, qForm.options.length - 1);
          renderAll();
        });
        row.appendChild(del);
        
        optsCard.appendChild(row);
      });

      const addOpt = document.createElement("button");
      addOpt.style.cssText = `padding: 8px 14px; border-radius: 8px; border: 1.5px dashed ${C.primary}; background: ${C.surface}; color: ${C.primary}; fontSize: 12px; fontWeight: 800; cursor: pointer; fontFamily: inherit; display: inline-flex; align-items: center; gap: 4px;`;
      addOpt.innerHTML = `<i class="ph ph-plus"></i> إضافة خيار`;
      addOpt.addEventListener("click", () => { qForm.options.push(""); renderAll(); });
      optsCard.appendChild(addOpt);

      const correctSelWrap = document.createElement("div");
      correctSelWrap.style.marginTop = "12px";
      correctSelWrap.appendChild(Select({
        label: "الإجابة الصحيحة",
        value: String(qForm.correct),
        options: qForm.options.map((_, i) => ({ label: `الخيار ${i + 1}`, value: String(i) })),
        onChange: v => { qForm.correct = parseInt(v); renderAll(); }
      }));
      optsCard.appendChild(correctSelWrap);
      content.appendChild(optsCard);

      const expCard = document.createElement("div");
      expCard.style.cssText = `background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 14px; padding: 16px; margin-bottom: 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);`;
      expCard.innerHTML = `<div style="font-size: 12px; font-weight: 800; color: ${C.primary}; margin-bottom: 10px; padding: 4px 10px; background: ${C.primaryLight}; border-radius: 8px; display: inline-block;">شرح الإجابة (اختياري)</div>`;
      expCard.appendChild(TextArea({ label: "", value: qForm.explanation, placeholder: "اكتب شرحًا مفصلًا لماذا هذا الإجابة صحيحة...", rows: 3, onChange: v => { qForm.explanation = v; } }));
      content.appendChild(expCard);

      content.appendChild(Btn({ children: `<i class="ph ph-floppy-disk"></i> ${editingQ ? "حفظ التعديلات" : "حفظ السؤال"}`, onClick: saveQ }));

    } else if (qSub === "list") {
      content.appendChild(BackBtn({ onClick: () => { qSub = "menu"; renderAll(); } }));
      
      let qs = Object.entries(questions).map(([id, q]) => ({ id, ...q }));
      if (qCat) qs = qs.filter(q => q.category === qCat);
      if (qSearch.trim()) {
        const s = qSearch.trim().toLowerCase();
        qs = qs.filter(q => (q.question || "").toLowerCase().includes(s));
      }

      content.appendChild(SectionTitle({ title: "الأسئلة", count: qs.length }));

      const searchFilter = document.createElement("div");
      searchFilter.style.marginBottom = "10px";
      
      const searchWrap = document.createElement("div");
      searchWrap.style.cssText = "position: relative; margin-bottom: 8px;";
      searchWrap.innerHTML = `<i class="ph ph-magnifying-glass" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: ${C.textLight}; font-size: 16px;"></i>`;
      const sInp = document.createElement("input");
      sInp.value = qSearch;
      sInp.placeholder = "البحث بنص السؤال...";
      sInp.className = "admin-field";
      sInp.style.cssText = `width: 100%; padding: 10px 14px 10px 40px; border: 1.5px solid ${C.border}; borderRadius: 10px; background: ${C.surface}; fontSize: 14px; fontFamily: inherit; color: ${C.text}; outline: none;`;
      sInp.addEventListener("input", (e) => { qSearch = e.target.value; renderAll(); });
      searchWrap.appendChild(sInp);
      searchFilter.appendChild(searchWrap);

      const catFilter = document.createElement("div");
      catFilter.style.cssText = "display: flex; gap: 6px; flex-wrap: wrap;";
      
      const allBtn = document.createElement("button");
      allBtn.style.cssText = `padding: 5px 12px; border-radius: 20px; border: none; font-size: 11px; font-weight: 800; font-family: inherit; cursor: pointer; background: ${qCat === "" ? C.primary : C.bg}; color: ${qCat === "" ? "#fff" : C.textSec}; transition: all .15s;`;
      allBtn.textContent = "كل الأقسام";
      allBtn.addEventListener("click", () => { qCat = ""; renderAll(); });
      catFilter.appendChild(allBtn);

      Q_CATS.forEach(c => {
        const count = Object.values(questions).filter(q => q.category === c).length;
        const btn = document.createElement("button");
        btn.style.cssText = `padding: 5px 10px; border-radius: 20px; border: none; font-size: 11px; font-weight: 800; font-family: inherit; cursor: pointer; background: ${qCat === c ? C.primary : C.bg}; color: ${qCat === c ? "#fff" : C.textSec}; transition: all .15s; white-space: nowrap;`;
        btn.textContent = `${c} (${count})`;
        btn.addEventListener("click", () => { qCat = c; renderAll(); });
        catFilter.appendChild(btn);
      });
      searchFilter.appendChild(catFilter);
      content.appendChild(searchFilter);

      if (qs.length === 0) {
        content.appendChild(Empty({ icon: "question", text: qSearch.trim() || qCat ? "لا توجد نتائج للبحث" : "لا توجد أسئلة" }));
      } else {
        const list = document.createElement("div");
        list.style.cssText = "display: flex; flex-direction: column; gap: 8px;";
        qs.forEach((q, idx) => {
          const card = document.createElement("div");
          card.style.cssText = `background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 12px; padding: 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);`;
          
          const info = document.createElement("div");
          info.style.cssText = "display: flex; gap: 8px; align-items: start; margin-bottom: 8px;";
          
          if (q.mediaType !== "text" && q.mediaUrl) {
            const media = document.createElement("div");
            media.style.cssText = `width: 56px; height: 56px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: ${C.bg};`;
            if (q.mediaType === "image" || q.mediaType === "gif") {
              media.innerHTML = `<img src="${q.mediaUrl}" alt="" style="width: 100%; height: 100%; object-fit: cover;">`;
            } else {
              media.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: ${C.goldLight};"><i class="ph ph-video" style="color: ${C.gold}; font-size: 22px;"></i></div>`;
            }
            info.appendChild(media);
          }

          const txtWrap = document.createElement("div");
          txtWrap.style.cssText = "flex: 1; min-width: 0;";
          
          const meta = document.createElement("div");
          meta.style.cssText = "display: flex; align-items: center; gap: 6px; margin-bottom: 4px;";
          meta.innerHTML = `<span style="font-size: 10px; font-weight: 900; color: ${C.textLight}; min-width: 24px;">#${idx + 1}</span>`;
          if (q.mediaType !== "text") {
            const mLabel = q.mediaType === "image" ? "صورة" : q.mediaType === "video" ? "فيديو" : "GIF";
            const mIcon = q.mediaType === "video" ? "video" : "image";
            const mBg = q.mediaType === "video" ? C.goldLight : C.primaryLight;
            const mColor = q.mediaType === "video" ? C.gold : C.primary;
            meta.innerHTML += `<span style="font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 6px; background: ${mBg}; color: ${mColor}; display: flex; align-items: center; gap: 3px;"><i class="ph ph-${mIcon}"></i>${mLabel}</span>`;
          }
          txtWrap.appendChild(meta);

          const qTxt = document.createElement("div");
          qTxt.style.cssText = "font-size: 13px; font-weight: 700; margin-bottom: 4px; line-height: 1.5;";
          qTxt.textContent = q.question.length > 90 ? q.question.substring(0, 90) + "..." : q.question;
          txtWrap.appendChild(qTxt);

          const subMeta = document.createElement("div");
          subMeta.style.cssText = `font-size: 11px; color: ${C.textSec}; display: flex; gap: 8px; flex-wrap: wrap;`;
          const correctOpt = q.options ? q.options[q.correctAnswer] : "";
          subMeta.innerHTML = `
            <span>${q.category}</span>
            <span>·</span>
            <span>${q.options?.length || 0} خيارات</span>
            ${correctOpt ? `<span style="color: ${C.green}; display: flex; align-items: center; gap: 3px;"><i class="ph ph-check-circle" style="font-size: 10px;"></i>الصحيح: ${correctOpt.length > 25 ? correctOpt.substring(0, 25) + "..." : correctOpt}</span>` : ""}
          `;
          txtWrap.appendChild(subMeta);
          info.appendChild(txtWrap);
          card.appendChild(info);

          const actions = document.createElement("div");
          actions.style.cssText = "display: flex; gap: 6px;";
          
          const editB = document.createElement("button");
          editB.style.cssText = `padding: 7px 12px; border-radius: 8px; border: 1px solid ${C.primary}; background: ${C.surface}; color: ${C.primary}; fontSize: 12px; fontWeight: 800; cursor: pointer; fontFamily: inherit; display: flex; align-items: center; gap: 4px;`;
          editB.innerHTML = `<i class="ph ph-pencil-simple"></i> تعديل`;
          editB.addEventListener("click", () => {
            editingQ = q.id;
            qForm = {
              category: q.category || Q_CATS[0],
              type: q.mediaType || "text",
              mediaUrl: q.mediaUrl || "",
              text: q.question || "",
              explanation: q.explanation || "",
              correct: q.correctAnswer || 0,
              options: [...(q.options || ["", ""])]
            };
            qSub = "form";
            renderAll();
          });
          actions.appendChild(editB);

          const delB = document.createElement("button");
          delB.style.cssText = `padding: 7px 12px; border-radius: 8px; border: none; background: ${C.redLight}; color: ${C.red}; fontSize: 12px; fontWeight: 800; cursor: pointer; fontFamily: inherit; display: flex; align-items: center; gap: 4px;`;
          delB.innerHTML = `<i class="ph ph-trash"></i> حذف`;
          delB.addEventListener("click", async () => {
            if (!confirm("حذف السؤال؟")) return;
            setLoading(true);
            try {
              await db.ref("questions/" + q.id).remove();
              showToast("تم الحذف");
              await loadAll();
            } catch { showToast("حدث خطأ"); }
            setLoading(false);
          });
          actions.appendChild(delB);
          
          card.appendChild(actions);
          list.appendChild(card);
        });
        content.appendChild(list);
      }
    }
    return content;
  }
  function renderRequests() {
    const content = document.createElement("div");
    content.appendChild(BackBtn({ onClick: () => { view = "menu"; renderAll(); } }));
    
    const entries = Object.entries(requests).sort((a, b) => (b[1].submittedAt || "").localeCompare(a[1].submittedAt || ""));
    content.appendChild(SectionTitle({ title: "طلبات الانتساب", count: entries.length }));

    if (reviewingReqId) {
      // Review Modal overlay
      const overlay = document.createElement("div");
      overlay.style.cssText = "position: fixed; inset: 0; z-index: 200; background: rgba(15,23,42,0.45); display: flex; align-items: center; justify-content: center; padding: 16px; direction: rtl;";
      overlay.addEventListener("click", e => { if (e.target === overlay) { reviewingReqId = null; renderAll(); } });
      
      const modal = document.createElement("div");
      modal.style.cssText = "background: #fff; border-radius: 20px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; padding: 24px; boxShadow: 0 20px 60px rgba(0,0,0,0.15);";
      modal.addEventListener("click", e => e.stopPropagation());
      
      const head = document.createElement("div");
      head.style.cssText = "display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;";
      head.innerHTML = `<div style="font-size: 18px; font-weight: 900; color: ${C.text};">مراجعة ونشر الطلب</div>`;
      const closeB = document.createElement("button");
      closeB.style.cssText = `width: 32px; height: 32px; border-radius: 10px; border: 1.5px solid ${C.border}; background: ${C.surface2}; display: flex; align-items: center; justify-content: center; cursor: pointer;`;
      closeB.innerHTML = `<i class="ph ph-x" style="font-size: 16px; color: ${C.textSec};"></i>`;
      closeB.addEventListener("click", () => { reviewingReqId = null; renderAll(); });
      head.appendChild(closeB);
      modal.appendChild(head);

      const form = document.createElement("div");
      form.style.cssText = "display: flex; flex-direction: column; gap: 14px;";
      
      form.appendChild(Input({ label: "اسم المركز", value: reviewName, onChange: v => reviewName = v }));
      form.appendChild(Input({ label: "العنوان", value: reviewAddress, onChange: v => reviewAddress = v }));
      
      const grid1 = document.createElement("div");
      grid1.style.cssText = "display: grid; grid-template-columns: 1fr 1fr; gap: 10px;";
      grid1.appendChild(Input({ label: "الهاتف", value: reviewPhone, onChange: v => reviewPhone = v }));
      grid1.appendChild(Input({ label: "واتساب", value: reviewWhatsapp, onChange: v => reviewWhatsapp = v }));
      form.appendChild(grid1);

      form.appendChild(Input({ label: "رابط الخريطة", value: reviewMapLink, onChange: v => reviewMapLink = v }));
      form.appendChild(Input({ label: "رابط الصورة", value: reviewImageUrl, onChange: v => reviewImageUrl = v }));
      form.appendChild(TextArea({ label: "الوصف", value: reviewDesc, onChange: v => reviewDesc = v, rows: 3 }));

      const grid2 = document.createElement("div");
      grid2.style.cssText = "display: grid; grid-template-columns: 1fr 1fr; gap: 10px;";
      grid2.appendChild(Input({ label: "التقييم", value: reviewRating, type: "number", onChange: v => reviewRating = v }));
      grid2.appendChild(Input({ label: "عدد التقييمات", value: reviewReviewCount, type: "number", onChange: v => reviewReviewCount = v }));
      form.appendChild(grid2);

      const pubBtn = Btn({ children: '<i class="ph ph-rocket-launch"></i> نشر المركز', onClick: async () => {
        setLoading(true);
        try {
          const areaObjs = reviewAreaIds.map(id => ({ id, name: areas[id]?.name || "" }));
          const workingDays = ALL_DAYS_FULL.filter((_, i) => !reviewSchedule[i].closed);
          const firstOpen = reviewSchedule.find(d => !d.closed);
          const workingHours = firstOpen ? `${firstOpen.from} – ${firstOpen.to}` : "";
          
          await db.ref("centers").push({
            name: reviewName.trim(),
            address: reviewAddress.trim() || null,
            mapLink: reviewMapLink.trim() || null,
            phone: reviewPhone.trim() || null,
            whatsapp: reviewWhatsapp.trim() || null,
            rating: parseFloat(reviewRating) || 0,
            reviewCount: parseInt(reviewReviewCount) || 0,
            imageUrl: reviewImageUrl.trim() || null,
            description: reviewDesc.trim() || null,
            workingDays,
            workingHours,
            schedule: reviewSchedule,
            areas: areaObjs,
            areaId: areaObjs[0]?.id || "",
            governorateId: reviewGovId || "",
            promoted: reviewPromoted,
            createdAt: new Date().toISOString(),
          });
          await db.ref("centerRequests/" + reviewingReqId).remove();
          showToast("تم النشر");
          reviewingReqId = null;
          await loadAll();
        } catch(e) { showToast("حدث خطأ"); }
        setLoading(false);
      }});
      form.appendChild(pubBtn);
      
      const rejBtn = Btn({ children: '<i class="ph ph-trash"></i> رفض وحذف الطلب', variant: "danger", onClick: async () => {
        if(!confirm("هل أنت متأكد من رفض وحذف هذا الطلب؟")) return;
        setLoading(true);
        try {
          await db.ref("centerRequests/" + reviewingReqId).remove();
          showToast("تم الحذف");
          reviewingReqId = null;
          await loadAll();
        } catch(e) { showToast("حدث خطأ"); }
        setLoading(false);
      }});
      form.appendChild(rejBtn);

      modal.appendChild(form);
      overlay.appendChild(modal);
      content.appendChild(overlay);
    }

    if (entries.length === 0) {
      content.appendChild(Empty({ icon: "clipboard-text", text: "لا توجد طلبات" }));
    } else {
      const list = document.createElement("div");
      list.style.cssText = "display: flex; flex-direction: column; gap: 10px;";
      entries.forEach(([reqId, req]) => {
        const card = document.createElement("div");
        card.style.cssText = `background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 18px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); direction: rtl;`;
        
        const header = document.createElement("div");
        header.style.cssText = "display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; gap: 10px;";
        
        const info = document.createElement("div");
        info.style.cssText = "display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;";
        
        const avatar = document.createElement("div");
        avatar.style.cssText = `width: 52px; height: 52px; border-radius: 14px; overflow: hidden; flex-shrink: 0; background: linear-gradient(135deg, ${C.primary}, ${C.primaryDark}); display: flex; align-items: center; justify-content: center;`;
        if (req.imageUrl) {
          avatar.innerHTML = `<img src="${req.imageUrl}" alt="" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
          avatar.innerHTML = `<span style="color: #fff; font-size: 22px; font-weight: 900;">${(req.name || "?").charAt(0)}</span>`;
        }
        info.appendChild(avatar);
        
        const titles = document.createElement("div");
        titles.style.cssText = "min-width: 0; flex: 1;";
        titles.innerHTML = `
          <div style="font-size: 15px; font-weight: 900; color: ${C.text}; line-height: 1.4; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${req.name}</div>
          <div style="font-size: 11px; font-weight: 700; color: ${C.textSec}; display: flex; align-items: center; gap: 4px;">
            <i class="ph ph-calendar-blank" style="font-size: 11px;"></i>
            ${req.submittedAt ? new Date(req.submittedAt).toLocaleDateString("ar-JO") : "-"}
          </div>
        `;
        info.appendChild(titles);
        header.appendChild(info);
        
        const status = document.createElement("span");
        status.style.cssText = `background: rgba(245,158,11,0.15); color: ${C.gold}; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 800; white-space: nowrap; flex-shrink: 0;`;
        status.textContent = "قيد المراجعة";
        header.appendChild(status);
        card.appendChild(header);

        const revBtn = Btn({ children: "مراجعة ونشر", onClick: () => {
          reviewingReqId = reqId;
          reviewingData = req;
          reviewName = req.name || "";
          reviewAddress = req.address || "";
          reviewPhone = req.phone || "";
          reviewWhatsapp = req.whatsapp || "";
          reviewMapLink = req.mapLink || "";
          reviewImageUrl = req.imageUrl || "";
          reviewDesc = req.description || "";
          reviewRating = String(req.rating || "");
          reviewReviewCount = String(req.reviewCount || "");
          reviewGovId = req.governorateId || "";
          reviewAreaIds = (req.areas || []).map(a => a.id);
          reviewSchedule = req.schedule || JSON.parse(JSON.stringify(DEFAULT_SCHEDULE));
          reviewPromoted = req.promoted || false;
          renderAll();
        }});
        card.appendChild(revBtn);
        list.appendChild(card);
      });
      content.appendChild(list);
    }
    return content;
  }
  function CenterFormFields(value, onChange) {
    const div = document.createElement("div");
    div.style.cssText = "display: flex; flex-direction: column; gap: 14px;";

    // Image preview
    const imgWrap = document.createElement("div");
    imgWrap.style.cssText = "display: flex; gap: 14, alignItems: flex-start;";
    const preview = document.createElement("div");
    preview.style.cssText = `width: 80px; height: 80px; border-radius: 12px; overflow: hidden; flex-shrink: 0; background: ${C.surface2}; display: flex; align-items: center; justify-content: center;`;
    if (value.imageUrl) {
      preview.innerHTML = `<img src="${value.imageUrl}" alt="" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
      preview.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, ${C.primary}, ${C.primaryDark}); color: #fff; font-size: 28px; font-weight: 800;">${(value.name || "?").charAt(0)}</div>`;
    }
    imgWrap.appendChild(preview);
    
    const urlWrap = document.createElement("div");
    urlWrap.style.flex = "1";
    urlWrap.innerHTML = `<label style="font-size: 12px; font-weight: 800; color: ${C.textSec}; display: block; margin-bottom: 6px;">صورة المركز (URL)</label>`;
    const urlInp = document.createElement("input");
    urlInp.value = value.imageUrl;
    urlInp.placeholder = "رابط الصورة...";
    urlInp.className = "admin-field";
    urlInp.style.cssText = `width: 100%; padding: 9px 12px; border-radius: 10px; border: 1px solid ${C.border}; fontSize: 13px; fontFamily: inherit; direction: ltr; background: ${C.surface2};`;
    urlInp.addEventListener("input", e => onChange({ imageUrl: e.target.value }));
    urlWrap.appendChild(urlInp);
    imgWrap.appendChild(urlWrap);
    div.appendChild(imgWrap);

    // Name
    const nameWrap = document.createElement("div");
    nameWrap.innerHTML = `<label style="font-size: 12px; font-weight: 800; color: ${C.textSec}; display: block; margin-bottom: 6px;">اسم المركز</label>`;
    const nameInp = document.createElement("input");
    nameInp.value = value.name;
    nameInp.className = "admin-field";
    nameInp.style.cssText = `width: 100%; padding: 9px 12px; border-radius: 10px; border: 1px solid ${C.border}; fontSize: 13px; fontFamily: inherit; background: ${C.surface2};`;
    nameInp.addEventListener("input", e => onChange({ name: e.target.value }));
    nameWrap.appendChild(nameInp);
    div.appendChild(nameWrap);

    // Governorate
    const govWrap = document.createElement("div");
    govWrap.appendChild(Select({
      label: "المحافظة",
      value: value.govId,
      options: [{ label: "اختر المحافظة", value: "" }, ...Object.entries(governorates).map(([id, g]) => ({ label: g.name, value: id }))],
      onChange: v => onChange({ govId: v, areaIds: [] })
    }));
    div.appendChild(govWrap);

    // Areas
    if (value.govId) {
      const areaLabel = document.createElement("label");
      areaLabel.style.cssText = `font-size: 12px; font-weight: 800; color: ${C.textSec}; display: block; margin-bottom: 6px;`;
      areaLabel.textContent = "المناطق المخدّمة";
      div.appendChild(areaLabel);
      
      const chipContainer = document.createElement("div");
      chipContainer.style.cssText = "display: flex; gap: 6px; flex-wrap: wrap;";
      
      const govAreas = Object.entries(areas).filter(([, a]) => a.governorateId === value.govId).sort((a,b) => a[1].name.localeCompare(b[1].name, "ar"));
      govAreas.forEach(([id, a]) => {
        const selected = value.areaIds.includes(id);
        const chip = document.createElement("button");
        chip.style.cssText = `padding: 6px 12px; border-radius: 10px; border: 1.5px solid ${selected ? C.primary : C.border}; background: ${selected ? C.primaryLight : C.surface2}; color: ${selected ? C.primary : C.textSec}; fontSize: 12px; fontWeight: 800; cursor: pointer; fontFamily: inherit; display: flex; align-items: center; gap: 4px; white-space: nowrap;`;
        chip.innerHTML = `<i class="ph ${selected ? "ph-check-circle" : "ph-circle"}" style="font-size: 14px;"></i>${a.name}`;
        chip.addEventListener("click", () => {
          const newIds = selected ? value.areaIds.filter(x => x !== id) : [...value.areaIds, id];
          onChange({ areaIds: newIds });
        });
        chipContainer.appendChild(chip);
      });
      div.appendChild(chipContainer);
    }

    // Schedule
    const schedLabel = document.createElement("label");
    schedLabel.style.cssText = `font-size: 12px; font-weight: 800; color: ${C.textSec}; display: block; margin-top: 10px; margin-bottom: 6px;`;
    schedLabel.textContent = "أوقات الدوام";
    div.appendChild(schedLabel);

    const tableWrap = document.createElement("div");
    tableWrap.style.overflowX = "auto";
    const table = document.createElement("table");
    table.style.cssText = `width: 100%; border-collapse: collapse; font-size: 12px; background: ${C.surface2}; border-radius: 10px; overflow: hidden;`;
    table.innerHTML = `
      <thead>
        <tr style="border-bottom: 2px solid ${C.border};">
          <th style="text-align: right; padding: 6px 8px; font-weight: 700; color: ${C.textSec}; font-size: 10px;">اليوم</th>
          <th style="text-align: center; padding: 6px 8px; font-weight: 700; color: ${C.textSec}; font-size: 10px;">من</th>
          <th style="text-align: center; padding: 6px 8px; font-weight: 700; color: ${C.textSec}; font-size: 10px;">إلى</th>
          <th style="text-align: center; padding: 6px 8px; font-weight: 700; color: ${C.red}; font-size: 10px;">مغلق</th>
        </tr>
      </thead>
    `;
    const tbody = document.createElement("tbody");
    ALL_DAYS_FULL.forEach((day, i) => {
      const rowData = value.schedule[i] || { closed: false, from: "08:00", to: "16:00" };
      const tr = document.createElement("tr");
      tr.style.cssText = `border-bottom: 1px solid ${C.border}; background: ${rowData.closed ? "rgba(239,68,68,0.04)" : "transparent"};`;
      tr.innerHTML = `
        <td style="padding: 6px 8px; font-weight: 700; color: ${rowData.closed ? C.textLight : C.text};">
          <span style="display: inline-flex; align-items: center; gap: 5px;">
            <span style="width: 22px; height: 22px; border-radius: 6px; font-size: 10px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; background: ${rowData.closed ? C.surface2 : C.primaryLight}; color: ${rowData.closed ? C.textLight : C.primary};">${ALL_DAYS_SHORT[i]}</span>
            <span>${day}</span>
          </span>
        </td>
        <td style="padding: 6px 8px; text-align: center;">
          <input type="time" value="${rowData.from}" ${rowData.closed ? "disabled" : ""} style="padding: 4px 6px; border-radius: 6px; font-size: 11px; border: 1.5px solid ${C.border}; font-family: inherit; background: ${rowData.closed ? "#F3F4F6" : C.surface}; color: ${rowData.closed ? C.textLight : C.text}; width: 70px;">
        </td>
        <td style="padding: 6px 8px; text-align: center;">
          <input type="time" value="${rowData.to}" ${rowData.closed ? "disabled" : ""} style="padding: 4px 6px; border-radius: 6px; font-size: 11px; border: 1.5px solid ${C.border}; font-family: inherit; background: ${rowData.closed ? "#F3F4F6" : C.surface}; color: ${rowData.closed ? C.textLight : C.text}; width: 70px;">
        </td>
        <td style="padding: 6px 8px; text-align: center;">
          <input type="checkbox" ${rowData.closed ? "checked" : ""} style="width: 16px; height: 16px; accent-color: ${C.red}; cursor: pointer;">
        </td>
      `;
      
      tr.querySelector('input[type="time"]:nth-of-type(1)')?.addEventListener("change", e => {
        const newSched = [...value.schedule];
        newSched[i] = { ...newSched[i], from: e.target.value };
        onChange({ schedule: newSched });
      });
      tr.querySelector('input[type="time"]:nth-of-type(2)')?.addEventListener("change", e => {
        const newSched = [...value.schedule];
        newSched[i] = { ...newSched[i], to: e.target.value };
        onChange({ schedule: newSched });
      });
      tr.querySelector('input[type="checkbox"]')?.addEventListener("change", e => {
        const newSched = [...value.schedule];
        newSched[i] = { ...newSched[i], closed: e.target.checked };
        onChange({ schedule: newSched });
      });
      
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    tableWrap.appendChild(table);
    div.appendChild(tableWrap);

    return div;
  }

  function renderGeoManage() {
    const content = document.createElement("div");
    content.appendChild(BackBtn({ onClick: () => { view = "menu"; renderAll(); } }));
    
    const govEntries = Object.entries(governorates).sort((a, b) => a[1].name.localeCompare(b[1].name, "ar"));
    content.appendChild(SectionTitle({ title: "إدارة المعلومات الجغرافية", count: govEntries.length }));

    content.appendChild(Btn({ children: '<i class="ph ph-plus"></i> إضافة محافظة جديدة', variant: "outline", style: { marginBottom: "16px" }, onClick: () => { showAddGovModal = true; addGovName = ""; renderAll(); } }));

    if (govEntries.length === 0) {
      content.appendChild(Empty({ icon: "map-trifold", text: "لا توجد محافظات بعد" }));
    } else {
      const list = document.createElement("div");
      list.style.cssText = "display: flex; flex-direction: column; gap: 10px;";
      govEntries.forEach(([govId, gov]) => {
        const govAreaEntries = Object.entries(areas).filter(([, a]) => a.governorateId === govId);
        const expanded = geoExpandedGov === govId;
        
        const card = document.createElement("div");
        card.style.cssText = `background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.03);`;
        
        const row = document.createElement("div");
        row.style.cssText = "display: flex; align-items: center; gap: 10px; padding: 14px;";
        
        const toggle = document.createElement("button");
        toggle.style.cssText = "flex: 1; display: flex; align-items: center; gap: 10px; background: none; border: none; cursor: pointer; fontFamily: inherit; textAlign: right; padding: 0;";
        toggle.innerHTML = `
          <div style="width: 36px; height: 36px; border-radius: 10px; background: ${C.cyanLight}; color: ${C.cyan}; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;">
            <i class="ph ph-map-trifold"></i>
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 14px; font-weight: 800; color: ${C.text};">${gov.name}</div>
            <div style="font-size: 11px; color: ${C.textSec}; margin-top: 2px;">${govAreaEntries.length} منطقة</div>
          </div>
          <i class="ph ph-caret-${expanded ? "up" : "down"}" style="font-size: 16px; color: ${C.textLight};"></i>
        `;
        toggle.addEventListener("click", () => { geoExpandedGov = expanded ? null : govId; renderAll(); });
        row.appendChild(toggle);
        
        const editB = document.createElement("button");
        editB.style.cssText = `width: 32px; height: 32px; border-radius: 8px; border: 1.5px solid ${C.border}; background: ${C.surface2}; color: ${C.primary}; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;`;
        editB.innerHTML = `<i class="ph ph-pencil-simple" style="font-size: 14px;"></i>`;
        editB.addEventListener("click", () => { editGovId = govId; editGovName = gov.name; renderAll(); });
        row.appendChild(editB);
        
        const delB = document.createElement("button");
        delB.style.cssText = `width: 32px; height: 32px; border-radius: 8px; border: none; background: ${C.redLight}; color: ${C.red}; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;`;
        delB.innerHTML = `<i class="ph ph-trash" style="font-size: 14px;"></i>`;
        delB.addEventListener("click", async () => {
          if (govAreaEntries.length > 0) { showToast("احذف مناطق هذه المحافظة أولاً"); return; }
          if (!confirm(`حذف محافظة "${gov.name}"؟`)) return;
          setLoading(true);
          try { await db.ref("governorates/" + govId).remove(); showToast("تم الحذف"); await loadAll(); }
          catch { showToast("حدث خطأ"); }
          setLoading(false);
        });
        row.appendChild(delB);
        
        card.appendChild(row);

        if (expanded) {
          const inner = document.createElement("div");
          inner.style.cssText = `padding: 0 14px 14px; border-top: 1px solid ${C.surface2};`;
          
          const areasDiv = document.createElement("div");
          areasDiv.style.cssText = "display: flex; flex-direction: column; gap: 6px; margin-top: 10px;";
          if (govAreaEntries.length === 0) {
            areasDiv.innerHTML = `<div style="font-size: 12px; color: ${C.textLight}; padding: 6px 2px;">لا توجد مناطق في هذه المحافظة</div>`;
          } else {
            govAreaEntries.forEach(([areaId, area]) => {
              const aRow = document.createElement("div");
              aRow.style.cssText = `display: flex; align-items: center; gap: 8px; background: ${C.surface2}; border-radius: 10px; padding: 8px 10px;`;
              aRow.innerHTML = `
                <i class="ph ph-map-pin" style="font-size: 14px; color: ${C.primary};"></i>
                <div style="flex: 1; font-size: 13px; font-weight: 700; color: ${C.text};">${area.name}</div>
              `;
              const aeB = document.createElement("button");
              aeB.style.cssText = `width: 28px; height: 28px; border-radius: 8px; border: 1px solid ${C.border}; background: ${C.surface}; color: ${C.primary}; cursor: pointer; display: flex; align-items: center; justify-content: center;`;
              aeB.innerHTML = `<i class="ph ph-pencil-simple" style="font-size: 12px;"></i>`;
              aeB.addEventListener("click", () => { editAreaId = areaId; editAreaName = area.name; editAreaGov = govId; renderAll(); });
              aRow.appendChild(aeB);
              
              const adB = document.createElement("button");
              adB.style.cssText = `width: 28px; height: 28px; border-radius: 8px; border: none; background: ${C.redLight}; color: ${C.red}; cursor: pointer; display: flex; align-items: center; justify-content: center;`;
              adB.innerHTML = `<i class="ph ph-trash" style="font-size: 12px;"></i>`;
              adB.addEventListener("click", async () => {
                const inUse = Object.values(centers).some(c => c.areaId === areaId || c.areas?.some(ca => ca.id === areaId));
                if (inUse) { showToast("لا يمكن حذف منطقة مرتبطة بمركز"); return; }
                if (!confirm(`حذف منطقة "${area.name}"؟`)) return;
                setLoading(true);
                try { await db.ref("areas/" + areaId).remove(); showToast("تم الحذف"); await loadAll(); }
                catch { showToast("حدث خطأ"); }
                setLoading(false);
              });
              aRow.appendChild(adB);
              areasDiv.appendChild(aRow);
            });
          }
          inner.appendChild(areasDiv);
          
          const addAB = document.createElement("button");
          addAB.style.cssText = `marginTop: 10px; width: 100%; padding: 8px 12px; border-radius: 10px; border: 1.5px dashed ${C.primary}; background: ${C.surface}; color: ${C.primary}; fontSize: 12px; fontWeight: 800; cursor: pointer; fontFamily: inherit; display: flex; align-items: center; justify-content: center; gap: 4px;`;
          addAB.innerHTML = `<i class="ph ph-plus" style="font-size: 14px;"></i> إضافة منطقة إلى ${gov.name}`;
          addAB.addEventListener("click", () => { geoAddAreaGovId = govId; addAreaName = ""; renderAll(); });
          inner.appendChild(addAB);
          
          card.appendChild(inner);
        }
        list.appendChild(card);
      });
      content.appendChild(list);
    }
    
    // Modals
    if (showAddGovModal || editGovId || geoAddAreaGovId || editAreaId) {
      const overlay = document.createElement("div");
      overlay.style.cssText = "position: fixed; inset: 0; z-index: 200; background: rgba(15,23,42,0.45); display: flex; align-items: center; justify-content: center; padding: 16px;";
      overlay.addEventListener("click", e => { if (e.target === overlay) { showAddGovModal = false; editGovId = null; geoAddAreaGovId = null; editAreaId = null; renderAll(); } });
      
      const modal = document.createElement("div");
      modal.style.cssText = "background: #fff; border-radius: 20px; width: 100%; max-width: 400px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); direction: rtl;";
      modal.addEventListener("click", e => e.stopPropagation());
      
      if (showAddGovModal) {
        modal.innerHTML = `<div style="font-size: 16px; font-weight: 900; color: ${C.text}; margin-bottom: 16px;">إضافة محافظة جديدة</div>`;
        modal.appendChild(Input({ label: "اسم المحافظة", value: addGovName, onChange: v => addGovName = v }));
        modal.appendChild(Btn({ children: "حفظ", onClick: async () => {
          if (!addGovName.trim()) { showToast("أدخل اسم المحافظة"); return; }
          setLoading(true);
          try { await db.ref("governorates").push({ name: addGovName.trim() }); showToast("تم الإضافة"); showAddGovModal = false; await loadAll(); }
          catch { showToast("حدث خطأ"); }
          setLoading(false);
        }}));
      } else if (editGovId) {
        modal.innerHTML = `<div style="font-size: 16px; font-weight: 900; color: ${C.text}; margin-bottom: 16px;">تعديل محافظة</div>`;
        modal.appendChild(Input({ label: "اسم المحافظة", value: editGovName, onChange: v => editGovName = v }));
        modal.appendChild(Btn({ children: "حفظ", onClick: async () => {
          if (!editGovName.trim()) { showToast("أدخل اسم المحافظة"); return; }
          setLoading(true);
          try { await db.ref("governorates/" + editGovId).update({ name: editGovName.trim() }); showToast("تم التحديث"); editGovId = null; await loadAll(); }
          catch { showToast("حدث خطأ"); }
          setLoading(false);
        }}));
      } else if (geoAddAreaGovId) {
        modal.innerHTML = `<div style="font-size: 16px; font-weight: 900; color: ${C.text}; margin-bottom: 16px;">إضافة منطقة إلى ${governorates[geoAddAreaGovId]?.name}</div>`;
        modal.appendChild(Input({ label: "اسم المنطقة", value: addAreaName, onChange: v => addAreaName = v }));
        modal.appendChild(Btn({ children: "حفظ", onClick: async () => {
          if (!addAreaName.trim()) { showToast("أدخل اسم المنطقة"); return; }
          setLoading(true);
          try { await db.ref("areas").push({ name: addAreaName.trim(), governorateId: geoAddAreaGovId }); showToast("تم الإضافة"); geoAddAreaGovId = null; await loadAll(); }
          catch { showToast("حدث خطأ"); }
          setLoading(false);
        }}));
      } else if (editAreaId) {
        modal.innerHTML = `<div style="font-size: 16px; font-weight: 900; color: ${C.text}; margin-bottom: 16px;">تعديل منطقة</div>`;
        modal.appendChild(Select({ label: "المحافظة", value: editAreaGov, options: Object.entries(governorates).map(([id, g]) => ({ label: g.name, value: id })), onChange: v => editAreaGov = v }));
        modal.appendChild(Input({ label: "اسم المنطقة", value: editAreaName, onChange: v => editAreaName = v }));
        modal.appendChild(Btn({ children: "حفظ", onClick: async () => {
          if (!editAreaName.trim()) { showToast("أدخل اسم المنطقة"); return; }
          setLoading(true);
          try { await db.ref("areas/" + editAreaId).update({ name: editAreaName.trim(), governorateId: editAreaGov }); showToast("تم التحديث"); editAreaId = null; await loadAll(); }
          catch { showToast("حدث خطأ"); }
          setLoading(false);
        }}));
      }
      overlay.appendChild(modal);
      content.appendChild(overlay);
    }
    return content;
  }
  function renderCentersManage() {
    const content = document.createElement("div");
    content.appendChild(BackBtn({ onClick: () => { view = "menu"; renderAll(); } }));
    
    const entries = Object.entries(centers).sort((a, b) => (a[1].name || "").localeCompare(b[1].name || "", "ar"));
    content.appendChild(SectionTitle({ title: "إدارة المراكز", count: entries.length }));

    content.appendChild(Btn({ children: '<i class="ph ph-plus"></i> إضافة مركز جديد', variant: "outline", style: { marginBottom: "16px" }, onClick: () => { addCF = JSON.parse(JSON.stringify(DEFAULT_CENTER_FORM)); view = "add-center"; renderAll(); } }));

    if (entries.length === 0) {
      content.appendChild(Empty({ icon: "buildings", text: "لا توجد مراكز" }));
    } else {
      const list = document.createElement("div");
      list.style.cssText = "display: flex; flex-direction: column; gap: 10px;";
      entries.forEach(([id, c]) => {
        const item = document.createElement("div");
        item.style.cssText = `background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 14px; padding: 14px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; gap: 10px; boxShadow: 0 1px 2px rgba(0,0,0,0.03);`;
        
        const info = document.createElement("div");
        info.style.cssText = "flex: 1; min-width: 0;";
        info.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 13px; font-weight: 700; color: ${C.text}; display: block;">${c.name}</span>
            ${c.suspended ? `<span style="font-size: 10px; background: ${C.redLight}; color: ${C.red}; padding: 1px 6px; border-radius: 4px; font-weight: 800;">معلّق</span>` : ""}
            ${c.promoted ? `<span style="font-size: 10px; background: ${C.goldLight}; color: ${C.gold}; padding: 1px 6px; border-radius: 4px; font-weight: 800;">مميز</span>` : ""}
          </div>
          <span style="font-size: 12px; color: ${C.textSec}; margin-top: 2px; display: block;">${governorates[c.governorateId]?.name || "-"} · ${c.address || "-"}</span>
        `;
        item.appendChild(info);

        const actions = document.createElement("div");
        actions.style.cssText = "display: flex; gap: 6px; flex-shrink: 0;";
        
        const editB = document.createElement("button");
        editB.style.cssText = `width: 30px; height: 30px; border-radius: 7px; border: 1px solid ${C.primary}; background: ${C.surface}; color: ${C.primary}; display: flex; align-items: center; justify-content: center; cursor: pointer;`;
        editB.innerHTML = `<i class="ph ph-pencil-simple" style="font-size: 13px;"></i>`;
        editB.addEventListener("click", () => {
          editId = id;
          editCF = {
            name: c.name || "", address: c.address || "", mapLink: c.mapLink || "",
            phone: c.phone || "", whatsapp: c.whatsapp || "", imageUrl: c.imageUrl || "",
            description: c.description || "", rating: String(c.rating || ""), reviewCount: String(c.reviewCount || ""),
            govId: c.governorateId || "", areaIds: (c.areas || []).map(a => a.id),
            schedule: c.schedule || JSON.parse(JSON.stringify(DEFAULT_SCHEDULE))
          };
          view = "edit-center";
          renderAll();
        });
        actions.appendChild(editB);

        const suspendB = document.createElement("button");
        suspendB.style.cssText = `width: 30px; height: 30px; border-radius: 7px; border: 1px solid ${c.suspended ? C.green : C.gold}; background: ${C.surface}; color: ${c.suspended ? C.green : C.gold}; display: flex; align-items: center; justify-content: center; cursor: pointer;`;
        suspendB.innerHTML = `<i class="ph ph-${c.suspended ? "play-circle" : "pause-circle"}" style="font-size: 13px;"></i>`;
        suspendB.addEventListener("click", async () => {
          setLoading(true);
          try {
            await db.ref("centers/" + id).update({ suspended: !c.suspended });
            showToast(!c.suspended ? "تم تعليق النشر" : "تم استئناف النشر");
            await loadAll();
          } catch(e) { showToast("حدث خطأ"); }
          setLoading(false);
        });
        actions.appendChild(suspendB);

        const delB = document.createElement("button");
        delB.style.cssText = `width: 30px; height: 30px; border-radius: 7px; border: none; background: ${C.redLight}; color: ${C.red}; display: flex; align-items: center; justify-content: center; cursor: pointer;`;
        delB.innerHTML = `<i class="ph ph-trash" style="font-size: 13px;"></i>`;
        delB.addEventListener("click", async () => {
          if(!confirm(`حذف مركز "${c.name}"؟`)) return;
          setLoading(true);
          try {
            await db.ref("centers/" + id).remove();
            showToast("تم الحذف");
            await loadAll();
          } catch(e) { showToast("حدث خطأ"); }
          setLoading(false);
        });
        actions.appendChild(delB);
        
        item.appendChild(actions);
        list.appendChild(item);
      });
      content.appendChild(list);
    }
    return content;
  }

  function renderAddCenter() {
    const content = document.createElement("div");
    content.appendChild(BackBtn({ onClick: () => { view = "centers-manage"; renderAll(); } }));
    content.appendChild(SectionTitle({ title: "إضافة مركز جديد" }));

    const card = document.createElement("div");
    card.style.cssText = `background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 18px; padding: 20px; margin-bottom: 14px; display: flex; flex-direction: column; gap: 14px;`;
    card.appendChild(CenterFormFields(addCF, patch => { Object.assign(addCF, patch); renderAll(); }));
    content.appendChild(card);

    content.appendChild(Btn({ children: '<i class="ph ph-floppy-disk"></i> حفظ المركز', onClick: async () => {
      if (!addCF.name.trim()) { showToast("أدخل اسم المركز"); return; }
      if (!addCF.govId) { showToast("اختر المحافظة"); return; }
      if (addCF.areaIds.length === 0) { showToast("اختر منطقة واحدة على الأقل"); return; }
      
      setLoading(true);
      try {
        const workingDays = ALL_DAYS_FULL.filter((_, i) => !addCF.schedule[i].closed);
        const firstOpen = addCF.schedule.find(d => !d.closed);
        const workingHours = firstOpen ? `${firstOpen.from} – ${firstOpen.to}` : "";
        const areaObjs = addCF.areaIds.map(id => ({ id, name: areas[id]?.name || "" }));
        
        let nextPublicId = 1;
        const snap = await db.ref("centers").once("value");
        const existing = snap.val() || {};
        for (const c of Object.values(existing)) {
          const pub = c.publicId;
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
        });
        showToast("تم الإضافة");
        await loadAll();
        view = "centers-manage";
        renderAll();
      } catch(e) { showToast("حدث خطأ"); }
      setLoading(false);
    }}));
    
    return content;
  }

  function renderEditCenter() {
    const content = document.createElement("div");
    content.appendChild(BackBtn({ onClick: () => { view = "centers-manage"; renderAll(); } }));
    content.appendChild(SectionTitle({ title: "تعديل مركز" }));

    const card = document.createElement("div");
    card.style.cssText = `background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 18px; padding: 20px; margin-bottom: 14px; display: flex; flex-direction: column; gap: 14px;`;
    card.appendChild(CenterFormFields(editCF, patch => { Object.assign(editCF, patch); renderAll(); }));
    content.appendChild(card);

    content.appendChild(Btn({ children: '<i class="ph ph-check"></i> حفظ التغييرات', onClick: async () => {
      if (!editCF.name.trim()) { showToast("أدخل اسم المركز"); return; }
      if (!editCF.govId) { showToast("اختر المحافظة"); return; }
      if (editCF.areaIds.length === 0) { showToast("اختر منطقة واحدة على الأقل"); return; }
      
      setLoading(true);
      try {
        const workingDays = ALL_DAYS_FULL.filter((_, i) => !editCF.schedule[i].closed);
        const firstOpen = editCF.schedule.find(d => !d.closed);
        const workingHours = firstOpen ? `${firstOpen.from} – ${firstOpen.to}` : "";
        const areaObjs = editCF.areaIds.map(id => ({ id, name: areas[id]?.name || "" }));
        
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
        await loadAll();
        view = "centers-manage";
        renderAll();
      } catch(e) { showToast("حدث خطأ"); }
      setLoading(false);
    }}));
    
    return content;
  }
  function renderFeaturedCenters() {
    const content = document.createElement("div");
    content.appendChild(BackBtn({ onClick: () => { view = "menu"; renderAll(); } }));
    
    const entries = Object.entries(centers).sort((a, b) => (a[1].name || "").localeCompare(b[1].name || "", "ar"));
    const featured = entries.filter(([, c]) => c.promoted);
    content.appendChild(SectionTitle({ title: "المراكز المميزة", count: featured.length }));

    if (entries.length === 0) {
      content.appendChild(Empty({ icon: "crown-simple", text: "لا توجد مراكز" }));
    } else {
      const list = document.createElement("div");
      list.style.cssText = "display: flex; flex-direction: column; gap: 8px;";
      entries.forEach(([id, c]) => {
        const toggleB = document.createElement("button");
        toggleB.style.cssText = `width: 32px; height: 32px; border-radius: 8px; border: 1.5px solid ${c.promoted ? C.gold : C.border}; background: ${c.promoted ? C.goldLight : C.surface}; color: ${c.promoted ? C.gold : C.textLight}; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;`;
        toggleB.innerHTML = `<i class="ph ph-crown${c.promoted ? "-simple" : ""}" style="font-size: 16px;"></i>`;
        toggleB.addEventListener("click", async () => {
          setLoading(true);
          try {
            await db.ref("centers/" + id).update({ promoted: !c.promoted });
            showToast(!c.promoted ? "تم التمييز" : "تم إلغاء التمييز");
            await loadAll();
          } catch(e) { showToast("حدث خطأ"); }
          setLoading(false);
        });
        
        const item = ListItem({
          label: c.name,
          sub: governorates[c.governorateId]?.name || "-",
          actions: toggleB
        });
        list.appendChild(item);
      });
      content.appendChild(list);
    }
    return content;
  }

  function renderGuideAdmin() {
    const content = document.createElement("div");
    
    function resetGuideForm() {
      guideForm = { title: "", icon: "list-numbers", iconColor: "#A855F7", iconBg: "rgba(168,85,247,0.15)", type: "steps", items: [] };
      editingGuideId = null;
    }

    const GUIDE_TYPE_LABELS = { steps: "خطوات", documents: "وثائق", fees: "رسوم", conditions: "شروط", faq: "أسئلة شائعة" };
    const GUIDE_ICONS = ["list-numbers", "identification-card", "receipt", "shield-check", "question", "book-open", "graduation-cap", "map-pin", "car", "warning"];
    const GUIDE_COLORS = [
      { label: "أرجواني", color: "#A855F7", bg: "rgba(168,85,247,0.15)" },
      { label: "أزرق", color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
      { label: "أخضر", color: "#10B981", bg: "rgba(16,185,129,0.15)" },
      { label: "برتقالي", color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
      { label: "أحمر", color: "#EF4444", bg: "rgba(239,68,68,0.15)" }
    ];

    if (guideEditorOpen) {
      content.appendChild(BackBtn({ onClick: () => { guideEditorOpen = false; resetGuideForm(); renderAll(); } }));
      content.appendChild(SectionTitle({ title: editingGuideId ? "تعديل القسم" : "قسم جديد" }));

      const card = document.createElement("div");
      card.style.cssText = `background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 14px; padding: 16px; margin-bottom: 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);`;
      card.innerHTML = `<div style="font-size: 12px; font-weight: 800; color: ${C.primary}; margin-bottom: 12px; padding: 4px 10px; background: ${C.primaryLight}; border-radius: 8px; display: inline-block;">إعدادات القسم</div>`;
      
      card.appendChild(Input({ label: "العنوان", value: guideForm.title, placeholder: "مثال: خطوات الحصول على رخصة القيادة", onChange: v => guideForm.title = v }));
      
      const typeLabel = document.createElement("label");
      typeLabel.style.cssText = `display: block; margin-bottom: 6px; font-size: 13px; font-weight: 700; color: ${C.text};`;
      typeLabel.textContent = "نوع القسم";
      card.appendChild(typeLabel);
      
      const typeBtns = document.createElement("div");
      typeBtns.style.cssText = "display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px;";
      Object.keys(GUIDE_TYPE_LABELS).forEach(t => {
        const btn = document.createElement("button");
        const active = guideForm.type === t;
        btn.style.cssText = `padding: 6px 14px; border-radius: 10px; fontSize: 12px; fontWeight: 800; fontFamily: inherit; cursor: pointer; border: 1.5px solid ${active ? C.primary : C.border}; background: ${active ? C.primaryLight : C.surface}; color: ${active ? C.primary : C.textSec};`;
        btn.textContent = GUIDE_TYPE_LABELS[t];
        btn.addEventListener("click", () => { guideForm.type = t; guideForm.items = []; renderAll(); });
        typeBtns.appendChild(btn);
      });
      card.appendChild(typeBtns);

      const iconLabel = document.createElement("label");
      iconLabel.style.cssText = `display: block; margin-bottom: 6px; font-size: 13px; font-weight: 700; color: ${C.text};`;
      iconLabel.textContent = "الأيقونة";
      card.appendChild(iconLabel);
      
      const iconGrid = document.createElement("div");
      iconGrid.style.cssText = "display: grid; grid-template-columns: repeat(8, 1fr); gap: 6px; margin-bottom: 14px;";
      GUIDE_ICONS.forEach(ic => {
        const btn = document.createElement("button");
        const active = guideForm.icon === ic;
        btn.style.cssText = `width: 36px; height: 36px; border-radius: 8px; border: 1.5px solid ${active ? C.primary : C.border}; background: ${active ? C.primaryLight : C.surface}; color: ${active ? C.primary : C.textSec}; display: flex; align-items: center; justify-content: center; fontSize: 18px; cursor: pointer; fontFamily: inherit;`;
        btn.innerHTML = `<i class="ph ph-${ic}"></i>`;
        btn.addEventListener("click", () => { guideForm.icon = ic; renderAll(); });
        iconGrid.appendChild(btn);
      });
      card.appendChild(iconGrid);

      const colorLabel = document.createElement("label");
      colorLabel.style.cssText = `display: block; margin-bottom: 6px; font-size: 13px; font-weight: 700; color: ${C.text};`;
      colorLabel.textContent = "اللون";
      card.appendChild(colorLabel);
      
      const colorRow = document.createElement("div");
      colorRow.style.cssText = "display: flex; gap: 8px; margin-bottom: 14px;";
      GUIDE_COLORS.forEach(c => {
        const btn = document.createElement("button");
        const active = guideForm.iconColor === c.color;
        btn.style.cssText = `width: 32px; height: 32px; border-radius: 50%; border: 2.5px solid ${active ? C.primary : "transparent"}; background: ${c.bg}; cursor: pointer;`;
        btn.addEventListener("click", () => { guideForm.iconColor = c.color; guideForm.iconBg = c.bg; renderAll(); });
        colorRow.appendChild(btn);
      });
      card.appendChild(colorRow);
      content.appendChild(card);

      // Items
      const itemsCard = document.createElement("div");
      itemsCard.style.cssText = `background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 14px; padding: 16px; margin-bottom: 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);`;
      itemsCard.innerHTML = `<div style="font-size: 12px; font-weight: 800; color: ${C.primary}; margin-bottom: 12px; padding: 4px 10px; background: ${C.primaryLight}; border-radius: 8px; display: inline-block;">محتويات القسم (${guideForm.items.length})</div>`;
      
      const list = document.createElement("div");
      list.style.cssText = "display: flex; flex-direction: column; gap: 10px;";
      guideForm.items.forEach((it, i) => {
        const item = document.createElement("div");
        item.style.cssText = `background: ${C.bg}; border-radius: 10px; padding: 12px; border: 1px solid ${C.border};`;
        item.innerHTML = `
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
            <span style="font-size: 12px; font-weight: 800; color: ${C.primary}; background: ${C.primaryLight}; border-radius: 6px; padding: 2px 8px;">#${i + 1}</span>
            <div style="flex: 1;"></div>
          </div>
        `;
        const itemHead = item.querySelector("div");
        const moveUp = document.createElement("button");
        moveUp.style.cssText = `width: 26px; height: 26px; border-radius: 6px; border: 1px solid ${C.border}; background: ${C.surface}; cursor: ${i === 0 ? "not-allowed" : "pointer"}; display: flex; align-items: center; justify-content: center; opacity: ${i === 0 ? 0.4 : 1}; fontFamily: inherit;`;
        moveUp.innerHTML = `<i class="ph ph-arrow-up" style="font-size: 12px; color: ${C.textSec};"></i>`;
        moveUp.addEventListener("click", () => { if(i > 0) { const tmp = guideForm.items[i]; guideForm.items[i] = guideForm.items[i-1]; guideForm.items[i-1] = tmp; renderAll(); } });
        itemHead.appendChild(moveUp);
        
        const moveDown = document.createElement("button");
        moveDown.style.cssText = `width: 26px; height: 26px; border-radius: 6px; border: 1px solid ${C.border}; background: ${C.surface}; cursor: ${i === guideForm.items.length - 1 ? "not-allowed" : "pointer"}; display: flex; align-items: center; justify-content: center; opacity: ${i === guideForm.items.length - 1 ? 0.4 : 1}; fontFamily: inherit;`;
        moveDown.innerHTML = `<i class="ph ph-arrow-down" style="font-size: 12px; color: ${C.textSec};"></i>`;
        moveDown.addEventListener("click", () => { if(i < guideForm.items.length - 1) { const tmp = guideForm.items[i]; guideForm.items[i] = guideForm.items[i+1]; guideForm.items[i+1] = tmp; renderAll(); } });
        itemHead.appendChild(moveDown);
        
        const delI = document.createElement("button");
        delI.style.cssText = `width: 26px; height: 26px; border-radius: 6px; border: none; background: ${C.redLight}; cursor: pointer; display: flex; align-items: center; justify-content: center; fontFamily: inherit;`;
        delI.innerHTML = `<i class="ph ph-trash" style="font-size: 12px; color: ${C.red};"></i>`;
        delI.addEventListener("click", () => { guideForm.items.splice(i, 1); renderAll(); });
        itemHead.appendChild(delI);

        if (guideForm.type === "faq") {
          item.appendChild(Input({ label: "السؤال", value: it.text, onChange: v => { it.text = v; } }));
          item.appendChild(TextArea({ label: "الإجابة", value: it.answer || "", rows: 2, onChange: v => { it.answer = v; } }));
        } else if (guideForm.type === "fees") {
          item.appendChild(Input({ label: "البند", value: it.text, onChange: v => { it.text = v; } }));
          const row = document.createElement("div");
          row.style.cssText = "display: grid; grid-template-columns: 1fr 1fr; gap: 8px;";
          row.appendChild(Input({ label: "المبلغ", value: it.amount || "", onChange: v => { it.amount = v; } }));
          row.appendChild(Input({ label: "ملاحظة", value: it.note || "", onChange: v => { it.note = v; } }));
          item.appendChild(row);
        } else {
          item.appendChild(Input({ label: "النص", value: it.text, onChange: v => { it.text = v; } }));
          item.appendChild(Input({ label: "تفاصيل / وصف (اختياري)", value: it.sub || "", onChange: v => { it.sub = v; } }));
        }
        list.appendChild(item);
      });
      itemsCard.appendChild(list);
      
      const addIB = Btn({ children: '<i class="ph ph-plus"></i> إضافة عنصر', variant: "outline", style: { marginTop: "10px" }, onClick: () => { guideForm.items.push({ text: "" }); renderAll(); } });
      itemsCard.appendChild(addIB);
      content.appendChild(itemsCard);

      const actionRow = document.createElement("div");
      actionRow.style.cssText = "display: flex; gap: 8px;";
      actionRow.appendChild(Btn({ children: '<i class="ph ph-floppy-disk"></i> حفظ القسم', style: { flex: 1 }, onClick: async () => {
        if (!guideForm.title.trim()) { showToast("أدخل عنوان القسم"); return; }
        setLoading(true);
        try {
          const payload = {
            title: guideForm.title.trim(),
            type: guideForm.type,
            icon: guideForm.icon,
            iconColor: guideForm.iconColor,
            iconBg: guideForm.iconBg,
            items: guideForm.items.map(it => ({ ...it, text: it.text.trim() })),
            order: editingGuideId ? guideSections[editingGuideId].order || 0 : Object.keys(guideSections).length,
          };
          if (editingGuideId) await db.ref("guide/sections/" + editingGuideId).update(payload);
          else await db.ref("guide/sections").push(payload);
          showToast("تم الحفظ");
          await loadAll();
          guideEditorOpen = false;
          resetGuideForm();
          renderAll();
        } catch(e) { showToast("حدث خطأ"); }
        setLoading(false);
      }}));
      actionRow.appendChild(Btn({ children: '<i class="ph ph-x"></i> إلغاء', variant: "ghost", style: { flex: 1 }, onClick: () => { guideEditorOpen = false; resetGuideForm(); renderAll(); } }));
      content.appendChild(actionRow);

    } else {
      content.appendChild(BackBtn({ onClick: () => { view = "menu"; renderAll(); } }));
      content.appendChild(SectionTitle({ title: "إدارة دليل المستخدم", count: stats.guide }));
      content.appendChild(Btn({ children: '<i class="ph ph-plus"></i> إضافة قسم جديد', style: { marginBottom: "14px" }, onClick: () => { resetGuideForm(); guideEditorOpen = true; renderAll(); } }));
      
      const arr = Object.entries(guideSections).map(([id, s]) => ({ id, ...s })).sort((a,b) => (a.order || 0) - (b.order || 0));
      if (arr.length === 0) {
        content.appendChild(Empty({ icon: "book-open-text", text: "لا توجد أقسام" }));
      } else {
        const list = document.createElement("div");
        list.style.cssText = "display: flex; flex-direction: column; gap: 8px;";
        arr.forEach((s, idx) => {
          const item = document.createElement("div");
          item.style.cssText = `background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 12px; padding: 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); display: flex; align-items: center; gap: 10px;`;
          
          const arrows = document.createElement("div");
          arrows.style.cssText = "display: flex; flex-direction: column; align-items: center; gap: 2px; flex-shrink: 0;";
          const up = document.createElement("button");
          up.style.cssText = `width: 22px; height: 22px; border-radius: 5px; border: 1px solid ${C.border}; background: ${C.bg}; cursor: ${idx === 0 ? "not-allowed" : "pointer"}; display: flex; align-items: center; justify-content: center; opacity: ${idx === 0 ? 0.4 : 1}; fontFamily: inherit;`;
          up.innerHTML = `<i class="ph ph-arrow-up" style="font-size: 11px; color: ${C.textSec};"></i>`;
          up.addEventListener("click", async () => {
            if(idx > 0) {
              setLoading(true);
              const other = arr[idx-1];
              await Promise.all([
                db.ref("guide/sections/" + s.id).update({ order: idx - 1 }),
                db.ref("guide/sections/" + other.id).update({ order: idx })
              ]);
              await loadAll();
              renderAll();
              setLoading(false);
            }
          });
          arrows.appendChild(up);
          const down = document.createElement("button");
          down.style.cssText = `width: 22px; height: 22px; border-radius: 5px; border: 1px solid ${C.border}; background: ${C.bg}; cursor: ${idx === arr.length - 1 ? "not-allowed" : "pointer"}; display: flex; align-items: center; justify-content: center; opacity: ${idx === arr.length - 1 ? 0.4 : 1}; fontFamily: inherit;`;
          down.innerHTML = `<i class="ph ph-arrow-down" style="font-size: 11px; color: ${C.textSec};"></i>`;
          down.addEventListener("click", async () => {
            if(idx < arr.length - 1) {
              setLoading(true);
              const other = arr[idx+1];
              await Promise.all([
                db.ref("guide/sections/" + s.id).update({ order: idx + 1 }),
                db.ref("guide/sections/" + other.id).update({ order: idx })
              ]);
              await loadAll();
              renderAll();
              setLoading(false);
            }
          });
          arrows.appendChild(down);
          item.appendChild(arrows);

          item.innerHTML += `
            <div style="width: 36px; height: 36px; border-radius: 9px; background: ${s.iconBg || "rgba(168,85,247,0.15)"}; color: ${s.iconColor || "#A855F7"}; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;">
              <i class="ph ph-${s.icon || "list-numbers"}"></i>
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 13px; font-weight: 800; color: ${C.text};">${s.title}</span>
                <span style="font-size: 10px; font-weight: 800; padding: 1px 7px; border-radius: 20px; background: ${C.primaryLight}; color: ${C.primary};">${GUIDE_TYPE_LABELS[s.type] || s.type}</span>
              </div>
            </div>
          `;
          
          const acts = document.createElement("div");
          acts.style.cssText = "display: flex; gap: 4px; flex-shrink: 0;";
          const editB = document.createElement("button");
          editB.style.cssText = `width: 30px; height: 30px; border-radius: 7px; border: 1px solid ${C.primary}; background: ${C.surface}; color: ${C.primary}; display: flex; align-items: center; justify-content: center; cursor: pointer; fontFamily: inherit;`;
          editB.innerHTML = `<i class="ph ph-pencil-simple" style="font-size: 13px;"></i>`;
          editB.addEventListener("click", () => {
            editingGuideId = s.id;
            guideForm = {
              title: s.title || "",
              type: s.type || "steps",
              icon: s.icon || "list-numbers",
              iconColor: s.iconColor || "#A855F7",
              iconBg: s.iconBg || "rgba(168,85,247,0.15)",
              items: [...(s.items || [])]
            };
            guideEditorOpen = true;
            renderAll();
          });
          acts.appendChild(editB);
          
          const delB = document.createElement("button");
          delB.style.cssText = `width: 30px; height: 30px; border-radius: 7px; border: none; background: ${C.redLight}; color: ${C.red}; display: flex; align-items: center; justify-content: center; cursor: pointer; fontFamily: inherit;`;
          delB.innerHTML = `<i class="ph ph-trash" style="font-size: 13px;"></i>`;
          delB.addEventListener("click", async () => {
            if(!confirm(`حذف قسم "${s.title}"؟`)) return;
            setLoading(true);
            try { await db.ref("guide/sections/" + s.id).remove(); showToast("تم الحذف"); await loadAll(); }
            catch(e) { showToast("حدث خطأ"); }
            setLoading(false);
          });
          acts.appendChild(delB);
          item.appendChild(acts);
          list.appendChild(item);
        });
        content.appendChild(list);
      }
    }
    return content;
  }
  function renderFooterAdmin() {
    const content = document.createElement("div");
    content.appendChild(BackBtn({ onClick: () => { view = "menu"; renderAll(); } }));
    content.appendChild(SectionTitle({ title: "إدارة الفوتر" }));

    async function addSponsor() {
      if (!sponsorName.trim()) { showToast("أدخل اسم الراعي"); return; }
      setLoading(true);
      try {
        await db.ref("footer/sponsors").push({ name: sponsorName.trim(), link: sponsorLink.trim() || "https://wa.me/962778244772?text=" });
        sponsorName = ""; sponsorLink = "";
        showToast("تمت الإضافة"); await loadFooter();
      } catch { showToast("حدث خطأ"); }
      setLoading(false);
    }

    async function saveSocial() {
      if (!socialUrl.trim()) { showToast("أدخل الرابط"); return; }
      setLoading(true);
      try {
        await db.ref("footer/social/" + socialKey).set(socialUrl.trim());
        socialUrl = ""; showToast("تم الحفظ"); await loadFooter();
      } catch { showToast("حدث خطأ"); }
      setLoading(false);
    }

    async function loadFooter() {
      const [spSnap, soSnap, atSnap] = await Promise.all([
        db.ref("footer/sponsors").once("value"),
        db.ref("footer/social").once("value"),
        db.ref("footer/aboutText").once("value"),
      ]);
      footerSponsors = spSnap.val() || {};
      footerSocial = soSnap.val() || {};
      footerAbout = atSnap.val() || "";
      renderAll();
    }

    // Sponsors Section
    const spCard = document.createElement("div");
    spCard.style.cssText = `background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 14px; padding: 16px; margin-bottom: 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);`;
    spCard.innerHTML = `<div style="font-size: 13px; font-weight: 800; color: ${C.text}; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;"><i class="ph ph-crown" style="color: ${C.gold};"></i> بطاقات الرعاة</div>`;
    
    spCard.appendChild(Input({ label: "اسم الراعي", value: sponsorName, placeholder: "مثال: مركز السلام للتدريب", onChange: v => sponsorName = v }));
    spCard.appendChild(Input({ label: "رابط عند الضغط (اختياري)", value: sponsorLink, placeholder: "https://...", onChange: v => sponsorLink = v }));
    spCard.appendChild(Btn({ children: '<i class="ph ph-plus"></i> إضافة بطاقة', onClick: addSponsor }));
    
    const spArr = Object.entries(footerSponsors);
    if (spArr.length > 0) {
      const spList = document.createElement("div");
      spList.style.cssText = "margin-top: 14px; display: flex; flex-direction: column; gap: 8px;";
      spArr.forEach(([id, sp]) => {
        const item = document.createElement("div");
        item.style.cssText = `display: flex; align-items: center; gap: 10px; background: ${C.bg}; border-radius: 10px; padding: 10px 12px; border: 1px solid ${C.border};`;
        item.innerHTML = `
          <div style="width: 32px; height: 32px; border-radius: 8px; background: ${C.primaryLight}; color: ${C.primary}; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;"><i class="ph ph-steering-wheel"></i></div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 12px; font-weight: 700; color: ${C.text};">${sp.name || "بدون اسم"}</div>
            <div style="font-size: 11px; color: ${C.textSec}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${sp.link || "بدون رابط"}</div>
          </div>
        `;
        const delB = document.createElement("button");
        delB.style.cssText = `width: 28px; height: 28px; border-radius: 7px; border: none; background: ${C.redLight}; color: ${C.red}; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; fontFamily: inherit;`;
        delB.innerHTML = `<i class="ph ph-trash" style="font-size: 13px;"></i>`;
        delB.addEventListener("click", async () => {
          if (!confirm("حذف هذا الراعي؟")) return;
          setLoading(true);
          try { await db.ref("footer/sponsors/" + id).remove(); showToast("تم الحذف"); await loadFooter(); }
          catch { showToast("حدث خطأ"); }
          setLoading(false);
        });
        item.appendChild(delB);
        spList.appendChild(item);
      });
      spCard.appendChild(spList);
    }
    content.appendChild(spCard);

    // Social Section
    const soCard = document.createElement("div");
    soCard.style.cssText = `background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 14px; padding: 16px; margin-bottom: 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);`;
    soCard.innerHTML = `<div style="font-size: 13px; font-weight: 800; color: ${C.text}; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;"><i class="ph ph-share-network" style="color: ${C.primary};"></i> مواقع التواصل الاجتماعي</div>`;
    
    soCard.appendChild(Select({ label: "المنصة", value: socialKey, options: [
      { key: "facebook",  label: "فيسبوك", icon: "facebook-logo" },
      { key: "whatsapp",  label: "واتساب",  icon: "whatsapp-logo" },
      { key: "instagram", label: "انستغرام", icon: "instagram-logo" },
      { key: "x",         label: "تويتر / X", icon: "x-logo" }
    ].map(o => ({ label: o.label, value: o.key })), onChange: v => socialKey = v }));
    soCard.appendChild(Input({ label: "الرابط", value: socialUrl, placeholder: "https://...", onChange: v => socialUrl = v }));
    soCard.appendChild(Btn({ children: '<i class="ph ph-floppy-disk"></i> حفظ', onClick: saveSocial }));
    
    const socialEntries = Object.entries(footerSocial);
    if (socialEntries.length > 0) {
      const soList = document.createElement("div");
      soList.style.cssText = "margin-top: 14px; display: flex; flex-direction: column; gap: 8px;";
      socialEntries.forEach(([key, url]) => {
        const item = document.createElement("div");
        item.style.cssText = `display: flex; align-items: center; gap: 10px; background: ${C.bg}; border-radius: 10px; padding: 10px 12px; border: 1px solid ${C.border};`;
        item.innerHTML = `
          <div style="width: 32px; height: 32px; border-radius: 8px; background: ${C.primaryLight}; color: ${C.primary}; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;"><i class="ph ph-${key === 'x' ? 'x-logo' : key + '-logo'}"></i></div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 12px; font-weight: 700; color: ${C.text};">${key}</div>
            <div style="font-size: 11px; color: ${C.textSec}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${url}</div>
          </div>
        `;
        const delB = document.createElement("button");
        delB.style.cssText = `width: 28px; height: 28px; border-radius: 7px; border: none; background: ${C.redLight}; color: ${C.red}; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; fontFamily: inherit;`;
        delB.innerHTML = `<i class="ph ph-trash" style="font-size: 13px;"></i>`;
        delB.addEventListener("click", async () => {
          if (!confirm("حذف هذا الحساب؟")) return;
          setLoading(true);
          try { await db.ref("footer/social/" + key).remove(); showToast("تم الحذف"); await loadFooter(); }
          catch { showToast("حدث خطأ"); }
          setLoading(false);
        });
        item.appendChild(delB);
        soList.appendChild(item);
      });
      soCard.appendChild(soList);
    }
    content.appendChild(soCard);

    // About Section
    const abCard = document.createElement("div");
    abCard.style.cssText = `background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 14px; padding: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);`;
    abCard.innerHTML = `<div style="font-size: 13px; font-weight: 800; color: ${C.text}; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;"><i class="ph ph-text-align-right" style="color: ${C.primary};"></i> نص قسم "من نحن" في الفوتر</div>`;
    abCard.appendChild(TextArea({ label: "الوصف (اختياري)", value: footerAbout, placeholder: "منصة JO Driver هي دليلك الأول لاجتياز...", rows: 4, onChange: v => footerAbout = v }));
    abCard.appendChild(Btn({ children: '<i class="ph ph-floppy-disk"></i> حفظ الوصف', onClick: async () => {
      setLoading(true);
      try { await db.ref("footer/aboutText").set(footerAbout.trim() || null); showToast("تم الحفظ"); await loadFooter(); }
      catch { showToast("حدث خطأ"); }
      setLoading(false);
    }}));
    content.appendChild(abCard);

    return content;
  }

  function renderReviewsView() {
    const content = document.createElement("div");
    content.appendChild(BackBtn({ onClick: () => { view = "menu"; renderAll(); } }));
    
    const revEntriesRaw = Object.entries(reviews).sort((a, b) => (b[1].createdAt || "").localeCompare(a[1].createdAt || ""));
    const revEntries = revEntriesRaw.filter(([, r]) => {
      if (!revSearch.trim()) return true;
      const q = revSearch.trim().toLowerCase();
      return (r.name || "").toLowerCase().includes(q) || (r.comment || "").toLowerCase().includes(q);
    });

    content.appendChild(SectionTitle({ title: "آراء الزوار", count: revEntries.length }));

    const searchWrap = document.createElement("div");
    searchWrap.style.cssText = "position: relative; margin-bottom: 12px;";
    searchWrap.innerHTML = `<i class="ph ph-magnifying-glass" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: ${C.textLight}; font-size: 16px;"></i>`;
    const sInp = document.createElement("input");
    sInp.value = revSearch;
    sInp.placeholder = "البحث في التعليقات...";
    sInp.className = "admin-field";
    sInp.style.cssText = `width: 100%; padding: 10px 14px 10px 40px; border: 1.5px solid ${C.border}; borderRadius: 10px; background: ${C.surface}; fontSize: 14px; fontFamily: inherit; color: ${C.text}; outline: none;`;
    sInp.addEventListener("input", (e) => { revSearch = e.target.value; renderAll(); });
    searchWrap.appendChild(sInp);
    content.appendChild(searchWrap);

    if (revEntries.length === 0) {
      content.appendChild(Empty({ icon: "star", text: "لا توجد آراء" }));
    } else {
      const list = document.createElement("div");
      list.style.cssText = "display: flex; flex-direction: column; gap: 8px;";
      revEntries.forEach(([id, r]) => {
        const item = document.createElement("div");
        item.style.cssText = `background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 14px; padding: 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);`;
        
        const head = document.createElement("div");
        head.style.cssText = "display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;";
        
        const info = document.createElement("div");
        info.innerHTML = `
          <div style="font-size: 13px; font-weight: 800; color: ${C.text};">${r.name || "مجهول"}</div>
          <div style="font-size: 10px; color: ${C.textSec}; margin-top: 2px;">${r.createdAt ? new Date(r.createdAt).toLocaleString("ar-JO") : "-"}</div>
        `;
        head.appendChild(info);
        
        const stars = document.createElement("div");
        stars.style.cssText = `display: flex; gap: 2px; color: ${C.gold}; font-size: 12px;`;
        for (let i = 0; i < 5; i++) {
          stars.innerHTML += `<i class="ph ph-star${i < (r.stars || 0) ? "-fill" : ""}"></i>`;
        }
        head.appendChild(stars);
        item.appendChild(head);

        if (r.comment) {
          const comm = document.createElement("div");
          comm.style.cssText = `font-size: 12px; color: ${C.textSec}; line-height: 1.6; background: ${C.bg}; padding: 8px 10px; border-radius: 8px; margin-bottom: 8px;`;
          comm.textContent = r.comment;
          item.appendChild(comm);
        }

        const delB = document.createElement("button");
        delB.style.cssText = `padding: 6px 12px; border-radius: 8px; border: none; background: ${C.redLight}; color: ${C.red}; fontSize: 11px; fontWeight: 800; cursor: pointer; fontFamily: inherit; display: flex; align-items: center; gap: 4px;`;
        delB.innerHTML = `<i class="ph ph-trash"></i> حذف التعليق`;
        delB.addEventListener("click", async () => {
          if (!confirm("حذف هذا التعليق؟")) return;
          setLoading(true);
          try { await db.ref("reviews/" + id).remove(); showToast("تم الحذف"); await loadAll(); }
          catch { showToast("حدث خطأ"); }
          setLoading(false);
        });
        item.appendChild(delB);
        list.appendChild(item);
      });
      content.appendChild(list);
    }
    return content;
  }

  loadAll();
  renderAll();

  return () => {
    // Cleanup if needed
  };
}
