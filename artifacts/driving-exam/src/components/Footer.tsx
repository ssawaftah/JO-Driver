import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../lib/firebase";

const SOCIAL_ICONS: Record<string, { label: string; phIcon: string; color: string }> = {
  facebook:  { label: "Facebook",  phIcon: "ph-facebook-logo",  color: "#1877F2" },
  whatsapp:  { label: "WhatsApp",  phIcon: "ph-whatsapp-logo",  color: "#25D366" },
  instagram: { label: "Instagram", phIcon: "ph-instagram-logo", color: "#E4405F" },
  x:         { label: "X",         phIcon: "ph-x-logo",         color: "#0f172a" },
};

const DEFAULT_ABOUT = "منصة JO Driver هي دليلك الأول لاجتياز امتحان القيادة النظري في الأردن.";

/** Only show footer on these routes */
const HIDE_FOOTER_PATHS = ["/exam", "/test", "/study"];
function shouldShowFooter(path: string): boolean {
  return !HIDE_FOOTER_PATHS.some(p => path.startsWith(p));
}

export default function AppFooter() {
  const navigate = useNavigate();
  const location = useLocation();
  const [social, setSocial] = useState<Record<string, string>>({});
  const [aboutText, setAboutText] = useState(DEFAULT_ABOUT);

  useEffect(() => {
    Promise.all([
      db.ref("footer/social").once("value"),
      db.ref("footer/aboutText").once("value"),
    ]).then(([soSnap, atSnap]) => {
      setSocial(soSnap.val() || {});
      const at = atSnap.val();
      if (at && typeof at === "string") setAboutText(at);
    });
  }, []);

  if (!shouldShowFooter(location.pathname)) return null;

  const activeSocials = Object.entries(SOCIAL_ICONS).filter(([key]) => !!social[key]);

  return (
    <footer style={{
      direction: "rtl",
      color: "#6B7280",
      padding: "28px 16px 20px",
      borderTop: "1px solid #E8EAED",
      background: "transparent",
    }}>
      {/* ── Brand row: logo + name + about ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "linear-gradient(135deg, #246BFD, #4f86ff)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, color: "#fff", flexShrink: 0,
        }}>
          <i className="ph ph-steering-wheel" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#111827", marginBottom: 3 }}>JO Driver</div>
          <p style={{ fontSize: 12, color: "#9CA3AF", lineHeight: 1.6, margin: 0 }}>
            {aboutText}
          </p>
        </div>
      </div>

      {/* ── Social icons ── */}
      {activeSocials.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
          {activeSocials.map(([key, { phIcon, color }]) => (
            <a key={key} href={social[key]} target="_blank" rel="noopener noreferrer"
              style={{
                width: 36, height: 36, borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "#F6F8FB", color,
                textDecoration: "none", fontSize: 16,
                border: "1px solid #E8EAED",
                transition: "transform .15s, background .15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = color + "15"; e.currentTarget.style.transform = "scale(1.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#F6F8FB"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              <i className={`ph ${phIcon}`} />
            </a>
          ))}
        </div>
      )}

      {/* ── Link columns ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px 16px",
        marginBottom: 24,
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#374151", marginBottom: 8 }}>الدليل</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <FooterLink onClick={() => navigate("/guide")}>دليل الامتحان</FooterLink>
            <FooterLink onClick={() => navigate("/centers")}>مراكز التدريب</FooterLink>
            <FooterLink onClick={() => navigate("/centers/join")}>انضم كمركز</FooterLink>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#374151", marginBottom: 8 }}>التطبيق</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <FooterLink onClick={() => navigate("/")}>الرئيسية</FooterLink>
            <FooterLink onClick={() => navigate("/categories")}>الأقسام والأسئلة</FooterLink>
            <FooterLink onClick={() => navigate("/exam-rules")}>الامتحان النظري</FooterLink>
          </div>
        </div>
      </div>

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

function FooterLink({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none", border: "none", padding: 0, margin: 0,
        fontSize: 12, color: "#6B7280", cursor: "pointer",
        fontFamily: "inherit", textAlign: "right",
        transition: "color .15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.color = "#246BFD"; }}
      onMouseLeave={e => { e.currentTarget.style.color = "#6B7280"; }}
    >
      {children}
    </button>
  );
}
