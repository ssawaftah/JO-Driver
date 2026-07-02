import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../lib/firebase";

const DEFAULT_ABOUT = "منصة JO Driver هي دليلك الأول لاجتياز امتحان القيادة النظري في الأردن.";
const SPONSOR_LINK = "https://wa.me/962778244772?text=";

/** Only show footer on these routes */
const HIDE_FOOTER_PATHS = ["/exam", "/test", "/study"];
function shouldShowFooter(path: string): boolean {
  return !HIDE_FOOTER_PATHS.some(p => path.startsWith(p));
}

/* ── SVG social icons (lightweight, crisp) ── */
function IconFacebook({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
function IconWhatsApp({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
function IconInstagram({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.85-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}
function IconX({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const SOCIAL_SVGS: Record<string, { label: string; icon: typeof IconFacebook; color: string }> = {
  facebook:  { label: "Facebook",  icon: IconFacebook,  color: "#1877F2" },
  whatsapp:  { label: "WhatsApp",  icon: IconWhatsApp,  color: "#25D366" },
  instagram: { label: "Instagram", icon: IconInstagram, color: "#E4405F" },
  x:         { label: "X",         icon: IconX,         color: "#0f172a" },
};

/* ── 3 sponsor placeholders ── */
type Sponsor = { name: string; link: string };
const DEFAULT_SPONSORS: Sponsor[] = [
  { name: "كن راعي رسمي لـ JO Driver", link: "https://wa.me/9620778244772?text=" },
  { name: "كن راعي رسمي لـ JO Driver", link: "https://wa.me/9620778244772?text=" },
  { name: "كن راعي رسمي لـ JO Driver", link: "https://wa.me/9620778244772?text=" },
];

/* ── Reusable right-aligned section header with accent line ── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      marginBottom: 14,
    }}>
      <div style={{
        fontSize: 12, fontWeight: 800, color: "#374151",
        whiteSpace: "nowrap",
      }}>
        {children}
      </div>
      <div style={{
        flex: 1, height: 1, background: "#E8EAED", borderRadius: 1,
      }} />
    </div>
  );
}

export default function AppFooter() {
  const navigate = useNavigate();
  const location = useLocation();
  const [social, setSocial] = useState<Record<string, string>>({});
  const [aboutText, setAboutText] = useState(DEFAULT_ABOUT);
  const [sponsors, setSponsors] = useState<Sponsor[]>(DEFAULT_SPONSORS);

  useEffect(() => {
    Promise.all([
      db.ref("footer/social").once("value"),
      db.ref("footer/aboutText").once("value"),
      db.ref("footer/sponsors").once("value"),
    ]).then(([soSnap, atSnap, spSnap]) => {
      setSocial(soSnap.val() || {});
      const at = atSnap.val();
      if (at && typeof at === "string") setAboutText(at);
      const spVal = spSnap.val();
      if (spVal && typeof spVal === "object") {
        const arr = Object.values(spVal) as Sponsor[];
        if (arr.length > 0) setSponsors(arr);
      }
    });
  }, []);

  if (!shouldShowFooter(location.pathname)) return null;

  const activeSocials = Object.entries(SOCIAL_SVGS).filter(([key]) => !!social[key]);

  return (
    <footer style={{
      direction: "rtl",
      color: "#6B7280",
      padding: "32px 16px 20px",
      borderTop: "1px solid #E8EAED",
      background: "transparent",
    }}>

      {/* ── Centered brand: logo + about ── */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        marginBottom: 28, textAlign: "center",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: "linear-gradient(135deg, #246BFD, #4f86ff)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, color: "#fff", marginBottom: 10,
        }}>
          <i className="ph ph-steering-wheel" />
        </div>
        <div style={{ fontSize: 18, fontWeight: 900, color: "#111827", marginBottom: 4 }}>JO Driver</div>
        <p style={{
          fontSize: 12, color: "#9CA3AF", lineHeight: 1.7, margin: 0,
          maxWidth: 260,
        }}>
          {aboutText}
        </p>
      </div>

      {/* ── Sponsors ── */}
      <div style={{ marginBottom: 28 }}>
        <SectionTitle>الرعاة</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sponsors.map((s, i) => (
            <a key={i} href={s.link || "#"} target="_blank" rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px",
                borderRadius: 12,
                background: "#fff",
                border: "1px solid #E8EAED",
                boxShadow: "0 1px 2px rgba(0,0,0,.03)",
                textDecoration: "none",
                transition: "transform .12s, box-shadow .12s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 3px 8px rgba(0,0,0,.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,.03)"; }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg, #246BFD, #4f86ff)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, color: "#fff", flexShrink: 0,
              }}>
                <i className="ph ph-steering-wheel" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                  {s.name}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Social icons: "تواصل معنا" ── */}
      {activeSocials.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionTitle>تواصل معنا</SectionTitle>
          <div style={{ display: "flex", gap: 10 }}>
            {activeSocials.map(([key, { label, icon: IconComp, color }]) => (
              <a key={key} href={social[key]} target="_blank" rel="noopener noreferrer"
                aria-label={label}
                style={{
                  width: 40, height: 40, borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "#F6F8FB", color,
                  textDecoration: "none",
                  border: "1px solid #E8EAED",
                  transition: "transform .15s, background .15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = color + "15"; e.currentTarget.style.transform = "scale(1.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#F6F8FB"; e.currentTarget.style.transform = "scale(1)"; }}
              >
                <IconComp size={20} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── Copyright ── */}
      <div style={{
        textAlign: "center",
        fontSize: 11, color: "#CBD5E1",
        paddingTop: 12,
        borderTop: "1px solid #F0F1F3",
      }}>
        جميع الحقوق محفوظة لمنصة JO Driver © {new Date().getFullYear()}
      </div>
    </footer>
  );
}
