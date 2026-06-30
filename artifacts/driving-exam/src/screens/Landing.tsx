import { motion } from "framer-motion";

interface LandingProps {
  onStart: () => void;
}

const features = [
  { icon: "shield-check", color: "#16A34A", bg: "#ECFDF3", label: "موثوق من دائرة الترخيص" },
  { icon: "target", color: "#246BFD", bg: "#EEF4FF", label: "محاكاة فعلية" },
  { icon: "list-checks", color: "#EA580C", bg: "#FFF7ED", label: "مطابق لأسئلة الاختبار" },
  { icon: "exam", color: "#DB2777", bg: "#FDF2F8", label: "تجربة امتحان كاملة" },
];

export default function Landing({ onStart }: LandingProps) {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: "white" }}>
      {/* Gradient hero background */}
      <div
        className="absolute top-0 left-0 right-0 h-72 pointer-events-none"
        style={{
          background: "linear-gradient(160deg, #EEF4FF 0%, #F0F7FF 40%, white 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col flex-1 px-5 pt-10 pb-10">
        {/* Hero */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="mx-auto mb-6 flex items-center justify-center"
            style={{
              width: 96,
              height: 96,
              borderRadius: 32,
              background: "linear-gradient(135deg, #246BFD, #5B8FFF)",
              boxShadow: "0 20px 50px rgba(36,107,253,0.25)",
            }}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200 }}
          >
            <i className="ph ph-clipboard-text" style={{ fontSize: 46, color: "white" }} />
          </motion.div>

          <motion.h1
            className="font-black mb-3"
            style={{ fontSize: 30, color: "#1F2937", lineHeight: 1.3 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            اختبار الفحص النظري
          </motion.h1>

          <motion.p
            style={{ color: "#6B7280", lineHeight: 1.9, fontSize: 14 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            دراسة مصنفة حسب أقسام المادة النظرية، اختبار محاكي قريب من التجربة الفعلية، وترشيح مراكز تدريب قريبة منك.
          </motion.p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              className="flex flex-col items-center text-center p-4 rounded-3xl"
              style={{
                background: "white",
                border: "1px solid #E9EEF5",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.07 }}
              whileTap={{ scale: 0.97 }}
            >
              <div
                className="flex items-center justify-center mb-3"
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 18,
                  background: f.bg,
                  color: f.color,
                  fontSize: 22,
                }}
              >
                <i className={`ph ph-${f.icon}`} />
              </div>
              <span className="font-bold" style={{ fontSize: 13, color: "#1F2937", lineHeight: 1.5 }}>
                {f.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Stats bar */}
        <motion.div
          className="flex items-center justify-around rounded-2xl p-4 mb-8"
          style={{ background: "#F7F8FC", border: "1px solid #E9EEF5" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          {[
            { value: "+500", label: "سؤال" },
            { value: "6", label: "أقسام" },
            { value: "100%", label: "مجاني" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-black text-xl" style={{ color: "#246BFD" }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Start button */}
        <motion.button
          onClick={onStart}
          className="w-full flex items-center justify-center gap-2 font-bold text-white rounded-2xl"
          style={{
            height: 58,
            background: "linear-gradient(135deg, #246BFD, #1F5CE0)",
            boxShadow: "0 12px 28px rgba(36,107,253,0.30)",
            fontSize: 17,
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          whileTap={{ scale: 0.98 }}
        >
          <i className="ph ph-rocket-launch" style={{ fontSize: 22 }} />
          ابدأ الآن
        </motion.button>
      </div>
    </div>
  );
}
