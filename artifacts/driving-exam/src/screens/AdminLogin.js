import { auth } from "../lib/firebase.js";
import { handleAdminLogin } from "../app.js";

export function render(container, ctx) {
  let email = "";
  let password = "";
  let error = "";
  let loading = false;

  function update() {
    container.innerHTML = "";
    const el = document.createElement("div");
    el.style.cssText = "display:flex;flex-direction:column;min-height:100dvh;background:#F6F8FB;direction:rtl;";

    const center = document.createElement("div");
    center.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;padding:24px;";
    el.appendChild(center);

    center.innerHTML = `
      <div style="width:64px;height:64px;border-radius:16px;background:#246BFD;display:flex;align-items:center;justify-content:center;margin-bottom:20px;">
        <i class="ph ph-shield-check" style="font-size:32px;color:#fff;"></i>
      </div>
      <h1 style="font-size:22px;font-weight:900;margin-bottom:6px;color:#1A1D1F;">لوحة التحكم</h1>
      <p style="font-size:14px;color:#6B7280;margin-bottom:28px;">تسجيل الدخول للمشرف</p>
    `;

    const form = document.createElement("form");
    form.style.cssText = "width:100%;max-width:320px;";
    
    const emailInp = document.createElement("input");
    emailInp.type = "email";
    emailInp.value = email;
    emailInp.placeholder = "البريد الإلكتروني";
    emailInp.className = "admin-field";
    emailInp.style.cssText = "width:100%;padding:14px 16px;border:1.5px solid #E8EAED;border-radius:14px;font-size:15px;font-family:inherit;margin-bottom:14px;outline:none;direction:rtl;background:#fff;color:#1A1D1F;transition:border-color .15s, box-shadow .15s;";
    emailInp.oninput = (e) => { email = e.target.value; };
    form.appendChild(emailInp);

    const passInp = document.createElement("input");
    passInp.type = "password";
    passInp.value = password;
    passInp.placeholder = "كلمة المرور";
    passInp.className = "admin-field";
    passInp.style.cssText = "width:100%;padding:14px 16px;border:1.5px solid #E8EAED;border-radius:14px;font-size:15px;font-family:inherit;margin-bottom:14px;outline:none;direction:rtl;background:#fff;color:#1A1D1F;transition:border-color .15s, box-shadow .15s;";
    passInp.oninput = (e) => { password = e.target.value; };
    form.appendChild(passInp);

    if (error) {
      const errEl = document.createElement("p");
      errEl.style.cssText = "color:#DC2626;font-size:13px;margin-bottom:14px;font-weight:700;";
      errEl.textContent = error;
      form.appendChild(errEl);
    }

    const btn = document.createElement("button");
    btn.type = "submit";
    btn.disabled = loading;
    btn.style.cssText = `width:100%;padding:14px;border-radius:14px;border:none;background:#246BFD;color:#fff;font-size:15px;font-weight:800;cursor:${loading ? "not-allowed" : "pointer"};opacity:${loading ? "0.6" : "1"};font-family:inherit;transition:all .15s;`;
    btn.textContent = loading ? "جارٍ التحقق..." : "دخول";
    form.appendChild(btn);

    form.onsubmit = async (e) => {
      e.preventDefault();
      if (!email.trim() || !password.trim()) {
        error = "أدخل البريد وكلمة المرور";
        update();
        return;
      }
      loading = true;
      error = "";
      update();
      try {
        await auth.signInWithEmailAndPassword(email.trim(), password.trim());
        handleAdminLogin();
      } catch (err) {
        error = err.code === "auth/user-not-found" || err.code === "auth/wrong-password"
          ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
          : err.code === "auth/invalid-email"
          ? "بريد إلكتروني غير صالح"
          : "خطأ في تسجيل الدخول";
        loading = false;
        update();
      }
    };

    center.appendChild(form);
    container.appendChild(el);
  }

  update();
}
