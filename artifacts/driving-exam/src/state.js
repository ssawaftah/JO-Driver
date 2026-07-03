export const CATS = [
  "قواعد السير والمرور",
  "الميكانيك",
  "السلامة على الطريق",
  "أسعافات أولية",
  "الشواخص والخطوط والعلامات",
  "المخالفات واحتساب النقاط",
  "الصور المتحركة",
];

export function catId(cat) {
  const idx = CATS.indexOf(cat);
  return idx >= 0 ? String(idx) : "0";
}

export function catFromId(id) {
  const n = parseInt(id, 10);
  return CATS[n] || CATS[0];
}

/** Normalize Arabic text: unify alef variants, strip tashkeel */
export function normAr(s) {
  return String(s || "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .trim();
}

export function matchCat(fbCat) {
  const norm = normAr(fbCat);
  return CATS.find((c) => normAr(c) === norm) ?? fbCat;
}

const SESSION_KEY = "dex_user";

export function saveSession(name, key) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ name, key }));
  } catch {}
}

export function loadSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");
    return s?.key ? s : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

export function getUserKey() {
  return loadSession()?.key || null;
}

export const CACHE_KEYS = {
  govs: "dex_cache_govs",
  areas: "dex_cache_areas",
  centers: "dex_cache_centers",
  questions: "dex_cache_questions",
  guide: "dex_cache_guide",
};

export function loadCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

/**
 * Global mutable app state (mirrors what used to be React state in App.tsx).
 * Screens read from this object when they render; app.js actions mutate it
 * and then call navigate() to re-render the next screen.
 */
export const state = {
  loading: true,
  loadMsg: "جارٍ التحميل...",
  showReg: false,
  userName: "",
  pendingAction: null, // "test" | "exam" | null
  pendingCat: null,

  govs: {},
  areas: {},
  centers: {},
  questions: {},

  studyQs: [],
  testQs: [],
  studyCat: CATS[0],
  testCat: CATS[0],
  resultOk: 0,
  resultTotal: 0,

  examQs: [],
  examOk: 0,
  examWrong: 0,
  examTotal: 0,
  examSkipped: 0,

  adminLoggedIn: false,

  guideSections: null,
};
