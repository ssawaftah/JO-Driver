import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import type { Governorate, Area, Center } from "../types";
import Header from "../components/Header";
import AppFooter from "../components/Footer";

interface Props {
  govs: Record<string, Governorate>;
  areas: Record<string, Area>;
  centers: Record<string, Center>;
}

/* ── Day helpers ───────────────────────────────────────── */
const ALL_DAYS_SHORT = ["س","ح","ن","ث","ر","خ","ج"];
const ALL_DAYS_FULL = ["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];

/* ── Open-status badge (based on user's device time) ───── */
function getOpenStatus(
  schedule?: { closed: boolean; from: string; to: string }[],
  workingDays?: string[],
  workingHours?: string
): { label: string; color: string; bg: string; icon: string } {
  const now = new Date();
  // JS getDay: 0=Sun, 1=Mon ... we need to map to Arabic day names
  const dayMap = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const todayName = dayMap[now.getDay()];

  // Parse hours from schedule (preferred) or workingHours fallback
  let fromStr: string | null = null;
  let toStr: string | null = null;
  let isClosed = false;

  if (schedule && schedule.length === 7) {
    const todayIdx = ALL_DAYS_FULL.indexOf(todayName);
    if (todayIdx >= 0) {
      const s = schedule[todayIdx];
      isClosed = s.closed;
      fromStr = s.from;
      toStr = s.to;
    }
  }
  if (!fromStr && workingHours) {
    const m = workingHours.match(/(\d{1,2}:\d{2})/g);
    if (m && m.length >= 2) { fromStr = m[0]; toStr = m[1]; }
  }
  if (workingDays && workingDays.length > 0 && !workingDays.includes(todayName)) {
    isClosed = true;
  }

  if (isClosed || !fromStr || !toStr) {
    return { label: "مغلق اليوم", color: "#991B1B", bg: "#FEF2F2", icon: "ph-moon" };
  }

  const hm = (s: string) => {
    const [h, m] = s.split(":").map(Number);
    return h * 60 + m;
  };
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const fromMin = hm(fromStr);
  const toMin = hm(toStr);

  if (nowMin < fromMin) {
    const mins = fromMin - nowMin;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return {
      label: h > 0 ? `يفتح بعد ${h}س ${m > 0 ? m + "د" : ""}` : `يفتح بعد ${m}د`,
      color: "#92400E", bg: "#FFF7ED", icon: "ph-clock-countdown",
    };
  }
  if (nowMin <= toMin) {
    const mins = toMin - nowMin;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return {
      label: h > 0 ? `مفتوح · يغلق بعد ${h}س ${m > 0 ? m + "د" : ""}` : `مفتوح · يغلق بعد ${m}د`,
      color: "#166534", bg: "#F0FDF4", icon: "ph-door-open",
    };
  }
  return { label: "مغلق الآن", color: "#991B1B", bg: "#FEF2F2", icon: "ph-moon" };
}

/* ── Google-style star rating display ─────────────────────── */
function GoogleStars({ rating, reviewCount }: { rating?: number; reviewCount?: number }) {
  if (rating == null) return null;
  const full = Math.round(rating);          // 4.7 → 5, 4.2 → 4
  const empty = 5 - full;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, direction: "ltr" as const }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: "#1F2937" }}>{rating.toFixed(1)}</span>
      <div style={{ display: "flex", gap: 1 }}>
        {Array.from({ length: full }).map((_, i) => (
          <i key={`f${i}`} className="ph-fill ph-star" style={{ fontSize: 14, color: "#F59E0B" }} />
        ))}
        {Array.from({ length: Math.max(0, empty) }).map((_, i) => (
          <i key={`e${i}`} className="ph ph-star" style={{ fontSize: 14, color: "#D1D5DB" }} />
        ))}
      </div>
      {reviewCount != null && reviewCount > 0 && (
        <span style={{ fontSize: 12, color: "#6B7280" }}>({reviewCount})</span>
      )}
    </div>
  );
}

