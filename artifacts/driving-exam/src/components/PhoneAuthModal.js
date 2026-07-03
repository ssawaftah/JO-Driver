import firebase, { auth, db } from "../lib/firebase";
import { saveSession } from "../state";

/**
 * renderPhoneAuthModal({ open, onClose, onSuccess, showAnonymous, title, subtitle })
 * Returns a DOM node. Since this is re-created each time overlays.js re-renders,
 * internal state lives in closure variables scoped to this call.
 */
export function renderPhoneAuthModal({ open, onClose, onSuccess, showAnonymous = false, title, subtitle }) {
  if (!open) {
    const empty = document.createElement("div");
    return empty;
  }

  let step = "login"; // login | checking | details | success
  let err = "";
  let saving = false;
  let anonymous = false;
  let name = "";
  let googleUser = null;
  let savingTimer = null;

  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:fixed;inset:0;z-index:100;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;padding:16px;direction:rtl;";
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) onClose();
  });

  const card = document.createElement("div");
  card.style.cssText =
    "background:#fff;border-radius:20px;padding:24px;width:100%;max-width:400px;box-shadow:0 20px 60px rgba(0,0,0,0.25);animation:fadeUp 0.22s ease;animation-fill-mode:both;";
  card.addEventListener("click", (e) => e.stopPropagation());
  overlay.appendChild(card);

  function render() {
    card.innerHTML = "";

    const header = document.createElement("div");
    header.style.cssText = "text-align:center;margin-bottom:20px;";
    header.innerHTML = `
      <div style="width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#246BFD,#4f86ff);color:#fff;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 12px;">
        <i class="ph ph-shield-check"></i>
      </div>
      <h2 style="font-size:18px;font-weight:900;color:#111827;margin-bottom:4px;">${escapeHtml(title || "تسجيل الدخول")}</h2>
      <p style="font-size:13px;color:#6B7280;">${escapeHtml(subtitle || "سجّل بواسطة Google للمتابعة")}</p>
    `;
    card.appendChild(header);

    if (step === "success") {
      const box = document.createElement("div");
      box.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:16px;padding:20px 0;";
      box.innerHTML = `
        <div style="width:56px;height:56px;border-radius:50%;background:#22C55E;color:#fff;display:flex;align-items:center;justify-content:center;font-size:28px;animation:popIn 0.35s cubic-bezier(0.175,0.885,0.32,1.275);">
          <i class="ph ph-check"></i>
        </div>
        <p style="font-size:16px;font-weight:900;color:#111827;">تم تسجيل الدخول بنجاح</p>
        <p style="font-size:13px;color:#6B7280;">جارٍ الانتقال...</p>
        <div style="width:28px;height:28px;border-radius:50%;border:3px solid #E5E7EB;border-top-color:#246BFD;animation:spin 0.8s linear infinite;"></div>
      `;
      card.appendChild(box);
    } else if (step === "checking") {
      const box = document.createElement("div");
      box.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:16px;padding:20px 0;";
      box.innerHTML = `
        <div style="width:48px;height:48px;border-radius:50%;border:3px solid #E5E7EB;border-top-color:#246BFD;animation:spin 0.8s linear infinite;"></div>
        <p style="font-size:15px;font-weight:700;color:#374151;">جارٍ التحقق من البيانات...</p>
        <p style="font-size:12px;color:#6B7280;">تم تسجيل الدخول بواسطة Google</p>
      `;
      card.appendChild(box);
    } else if (step === "login") {
      const wrap = document.createElement("div");
      wrap.style.cssText = "display:flex;flex-direction:column;gap:14px;";

      const googleBtn = document.createElement("button");
      googleBtn.type = "button";
      googleBtn.disabled = saving;
      googleBtn.style.cssText = `width:100%;height:52px;border-radius:14px;border:1.5px solid #E5E7EB;background:#fff;color:#374151;font-size:15px;font-weight:700;cursor:${saving ? "not-allowed" : "pointer"};font-family:inherit;display:flex;align-items:center;justify-content:center;gap:10px;`;
      googleBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span>${saving ? "جارٍ التسجيل..." : "سجّل بواسطة Google"}</span>
      `;
      googleBtn.addEventListener("click", signInWithGoogle);
      wrap.appendChild(googleBtn);

      if (showAnonymous) {
        const divider = document.createElement("div");
        divider.style.cssText = "display:flex;align-items:center;gap:10px;color:#9CA3AF;";
        divider.innerHTML = `<div style="flex:1;height:1px;background:#E5E7EB;"></div><span style="font-size:12px;font-weight:700;">أو</span><div style="flex:1;height:1px;background:#E5E7EB;"></div>`;
        wrap.appendChild(divider);

        const label = document.createElement("label");
        label.style.cssText = "display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;color:#6B7280;";
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = anonymous;
        cb.style.cssText = "width:18px;height:18px;accent-color:#246BFD;";
        cb.addEventListener("change", (e) => {
          anonymous = e.target.checked;
          render();
        });
        label.appendChild(cb);
        label.appendChild(document.createTextNode("التعليق كمجهول (بدون تسجيل)"));
        wrap.appendChild(label);

        const anonBtn = document.createElement("button");
        anonBtn.type = "button";
        anonBtn.disabled = !anonymous || saving;
        anonBtn.style.cssText = `width:100%;height:48px;border-radius:14px;border:1.5px solid #E5E7EB;background:${anonymous ? "#F9FAFB" : "#fff"};color:${anonymous ? "#374151" : "#9CA3AF"};font-size:15px;font-weight:700;cursor:${anonymous ? "pointer" : "not-allowed"};font-family:inherit;`;
        anonBtn.innerHTML = `<i class="ph ph-user-circle" style="font-size:18px;margin-left:6px;"></i>نشر كمجهول`;
        anonBtn.addEventListener("click", handleAnonymous);
        wrap.appendChild(anonBtn);
      }

      if (err) wrap.appendChild(errBox(err));

      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.style.cssText = "width:100%;height:48px;border-radius:14px;border:1.5px solid #E5E7EB;background:#fff;color:#6B7280;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;";
      cancelBtn.textContent = "إلغاء";
      cancelBtn.addEventListener("click", onClose);
      wrap.appendChild(cancelBtn);

      card.appendChild(wrap);
    } else {
      const form = document.createElement("form");
      form.style.cssText = "display:flex;flex-direction:column;gap:14px;";

      const notice = document.createElement("div");
      notice.style.cssText = "background:#F3F6FF;border-radius:12px;padding:12px 14px;font-size:13px;color:#246BFD;font-weight:700;text-align:center;";
      notice.innerHTML = `<i class="ph ph-check-circle" style="margin-left:6px;"></i>تم تسجيل الدخول بواسطة Google`;
      form.appendChild(notice);

      const nameField = document.createElement("div");
      nameField.innerHTML = `<label style="font-size:12px;font-weight:700;margin-bottom:6px;display:block;color:#374151;">الاسم الكامل *</label>`;
      const nameInput = document.createElement("input");
      nameInput.className = "inp";
      nameInput.type = "text";
      nameInput.placeholder = "أدخل اسمك";
      nameInput.value = name;
      nameInput.addEventListener("input", (e) => {
        name = e.target.value;
      });
      nameField.appendChild(nameInput);
      form.appendChild(nameField);

      const phoneField = document.createElement("div");
      phoneField.innerHTML = `<label style="font-size:12px;font-weight:700;margin-bottom:6px;display:block;color:#374151;">رقم الهاتف *</label>`;
      const phoneInput = document.createElement("input");
      phoneInput.className = "inp";
      phoneInput.type = "tel";
      phoneInput.placeholder = "07xxxxxxxx";
      phoneInput.style.cssText = "direction:ltr;text-align:right;";
      phoneField.appendChild(phoneInput);
      form.appendChild(phoneField);

      if (err) form.appendChild(errBox(err));

      const submitBtn = document.createElement("button");
      submitBtn.type = "submit";
      submitBtn.className = "btn-primary";
      submitBtn.disabled = saving;
      submitBtn.style.marginTop = "2px";
      submitBtn.innerHTML = `<i class="ph ph-check" style="font-size:18px;"></i>${saving ? "جارٍ الحفظ..." : "حفظ والمتابعة"}`;
      form.appendChild(submitBtn);

      const backBtn = document.createElement("button");
      backBtn.type = "button";
      backBtn.style.cssText = "width:100%;height:48px;border-radius:14px;border:1.5px solid #E5E7EB;background:#fff;color:#6B7280;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;";
      backBtn.innerHTML = `<i class="ph ph-arrow-right"></i> العودة`;
      backBtn.addEventListener("click", () => {
        step = "login";
        render();
      });
      form.appendChild(backBtn);

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        saveDetails(nameInput.value, phoneInput.value);
      });

      card.appendChild(form);
    }
  }

  function errBox(message) {
    const box = document.createElement("div");
    box.style.cssText = "background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:10px 14px;color:#DC2626;font-size:12px;font-weight:700;display:flex;align-items:center;gap:8px;";
    box.innerHTML = `<i class="ph ph-warning-circle" style="font-size:16px;flex-shrink:0;"></i><span></span>`;
    box.querySelector("span").textContent = message;
    return box;
  }

  async function signInWithGoogle() {
    err = "";
    saving = true;
    render();
    savingTimer = setTimeout(() => {
      saving = false;
      savingTimer = null;
      render();
    }, 10000);

    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope("email");
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await auth.signInWithPopup(provider);
      const user = result.user;
      if (!user) throw new Error("فشل تسجيل الدخول");

      step = "checking";
      render();

      const usersSnap = await db.ref("users").once("value");
      const users = usersSnap.val() || {};
      let existingKey = null;
      let existingName = null;

      for (const [key, userData] of Object.entries(users)) {
        if (userData.firebaseUid === user.uid) {
          existingKey = key;
          existingName = userData.name;
          break;
        }
      }

      if (existingKey) {
        await db.ref("users/" + existingKey).update({ email: user.email || "", photoURL: user.photoURL || "" });
        saveSession(existingName || user.displayName || "مستخدم", existingKey);
        saving = false;
        step = "success";
        render();
        setTimeout(() => onSuccess(existingName || user.displayName || "مستخدم", existingKey), 1500);
      } else {
        googleUser = user;
        name = user.displayName || "";
        saving = false;
        step = "details";
        render();
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      let userMsg = "فشل تسجيل الدخول بواسطة Google. حاول مجدداً.";
      const code = error?.code || "";
      if (code.includes("popup-closed-by-user")) userMsg = "تم إغلاق نافذة Google قبل إتمام التسجيل.";
      else if (code.includes("popup-blocked")) userMsg = "تم حظر النافذة المنبثقة. تأكد من السماح بالنوافذ المنبثقة في المتصفح أو أغلق مانع الإعلانات.";
      else if (code.includes("account-exists-with-different-credential")) userMsg = "هذا البريد مسجل بطريقة أخرى.";
      else if (code.includes("unauthorized-domain")) userMsg = "هذا النطاق غير مصرح له. أضفه إلى Firebase Console > Auth > Settings > Authorized domains.";
      else if (code.includes("operation-not-allowed")) userMsg = "تسجيل الدخول بواسطة Google غير مفعل. اذهب إلى Authentication > Sign-in method وفعّل 'Google'.";
      else if (error?.message) userMsg = error.message;
      err = userMsg;
      render();
    } finally {
      if (savingTimer) {
        clearTimeout(savingTimer);
        savingTimer = null;
      }
      saving = false;
      render();
    }
  }

  async function saveDetails(nameVal, phoneVal) {
    err = "";
    const n = (nameVal || "").trim();
    const p = (phoneVal || "").trim();
    if (!n) {
      err = "الرجاء إدخال الاسم";
      render();
      return;
    }
    if (p.length < 10) {
      err = "الرجاء إدخال رقم هاتف صالح (عشر أرقام)";
      render();
      return;
    }

    saving = true;
    render();
    try {
      const user = googleUser;
      if (!user) {
        err = "انتهت الجلسة، أعد تسجيل الدخول";
        saving = false;
        render();
        return;
      }

      const key = "u_" + user.uid;
      await db.ref("users/" + key).set({
        name: n,
        phone: p,
        email: user.email || "",
        photoURL: user.photoURL || "",
        registeredAt: new Date().toISOString(),
        firebaseUid: user.uid,
      });
      saveSession(n, key);
      saving = false;
      step = "success";
      render();
      setTimeout(() => onSuccess(n, key), 1500);
    } catch (error) {
      err = error?.message || "حدث خطأ أثناء الحفظ";
      saving = false;
      render();
    }
  }

  function handleAnonymous() {
    const anonKey = "anon_" + Date.now();
    saveSession("مجهول", anonKey);
    onSuccess("مجهول", anonKey);
  }

  render();
  return overlay;
}

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}
