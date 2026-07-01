import { useState, useEffect } from "react";
import { db } from "../lib/firebase";

const SOCIAL_ICONS: Record<string, { label: string; phIcon: string; color: string }> = {
  facebook:  { label: "Facebook",  phIcon: "ph-facebook-logo",  color: "#1877F2" },
  whatsapp:  { label: "WhatsApp",  phIcon: "ph-whatsapp-logo",  color: "#25D366" },
  instagram: { label: "Instagram", phIcon: "ph-instagram-logo", color: "#E4405F" },
  x:         { label: "X",         phIcon: "ph-x-logo",         color: "#0f172a" },
};

const DEFAULT_ABOUT =
  "منصة JO Driver هي دليلك الأول لاجتياز امتحان القيادة النظري في الأردن.";

export default function AppFooter() {
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

  const activeSocials = Object.entries(SOCIAL_ICONS).filter(([key]) => !!social[key]);

  return (
    <footer style={{
      background: "#fff",
      borderTop: "1px solid #E8EAED",
      direction: "rtl",
      color: "#6B7280",
      padding: "12px 16px",
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        {/* Left: logo + about */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg, #246BFD, #4f86ff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, color: "#fff", flexShrink: 0,
          }}>
            <i className="ph ph-steering-wheel" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#1A1D1F", marginBottom: 1 }}>JO Driver</div>
            <div style={{ fontSize: 10, color: "#9CA3AF", lineHeight: 1.4 }}>{aboutText}</div>
          </div>
        </div>

        {/* Right: social icons */}
        {activeSocials.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            {activeSocials.map(([key, { phIcon, color }]) => (
              <a key={key} href={social[key]} target="_blank" rel="noopener noreferrer"
                style={{
                  width: 28, height: 28, borderRadius: 7,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "#F6F8FB", color,
                  textDecoration: "none", fontSize: 14,
                  transition: "transform .15s, background .15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = color + "15"; e.currentTarget.style.transform = "scale(1.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#F6F8FB"; e.currentTarget.style.transform = "scale(1)"; }}
              >
                <i className={`ph ${phIcon}`} />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Copyright */}
      <div style={{
        textAlign: "center", marginTop: 8,
        fontSize: 9, color: "#CBD5E1",
      }}>
        جميع الحقوق محفوظة © {new Date().getFullYear()}
      </div>
    </footer>
  );
}
