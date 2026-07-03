import { db } from "../lib/firebase";
import { state, loadSession } from "../state";
import { showLoading, hideLoading } from "../overlays";

const ALL_DAYS_SHORT = ["س", "ح", "ن", "ث", "ر", "خ", "ج"];
const ALL_DAYS_FULL = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

function getOpenStatus(schedule, workingDays, workingHours) {
  const now = new Date();
  const dayMap = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const todayName = dayMap[now.getDay()];
  let fromStr = null, toStr = null, isClosed = false;
  if (schedule && schedule.length === 7) {
    const todayIdx = ALL_DAYS_FULL.indexOf(todayName);
    if (todayIdx >= 0) {
      const s = schedule[todayIdx];
      isClosed = s.closed;
      fromStr = s.from;
      toStr = s.to;
    }
  }
  if (!fromStr && workingHours) {
    const m = workingHours.match(/(\d{1,2}:\d{2})/g);
    if (m && m.length >= 2) { fromStr = m[0]; toStr = m[1]; }
  }
  if (workingDays && workingDays.length > 0 && !workingDays.includes(todayName)) isClosed = true;
  if (isClosed || !fromStr || !toStr) {
    return { label: "مغلق اليوم", color: "#991B1B", bg: "#FEF2F2", icon: "ph-moon" };
  }
  const hm = (s) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const fromMin = hm(fromStr), toMin = hm(toStr);
  if (nowMin < fromMin) {
    const mins = fromMin - nowMin; const h = Math.floor(mins / 60); const m = mins % 60;
    return { label: h > 0 ? `يفتح بعد ${h}س ${m > 0 ? m + "د" : ""}` : `يفتح بعد ${m}د`, color: "#92400E", bg: "#FFF7ED", icon: "ph-clock-countdown" };
  }
  if (nowMin <= toMin) {
    const mins = toMin - nowMin; const h = Math.floor(mins / 60); const m = mins % 60;
    return { label: h > 0 ? `مفتوح · يغلق بعد ${h}س ${m > 0 ? m + "د" : ""}` : `مفتوح · يغلق بعد ${m}د`, color: "#166534", bg: "#F0FDF4", icon: "ph-door-open" };
  }
  return { label: "مغلق الآن", color: "#991B1B", bg: "#FEF2F2", icon: "ph-moon" };
}

function renderStars(rating, reviewCount) {
  if (rating == null) return "";
  const full = Math.round(rating);
  const empty = 5 - full;
  let html = `<div style="display:flex;align-items:center;gap:4px;direction:ltr;">
    <span style="font-size:15px;font-weight:700;color:#1F2937;">${rating.toFixed(1)}</span>
    <div style="display:flex;gap:1px;">`;
  for (let i = 0; i < full; i++) html += `<i class="ph-fill ph-star" style="font-size:15px;color:#F59E0B;"></i>`;
  for (let i = 0; i < Math.max(0, empty); i++) html += `<i class="ph ph-star" style="font-size:15px;color:#D1D5DB;"></i>`;
  html += `</div>`;
  if (reviewCount != null && reviewCount > 0) html += `<span style="font-size:13px;color:#6B7280;">(${reviewCount})</span>`;
  html += `</div>`;
  return html;
}

