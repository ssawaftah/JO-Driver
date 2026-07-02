import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import AppFooter from "../components/Footer";
import type { Governorate, Area } from "../types";

const DAYS_FULL = ["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];
const DAYS_SHORT = ["س","ح","ن","ث","ر","خ","ج"];

type DaySchedule = { closed: boolean; from: string; to: string };
const DEFAULT_SCHEDULE: DaySchedule[] = DAYS_FULL.map((_, i) => ({
  closed: i === 6,
  from: "08:00",
  to: "16:00",
}));

const P = "#246BFD";
const PL = "#EEF4FF";

interface Props {
  govs: Record<string, Governorate>;
  areas: Record<string, Area>;
}

function isGoogleMapsUrl(url: string): boolean {
  return /google\.(com|jo)\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/i.test(url);
}

function Field({ label, value, onChange, placeholder, type = "text", min, max, step, readOnly }: {
  label: string; value: string; onChange?: (v: string) => void;
  placeholder?: string; type?: string; min?: string; max?: string; step?: string; readOnly?: boolean;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>{label}</label>
      <input
        type={type} min={min} max={max} step={step}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          width: "100%", padding: "11px 14px", borderRadius: 10,
          border: "1.5px solid #E5E7EB", background: readOnly ? "#F3F4F6" : "#F9FAFB",
          fontSize: 14, fontFamily: "inherit", color: "#374151",
          outline: "none", transition: "border-color .15s", boxSizing: "border-box",
          cursor: readOnly ? "default" : "text",
        }}
        onFocus={e => { if (!readOnly) e.currentTarget.style.borderColor = P; }}
        onBlur={e => { e.currentTarget.style.borderColor = "#E5E7EB"; }}
      />
    </div>
  );
}

