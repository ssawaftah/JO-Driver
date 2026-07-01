import { useState, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import { db, auth } from "./lib/firebase";
import type { Question, Governorate, Area, Center, GuideSection } from "./types";

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
import ReviewsScreen from "./screens/Reviews";
import AdminLoginScreen from "./screens/AdminLogin";
import AdminScreen from "./screens/Admin";
import CentersJoinScreen from "./screens/CentersJoin";

const CATS = [
  "قواعد السير والمرور",
  "الميكانيك",
  "السلامة على الطريق",
  "أسعافات أولية",
  "الشواخص والخطوط والعلامات",
  "المخالفات واحتساب النقاط",
  "الصور المتحركة",
];

function catId(cat: string): string {
  const idx = CATS.indexOf(cat);
  return idx >= 0 ? String(idx) : "0";
}
function catFromId(id: string): string {
  const n = parseInt(id, 10);
  return CATS[n] || CATS[0];
}

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

function saveSession(name: string, key: string) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify({ name, key })); } catch {}
}
function loadSession(): { name: string; key: string } | null {
  try { const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "{}"); return s?.key ? s : null; } catch { return null; }
}
function getUserKey(): string | null {
  return loadSession()?.key || null;
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

  const [guideSections, setGuideSections] = useState<GuideSection[] | null>(null);

  async function preloadSharedData() {
    const gSnap = await db.ref("guide/sections").once("value");
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
      if (saved) setUserName(saved.name);
      setLoading(false);
      preloadSharedData();
    }
    return cleanup;
  }, []);

  function load(msg: string) { setLoadMsg(msg); setLoading(true); }
  function unload() { setLoading(false); }

  function handleRegistered(name: string, key: string) {
    setUserName(name);
    saveSession(name, key);
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
    navigate(`/study/${catId(cat)}`);
  }

  function startTest(cat: string) {
    const qs = getCatQs(cat).sort(() => Math.random() - 0.5);
    if (!qs.length) { alert("لا توجد أسئلة في هذا القسم بعد."); return; }
    setTestQs(qs);
    navigate(`/test/${catId(cat)}`);
  }

  function handleResult(ok: number, total: number) {
    setResultOk(ok); setResultTotal(total);
    saveResult("test", ok, total);
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
    saveResult("exam", ok, total);
    navigate("/exam-result");
  }, [navigate]);

  async function saveResult(type: "test" | "exam", ok: number, total: number) {
    const key = getUserKey();
    if (!key) return;
    const pct = total > 0 ? Math.round((ok / total) * 100) : 0;
    const snap = await db.ref("users/" + key).once("value");
    const u = snap.val() || {};
    const prevTests = u.testsTaken || 0;
    const prevBest = u.bestScore || 0;
    const prevAvg = u.averageScore || 0;
    const newTests = prevTests + 1;
    const newBest = Math.max(prevBest, pct);
    const newAvg = Math.round(((prevAvg * prevTests) + pct) / newTests);
    await db.ref("users/" + key).update({
      testsTaken: newTests,
      bestScore: newBest,
      averageScore: newAvg,
      lastActiveAt: new Date().toISOString(),
    });
    await db.ref("users/" + key + "/results").push({
      type, ok, total, pct, at: new Date().toISOString(),
    });
  }

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
            onReviews={() => navigate("/reviews")}
          />
        } />
        <Route path="/centers" element={
          <CentersScreen govs={govs} areas={areas} centers={centers} />
        } />
        <Route path="/centers/join" element={
          <CentersJoinScreen govs={govs} areas={areas} />
        } />
        <Route path="/categories" element={
          <CategoriesScreen cats={CATS} qCounts={qCounts} onStudy={startStudy} onTest={startTest} />
        } />
        <Route path="/study/:id" element={
          <StudyScreenWrapper qs={studyQs} onBack={() => navigate("/categories")} />
        } />
        <Route path="/test/:id" element={
          <TestScreenWrapper qs={testQs} onBack={() => navigate("/categories")} onFinish={handleResult} />
        } />
        <Route path="/result" element={
          <ResultScreen ok={resultOk} total={resultTotal} onBack={() => navigate("/categories")} onRetry={() => startTest(studyQs[0]?.category || "")} />
        } />
        <Route path="/exam-rules" element={
          <ExamRulesScreen onStart={startExam} />
        } />
        <Route path="/exam" element={
          examQs.length > 0 ? <ExamScreen allQuestions={examQs} onFinish={handleExamFinish} onBack={() => navigate("/exam-rules")} />
            : <ExamRulesScreen onStart={startExam} />
        } />
        <Route path="/exam-result" element={
          <ExamResultScreen ok={examOk} wrong={examWrong} total={examTotal} skipped={examSkipped} onRetry={() => navigate("/exam-rules")} onHome={() => navigate("/")} />
        } />
        <Route path="/guide" element={
          <GuideScreen initialSections={guideSections} />
        } />
        <Route path="/reviews" element={
          <ReviewsScreen onBack={() => navigate("/")} />
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
  const { id } = useParams<{ id: string }>();
  return <StudyScreen qs={qs} cat={catFromId(id || "0")} onBack={onBack} />;
}

function TestScreenWrapper({ qs, onBack, onFinish }: { qs: Question[]; onBack: () => void; onFinish: (ok: number, total: number) => void }) {
  const { id } = useParams<{ id: string }>();
  return <TestScreen qs={qs} cat={catFromId(id || "0")} onBack={onBack} onFinish={onFinish} />;
}

export default function App() { return <AppRoutes />; }
