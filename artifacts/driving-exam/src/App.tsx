import { useState, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { db } from "./lib/firebase";
import { initTelegram, getTelegramUser, showAlert } from "./lib/telegram";
import { Screen, Question, Governorate, Area, Center } from "./types";
import LoadingOverlay from "./components/LoadingOverlay";
import Landing from "./screens/Landing";
import Register from "./screens/Register";
import Home from "./screens/Home";
import TrainingCenters from "./screens/TrainingCenters";
import StudyCategories from "./screens/StudyCategories";
import StudySession from "./screens/StudySession";
import TestSession from "./screens/TestSession";
import Result from "./screens/Result";

const STUDY_CATEGORIES = [
  "قواعد السير والمرور",
  "الميكانيك",
  "السلامة على الطريق",
  "أسعافات أولية",
  "الشواخص والخطوط والعلامات",
  "المخالفات واحتساب النقاط",
];

const pageVariants = {
  initial: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  animate: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [navDir, setNavDir] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("جارٍ التحميل...");

  // User
  const [userName, setUserName] = useState("");

  // Data
  const [govs, setGovs] = useState<Record<string, Governorate>>({});
  const [areas, setAreas] = useState<Record<string, Area>>({});
  const [centers, setCenters] = useState<Record<string, Center>>({});
  const [allQuestions, setAllQuestions] = useState<Record<string, Question>>({});

  // Study / test state
  const [activeCategory, setActiveCategory] = useState("");
  const [studyQuestions, setStudyQuestions] = useState<Question[]>([]);
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [resultCorrect, setResultCorrect] = useState(0);
  const [resultTotal, setResultTotal] = useState(0);

  useEffect(() => {
    initTelegram();
    // Auto-fill name from Telegram
    const tgUser = getTelegramUser();
    if (tgUser?.first_name) setUserName(tgUser.first_name);
  }, []);

  function navigate(to: Screen, dir = 1) {
    setNavDir(dir);
    setScreen(to);
  }

  const showLoading = useCallback((text: string) => { setLoadingText(text); setLoading(true); }, []);
  const hideLoading = useCallback(() => setLoading(false), []);

  async function loadCenterData() {
    if (Object.keys(govs).length > 0) return; // already loaded
    const [govsSnap, areasSnap, centersSnap] = await Promise.all([
      db.ref("governorates").once("value"),
      db.ref("areas").once("value"),
      db.ref("centers").once("value"),
    ]);
    setGovs(govsSnap.val() || {});
    setAreas(areasSnap.val() || {});
    setCenters(centersSnap.val() || {});
  }

  async function loadQuestions() {
    if (Object.keys(allQuestions).length > 0) return;
    const snap = await db.ref("questions").once("value");
    setAllQuestions(snap.val() || {});
  }

  // Computed question counts per category
  const questionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const q of Object.values(allQuestions)) {
      if (q.category) counts[q.category] = (counts[q.category] || 0) + 1;
    }
    return counts;
  }, [allQuestions]);

  // ---- Handlers ----

  async function handleStart() {
    const tgUser = getTelegramUser();
    if (!tgUser?.id) {
      // No Telegram context — go directly to home for web preview
      navigate("home");
      return;
    }
    showLoading("جارٍ التحميل...");
    try {
      const snap = await db.ref("users/" + tgUser.id).once("value");
      hideLoading();
      if (snap.exists()) {
        const data = snap.val();
        setUserName(data.name || tgUser.first_name || "");
        navigate("home");
      } else {
        navigate("register");
      }
    } catch {
      hideLoading();
      navigate("register");
    }
  }

  function handleRegistered(name: string) {
    setUserName(name);
    navigate("home");
  }

  async function handleOpenCenters() {
    showLoading("جاري تحميل البيانات...");
    try {
      await loadCenterData();
    } catch {
      await showAlert("حدث خطأ في تحميل البيانات");
    }
    hideLoading();
    navigate("trainingCenters");
  }

  async function handleOpenStudy() {
    showLoading("جاري تحميل الأسئلة...");
    try {
      await loadQuestions();
    } catch {
      await showAlert("حدث خطأ في تحميل الأسئلة");
    }
    hideLoading();
    navigate("studyCategories");
  }

  function handleStartStudy(category: string) {
    const qs = Object.values(allQuestions).filter((q) => q.category === category);
    if (qs.length === 0) { showAlert("لا توجد أسئلة في هذا القسم بعد."); return; }
    setActiveCategory(category);
    setStudyQuestions(qs);
    navigate("studySession");
  }

  function handleStartTest(category: string) {
    const qs = Object.values(allQuestions)
      .filter((q) => q.category === category)
      .sort(() => Math.random() - 0.5);
    if (qs.length === 0) { showAlert("لا توجد أسئلة للاختبار في هذا القسم."); return; }
    setActiveCategory(category);
    setTestQuestions(qs);
    navigate("testSession");
  }

  function handleTestFinish(correct: number, total: number) {
    setResultCorrect(correct);
    setResultTotal(total);
    navigate("result");
  }

  function handleRetry() {
    handleStartTest(activeCategory);
  }

  // ---- Render ----

  const screenContent = () => {
    switch (screen) {
      case "landing":
        return <Landing onStart={handleStart} />;
      case "register":
        return (
          <Register
            defaultName={getTelegramUser()?.first_name || ""}
            onSuccess={handleRegistered}
            onShowLoading={showLoading}
            onHideLoading={hideLoading}
          />
        );
      case "home":
        return (
          <Home
            userName={userName}
            onExam={() => showAlert("سيتم تفعيل الامتحان التجريبي قريباً")}
            onStudy={handleOpenStudy}
            onCenters={handleOpenCenters}
          />
        );
      case "trainingCenters":
        return (
          <TrainingCenters
            govs={govs}
            areas={areas}
            centers={centers}
            onBack={() => navigate("home", -1)}
          />
        );
      case "studyCategories":
        return (
          <StudyCategories
            categories={STUDY_CATEGORIES}
            questionCounts={questionCounts}
            onBack={() => navigate("home", -1)}
            onStudy={handleStartStudy}
            onTest={handleStartTest}
          />
        );
      case "studySession":
        return (
          <StudySession
            questions={studyQuestions}
            category={activeCategory}
            onBack={() => navigate("studyCategories", -1)}
          />
        );
      case "testSession":
        return (
          <TestSession
            questions={testQuestions}
            category={activeCategory}
            onBack={() => navigate("studyCategories", -1)}
            onFinish={handleTestFinish}
          />
        );
      case "result":
        return (
          <Result
            correct={resultCorrect}
            total={resultTotal}
            onBack={() => navigate("studyCategories", -1)}
            onRetry={handleRetry}
          />
        );
    }
  };

  return (
    <div className="app-shell">
      {/* Fixed top app header */}
      <div
        style={{
          position: "sticky", top: 0, zIndex: 30,
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #E9EEF5",
          padding: "12px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44, height: 44, borderRadius: 14,
              background: "linear-gradient(135deg, #246BFD, #5B8FFF)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(36,107,253,0.22)",
            }}
          >
            <i className="ph ph-car" style={{ fontSize: 22, color: "white" }} />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#1F2937" }}>اختبار الفحص النظري</div>
            <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 600 }}>منصة الاستعداد لاختبار القيادة</div>
          </div>
        </div>
      </div>

      {/* Screen content */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <AnimatePresence mode="wait" custom={navDir}>
          <motion.div
            key={screen}
            custom={navDir}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ position: "absolute", inset: 0, overflowY: "auto" }}
          >
            {screenContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      <LoadingOverlay visible={loading} text={loadingText} />
    </div>
  );
}
