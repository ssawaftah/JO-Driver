import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface ResultProps {
  correct: number;
  total: number;
  onBack: () => void;
  onRetry: () => void;
}

function useCountUp(target: number, duration = 1200) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let start = 0;
    const startTime = performance.now();
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(eased * target);
      if (ref.current) ref.current.textContent = String(val);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration]);
  return ref;
}

export default function Result({ correct, total, onBack, onRetry }: ResultProps) {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = percentage >= 70;
  const countRef = useCountUp(percentage);

  const circumference = 2 * Math.PI * 48;
  const dashOffset = circumference - (percentage / 100) * circumference;

  const grade =
    percentage >= 90 ? "ممتاز" :
    percentage >= 80 ? "جيد جداً" :
    percentage >= 70 ? "جيد" :
    percentage >= 60 ? "مقبول" : "يحتاج تحسين";

  const gradeColor =
    percentage >= 90 ? "#16A34A" :
    percentage >= 70 ? "#246BFD" :
    percentage >= 50 ? "#D97706" : "#DC2626";

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "white" }}>
      {/* Colored top bar */}
      <div
        style={{
          height: 6,
          background: passed ? "linear-gradient(90deg, #16A34A, #22C55E)" : "linear-gradient(90deg, #DC2626, #EF4444)",
        }}
      />

      <div className="flex-1 px-5 pt-8 pb-10 flex flex-col items-center">
        {/* Trophy / icon */}
        <motion.div
          className="flex items-center justify-center mb-6"
          style={{
            width: 96, height: 96, borderRadius: 32,
            background: passed
              ? "linear-gradient(135deg, #16A34A, #22C55E)"
              : "linear-gradient(135deg, #DC2626, #EF4444)",
            boxShadow: passed
              ? "0 20px 50px rgba(22,163,74,0.25)"
              : "0 20px 50px rgba(220,38,38,0.25)",
          }}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.1 }}
        >
          <i
            className={passed ? "ph ph-trophy" : "ph ph-x-circle"}
            style={{ fontSize: 48, color: "white" }}
          />
        </motion.div>

        {/* Score circle */}
        <motion.div
          className="relative flex items-center justify-center mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 160 }}
        >
          <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="60" cy="60" r="48" fill="none" stroke="#E9EEF5" strokeWidth="8" />
            <motion.circle
              cx="60" cy="60" r="48" fill="none"
              stroke={gradeColor} strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span ref={countRef} className="font-black" style={{ fontSize: 28, color: gradeColor, lineHeight: 1 }}>
              0
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#6B7280" }}>%</span>
          </div>
        </motion.div>

        {/* Grade badge */}
        <motion.div
          className="font-black mb-2 rounded-full"
          style={{ fontSize: 22, color: "#1F2937" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          {grade}
        </motion.div>

        <motion.p
          style={{ fontSize: 14, color: "#6B7280", marginBottom: 8 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {passed ? "أحسنت! لقد اجتزت الاختبار" : "لم تجتز الاختبار هذه المرة"}
        </motion.p>

        {/* Stats cards */}
        <motion.div
          className="w-full grid grid-cols-3 gap-3 mb-8 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          {[
            { value: correct, label: "إجابة صحيحة", color: "#16A34A", bg: "#ECFDF3" },
            { value: total - correct, label: "إجابة خاطئة", color: "#DC2626", bg: "#FEF2F2" },
            { value: total, label: "إجمالي الأسئلة", color: "#246BFD", bg: "#EEF4FF" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center justify-center rounded-2xl p-3"
              style={{ background: s.bg }}
            >
              <span className="font-black" style={{ fontSize: 24, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: 11, color: s.color, fontWeight: 700, textAlign: "center", marginTop: 2 }}>{s.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Motivational message */}
        <motion.div
          className="w-full rounded-2xl p-4 mb-8 flex gap-3"
          style={{ background: passed ? "#ECFDF3" : "#FEF3C7", border: `1.5px solid ${passed ? "#BBF7D0" : "#FDE68A"}` }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <i
            className={passed ? "ph ph-check-circle" : "ph ph-lightbulb"}
            style={{ fontSize: 22, color: passed ? "#16A34A" : "#D97706", flexShrink: 0, marginTop: 2 }}
          />
          <p style={{ fontSize: 14, color: passed ? "#15803D" : "#92400E", lineHeight: 1.7 }}>
            {passed
              ? "أداء رائع! استمر في المراجعة للحصول على نتيجة أفضل."
              : "لا تيأس! راجع الأسئلة مرة أخرى وستحقق نتيجة أفضل بإذن الله."}
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="w-full flex flex-col gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <motion.button
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-2 font-bold text-white rounded-2xl"
            style={{
              height: 54, background: "linear-gradient(135deg, #246BFD, #1F5CE0)",
              boxShadow: "0 10px 24px rgba(36,107,253,0.28)",
              border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 16,
            }}
            whileTap={{ scale: 0.97 }}
          >
            <i className="ph ph-arrow-clockwise" style={{ fontSize: 20 }} />
            إعادة الاختبار
          </motion.button>
          <motion.button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 font-bold rounded-2xl"
            style={{
              height: 54, background: "white", border: "1.5px solid #E9EEF5",
              color: "#6B7280", cursor: "pointer", fontFamily: "inherit", fontSize: 16,
            }}
            whileTap={{ scale: 0.97 }}
          >
            <i className="ph ph-folder-open" style={{ fontSize: 20 }} />
            الرجوع للأقسام
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
