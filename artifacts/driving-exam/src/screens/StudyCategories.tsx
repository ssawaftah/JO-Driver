import { motion } from "framer-motion";

interface StudyCategoriesProps {
  categories: string[];
  questionCounts: Record<string, number>;
  onBack: () => void;
  onStudy: (category: string) => void;
  onTest: (category: string) => void;
}

const CATEGORY_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  "قواعد السير والمرور": { icon: "traffic-sign", color: "#246BFD", bg: "#EEF4FF" },
  "الميكانيك": { icon: "wrench", color: "#16A34A", bg: "#ECFDF3" },
  "السلامة على الطريق": { icon: "shield-check", color: "#EA580C", bg: "#FFF7ED" },
  "أسعافات أولية": { icon: "first-aid-kit", color: "#DB2777", bg: "#FDF2F8" },
  "الشواخص والخطوط والعلامات": { icon: "signpost", color: "#D97706", bg: "#FFF8E7" },
  "المخالفات واحتساب النقاط": { icon: "warning-circle", color: "#7C3AED", bg: "#F5F3FF" },
};

const DEFAULT_META = { icon: "book-open", color: "#246BFD", bg: "#EEF4FF" };

export default function StudyCategories({ categories, questionCounts, onBack, onStudy, onTest }: StudyCategoriesProps) {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: "white" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-20 px-5 flex items-center gap-3"
        style={{ paddingTop: 14, paddingBottom: 14, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E9EEF5" }}
      >
        <button
          onClick={onBack}
          className="flex items-center justify-center rounded-xl"
          style={{ width: 40, height: 40, background: "#F7F8FC", border: "1.5px solid #E9EEF5", cursor: "pointer" }}
        >
          <i className="ph ph-arrow-right" style={{ fontSize: 20, color: "#246BFD" }} />
        </button>
        <div>
          <div className="font-black" style={{ fontSize: 18, color: "#1F2937" }}>أقسام الأسئلة</div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>{categories.length} أقسام</div>
        </div>
      </div>

      <div className="px-5 pt-4 pb-10 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3">
          {categories.map((cat, i) => {
            const meta = CATEGORY_ICONS[cat] || DEFAULT_META;
            const count = questionCounts[cat] || 0;

            return (
              <motion.div
                key={cat}
                className="rounded-3xl overflow-hidden"
                style={{ background: "white", border: "1.5px solid #E9EEF5", boxShadow: "0 3px 14px rgba(0,0,0,0.04)" }}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <div className="flex items-center gap-3 p-4">
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{ width: 48, height: 48, borderRadius: 16, background: meta.bg, color: meta.color, fontSize: 22 }}
                  >
                    <i className={`ph ph-${meta.icon}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-black" style={{ fontSize: 15, color: "#1F2937" }}>{i + 1}. {cat}</div>
                    {count > 0 && (
                      <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{count} سؤال</div>
                    )}
                  </div>
                </div>

                <div
                  className="flex items-center gap-2 px-4 pb-4"
                  style={{ borderTop: "1px solid #F3F4F6", paddingTop: 12 }}
                >
                  <motion.button
                    onClick={() => onStudy(cat)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl font-bold"
                    style={{
                      height: 40, background: "#EEF4FF", color: "#246BFD",
                      border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13,
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <i className="ph ph-book-open" style={{ fontSize: 16 }} />
                    مراجعة
                  </motion.button>
                  <motion.button
                    onClick={() => onTest(cat)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl font-bold text-white"
                    style={{
                      height: 40, background: "linear-gradient(135deg, #246BFD, #1F5CE0)",
                      border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13,
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <i className="ph ph-pencil-line" style={{ fontSize: 16 }} />
                    اختبار
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
