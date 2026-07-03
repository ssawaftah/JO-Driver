import { db } from "../lib/firebase";
import { state, loadSession } from "../state";
import { showLoading, hideLoading } from "../overlays";

const DAYS_FULL = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const DAYS_SHORT = ["س", "ح", "ن", "ث", "ر", "خ", "ج"];

const P = "#246BFD";
const PL = "#EEF4FF";

function isGoogleMapsUrl(url) {
  return /google\.(com|jo)\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/i.test(url);
}

export function render(container, ctx) {
  let step = 1;
  let mapLink = "";
  let fetching = false;
  let fetchError = "";
  let fetchDone = false;

  let name = "";
  let address = "";
  let phone = "";
  let whatsapp = "";
  let samePhone = false;
  let govId = "";
  let selectedAreaIds = [];
  let schedule = DAYS_FULL.map((_, i) => ({
    closed: i === 6,
    from: "08:00",
    to: "16:00",
  }));
  let rating = "";
  let reviewCount = "";
  let imageUrl = "";
  let description = "";

  let showAddArea = false;
  let newAreaName = "";
  let savingArea = false;
  let areaError = "";
  let localAreas = {};

  let sending = false;
  let sent = false;

  const shell = document.createElement("div");
  shell.style.cssText = "min-height:100dvh;display:flex;flex-direction:column;background:#F6F8FB;direction:rtl;";

  container.appendChild(shell);

  async function update() {
    shell.innerHTML = "";
    
    if (sent) {
      const successBox = document.createElement("div");
      successBox.style.cssText = "flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;";
      successBox.innerHTML = `
        <div style="width:80px;height:80px;border-radius:50%;background:#DCFCE7;display:flex;align-items:center;justify-content:center;">
          <i class="ph ph-check-circle" style="font-size:44px;color:#16A34A;"></i>
        </div>
        <div style="text-align:center;">
          <div style="font-size:18px;font-weight:900;color:#111827;margin-bottom:6px;">تم إرسال طلبك!</div>
          <div style="font-size:13px;color:#6B7280;line-height:1.6;">سيتم مراجعة معلومات مركزك ونشره قريباً</div>
        </div>
      `;
      const backBtn = document.createElement("button");
      backBtn.style.cssText = `background:${P};color:#fff;font-size:14px;font-weight:800;padding:12px 32px;border-radius:12px;border:none;cursor:pointer;font-family:inherit;`;
      backBtn.textContent = "العودة";
      backBtn.addEventListener("click", () => ctx.navigate("/centers"));
      successBox.appendChild(backBtn);
      shell.appendChild(successBox);
      return;
    }

    const scrollArea = document.createElement("div");
    scrollArea.style.cssText = "flex:1;overflow-y:auto;padding:16px 16px 40px;display:flex;flex-direction:column;gap:14px;";
    shell.appendChild(scrollArea);

    // Step 1: URL + Name + Address
    const step1Card = document.createElement("div");
    step1Card.style.cssText = `background:#fff;border-radius:16px;padding:18px;border:2px solid ${P};box-shadow:0 0 0 4px ${PL};`;
    step1Card.innerHTML = `
      <div style="font-size:12px;font-weight:800;color:${P};margin-bottom:4px;display:flex;align-items:center;gap:6px;">
        <i class="ph ph-map-pin" style="font-size:14px;"></i> رابط المركز على Google Maps
      </div>
      <div style="font-size:11px;color:#6B7280;margin-bottom:10px;">الصق رابط المركز وسيتم جلب الاسم والعنوان تلقائياً</div>
    `;

    const fetchWrap = document.createElement("div");
    fetchWrap.style.cssText = "display:flex;gap:8px;";
    
    const urlInput = document.createElement("input");
    urlInput.type = "url";
    urlInput.className = "join-field";
    urlInput.value = mapLink;
    urlInput.placeholder = "https://maps.google.com/maps/place/...";
    urlInput.style.cssText = "flex:1;padding:10px 14px;border-radius:10px;border:1.5px solid #E5E7EB;background:#F9FAFB;font-size:13px;font-family:inherit;color:#374151;outline:none;direction:ltr;text-align:right;";
    urlInput.addEventListener("input", (e) => { mapLink = e.target.value; });
    urlInput.addEventListener("paste", (e) => {
      const pasted = e.clipboardData.getData("text");
      if (isGoogleMapsUrl(pasted)) {
        setTimeout(() => { 
          mapLink = pasted;
          urlInput.value = pasted;
          fetchFromMaps(); 
        }, 80);
      }
    });
    fetchWrap.appendChild(urlInput);

    const fetchBtn = document.createElement("button");
    fetchBtn.disabled = fetching || !mapLink.trim();
    fetchBtn.style.cssText = `padding:10px 16px;border-radius:10px;background:${fetching || !mapLink.trim() ? "#93C5FD" : P};color:#fff;border:none;cursor:${fetching || !mapLink.trim() ? "default" : "pointer"};font-size:13px;font-weight:800;font-family:inherit;display:flex;align-items:center;gap:6px;white-space:nowrap;transition:background .15s;`;
    fetchBtn.innerHTML = fetching ? 
      `<div style="width:16px;height:16px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite;"></div>` : 
      `<i class="ph ph-magnifying-glass"></i>`;
    fetchBtn.appendChild(document.createTextNode(fetching ? "جارٍ الجلب..." : "جلب البيانات"));
    fetchBtn.addEventListener("click", fetchFromMaps);
    fetchWrap.appendChild(fetchBtn);
    step1Card.appendChild(fetchWrap);

    if (fetchError) {
      const errBox = document.createElement("div");
      errBox.style.cssText = "margin-top:8px;padding:8px 12px;border-radius:8px;background:#FEF2F2;color:#374151;font-size:12px;font-weight:600;display:flex;align-items:flex-start;gap:6px;line-height:1.7;";
      errBox.innerHTML = `<i class="ph ph-warning-circle" style="font-size:14px;flex-shrink:0;margin-top:1px;color:#DC2626;"></i>
        <span>تعذر قراءة الرابط. تأكد من نسخه من صفحة المركز في Google Maps. وفي حال استمرت المشكلة <a href="https://wa.me/962778244772" target="_blank" style="color:${P};font-weight:800;text-decoration:none;">تواصل معنا</a></span>`;
      step1Card.appendChild(errBox);
    }
    if (fetchDone) {
      const doneBox = document.createElement("div");
      doneBox.style.cssText = "margin-top:8px;padding:8px 12px;border-radius:8px;background:#F0FDF4;color:#16A34A;font-size:12px;font-weight:700;display:flex;align-items:center;gap:6px;";
      doneBox.innerHTML = `<i class="ph ph-check-circle" style="font-size:14px;"></i> تم جلب البيانات — يمكنك تعديل الاسم والعنوان`;
      step1Card.appendChild(doneBox);
    }

    const fieldsWrap = document.createElement("div");
    fieldsWrap.style.marginTop = "14px";
    
    fieldsWrap.appendChild(renderField("اسم المركز", name, (v) => { name = v; }, fetchDone ? "أدخل اسم المركز" : "الصق الرابط أولاً", !fetchDone));
    fieldsWrap.appendChild(renderField("العنوان", address, (v) => { address = v; }, fetchDone ? "المنطقة، الشارع..." : "الصق الرابط أولاً", !fetchDone));
    step1Card.appendChild(fieldsWrap);

    if (step === 1) {
      const nextBtn = document.createElement("button");
      nextBtn.style.cssText = `width:100%;padding:13px;margin-top:4px;background:${P};color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;`;
      nextBtn.innerHTML = `استمرار <i class="ph ph-arrow-left"></i>`;
      nextBtn.addEventListener("click", () => {
        if (!name.trim()) { alert("أدخل اسم المركز أولاً"); return; }
        step = 2;
        update();
      });
      step1Card.appendChild(nextBtn);
    }
    scrollArea.appendChild(step1Card);

    if (step === 2) {
      // Step 2: Full Details
      const contactCard = document.createElement("div");
      contactCard.style.cssText = "background:#fff;border-radius:14px;padding:16px;border:1.5px solid #F0F1F3;";
      contactCard.innerHTML = `<div style="font-size:12px;font-weight:800;color:${P};margin-bottom:10px;padding:4px 10px;background:${PL};border-radius:8px;display:inline-block;">معلومات التواصل</div>`;
      contactCard.appendChild(renderField("رقم الهاتف", phone, (v) => { phone = v; }, "07XXXXXXXX", false, "tel"));
      contactCard.appendChild(renderField("رقم الواتساب", samePhone ? phone : whatsapp, (v) => { if (!samePhone) whatsapp = v; }, "07XXXXXXXX", samePhone, "tel"));
      
      const samePhoneLabel = document.createElement("label");
      samePhoneLabel.style.cssText = "display:flex;align-items:center;gap:8px;margin-top:-6px;cursor:pointer;font-size:13px;font-weight:700;color:#374151;";
      const samePhoneCheck = document.createElement("input");
      samePhoneCheck.type = "checkbox";
      samePhoneCheck.checked = samePhone;
      samePhoneCheck.style.cssText = `width:16px;height:16px;accent-color:${P};`;
      samePhoneCheck.addEventListener("change", (e) => {
        samePhone = e.target.checked;
        if (samePhone) whatsapp = "";
        update();
      });
      samePhoneLabel.appendChild(samePhoneCheck);
      samePhoneLabel.appendChild(document.createTextNode("استخدام نفس رقم الهاتف"));
      contactCard.appendChild(samePhoneLabel);
      scrollArea.appendChild(contactCard);

      const locationCard = document.createElement("div");
      locationCard.style.cssText = "background:#fff;border-radius:14px;padding:16px;border:1.5px solid #F0F1F3;";
      locationCard.innerHTML = `<div style="font-size:12px;font-weight:800;color:${P};margin-bottom:10px;padding:4px 10px;background:${PL};border-radius:8px;display:inline-block;">الموقع</div>`;
      
      const govSelectWrap = document.createElement("div");
      govSelectWrap.style.marginBottom = "12px";
      govSelectWrap.innerHTML = `<label style="font-size:12px;font-weight:700;color:#374151;display:block;margin-bottom:6px;">المحافظة</label>`;
      const govSelect = document.createElement("select");
      govSelect.style.cssText = "width:100%;padding:11px 14px;border-radius:10px;border:1.5px solid #E5E7EB;background:#F9FAFB;font-size:14px;font-family:inherit;color:#374151;cursor:pointer;";
      govSelect.innerHTML = `<option value="">اختر المحافظة</option>`;
      const govList = Object.entries(state.govs).map(([id, g]) => ({ id, ...g })).sort((a, b) => a.name.localeCompare(b.name, "ar"));
      govList.forEach(g => {
        const opt = document.createElement("option");
        opt.value = g.id;
        opt.textContent = g.name;
        if (g.id === govId) opt.selected = true;
        govSelect.appendChild(opt);
      });
      govSelect.addEventListener("change", (e) => {
        govId = e.target.value;
        selectedAreaIds = [];
        update();
      });
      govSelectWrap.appendChild(govSelect);
      locationCard.appendChild(govSelectWrap);

      if (govId) {
        const areaWrap = document.createElement("div");
        areaWrap.innerHTML = `<label style="font-size:12px;font-weight:700;color:#374151;display:block;margin-bottom:8px;">المناطق المخدّمة</label>`;
        
        const chipList = document.createElement("div");
        chipList.style.cssText = "display:flex;gap:8px;overflow-x:auto;padding-bottom:6px;scrollbar-width:thin;scrollbar-color:#CBD5E1 transparent;";
        
        const allAreas = { ...state.areas, ...localAreas };
        const govAreas = Object.entries(allAreas)
          .filter(([, a]) => a.governorateId === govId)
          .map(([id, a]) => ({ id, ...a }))
          .sort((a, b) => a.name.localeCompare(b.name, "ar"));
        
        govAreas.forEach(a => {
          const selected = selectedAreaIds.includes(a.id);
          const btn = document.createElement("button");
          btn.style.cssText = `flex-shrink:0;padding:8px 14px;border-radius:12px;border:1.5px solid ${selected ? P : "#E5E7EB"};background:${selected ? PL : "#F9FAFB"};color:${selected ? P : "#475569"};font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:6px;transition:all 0.15s;white-space:nowrap;`;
          btn.innerHTML = `<i class="ph ${selected ? "ph-check-circle" : "ph-circle"}"></i> ${a.name}`;
          btn.addEventListener("click", () => {
            if (selected) selectedAreaIds = selectedAreaIds.filter(id => id !== a.id);
            else selectedAreaIds.push(a.id);
            update();
          });
          chipList.appendChild(btn);
        });

        const addChip = document.createElement("button");
        addChip.style.cssText = "flex-shrink:0;padding:8px 14px;border-radius:12px;border:1.5px dashed #9CA3AF;background:#F9FAFB;color:#6B7280;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:6px;white-space:nowrap;";
        addChip.innerHTML = `<i class="ph ph-plus-circle" style="color:${P};"></i> إضافة منطقة`;
        addChip.addEventListener("click", () => { showAddArea = true; update(); });
        chipList.appendChild(addChip);
        
        areaWrap.appendChild(chipList);
        locationCard.appendChild(areaWrap);
      }
      scrollArea.appendChild(locationCard);

      // Schedule table
      const scheduleCard = document.createElement("div");
      scheduleCard.style.cssText = "background:#fff;border-radius:14px;padding:16px;border:1.5px solid #F0F1F3;";
      scheduleCard.innerHTML = `<div style="font-size:12px;font-weight:800;color:${P};margin-bottom:10px;padding:4px 10px;background:${PL};border-radius:8px;display:inline-block;">أوقات الدوام</div>`;
      
      const tableWrap = document.createElement("div");
      tableWrap.style.overflowX = "auto";
      const table = document.createElement("table");
      table.style.cssText = "width:100%;border-collapse:collapse;font-size:13px;";
      table.innerHTML = `
        <thead>
          <tr style="border-bottom:2px solid #F0F1F3;">
            <th style="text-align:right;padding:6px 4px;font-weight:700;color:#6B7280;font-size:11px;">اليوم</th>
            <th style="text-align:center;padding:6px 4px;font-weight:700;color:#6B7280;font-size:11px;">من</th>
            <th style="text-align:center;padding:6px 4px;font-weight:700;color:#6B7280;font-size:11px;">إلى</th>
            <th style="text-align:center;padding:6px 4px;font-weight:700;color:#DC2626;font-size:11px;">مغلق</th>
          </tr>
        </thead>
      `;
      const tbody = document.createElement("tbody");
      DAYS_FULL.forEach((day, i) => {
        const s = schedule[i];
        const tr = document.createElement("tr");
        tr.style.cssText = `border-bottom:1px solid #F9FAFB;background:${s.closed ? "#FFFBFB" : "#fff"};`;
        tr.innerHTML = `
          <td style="padding:8px 4px;font-weight:700;color:${s.closed ? "#9CA3AF" : "#111827"};">
            <span style="display:inline-flex;align-items:center;gap:4px;">
              <span style="width:24px;height:24px;border-radius:6px;font-size:11px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;background:${s.closed ? "#F3F4F6" : PL};color:${s.closed ? "#9CA3AF" : P};">${DAYS_SHORT[i]}</span>
              <span style="font-size:12px;">${day}</span>
            </span>
          </td>
        `;
        
        const fromTd = document.createElement("td");
        fromTd.style.cssText = "padding:8px 4px;text-align:center;";
        const fromInp = document.createElement("input");
        fromInp.type = "time";
        fromInp.value = s.from;
        fromInp.disabled = s.closed;
        fromInp.style.cssText = "padding:5px 6px;border-radius:8px;font-size:12px;border:1.5px solid #E5E7EB;font-family:inherit;background:#F9FAFB;width:80px;";
        fromInp.addEventListener("change", (e) => { schedule[i].from = e.target.value; });
        fromTd.appendChild(fromInp);
        tr.appendChild(fromTd);

        const toTd = document.createElement("td");
        toTd.style.cssText = "padding:8px 4px;text-align:center;";
        const toInp = document.createElement("input");
        toInp.type = "time";
        toInp.value = s.to;
        toInp.disabled = s.closed;
        toInp.style.cssText = "padding:5px 6px;border-radius:8px;font-size:12px;border:1.5px solid #E5E7EB;font-family:inherit;background:#F9FAFB;width:80px;";
        toInp.addEventListener("change", (e) => { schedule[i].to = e.target.value; });
        toTd.appendChild(toInp);
        tr.appendChild(toTd);

        const closedTd = document.createElement("td");
        closedTd.style.cssText = "padding:8px 4px;text-align:center;";
        const closedCheck = document.createElement("input");
        closedCheck.type = "checkbox";
        closedCheck.checked = s.closed;
        closedCheck.style.cssText = "width:18px;height:18px;accent-color:#DC2626;";
        closedCheck.addEventListener("change", (e) => { schedule[i].closed = e.target.checked; update(); });
        closedTd.appendChild(closedCheck);
        tr.appendChild(closedTd);

        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      tableWrap.appendChild(table);
      scheduleCard.appendChild(tableWrap);
      scrollArea.appendChild(scheduleCard);

      // Additional info
      const extraCard = document.createElement("div");
      extraCard.style.cssText = "background:#fff;border-radius:14px;padding:16px;border:1.5px solid #F0F1F3;";
      extraCard.innerHTML = `<div style="font-size:12px;font-weight:800;color:${P};margin-bottom:10px;padding:4px 10px;background:${PL};border-radius:8px;display:inline-block;">بيانات إضافية</div>`;
      extraCard.appendChild(renderField("التقييم الحالي (من 5)", rating, (v) => { rating = v; }, "مثلاً: 4.5", false, "number", "0", "5", "0.1"));
      extraCard.appendChild(renderField("عدد التقييمات", reviewCount, (v) => { reviewCount = v; }, "مثلاً: 120", false, "number"));
      extraCard.appendChild(renderField("رابط شعار المركز (URL)", imageUrl, (v) => { imageUrl = v; }, "https://...", false, "url"));
      
      const descWrap = document.createElement("div");
      descWrap.style.marginBottom = "14px";
      descWrap.innerHTML = `<label style="font-size:12px;font-weight:700;color:#374151;display:block;margin-bottom:6px;">وصف المركز</label>`;
      const descArea = document.createElement("textarea");
      descArea.className = "join-field";
      descArea.placeholder = "نبذة عن المركز والخدمات المقدمة...";
      descArea.rows = 3;
      descArea.value = description;
      descArea.style.cssText = "width:100%;padding:11px 14px;border-radius:10px;border:1.5px solid #E5E7EB;background:#F9FAFB;font-size:14px;font-family:inherit;color:#374151;outline:none;resize:vertical;";
      descArea.addEventListener("input", (e) => { description = e.target.value; });
      descWrap.appendChild(descArea);
      extraCard.appendChild(descWrap);
      scrollArea.appendChild(extraCard);

      const submitBtn = document.createElement("button");
      submitBtn.disabled = sending;
      submitBtn.style.cssText = `width:100%;padding:14px;border-radius:14px;background:${P};color:#fff;font-size:15px;font-weight:800;border:none;cursor:pointer;font-family:inherit;margin-top:10px;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 4px 12px ${P}44;`;
      submitBtn.innerHTML = sending ? 
        `<div style="width:20px;height:20px;border:3px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite;"></div> جارٍ الإرسال...` : 
        `<i class="ph ph-check-circle" style="font-size:20px;"></i> تقديم الطلب`;
      submitBtn.addEventListener("click", submit);
      scrollArea.appendChild(submitBtn);
    }

    if (showAddArea) {
      const modalOverlay = document.createElement("div");
      modalOverlay.style.cssText = "position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;padding:16px;";
      
      const modal = document.createElement("div");
      modal.style.cssText = "background:#fff;border-radius:20px;padding:24px;width:100%;max-width:360px;box-shadow:0 20px 40px rgba(0,0,0,0.2);animation:fadeUp 0.2s ease-out;";
      modal.innerHTML = `
        <div style="font-size:18px;font-weight:900;color:#111827;margin-bottom:6px;">إضافة منطقة جديدة</div>
        <div style="font-size:13px;color:#6B7280;margin-bottom:20px;">أدخل اسم المنطقة الجديدة لإضافتها لقاعدة البيانات</div>
      `;
      
      const areaInp = document.createElement("input");
      areaInp.className = "join-field";
      areaInp.placeholder = "اسم المنطقة (مثلاً: طبربور)";
      areaInp.value = newAreaName;
      areaInp.style.cssText = "width:100%;padding:12px 14px;border-radius:12px;border:1.5px solid #E5E7EB;background:#F9FAFB;font-size:14px;font-family:inherit;color:#111827;outline:none;margin-bottom:12px;";
      areaInp.addEventListener("input", (e) => { newAreaName = e.target.value; });
      modal.appendChild(areaInp);

      if (areaError) {
        const areaErr = document.createElement("div");
        areaErr.style.cssText = "margin-bottom:12px;color:#DC2626;font-size:12px;font-weight:700;";
        areaErr.textContent = areaError;
        modal.appendChild(areaErr);
      }

      const modalBtns = document.createElement("div");
      modalBtns.style.cssText = "display:flex;gap:10px;";
      
      const cancelBtn = document.createElement("button");
      cancelBtn.style.cssText = "flex:1;padding:12px;border-radius:12px;border:1.5px solid #E5E7EB;background:#fff;color:#6B7280;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;";
      cancelBtn.textContent = "إلغاء";
      cancelBtn.addEventListener("click", () => { showAddArea = false; areaError = ""; newAreaName = ""; update(); });
      modalBtns.appendChild(cancelBtn);

      const saveBtn = document.createElement("button");
      saveBtn.disabled = savingArea;
      saveBtn.style.cssText = `flex:1;padding:12px;border-radius:12px;border:none;background:${P};color:#fff;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;`;
      saveBtn.textContent = savingArea ? "جارٍ الحفظ..." : "حفظ";
      saveBtn.addEventListener("click", saveNewArea);
      modalBtns.appendChild(saveBtn);
      
      modal.appendChild(modalBtns);
      modalOverlay.appendChild(modal);
      shell.appendChild(modalOverlay);
      setTimeout(() => areaInp.focus(), 50);
    }
  }

  function renderField(label, value, onChange, placeholder, readOnly = false, type = "text", min, max, step) {
    const wrap = document.createElement("div");
    wrap.style.marginBottom = "14px";
    wrap.innerHTML = `<label style="font-size:12px;font-weight:700;color:#374151;display:block;margin-bottom:6px;">${label}</label>`;
    const inp = document.createElement("input");
    inp.type = type;
    if (min) inp.min = min;
    if (max) inp.max = max;
    if (step) inp.step = step;
    inp.value = value;
    inp.readOnly = readOnly;
    inp.placeholder = placeholder;
    inp.className = "join-field";
    inp.style.cssText = `width:100%;padding:11px 14px;border-radius:10px;border:1.5px solid #E5E7EB;background:${readOnly ? "#F3F4F6" : "#F9FAFB"};font-size:14px;font-family:inherit;color:#374151;outline:none;box-sizing:border-box;cursor:${readOnly ? "default" : "text"};`;
    inp.addEventListener("input", (e) => onChange(e.target.value));
    wrap.appendChild(inp);
    return wrap;
  }

  async function fetchFromMaps() {
    const url = mapLink.trim();
    if (!url) return;
    fetching = true;
    fetchError = "";
    fetchDone = false;
    update();
    try {
      const res = await fetch("/api/places/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) { fetchError = "fetch"; }
      else {
        if (data.name) name = data.name;
        if (data.address) address = data.address;
        fetchDone = true;
      }
    } catch {
      fetchError = "fetch";
    } finally {
      fetching = false;
      update();
    }
  }

  async function saveNewArea() {
    if (!newAreaName.trim()) { areaError = "أدخل اسم المنطقة"; update(); return; }
    if (!govId) { areaError = "اختر المحافظة أولاً"; update(); return; }
    savingArea = true;
    areaError = "";
    update();
    try {
      const ref = db.ref("areas").push();
      await ref.set({
        name: newAreaName.trim(),
        governorateId: govId,
      });
      const id = ref.key;
      localAreas[id] = { id, name: newAreaName.trim(), governorateId: govId };
      selectedAreaIds.push(id);
      newAreaName = "";
      showAddArea = false;
    } catch {
      areaError = "حدث خطأ أثناء الحفظ";
    } finally {
      savingArea = false;
      update();
    }
  }

  async function submit() {
    if (!name.trim()) { alert("أدخل اسم المركز"); return; }
    if (!phone.trim()) { alert("أدخل رقم الهاتف"); return; }
    if (!govId) { alert("اختر المحافظة"); return; }
    if (selectedAreaIds.length === 0) { alert("اختر منطقة واحدة على الأقل"); return; }

    const workingDays = DAYS_FULL.filter((_, i) => !schedule[i].closed);
    if (workingDays.length === 0) { alert("حدد يوم دوام واحد على الأقل"); return; }

    const firstOpen = schedule.find(d => !d.closed);
    const workingHours = firstOpen ? `${firstOpen.from} – ${firstOpen.to}` : "";
    const allAreas = { ...state.areas, ...localAreas };
    const areaObjs = selectedAreaIds.map(id => ({ id, name: allAreas[id]?.name || "" }));

    sending = true;
    update();
    try {
      await db.ref("centerRequests").push({
        name: name.trim(),
        address: address.trim() || null,
        phone: phone.trim(),
        whatsapp: samePhone ? phone.trim() : (whatsapp.trim() || null),
        governorateId: govId,
        areas: areaObjs,
        mapLink: mapLink.trim() || null,
        rating: parseFloat(rating) || 0,
        reviewCount: parseInt(reviewCount) || 0,
        imageUrl: imageUrl.trim() || null,
        description: description.trim() || null,
        workingHours,
        workingDays,
        schedule,
        submittedAt: new Date().toISOString(),
        status: "pending",
      });
      sent = true;
    } catch {
      alert("حدث خطأ أثناء الإرسال. حاول مجدداً.");
    } finally {
      sending = false;
      update();
    }
  }

  // Pre-fetch govs/areas if empty
  if (Object.keys(state.govs).length === 0) {
    showLoading("جارٍ التحميل...");
    Promise.all([
      db.ref("governorates").once("value"),
      db.ref("areas").once("value"),
    ]).then(([gSnap, aSnap]) => {
      state.govs = gSnap.val() || {};
      state.areas = aSnap.val() || {};
      hideLoading();
      update();
    }).catch(() => hideLoading());
  }

  update();
}
