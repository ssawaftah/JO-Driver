import { useState, useEffect } from "react";
import { db, auth } from "./lib/firebase";
import type { Screen, Question, Governorate, Area, Center, FooterData, GuideSection } from "./types";

import RegisterModal from "./components/RegisterModal";
import HomeScreen from "./screens/Home";
import CentersScreen from "./screens/Centers";
import CategoriesScreen from "./screens/Categories";
import StudyScreen from "./screens/Study";
import TestScreen from "./screens/Test";
import ResultScreen from "./screens/Result";
import Loading from "./components/Loading";
import ExamRulesScreen from "./screens/ExamRules";
import ExamScreen from "./screens/Exam";
import ExamResultScreen from "./screens/ExamResult";
import GuideScreen from "./screens/Faq";
import AdminLoginScreen from "./screens/AdminLogin";
import AdminScreen from "./screens/Admin";

const CATS = [
  "قواعد السير والمرور",
  "الميكانيك",
  "السلامة على الطريق",
  "أسعافات أولية",
  "الشواخص والخطوط والعلامات",
  "المخالفات واحتساب النقاط",
  "الصور المتحركة",
];

const SESSION_KEY = "dex_user";

/** Normalize Arabic text: unify alef variants, strip tashkeel */
function normAr(s: string): string {
  return s
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .trim();
}

/** Find the display category that best matches a Firebase category string */
function matchCat(fbCat: string): string {
  const norm = normAr(fbCat);
  return CATS.find(c => normAr(c) === norm) ?? fbCat;
}

