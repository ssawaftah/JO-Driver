import { useState, useMemo } from "react";
import type { Governorate, Area, Center } from "../types";

interface Props {
  govs: Record<string, Governorate>;
  areas: Record<string, Area>;
  centers: Record<string, Center>;
  onBack: () => void;
}

const ALL_DAYS = ["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];

/* ─── Shared Back Header ─────────────────────────────────── */
function PageHeader({ title, sub, onBack }: { title: string; sub?: string; onBack: () => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "14px 16px", background: "#fff",
      borderBottom: "1.5px solid #F3F4F6",
      position: "sticky", top: 0, zIndex: 20,
    }}>
      <button onClick={onBack} style={{
        width: 40, height: 40, borderRadius: 12,
        border: "1.5px solid #E5E7EB", background: "#F9FAFB",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", flexShrink: 0,
      }}>
        <i className="ph ph-arrow-right" style={{ fontSize: 19, color: "#246BFD" }} />
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 17, fontWeight: 900, color: "#111827" }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ─── Search Input ───────────────────────────────────────── */
function Search({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div style={{ position: "relative" }}>
      <i className="ph ph-magnifying-glass" style={{
        position: "absolute", right: 14, top: "50%",
        transform: "translateY(-50%)", fontSize: 18, color: "#9CA3AF", pointerEvents: "none",
      }} />
      <input
        className="inp"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ paddingRight: 42, background: "#F9FAFB" }}
      />
    </div>
  );
}

