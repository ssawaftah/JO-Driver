import './_group.css';
import { useState } from 'react';

// Mock data
const stats = { gov: 12, area: 426, center: 2, user: 29, req: 0, q: 156, guide: 8, reviews: 15 };

const C = {
  primary: "#246BFD", primaryLight: "#E8F0FE", primaryDark: "#1a54d4",
  bg: "#F6F8FB", surface: "#FFFFFF", surface2: "#F9FAFB",
  border: "#E8EAED", borderHover: "#246BFD",
  text: "#1A1D1F", textSec: "#6B7280", textLight: "#9CA3AF",
  green: "#16A34A", greenLight: "#DCFCE7",
  red: "#DC2626", redLight: "#FEE2E2",
  gold: "#D97706", goldLight: "#FEF3C7",
  purple: "#7C3AED", purpleLight: "#EDE9FE",
  cyan: "#0891B2", cyanLight: "#CFFAFE",
  pink: "#EC4899", pinkLight: "#FCE7F3",
};

function Card({ icon, color, colorBg, title, desc, onClick, count }: any) {
  return (
    <button onClick={onClick} style={{
      width: "100%", background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
      cursor: "pointer", fontFamily: "inherit", textAlign: "right" as const,
      boxShadow: "0 1px 2px rgba(0,0,0,0.03)", transition: "all .15s",
    }}>
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

function StatCard({ label, value, icon, color, bg }: any) {
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

export function Current() {
  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: "'Tajawal', sans-serif", direction: "rtl", padding: "16px 14px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: C.text }}>JO Driver</div>
          <div style={{ fontSize: 12, color: C.textSec }}>لوحة التحكم</div>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: C.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
          <i className="ph ph-steering-wheel" />
        </div>
      </div>

      {/* Stats */}
      <div style={{ fontSize: 18, fontWeight: 900, color: C.text, marginBottom: 16, letterSpacing: "-0.3px" }}>لوحة التحكم</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        <StatCard label="محافظة" value={stats.gov} icon="map-trifold" color={C.cyan} bg={C.cyan} />
        <StatCard label="منطقة" value={stats.area} icon="map-pin" color={C.primary} bg={C.primary} />
        <StatCard label="مركز" value={stats.center} icon="buildings" color={C.gold} bg={C.gold} />
        <StatCard label="مستخدم" value={stats.user} icon="users" color={C.green} bg={C.green} />
      </div>

      {/* Management */}
      <div style={{ fontSize: 11, fontWeight: 800, color: C.textLight, marginBottom: 12, padding: "0 4px", letterSpacing: "0.5px", textTransform: "uppercase" as const }}>الإدارة</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Card icon="users" color={C.primary} colorBg={C.primary} title="المستخدمين" desc="عرض وحذف المستخدمين" onClick={() => {}} count={stats.user} />
        <Card icon="question" color={C.gold} colorBg={C.gold} title="الأسئلة" desc="إضافة، تعديل، حذف الأسئلة" onClick={() => {}} count={stats.q} />
        <Card icon="book-open-text" color={C.purple} colorBg={C.purple} title="دليل المستخدم" desc="إدارة أقسام الدليل" onClick={() => {}} count={stats.guide} />
        <Card icon="clipboard-text" color={C.pink} colorBg={C.pink} title="طلبات الانتساب" desc="مراجعة ونشر أو رفض" onClick={() => {}} count={stats.req} />
        <Card icon="layout" color={C.cyan} colorBg={C.cyan} title="إدارة الفوتر" desc="الراعي الرسمي، سوشيال ميديا، من نحن" onClick={() => {}} />
        <Card icon="star" color={C.gold} colorBg={C.gold} title="آراء الزوار" desc="سجل التقييمات والملاحظات" onClick={() => {}} count={stats.reviews} />
      </div>

      {/* Geographic Data */}
      <div style={{ fontSize: 11, fontWeight: 800, color: C.textLight, marginTop: 20, marginBottom: 12, padding: "0 4px", letterSpacing: "0.5px", textTransform: "uppercase" as const }}>البيانات الجغرافية</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Card icon="map-trifold" color={C.cyan} colorBg={C.cyan} title="إضافة محافظة" desc="إنشاء محافظة جديدة" onClick={() => {}} />
        <Card icon="map-pin" color={C.primary} colorBg={C.primary} title="إضافة منطقة" desc="ربط منطقة بمحافظة" onClick={() => {}} />
        <Card icon="buildings" color={C.gold} colorBg={C.gold} title="إضافة مركز" desc="إضافة مركز تدريب جديد" onClick={() => {}} />
        <Card icon="pencil-simple" color={C.primary} colorBg={C.primary} title="تعديل البيانات" desc="تعديل المحافظات والمناطق والمراكز" onClick={() => {}} />
        <Card icon="trash" color={C.red} colorBg={C.red} title="حذف البيانات" desc="إزالة المحافظات أو المناطق أو المراكز" onClick={() => {}} />
      </div>
    </div>
  );
}
