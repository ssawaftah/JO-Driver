import { useState, useMemo } from "react";
import type { Governorate, Area, Center } from "../types";

interface Props {
  govs: Record<string, Governorate>;
  areas: Record<string, Area>;
  centers: Record<string, Center>;
  onBack: () => void;
}

const ALL_DAYS = ["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];

function Header({ title, sub, onBack }: { title: string; sub?: string; onBack: () => void }) {
  return (
    <div style={{
      padding: "14px 16px", borderBottom: "1px solid #E5E7EB",
      display: "flex", alignItems: "center", gap: 12, background: "#fff",
      position: "sticky", top: 0, zIndex: 10,
    }}>
      <button onClick={onBack} style={{
        width: 38, height: 38, borderRadius: 12, border: "1.5px solid #E5E7EB",
        background: "#F9FAFB", cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <i className="ph ph-arrow-right" style={{ fontSize: 18, color: "#246BFD" }} />
      </button>
      <div>
        <div style={{ fontWeight: 900, fontSize: 17, color: "#111827" }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: "#6B7280" }}>{sub}</div>}
      </div>
    </div>
  );
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div style={{ position: "relative" }}>
      <i className="ph ph-magnifying-glass" style={{
        position: "absolute", right: 13, top: "50%",
        transform: "translateY(-50%)", fontSize: 18, color: "#9CA3AF",
      }} />
      <input
        className="inp"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ background: "#F3F6FF" }}
      />
    </div>
  );
}

