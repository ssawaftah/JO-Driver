import { db, auth } from "./lib/firebase";
import {
  state,
  CATS,
  catId,
  matchCat,
  saveSession,
  loadSession,
  clearSession,
  getUserKey,
  CACHE_KEYS,
  loadCache,
  saveCache,
} from "./state";
import { showLoading, hideLoading, openRegModal, closeRegModal } from "./overlays";

let navigateFn = () => {};

export function setNavigate(fn) {
  navigateFn = fn;
}

function navigate(path) {
  navigateFn(path);
}

export async function preloadSharedData() {
  try {
    const gSnap = await db.ref("guide/sections").once("value");
    const gsVal = gSnap.val() || {};
    if (Object.keys(gsVal).length > 0) {
      const sections = Object.entries(gsVal)
        .map(([id, s]) => ({ id, ...s }))
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      state.guideSections = sections;
      saveCache(CACHE_KEYS.guide, gsVal);
    }
  } catch {}
}

export async function refreshDataInBackground() {
  try {
    const [g, a, c, q, gs] = await Promise.all([
      db.ref("governorates").once("value"),
      db.ref("areas").once("value"),
      db.ref("centers").once("value"),
      db.ref("questions").once("value"),
      db.ref("guide/sections").once("value"),
    ]);
    const govsVal = g.val() || {};
    const areasVal = a.val() || {};
    const centersVal = c.val() || {};
    const questionsVal = q.val() || {};
    const guideVal = gs.val() || {};
    state.govs = govsVal;
    saveCache(CACHE_KEYS.govs, govsVal);
    state.areas = areasVal;
    saveCache(CACHE_KEYS.areas, areasVal);
    state.centers = centersVal;
    saveCache(CACHE_KEYS.centers, centersVal);
    state.questions = questionsVal;
    saveCache(CACHE_KEYS.questions, questionsVal);
    if (Object.keys(guideVal).length > 0) {
      state.guideSections = Object.entries(guideVal)
        .map(([id, s]) => ({ id, ...s }))
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      saveCache(CACHE_KEYS.guide, guideVal);
    }
    document.dispatchEvent(new CustomEvent("app:data-refreshed"));
  } catch {
    /* silent fail — cached data is already showing */
  }
}

