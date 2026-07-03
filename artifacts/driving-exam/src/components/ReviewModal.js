import { db } from "../lib/firebase";
import { loadSession, clearSession } from "../state";
import { renderPhoneAuthModal } from "./PhoneAuthModal";

function starIconSvg(filled, size = 32) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${filled ? "#F59E0B" : "none"}" stroke="#F59E0B" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" style="transition:all .15s;">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>`;
}

/**
 * renderReviewModal({ open, onClose, context, title, subtitle }) -> DOM node
 */
export function renderReviewModal({ open, onClose, context, title, subtitle }) {
  if (!open) return document.createElement("div");

  let stars = 0;
  let hover = 0;
  let comment = "";
  let saving = false;
  let msg = "";
  let postAnon = false;
  let showAuth = false;
  let msgTimer = null;

  const wrap = document.createElement("div");

  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;z-index:110;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;padding:16px;direction:rtl;";
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) onClose();
  });
  wrap.appendChild(overlay);

  const card = document.createElement("div");
  card.style.cssText = "background:#fff;border-radius:20px;padding:24px;width:100%;max-width:420px;box-shadow:0 20px 60px rgba(0,0,0,0.25);animation:fadeUp 0.22s ease;animation-fill-mode:both;";
  card.addEventListener("click", (e) => e.stopPropagation());
  overlay.appendChild(card);

  let authHost = document.createElement("div");
  wrap.appendChild(authHost);

  function renderAuth() {
    authHost.innerHTML = "";
    if (showAuth) {
      authHost.appendChild(
        renderPhoneAuthModal({
          open: true,
          onClose: () => {
            showAuth = false;
            renderAuth();
          },
          onSuccess: (name, key) => {
            showAuth = false;
            renderAuth();
            if (key.startsWith("anon_")) {
              doPublish("مجهول", key, true);
            } else {
              doPublish(name, key, postAnon);
            }
          },
          showAnonymous: true,
          title: "سجّل لنشر رأيك",
          subtitle: "أدخل بياناتك أو انشر كمجهول",
        })
      );
    }
  }

  function render() {
    card.innerHTML = "";

    const header = document.createElement("div");
    header.style.cssText = "text-align:center;margin-bottom:20px;";
    header.innerHTML = `
      <div style="width:48px;height:48px;border-radius:16px;background:linear-gradient(135deg,#F59E0B,#F97316);color:#fff;display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 10px;">
        <i class="ph ph-star"></i>
      </div>
      <h2 style="font-size:18px;font-weight:900;color:#111827;margin-bottom:4px;">${escapeHtml(title || "قيّم تجربتك")}</h2>
      <p style="font-size:13px;color:#6B7280;">${escapeHtml(subtitle || "شاركنا رأيك لتحسين الخدمة")}</p>
    `;
    card.appendChild(header);

    const starsWrap = document.createElement("div");
    starsWrap.style.marginBottom = "16px";
    const starsRow = document.createElement("div");
    starsRow.style.cssText = "display:flex;gap:6px;direction:ltr;justify-content:center;";
    starsRow.addEventListener("mouseleave", () => {
      hover = 0;
      updateStars();
    });
    for (let n = 1; n <= 5; n++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.n = n;
      btn.style.cssText = "background:none;border:none;cursor:pointer;padding:2px;font-family:inherit;touch-action:manipulation;-webkit-tap-highlight-color:transparent;";
      btn.innerHTML = starIconSvg(n <= (hover || stars), 40);
      btn.addEventListener("click", () => {
        stars = n;
        render();
      });
      btn.addEventListener("mouseenter", () => {
        hover = n;
        updateStars();
      });
      btn.addEventListener("touchstart", () => {
        hover = n;
        updateStars();
      });
      starsRow.appendChild(btn);
    }
    starsWrap.appendChild(starsRow);
    card.appendChild(starsWrap);

    function updateStars() {
      const display = hover || stars;
      starsRow.querySelectorAll("button").forEach((btn) => {
        const n = Number(btn.dataset.n);
        btn.innerHTML = starIconSvg(n <= display, 40);
      });
    }

    const textareaWrap = document.createElement("div");
    textareaWrap.style.marginBottom = "14px";
    const textarea = document.createElement("textarea");
    textarea.value = comment;
    textarea.placeholder = "اكتب رأيك هنا (اختياري)...";
    textarea.rows = 3;
    textarea.autocomplete = "off";
    textarea.spellcheck = false;
    textarea.className = "review-field";
    textarea.style.cssText =
      "width:100%;padding:12px 14px;border:1.5px solid #E5E7EB;border-radius:12px;background:#F9FAFB;font-size:14px;font-family:inherit;color:#111827;outline:none;resize:vertical;transition:border-color .15s;";
    textarea.addEventListener("input", (e) => {
      comment = e.target.value;
    });
    textareaWrap.appendChild(textarea);
    card.appendChild(textareaWrap);

    const session = loadSession();
    if (session && !session.key.startsWith("anon_")) {
      const label = document.createElement("label");
      label.style.cssText = "display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;color:#6B7280;margin-bottom:14px;";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = postAnon;
      cb.style.cssText = "width:18px;height:18px;accent-color:#246BFD;";
      cb.addEventListener("change", (e) => {
        postAnon = e.target.checked;
      });
      label.appendChild(cb);
      label.appendChild(document.createTextNode("نشر رأي كمجهول"));
      card.appendChild(label);
    }

    const publishBtn = document.createElement("button");
    publishBtn.disabled = saving || stars === 0;
    publishBtn.style.cssText = `width:100%;padding:12px;border-radius:12px;border:none;background:${stars === 0 ? "#E5E7EB" : "#246BFD"};color:${stars === 0 ? "#9CA3AF" : "#fff"};font-size:15px;font-weight:800;cursor:${stars === 0 ? "not-allowed" : "pointer"};font-family:inherit;transition:all .15s;display:flex;align-items:center;justify-content:center;gap:6px;`;
    publishBtn.innerHTML = `<i class="ph ph-paper-plane-right" style="font-size:18px;"></i><span>${saving ? "جارٍ النشر..." : "نشر الرأي"}</span>`;
    publishBtn.addEventListener("click", handlePublish);
    card.appendChild(publishBtn);

    if (msg) {
      const msgBox = document.createElement("div");
      const isThanks = msg.includes("شكر");
      msgBox.style.cssText = `margin-top:10px;text-align:center;font-size:13px;font-weight:700;color:${isThanks ? "#16A34A" : "#DC2626"};padding:10px 12px;border-radius:10px;background:${isThanks ? "#DCFCE7" : "#FEE2E2"};`;
      msgBox.textContent = msg;
      card.appendChild(msgBox);
    }

    const laterBtn = document.createElement("button");
    laterBtn.type = "button";
    laterBtn.style.cssText = "width:100%;height:44px;border-radius:12px;border:1.5px solid #E5E7EB;background:#fff;color:#6B7280;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;margin-top:10px;";
    laterBtn.textContent = "لاحقاً";
    laterBtn.addEventListener("click", onClose);
    card.appendChild(laterBtn);
  }

  async function doPublish(name, key, anonymous) {
    if (stars === 0) {
      msg = "اختر تقييماً بالنجوم";
      render();
      return;
    }
    saving = true;
    msg = "";
    render();
    try {
      await db.ref("reviews").push({
        name: anonymous ? "مجهول" : name,
        stars,
        comment: comment.trim(),
        reviewerKey: key,
        createdAt: new Date().toISOString(),
      });
      msg = "شكراً! تم نشر رأيك بنجاح";
      stars = 0;
      comment = "";
      postAnon = false;
      saving = false;
      render();
      if (msgTimer) clearTimeout(msgTimer);
      msgTimer = setTimeout(() => {
        msg = "";
        render();
      }, 3000);
      setTimeout(() => onClose(), 1500);
    } catch {
      msg = "حدث خطأ أثناء النشر";
      saving = false;
      render();
    }
  }

  async function handlePublish() {
    const session = loadSession();
    if (!session) {
      if (context === "exam") {
        msg = "يجب تسجيل الدخول أولاً";
        render();
        return;
      }
      showAuth = true;
      renderAuth();
      return;
    }

    try {
      const userSnap = await db.ref("users/" + session.key).once("value");
      if (!userSnap.exists()) {
        clearSession();
        msg = "انتهت الجلسة، أعد تسجيل الدخول";
        render();
        if (context === "test") {
          showAuth = true;
          renderAuth();
        }
        return;
      }
    } catch {
      /* continue even if check fails */
    }

    await doPublish(session.name, session.key, postAnon);
  }

  render();
  return wrap;
}

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}
