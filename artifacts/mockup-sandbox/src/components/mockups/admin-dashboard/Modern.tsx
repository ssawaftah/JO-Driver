import './_group.css';

const stats = { gov: 12, area: 426, center: 2, user: 29, req: 0, q: 156, guide: 8, reviews: 15 };

const C = {
  bg: "#FAFBFC",
  surface: "#FFFFFF",
  surface2: "#F8FAFC",
  border: "#E2E8F0",
  text: "#0F172A",
  textSec: "#64748B",
  textLight: "#94A3B8",
  blue: "#2563EB", blueLight: "#EFF6FF",
  cyan: "#0891B2", cyanLight: "#ECFEFF",
  gold: "#D97706", goldLight: "#FFFBEB",
  green: "#059669", greenLight: "#ECFDF5",
  purple: "#7C3AED", purpleLight: "#F5F3FF",
  red: "#DC2626", redLight: "#FEF2F2",
};

const menuItems = [
  { icon: "users", title: "المستخدمين", desc: "عرض وحذف المستخدمين", count: stats.user, color: C.blue, bg: C.blueLight, iconColor: "#2563EB" },
  { icon: "question", title: "الأسئلة", desc: "إضافة، تعديل، حذف", count: stats.q, color: C.gold, bg: C.goldLight, iconColor: "#D97706" },
  { icon: "book-open-text", title: "دليل المستخدم", desc: "إدارة أقسام الدليل", count: stats.guide, color: C.purple, bg: C.purpleLight, iconColor: "#7C3AED" },
  { icon: "clipboard-text", title: "طلبات الانتساب", desc: "مراجعة ونشر أو رفض", count: stats.req, color: C.gold, bg: C.goldLight, iconColor: "#D97706" },
  { icon: "layout", title: "إدارة الفوتر", desc: "الراعي، سوشيال، من نحن", color: C.cyan, bg: C.cyanLight, iconColor: "#0891B2" },
  { icon: "star", title: "آراء الزوار", desc: "سجل التقييمات", count: stats.reviews, color: C.gold, bg: C.goldLight, iconColor: "#D97706" },
];

const geoItems = [
  { icon: "map-trifold", title: "إضافة محافظة", desc: "إنشاء محافظة جديدة", color: C.cyan, bg: C.cyanLight, iconColor: "#0891B2" },
  { icon: "map-pin", title: "إضافة منطقة", desc: "ربط منطقة بمحافظة", color: C.blue, bg: C.blueLight, iconColor: "#2563EB" },
  { icon: "buildings", title: "إضافة مركز", desc: "مركز تدريب جديد", color: C.gold, bg: C.goldLight, iconColor: "#D97706" },
  { icon: "pencil-simple", title: "تعديل البيانات", desc: "تعديل المحافظات والمناطق", color: C.blue, bg: C.blueLight, iconColor: "#2563EB" },
  { icon: "trash", title: "حذف البيانات", desc: "إزالة البيانات", color: C.red, bg: C.redLight, iconColor: "#DC2626" },
];

function StatCard({ label, value, icon, color, bg }: any) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
      padding: "16px", display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: bg, color,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0,
      }}>
        <i className={`ph ph-${icon}`} />
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 900, color: C.text, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: C.textSec, marginTop: 4, fontWeight: 700 }}>{label}</div>
      </div>
    </div>
  );
}

function MenuCard({ item }: { item: any }) {
  return (
    <button style={{
      width: "100%", background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
      cursor: "pointer", fontFamily: "inherit", textAlign: "right" as const,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "all .2s",
    }} onMouseEnter={e => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: item.bg, color: item.iconColor,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
      }}>
        <i className={`ph ph-${item.icon}`} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{item.title}</span>
          {item.count !== undefined && (
            <span style={{
              fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 20,
              background: item.bg, color: item.iconColor,
            }}>{item.count}</span>
          )}
        </div>
        <div style={{ fontSize: 12, color: C.textSec, marginTop: 2, lineHeight: 1.5 }}>{item.desc}</div>
      </div>
      <i className="ph ph-caret-left" style={{ fontSize: 16, color: C.textLight, flexShrink: 0 }} />
    </button>
  );
}

export function Modern() {
  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: "'Tajawal', sans-serif", direction: "rtl", padding: "16px 14px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: C.text }}>JO Driver</div>
          <div style={{ fontSize: 12, color: C.textSec, fontWeight: 600 }}>لوحة التحكم</div>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: C.blue, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>
          <i className="ph ph-steering-wheel" />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        <StatCard label="محافظة" value={stats.gov} icon="map-trifold" color={C.cyan} bg={C.cyanLight} />
        <StatCard label="منطقة" value={stats.area} icon="map-pin" color={C.blue} bg={C.blueLight} />
        <StatCard label="مركز" value={stats.center} icon="buildings" color={C.gold} bg={C.goldLight} />
        <StatCard label="مستخدم" value={stats.user} icon="users" color={C.green} bg={C.greenLight} />
      </div>

      {/* Management */}
      <div style={{ fontSize: 11, fontWeight: 800, color: C.textLight, marginBottom: 12, padding: "0 4px", letterSpacing: "0.5px" }}>الإدارة</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {menuItems.map((item, i) => <MenuCard key={i} item={item} />)}
      </div>

      {/* Geographic */}
      <div style={{ fontSize: 11, fontWeight: 800, color: C.textLight, marginTop: 20, marginBottom: 12, padding: "0 4px", letterSpacing: "0.5px" }}>البيانات الجغرافية</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {geoItems.map((item, i) => <MenuCard key={i} item={item} />)}
      </div>
    </div>
  );
}
