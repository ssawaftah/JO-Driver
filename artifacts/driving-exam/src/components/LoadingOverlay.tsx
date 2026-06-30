import { motion, AnimatePresence } from "framer-motion";

interface LoadingOverlayProps {
  visible: boolean;
  text?: string;
}

export default function LoadingOverlay({ visible, text = "جارٍ التحميل..." }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)" }}
        >
          <div className="relative mb-6">
            <div
              className="w-16 h-16 rounded-full"
              style={{
                border: "3px solid #E9EEF5",
                borderTopColor: "#246BFD",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
          <p className="text-base font-bold" style={{ color: "#1F2937" }}>{text}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