export default function CentersJoinScreen({ govs, areas }: Props) {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [mapLink, setMapLink] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [fetchDone, setFetchDone] = useState(false);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [samePhone, setSamePhone] = useState(false);
  const [govId, setGovId] = useState("");
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE);
  const [rating, setRating] = useState("");
  const [reviewCount, setReviewCount] = useState("");

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const govList = useMemo(() =>
    Object.entries(govs).map(([id, g]) => ({ id, ...g })).sort((a, b) => a.name.localeCompare(b.name, "ar")),
    [govs]
  );
  const govAreas = useMemo(() =>
    govId
      ? Object.entries(areas).filter(([, a]) => a.governorateId === govId)
          .map(([id, a]) => ({ id, ...a })).sort((a, b) => a.name.localeCompare(b.name, "ar"))
      : [],
    [areas, govId]
  );

  function toggleArea(id: string) {
    setSelectedAreaIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function updateDay(i: number, patch: Partial<DaySchedule>) {
    setSchedule(s => s.map((d, idx) => idx === i ? { ...d, ...patch } : d));
  }

  async function fetchFromMaps() {
    const url = mapLink.trim();
    if (!url) return;
    setFetching(true);
    setFetchError("");
    setFetchDone(false);

    try {
      const res = await fetch("/api/places/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json() as {
        name?: string; address?: string; error?: string;
      };
      if (!res.ok) {
        setFetchError(data.error || "حدث خطأ أثناء جلب البيانات");
        return;
      }
      if (data.name) setName(data.name);
      if (data.address) setAddress(data.address);
      setFetchDone(true);
    } catch {
      setFetchError("تعذر الاتصال بالخادم. حاول مجدداً.");
    } finally {
      setFetching(false);
    }
  }

  async function submit() {
    if (!name.trim()) { alert("أدخل اسم المركز"); return; }
    if (!phone.trim()) { alert("أدخل رقم الهاتف"); return; }
    if (!govId) { alert("اختر المحافظة"); return; }
    if (selectedAreaIds.length === 0) { alert("اختر منطقة واحدة على الأقل"); return; }

    const workingDays = DAYS_FULL.filter((_, i) => !schedule[i].closed);
    if (workingDays.length === 0) { alert("حدد يوم دوام واحد على الأقل"); return; }

    const firstOpen = schedule.find(d => !d.closed);
    const workingHours = firstOpen ? `${firstOpen.from} – ${firstOpen.to}` : "";
    const areaObjs = selectedAreaIds.map(id => ({ id, name: areas[id]?.name || "" }));

    setSending(true);
    try {
      const { db } = await import("../lib/firebase");
      await db.ref("centerRequests").push({
        name: name.trim(),
        address: address.trim() || null,
        phone: phone.trim(),
        whatsapp: samePhone ? phone.trim() : (whatsapp.trim() || null),
        governorateId: govId,
        areas: areaObjs,
        mapLink: mapLink.trim() || null,
        rating: parseFloat(rating) || 0,
        reviewCount: parseInt(reviewCount) || 0,
        workingHours,
        workingDays,
        schedule,
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
        <Header />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
          <div style={{ width: 80, height: 80, borderRadius: 50, background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ph ph-check-circle" style={{ fontSize: 44, color: "#16A34A" }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#111827", marginBottom: 6 }}>تم إرسال طلبك!</div>
            <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>سيتم مراجعة معلومات مركزك ونشره قريباً</div>
          </div>
          <button onClick={() => navigate("/centers")} style={{ background: P, color: "#fff", fontSize: 14, fontWeight: 800, padding: "12px 32px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            العودة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "#F6F8FB", direction: "rtl" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <Header />

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 40px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* ── STEP 1: URL + Name + Address ── */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 18, border: `2px solid ${P}`, boxShadow: `0 0 0 4px ${PL}` }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: P, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <i className="ph ph-map-pin" style={{ fontSize: 14 }} />
            رابط المركز على Google Maps
          </div>
          <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 10 }}>
            الصق رابط المركز وسيتم جلب الاسم والعنوان تلقائياً
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="url"
              value={mapLink}
              onChange={e => setMapLink(e.target.value)}
              onPaste={e => {
                const pasted = e.clipboardData.getData("text");
                if (isGoogleMapsUrl(pasted)) setTimeout(() => {
                  setMapLink(pasted);
                  fetchFromMaps();
                }, 80);
              }}
              placeholder="https://maps.google.com/maps/place/..."
              style={{
                flex: 1, padding: "10px 14px", borderRadius: 10,
                border: "1.5px solid #E5E7EB", background: "#F9FAFB",
                fontSize: 13, fontFamily: "inherit", color: "#374151",
                outline: "none", direction: "ltr", textAlign: "right",
              }}
            />
            <button
              onClick={fetchFromMaps}
              disabled={fetching || !mapLink.trim()}
              style={{
                padding: "10px 16px", borderRadius: 10,
                background: fetching || !mapLink.trim() ? "#93C5FD" : P,
                color: "#fff", border: "none",
                cursor: fetching || !mapLink.trim() ? "default" : "pointer",
                fontSize: 13, fontWeight: 800, fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 6,
                whiteSpace: "nowrap", transition: "background .15s",
              }}
            >
              {fetching ? (
                <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              ) : (
                <i className="ph ph-magnifying-glass" />
              )}
              {fetching ? "جاري الجلب..." : "جلب البيانات"}
            </button>
          </div>

          {fetchError && (
            <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8, background: "#FEF2F2", color: "#DC2626", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "flex-start", gap: 6 }}>
              <i className="ph ph-warning-circle" style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }} />
              {fetchError}
            </div>
          )}
          {fetchDone && (
            <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8, background: "#F0FDF4", color: "#16A34A", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="ph ph-check-circle" style={{ fontSize: 14 }} />
              تم جلب البيانات — يمكنك تعديل الاسم والعنوان
            </div>
          )}

          {/* Name + Address always visible in step 1 */}
          <div style={{ marginTop: 14 }}>
            <Field label="اسم المركز" value={name} onChange={setName} placeholder="أدخل اسم المركز أو اجلبه من الرابط" />
            <Field label="العنوان" value={address} onChange={setAddress} placeholder="المنطقة، الشارع، المبنى..." />
          </div>

          {step === 1 && (
            <button
              onClick={() => {
                if (!name.trim()) { alert("أدخل اسم المركز أولاً"); return; }
                setStep(2);
              }}
              style={{
                width: "100%", padding: "13px", marginTop: 4,
                background: P, color: "#fff", border: "none",
                borderRadius: 12, fontSize: 14, fontWeight: 800,
                cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              استمرار
              <i className="ph ph-arrow-left" />
            </button>
          )}
        </div>

        {/* ── STEP 2: Full Details ── */}
        {step === 2 && (
          <>
            {/* Contact */}
            <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1.5px solid #F0F1F3" }}>
              <SectionLabel>معلومات التواصل</SectionLabel>
              <Field label="رقم الهاتف" value={phone} onChange={setPhone} placeholder="07XXXXXXXX" type="tel" />
              <Field label="رقم الواتساب" value={samePhone ? phone : whatsapp} onChange={v => { if (!samePhone) setWhatsapp(v); }} placeholder="07XXXXXXXX" type="tel" readOnly={samePhone} />
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: -6, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#374151" }}>
                <input
                  type="checkbox"
                  checked={samePhone}
                  onChange={e => { setSamePhone(e.target.checked); if (e.target.checked) setWhatsapp(""); }}
                  style={{ width: 16, height: 16, accentColor: P }}
                />
                استخدام نفس رقم الهاتف
              </label>
            </div>

            {/* Location */}
            <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1.5px solid #F0F1F3" }}>
              <SectionLabel>الموقع</SectionLabel>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>المحافظة</label>
                <select
                  value={govId}
                  onChange={e => { setGovId(e.target.value); setSelectedAreaIds([]); }}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 10,
                    border: "1.5px solid #E5E7EB", background: "#F9FAFB",
                    fontSize: 14, fontFamily: "inherit", color: "#374151", cursor: "pointer",
                  }}
                >
                  <option value="">اختر المحافظة</option>
                  {govList.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>

              {govAreas.length > 0 && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>المناطق المخدّمة</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {govAreas.map(a => (
                      <button
                        key={a.id}
                        onClick={() => toggleArea(a.id)}
                        style={{
                          padding: "6px 12px", borderRadius: 10,
                          border: `1.5px solid ${selectedAreaIds.includes(a.id) ? P : "#E5E7EB"}`,
                          background: selectedAreaIds.includes(a.id) ? PL : "#F9FAFB",
                          color: selectedAreaIds.includes(a.id) ? P : "#6B7280",
                          fontSize: 12, fontWeight: 700,
                          cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
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

            {/* Working Hours Table */}
            <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1.5px solid #F0F1F3" }}>
              <SectionLabel>أوقات الدوام</SectionLabel>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #F0F1F3" }}>
                      <th style={{ textAlign: "right", padding: "6px 4px", fontWeight: 700, color: "#6B7280", fontSize: 11 }}>اليوم</th>
                      <th style={{ textAlign: "center", padding: "6px 4px", fontWeight: 700, color: "#6B7280", fontSize: 11 }}>من</th>
                      <th style={{ textAlign: "center", padding: "6px 4px", fontWeight: 700, color: "#6B7280", fontSize: 11 }}>إلى</th>
                      <th style={{ textAlign: "center", padding: "6px 4px", fontWeight: 700, color: "#DC2626", fontSize: 11 }}>مغلق</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS_FULL.map((day, i) => (
                      <tr key={day} style={{ borderBottom: "1px solid #F9FAFB", background: schedule[i].closed ? "#FFFBFB" : "#fff" }}>
                        <td style={{ padding: "8px 4px", fontWeight: 700, color: schedule[i].closed ? "#9CA3AF" : "#111827" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <span style={{
                              width: 24, height: 24, borderRadius: 6, fontSize: 11, fontWeight: 800,
                              display: "inline-flex", alignItems: "center", justifyContent: "center",
                              background: schedule[i].closed ? "#F3F4F6" : PL,
                              color: schedule[i].closed ? "#9CA3AF" : P,
                            }}>{DAYS_SHORT[i]}</span>
                            <span style={{ fontSize: 12 }}>{day}</span>
                          </span>
                        </td>
                        <td style={{ padding: "8px 4px", textAlign: "center" }}>
                          <input
                            type="time"
                            value={schedule[i].from}
                            onChange={e => updateDay(i, { from: e.target.value })}
                            disabled={schedule[i].closed}
                            style={{
                              padding: "5px 6px", borderRadius: 8, fontSize: 12,
                              border: "1.5px solid #E5E7EB", fontFamily: "inherit",
                              background: schedule[i].closed ? "#F3F4F6" : "#F9FAFB",
                              color: schedule[i].closed ? "#9CA3AF" : "#374151",
                              width: 80,
                            }}
                          />
                        </td>
                        <td style={{ padding: "8px 4px", textAlign: "center" }}>
                          <input
                            type="time"
                            value={schedule[i].to}
                            onChange={e => updateDay(i, { to: e.target.value })}
                            disabled={schedule[i].closed}
                            style={{
                              padding: "5px 6px", borderRadius: 8, fontSize: 12,
                              border: "1.5px solid #E5E7EB", fontFamily: "inherit",
                              background: schedule[i].closed ? "#F3F4F6" : "#F9FAFB",
                              color: schedule[i].closed ? "#9CA3AF" : "#374151",
                              width: 80,
                            }}
                          />
                        </td>
                        <td style={{ padding: "8px 4px", textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={schedule[i].closed}
                            onChange={e => updateDay(i, { closed: e.target.checked })}
                            style={{ width: 18, height: 18, accentColor: "#DC2626", cursor: "pointer" }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rating */}
            <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1.5px solid #F0F1F3" }}>
              <SectionLabel>تقييم Google Maps</SectionLabel>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <Field label="التقييم (مثال: 4.8)" value={rating} onChange={setRating} type="number" min="0" max="5" step="0.1" placeholder="4.8" />
                </div>
                <div style={{ flex: 1 }}>
                  <Field label="عدد المقيّمين (مثال: 173)" value={reviewCount} onChange={setReviewCount} type="number" min="0" placeholder="173" />
                </div>
              </div>
              {rating && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: -4 }}>
                  {[1,2,3,4,5].map(i => (
                    <i key={i} className="ph-fill ph-star" style={{ fontSize: 20, color: i <= Math.round(parseFloat(rating)||0) ? "#FBBF24" : "#E5E7EB" }} />
                  ))}
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#FBBF24" }}>{parseFloat(rating).toFixed(1)}</span>
                  {reviewCount && <span style={{ fontSize: 12, color: "#6B7280" }}>({reviewCount} تقييم)</span>}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={submit}
              disabled={sending}
              style={{
                background: P, color: "#fff", fontSize: 15, fontWeight: 800,
                padding: "14px", borderRadius: 12, border: "none",
                cursor: sending ? "wait" : "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: sending ? 0.7 : 1, marginBottom: 8,
              }}
            >
              <i className="ph ph-paper-plane-right" style={{ fontSize: 18 }} />
              {sending ? "جاري الإرسال..." : "إرسال الطلب"}
            </button>
          </>
        )}

        <AppFooter />
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 800, color: P, marginBottom: 12, padding: "4px 10px", background: PL, borderRadius: 8, display: "inline-block" }}>
      {children}
    </div>
  );
}
