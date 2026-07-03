import { state } from "./state";
import { renderLoading } from "./components/Loading";
import { renderPhoneAuthModal } from "./components/PhoneAuthModal";

let loadingHost = null;
let regHost = null;
let onRegSuccess = null;

export function mountOverlays(root) {
  loadingHost = document.createElement("div");
  loadingHost.id = "loading-host";
  regHost = document.createElement("div");
  regHost.id = "reg-modal-host";
  root.appendChild(loadingHost);
  root.appendChild(regHost);
  renderLoadingOverlay();
  renderRegOverlay();
}

function renderLoadingOverlay() {
  if (!loadingHost) return;
  loadingHost.innerHTML = "";
  if (state.loading) {
    loadingHost.appendChild(renderLoading(state.loadMsg));
  }
}

export function showLoading(msg) {
  state.loadMsg = msg;
  state.loading = true;
  renderLoadingOverlay();
}

export function hideLoading() {
  state.loading = false;
  renderLoadingOverlay();
}

function renderRegOverlay() {
  if (!regHost) return;
  regHost.innerHTML = "";
  if (state.showReg) {
    regHost.appendChild(
      renderPhoneAuthModal({
        open: true,
        onClose: closeRegModal,
        onSuccess: (name, key) => {
          if (onRegSuccess) onRegSuccess(name, key);
        },
        title: "سجّل بياناتك",
        subtitle: "أدخل اسمك ورقم هاتفك لبدء الامتحان",
      })
    );
  }
}

export function openRegModal() {
  state.showReg = true;
  renderRegOverlay();
}

export function closeRegModal() {
  state.showReg = false;
  renderRegOverlay();
}

export function setRegSuccessHandler(fn) {
  onRegSuccess = fn;
}
