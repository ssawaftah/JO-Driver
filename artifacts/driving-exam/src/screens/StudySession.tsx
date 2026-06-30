import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Question } from "../types";

interface StudySessionProps {
  questions: Question[];
  category: string;
  onBack: () => void;
}

export default function StudySession({ questions, category, onBack }: StudySessionProps) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);

  const q = questions[index];
  const total = questions.length;
  const progress = ((index + 1) / total) * 100;

  function goNext() {
    if (index < total - 1) { setDir(1); setIndex(index + 1); }
  }
  function goPrev() {
    if (index > 0) { setDir(-1); setIndex(index - 1); }
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "white" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-20 px-5"
        style={{ paddingTop: 14, paddingBottom: 14, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E9EEF5" }}
      >
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center rounded-xl flex-shrink-0"
            style={{ width: 40, height: 40, background: "#F7F8FC", border: "1.5px solid #E9EEF5", cursor: "pointer" }}
          >
            <i className="ph ph-arrow-right" style={{ fontSize: 20, color: "#246BFD" }} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="font-black truncate" style={{ fontSize: 15, color: "#1F2937" }}>{category}</div>
            <div style={{ fontSize: 12, color: "#6B7280" }}>السؤال {index + 1} من {total}</div>
          </div>
          <div
            className="flex items-center justify-center rounded-xl flex-shrink-0 font-black"
            style={{ width: 44, height: 44, background: "#EEF4FF", color: "#246BFD", fontSize: 14 }}
          >
            {index + 1}/{total}
          </div>
        </div>

        {/* Progress bar */}
        <div className="rounded-full overflow-hidden" style={{ height: 5, background: "#E9EEF5" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #246BFD, #5B8FFF)" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35 }}
          />
        </div>
      </div>

      <div className="flex-1 px-5 pt-5 pb-10 overflow-y-auto flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: dir * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -dir * 30 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col"
          >
            {/* Study mode badge */}
            <div
              className="inline-flex items-center gap-1.5 self-start mb-4 rounded-full font-bold"
              style={{ padding: "6px 14px", background: "#ECFDF3", color: "#16A34A", fontSize: 12 }}
            >
              <i className="ph ph-eye" style={{ fontSize: 14 }} />
              وضع المراجعة
            </div>

            {/* Media */}
            {q.mediaUrl && q.mediaType !== "text" && (
              <div className="mb-4 rounded-2xl overflow-hidden" style={{ border: "1.5px solid #E9EEF5" }}>
                {(q.mediaType === "image" || q.mediaType === "gif") && (
                  <img src={q.mediaUrl} alt="" className="w-full object-cover" style={{ maxHeight: 220 }} />
                )}
                {q.mediaType === "video" && (
                  <video controls src={q.mediaUrl} className="w-full" style={{ maxHeight: 220 }} />
                )}
              </div>
            )}

            {/* Question */}
            <div
              className="rounded-2xl p-4 mb-5"
              style={{ background: "#F7F8FC", border: "1.5px solid #E9EEF5", fontSize: 17, fontWeight: 700, color: "#1F2937", lineHeight: 1.7 }}
            >
              {q.question}
            </div>

            {/* Options */}
            <div className="flex flex-col gap-2.5 mb-5">
              {q.options.map((opt, i) => {
                const isCorrect = i === q.correctAnswer;
                return (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3 rounded-2xl p-4"
                    style={{
                      background: isCorrect ? "#ECFDF3" : "white",
                      border: `1.5px solid ${isCorrect ? "#16A34A" : "#E9EEF5"}`,
                      fontSize: 15, fontWeight: isCorrect ? 700 : 500,
                      color: isCorrect ? "#15803D" : "#1F2937",
                    }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div
                      className="flex items-center justify-center flex-shrink-0 rounded-full font-black"
                      style={{
                        width: 30, height: 30, fontSize: 12,
                        background: isCorrect ? "#16A34A" : "#F3F4F6",
                        color: isCorrect ? "white" : "#9CA3AF",
                      }}
                    >
                      {isCorrect ? <i className="ph ph-check" style={{ fontSize: 14 }} /> : String.fromCharCode(0x0041 + i)}
                    </div>
                    {opt}
                  </motion.div>
                );
              })}
            </div>

            {/* Explanation */}
            {q.explanation && (
              <motion.div
                className="rounded-2xl p-4 mb-5 flex gap-3"
                style={{ background: "#FEF3C7", border: "1.5px solid #FDE68A" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <i className="ph ph-lightbulb flex-shrink-0" style={{ fontSize: 20, color: "#D97706", marginTop: 2 }} />
                <div style={{ fontSize: 14, color: "#92400E", lineHeight: 1.7 }}>{q.explanation}</div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-auto pt-4">
          <motion.button
            onClick={goPrev}
            disabled={index === 0}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl font-bold"
            style={{
              height: 52, background: index === 0 ? "#F7F8FC" : "white",
              border: `1.5px solid ${index === 0 ? "#E9EEF5" : "#246BFD"}`,
              color: index === 0 ? "#D1D5DB" : "#246BFD",
              cursor: index === 0 ? "not-allowed" : "pointer",
              fontFamily: "inherit", fontSize: 15,
            }}
            whileTap={index === 0 ? {} : { scale: 0.97 }}
          >
            <i className="ph ph-arrow-right" style={{ fontSize: 18 }} />
            السابق
          </motion.button>

          {index < total - 1 ? (
            <motion.button
              onClick={goNext}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl font-bold text-white"
              style={{
                height: 52, background: "linear-gradient(135deg, #246BFD, #1F5CE0)",
                border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 15,
                boxShadow: "0 8px 20px rgba(36,107,253,0.22)",
              }}
              whileTap={{ scale: 0.97 }}
            >
              التالي
              <i className="ph ph-arrow-left" style={{ fontSize: 18 }} />
            </motion.button>
          ) : (
            <motion.button
              onClick={onBack}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl font-bold text-white"
              style={{
                height: 52, background: "linear-gradient(135deg, #16A34A, #15803D)",
                border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 15,
              }}
              whileTap={{ scale: 0.97 }}
            >
              <i className="ph ph-check-circle" style={{ fontSize: 18 }} />
              إنهاء المراجعة
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
