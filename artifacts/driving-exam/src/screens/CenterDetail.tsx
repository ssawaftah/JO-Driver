import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import Header from "../components/Header";
import AppFooter from "../components/Footer";
import type { Center, Governorate, Area } from "../types";

interface Props {
  govs: Record<string, Governorate>;
  areas: Record<string, Area>;
  centers: Record<string, Center>;
}

function useAutoLoadCenters(govsProp: Record<string, Governorate>, areasProp: Record<string, Area>, centersProp: Record<string, Center>) {
  const [govs, setGovs] = useState(govsProp);
  const [areas, setAreas] = useState(areasProp);
  const [centers, setCenters] = useState(centersProp);
  const [dataLoading, setDataLoading] = useState(Object.keys(centersProp).length === 0);

  useEffect(() => {
    if (Object.keys(centersProp).length === 0) {
      setDataLoading(true);
      Promise.all([
        db.ref("governorates").once("value"),
        db.ref("areas").once("value"),
        db.ref("centers").once("value"),
      ]).then(([g, a, c]) => {
        const centersVal = c.val() || {};
        ensurePublicIds(centersVal);
        setGovs(g.val() || {});
        setAreas(a.val() || {});
        setCenters(centersVal);
        setDataLoading(false);
      }).catch(() => setDataLoading(false));
    }
  }, []);

  return { govs, areas, centers, dataLoading };
}

function ensurePublicIds(centers: Record<string, Center>) {
  const entries = Object.entries(centers);
  let maxPublicId = 0;
  const missing: [string, Center][] = [];
  for (const [id, c] of entries) {
    if (c.publicId) { maxPublicId = Math.max(maxPublicId, c.publicId); }
    else { missing.push([id, c]); }
  }
  if (missing.length === 0) return;
  missing.sort((a, b) => a[0].localeCompare(b[0]));
  for (const [id] of missing) {
    maxPublicId++;
    centers[id] = { ...centers[id], publicId: maxPublicId };
  }
}

const ALL_DAYS_SHORT = ["س","ح","ن","ث","ر","خ","ج"];
const ALL_DAYS_FULL = ["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];

/* ── Helpers ───────────────────────────────────────── */
function getOpenStatus(
  schedule?: { closed: boolean; from: string; to: string }[],
  workingDays?: string[],
  workingHours?: string
) {
  const now = new Date();
  const dayMap = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const todayName = dayMap[now.getDay()];
  let fromStr: string | null = null, toStr: string | null = null, isClosed = false;
  if (schedule && schedule.length === 7) {
    const todayIdx = ALL_DAYS_FULL.indexOf(todayName);
    if (todayIdx >= 0) { const s = schedule[todayIdx]; isClosed = s.closed; fromStr = s.from; toStr = s.to; }
  }
  if (!fromStr && workingHours) {
    const m = workingHours.match(/(\d{1,2}:\d{2})/g);
    if (m && m.length >= 2) { fromStr = m[0]; toStr = m[1]; }
  }
  if (workingDays && workingDays.length > 0 && !workingDays.includes(todayName)) isClosed = true;
  if (isClosed || !fromStr || !toStr) {
    return { label: "مغلق اليوم", color: "#991B1B", bg: "#FEF2F2", icon: "ph-moon" };
  }
  const hm = (s: string) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const fromMin = hm(fromStr), toMin = hm(toStr);
  if (nowMin < fromMin) {
    const mins = fromMin - nowMin; const h = Math.floor(mins / 60); const m = mins % 60;
    return { label: h > 0 ? `يفتح بعد ${h}س ${m > 0 ? m + "د" : ""}` : `يفتح بعد ${m}د`, color: "#92400E", bg: "#FFF7ED", icon: "ph-clock-countdown" };
  }
  if (nowMin <= toMin) {
    const mins = toMin - nowMin; const h = Math.floor(mins / 60); const m = mins % 60;
    return { label: h > 0 ? `مفتوح · يغلق بعد ${h}س ${m > 0 ? m + "د" : ""}` : `مفتوح · يغلق بعد ${m}د`, color: "#166534", bg: "#F0FDF4", icon: "ph-door-open" };
  }
  return { label: "مغلق الآن", color: "#991B1B", bg: "#FEF2F2", icon: "ph-moon" };
}

function GoogleStars({ rating, reviewCount }: { rating?: number; reviewCount?: number }) {
  if (rating == null) return null;
  const full = Math.round(rating); const empty = 5 - full;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, direction: "ltr" as const }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: "#1F2937" }}>{rating.toFixed(1)}</span>
      <div style={{ display: "flex", gap: 1 }}>
        {Array.from({ length: full }).map((_, i) => <i key={`f${i}`} className="ph-fill ph-star" style={{ fontSize: 15, color: "#F59E0B" }} />)}
        {Array.from({ length: Math.max(0, empty) }).map((_, i) => <i key={`e${i}`} className="ph ph-star" style={{ fontSize: 15, color: "#D1D5DB" }} />)}
      </div>
      {reviewCount != null && reviewCount > 0 && <span style={{ fontSize: 13, color: "#6B7280" }}>({reviewCount})</span>}
    </div>
  );
}

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
          padding: "8px 12px", borderRadius: 10,
          background: r.on ? "#F8FAFC" : "transparent",
          opacity: r.on ? 1 : 0.45,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              width: 26, height: 26, borderRadius: 8,
              background: r.on ? "#2563EB" : "#E5E7EB",
              color: r.on ? "#fff" : "#9CA3AF",
              fontSize: 12, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{r.short}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{r.day}</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: r.on ? "#2563EB" : "#9CA3AF" }}>
            {r.on ? `${r.from} – ${r.to}` : "مغلق"}
          </span>
        </div>
      ))}
    </div>
  );
}

