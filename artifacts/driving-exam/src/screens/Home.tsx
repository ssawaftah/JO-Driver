import { motion } from "framer-motion";

interface HomeProps {
  userName: string;
  onExam: () => void;
  onStudy: () => void;
  onCenters: () => void;
}

const cards = [
  {
    icon: "pencil-line",
    color: "#16A34A",
    bg: "#ECFDF3",
    title: "بدء الامتحان النظري",
    desc: "محاكاة واقعية لاختبار القيادة النظري",
    badge: "قريباً",
  },
  {
    icon: "book-open",
    color: "#246BFD",
    bg: "#EEF4FF",
    title: "دراسة الأسئلة",
    desc: "مراجعة الأسئلة حسب الأقسام المختلفة",
    badge: null,
  },
  {
    icon: "map-pin",
    color: "#D97706",
    bg: "#FFF8E7",
    title: "مراكز تدريب القيادة",
    desc: "اعثر على أقرب مركز تدريب معتمد",
    badge: null,
  },
];

export default function Home({ userName, onExam, onStudy, onCenters }: HomeProps) {
  const actions = [onExam, onStudy, onCenters];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "صباح الخير" : hour < 18 ? "مساء الخير" : "مساء النور";

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "white" }}>
      {/* Top gradient */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: 220, background: "linear-gradient(160deg, #EEF4FF 0%, white 100%)" }}
      />

      <div className="relative z-10 px-5 pt-8 pb-10 flex flex-col flex-1">
        {/* Header greeting */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 13, color: "#6B7280", fontWeight: 600 }}>{greeting},</p>
              <h1 className="font-black mt-0.5" style={{ fontSize: 24, color: "#1F2937" }}>
                {userName || "أهلاً بك!"}
              </h1>
              <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
                منصتك للاستعداد لاختبار السواقة النظري
              </p>
            </div>
            <motion.div
              className="flex items-center justify-center"
              style={{
                width: 52, height: 52, borderRadius: 18,
                background: "linear-gradient(135deg, #246BFD, #5B8FFF)",
                boxShadow: "0 8px 20px rgba(36,107,253,0.22)",
              }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 220, delay: 0.1 }}
            >
              <i className="ph ph-car" style={{ fontSize: 24, color: "white" }} />
            </motion.div>
          </div>
        </motion.div>

        {/* Quick stats */}
        <motion.div
          className="rounded-2xl p-4 mb-6 flex items-center gap-4"
          style={{
            background: "linear-gradient(135deg, #246BFD, #1F5CE0)",
            boxShadow: "0 12px 32px rgba(36,107,253,0.22)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-center rounded-xl" style={{ width: 52, height: 52, background: "rgba(255,255,255,0.18)" }}>
            <i className="ph ph-star" style={{ fontSize: 26, color: "white" }} />
          </div>
          <div className="flex-1">
            <div className="font-black text-white" style={{ fontSize: 17 }}>ابدأ رحلة النجاح</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>أكثر من 500 سؤال في 6 أقسام</div>
          </div>
          <i className="ph ph-arrow-left" style={{ fontSize: 18, color: "rgba(255,255,255,0.7)" }} />
        </motion.div>

        {/* Action cards */}
        <div className="flex flex-col gap-3">
          {cards.map((card, i) => (
            <motion.button
              key={card.title}
              onClick={actions[i]}
              className="w-full flex items-center gap-4 rounded-3xl text-right"
              style={{
                padding: "18px 20px",
                background: "white",
                border: "1.5px solid #E9EEF5",
                boxShadow: "0 3px 16px rgba(0,0,0,0.04)",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 54, height: 54, borderRadius: 18,
                  background: card.bg, color: card.color, fontSize: 26,
                }}
              >
                <i className={`ph ph-${card.icon}`} />
              </div>
              <div className="flex-1 text-right">
                <div className="flex items-center gap-2">
                  <span className="font-black" style={{ fontSize: 16, color: "#1F2937" }}>{card.title}</span>
                  {card.badge && (
                    <span
                      className="font-bold"
                      style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 100,
                        background: "#FEF3C7", color: "#92400E",
                      }}
                    >
                      {card.badge}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: "#6B7280", marginTop: 3 }}>{card.desc}</div>
              </div>
              <i className="ph ph-caret-left flex-shrink-0" style={{ fontSize: 18, color: "#D1D5DB" }} />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
