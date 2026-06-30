import { useState } from "react";
import { motion } from "framer-motion";
import { db } from "../lib/firebase";
import { showAlert, getTelegramUser } from "../lib/telegram";

interface RegisterProps {
  defaultName?: string;
  onSuccess: (name: string) => void;
  onShowLoading: (text: string) => void;
  onHideLoading: () => void;
}

export default function Register({ defaultName = "", onSuccess, onShowLoading, onHideLoading }: RegisterProps) {
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimName = name.trim();
    const trimPhone = phone.trim();
    if (!trimName) { await showAlert("الرجاء إدخال اسمك الكامل"); return; }
    if (!trimPhone || trimPhone.length < 10) { await showAlert("الرجاء إدخال رقم هاتف صحيح"); return; }

    const user = getTelegramUser();
    if (!user?.id) { await showAlert("تعذر التحقق من حسابك"); return; }

    setSubmitting(true);
    onShowLoading("جارٍ التسجيل...");
    try {
      await db.ref("users/" + user.id).set({
        name: trimName,
        phone: trimPhone,
        username: user.username || "",
        userId: user.id,
        registeredAt: new Date().toISOString(),
      });
      await new Promise((r) => setTimeout(r, 800));
      onHideLoading();
      onSuccess(trimName);
    } catch {
      onHideLoading();
      setSubmitting(false);
      await showAlert("حدث خطأ في التسجيل. حاول مرة أخرى.");
    }
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "white" }}>
      <div
        className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
        style={{ background: "linear-gradient(160deg, #EEF4FF 0%, #F0F7FF 40%, white 100%)" }}
      />
      <div className="relative z-10 flex flex-col flex-1 px-5 pt-10 pb-10">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="mx-auto mb-5 flex items-center justify-center"
            style={{
              width: 80, height: 80, borderRadius: 28,
              background: "linear-gradient(135deg, #246BFD, #5B8FFF)",
              boxShadow: "0 16px 40px rgba(36,107,253,0.22)",
            }}
            initial={{ scale: 0.7 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 220 }}
          >
            <i className="ph ph-user-circle" style={{ fontSize: 40, color: "white" }} />
          </motion.div>
          <h1 className="font-black mb-2" style={{ fontSize: 26, color: "#1F2937" }}>أهلاً بك!</h1>
          <p style={{ color: "#6B7280", fontSize: 14 }}>أدخل بياناتك للمتابعة</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div>
            <label className="block mb-2 font-bold" style={{ fontSize: 13, color: "#1F2937" }}>الاسم الكامل</label>
            <div className="relative">
              <i className="ph ph-user absolute" style={{ right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 20, color: "#6B7280" }} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسمك الكامل"
                disabled={submitting}
                style={{
                  width: "100%", height: 56, paddingRight: 46, paddingLeft: 16,
                  borderRadius: 16, border: "1.5px solid #E9EEF5",
                  background: "white", fontFamily: "inherit", fontSize: 15,
                  color: "#1F2937", outline: "none", transition: "border-color 0.2s",
                  direction: "rtl",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#246BFD")}
                onBlur={(e) => (e.target.style.borderColor = "#E9EEF5")}
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-bold" style={{ fontSize: 13, color: "#1F2937" }}>رقم الهاتف</label>
            <div className="relative">
              <i className="ph ph-phone absolute" style={{ right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 20, color: "#6B7280" }} />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0791234567"
                disabled={submitting}
                style={{
                  width: "100%", height: 56, paddingRight: 46, paddingLeft: 16,
                  borderRadius: 16, border: "1.5px solid #E9EEF5",
                  background: "white", fontFamily: "inherit", fontSize: 15,
                  color: "#1F2937", outline: "none", transition: "border-color 0.2s",
                  direction: "ltr", textAlign: "right",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#246BFD")}
                onBlur={(e) => (e.target.style.borderColor = "#E9EEF5")}
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 font-bold text-white rounded-2xl mt-2"
            style={{
              height: 56, background: submitting ? "#93AAFF" : "linear-gradient(135deg, #246BFD, #1F5CE0)",
              boxShadow: submitting ? "none" : "0 10px 24px rgba(36,107,253,0.28)",
              fontSize: 16, border: "none", cursor: submitting ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
            whileTap={submitting ? {} : { scale: 0.98 }}
          >
            {submitting ? (
              <span>جارٍ التسجيل...</span>
            ) : (
              <>
                <i className="ph ph-check-circle" style={{ fontSize: 20 }} />
                موافق
              </>
            )}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}
