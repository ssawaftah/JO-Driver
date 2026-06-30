import { useState, useMemo, useRef } from "react";
import type { Governorate, Area, Center } from "../types";

interface Props {
  govs: Record<string, Governorate>;
  areas: Record<string, Area>;
  centers: Record<string, Center>;
  onBack: () => void;
}

const ALL_DAYS = ["س","ح","ن","ث","ر","خ","ج"];
const ALL_DAYS_FULL = ["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];

/* ── Phone copy with inline feedback ─────────────────────── */
function PhoneBtn({ phone }: { phone: string }) {
  const [copied, setCopied] = useState(false);
  function handle() {
    navigator.clipboard.writeText(phone).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <button
      onClick={handle}
      style={{
        flex: 1, height: 40, borderRadius: 12,
        border: `1.5px solid ${copied ? "#16A34A" : "#E5E7EB"}`,
        background: copied ? "#DCFCE7" : "#F9FAFB",
        color: copied ? "#16A34A" : "#374151",
        fontSize: 13, fontWeight: 700,
        cursor: "pointer", fontFamily: "inherit",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        transition: "all 0.2s",
      }}
    >
      <i className={`ph ph-${copied ? "check" : "phone"}`} style={{ fontSize: 16 }} />
      {copied ? "تم النسخ" : phone}
    </button>
  );
}

/* ── Center Card ─────────────────────────────────────────── */
function CenterCard({ c, govName }: { c: Center & { id: string }; govName: string }) {
  const [expanded, setExpanded] = useState(false);

  const activeDays = ALL_DAYS_FULL.filter(d => c.workingDays?.includes(d));

  return (
    <div style={{
      background: "#fff",
      borderRadius: 18,
      border: "1.5px solid #F0F1F3",
      overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>

      {/* ── Main row ── */}
      <div style={{ padding: "14px 16px" }}>

        {/* Name + Rating */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#111827", lineHeight: 1.4, marginBottom: 6 }}>
              {c.name}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              <span style={{
                fontSize: 11, fontWeight: 700,
                padding: "3px 9px", borderRadius: 20,
                background: "#F3F4F6", color: "#6B7280",
                display: "inline-flex", alignItems: "center", gap: 4,
              }}>
                <i className="ph ph-map-trifold" style={{ fontSize: 12 }} />
                {govName}
              </span>
              {c.areas?.map(a => (
                <span key={a.id} style={{
                  fontSize: 11, fontWeight: 700,
                  padding: "3px 9px", borderRadius: 20,
                  background: "#EEF4FF", color: "#246BFD",
                }}>
                  {a.name}
                </span>
              ))}
            </div>
          </div>

          {/* Rating */}
          {c.rating != null && (
            <div style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "#FFFBEB", border: "1.5px solid #FDE68A",
              borderRadius: 10, padding: "5px 9px", flexShrink: 0,
            }}>
              <i className="ph ph-star-fill" style={{ fontSize: 14, color: "#F59E0B" }} />
              <span style={{ fontSize: 14, fontWeight: 900, color: "#92400E" }}>{c.rating}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          {c.phone && <PhoneBtn phone={c.phone} />}
          {c.mapLink && (
            <a
              href={c.mapLink}
              target="_blank"
              rel="noreferrer"
              style={{
                flex: 1, height: 40, borderRadius: 12,
                background: "#246BFD", color: "#fff",
                fontSize: 13, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                textDecoration: "none",
              }}
            >
              <i className="ph ph-map-pin-line" style={{ fontSize: 16 }} />
              الموقع
            </a>
          )}
          {(c.workingDays?.length || c.workingHours || c.address) && (
            <button
              onClick={() => setExpanded(e => !e)}
              style={{
                width: 40, height: 40, borderRadius: 12,
                border: "1.5px solid #E5E7EB", background: "#F9FAFB",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", flexShrink: 0,
              }}
            >
              <i
                className={`ph ph-caret-${expanded ? "up" : "down"}`}
                style={{ fontSize: 16, color: "#6B7280" }}
              />
            </button>
          )}
        </div>
      </div>

      {/* ── Expanded details ── */}
      {expanded && (
        <div style={{ borderTop: "1px solid #F3F4F6", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Address */}
          {c.address && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6B7280" }}>
              <i className="ph ph-map-pin" style={{ fontSize: 16, color: "#9CA3AF", flexShrink: 0 }} />
              {c.address}
            </div>
          )}

          {/* Working hours */}
          {c.workingHours && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <i className="ph ph-clock" style={{ fontSize: 16, color: "#9CA3AF", flexShrink: 0 }} />
              <span style={{
                fontSize: 13, fontWeight: 700, color: "#374151",
                background: "#F3F6FF", borderRadius: 8, padding: "4px 10px",
              }}>
                {c.workingHours}
              </span>
            </div>
          )}

          {/* Working days */}
          {c.workingDays && c.workingDays.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, color: "#9CA3AF", marginBottom: 7, letterSpacing: "0.3px" }}>
                أيام الدوام
              </p>
              <div style={{ display: "flex", gap: 5 }}>
                {ALL_DAYS_FULL.map((day, i) => {
                  const on = activeDays.includes(day);
                  return (
                    <div key={day} style={{
                      width: 32, height: 32, borderRadius: 9,
                      background: on ? "#246BFD" : "#F3F4F6",
                      color: on ? "#fff" : "#C4C9D4",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 800,
                    }}>
                      {ALL_DAYS[i]}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Root ────────────────────────────────────────────────── */
export default function Centers({ govs, areas, centers, onBack }: Props) {
  const [govId, setGovId] = useState<string | null>(null);
  const [areaId, setAreaId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

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
    return Object.entries(centers)
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
            c.address?.toLowerCase().includes(search)
          );
        }
        return true;
      })
      .map(([id, c]) => ({ id, ...c } as Center & { id: string }))
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }, [centers, areas, govId, areaId, q]);

  const govName = govId ? (govs[govId]?.name || "") : "";

  function selectGov(id: string | null) {
    setGovId(id);
    setAreaId(null);
    setQ("");
    // scroll list to top
    setTimeout(() => listRef.current?.scrollTo({ top: 0 }), 50);
  }

  const totalCenters = Object.keys(centers).length;

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: "#F9FAFB" }}>

      {/* ── Header ── */}
      <div style={{
        background: "#fff",
        borderBottom: "1.5px solid #F0F1F3",
        flexShrink: 0,
      }}>
        {/* Top bar */}
        <div style={{
          padding: "14px 16px",
          display: "flex", alignItems: "center", gap: 12,
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
            <div style={{ fontSize: 17, fontWeight: 900, color: "#111827" }}>مراكز التدريب</div>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 1 }}>
              {govId ? `${filtered.length} مركز في ${govName}` : `${totalCenters} مركز معتمد`}
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: "0 16px 12px", position: "relative" }}>
          <i className="ph ph-magnifying-glass" style={{
            position: "absolute", right: 30, top: "50%",
            transform: "translateY(-50%)",
            fontSize: 17, color: "#9CA3AF", pointerEvents: "none",
          }} />
          <input
            className="inp"
            placeholder="ابحث عن مركز..."
            value={q}
            onChange={e => setQ(e.target.value)}
            style={{ paddingRight: 42, background: "#F9FAFB", borderRadius: 12 }}
          />
        </div>

        {/* Governorate chips */}
        <div style={{
          display: "flex", gap: 7, overflowX: "auto",
          padding: "0 16px 12px", scrollbarWidth: "none",
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

        {/* Area chips — only when a gov is selected and has areas */}
        {govAreas.length > 0 && (
          <div style={{
            display: "flex", gap: 6, overflowX: "auto",
            padding: "0 16px 12px", scrollbarWidth: "none",
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
      </div>

      {/* ── Centers list ── */}
      <div
        ref={listRef}
        style={{ flex: "1 1 0", minHeight: 0, overflowY: "auto", padding: "14px 14px", display: "flex", flexDirection: "column", gap: 10 }}
      >
        {filtered.length === 0 ? (
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
            />
          ))
        )}
      </div>
    </div>
  );
}