export default function Centers({ govs, areas, centers, onBack }: Props) {
  const [govId, setGovId] = useState<string | null>(null);
  const [areaId, setAreaId] = useState<string | null>(null);
  const [govQ, setGovQ] = useState("");
  const [centerQ, setCenterQ] = useState("");

  const filteredGovs = useMemo(() =>
    Object.entries(govs)
      .filter(([, g]) => !govQ || g.name.includes(govQ))
      .map(([id, g]) => ({ id, ...g })),
    [govs, govQ]
  );

  const govAreas = useMemo(() =>
    Object.entries(areas)
      .filter(([, a]) => a.governorateId === govId)
      .map(([id, a]) => ({ id, ...a })),
    [areas, govId]
  );

  const filteredCenters = useMemo(() => {
    if (!govId) return [];
    const q = centerQ.trim().toLowerCase();
    return Object.entries(centers)
      .filter(([, c]) => {
        const inGov = c.governorateId === govId
          || (c.areaId && areas[c.areaId]?.governorateId === govId);
        if (!inGov) return false;
        if (areaId) {
          const match = c.areaId === areaId
            || (c.areas?.some(a => a.id === areaId));
          if (!match) return false;
        }
        if (q) return (c.name || "").toLowerCase().includes(q)
          || (c.address || "").toLowerCase().includes(q);
        return true;
      })
      .map(([id, c]) => ({ id, ...c }))
      .sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }, [centers, areas, govId, areaId, centerQ]);

  function copyPhone(phone: string) {
    navigator.clipboard.writeText(phone)
      .then(() => alert("✅ تم نسخ الرقم: " + phone))
      .catch(() => alert("❌ فشل نسخ الرقم"));
  }

  // GOVERNORATE LIST
  if (!govId) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
        <Header title="اختر المحافظة" onBack={onBack} />
        <div className="screen-body" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <SearchBox value={govQ} onChange={setGovQ} placeholder="ابحث عن محافظة..." />
          {filteredGovs.length === 0 && (
            <p style={{ textAlign: "center", color: "#9CA3AF", padding: "32px 0" }}>لا توجد نتائج</p>
          )}
          {filteredGovs.map((g, i) => (
            <button
              key={g.id}
              onClick={() => setGovId(g.id)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "#fff", border: "1.5px solid #E5E7EB",
                borderRadius: 14, padding: "14px 16px",
                cursor: "pointer", fontFamily: "inherit", textAlign: "right", width: "100%",
                animationDelay: `${i * 0.04}s`,
              }}
              className="fade-up"
            >
              <div style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: "#EEF4FF", color: "#246BFD",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              }}>
                <i className="ph ph-map-pin" />
              </div>
              <span style={{ flex: 1, fontSize: 16, fontWeight: 700, color: "#111827" }}>{g.name}</span>
              <i className="ph ph-caret-left" style={{ fontSize: 16, color: "#D1D5DB" }} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // CENTERS LIST
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      <Header
        title={govs[govId]?.name || "المراكز"}
        sub={`${filteredCenters.length} مركز تدريب`}
        onBack={() => { setGovId(null); setAreaId(null); setCenterQ(""); setGovQ(""); }}
      />
      <div className="screen-body" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <SearchBox value={centerQ} onChange={setCenterQ} placeholder="ابحث عن مركز تدريب..." />

        {/* Area chips */}
        {govAreas.length > 0 && (
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
            {[{ id: null, name: "الكل" }, ...govAreas].map(a => (
              <button
                key={a.id ?? "all"}
                onClick={() => setAreaId(a.id)}
                style={{
                  flexShrink: 0, padding: "8px 16px", borderRadius: 100,
                  border: `1.5px solid ${areaId === a.id ? "#246BFD" : "#E5E7EB"}`,
                  background: areaId === a.id ? "#246BFD" : "#fff",
                  color: areaId === a.id ? "#fff" : "#374151",
                  fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                {a.name}
              </button>
            ))}
          </div>
        )}

        {filteredCenters.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#9CA3AF" }}>
            <i className="ph ph-map-pin" style={{ fontSize: 40, display: "block", marginBottom: 10 }} />
            لا توجد مراكز مطابقة
          </div>
        )}

        {filteredCenters.map(c => (
          <div key={c.id} style={{
            background: "#fff", border: "1.5px solid #E5E7EB",
            borderRadius: 16, overflow: "hidden",
          }}>
            {/* Name & rating */}
            <div style={{ padding: "14px 16px 10px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
              <div style={{ flex: 1 }}>
                {c.mapLink
                  ? <a href={c.mapLink} target="_blank" rel="noreferrer"
                      style={{ fontSize: 16, fontWeight: 800, color: "#246BFD", textDecoration: "none" }}>
                      {c.name}
                    </a>
                  : <span style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>{c.name}</span>
                }
                {c.areas && c.areas.length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    {/* Governorate label */}
                    {c.governorateId && govs[c.governorateId] && (
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        fontSize: 12, fontWeight: 700, color: "#6B7280", marginBottom: 5,
                      }}>
                        <i className="ph ph-map-trifold" style={{ fontSize: 13 }} />
                        {govs[c.governorateId].name}
                      </div>
                    )}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {c.areas.map(a => (
                        <span key={a.id} style={{
                          fontSize: 11, fontWeight: 700, padding: "2px 8px",
                          borderRadius: 6, background: "#EEF4FF", color: "#246BFD",
                        }}>{a.name}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {c.rating != null && (
                <div style={{
                  background: "#FEF3C7", borderRadius: 10,
                  padding: "6px 12px", display: "flex", alignItems: "center",
                  gap: 5, flexShrink: 0,
                }}>
                  <i className="ph ph-star-fill" style={{ fontSize: 16, color: "#F59E0B" }} />
                  <span style={{ fontSize: 15, fontWeight: 900, color: "#92400E" }}>{c.rating}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ padding: "0 16px 10px", display: "flex", flexWrap: "wrap", gap: 12, fontSize: 13, color: "#6B7280" }}>
              {c.address && (
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <i className="ph ph-map-pin" />
                  {c.address}
                </span>
              )}
              {c.phone && (
                <button
                  onClick={() => copyPhone(c.phone!)}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 13, color: "#246BFD", fontWeight: 700, fontFamily: "inherit", padding: 0,
                  }}
                >
                  <i className="ph ph-phone" />
                  {c.phone}
                </button>
              )}
            </div>

            {/* Working days */}
            {c.workingDays && c.workingDays.length > 0 && (
              <div style={{ padding: "0 16px 10px" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>أيام الدوام</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {ALL_DAYS.map(d => {
                    const on = c.workingDays!.includes(d);
                    return (
                      <span key={d} style={{
                        padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                        background: on ? "#246BFD" : "#F3F4F6",
                        color: on ? "#fff" : "#9CA3AF",
                        border: `1px solid ${on ? "#246BFD" : "#E5E7EB"}`,
                      }}>{d}</span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hours */}
            {c.workingHours && (
              <div style={{ padding: "0 16px 14px" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>أوقات الدوام:</p>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "#F3F6FF", borderRadius: 10,
                  padding: "7px 12px", fontSize: 12, fontWeight: 700, color: "#111827",
                }}>
                  <i className="ph ph-clock" style={{ color: "#246BFD" }} />
                  {c.workingHours}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