/* ─── Governorate List ───────────────────────────────────── */
function GovList({
  govs, onSelect, onBack,
}: { govs: { id: string; name: string }[]; onSelect: (id: string) => void; onBack: () => void }) {
  const [q, setQ] = useState("");
  const filtered = q ? govs.filter(g => g.name.includes(q)) : govs;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      <PageHeader title="اختر المحافظة" onBack={onBack} />
      <div className="screen-body" style={{ padding: "14px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        <Search value={q} onChange={setQ} placeholder="ابحث عن محافظة..." />
        {filtered.length === 0 && (
          <p style={{ textAlign: "center", color: "#9CA3AF", padding: "32px 0", fontSize: 14 }}>لا توجد نتائج</p>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
          {filtered.map((g, i) => (
            <button
              key={g.id}
              onClick={() => onSelect(g.id)}
              className="fade-up"
              style={{
                background: "#fff", border: "1.5px solid #E5E7EB",
                borderRadius: 16, padding: "16px 12px",
                cursor: "pointer", fontFamily: "inherit", textAlign: "center",
                animationDelay: `${i * 0.03}s`,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              }}
            >
              <div style={{
                width: 46, height: 46, borderRadius: 14,
                background: "#EEF4FF", color: "#246BFD",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
              }}>
                <i className="ph ph-buildings" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#111827", lineHeight: 1.4 }}>{g.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Center Card ────────────────────────────────────────── */
function CenterCard({ c, govName }: { c: Center & { id: string }; govName: string }) {
  function copyPhone() {
    if (!c.phone) return;
    navigator.clipboard.writeText(c.phone)
      .then(() => alert("✅ تم نسخ الرقم: " + c.phone))
      .catch(() => alert(c.phone));
  }

  const workOn = ALL_DAYS.filter(d => c.workingDays?.includes(d));
  const workOff = ALL_DAYS.filter(d => !c.workingDays?.includes(d));

  return (
    <div style={{
      background: "#fff", borderRadius: 18,
      border: "1.5px solid #E5E7EB",
      overflow: "hidden",
    }}>
      {/* ── Top: name + rating ── */}
      <div style={{
        padding: "14px 16px 12px",
        borderBottom: "1px solid #F3F4F6",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
      }}>
        <div style={{ flex: 1 }}>
          {c.mapLink ? (
            <a href={c.mapLink} target="_blank" rel="noreferrer" style={{
              fontSize: 15, fontWeight: 900, color: "#246BFD",
              textDecoration: "none", display: "flex", alignItems: "center", gap: 5,
            }}>
              <i className="ph ph-map-pin-line" style={{ fontSize: 16, flexShrink: 0 }} />
              {c.name}
            </a>
          ) : (
            <p style={{ fontSize: 15, fontWeight: 900, color: "#111827", margin: 0 }}>{c.name}</p>
          )}
          {/* Governorate + Areas */}
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "3px 9px",
              borderRadius: 20, background: "#F3F6FF", color: "#6B7280",
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <i className="ph ph-map-trifold" style={{ fontSize: 12 }} />
              {govName}
            </span>
            {c.areas?.map(a => (
              <span key={a.id} style={{
                fontSize: 11, fontWeight: 700, padding: "3px 9px",
                borderRadius: 20, background: "#EEF4FF", color: "#246BFD",
              }}>
                {a.name}
              </span>
            ))}
          </div>
        </div>

        {/* Rating badge */}
        {c.rating != null && (
          <div style={{
            flexShrink: 0, display: "flex", flexDirection: "column",
            alignItems: "center", background: "#FFFBEB",
            border: "1.5px solid #FDE68A", borderRadius: 14,
            padding: "8px 12px", gap: 3,
          }}>
            <i className="ph ph-star-fill" style={{ fontSize: 18, color: "#F59E0B" }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: "#92400E" }}>{c.rating}</span>
          </div>
        )}
      </div>

      {/* ── Middle: address + phone ── */}
      {(c.address || c.phone) && (
        <div style={{ padding: "10px 16px", display: "flex", flexDirection: "column", gap: 8, borderBottom: "1px solid #F3F4F6" }}>
          {c.address && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6B7280" }}>
              <i className="ph ph-map-pin" style={{ fontSize: 16, color: "#9CA3AF", flexShrink: 0 }} />
              <span>{c.address}</span>
            </div>
          )}
          {c.phone && (
            <button onClick={copyPhone} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "none", border: "none", padding: 0,
              cursor: "pointer", fontFamily: "inherit", fontSize: 13,
              color: "#246BFD", fontWeight: 700, width: "fit-content",
            }}>
              <i className="ph ph-phone" style={{ fontSize: 16, flexShrink: 0 }} />
              <span style={{ direction: "ltr" }}>{c.phone}</span>
              <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500 }}>انقر للنسخ</span>
            </button>
          )}
        </div>
      )}

      {/* ── Working days ── */}
      {c.workingDays && c.workingDays.length > 0 && (
        <div style={{ padding: "10px 16px", borderBottom: "1px solid #F3F4F6" }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: "#374151", marginBottom: 8 }}>
            <i className="ph ph-calendar-check" style={{ fontSize: 13, marginLeft: 4, color: "#246BFD" }} />
            أيام الدوام
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {ALL_DAYS.map(d => {
              const active = workOn.includes(d);
              return (
                <span key={d} style={{
                  fontSize: 11, fontWeight: 700,
                  padding: "4px 10px", borderRadius: 20,
                  background: active ? "#246BFD" : "#F9FAFB",
                  color: active ? "#fff" : "#C4C9D4",
                  border: `1px solid ${active ? "#246BFD" : "#E5E7EB"}`,
                }}>
                  {d}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Working hours ── */}
      {c.workingHours && (
        <div style={{ padding: "10px 16px" }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: "#374151", marginBottom: 7 }}>
            <i className="ph ph-clock" style={{ fontSize: 13, marginLeft: 4, color: "#246BFD" }} />
            أوقات الدوام
          </p>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#F3F6FF", borderRadius: 10,
            padding: "8px 14px",
          }}>
            <i className="ph ph-clock-afternoon" style={{ fontSize: 16, color: "#246BFD" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{c.workingHours}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Centers List ───────────────────────────────────────── */
function CenterList({
  govId, govs, areas, centers, onBack,
}: {
  govId: string;
  govs: Record<string, Governorate>;
  areas: Record<string, Area>;
  centers: Record<string, Center>;
  onBack: () => void;
}) {
  const [areaId, setAreaId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const govAreas = useMemo(() =>
    Object.entries(areas)
      .filter(([, a]) => a.governorateId === govId)
      .map(([id, a]) => ({ id, ...a })),
    [areas, govId]
  );

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();
    return Object.entries(centers)
      .filter(([, c]) => {
        const inGov =
          c.governorateId === govId ||
          (c.areaId && areas[c.areaId]?.governorateId === govId);
        if (!inGov) return false;
        if (areaId) {
          const match = c.areaId === areaId || c.areas?.some(a => a.id === areaId);
          if (!match) return false;
        }
        if (search) {
          return (
            c.name?.toLowerCase().includes(search) ||
            c.address?.toLowerCase().includes(search)
          );
        }
        return true;
      })
      .map(([id, c]) => ({ id, ...c } as Center & { id: string }))
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }, [centers, areas, govId, areaId, q]);

  const govName = govs[govId]?.name || "";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      <PageHeader
        title={govName}
        sub={`${filtered.length} مركز تدريب`}
        onBack={onBack}
      />
      <div className="screen-body" style={{ padding: "14px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        <Search value={q} onChange={setQ} placeholder="ابحث عن مركز تدريب..." />

        {/* Area chips */}
        {govAreas.length > 0 && (
          <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
            {[{ id: null as string | null, name: "الكل" }, ...govAreas].map(a => {
              const sel = areaId === a.id;
              return (
                <button key={a.id ?? "all"} onClick={() => setAreaId(a.id)} style={{
                  flexShrink: 0, padding: "7px 15px", borderRadius: 100,
                  border: `1.5px solid ${sel ? "#246BFD" : "#E5E7EB"}`,
                  background: sel ? "#246BFD" : "#fff",
                  color: sel ? "#fff" : "#374151",
                  fontSize: 13, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                  {a.name}
                </button>
              );
            })}
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#9CA3AF" }}>
            <i className="ph ph-map-pin" style={{ fontSize: 44, display: "block", marginBottom: 10, color: "#D1D5DB" }} />
            <p style={{ fontSize: 14 }}>لا توجد مراكز مطابقة</p>
          </div>
        )}

        {filtered.map((c, i) => (
          <div key={c.id} className="fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
            <CenterCard c={c} govName={govName} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Root Export ────────────────────────────────────────── */
export default function Centers({ govs, areas, centers, onBack }: Props) {
  const [govId, setGovId] = useState<string | null>(null);

  const govList = useMemo(() =>
    Object.entries(govs).map(([id, g]) => ({ id, ...g })),
    [govs]
  );

  if (!govId) {
    return <GovList govs={govList} onSelect={setGovId} onBack={onBack} />;
  }

  return (
    <CenterList
      govId={govId}
      govs={govs}
      areas={areas}
      centers={centers}
      onBack={() => setGovId(null)}
    />
  );
}
