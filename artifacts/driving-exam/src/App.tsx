import { useState, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import { db, auth } from "./lib/firebase";
import type { Question, Governorate, Area, Center, FooterData, GuideSection } from "./types";

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

function matchCat(fbCat: string): string {
  const norm = normAr(fbCat);
  return CATS.find(c => normAr(c) === norm) ?? fbCat;
}

function saveSession(name: string) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify({ name })); } catch {}
}
function loadSession(): string | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "")?.name || null; } catch { return null; }
}

/* =================================================================
   Shared data provider — keeps everything in App, passed to routes
   ================================================================= */

function AppRoutes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadMsg, setLoadMsg] = useState("جارٍ التحميل...");
  const [showReg, setShowReg] = useState(false);
  const [userName, setUserName] = useState("");

  const [govs, setGovs] = useState<Record<string, Governorate>>({});
  const [areas, setAreas] = useState<Record<string, Area>>({});
  const [centers, setCenters] = useState<Record<string, Center>>({});
  const [questions, setQuestions] = useState<Record<string, Question>>({});

  const [studyQs, setStudyQs] = useState<Question[]>([]);
  const [testQs, setTestQs] = useState<Question[]>([]);
  const [resultOk, setResultOk] = useState(0);
  const [resultTotal, setResultTotal] = useState(0);

  const [examQs, setExamQs] = useState<Question[]>([]);
  const [examOk, setExamOk] = useState(0);
  const [examWrong, setExamWrong] = useState(0);
  const [examTotal, setExamTotal] = useState(0);
  const [examSkipped, setExamSkipped] = useState(0);

  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

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
    setFooterData({ sponsors, social: soSnap.val() || {}, defaultSponsorLink: dlSnap.val() || "" });
    const gsVal = gSnap.val() || {};
    if (Object.keys(gsVal).length > 0) {
      setGuideSections(Object.entries(gsVal).map(([id, s]: [string, any]) => ({ id, ...s })).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
    }
  }

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    if (window.location.hash === "#admin") {
      const unsub = auth.onAuthStateChanged(user => {
        if (user) { setAdminLoggedIn(true); navigate("/admin"); }
        else { navigate("/admin-login"); }
        setLoading(false);
      });
      cleanup = () => unsub();
    } else if (window.location.hash === "#guide") {
      navigate("/guide");
      setLoading(false);
    } else {
      const saved = loadSession();
      if (saved) setUserName(saved);
      setLoading(false);
      preloadSharedData();
    }
    return cleanup;
  }, []);

  function load(msg: string) { setLoadMsg(msg); setLoading(true); }
  function unload() { setLoading(false); }

  function handleRegistered(name: string) {
    setUserName(name);
    saveSession(name);
    setShowReg(false);
  }

  // ── centers ──
  async function openCenters() {
    if (Object.keys(govs).length === 0) {
      load("جارٍ تحميل المراكز...");
      const [g, a, c] = await Promise.all([db.ref("governorates").once("value"), db.ref("areas").once("value"), db.ref("centers").once("value")]);
      setGovs(g.val() || {}); setAreas(a.val() || {}); setCenters(c.val() || {});
      unload();
    }
    navigate("/centers");
  }

  // ── questions ──
  async function openCategories() {
    if (Object.keys(questions).length === 0) {
      load("جارٍ تحميل الأسئلة...");
      const snap = await db.ref("questions").once("value");
      setQuestions(snap.val() || {});
      unload();
    }
    navigate("/categories");
  }

  function getCatQs(cat: string) {
    return Object.values(questions).filter(q => matchCat(q.category) === cat);
  }

  function startStudy(cat: string) {
    const qs = getCatQs(cat);
    if (!qs.length) { alert("لا توجد أسئلة في هذا القسم بعد."); return; }
    setStudyQs(qs);
    navigate(`/study/${encodeURIComponent(cat)}`);
  }

  function startTest(cat: string) {
    const qs = getCatQs(cat).sort(() => Math.random() - 0.5);
    if (!qs.length) { alert("لا توجد أسئلة في هذا القسم بعد."); return; }
    setTestQs(qs);
    navigate(`/test/${encodeURIComponent(cat)}`);
  }

  function handleResult(ok: number, total: number) {
    setResultOk(ok); setResultTotal(total);
    navigate("/result");
  }

  // ── exam ──
  async function openExam() {
    let allQs: Question[] = Object.values(questions);
    if (allQs.length === 0) {
      load("جارٍ تحميل أسئلة الامتحان...");
      const snap = await db.ref("questions").once("value");
      const data = snap.val() || {};
      setQuestions(data); allQs = Object.values(data) as Question[];
      unload();
    }
    setExamQs(allQs);
    navigate("/exam-rules");
  }

  function startExam() {
    if (!loadSession()) { setShowReg(true); return; }
    navigate("/exam");
  }

  const handleExamFinish = useCallback((ok: number, wrong: number, total: number, skipped: number) => {
    setExamOk(ok); setExamWrong(wrong); setExamTotal(total); setExamSkipped(skipped);
    navigate("/exam-result");
  }, [navigate]);

  // ── question counts ──
  const qCounts: Record<string, number> = {};
  for (const q of Object.values(questions)) {
    if (q.category) { const d = matchCat(q.category); qCounts[d] = (qCounts[d] || 0) + 1; }
  }

  // ── admin ──
  function handleAdminLogin() { setAdminLoggedIn(true); navigate("/admin"); }
  function handleAdminLogout() { auth.signOut(); setAdminLoggedIn(false); navigate("/"); }

  return (
    <div className="shell">
      <Routes>
        <Route path="/" element={
          <HomeScreen
            name={userName}
            onExam={openExam}
            onStudy={openCategories}
            onCenters={openCenters}
            onGuide={() => navigate("/guide")}
            footerData={footerData}
          />
        } />
        <Route path="/centers" element={
          <CentersScreen govs={govs} areas={areas} centers={centers} onBack={() => navigate("/")} />
        } />
        <Route path="/categories" element={
          <CategoriesScreen cats={CATS} qCounts={qCounts} onBack={() => navigate("/")} onStudy={startStudy} onTest={startTest} />
        } />
        <Route path="/study/:cat" element={
          <StudyScreenWrapper qs={studyQs} onBack={() => navigate("/categories")} />
        } />
        <Route path="/test/:cat" element={
          <TestScreenWrapper qs={testQs} onBack={() => navigate("/categories")} onFinish={handleResult} />
        } />
        <Route path="/result" element={
          <ResultScreen ok={resultOk} total={resultTotal} onBack={() => navigate("/categories")} onRetry={() => startTest(studyQs[0]?.category || "")} />
        } />
        <Route path="/exam-rules" element={
          <ExamRulesScreen onStart={startExam} onBack={() => navigate("/")} />
        } />
        <Route path="/exam" element={
          examQs.length > 0 ? <ExamScreen allQuestions={examQs} onFinish={handleExamFinish} onBack={() => navigate("/exam-rules")} />
            : <ExamRulesScreen onStart={startExam} onBack={() => navigate("/")} />
        } />
        <Route path="/exam-result" element={
          <ExamResultScreen ok={examOk} wrong={examWrong} total={examTotal} skipped={examSkipped} onRetry={() => navigate("/exam-rules")} onHome={() => navigate("/")} />
        } />
        <Route path="/guide" element={
          <GuideScreen onBack={() => navigate("/")} initialSections={guideSections} />
        } />
        <Route path="/admin-login" element={
          <AdminLoginScreen onLogin={handleAdminLogin} />
        } />
        <Route path="/admin" element={
          adminLoggedIn
            ? <AdminScreen onBack={handleAdminLogout} />
            : <AdminLoginScreen onLogin={handleAdminLogin} />
        } />
      </Routes>
      {loading && <Loading msg={loadMsg} />}
      <RegisterModal open={showReg} onClose={() => setShowReg(false)} onSuccess={handleRegistered} />
    </div>
  );
}

/* ── Wrappers that read :cat param and pass it to inner screens ── */

function StudyScreenWrapper({ qs, onBack }: { qs: Question[]; onBack: () => void }) {
  const { cat } = useParams<{ cat: string }>();
  const catName = decodeURIComponent(cat || "");
  return <StudyScreen qs={qs} cat={catName} onBack={onBack} />;
}

function TestScreenWrapper({ qs, onBack, onFinish }: { qs: Question[]; onBack: () => void; onFinish: (ok: number, total: number) => void }) {
  const { cat } = useParams<{ cat: string }>();
  const catName = decodeURIComponent(cat || "");
  return <TestScreen qs={qs} cat={catName} onBack={onBack} onFinish={onFinish} />;
}

export default function App() { return <AppRoutes />; }
