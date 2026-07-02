import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import AppFooter from "../components/Footer";
import type { Governorate, Area } from "../types";

const ALL_DAYS_SHORT = ["س","ح","ن","ث","ر","خ","ج"];
const ALL_DAYS_FULL = ["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];

interface Props {
  govs: Record<string, Governorate>;
  areas: Record<string, Area>;
}

function isGoogleMapsUrl(url: string): boolean {
  return /google\.(com|jo)\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/i.test(url);
}

export default function CentersJoinScreen({ govs, areas }: Props) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [govId, setGovId] = useState("");
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
  const [mapLink, setMapLink] = useState("");
  const [rating, setRating] = useState("0");
  const [startHour, setStartHour] = useState("08:00");
  const [endHour, setEndHour] = useState("16:00");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [ratingFromMaps, setRatingFromMaps] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState("");

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

  async function fetchFromMaps(url: string) {
    if (!url.trim()) return;
    setFetching(true);
    setFetchError("");
    try {
      const res = await fetch("/api/places/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json() as {
        name?: string; address?: string; phone?: string;
        rating?: number | null; startHour?: string; endHour?: string;
        workingDays?: string[]; error?: string;
      };
      if (!res.ok) {
        setFetchError(data.error || "حدث خطأ أثناء جلب البيانات");
        return;
      }
      if (data.name) setName(data.name);
      if (data.address) setAddress(data.address);
      if (data.phone) setPhone(data.phone);
      if (data.startHour) setStartHour(data.startHour);
      if (data.endHour) setEndHour(data.endHour);
      if (data.workingDays?.length) setSelectedDays(data.workingDays);
      if (data.rating !== null && data.rating !== undefined) {
        setRatingFromMaps(data.rating);
        setRating(String(data.rating));
      }
    } catch {
      setFetchError("تعذر الاتصال بالخادم، حاول مجدداً");
    } finally {
      setFetching(false);
    }
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
        whatsapp: whatsapp.trim() || null,
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
        <Header />
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
            onClick={() => navigate("/centers")}
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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Loading modal */}
      {fetching && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.55)",
          zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: "#fff", borderRadius: 20, padding: "36px 44px",
            textAlign: "center", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 14,
            boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
            minWidth: 230,
          }}>
            <div style={{
              width: 52, height: 52,
              border: "4px solid #EEF4FF",
              borderTopColor: "#246BFD",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
            <div style={{ fontSize: 16, fontWeight: 900, color: "#1F2937" }}>جارٍ جلب المعلومات...</div>
            <div style={{ fontSize: 12, color: "#6B7280", display: "flex", alignItems: "center", gap: 4 }}>
              <i className="ph ph-map-pin" style={{ color: "#246BFD" }} />
              من Google Maps
            </div>
          </div>
        </div>
      )}

      <Header />

      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Google Maps URL — FIRST FIELD */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1.5px solid #246BFD", boxShadow: "0 0 0 4px #EEF4FF" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#246BFD", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <i className="ph ph-map-pin" style={{ fontSize: 14 }} />
            رابط المركز على Google Maps
            <span style={{
              fontSize: 10, fontWeight: 700, color: "#fff",
              background: "#246BFD", padding: "2px 7px", borderRadius: 20,
            }}>ملء تلقائي ✨</span>
          </div>
          <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 10 }}>
            الصق رابط المركز من Google Maps وسيتم ملء بيانات المركز تلقائياً
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <input
              type="url"
              value={mapLink}
              onChange={e => setMapLink(e.target.value)}
              onPaste={e => {
                const pasted = e.clipboardData.getData("text");
                if (isGoogleMapsUrl(pasted)) {
                  setTimeout(() => fetchFromMaps(pasted), 80);
                }
              }}
              placeholder="https://maps.google.com/maps/place/..."
              style={{
                flex: 1, padding: "10px 14px", borderRadius: 10,
                border: "1.5px solid #E5E7EB", background: "#F9FAFB",
                fontSize: 13, fontFamily: "inherit", color: "#374151",
                outline: "none", direction: "ltr", textAlign: "right",
              }}
            />
            {mapLink.trim() && (
              <button
                onClick={() => fetchFromMaps(mapLink)}
                style={{
                  padding: "10px 14px", borderRadius: 10,
                  background: "#246BFD", color: "#fff",
                  border: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: 800, fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: 5,
                  whiteSpace: "nowrap",
                }}
              >
                <i className="ph ph-magnifying-glass" />
                جلب
              </button>
            )}
          </div>
          {fetchError && (
            <div style={{
              marginTop: 8, padding: "8px 12px", borderRadius: 8,
              background: "#FEF2F2", color: "#DC2626", fontSize: 12, fontWeight: 600,
              display: "flex", alignItems: "flex-start", gap: 6,
            }}>
              <i className="ph ph-warning-circle" style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }} />
              {fetchError}
            </div>
          )}
          {ratingFromMaps !== null && !fetching && (
            <div style={{
              marginTop: 8, padding: "8px 12px", borderRadius: 8,
              background: "#F0FDF4", color: "#16A34A", fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <i className="ph ph-check-circle" style={{ fontSize: 14 }} />
              تم ملء البيانات تلقائياً — يمكنك تعديلها قبل الإرسال
            </div>
          )}
        </div>

        {/* Basic info */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1.5px solid #F0F1F3" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#246BFD", marginBottom: 10, padding: "4px 10px", background: "#EEF4FF", borderRadius: 8, display: "inline-block" }}>
            المعلومات الأساسية
          </div>
          <Field label="اسم المركز" value={name} onChange={setName} placeholder="اسم المركز التدريبي" />
          <Field label="العنوان التفصيلي" value={address} onChange={setAddress} placeholder="المنطقة، الشارع، المبنى..." />
          <Field label="رقم الهاتف" value={phone} onChange={setPhone} placeholder="07XXXXXXXX" type="tel" />
          <Field label="رقم الواتساب" value={whatsapp} onChange={setWhatsapp} placeholder="07XXXXXXXX (اختياري)" type="tel" />
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
            أوقات وأيام الدوام
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
          {ratingFromMaps !== null ? (
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 8 }}>
                التقييم
                <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500, marginRight: 6 }}>— مجلوب من Google Maps (غير قابل للتعديل)</span>
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <i
                      key={i}
                      className="ph-fill ph-star"
                      style={{ fontSize: 22, color: i <= Math.round(ratingFromMaps) ? "#FBBF24" : "#E5E7EB" }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 16, fontWeight: 900, color: "#FBBF24" }}>{ratingFromMaps.toFixed(1)}</span>
              </div>
            </div>
          ) : (
            <Field label="التقييم (0–5)" value={rating} onChange={setRating} type="number" min="0" max="5" step="0.1" />
          )}
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
        <AppFooter />
      </div>
    </div>
  );
}

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
          outline: "none", transition: "border-color .15s",
          boxSizing: "border-box",
        }}
        onFocus={e => { e.currentTarget.style.borderColor = "#246BFD"; }}
        onBlur={e => { e.currentTarget.style.borderColor = "#E5E7EB"; }}
      />
    </div>
  );
}
