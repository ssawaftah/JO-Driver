import { db } from "../lib/firebase";

const DEFAULT_ABOUT = "منصة JO Driver هي دليلك الأول لاجتياز امتحان القيادة النظري في الأردن.";

const DEFAULT_SPONSORS = [
  { name: "كن راعي رسمي لـ JO Driver", link: "https://wa.me/9620778244772?text=" },
  { name: "كن راعي رسمي لـ JO Driver", link: "https://wa.me/9620778244772?text=" },
  { name: "كن راعي رسمي لـ JO Driver", link: "https://wa.me/9620778244772?text=" },
];

const HIDE_FOOTER_PATHS = ["/exam", "/test", "/study"];
function shouldShowFooter(path) {
  return !HIDE_FOOTER_PATHS.some((p) => path.startsWith(p));
}

const SOCIAL_SVGS = {
  facebook: {
    label: "Facebook",
    color: "#1877F2",
    svg: `<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />`,
  },
  whatsapp: {
    label: "WhatsApp",
    color: "#25D366",
    svg: `<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />`,
  },
  instagram: {
    label: "Instagram",
    color: "#E4405F",
    svg: `<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.85-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />`,
  },
  x: {
    label: "X",
    color: "#0f172a",
    svg: `<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />`,
  },
};

function sectionTitle(text) {
  const div = document.createElement("div");
  div.style.cssText = "display:flex;align-items:center;gap:10px;margin-bottom:14px;";
  div.innerHTML = `
    <div style="font-size:12px;font-weight:800;color:#374151;white-space:nowrap;">${text}</div>
    <div style="flex:1;height:1px;background:#E8EAED;border-radius:1px;"></div>
  `;
  return div;
}

/**
 * renderFooter({ path, navigate }) -> DOM node or null if hidden on this path
 */
export function renderFooter({ path }) {
  if (!shouldShowFooter(path)) return null;

  const footer = document.createElement("footer");
  footer.style.cssText = "direction:rtl;color:#6B7280;padding:32px 16px 20px;border-top:1px solid #E8EAED;background:transparent;";

  const brand = document.createElement("div");
  brand.style.cssText = "display:flex;flex-direction:column;align-items:center;margin-bottom:28px;text-align:center;";
  brand.innerHTML = `
    <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#246BFD,#4f86ff);display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff;margin-bottom:10px;">
      <i class="ph ph-steering-wheel"></i>
    </div>
    <div style="font-size:18px;font-weight:900;color:#111827;margin-bottom:4px;">JO Driver</div>
    <p class="about-text" style="font-size:12px;color:#9CA3AF;line-height:1.7;margin:0;max-width:260px;">${DEFAULT_ABOUT}</p>
  `;
  footer.appendChild(brand);

  const sponsorsWrap = document.createElement("div");
  sponsorsWrap.style.marginBottom = "28px";
  sponsorsWrap.appendChild(sectionTitle("الرعاة"));
  const sponsorsList = document.createElement("div");
  sponsorsList.className = "sponsors-list";
  sponsorsList.style.cssText = "display:flex;flex-direction:column;gap:10px;";
  sponsorsWrap.appendChild(sponsorsList);
  footer.appendChild(sponsorsWrap);

  const socialWrap = document.createElement("div");
  socialWrap.className = "social-wrap";
  socialWrap.style.cssText = "margin-bottom:24px;display:none;";
  footer.appendChild(socialWrap);

  const copyright = document.createElement("div");
  copyright.style.cssText = "text-align:center;font-size:11px;color:#CBD5E1;padding-top:12px;border-top:1px solid #F0F1F3;";
  copyright.textContent = `جميع الحقوق محفوظة لمنصة JO Driver © ${new Date().getFullYear()}`;
  footer.appendChild(copyright);

  function renderSponsors(sponsors) {
    sponsorsList.innerHTML = "";
    sponsors.forEach((s) => {
      const a = document.createElement("a");
      a.href = s.link || "#";
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.style.cssText =
        "display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;background:#fff;border:1px solid #E8EAED;box-shadow:0 1px 2px rgba(0,0,0,.03);text-decoration:none;transition:transform .12s, box-shadow .12s;";
      a.innerHTML = `
        <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#246BFD,#4f86ff);display:flex;align-items:center;justify-content:center;font-size:18px;color:#fff;flex-shrink:0;">
          <i class="ph ph-steering-wheel"></i>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:700;color:#111827;"></div>
        </div>
      `;
      a.querySelector("div > div").textContent = s.name;
      a.addEventListener("mouseenter", () => {
        a.style.transform = "translateY(-1px)";
        a.style.boxShadow = "0 3px 8px rgba(0,0,0,.05)";
      });
      a.addEventListener("mouseleave", () => {
        a.style.transform = "translateY(0)";
        a.style.boxShadow = "0 1px 2px rgba(0,0,0,.03)";
      });
      sponsorsList.appendChild(a);
    });
  }
  renderSponsors(DEFAULT_SPONSORS);

  function renderSocials(social) {
    const activeSocials = Object.entries(SOCIAL_SVGS).filter(([key]) => !!social[key]);
    socialWrap.innerHTML = "";
    if (activeSocials.length === 0) {
      socialWrap.style.display = "none";
      return;
    }
    socialWrap.style.display = "block";
    socialWrap.appendChild(sectionTitle("تواصل معنا"));
    const row = document.createElement("div");
    row.style.cssText = "display:flex;gap:10px;";
    activeSocials.forEach(([key, { label, color, svg }]) => {
      const a = document.createElement("a");
      a.href = social[key];
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.setAttribute("aria-label", label);
      a.style.cssText = `width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:#F6F8FB;color:${color};text-decoration:none;border:1px solid #E8EAED;transition:transform .15s, background .15s;`;
      a.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">${svg}</svg>`;
      a.addEventListener("mouseenter", () => {
        a.style.background = color + "15";
        a.style.transform = "scale(1.08)";
      });
      a.addEventListener("mouseleave", () => {
        a.style.background = "#F6F8FB";
        a.style.transform = "scale(1)";
      });
      row.appendChild(a);
    });
    socialWrap.appendChild(row);
  }

  Promise.all([
    db.ref("footer/social").once("value"),
    db.ref("footer/aboutText").once("value"),
    db.ref("footer/sponsors").once("value"),
  ])
    .then(([soSnap, atSnap, spSnap]) => {
      const social = soSnap.val() || {};
      renderSocials(social);
      const at = atSnap.val();
      if (at && typeof at === "string") {
        brand.querySelector(".about-text").textContent = at;
      }
      const spVal = spSnap.val();
      if (spVal && typeof spVal === "object") {
        const arr = Object.values(spVal);
        if (arr.length > 0) renderSponsors(arr);
      }
    })
    .catch(() => {});

  return footer;
}