/* ── Schedule table (per-day hours) ─────────────────────── */
function ScheduleTable({ schedule, workingDays }: {
  schedule?: { closed: boolean; from: string; to: string }[];
  workingDays?: string[];
}) {
  if (!schedule || schedule.length === 0) return null;
  const rows = ALL_DAYS_FULL.map((day, i) => {
    const s = schedule[i];
    const on = s ? !s.closed : (workingDays || []).includes(day);
    return { day, short: ALL_DAYS_SHORT[i], on, from: s?.from, to: s?.to };
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {rows.map(r => (
        <div key={r.day} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "6px 10px", borderRadius: 8,
          background: r.on ? "#F8FAFC" : "transparent",
          opacity: r.on ? 1 : 0.45,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              width: 22, height: 22, borderRadius: 6,
              background: r.on ? "#2563EB" : "#E5E7EB",
              color: r.on ? "#fff" : "#9CA3AF",
              fontSize: 11, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{r.short}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{r.day}</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: r.on ? "#2563EB" : "#9CA3AF" }}>
            {r.on ? `${r.from} – ${r.to}` : "مغلق"}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Phone call button ─────────────────────────────────── */
function PhoneBtn({ phone }: { phone: string }) {
  const clean = phone.replace(/[^0-9+]/g, "");
  return (
    <a
      href={`tel:${clean}`}
      style={{
        flex: 1, height: 40, borderRadius: 12,
        border: "1.5px solid #E5E7EB",
        background: "#F9FAFB", color: "#374151",
        fontSize: 13, fontWeight: 700,
        cursor: "pointer", fontFamily: "inherit",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        textDecoration: "none",
        transition: "all 0.2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "#F0F9FF"; e.currentTarget.style.borderColor = "#246BFD"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
    >
      <i className="ph ph-phone" style={{ fontSize: 16, color: "#246BFD" }} />
      {phone}
    </a>
  );
}

/* ── WhatsApp button ─────────────────────────────────────── */
function WhatsAppBtn({ phone }: { phone: string }) {
  const clean = phone.replace(/[^0-9+]/g, "").replace(/^\+/, "");
  return (
    <a
      href={`https://wa.me/${clean}`}
      target="_blank"
      rel="noreferrer"
      style={{
        flex: 1, height: 38, borderRadius: 10,
        border: "1.5px solid #D1FAE5",
        background: "#ECFDF5", color: "#059669",
        fontSize: 12, fontWeight: 700,
        cursor: "pointer", fontFamily: "inherit",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
        textDecoration: "none",
        transition: "all 0.2s",
      }}
    >
      <i className="ph ph-whatsapp-logo" style={{ fontSize: 16 }} />
      واتساب
    </a>
  );
}

/* ── Share button helper ───────────────────────────────── */
function ShareBtn({ centerId, centerName }: { centerId: string; centerName: string }) {
  return (
    <button
      onClick={() => {
        const url = `${window.location.origin}/centers/${centerId}`;
        if (navigator.share) {
          navigator.share({ title: `مركز تدريب — ${centerName}`, url });
        } else {
          navigator.clipboard.writeText(url);
        }
      }}
      style={{
        width: 38, height: 38, borderRadius: 10,
        border: "1.5px solid #E2E8F0", background: "#F8FAFC",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", flexShrink: 0,
      }}
    >
      <i className="ph ph-share-network" style={{ fontSize: 16, color: "#64748B" }} />
    </button>
  );
}

/* ── Center Card (redesigned) ──────────────────────────────── */
function CenterCard({ c, govName, onClick }: { c: Center & { id: string }; govName: string; onClick?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const activeDays = c.workingDays || [];
  const status = getOpenStatus(c.schedule, activeDays, c.workingHours);
  const isPromoted = !!c.promoted;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        border: isPromoted ? "2px solid #FBBF24" : "1.5px solid #F0F1F3",
        boxShadow: isPromoted
          ? "0 2px 8px rgba(251,191,36,0.12)"
          : "0 1px 3px rgba(0,0,0,0.04)",
        padding: "14px 16px",
        cursor: onClick ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Promoted crown badge — subtle */}
      {isPromoted && (
        <div style={{
          position: "absolute", top: -1, left: 14,
          background: "#FBBF24", color: "#78350F",
          fontSize: 10, fontWeight: 900,
          padding: "2px 8px", borderRadius: "0 0 6px 6px",
          display: "flex", alignItems: "center", gap: 3,
        }}>
          <i className="ph-fill ph-crown" style={{ fontSize: 10 }} />
          مميز
        </div>
      )}

      {/* Row 1: Name + open-status + rating */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15, fontWeight: 900,
            color: "#111827", lineHeight: 1.4,
            marginBottom: 6,
            paddingTop: isPromoted ? 12 : 0,
          }}>
            {c.name}
          </div>
          {/* Status badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            background: status.bg, color: status.color,
            fontSize: 11, fontWeight: 800,
            padding: "3px 10px", borderRadius: 20,
          }}>
            <i className={`ph ${status.icon}`} style={{ fontSize: 12 }} />
            {status.label}
          </div>
        </div>
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <GoogleStars rating={c.rating} reviewCount={c.reviewCount} />
        </div>
      </div>

      {/* Row 2: Location tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
        <span style={{
          fontSize: 11, fontWeight: 700,
          padding: "3px 9px", borderRadius: 20,
          background: "#F3F4F6", color: "#6B7280",
          display: "inline-flex", alignItems: "center", gap: 4,
        }}>
          <i className="ph ph-map-trifold" style={{ fontSize: 12 }} />
          {govName}
        </span>
        {c.areas?.slice(0, 3).map(a => (
          <span key={a.id} style={{
            fontSize: 11, fontWeight: 700,
            padding: "3px 9px", borderRadius: 20,
            background: "#EEF4FF", color: "#246BFD",
          }}>
            {a.name}
          </span>
        ))}
        {(c.areas?.length || 0) > 3 && (
          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "#F3F4F6", color: "#9CA3AF" }}>
            +{(c.areas!.length - 3)}
          </span>
        )}
      </div>

      {/* Row 3: Actions + Detail arrow */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }} onClick={e => e.stopPropagation()}>
        {c.phone && <PhoneBtn phone={c.phone} />}
        {(c.whatsapp || c.phone) && <WhatsAppBtn phone={c.whatsapp || c.phone!} />}
        {c.mapLink && (
          <a href={c.mapLink} target="_blank" rel="noreferrer"
            style={{
              flex: 1, height: 38, borderRadius: 10,
              background: "#246BFD", color: "#fff",
              fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              textDecoration: "none",
            }}
          >
            <i className="ph ph-map-pin-line" style={{ fontSize: 15 }} />
            الموقع
          </a>
        )}
        <ShareBtn centerId={c.id} centerName={c.name} />
        <button
          onClick={(e) => { e.stopPropagation(); onClick?.(); }}
          style={{
            width: 38, height: 38, borderRadius: 10,
            border: "1.5px solid #E5E7EB", background: "#F9FAFB",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#F0F9FF"; e.currentTarget.style.borderColor = "#246BFD"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
        >
          <i className="ph ph-arrow-left" style={{ fontSize: 18, color: "#246BFD" }} />
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            width: 38, height: 38, borderRadius: 10,
            border: "1.5px solid #E5E7EB", background: "#F9FAFB",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
          }}
        >
          <i className={`ph ph-caret-${expanded ? "up" : "down"}`} style={{ fontSize: 16, color: "#6B7280" }} />
        </button>
      </div>

      {/* ── Expanded: schedule table + address ── */}
      {expanded && (
        <div style={{
          borderTop: "1px solid #F3F4F6",
          marginTop: 12,
          paddingTop: 12,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}>
          {/* Per-day schedule table */}
          <ScheduleTable schedule={c.schedule} workingDays={activeDays} />

          {c.address && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#6B7280" }}>
              <i className="ph ph-map-pin" style={{ fontSize: 15, color: "#9CA3AF", flexShrink: 0, marginTop: 2 }} />
              <span style={{ lineHeight: 1.5 }}>{c.address}</span>
            </div>
          )}
          {c.workingHours && !c.schedule && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <i className="ph ph-clock" style={{ fontSize: 15, color: "#9CA3AF", flexShrink: 0 }} />
              <span style={{
                fontSize: 13, fontWeight: 700, color: "#374151",
                background: "#F3F6FF", borderRadius: 8, padding: "4px 10px",
              }}>
                {c.workingHours}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Join Request Form ─────────────────────────────────── */
export function JoinRequestForm({ govs, areas, onClose }: {
  govs: Record<string, Governorate>;
  areas: Record<string, Area>;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [govId, setGovId] = useState("");
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
  const [mapLink, setMapLink] = useState("");
  const [rating, setRating] = useState("0");
  const [startHour, setStartHour] = useState("08:00");
  const [endHour, setEndHour] = useState("16:00");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const govList = useMemo(() =>
    Object.entries(govs).map(([id, g]) => ({ id, ...g })).sort((a, b) => a.name.localeCompare(b.name, "ar")),
    [govs]
  );
  const govAreas = useMemo(() =>
    govId
      ? Object.entries(areas)
          .filter(([, a]) => a.governorateId === govId)
          .map(([id, a]) => ({ id, ...a }))
          .sort((a, b) => a.name.localeCompare(b.name, "ar"))
      : [],
    [areas, govId]
  );

  function toggleArea(id: string) {
    setSelectedAreaIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
  function toggleDay(day: string) {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(x => x !== day) : [...prev, day]);
  }

  async function submit() {
    if (!name.trim()) { alert("أدخل اسم المركز"); return; }
    if (!phone.trim()) { alert("أدخل رقم الهاتف"); return; }
    if (!govId) { alert("اختر المحافظة"); return; }
    if (selectedAreaIds.length === 0) { alert("اختر منطقة واحدة على الأقل"); return; }
    if (selectedDays.length === 0) { alert("اختر يوم دوام واحد على الأقل"); return; }

    const areaObjs = selectedAreaIds.map(id => ({ id, name: areas[id]?.name || "" }));
    setSending(true);
    try {
      const { db } = await import("../lib/firebase");
      await db.ref("centerRequests").push({
        name: name.trim(),
        address: address.trim() || null,
        phone: phone.trim(),
        governorateId: govId,
        areas: areaObjs,
        mapLink: mapLink.trim() || null,
        rating: parseFloat(rating) || 0,
        workingHours: `${startHour.trim()} – ${endHour.trim()}`,
        workingDays: selectedDays,
        submittedAt: new Date().toISOString(),
        status: "pending",
      });
      setSent(true);
    } catch {
      alert("حدث خطأ أثناء الإرسال. حاول مجدداً.");
    }
    setSending(false);
  }

  if (sent) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "#F6F8FB" }}>
        <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, background: "#fff", borderBottom: "1.5px solid #F0F1F3" }}>
          <button onClick={onClose} style={{
            width: 40, height: 40, borderRadius: 12,
            border: "1.5px solid #E5E7EB", background: "#F9FAFB",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}>
            <i className="ph ph-arrow-right" style={{ fontSize: 19, color: "#246BFD" }} />
          </button>
          <div style={{ fontSize: 17, fontWeight: 900, color: "#111827" }}>طلب انضمام مركز</div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 50,
            background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className="ph ph-check-circle" style={{ fontSize: 44, color: "#16A34A" }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#111827", marginBottom: 6 }}>تم إرسال طلبك!</div>
            <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>
              سيتم مراجعة معلومات مركزك ونشره قريباً
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#246BFD", color: "#fff", fontSize: 14, fontWeight: 800,
              padding: "12px 32px", borderRadius: 12, border: "none",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "#F6F8FB" }}>
      {/* Header */}
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, background: "#fff", borderBottom: "1.5px solid #F0F1F3", flexShrink: 0 }}>
        <button onClick={onClose} style={{
          width: 40, height: 40, borderRadius: 12,
          border: "1.5px solid #E5E7EB", background: "#F9FAFB",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}>
          <i className="ph ph-arrow-right" style={{ fontSize: 19, color: "#246BFD" }} />
        </button>
        <div>
          <div style={{ fontSize: 17, fontWeight: 900, color: "#111827" }}>طلب انضمام مركز</div>
          <div style={{ fontSize: 12, color: "#9CA3AF" }}>املأ البيانات وسيتم النشر بعد المراجعة</div>
        </div>
      </div>

      {/* Form */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Basic info */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1.5px solid #F0F1F3" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#246BFD", marginBottom: 10, padding: "4px 10px", background: "#EEF4FF", borderRadius: 8, display: "inline-block" }}>
            المعلومات الأساسية
          </div>
          <Field label="اسم المركز" value={name} onChange={setName} placeholder="اسم المركز التدريبي" />
          <Field label="العنوان" value={address} onChange={setAddress} placeholder="العنوان التفصيلي" />
          <Field label="رقم الهاتف" value={phone} onChange={setPhone} placeholder="07XXXXXXXX" type="tel" />
          <Field label="رابط الخريطة" value={mapLink} onChange={setMapLink} placeholder="Google Maps URL (اختياري)" />
        </div>

        {/* Location */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1.5px solid #F0F1F3" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#246BFD", marginBottom: 10, padding: "4px 10px", background: "#EEF4FF", borderRadius: 8, display: "inline-block" }}>
            الموقع
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>المحافظة</label>
            <select
              value={govId}
              onChange={e => { setGovId(e.target.value); setSelectedAreaIds([]); }}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10,
                border: "1.5px solid #E5E7EB", background: "#F9FAFB",
                fontSize: 14, fontFamily: "inherit", color: "#374151",
                cursor: "pointer",
              }}
            >
              <option value="">اختر المحافظة</option>
              {govList.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>

          {govAreas.length > 0 && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>المناطق المخدّمة (اختر واحدة أو أكثر)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {govAreas.map(a => (
                  <button
                    key={a.id}
                    onClick={() => toggleArea(a.id)}
                    style={{
                      padding: "6px 12px", borderRadius: 10,
                      border: `1.5px solid ${selectedAreaIds.includes(a.id) ? "#246BFD" : "#E5E7EB"}`,
                      background: selectedAreaIds.includes(a.id) ? "#EEF4FF" : "#F9FAFB",
                      color: selectedAreaIds.includes(a.id) ? "#246BFD" : "#6B7280",
                      fontSize: 12, fontWeight: 700,
                      cursor: "pointer", fontFamily: "inherit",
                      transition: "all 0.15s",
                    }}
                  >
                    <i className={`ph ph-${selectedAreaIds.includes(a.id) ? "check-square" : "square"}`} style={{ fontSize: 13, marginLeft: 4 }} />
                    {a.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Working hours */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1.5px solid #F0F1F3" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#246BFD", marginBottom: 10, padding: "4px 10px", background: "#EEF4FF", borderRadius: 8, display: "inline-block" }}>
            أوقات وإيام الدوام
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>من</label>
              <input
                type="time"
                value={startHour}
                onChange={e => setStartHour(e.target.value)}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 10,
                  border: "1.5px solid #E5E7EB", background: "#F9FAFB",
                  fontSize: 14, fontFamily: "inherit", color: "#374151",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>إلى</label>
              <input
                type="time"
                value={endHour}
                onChange={e => setEndHour(e.target.value)}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 10,
                  border: "1.5px solid #E5E7EB", background: "#F9FAFB",
                  fontSize: 14, fontFamily: "inherit", color: "#374151",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 8 }}>أيام الدوام</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {ALL_DAYS_FULL.map((day, i) => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  style={{
                    width: 42, height: 42, borderRadius: 10,
                    border: `1.5px solid ${selectedDays.includes(day) ? "#246BFD" : "#E5E7EB"}`,
                    background: selectedDays.includes(day) ? "#246BFD" : "#F9FAFB",
                    color: selectedDays.includes(day) ? "#fff" : "#6B7280",
                    fontSize: 14, fontWeight: 800,
                    cursor: "pointer", fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  {ALL_DAYS_SHORT[i]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rating */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1.5px solid #F0F1F3" }}>
          <Field label="التقييم (0–5)" value={rating} onChange={setRating} type="number" min="0" max="5" step="0.1" />
        </div>

        {/* Submit */}
        <button
          onClick={submit}
          disabled={sending}
          style={{
            background: "#246BFD", color: "#fff",
            fontSize: 15, fontWeight: 800,
            padding: "14px", borderRadius: 12,
            border: "none", cursor: sending ? "wait" : "pointer",
            fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            opacity: sending ? 0.7 : 1,
            marginBottom: 30,
          }}
        >
          <i className="ph ph-paper-plane-right" style={{ fontSize: 18 }} />
          {sending ? "جاري الإرسال..." : "إرسال الطلب"}
        </button>
      </div>
    </div>
  );
}

/* ── Field helper for JoinRequestForm ──────────────────── */
function Field({ label, value, onChange, placeholder, type = "text", min, max, step }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; min?: string; max?: string; step?: string;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "10px 14px", borderRadius: 10,
          border: "1.5px solid #E5E7EB", background: "#F9FAFB",
          fontSize: 14, fontFamily: "inherit", color: "#374151",
        }}
      />
    </div>
  );
}

/* ── Root ────────────────────────────────────────────────── */
export default function Centers({ govs: govsProp, areas: areasProp, centers: centersProp }: Props) {
  const navigate = useNavigate();
  const [govId, setGovId] = useState<string | null>(null);
  const [areaId, setAreaId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"rating" | "newest" | "nearest">("rating");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const [govs, setGovs] = useState<Record<string, Governorate>>(govsProp);
  const [areas, setAreas] = useState<Record<string, Area>>(areasProp);
  const [centers, setCenters] = useState<Record<string, Center>>(centersProp);

  useEffect(() => {
    if (Object.keys(centers).length === 0) {
      setLoading(true);
      Promise.all([
        db.ref("governorates").once("value"),
        db.ref("areas").once("value"),
        db.ref("centers").once("value"),
      ]).then(([g, a, c]) => {
        setGovs(g.val() || {});
        setAreas(a.val() || {});
        setCenters(c.val() || {});
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, []);

  const govList = useMemo(() =>
    Object.entries(govs)
      .map(([id, g]) => ({ id, ...g }))
      .sort((a, b) => a.name.localeCompare(b.name, "ar")),
    [govs]
  );

  const govAreas = useMemo(() =>
    govId
      ? Object.entries(areas)
          .filter(([, a]) => a.governorateId === govId)
          .map(([id, a]) => ({ id, ...a }))
      : [],
    [areas, govId]
  );

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();
    let list = Object.entries(centers)
      .filter(([, c]) => {
        if (govId) {
          const inGov =
            c.governorateId === govId ||
            (c.areaId && areas[c.areaId]?.governorateId === govId) ||
            (c.areas?.some(a => areas[a.id]?.governorateId === govId));
          if (!inGov) return false;
        }
        if (areaId) {
          const match = c.areaId === areaId || c.areas?.some(a => a.id === areaId);
          if (!match) return false;
        }
        if (search) {
          return (
            c.name?.toLowerCase().includes(search) ||
            c.address?.toLowerCase().includes(search) ||
            c.phone?.toLowerCase().includes(search)
          );
        }
        return true;
      })
      .map(([id, c]) => ({ id, ...c } as Center & { id: string }));

    // Sort: promoted first, then by selected criteria
    list.sort((a, b) => {
      if ((b.promoted ? 1 : 0) !== (a.promoted ? 1 : 0)) {
        return (b.promoted ? 1 : 0) - (a.promoted ? 1 : 0);
      }
      if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
      if (sort === "newest") return (b.createdAt || "").localeCompare(a.createdAt || "");
      return (b.rating ?? 0) - (a.rating ?? 0);
    });
    return list;
  }, [centers, areas, govId, areaId, q, sort]);

  const govName = govId ? (govs[govId]?.name || "") : "";

  function selectGov(id: string | null) {
    setGovId(id);
    setAreaId(null);
    setQ("");
    setTimeout(() => listRef.current?.scrollTo({ top: 0 }), 50);
  }

  const totalCenters = Object.keys(centers).length;

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "#F9FAFB" }}>

      <Header />

      {/* ── Everything scrolls together ── */}
      <div ref={listRef} style={{ flex: 1, overflowY: "auto" }}>

        {/* Local header */}
        <div style={{ background: "#fff", borderBottom: "1.5px solid #F0F1F3", padding: "14px 16px" }}>
          <h1 style={{ fontSize: 17, fontWeight: 900, color: "#111827", margin: 0 }}>مراكز التدريب</h1>
          <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0, marginTop: 1 }}>
            {govId ? `${filtered.length} مركز في ${govName}` : `${totalCenters} مركز معتمد`}
          </p>
        </div>

        {/* Search + Sort */}
        <div style={{ padding: "12px 16px", position: "relative", background: "#fff", display: "flex", gap: 8, alignItems: "center" }}>
          <i className="ph ph-magnifying-glass" style={{
            position: "absolute", right: 30, top: "50%",
            transform: "translateY(-50%)",
            fontSize: 17, color: "#9CA3AF", pointerEvents: "none",
          }} />
          <input
            className="inp"
            placeholder="ابحث بالاسم أو العنوان أو الرقم..."
            value={q}
            onChange={e => setQ(e.target.value)}
            style={{ paddingRight: 42, background: "#F9FAFB", borderRadius: 12, flex: 1 }}
          />
          <select
            value={sort}
            onChange={e => setSort(e.target.value as any)}
            style={{
              padding: "9px 10px", borderRadius: 12, border: "1.5px solid #E2E8F0",
              background: "#F9FAFB", fontSize: 12, fontWeight: 700,
              fontFamily: "inherit", color: "#374151", cursor: "pointer",
            }}
          >
            <option value="rating">الأعلى تقييماً</option>
            <option value="newest">الأحدث</option>
            <option value="nearest">الأقرب</option>
          </select>
        </div>

        {/* Governorate chips */}
        <div style={{
          display: "flex", gap: 7, overflowX: "auto",
          padding: "0 16px 12px", scrollbarWidth: "none",
          background: "#fff",
        }}>
          {[{ id: null as string | null, name: "الكل" }, ...govList].map(g => {
            const sel = govId === g.id;
            return (
              <button key={g.id ?? "all"} onClick={() => selectGov(g.id)} style={{
                flexShrink: 0, padding: "7px 15px", borderRadius: 100,
                border: `1.5px solid ${sel ? "#246BFD" : "#E5E7EB"}`,
                background: sel ? "#246BFD" : "#fff",
                color: sel ? "#fff" : "#374151",
                fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s",
              }}>
                {g.name}
              </button>
            );
          })}
        </div>

        {/* Area chips */}
        {govAreas.length > 0 && (
          <div style={{
            display: "flex", gap: 6, overflowX: "auto",
            padding: "0 16px 12px", scrollbarWidth: "none",
            background: "#fff",
          }}>
            {[{ id: null as string | null, name: "كل المناطق" }, ...govAreas].map(a => {
              const sel = areaId === a.id;
              return (
                <button key={a.id ?? "all-areas"} onClick={() => setAreaId(a.id)} style={{
                  flexShrink: 0, padding: "5px 13px", borderRadius: 100,
                  border: `1.5px solid ${sel ? "#0891B2" : "#E5E7EB"}`,
                  background: sel ? "#0891B2" : "#F9FAFB",
                  color: sel ? "#fff" : "#6B7280",
                  fontSize: 12, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.15s",
                }}>
                  {a.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Centers list */}
        <div style={{ padding: "14px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "64px 0", color: "#9CA3AF" }}>
              <i className="ph ph-spinner" style={{ fontSize: 40, display: "block", marginBottom: 12, color: "#246BFD", animation: "spin 1s linear infinite" }} />
              <p style={{ fontSize: 14 }}>جارٍ تحميل المراكز...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0", color: "#9CA3AF" }}>
              <i className="ph ph-map-pin-simple-slash" style={{ fontSize: 48, display: "block", marginBottom: 12, color: "#D1D5DB" }} />
              <p style={{ fontSize: 15, fontWeight: 700, color: "#374151", marginBottom: 6 }}>لا توجد مراكز</p>
              <p style={{ fontSize: 13 }}>جرّب تغيير المحافظة أو كلمة البحث</p>
            </div>
          ) : (
            filtered.map((c) => (
              <CenterCard
                key={c.id}
                c={c}
                govName={govId ? govName : (
                  c.governorateId ? (govs[c.governorateId]?.name || "") :
                  c.areas?.[0] ? (govs[areas[c.areas[0].id]?.governorateId]?.name || "") : ""
                )}
                onClick={() => navigate(`/centers/${c.id}`)}
              />
            ))
          )}
        </div>
        <AppFooter />
      </div>
    </div>
  );
}