function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 4, direction: "ltr" as const }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={() => onChange(n)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
          <i className={n <= value ? "ph-fill ph-star" : "ph ph-star"} style={{ fontSize: 28, color: n <= value ? "#F59E0B" : "#D1D5DB" }} />
        </button>
      ))}
    </div>
  );
}

/* ── Avatar placeholder ───────────────────────────────────── */
function CenterAvatar({ name, size = 96 }: { name: string; size?: number }) {
  const initial = name.charAt(0) || "م";
  const colors = ["#2563EB", "#0891B2", "#7C3AED", "#DB2777", "#DC2626", "#EA580C", "#16A34A"];
  const bg = colors[(name.length + name.charCodeAt(0)) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${bg}, ${bg}cc)`,
      border: "3px solid #fff",
      boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.4, fontWeight: 900, color: "#fff",
      flexShrink: 0,
    }}>
      {initial}
    </div>
  );
}

/* ── Action pill button ───────────────────────────────────── */
function ActionPill({
  icon, label, href, onClick, color, bg, borderColor,
}: {
  icon: string; label: string; href?: string; onClick?: () => void;
  color: string; bg: string; borderColor: string;
}) {
  const style: React.CSSProperties = {
    flex: 1, height: 48, borderRadius: 14,
    border: `1.5px solid ${borderColor}`,
    background: bg, color,
    fontSize: 13, fontWeight: 800,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    textDecoration: "none",
    cursor: onClick ? "pointer" : undefined,
    fontFamily: "inherit",
    transition: "transform 0.1s",
  };
  const content = (
    <>
      <i className={`ph ${icon}`} style={{ fontSize: 20 }} />
      <span>{label}</span>
    </>
  );
  if (href) return <a href={href} target="_blank" rel="noreferrer" style={style}>{content}</a>;
  return <button onClick={onClick} style={style}>{content}</button>;
}

/* ── Main component ───────────────────────────────────────── */
export default function CenterDetail({ govs: govsProp, areas: areasProp, centers: centersProp }: Props) {
  const { govs, areas, centers, dataLoading } = useAutoLoadCenters(govsProp, areasProp, centersProp);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviews, setReviews] = useState<{ id: string; name: string; comment?: string; rating: number; createdAt: string }[]>([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [sendingReview, setSendingReview] = useState(false);
  const [toast, setToast] = useState("");

  /* Lookup by publicId if numeric, else by firebase key */
  const resolvedId = useMemo(() => {
    if (!id) return null;
    if (/^\d+$/.test(id)) {
      for (const [key, c] of Object.entries(centers)) {
        if (c.publicId === parseInt(id, 10)) return key;
      }
      return null;
    }
    return id;
  }, [id, centers]);

  const center: (Center & { id: string }) | null = useMemo(() => {
    if (!resolvedId || !centers[resolvedId]) return null;
    return { id: resolvedId, ...centers[resolvedId] };
  }, [resolvedId, centers]);

  const centerPublicId = center?.publicId || center?.id;
  const govName = center?.governorateId ? govs[center.governorateId]?.name : "";

  useEffect(() => {
    if (!resolvedId) { setReviewsLoading(false); return; }
    setReviewsLoading(true);
    db.ref(`centerReviews/${resolvedId}`).once("value").then(snap => {
      const val = snap.val() || {};
      const list = Object.entries(val).map(([k, v]: [string, any]) => ({
        id: k, name: v.name || "", comment: v.comment || "", rating: v.rating || 0,
        createdAt: v.createdAt || "",
      })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setReviews(list);
      setReviewsLoading(false);
    }).catch(() => setReviewsLoading(false));
  }, [resolvedId]);

  async function submitReview() {
    if (!center || !resolvedId) return;
    if (!reviewName.trim()) { setToast("أدخل اسمك"); setTimeout(() => setToast(""), 2000); return; }
    setSendingReview(true);
    try {
      await db.ref(`centerReviews/${resolvedId}`).push({
        name: reviewName.trim(),
        comment: reviewComment.trim() || null,
        rating: reviewRating,
        createdAt: new Date().toISOString(),
      });
      setReviews(prev => [{
        id: "tmp", name: reviewName.trim(), comment: reviewComment.trim() || undefined,
        rating: reviewRating, createdAt: new Date().toISOString(),
      }, ...prev]);
      setReviewName(""); setReviewComment(""); setReviewRating(5);
      setToast("تم إرسال التقييم بنجاح");
    } catch {
      setToast("خطأ في إرسال التقييم");
    }
    setSendingReview(false);
    setTimeout(() => setToast(""), 2000);
  }

  function shareCenter() {
    const url = `${window.location.origin}/centers/${centerPublicId}`;
    const text = `مركز تدريب القيادة — ${center?.name}`;
    if (navigator.share) {
      navigator.share({ title: text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setToast("تم نسخ الرابط");
      setTimeout(() => setToast(""), 2000);
    }
  }

  if (dataLoading || !center) {
    return (
      <div style={{ minHeight: "100dvh", background: "#FAFBFC", direction: "rtl" }}>
        <Header />
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          {dataLoading ? (
            <>
              <i className="ph ph-spinner" style={{ fontSize: 40, color: "#246BFD", marginBottom: 12, animation: "spin 1s linear infinite" }} />
              <div style={{ fontSize: 14, color: "#9CA3AF" }}>جارٍ تحميل المركز...</div>
            </>
          ) : (
            <>
              <i className="ph ph-storefront" style={{ fontSize: 48, color: "#D1D5DB", marginBottom: 16 }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: "#6B7280" }}>المركز غير موجود</div>
            </>
          )}
        </div>
        <AppFooter />
      </div>
    );
  }

  const activeDays = center.workingDays || [];
  const cleanPhone = (center.phone || "").replace(/[^0-9+]/g, "");
  const cleanWhatsapp = (center.whatsapp || center.phone || "").replace(/[^0-9+]/g, "").replace(/^\+/, "");
  const isPromoted = !!center.promoted;
  const status = getOpenStatus(center.schedule, activeDays, center.workingHours);
  const description = (center as any).description || "مركز تدريب معتمد لتعليم قيادة السيارات في الأردن";

  return (
    <div style={{ minHeight: "100dvh", background: "#FAFBFC", direction: "rtl" }}>
      <Header />

      <div style={{ padding: "0 14px 24px", maxWidth: 720, margin: "0 auto" }}>
        {/* ── Hero card ── */}
        <div style={{
          background: "#fff", borderRadius: 20,
          border: "1.5px solid #E2E8F0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          margin: "16px 0 14px", overflow: "hidden",
          position: "relative",
        }}>
          {/* Promoted badge */}
          {isPromoted && (
            <div style={{
              position: "absolute", top: 0, left: 16,
              background: "#FBBF24", color: "#78350F",
              fontSize: 10, fontWeight: 900,
              padding: "3px 10px", borderRadius: "0 0 8px 8px",
              display: "flex", alignItems: "center", gap: 4,
              zIndex: 2,
            }}>
              <i className="ph-fill ph-crown" style={{ fontSize: 11 }} />
              مميز
            </div>
          )}

          {/* Top gradient banner */}
          <div style={{
            height: 90,
            background: "linear-gradient(135deg, #2563EB 0%, #0891B2 100%)",
            position: "relative",
          }} />

          {/* Avatar + name + rating */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -48, padding: "0 20px 16px", position: "relative" }}>
            <CenterAvatar name={center.name} size={96} />
            <div style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", marginTop: 12, textAlign: "center" }}>{center.name}</div>
            <div style={{ marginTop: 6 }}>
              <GoogleStars rating={center.rating} reviewCount={center.reviewCount} />
            </div>
          </div>

          {/* Description */}
          <div style={{ padding: "0 20px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7, maxWidth: 460, margin: "0 auto" }}>
              {description}
            </div>
          </div>

          {/* Status row */}
          <div style={{ padding: "0 20px 16px", display: "flex", justifyContent: "center" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: status.bg, color: status.color,
              fontSize: 12, fontWeight: 800,
              padding: "5px 14px", borderRadius: 100,
            }}>
              <i className={`ph ${status.icon}`} style={{ fontSize: 14 }} />
              {status.label}
            </div>
          </div>

          {/* Location row */}
          <div style={{ padding: "0 20px 20px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6 }}>
            {govName && (
              <span style={{
                fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 100,
                background: "#F3F4F6", color: "#6B7280",
                display: "inline-flex", alignItems: "center", gap: 4,
              }}>
                <i className="ph ph-map-trifold" style={{ fontSize: 12 }} /> {govName}
              </span>
            )}
            {center.areas?.map(a => (
              <span key={a.id} style={{
                fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 100,
                background: "#EFF6FF", color: "#2563EB",
              }}>{a.name}</span>
            ))}
          </div>
        </div>

        {/* ── Action pills ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {center.phone && (
            <ActionPill
              icon="ph-phone" label="اتصال"
              href={`tel:${cleanPhone}`}
              color="#2563EB" bg="#F0F9FF" borderColor="#BFDBFE"
            />
          )}
          {cleanWhatsapp && (
            <ActionPill
              icon="ph-whatsapp-logo" label="واتساب"
              href={`https://wa.me/${cleanWhatsapp}`}
              color="#059669" bg="#ECFDF5" borderColor="#A7F3D0"
            />
          )}
          {center.mapLink && (
            <ActionPill
              icon="ph-map-pin-line" label="الموقع"
              href={center.mapLink}
              color="#fff" bg="#2563EB" borderColor="#2563EB"
            />
          )}
          <ActionPill
            icon="ph-share-network" label="مشاركة"
            onClick={shareCenter}
            color="#64748B" bg="#F8FAFC" borderColor="#E2E8F0"
          />
        </div>

        {/* ── Info sections ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Address */}
          {center.address && (
            <div style={{
              background: "#fff", borderRadius: 16, border: "1.5px solid #E2E8F0",
              padding: "16px 18px",
              display: "flex", alignItems: "flex-start", gap: 12,
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, background: "#EFF6FF",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <i className="ph ph-map-pin" style={{ fontSize: 20, color: "#2563EB" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", marginBottom: 3 }}>العنوان</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", lineHeight: 1.6 }}>{center.address}</div>
              </div>
            </div>
          )}

          {/* Schedule table */}
          {center.schedule && center.schedule.length > 0 && (
            <div style={{
              background: "#fff", borderRadius: 16, border: "1.5px solid #E2E8F0",
              padding: "16px 18px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, background: "#ECFEFF",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <i className="ph ph-clock" style={{ fontSize: 20, color: "#0891B2" }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>جدول الدوام</div>
              </div>
              <ScheduleTable schedule={center.schedule} workingDays={activeDays} />
            </div>
          )}

          {/* Working hours fallback */}
          {!center.schedule && center.workingHours && (
            <div style={{
              background: "#fff", borderRadius: 16, border: "1.5px solid #E2E8F0",
              padding: "16px 18px",
              display: "flex", alignItems: "flex-start", gap: 12,
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, background: "#ECFEFF",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <i className="ph ph-clock" style={{ fontSize: 20, color: "#0891B2" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", marginBottom: 3 }}>ساعات الدوام</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{center.workingHours}</div>
              </div>
            </div>
          )}

          {/* Working days chips */}
          {!center.schedule && activeDays.length > 0 && (
            <div style={{
              background: "#fff", borderRadius: 16, border: "1.5px solid #E2E8F0",
              padding: "16px 18px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, background: "#F0FDF4",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <i className="ph ph-calendar-check" style={{ fontSize: 20, color: "#16A34A" }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>أيام الدوام</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {ALL_DAYS_FULL.map((day, i) => {
                  const on = activeDays.includes(day);
                  return (
                    <div key={day} style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: on ? "#2563EB" : "#F1F5F9",
                      color: on ? "#fff" : "#94A3B8",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 800,
                    }}>{ALL_DAYS_SHORT[i]}</div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Reviews ── */}
        <div style={{
          background: "#fff", borderRadius: 16, border: "1.5px solid #E2E8F0",
          padding: 20, marginTop: 14,
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A" }}>آراء الزوار</div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>{reviews.length} تقييم</span>
          </div>

          {/* Review form */}
          <div style={{
            background: "#F8FAFC", borderRadius: 14, padding: 16, marginBottom: 20,
            border: "1.5px solid #E2E8F0",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>أضف تقييمك</div>
            <StarInput value={reviewRating} onChange={setReviewRating} />
            <input
              value={reviewName}
              onChange={e => setReviewName(e.target.value)}
              placeholder="اسمك"
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 10,
                border: "1.5px solid #E2E8F0", background: "#fff", fontSize: 14,
                fontFamily: "inherit", color: "#0F172A", marginTop: 12,
              }}
            />
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="تعليقك عن المركز (اختياري)"
              rows={3}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 10,
                border: "1.5px solid #E2E8F0", background: "#fff", fontSize: 14,
                fontFamily: "inherit", color: "#0F172A", marginTop: 10, resize: "vertical",
              }}
            />
            <button
              onClick={submitReview}
              disabled={sendingReview}
              style={{
                width: "100%", marginTop: 12, padding: "12px",
                background: "#2563EB", color: "#fff", borderRadius: 12,
                border: "none", fontSize: 14, fontWeight: 800,
                cursor: sendingReview ? "wait" : "pointer", fontFamily: "inherit",
                opacity: sendingReview ? 0.7 : 1,
              }}
            >
              {sendingReview ? "جارٍ إرسال..." : "إرسال التقييم"}
            </button>
          </div>

          {/* Review list */}
          {reviews.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "#94A3B8" }}>
              <i className="ph ph-chat-circle-dots" style={{ fontSize: 40, display: "block", marginBottom: 10 }} />
              <div style={{ fontSize: 14, fontWeight: 600 }}>لا توجد تقييمات بعد. كن أول مقيّم!</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {reviews.map(r => (
                <div key={r.id} style={{
                  background: "#F8FAFC", borderRadius: 14, padding: 14,
                  border: "1.5px solid #E2E8F0",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{r.name}</span>
                    <div style={{ display: "flex", gap: 2 }}>
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <i key={i} className="ph-fill ph-star" style={{ fontSize: 13, color: "#F59E0B" }} />
                      ))}
                    </div>
                  </div>
                  {r.comment && (
                    <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 6 }}>{r.comment}</div>
                  )}
                  <div style={{ fontSize: 11, color: "#94A3B8" }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("ar-JO") : ""}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <AppFooter />
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
          background: "#0F172A", color: "#fff", fontSize: 14, fontWeight: 700,
          padding: "12px 24px", borderRadius: 12, zIndex: 1000,
          whiteSpace: "nowrap",
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
