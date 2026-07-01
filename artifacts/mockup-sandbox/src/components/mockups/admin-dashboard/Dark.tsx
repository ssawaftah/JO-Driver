import './_group.css';

const stats = { gov: 12, area: 426, center: 2, user: 29, req: 0, q: 156, guide: 8, reviews: 15 };

const C = {
  bg: "#000000",
  surface: "#0A0A0A",
  surface2: "#141414",
  border: "#262626",
  text: "#FAFAFA",
  textSec: "#A3A3A3",
  textLight: "#525252",
  blue: "#3B82F6", blueLight: "rgba(59,130,246,0.1)",
  cyan: "#22D3EE", cyanLight: "rgba(34,211,238,0.1)",
  gold: "#FBBF24", goldLight: "rgba(251,191,36,0.1)",
  green: "#34D399", greenLight: "rgba(52,211,153,0.1)",
  purple: "#A78BFA", purpleLight: "rgba(167,139,250,0.1)",
  red: "#F87171", redLight: "rgba(248,113,113,0.1)",
};

const menuItems = [
  { icon: "users", title: "المستخدمين", desc: "عرض وحذف المستخدمين", count: stats.user, color: C.blue, bg: C.blueLight, iconColor: "#60A5FA" },
  { icon: "question", title: "الأسئلة", desc: "إضافة، تعديل، حذف", count: stats.q, color: C.gold, bg: C.goldLight, iconColor: "#FBBF24" },
  { icon: "book-open-text", title: "دليل المستخدم", desc: "إدارة أقسام الدليل", count: stats.guide, color: C.purple, bg: C.purpleLight, iconColor: "#A78BFA" },
  { icon: "clipboard-text", title: "طلبات الانتساب", desc: "مراجعة ونشر أو رفض", count: stats.req, color: C.gold, bg: C.goldLight, iconColor: "#FBBF24" },
  { icon: "layout", title: "إدارة الفوتر", desc: "الراعي، سوشيال، من نحن", color: C.cyan, bg: C.cyanLight, iconColor: "#22D3EE" },
  { icon: "star", title: "آراء الزوار", desc: "سجل التقييمات", count: stats.reviews, color: C.gold, bg: C.goldLight, iconColor: "#FBBF24" },
];

const geoItems = [
  { icon: "map-trifold", title: "إضافة محافظة", desc: "إنشاء محافظة جديدة", color: C.cyan, bg: C.cyanLight, iconColor: "#22D3EE" },
  { icon: "map-pin", title: "إضافة منطقة", desc: "ربط منطقة بمحافظة", color: C.blue, bg: C.blueLight, iconColor: "#60A5FA" },
  { icon: "buildings", title: "إضافة مركز", desc: "مركز تدريب جديد", color: C.gold, bg: C.goldLight, iconColor: "#FBBF24" },
  { icon: "pencil-simple", title: "تعديل البيانات", desc: "تعديل المحافظات والمناطق", color: C.blue, bg: C.blueLight, iconColor: "#60A5FA" },
  { icon: "trash", title: "حذف البيانات", desc: "إزالة البيانات", color: C.red, bg: C.redLight, iconColor: "#F87171" },
];

function StatCard({ label, value, icon, color, bg }: any) {
  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
      border: `1px solid ${C.border}`, borderRadius: 16,
      padding: "16px", display: "flex", alignItems: "center", gap: 12,
      backdropFilter: "blur(10px)",
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: bg, color,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0,
        boxShadow: `0 0 20px ${bg}`,
      }}>
        <i className={`ph ph-${icon}`} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 900, color: C.text, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: C.textSec, marginTop: 4, fontWeight: 700 }}>{label}</div>
      </div>
    </div>
  );
}

function MenuCard({ item }: { item: any }) {
  return (
    <button style={{
      width: "100%", background: C.surface2, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
      cursor: "pointer", fontFamily: "inherit", textAlign: "right" as const,
      transition: "all .2s", position: "relative",
    }} onMouseEnter={e => { e.currentTarget.style.borderColor = item.iconColor; e.currentTarget.style.boxShadow = `0 0 24px ${item.bg}`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}>
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

export function Dark() {
  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: "'Tajawal', sans-serif", direction: "rtl", padding: "16px 14px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.text }}>JO Driver</div>
          <div style={{ fontSize: 12, color: C.textSec, fontWeight: 700 }}>لوحة التحكم</div>
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
          color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          boxShadow: "0 0 30px rgba(59,130,246,0.3)",
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
