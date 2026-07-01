import './_group.css';

const stats = { gov: 12, area: 426, center: 2, user: 29, req: 0, q: 156, guide: 8, reviews: 15 };

const C = {
  bg: "#0F172A",
  surface: "#1E293B",
  surface2: "#334155",
  border: "#475569",
  text: "#F8FAFC",
  textSec: "#94A3B8",
  textLight: "#64748B",
  blue: "#3B82F6", blueLight: "rgba(59,130,246,0.15)",
  cyan: "#06B6D4", cyanLight: "rgba(6,182,212,0.15)",
  gold: "#F59E0B", goldLight: "rgba(245,158,11,0.15)",
  green: "#10B981", greenLight: "rgba(16,185,129,0.15)",
  purple: "#8B5CF6", purpleLight: "rgba(139,92,246,0.15)",
  red: "#EF4444", redLight: "rgba(239,68,68,0.15)",
};

const menuItems = [
  { icon: "users", title: "المستخدمين", desc: "عرض وحذف المستخدمين", count: stats.user, color: C.blue, bg: C.blueLight },
  { icon: "question", title: "الأسئلة", desc: "إضافة، تعديل، حذف الأسئلة", count: stats.q, color: C.gold, bg: C.goldLight },
  { icon: "book-open-text", title: "دليل المستخدم", desc: "إدارة أقسام الدليل", count: stats.guide, color: C.purple, bg: C.purpleLight },
  { icon: "clipboard-text", title: "طلبات الانتساب", desc: "مراجعة ونشر أو رفض", count: stats.req, color: C.gold, bg: C.goldLight },
  { icon: "layout", title: "إدارة الفوتر", desc: "الراعي، سوشيال، من نحن", color: C.cyan, bg: C.cyanLight },
  { icon: "star", title: "آراء الزوار", desc: "سجل التقييمات والملاحظات", count: stats.reviews, color: C.gold, bg: C.goldLight },
];

const geoItems = [
  { icon: "map-trifold", title: "إضافة محافظة", desc: "إنشاء محافظة جديدة", color: C.cyan, bg: C.cyanLight },
  { icon: "map-pin", title: "إضافة منطقة", desc: "ربط منطقة بمحافظة", color: C.blue, bg: C.blueLight },
  { icon: "buildings", title: "إضافة مركز", desc: "إضافة مركز تدريب جديد", color: C.gold, bg: C.goldLight },
  { icon: "pencil-simple", title: "تعديل البيانات", desc: "تعديل المحافظات والمناطق", color: C.blue, bg: C.blueLight },
  { icon: "trash", title: "حذف البيانات", desc: "إزالة البيانات", color: C.red, bg: C.redLight },
];

function StatCard({ label, value, icon, color, bg }: any) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${bg}, ${C.surface})`,
      border: `1px solid ${C.border}`, borderRadius: 16,
      padding: "16px", display: "flex", alignItems: "center", gap: 12,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: -10, right: -10, width: 50, height: 50,
        borderRadius: "50%", background: bg, opacity: 0.3,
      }} />
      <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, position: "relative" }}>
        <i className={`ph ph-${icon}`} />
      </div>
      <div style={{ position: "relative" }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: C.text, lineHeight: 1 }}>{value}</div>
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
      transition: "all .2s", position: "relative", overflow: "hidden",
    }} onMouseEnter={e => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 4px 20px ${item.bg}`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: item.bg, color: item.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
        <i className={`ph ph-${item.icon}`} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{item.title}</span>
          {item.count !== undefined && <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: item.bg, color: item.color }}>{item.count}</span>}
        </div>
        <div style={{ fontSize: 12, color: C.textSec, marginTop: 2, lineHeight: 1.5 }}>{item.desc}</div>
      </div>
      <i className="ph ph-caret-left" style={{ fontSize: 16, color: C.textLight, flexShrink: 0 }} />
    </button>
  );
}

export function Bold() {
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
          background: "linear-gradient(135deg, #3B82F6, #06B6D4)",
          color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          boxShadow: "0 4px 16px rgba(59,130,246,0.4)",
        }}>
          <i className="ph ph-steering-wheel" />
        </div>
      </div>

      {/* Stats - 2x2 Grid */}
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