function saveSession(name: string) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify({ name })); } catch {}
}
function loadSession(): string | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw)?.name || null;
  } catch { return null; }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [loading, setLoading] = useState(true);
  const [loadMsg, setLoadMsg] = useState("جارٍ التحميل...");
  const [showReg, setShowReg] = useState(false);
  const [userName, setUserName] = useState("");
  const [govs, setGovs] = useState<Record<string, Governorate>>({});
  const [areas, setAreas] = useState<Record<string, Area>>({});
  const [centers, setCenters] = useState<Record<string, Center>>({});
  const [questions, setQuestions] = useState<Record<string, Question>>({});

  const [studyCat, setStudyCat] = useState("");
  const [studyQs, setStudyQs] = useState<Question[]>([]);
  const [testQs, setTestQs] = useState<Question[]>([]);
  const [resultOk, setResultOk] = useState(0);
  const [resultTotal, setResultTotal] = useState(0);

  // Exam state
  const [examQs, setExamQs] = useState<Question[]>([]);
  const [examOk, setExamOk] = useState(0);
  const [examWrong, setExamWrong] = useState(0);
  const [examTotal, setExamTotal] = useState(0);
  const [examSkipped, setExamSkipped] = useState(0);

  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  // ── Shared preloaded data ──────────────────────────────────
  const [footerData, setFooterData] = useState<FooterData | null>(null);
  const [guideSections, setGuideSections] = useState<GuideSection[] | null>(null);

  async function preloadSharedData() {
    const [spSnap, soSnap, dlSnap, gSnap] = await Promise.all([
      db.ref("footer/sponsors").once("value"),
      db.ref("footer/social").once("value"),
      db.ref("footer/defaultSponsorLink").once("value"),
      db.ref("guide/sections").once("value"),
    ]);
    const spVal = spSnap.val() || {};
    const sponsors = Object.entries(spVal).map(([id, v]: [string, any]) => ({ id, ...v }));
    setFooterData({
      sponsors,
      social: soSnap.val() || {},
      defaultSponsorLink: dlSnap.val() || "",
    });
    const gsVal = gSnap.val() || {};
    if (Object.keys(gsVal).length > 0) {
      const arr = Object.entries(gsVal)
        .map(([id, s]: [string, any]) => ({ id, ...s }))
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      setGuideSections(arr as GuideSection[]);
    }
  }

  // ── On mount: restore session + check #admin hash + Firebase auth state ──
  useEffect(() => {
    if (window.location.hash === "#admin") {
      const unsub = auth.onAuthStateChanged(user => {
        if (user) {
          setAdminLoggedIn(true);
          setScreen("admin");
        } else {
          setScreen("admin-login");
        }
        setLoading(false);
      });
      return () => unsub();
    }
    if (window.location.hash === "#guide") {
      setScreen("guide");
      setLoading(false);
      return;
    }

    const saved = loadSession();
    if (saved) setUserName(saved);
    setScreen("home");
    setLoading(false);
    preloadSharedData();
    return;
  }, []);

  function load(msg: string) { setLoadMsg(msg); setLoading(true); }
  function unload() { setLoading(false); }
  function go(s: Screen) { setScreen(s); }

  function handleRegistered(name: string) {
    setUserName(name);
    saveSession(name);
    setShowReg(false);
  }

  async function openCenters() {
    if (Object.keys(govs).length === 0) {
      load("جارٍ تحميل المراكز...");
      const [g, a, c] = await Promise.all([
        db.ref("governorates").once("value"),
        db.ref("areas").once("value"),
        db.ref("centers").once("value"),
      ]);
      setGovs(g.val() || {});
      setAreas(a.val() || {});
      setCenters(c.val() || {});
      unload();
    }
    go("centers");
  }

  async function openCategories() {
    if (Object.keys(questions).length === 0) {
      load("جارٍ تحميل الأسئلة...");
      const snap = await db.ref("questions").once("value");
      setQuestions(snap.val() || {});
      unload();
    }
    go("categories");
  }

  function startStudy(cat: string) {
    const qs = Object.values(questions).filter(q => matchCat(q.category) === cat);
    if (!qs.length) { alert("لا توجد أسئلة في هذا القسم بعد."); return; }
    setStudyCat(cat);
    setStudyQs(qs);
    go("study");
  }

  function startTest(cat: string) {
    const qs = Object.values(questions)
      .filter(q => matchCat(q.category) === cat)
      .sort(() => Math.random() - 0.5);
    if (!qs.length) { alert("لا توجد أسئلة في هذا القسم بعد."); return; }
    setStudyCat(cat);
    setTestQs(qs);
    go("test");
  }

  function handleResult(ok: number, total: number) {
    setResultOk(ok);
    setResultTotal(total);
    go("result");
  }

  async function openExam() {
    let allQs: Question[] = Object.values(questions);
    if (allQs.length === 0) {
      load("جارٍ تحميل أسئلة الامتحان...");
      const snap = await db.ref("questions").once("value");
      const data = snap.val() || {};
      setQuestions(data);
      allQs = Object.values(data) as Question[];
      unload();
    }
    setExamQs(allQs);
    go("exam-rules");
  }

  function startExam() {
    if (!loadSession()) { setShowReg(true); return; }
    go("exam");
  }

  function handleExamFinish(ok: number, wrong: number, total: number, skipped: number) {
    setExamOk(ok);
    setExamWrong(wrong);
    setExamTotal(total);
    setExamSkipped(skipped);
    go("exam-result");
  }

  function retryExam() {
    go("exam-rules");
  }

  const qCounts: Record<string, number> = {};
  for (const q of Object.values(questions)) {
    if (q.category) {
      const display = matchCat(q.category);
      qCounts[display] = (qCounts[display] || 0) + 1;
    }
  }

  return (
    <div className="shell">
      {screen === "home"       && (
        <HomeScreen
          name={userName}
          onExam={openExam}
          onStudy={openCategories}
          onCenters={openCenters}
          onGuide={() => go("guide")}
          footerData={footerData}
        />
      )}
      {screen === "centers"    && (
        <CentersScreen govs={govs} areas={areas} centers={centers} onBack={() => go("home")} />
      )}
      {screen === "categories" && (
        <CategoriesScreen
          cats={CATS} qCounts={qCounts}
          onBack={() => go("home")}
          onStudy={startStudy}
          onTest={startTest}
        />
      )}
      {screen === "study"      && (
        <StudyScreen qs={studyQs} cat={studyCat} onBack={() => go("categories")} />
      )}
      {screen === "test"       && (
        <TestScreen qs={testQs} cat={studyCat} onBack={() => go("categories")} onFinish={handleResult} />
      )}
      {screen === "result"     && (
        <ResultScreen
          ok={resultOk} total={resultTotal}
          onBack={() => go("categories")}
          onRetry={() => startTest(studyCat)}
        />
      )}
      {screen === "exam-rules" && (
        <ExamRulesScreen onStart={startExam} onBack={() => go("home")} />
      )}
      {screen === "exam" && examQs.length > 0 && (
        <ExamScreen allQuestions={examQs} onFinish={handleExamFinish} onBack={() => go("exam-rules")} />
      )}
      {screen === "exam-result" && (
        <ExamResultScreen
          ok={examOk} wrong={examWrong} total={examTotal} skipped={examSkipped}
          onRetry={retryExam} onHome={() => go("home")}
        />
      )}
      {screen === "guide" && <GuideScreen onBack={() => go("home")} initialSections={guideSections} />}
      {screen === "admin-login" && (
        <AdminLoginScreen onLogin={() => { setAdminLoggedIn(true); setScreen("admin"); }} />
      )}
      {screen === "admin" && (
        adminLoggedIn
          ? <AdminScreen onBack={() => { auth.signOut(); setAdminLoggedIn(false); go("home"); }} />
          : <AdminLoginScreen onLogin={() => { setAdminLoggedIn(true); setScreen("admin"); }} />
      )}
      {loading && <Loading msg={loadMsg} />}
      <RegisterModal
        open={showReg}
        onClose={() => setShowReg(false)}
        onSuccess={handleRegistered}
      />
    </div>
  );
}