export async function initApp() {
  if (window.location.hash === "#admin") {
    auth.onAuthStateChanged((user) => {
      if (user) {
        state.adminLoggedIn = true;
        navigate("/admin");
      } else {
        navigate("/admin-login");
      }
      state.loading = false;
      hideLoading();
    });
    return;
  }

  if (window.location.hash === "#guide") {
    navigate("/guide");
    state.loading = false;
    hideLoading();
    return;
  }

  const saved = loadSession();
  if (saved) state.userName = saved.name;

  const cachedGovs = loadCache(CACHE_KEYS.govs);
  const cachedAreas = loadCache(CACHE_KEYS.areas);
  const cachedCenters = loadCache(CACHE_KEYS.centers);
  const cachedQuestions = loadCache(CACHE_KEYS.questions);
  const cachedGuide = loadCache(CACHE_KEYS.guide);
  if (cachedGovs) state.govs = cachedGovs;
  if (cachedAreas) state.areas = cachedAreas;
  if (cachedCenters) state.centers = cachedCenters;
  if (cachedQuestions) state.questions = cachedQuestions;
  if (cachedGuide) {
    state.guideSections = Object.entries(cachedGuide)
      .map(([id, s]) => ({ id, ...s }))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  state.loading = false;
  hideLoading();

  refreshDataInBackground();
}

export function handleRegistered(name, key) {
  state.userName = name;
  saveSession(name, key);
  closeRegModal();

  if (state.pendingAction === "test" && state.pendingCat) {
    const cat = state.pendingCat;
    state.pendingAction = null;
    state.pendingCat = null;
    const qs = getCatQs(cat).sort(() => Math.random() - 0.5);
    if (!qs.length) {
      alert("لا توجد أسئلة في هذا القسم بعد.");
      return;
    }
    state.testQs = qs;
    state.testCat = cat;
    navigate(`/test/${catId(cat)}`);
  } else if (state.pendingAction === "exam") {
    state.pendingAction = null;
    state.pendingCat = null;
    navigate("/exam");
  }
}

export async function openCenters() {
  if (Object.keys(state.govs).length === 0) {
    showLoading("جارٍ تحميل المراكز...");
    const [g, a, c] = await Promise.all([
      db.ref("governorates").once("value"),
      db.ref("areas").once("value"),
      db.ref("centers").once("value"),
    ]);
    state.govs = g.val() || {};
    state.areas = a.val() || {};
    state.centers = c.val() || {};
    hideLoading();
  }
  navigate("/centers");
}

export async function openCategories() {
  if (Object.keys(state.questions).length === 0) {
    showLoading("جارٍ تحميل الأسئلة...");
    const snap = await db.ref("questions").once("value");
    state.questions = snap.val() || {};
    hideLoading();
  }
  navigate("/categories");
}

export function getCatQs(cat) {
  return Object.values(state.questions).filter((q) => matchCat(q.category) === cat);
}

export function startStudy(cat) {
  const qs = getCatQs(cat);
  if (!qs.length) {
    alert("لا توجد أسئلة في هذا القسم بعد.");
    return;
  }
  state.studyQs = qs;
  state.studyCat = cat;
  navigate(`/study/${catId(cat)}`);
}

export function doStartTest(cat) {
  const qs = getCatQs(cat).sort(() => Math.random() - 0.5);
  if (!qs.length) {
    alert("لا توجد أسئلة في هذا القسم بعد.");
    return;
  }
  state.testQs = qs;
  state.testCat = cat;
  navigate(`/test/${catId(cat)}`);
}

export async function startTest(cat) {
  const session = loadSession();
  if (!session) {
    state.pendingAction = "test";
    state.pendingCat = cat;
    openRegModal();
    return;
  }
  const userSnap = await db.ref("users/" + session.key).once("value");
  if (!userSnap.exists()) {
    clearSession();
    state.pendingAction = "test";
    state.pendingCat = cat;
    openRegModal();
    return;
  }
  doStartTest(cat);
}

export function handleResult(ok, total) {
  state.resultOk = ok;
  state.resultTotal = total;
  saveResult("test", ok, total);
  navigate("/result");
}

export async function openExam() {
  let allQs = Object.values(state.questions);
  if (allQs.length === 0) {
    showLoading("جارٍ تحميل أسئلة الامتحان...");
    const snap = await db.ref("questions").once("value");
    const data = snap.val() || {};
    state.questions = data;
    allQs = Object.values(data);
    hideLoading();
  }
  state.examQs = allQs;
  navigate("/exam-rules");
}

export async function startExam() {
  const session = loadSession();
  if (!session) {
    state.pendingAction = "exam";
    state.pendingCat = null;
    openRegModal();
    return;
  }
  const userSnap = await db.ref("users/" + session.key).once("value");
  if (!userSnap.exists()) {
    clearSession();
    state.pendingAction = "exam";
    state.pendingCat = null;
    openRegModal();
    return;
  }
  navigate("/exam");
}

export function handleExamFinish(ok, wrong, total, skipped) {
  state.examOk = ok;
  state.examWrong = wrong;
  state.examTotal = total;
  state.examSkipped = skipped;
  saveResult("exam", ok, total);
  navigate("/exam-result");
}

export async function saveResult(type, ok, total) {
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
  const newAvg = Math.round((prevAvg * prevTests + pct) / newTests);
  await db.ref("users/" + key).update({
    testsTaken: newTests,
    bestScore: newBest,
    averageScore: newAvg,
    lastActiveAt: new Date().toISOString(),
  });
  await db.ref("users/" + key + "/results").push({
    type,
    ok,
    total,
    pct,
    at: new Date().toISOString(),
  });
}

export function getQCounts() {
  const qCounts = {};
  for (const q of Object.values(state.questions)) {
    if (q.category) {
      const d = matchCat(q.category);
      qCounts[d] = (qCounts[d] || 0) + 1;
    }
  }
  return qCounts;
}

export function handleAdminLogin() {
  state.adminLoggedIn = true;
  navigate("/admin");
}

export function handleAdminLogout() {
  auth.signOut();
  state.adminLoggedIn = false;
  navigate("/");
}

export { CATS };