export function render(container, ctx) {
  const { id } = ctx.params;
  let center = null;
  let reviews = [];
  let reviewsLoading = true;
  let reviewRating = 5;
  let reviewComment = "";
  let sendingReview = false;
  let postAsAnonymous = false;
  let toastMsg = "";
  let toastTimer = null;

  const shell = document.createElement("div");
  shell.style.cssText = "min-height:100dvh;background:#FAFBFC;direction:rtl;";
  container.appendChild(shell);

  function update() {
    shell.innerHTML = "";
    if (!center) {
      const empty = document.createElement("div");
      empty.style.cssText = "text-align:center;padding:80px 20px;";
      empty.innerHTML = `<i class="ph ph-storefront" style="font-size:48px;color:#D1D5DB;margin-bottom:16px;"></i><div style="font-size:16px;font-weight:700;color:#6B7280;">المركز غير موجود</div>`;
      shell.appendChild(empty);
      return;
    }

    const main = document.createElement("div");
    main.style.cssText = "padding:0 14px 24px;max-width:720px;margin:0 auto;";
    shell.appendChild(main);

    const status = getOpenStatus(center.schedule, center.workingDays || [], center.workingHours);
    const isPromoted = !!center.promoted;
    const govName = center.governorateId ? (state.govs[center.governorateId]?.name || "") : "";

    // Hero card
    const hero = document.createElement("div");
    hero.style.cssText = "background:#fff;border-radius:20px;border:1.5px solid #E2E8F0;box-shadow:0 2px 8px rgba(0,0,0,0.04);margin:16px 0 14px;overflow:hidden;position:relative;";
    if (isPromoted) {
      hero.innerHTML += `<div style="position:absolute;top:0;left:16px;background:#FBBF24;color:#78350F;font-size:10px;font-weight:900;padding:3px 10px;border-radius:0 0 8px 8px;display:flex;align-items:center;gap:4px;z-index:2;"><i class="ph-fill ph-crown" style="font-size:11px;"></i> مميز</div>`;
    }
    
    const banner = document.createElement("div");
    banner.style.cssText = `height:120px;background:${center.imageUrl ? `url("${center.imageUrl}") center/cover no-repeat` : "linear-gradient(135deg, #2563EB 0%, #0891B2 100%)"};position:relative;`;
    hero.appendChild(banner);

    const profile = document.createElement("div");
    profile.style.cssText = "display:flex;flex-direction:column;align-items:center;margin-top:-48px;padding:0 20px 16px;position:relative;";
    if (center.imageUrl) {
      profile.innerHTML += `<img src="${center.imageUrl}" style="width:96px;height:96px;border-radius:50%;object-fit:cover;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.12);background:#fff;">`;
    } else {
      const initial = (center.name || "م").charAt(0);
      const colors = ["#2563EB", "#0891B2", "#7C3AED", "#DB2777", "#DC2626", "#EA580C", "#16A34A"];
      const bg = colors[(center.name.length + center.name.charCodeAt(0)) % colors.length];
      profile.innerHTML += `<div style="width:96px;height:96px;border-radius:50%;background:linear-gradient(135deg, ${bg}, ${bg}cc);border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.12);display:flex;align-items:center;justify-content:center;font-size:38px;font-weight:900;color:#fff;">${initial}</div>`;
    }
    profile.innerHTML += `<div style="font-size:20px;font-weight:900;color:#0F172A;margin-top:12px;text-align:center;">${center.name}</div>`;
    profile.innerHTML += `<div style="margin-top:6px;">${renderStars(center.rating, center.reviewCount)}</div>`;
    hero.appendChild(profile);

    const desc = document.createElement("div");
    desc.style.cssText = "padding:0 20px 16px;text-align:center;";
    desc.innerHTML = `<div style="font-size:14px;color:#64748B;line-height:1.7;max-width:460px;margin:0 auto;">${center.description || "مركز تدريب معتمد لتعليم قيادة السيارات في الأردن"}</div>`;
    hero.appendChild(desc);

    const statusRow = document.createElement("div");
    statusRow.style.cssText = "padding:0 20px 16px;display:flex;justify-content:center;";
    statusRow.innerHTML = `<div style="display:inline-flex;align-items:center;gap:6px;background:${status.bg};color:${status.color};font-size:12px;font-weight:800;padding:5px 14px;border-radius:100px;"><i class="ph ${status.icon}" style="font-size:14px;"></i> ${status.label}</div>`;
    hero.appendChild(statusRow);

    const locRow = document.createElement("div");
    locRow.style.cssText = "padding:0 20px 20px;display:flex;flex-wrap:wrap;justify-content:center;gap:6px;";
    if (govName) {
      locRow.innerHTML += `<span style="font-size:12px;font-weight:700;padding:4px 12px;border-radius:100px;background:#F3F4F6;color:#6B7280;display:inline-flex;align-items:center;gap:4px;"><i class="ph ph-map-trifold" style="font-size:12px;"></i> ${govName}</span>`;
    }
    (center.areas || []).forEach(a => {
      locRow.innerHTML += `<span style="font-size:12px;font-weight:700;padding:4px 12px;border-radius:100px;background:#EFF6FF;color:#2563EB;">${a.name}</span>`;
    });
    hero.appendChild(locRow);
    main.appendChild(hero);

    // Actions
    const actions = document.createElement("div");
    actions.style.cssText = "display:flex;gap:8px;margin-bottom:14px;";
    
    if (center.phone) {
      actions.appendChild(renderActionPill("ph-phone", "اتصال", `tel:${center.phone.replace(/[^0-9+]/g, "")}`, null, "#2563EB", "#F0F9FF", "#BFDBFE"));
    }
    const cleanWA = (center.whatsapp || center.phone || "").replace(/[^0-9+]/g, "").replace(/^\+/, "");
    if (cleanWA) {
      actions.appendChild(renderActionPill("ph-whatsapp-logo", "واتساب", `https://wa.me/${cleanWA}`, null, "#059669", "#ECFDF5", "#A7F3D0"));
    }
    if (center.mapLink) {
      actions.appendChild(renderActionPill("ph-map-pin-line", "الموقع", center.mapLink, null, "#fff", "#2563EB", "#2563EB"));
    }
    actions.appendChild(renderActionPill("ph-share-network", "مشاركة", null, () => {
      const url = `${window.location.origin}/centers/${center.publicId || center.id}`;
      if (navigator.share) navigator.share({ title: center.name, url });
      else { navigator.clipboard.writeText(url); showToast("تم نسخ الرابط"); }
    }, "#64748B", "#F8FAFC", "#E2E8F0"));
    main.appendChild(actions);

    // Info Sections
    const info = document.createElement("div");
    info.style.cssText = "display:flex;flex-direction:column;gap:12px;";
    if (center.address) {
      info.innerHTML += `
        <div style="background:#fff;border-radius:16px;border:1.5px solid #E2E8F0;padding:16px 18px;display:flex;align-items:flex-start;gap:12px;box-shadow:0 1px 3px rgba(0,0,0,0.03);">
          <div style="width:40px;height:40px;border-radius:12px;background:#EFF6FF;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="ph ph-map-pin" style="font-size:20px;color:#2563EB;"></i></div>
          <div style="flex:1;">
            <div style="font-size:12px;font-weight:700;color:#94A3B8;margin-bottom:3px;">العنوان</div>
            <div style="font-size:14px;font-weight:700;color:#0F172A;line-height:1.6;">${center.address}</div>
          </div>
        </div>
      `;
    }
    if (center.schedule && center.schedule.length === 7) {
      const schDiv = document.createElement("div");
      schDiv.style.cssText = "background:#fff;border-radius:16px;border:1.5px solid #E2E8F0;padding:16px 18px;box-shadow:0 1px 3px rgba(0,0,0,0.03);";
      schDiv.innerHTML = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;"><div style="width:40px;height:40px;border-radius:12px;background:#ECFEFF;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="ph ph-clock" style="font-size:20px;color:#0891B2;"></i></div><div style="font-size:15px;font-weight:800;color:#0F172A;">أوقات الدوام</div></div>`;
      const tableRows = ALL_DAYS_FULL.map((day, i) => {
        const s = center.schedule[i];
        const on = !s.closed;
        return `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-radius:10px;background:${on ? "#F8FAFC" : "transparent"};opacity:${on ? 1 : 0.45};margin-bottom:4px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="width:26px;height:26px;border-radius:8px;background:${on ? "#2563EB" : "#E5E7EB"};color:${on ? "#fff" : "#9CA3AF"};font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;">${ALL_DAYS_SHORT[i]}</span>
              <span style="font-size:13px;font-weight:700;color:#374151;">${day}</span>
            </div>
            <span style="font-size:13px;font-weight:700;color:${on ? "#2563EB" : "#9CA3AF"};">${on ? `${s.from} – ${s.to}` : "مغلق"}</span>
          </div>
        `;
      }).join("");
      schDiv.innerHTML += `<div>${tableRows}</div>`;
      info.appendChild(schDiv);
    }
    main.appendChild(info);

    // Review Form
    const reviewForm = document.createElement("div");
    reviewForm.style.cssText = "background:#fff;border-radius:16px;border:1.5px solid #E2E8F0;padding:20px;margin-top:24px;box-shadow:0 1px 3px rgba(0,0,0,0.03);";
    reviewForm.innerHTML = `<div style="font-size:16px;font-weight:900;color:#0F172A;margin-bottom:4px;text-align:center;">أضف تقييمك للمركز</div><div style="font-size:13px;color:#64748B;margin-bottom:16px;text-align:center;">رأيك يساعد المتدربين الآخرين في اختيار المركز المناسب</div>`;
    
    const starInpWrap = document.createElement("div");
    starInpWrap.style.cssText = "display:flex;gap:4px;direction:ltr;justify-content:center;margin-bottom:16px;";
    for (let n = 1; n <= 5; n++) {
      const sbtn = document.createElement("button");
      sbtn.style.cssText = "background:none;border:none;cursor:pointer;padding:2px;";
      sbtn.innerHTML = `<i class="${n <= reviewRating ? "ph-fill ph-star" : "ph ph-star"}" style="font-size:28px;color:${n <= reviewRating ? "#F59E0B" : "#D1D5DB"};"></i>`;
      sbtn.addEventListener("click", () => { reviewRating = n; update(); });
      starInpWrap.appendChild(sbtn);
    }
    reviewForm.appendChild(starInpWrap);

    const txt = document.createElement("textarea");
    txt.className = "centers-field";
    txt.placeholder = "اكتب تجربتك مع المركز هنا...";
    txt.value = reviewComment;
    txt.style.cssText = "width:100%;padding:14px;border-radius:12px;border:1.5px solid #E2E8F0;background:#F9FAFB;font-size:14px;font-family:inherit;color:#1e293b;outline:none;resize:vertical;min-height:80px;margin-bottom:14px;";
    txt.addEventListener("input", (e) => { reviewComment = e.target.value; });
    reviewForm.appendChild(txt);

    const session = loadSession();
    if (session && !session.key.startsWith("anon_")) {
      const anonLbl = document.createElement("label");
      anonLbl.style.cssText = "display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;color:#64748B;margin-bottom:14px;";
      const anonInp = document.createElement("input");
      anonInp.type = "checkbox";
      anonInp.checked = postAsAnonymous;
      anonInp.style.cssText = "width:18px;height:18px;accent-color:#2563EB;";
      anonInp.addEventListener("change", (e) => { postAsAnonymous = e.target.checked; });
      anonLbl.appendChild(anonInp);
      anonLbl.appendChild(document.createTextNode("نشر التقييم كمجهول"));
      reviewForm.appendChild(anonLbl);
    }

    const subBtn = document.createElement("button");
    subBtn.disabled = sendingReview;
    subBtn.style.cssText = `width:100%;padding:14px;border-radius:12px;background:#2563EB;color:#fff;font-size:15px;font-weight:800;border:none;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.15s;`;
    subBtn.innerHTML = sendingReview ? `<i class="ph ph-spinner" style="animation:spin 1s linear infinite;"></i>` : `<i class="ph ph-paper-plane-right"></i>`;
    subBtn.appendChild(document.createTextNode(sendingReview ? "جارٍ الإرسال..." : "نشر التقييم"));
    subBtn.addEventListener("click", submitReview);
    reviewForm.appendChild(subBtn);
    main.appendChild(reviewForm);

    // Reviews list
    if (reviews.length > 0) {
      const revList = document.createElement("div");
      revList.style.marginTop = "32px";
      revList.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;"><div style="font-size:18px;font-weight:900;color:#0F172A;">التقييمات (${reviews.length})</div></div>`;
      reviews.forEach(r => {
        const rCard = document.createElement("div");
        rCard.style.cssText = "background:#fff;border-radius:16px;border:1.5px solid #F0F1F3;padding:16px;margin-bottom:12px;";
        rCard.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
            <div style="display:flex;gap:10px;align-items:center;">
              <div style="width:36px;height:36px;border-radius:50%;background:#F1F5F9;color:#64748B;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;">${(r.name || "م").charAt(0)}</div>
              <div><div style="font-size:13px;font-weight:800;color:#1e293b;">${r.name}</div><div style="font-size:11px;color:#94A3B8;">${r.createdAt ? new Date(r.createdAt).toLocaleDateString("ar-JO") : ""}</div></div>
            </div>
            <div style="display:flex;gap:1px;direction:ltr;">${Array.from({ length: 5 }).map((_, i) => `<i class="${i < r.rating ? "ph-fill ph-star" : "ph ph-star"}" style="font-size:13px;color:#F59E0B;"></i>`).join("")}</div>
          </div>
          <div style="font-size:13px;color:#475569;line-height:1.6;">${r.comment || ""}</div>
        `;
        revList.appendChild(rCard);
      });
      main.appendChild(revList);
    }

    if (toastMsg) {
      const toast = document.createElement("div");
      toast.style.cssText = "position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;padding:12px 24px;border-radius:100px;font-size:14px;font-weight:700;z-index:1000;box-shadow:0 8px 24px rgba(0,0,0,0.2);animation:fadeUp 0.3s ease;";
      toast.textContent = toastMsg;
      shell.appendChild(toast);
    }
  }

  function renderActionPill(icon, label, href, onClick, color, bg, borderColor) {
    const a = document.createElement(href ? "a" : "button");
    if (href) { a.href = href; a.target = "_blank"; a.rel = "noreferrer"; }
    else a.addEventListener("click", onClick);
    a.style.cssText = `flex:1;height:48px;border-radius:14px;border:1.5px solid ${borderColor};background:${bg};color:${color};font-size:13px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;cursor:pointer;font-family:inherit;transition:transform 0.1s;`;
    a.innerHTML = `<i class="ph ${icon}" style="font-size:20px;"></i><span>${label}</span>`;
    return a;
  }

  function showToast(msg) {
    toastMsg = msg;
    update();
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastMsg = ""; update(); }, 2000);
  }

  async function submitReview() {
    if (!center) return;
    const session = loadSession();
    if (!session || session.key.startsWith("anon_")) { import("../overlays").then(o => o.openRegModal()); return; }
    sendingReview = true;
    update();
    try {
      const displayName = postAsAnonymous ? "مجهول" : session.name;
      await db.ref(`centerReviews/${center.id}`).push({
        name: displayName,
        comment: reviewComment.trim() || null,
        rating: reviewRating,
        reviewerKey: session.key,
        createdAt: new Date().toISOString()
      });
      reviews = [{ name: displayName, comment: reviewComment.trim(), rating: reviewRating, createdAt: new Date().toISOString() }, ...reviews];
      reviewComment = ""; reviewRating = 5;
      showToast("تم إرسال التقييم بنجاح");
    } catch {
      showToast("خطأ في إرسال التقييم");
    } finally {
      sendingReview = false;
      update();
    }
  }

  async function loadData() {
    if (Object.keys(state.centers).length === 0) {
      showLoading("جارٍ تحميل البيانات...");
      const [g, a, c] = await Promise.all([db.ref("governorates").once("value"), db.ref("areas").once("value"), db.ref("centers").once("value")]);
      state.govs = g.val() || {};
      state.areas = a.val() || {};
      state.centers = c.val() || {};
      hideLoading();
    }
    
    // Resolve center
    let resolvedId = null;
    if (/^\d+$/.test(id)) {
      for (const [key, c] of Object.entries(state.centers)) {
        if (c.publicId === parseInt(id, 10)) { resolvedId = key; break; }
      }
    } else resolvedId = id;

    if (resolvedId && state.centers[resolvedId] && !state.centers[resolvedId].suspended) {
      center = { id: resolvedId, ...state.centers[resolvedId] };
      // Load reviews
      db.ref(`centerReviews/${resolvedId}`).once("value").then(snap => {
        const val = snap.val() || {};
        reviews = Object.entries(val).map(([k, v]) => ({ id: k, ...v })).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
        update();
      });
    }
    update();
  }

  loadData();
}
