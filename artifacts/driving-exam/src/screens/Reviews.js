import { db } from "../lib/firebase";
import { state, loadSession, clearSession } from "../state";
import { showLoading, hideLoading } from "../overlays";
import { renderReviewModal } from "../components/ReviewModal";

/** Helper to escape HTML */
function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function StarIcon({ filled, size = 32 }) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${filled ? "#F59E0B" : "none"}" stroke="#F59E0B" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" style="transition:all .15s;">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>`;
}

export function render(container, ctx) {
  let reviewsList = [];
  let reviewStars = 0;
  let reviewComment = "";
  let reviewSaving = false;
  let reviewMsg = "";
  let postAsAnonymous = false;
  let msgTimer = null;
  let hoverStars = 0;

  const shell = document.createElement("div");
  shell.style.cssText = "display:flex;flex-direction:column;min-height:100dvh;background:#F3F6FF;direction:rtl;";

  const content = document.createElement("div");
  content.style.cssText = "padding:16px;flex:1;";
  shell.appendChild(content);

  container.appendChild(shell);

  function update() {
    content.innerHTML = "";

    // Page info card
    const infoCard = document.createElement("div");
    infoCard.style.cssText = "background:#fff;border-radius:16px;padding:16px 18px;border:1.5px solid #E5E7EB;marginBottom:14px;display:flex;align-items:center;gap:14px;";
    infoCard.innerHTML = `
      <div style="width:44px;height:44px;border-radius:12px;flex-shrink:0;background:#F59E0B;color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;">
        <i class="ph ph-star"></i>
      </div>
      <div>
        <div style="font-size:15px;font-weight:800;color:#111827;">سجل الزوار</div>
        <div style="font-size:12px;color:#6B7280;marginTop:2%;">شاركنا تجربتك وقيّم خدماتنا — رأيك يهمنا</div>
      </div>
    `;
    content.appendChild(infoCard);

    // Review Form
    const formWrap = document.createElement("div");
    formWrap.style.cssText = "background:#fff;border:1.5px solid #F0F1F3;border-radius:16px;padding:16px;margin-bottom:16px;margin-top:16px;";
    
    const formTitle = document.createElement("div");
    formTitle.style.cssText = "font-size:14px;font-weight:800;color:#111827;margin-bottom:12px;text-align:center;";
    formTitle.textContent = "أضف تقييمك";
    formWrap.appendChild(formTitle);

    const starsWrap = document.createElement("div");
    starsWrap.style.cssText = "margin-bottom:12px;display:flex;gap:6px;direction:ltr;justify-content:center;";
    const currentStars = hoverStars || reviewStars;
    for (let n = 1; n <= 5; n++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.style.cssText = "background:none;border:none;cursor:pointer;padding:2px;font-family:inherit;touch-action:manipulation;-webkit-tap-highlight-color:transparent;";
      btn.innerHTML = StarIcon({ filled: n <= currentStars, size: 36 });
      btn.addEventListener("click", () => {
        reviewStars = n;
        update();
      });
      btn.addEventListener("mouseenter", () => {
        hoverStars = n;
        update();
      });
      btn.addEventListener("mouseleave", () => {
        hoverStars = 0;
        update();
      });
      starsWrap.appendChild(btn);
    }
    formWrap.appendChild(starsWrap);

    const textarea = document.createElement("textarea");
    textarea.className = "review-field";
    textarea.placeholder = "اكتب رأيك هنا...";
    textarea.rows = 3;
    textarea.value = reviewComment;
    textarea.style.cssText = "width:100%;padding:12px 14px;border:1.5px solid #E5E7EB;border-radius:12px;background:#F9FAFB;font-size:14px;font-family:inherit;color:#111827;outline:none;resize:vertical;transition:border-color .15s;";
    textarea.addEventListener("input", (e) => {
      reviewComment = e.target.value;
    });
    formWrap.appendChild(textarea);

    const session = loadSession();
    if (session && !session.key.startsWith("anon_")) {
      const anonLabel = document.createElement("label");
      anonLabel.style.cssText = "display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;color:#6B7280;margin-bottom:12px;margin-top:12px;";
      const anonCheck = document.createElement("input");
      anonCheck.type = "checkbox";
      anonCheck.checked = postAsAnonymous;
      anonCheck.style.cssText = "width:18px;height:18px;accent-color:#246BFD;";
      anonCheck.addEventListener("change", (e) => {
        postAsAnonymous = e.target.checked;
      });
      anonLabel.appendChild(anonCheck);
      anonLabel.appendChild(document.createTextNode("التعليق كمجهول"));
      formWrap.appendChild(anonLabel);
    } else {
      const spacer = document.createElement("div");
      spacer.style.height = "12px";
      formWrap.appendChild(spacer);
    }

    const submitBtn = document.createElement("button");
    submitBtn.disabled = reviewSaving;
    submitBtn.style.cssText = `width:100%;padding:12px;border-radius:12px;border:none;background:#246BFD;color:#fff;font-size:14px;font-weight:800;cursor:${reviewSaving ? "not-allowed" : "pointer"};opacity:${reviewSaving ? 0.6 : 1};font-family:inherit;transition:all .15s;display:flex;align-items:center;justify-content:center;gap:6px;`;
    submitBtn.innerHTML = `<i class="ph ph-paper-plane-right" style="font-size:16px;"></i> ${reviewSaving ? "جارٍ النشر..." : "نشر الرأي"}`;
    submitBtn.addEventListener("click", submitReview);
    formWrap.appendChild(submitBtn);

    if (reviewMsg) {
      const msgBox = document.createElement("div");
      const isSuccess = reviewMsg.includes("شكرا");
      msgBox.style.cssText = `margin-top:10px;text-align:center;font-size:12px;font-weight:700;color:${isSuccess ? "#16A34A" : "#DC2626"};padding:8px 12px;border-radius:10px;background:${isSuccess ? "#DCFCE7" : "#FEE2E2"};`;
      msgBox.textContent = reviewMsg;
      formWrap.appendChild(msgBox);
    }

    content.appendChild(formWrap);

    // Reviews list
    if (reviewsList.length > 0) {
      const listTitle = document.createElement("div");
      listTitle.style.cssText = "font-size:12px;font-weight:800;color:#9CA3AF;margin-bottom:10px;text-align:center;";
      listTitle.textContent = "آخر التقييمات";
      content.appendChild(listTitle);

      const listWrap = document.createElement("div");
      listWrap.style.cssText = "display:flex;flex-direction:column;gap:10px;";
      reviewsList.forEach(r => {
        const card = document.createElement("div");
        card.style.cssText = "background:#fff;border:1.5px solid #F0F1F3;border-radius:14px;padding:14px;";
        
        const cardHeader = document.createElement("div");
        cardHeader.style.cssText = "display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;direction:rtl;";
        
        const userInfo = document.createElement("div");
        userInfo.style.cssText = "display:flex;align-items:center;gap:10px;";
        userInfo.innerHTML = `
          <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg, #246BFD, #4f86ff);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;flex-shrink:0;">
            ${escapeHtml((r.name || "م").charAt(0))}
          </div>
          <div>
            <div style="font-size:13px;font-weight:800;color:#111827;">${escapeHtml(r.name)}</div>
            <div style="font-size:11px;color:#9CA3AF;">${r.createdAt ? new Date(r.createdAt).toLocaleDateString("ar-JO") : "-"}</div>
          </div>
        `;
        cardHeader.appendChild(userInfo);

        const starsDiv = document.createElement("div");
        starsDiv.style.cssText = "display:flex;gap:3px;direction:ltr;";
        for (let i = 0; i < 5; i++) {
          starsDiv.innerHTML += StarIcon({ filled: i < (r.stars || 0), size: 16 });
        }
        cardHeader.appendChild(starsDiv);
        card.appendChild(cardHeader);

        if (r.comment) {
          const commentDiv = document.createElement("div");
          commentDiv.style.cssText = "font-size:13px;color:#374151;line-height:1.7;margin-top:4px;";
          commentDiv.textContent = r.comment;
          card.appendChild(commentDiv);
        }
        listWrap.appendChild(card);
      });
      content.appendChild(listWrap);
    }
  }

  async function loadReviews() {
    try {
      const snap = await db.ref("reviews").once("value");
      const val = snap.val() || {};
      reviewsList = Object.entries(val)
        .map(([id, r]) => ({ id, ...r }))
        .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      update();
    } catch {}
  }

  async function submitReview() {
    if (reviewStars === 0) {
      reviewMsg = "اختر تقييماً بالنجوم";
      update();
      return;
    }

    const session = loadSession();
    if (!session) {
      // Need auth - the ReviewModal exported from components/ReviewModal.js 
      // is actually a full functional component that can handle publishing too,
      // but here we are recreating the screen's own submission logic.
      // The original Reviews.tsx uses PhoneAuthModal directly.
      import("../overlays").then(o => o.openRegModal());
      return;
    }

    reviewSaving = true;
    reviewMsg = "";
    update();

    try {
      const userSnap = await db.ref("users/" + session.key).once("value");
      if (!userSnap.exists()) {
        clearSession();
        import("../overlays").then(o => o.openRegModal());
        reviewSaving = false;
        update();
        return;
      }

      const displayName = postAsAnonymous ? "مجهول" : session.name;
      await db.ref("reviews").push({
        name: displayName,
        stars: reviewStars,
        comment: reviewComment.trim(),
        reviewerKey: session.key,
        createdAt: new Date().toISOString()
      });

      reviewStars = 0;
      reviewComment = "";
      postAsAnonymous = false;
      reviewMsg = "شكراً! تم نشر رأيك بنجاح";
      reviewSaving = false;
      
      if (msgTimer) clearTimeout(msgTimer);
      msgTimer = setTimeout(() => {
        reviewMsg = "";
        update();
      }, 3000);

      loadReviews();
    } catch (e) {
      reviewMsg = "حدث خطأ أثناء النشر";
      reviewSaving = false;
      update();
    }
  }

  // Initial load
  loadReviews();

  return () => {
    if (msgTimer) clearTimeout(msgTimer);
  };
}
