import { db } from "../lib/firebase";
import { state, loadSession } from "../state";
import { showLoading, hideLoading } from "../overlays";

/** Geo helpers */
function extractCoords(mapLink) {
  if (!mapLink) return null;
  const m1 = mapLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m1) return { lat: parseFloat(m1[1]), lng: parseFloat(m1[2]) };
  const m2 = mapLink.match(/\?.*q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m2) return { lat: parseFloat(m2[1]), lng: parseFloat(m2[2]) };
  return null;
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const ALL_DAYS_FULL = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const ALL_DAYS_SHORT = ["س", "ح", "ن", "ث", "ر", "خ", "ج"];

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
    <span style="font-size:14px;font-weight:700;color:#1F2937;">${rating.toFixed(1)}</span>
    <div style="display:flex;gap:1px;">`;
  for (let i = 0; i < full; i++) html += `<i class="ph-fill ph-star" style="font-size:14px;color:#F59E0B;"></i>`;
  for (let i = 0; i < Math.max(0, empty); i++) html += `<i class="ph ph-star" style="font-size:14px;color:#D1D5DB;"></i>`;
  html += `</div>`;
  if (reviewCount != null && reviewCount > 0) html += `<span style="font-size:12px;color:#6B7280;">(${reviewCount})</span>`;
  html += `</div>`;
  return html;
}

export function render(container, ctx) {
  let search = "";
  let govId = null;
  let areaId = null;
  let sort = "rating";
  let userCoords = null;
  let locPermission = "prompt";
  let loading = false;

  // Persistence
  const savedSort = localStorage.getItem("dex_centers_sort");
  if (savedSort) sort = savedSort;
  const savedCoords = localStorage.getItem("dex_user_coords");
  if (savedCoords) {
    try {
      userCoords = JSON.parse(savedCoords);
      locPermission = "granted";
    } catch {}
  }

  const shell = document.createElement("div");
  shell.style.cssText = "min-height:100dvh;background:#FAFBFC;direction:rtl;";
  container.appendChild(shell);

  function update() {
    shell.innerHTML = "";
    
    // Search & Sort Header
    const header = document.createElement("div");
    header.style.cssText = "background:#fff;padding:16px 16px 12px;display:flex;flex-direction:column;gap:12px;border-bottom:1.5px solid #F0F1F3;position:sticky;top:0;z-index:40;";
    
    const topRow = document.createElement("div");
    topRow.style.cssText = "display:flex;gap:10px;";
    
    const searchWrap = document.createElement("div");
    searchWrap.style.cssText = "flex:1;position:relative;";
    searchWrap.innerHTML = `<i class="ph ph-magnifying-glass" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);color:#9CA3AF;font-size:18px;"></i>`;
    const searchInp = document.createElement("input");
    searchInp.className = "centers-field";
    searchInp.placeholder = "ابحث باسم المركز أو المنطقة...";
    searchInp.value = search;
    searchInp.style.cssText = "width:100%;padding:10px 40px 10px 12px;border-radius:12px;border:1.5px solid #E5E7EB;background:#F9FAFB;font-size:14px;font-family:inherit;color:#111827;outline:none;transition:border-color .15s;";
    searchInp.addEventListener("input", (e) => { search = e.target.value; update(); });
    searchWrap.appendChild(searchInp);
    topRow.appendChild(searchWrap);

    const sortSel = document.createElement("select");
    sortSel.style.cssText = "width:110px;padding:10px 12px;border-radius:12px;border:1.5px solid #E5E7EB;background:#F9FAFB;font-size:12px;font-weight:700;font-family:inherit;color:#374151;cursor:pointer;outline:none;";
    sortSel.innerHTML = `
      <option value="rating" ${sort === "rating" ? "selected" : ""}>الأعلى تقييماً</option>
      <option value="newest" ${sort === "newest" ? "selected" : ""}>الأحدث</option>
      <option value="nearest" ${sort === "nearest" ? "selected" : ""}>الأقرب</option>
    `;
    sortSel.addEventListener("change", (e) => {
      sort = e.target.value;
      localStorage.setItem("dex_centers_sort", sort);
      if (sort === "nearest" && !userCoords) requestLocation();
      update();
    });
    topRow.appendChild(sortSel);
    header.appendChild(topRow);

    // Gov Chips
    const govWrap = document.createElement("div");
    govWrap.style.cssText = "display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;background:#fff;";
    const govList = [{ id: null, name: "الكل" }, ...Object.entries(state.govs).map(([id, g]) => ({ id, ...g })).sort((a, b) => a.name.localeCompare(b.name, "ar"))];
    govList.forEach(g => {
      const sel = govId === g.id;
      const btn = document.createElement("button");
      btn.style.cssText = `flex-shrink:0;padding:7px 15px;border-radius:100px;border:1.5px solid ${sel ? "#246BFD" : "#E5E7EB"};background:${sel ? "#246BFD" : "#fff"};color:${sel ? "#fff" : "#374151"};font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.15s;`;
      btn.textContent = g.name;
      btn.addEventListener("click", () => {
        govId = g.id;
        areaId = null;
        update();
      });
      govWrap.appendChild(btn);
    });
    header.appendChild(govWrap);

    // Area Chips
    if (govId) {
      const areaList = [{ id: null, name: "كل المناطق" }, ...Object.entries(state.areas).filter(([, a]) => a.governorateId === govId).map(([id, a]) => ({ id, ...a })).sort((a, b) => a.name.localeCompare(b.name, "ar"))];
      const areaWrap = document.createElement("div");
      areaWrap.style.cssText = "display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;background:#fff;margin-top:8px;";
      areaList.forEach(a => {
        const sel = areaId === a.id;
        const btn = document.createElement("button");
        btn.style.cssText = `flex-shrink:0;padding:5px 13px;border-radius:100px;border:1.5px solid ${sel ? "#0891B2" : "#E5E7EB"};background:${sel ? "#0891B2" : "#F9FAFB"};color:${sel ? "#fff" : "#6B7280"};font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.15s;`;
        btn.textContent = a.name;
        btn.addEventListener("click", () => { areaId = a.id; update(); });
        areaWrap.appendChild(btn);
      });
      header.appendChild(areaWrap);
    }
    shell.appendChild(header);

    // Permission Banner
    if (locPermission !== "granted") {
      const banner = document.createElement("div");
      banner.style.cssText = "margin:12px 16px 0;padding:12px 14px;border-radius:14px;background:#EEF4FF;border:1.5px solid #BFDBFE;display:flex;align-items:center;gap:10px;";
      banner.innerHTML = `
        <div style="width:36px;height:36px;border-radius:10px;background:#246BFD;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="ph-fill ph-navigation-arrow" style="font-size:18px;"></i></div>
        <div style="flex:1;">
          <div style="font-size:13px;font-weight:800;color:#1E40AF;">لعرض المراكز القريبة منك</div>
          <div style="font-size:12px;color:#3B82F6;margin-top:2px;">شارك موقعك لترتيب المراكز حسب المسافة</div>
        </div>
      `;
      const locBtn = document.createElement("button");
      locBtn.style.cssText = "padding:8px 14px;border-radius:10px;background:#246BFD;color:#fff;font-size:12px;font-weight:800;border:none;cursor:pointer;font-family:inherit;flex-shrink:0;";
      locBtn.innerHTML = `<i class="ph ph-crosshair" style="font-size:14px;margin-left:4px;"></i> تحديد موقعي`;
      locBtn.addEventListener("click", requestLocation);
      banner.appendChild(locBtn);
      shell.appendChild(banner);
    }

    // Centers List
    const list = document.createElement("div");
    list.style.cssText = "padding:14px;display:flex;flex-direction:column;gap:10px;";
    
    let filtered = Object.entries(state.centers)
      .filter(([, c]) => !c.suspended)
      .map(([id, c]) => ({ id, ...c }));

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(q) || 
        (c.address && c.address.toLowerCase().includes(q)) ||
        (c.areas && c.areas.some(a => a.name.toLowerCase().includes(q)))
      );
    }
    if (govId) filtered = filtered.filter(c => c.governorateId === govId);
    if (areaId) filtered = filtered.filter(c => c.areas && c.areas.some(a => a.id === areaId));

    // Sort
    if (sort === "rating") filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sort === "newest") filtered.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    else if (sort === "nearest" && userCoords) {
      filtered.forEach(c => {
        const coords = c.lat && c.lng ? { lat: c.lat, lng: c.lng } : extractCoords(c.mapLink);
        c._dist = coords ? haversineKm(userCoords.lat, userCoords.lng, coords.lat, coords.lng) : Infinity;
      });
      filtered.sort((a, b) => a._dist - b._dist);
    }

    if (filtered.length === 0) {
      list.innerHTML = `<div style="text-align:center;padding:64px 0;color:#9CA3AF;"><i class="ph ph-map-pin-simple-slash" style="font-size:48px;display:block;margin-bottom:12px;color:#D1D5DB;"></i><p style="font-size:15px;font-weight:700;color:#374151;margin-bottom:6px;">لا توجد مراكز</p><p style="font-size:13px;">جرّب تغيير المحافظة أو كلمة البحث</p></div>`;
    } else {
      filtered.forEach(c => {
        const card = renderCenterCard(c);
        card.addEventListener("click", () => ctx.navigate(`/centers/${c.publicId || c.id}`));
        list.appendChild(card);
      });
    }
    shell.appendChild(list);
  }

  function renderCenterCard(c) {
    const card = document.createElement("div");
    card.style.cssText = "background:#fff;border-radius:16px;border:1.5px solid #F0F1F3;box-shadow:0 1px 3px rgba(0,0,0,0.04);padding:14px 16px;cursor:pointer;position:relative;overflow:hidden;";
    const status = getOpenStatus(c.schedule, c.workingDays || [], c.workingHours);
    const isPromoted = !!c.promoted;
    const gName = c.governorateId ? (state.govs[c.governorateId]?.name || "") : "";

    let html = "";
    if (isPromoted) {
      html += `<div style="position:absolute;top:-1px;left:14px;background:#FBBF24;color:#78350F;font-size:10px;font-weight:900;padding:2px 8px;border-radius:0 0 6px 6px;display:flex;align-items:center;gap:3px;"><i class="ph-fill ph-crown" style="font-size:10px;"></i> مميز</div>`;
    }
    html += `
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:8px;">
        <div style="flex:1;min-width:0;">
          <div style="font-size:15px;font-weight:900;color:#111827;line-height:1.4;margin-bottom:6;padding-top:${isPromoted ? "18px" : "0"};">${c.name}</div>
          <div style="display:inline-flex;align-items:center;gap:4px;background:${status.bg};color:${status.color};font-size:11px;font-weight:800;padding:3px 10px;border-radius:20px;"><i class="ph ${status.icon}" style="font-size:12px;"></i> ${status.label}</div>
        </div>
        <div style="flex-shrink:0;display:flex;flex-direction:column;align-items:flex-end;gap:6px;padding-top:${isPromoted ? "14px" : "0"};">${renderStars(c.rating, c.reviewCount)}</div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px;">
        <span style="font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px;background:#F3F4F6;color:#6B7280;display:inline-flex;align-items:center;gap:4px;"><i class="ph ph-map-trifold" style="font-size:12px;"></i> ${gName}</span>
    `;
    (c.areas || []).slice(0, 3).forEach(a => {
      html += `<span style="font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px;background:#EEF4FF;color:#246BFD;">${a.name}</span>`;
    });
    if ((c.areas || []).length > 3) html += `<span style="font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px;background:#F3F4F6;color:#9CA3AF;">+${c.areas.length - 3}</span>`;
    if (c._dist != null && c._dist !== Infinity) {
      html += `<span style="font-size:11px;font-weight:800;padding:3px 9px;border-radius:20px;background:#DCFCE7;color:#166534;display:inline-flex;align-items:center;gap:4px;margin-right:auto;"><i class="ph-fill ph-navigation-arrow" style="font-size:12px;"></i> ${c._dist < 1 ? Math.round(c._dist * 1000) + " م" : c._dist.toFixed(1) + " كم"}</span>`;
    }
    html += `</div>`;
    
    card.innerHTML = html;
    
    const actions = document.createElement("div");
    actions.style.cssText = "display:flex;gap:8px;align-items:center;flex-wrap:wrap;";
    actions.addEventListener("click", e => e.stopPropagation());
    
    if (c.phone) {
      actions.appendChild(renderBtn("ph-phone", c.phone, `tel:${c.phone.replace(/[^0-9+]/g, "")}`));
    }
    if (c.whatsapp || c.phone) {
      actions.appendChild(renderBtn("ph-whatsapp-logo", "واتساب", `https://wa.me/${(c.whatsapp || c.phone).replace(/[^0-9+]/g, "").replace(/^\+/, "")}`, "#ECFDF5", "#059669", "#D1FAE5"));
    }
    if (c.mapLink) {
      actions.appendChild(renderBtn("ph-map-pin-line", "الموقع", c.mapLink, "#246BFD", "#fff", "#246BFD"));
    }
    card.appendChild(actions);

    const footer = document.createElement("div");
    footer.style.cssText = "display:flex;gap:8px;align-items:center;margin-top:10px;";
    const shareBtn = document.createElement("button");
    shareBtn.style.cssText = "width:38px;height:38px;border-radius:10px;border:1.5px solid #E2E8F0;background:#F8FAFC;display:flex;align-items:center;justify-content:center;cursor:pointer;";
    shareBtn.innerHTML = `<i class="ph ph-share-network" style="font-size:16px;color:#64748B;"></i>`;
    shareBtn.addEventListener("click", e => {
      e.stopPropagation();
      const url = `${window.location.origin}/centers/${c.publicId || c.id}`;
      if (navigator.share) navigator.share({ title: c.name, url });
      else navigator.clipboard.writeText(url);
    });
    footer.appendChild(shareBtn);
    const detailBtn = document.createElement("div");
    detailBtn.style.cssText = "flex:1;height:40px;border-radius:10px;border:1.5px solid #E5E7EB;background:#F9FAFB;color:#374151;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:6px;";
    detailBtn.innerHTML = `عرض التفاصيل <i class="ph ph-arrow-left" style="font-size:16px;"></i>`;
    footer.appendChild(detailBtn);
    card.appendChild(footer);

    return card;
  }

  function renderBtn(icon, label, href, bg = "#F9FAFB", color = "#374151", border = "#E5E7EB") {
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.style.cssText = `flex:1;height:38px;border-radius:10px;border:1.5px solid ${border};background:${bg};color:${color};font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:5px;text-decoration:none;min-width:80px;overflow:hidden;`;
    a.innerHTML = `<i class="ph ${icon}" style="font-size:16px;"></i><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${label}</span>`;
    return a;
  }

  function requestLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      locPermission = "granted";
      localStorage.setItem("dex_user_coords", JSON.stringify(userCoords));
      update();
    }, () => {
      locPermission = "denied";
      update();
    });
  }

  async function loadData() {
    if (Object.keys(state.centers).length === 0) {
      showLoading("جارٍ تحميل المراكز...");
      const [g, a, c] = await Promise.all([db.ref("governorates").once("value"), db.ref("areas").once("value"), db.ref("centers").once("value")]);
      state.govs = g.val() || {};
      state.areas = a.val() || {};
      state.centers = c.val() || {};
      hideLoading();
    }
    update();
  }

  loadData();
}
