import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Governorate, Area, Center } from "../types";
import { showAlert } from "../lib/telegram";

interface TrainingCentersProps {
  govs: Record<string, Governorate>;
  areas: Record<string, Area>;
  centers: Record<string, Center>;
  onBack: () => void;
}

const ALL_DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

function copyPhone(phone: string) {
  navigator.clipboard.writeText(phone).then(
    () => showAlert("✅ تم نسخ الرقم: " + phone),
    () => showAlert("❌ فشل نسخ الرقم")
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <i
          key={s}
          className={s <= Math.round(rating) ? "ph-fill ph-star" : "ph ph-star"}
          style={{ fontSize: 12, color: "#F59E0B" }}
        />
      ))}
    </div>
  );
}

function CenterCard({ c }: { c: Center }) {
  return (
    <motion.div
      className="rounded-3xl overflow-hidden"
      style={{ background: "white", border: "1.5px solid #E9EEF5", boxShadow: "0 3px 16px rgba(0,0,0,0.04)", marginBottom: 12 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex-1">
          {c.mapLink ? (
            <a
              href={c.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="font-black"
              style={{ fontSize: 16, color: "#246BFD", textDecoration: "none", display: "block", lineHeight: 1.4 }}
            >
              {c.name}
            </a>
          ) : (
            <div className="font-black" style={{ fontSize: 16, color: "#1F2937", lineHeight: 1.4 }}>{c.name}</div>
          )}

          {c.areas && c.areas.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {c.areas.map((a) => (
                <span
                  key={a.id}
                  style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: "#EEF4FF", color: "#246BFD" }}
                >
                  {a.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {c.rating != null && (
          <div
            className="flex flex-col items-center justify-center flex-shrink-0 mr-3"
            style={{ background: "#FEF3C7", borderRadius: 14, padding: "8px 12px", minWidth: 60 }}
          >
            <span className="font-black" style={{ fontSize: 18, color: "#92400E" }}>{c.rating}</span>
            <StarRating rating={c.rating} />
            <span style={{ fontSize: 9, color: "#B45309", marginTop: 2 }}>Google</span>
          </div>
        )}
      </div>

      {/* Info row */}
      <div className="px-4 pb-3 flex flex-wrap gap-3" style={{ fontSize: 13, color: "#6B7280" }}>
        {c.address && (
          <span className="flex items-center gap-1.5">
            <i className="ph ph-map-pin" style={{ color: "#9CA3AF" }} />
            {c.address}
          </span>
        )}
        {c.phone && (
          <button
            onClick={() => copyPhone(c.phone!)}
            className="flex items-center gap-1.5"
            style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, color: "#246BFD", fontWeight: 700, padding: 0 }}
          >
            <i className="ph ph-phone" />
            {c.phone}
          </button>
        )}
      </div>

      {/* Working days */}
      {c.workingDays && c.workingDays.length > 0 && (
        <div className="px-4 pb-3">
          <div className="font-bold mb-2" style={{ fontSize: 12, color: "#6B7280" }}>أيام الدوام</div>
          <div className="flex flex-wrap gap-1.5">
            {ALL_DAYS.map((day) => {
              const active = c.workingDays!.includes(day);
              return (
                <span
                  key={day}
                  style={{
                    padding: "5px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: active ? "#246BFD" : "#F7F8FC",
                    color: active ? "white" : "#9CA3AF",
                    border: `1px solid ${active ? "#246BFD" : "#E9EEF5"}`,
                  }}
                >
                  {day}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Working hours */}
      {c.workingHours && (
        <div className="px-4 pb-4">
          <div
            className="inline-flex items-center gap-2 rounded-xl"
            style={{ padding: "8px 12px", background: "#F7F8FC", border: "1px solid #E9EEF5", fontSize: 12, fontWeight: 700, color: "#1F2937" }}
          >
            <i className="ph ph-clock" style={{ color: "#246BFD" }} />
            {c.workingHours}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function TrainingCenters({ govs, areas, centers, onBack }: TrainingCentersProps) {
  const [selectedGov, setSelectedGov] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [govSearch, setGovSearch] = useState("");
  const [centerSearch, setCenterSearch] = useState("");

  const govList = useMemo(() => {
    const q = govSearch.trim();
    return Object.entries(govs)
      .filter(([, g]) => !q || g.name.includes(q))
      .map(([id, g]) => ({ id, ...g }));
  }, [govs, govSearch]);

  const govAreas = useMemo(() => {
    if (!selectedGov) return [];
    return Object.entries(areas)
      .filter(([, a]) => a.governorateId === selectedGov)
      .map(([id, a]) => ({ id, ...a }));
  }, [areas, selectedGov]);

  const centerList = useMemo(() => {
    if (!selectedGov) return [];
    const q = centerSearch.trim().toLowerCase();
    const list = Object.entries(centers)
      .filter(([, c]) => {
        const inGov =
          c.governorateId === selectedGov ||
          (c.areaId && areas[c.areaId]?.governorateId === selectedGov);
        if (!inGov) return false;
        if (selectedArea) {
          const hasArea =
            c.areaId === selectedArea ||
            (c.areas && c.areas.some((a) => a.id === selectedArea));
          if (!hasArea) return false;
        }
        if (q) return (c.name || "").toLowerCase().includes(q) || (c.address || "").toLowerCase().includes(q);
        return true;
      })
      .map(([id, c]) => ({ id, ...c }));
    return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }, [centers, areas, selectedGov, selectedArea, centerSearch]);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "white" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-20 px-5 flex items-center gap-3"
        style={{ paddingTop: 14, paddingBottom: 14, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E9EEF5" }}
      >
        <button
          onClick={selectedGov ? () => { setSelectedGov(null); setSelectedArea(null); setCenterSearch(""); } : onBack}
          className="flex items-center justify-center rounded-xl"
          style={{ width: 40, height: 40, background: "#F7F8FC", border: "1.5px solid #E9EEF5", cursor: "pointer" }}
        >
          <i className="ph ph-arrow-right" style={{ fontSize: 20, color: "#246BFD" }} />
        </button>
        <div>
          <div className="font-black" style={{ fontSize: 18, color: "#1F2937" }}>
            {selectedGov ? (govs[selectedGov]?.name || "المراكز") : "المحافظات"}
          </div>
          {selectedGov && (
            <div style={{ fontSize: 12, color: "#6B7280" }}>{centerList.length} مركز تدريب</div>
          )}
        </div>
      </div>

      <div className="flex-1 px-5 pt-4 pb-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          {!selectedGov ? (
            <motion.div key="govs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Search */}
              <div className="relative mb-4">
                <i className="ph ph-magnifying-glass absolute" style={{ right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "#9CA3AF" }} />
                <input
                  type="text"
                  placeholder="ابحث عن محافظة..."
                  value={govSearch}
                  onChange={(e) => setGovSearch(e.target.value)}
                  style={{
                    width: "100%", height: 48, paddingRight: 42, paddingLeft: 16,
                    borderRadius: 14, border: "1.5px solid #E9EEF5", background: "#F7F8FC",
                    fontFamily: "inherit", fontSize: 14, color: "#1F2937", outline: "none",
                    direction: "rtl",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#246BFD")}
                  onBlur={(e) => (e.target.style.borderColor = "#E9EEF5")}
                />
              </div>

              <div className="flex flex-col gap-2.5">
                {govList.map((g, i) => (
                  <motion.button
                    key={g.id}
                    onClick={() => setSelectedGov(g.id)}
                    className="flex items-center gap-3 rounded-2xl w-full text-right"
                    style={{
                      padding: "14px 16px", background: "white",
                      border: "1.5px solid #E9EEF5", cursor: "pointer", fontFamily: "inherit",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className="flex items-center justify-center flex-shrink-0"
                      style={{ width: 42, height: 42, borderRadius: 14, background: "#EEF4FF", color: "#246BFD", fontSize: 20 }}
                    >
                      <i className="ph ph-map-pin" />
                    </div>
                    <span className="flex-1 font-bold" style={{ fontSize: 16, color: "#1F2937" }}>{g.name}</span>
                    <i className="ph ph-caret-left" style={{ fontSize: 16, color: "#D1D5DB" }} />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="centers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Search centers */}
              <div className="relative mb-3">
                <i className="ph ph-magnifying-glass absolute" style={{ right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "#9CA3AF" }} />
                <input
                  type="text"
                  placeholder="ابحث عن مركز تدريب..."
                  value={centerSearch}
                  onChange={(e) => { setCenterSearch(e.target.value); }}
                  style={{
                    width: "100%", height: 48, paddingRight: 42, paddingLeft: 16,
                    borderRadius: 14, border: "1.5px solid #E9EEF5", background: "#F7F8FC",
                    fontFamily: "inherit", fontSize: 14, color: "#1F2937", outline: "none", direction: "rtl",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#246BFD")}
                  onBlur={(e) => (e.target.style.borderColor = "#E9EEF5")}
                />
              </div>

              {/* Area chips */}
              {govAreas.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                  {[{ id: null, name: "الكل" }, ...govAreas].map((a) => (
                    <button
                      key={a.id ?? "all"}
                      onClick={() => setSelectedArea(a.id)}
                      className="flex-shrink-0 font-bold rounded-full"
                      style={{
                        padding: "8px 16px", fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                        background: selectedArea === a.id ? "#246BFD" : "white",
                        color: selectedArea === a.id ? "white" : "#1F2937",
                        border: `1.5px solid ${selectedArea === a.id ? "#246BFD" : "#E9EEF5"}`,
                      }}
                    >
                      {a.name}
                    </button>
                  ))}
                </div>
              )}

              {centerList.length === 0 ? (
                <motion.div
                  className="flex flex-col items-center justify-center py-16 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <i className="ph ph-map-pin" style={{ fontSize: 48, color: "#D1D5DB", marginBottom: 12 }} />
                  <p style={{ color: "#9CA3AF", fontWeight: 700 }}>لا توجد مراكز تدريب مطابقة</p>
                </motion.div>
              ) : (
                centerList.map((c) => <CenterCard key={c.id} c={c} />)
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
