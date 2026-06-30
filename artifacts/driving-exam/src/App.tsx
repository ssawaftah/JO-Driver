import { useState, useEffect } from "react";
import { db } from "./lib/firebase";
import { initTelegram, getTelegramUser } from "./lib/telegram";
import type { Screen, Question, Governorate, Area, Center } from "./types";

import LandingScreen from "./screens/Landing";
import RegisterScreen from "./screens/Register";
import HomeScreen from "./screens/Home";
import CentersScreen from "./screens/Centers";
import CategoriesScreen from "./screens/Categories";
import StudyScreen from "./screens/Study";
import TestScreen from "./screens/Test";
import ResultScreen from "./screens/Result";
import Loading from "./components/Loading";

const CATS = [
  "قواعد السير والمرور",
  "الميكانيك",
  "السلامة على الطريق",
  "الإسعافات الأولية",
  "الشواخص والخطوط والعلامات",
  "المخالفات واحتساب النقاط",
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
  const [screen, setScreen] = useState<Screen>("landing");
  const [loading, setLoading] = useState(true);
  const [loadMsg, setLoadMsg] = useState("جارٍ التحميل...");

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

  // ── On mount: restore session ─────────────────────────────
  useEffect(() => {
    initTelegram();

    const saved = loadSession();
    if (saved) {
      setUserName(saved);
      setScreen("home");
      setLoading(false);
      return;
    }

    // Check Telegram user in Firebase
    const tgUser = getTelegramUser();
    if (tgUser?.id) {
      db.ref("users/" + tgUser.id).once("value")
        .then(snap => {
          if (snap.exists()) {
            const name = snap.val().name || tgUser.first_name || "";
            setUserName(name);
            saveSession(name);
            setScreen("home");
          } else {
            setScreen("landing");
          }
        })
        .catch(() => setScreen("landing"))
        .finally(() => setLoading(false));
    } else {
      setScreen("landing");
      setLoading(false);
    }
  }, []);

  function load(msg: string) { setLoadMsg(msg); setLoading(true); }
  function unload() { setLoading(false); }
  function go(s: Screen) { setScreen(s); }

  function handleStart() { go("register"); }

  function handleRegistered(name: string) {
    setUserName(name);
    saveSession(name);
    go("home");
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

  const qCounts: Record<string, number> = {};
  for (const q of Object.values(questions)) {
    if (q.category) {
      const display = matchCat(q.category);
      qCounts[display] = (qCounts[display] || 0) + 1;
    }
  }

  return (
    <div className="shell">
      {screen === "landing"    && <LandingScreen onStart={handleStart} />}
      {screen === "register"   && (
        <RegisterScreen onSuccess={handleRegistered} onLoad={load} onUnload={unload} />
      )}
      {screen === "home"       && (
        <HomeScreen
          name={userName}
          onExam={() => alert("سيتم تفعيل الامتحان التجريبي قريباً")}
          onStudy={openCategories}
          onCenters={openCenters}
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
      {loading && <Loading msg={loadMsg} />}
    </div>
  );
}
