import "./index.css";
import { init as initRouter, registerRoute, navigate } from "./router";
import { mountOverlays, setRegSuccessHandler } from "./overlays";
import { setNavigate, initApp, handleRegistered } from "./app";
import { state } from "./state";
import { renderHeader } from "./components/Header";
import { renderFooter } from "./components/Footer";
import { renderSideDrawer } from "./components/SideDrawer";

import { render as renderHome } from "./screens/Home";
import { render as renderCenters } from "./screens/Centers";
import { render as renderCentersJoin } from "./screens/CentersJoin";
import { render as renderCenterDetail } from "./screens/CenterDetail";
import { render as renderCategories } from "./screens/Categories";
import { render as renderStudy } from "./screens/Study";
import { render as renderTest } from "./screens/Test";
import { render as renderResult } from "./screens/Result";
import { render as renderExamRules } from "./screens/ExamRules";
import { render as renderExam } from "./screens/Exam";
import { render as renderExamResult } from "./screens/ExamResult";
import { render as renderGuide } from "./screens/Faq";
import { render as renderReviews } from "./screens/Reviews";
import { render as renderAdminLogin } from "./screens/AdminLogin";
import { render as renderAdmin } from "./screens/Admin";

setNavigate(navigate);

const NO_CHROME_PATHS = new Set([]); // reserved if any screen needs to hide header/footer entirely

function withChrome(screenRender, { showHeader = true } = {}) {
  return (container, ctx) => {
    let cleanup;
    let drawerHost = null;

    if (showHeader) {
      const headerEl = renderHeader({
        navigate: ctx.navigate,
        onMenuOpen: () => {
          if (drawerHost) drawerHost.remove();
          drawerHost = renderSideDrawer({
            navigate: ctx.navigate,
            onClose: () => {
              if (drawerHost) {
                drawerHost.remove();
                drawerHost = null;
              }
            },
          });
          container.appendChild(drawerHost);
        },
      });
      container.appendChild(headerEl);
    }

    const body = document.createElement("div");
    body.className = "screen-body";
    container.appendChild(body);

    cleanup = screenRender(body, ctx);

    const footerEl = renderFooter({ path: ctx.path });
    if (footerEl) body.appendChild(footerEl);

    return () => {
      if (drawerHost) drawerHost.remove();
      if (typeof cleanup === "function") cleanup();
    };
  };
}

registerRoute("/", withChrome(renderHome));
registerRoute("/centers", withChrome(renderCenters));
registerRoute("/centers/join", withChrome(renderCentersJoin));
registerRoute("/centers/:id", withChrome(renderCenterDetail));
registerRoute("/categories", withChrome(renderCategories));
registerRoute("/study/:id", withChrome(renderStudy));
registerRoute("/test/:id", withChrome(renderTest));
registerRoute("/result", withChrome(renderResult));
registerRoute("/exam-rules", withChrome(renderExamRules));
registerRoute("/exam", withChrome(renderExam));
registerRoute("/exam-result", withChrome(renderExamResult));
registerRoute("/guide", withChrome(renderGuide));
registerRoute("/reviews", withChrome(renderReviews));
registerRoute("/admin-login", withChrome(renderAdminLogin));
registerRoute(
  "/admin",
  withChrome((container, ctx) =>
    state.adminLoggedIn ? renderAdmin(container, ctx) : renderAdminLogin(container, ctx)
  )
);

async function bootstrap() {
  const appRoot = document.getElementById("root");
  const shell = document.createElement("div");
  shell.className = "shell";
  appRoot.appendChild(shell);

  const routerRoot = document.createElement("div");
  routerRoot.style.cssText = "flex:1;display:flex;flex-direction:column;";
  shell.appendChild(routerRoot);

  initRouter(routerRoot);
  mountOverlays(shell);
  setRegSuccessHandler(handleRegistered);

  await initApp();
  // Re-render current route now that initial data may have loaded/hash-redirected.
  navigate(window.location.pathname, { replace: true });
}

bootstrap();
