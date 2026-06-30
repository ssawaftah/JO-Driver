import { useState, useEffect, useRef } from "react";
import { db } from "../lib/firebase";

interface Sponsor { id: string; imageUrl: string; link?: string; }
interface Social { facebook?: string; whatsapp?: string; instagram?: string; x?: string; }

const DEFAULT_SPONSOR_IMG = "/sponsor-default.png";

const SOCIAL_ICONS: Record<string, { svg: string; label: string; color: string; bg: string }> = {
  facebook: {
    label: "فيسبوك",
    color: "#fff",
    bg: "#1877F2",
    svg: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  },
  whatsapp: {
    label: "واتساب",
    color: "#fff",
    bg: "#25D366",
    svg: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
  },
  instagram: {
    label: "انستغرام",
    color: "#fff",
    bg: "#E4405F",
    svg: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
  },
  x: {
    label: "تويتر / X",
    color: "#fff",
    bg: "#000000",
    svg: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  },
};

export default function AppFooter() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [social, setSocial] = useState<Social>({});
  const [defaultSponsorLink, setDefaultSponsorLink] = useState("");
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    db.ref("footer/sponsors").once("value").then(s => {
      const val = s.val();
      if (val) {
        const arr = Object.entries(val).map(([id, v]: [string, any]) => ({ id, ...v }));
        setSponsors(arr);
      }
    });
    db.ref("footer/social").once("value").then(s => {
      if (s.exists()) setSocial(s.val());
    });
    db.ref("footer/defaultSponsorLink").once("value").then(s => {
      if (s.exists()) setDefaultSponsorLink(s.val() || "");
    });
  }, []);

  useEffect(() => {
    if (sponsors.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % sponsors.length);
    }, 3500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [sponsors.length]);

  const isDefault = sponsors.length === 0;
  const displaySponsors = isDefault
    ? [{ id: "default", imageUrl: DEFAULT_SPONSOR_IMG, link: defaultSponsorLink }]
    : sponsors;
  const totalSlides = displaySponsors.length;

  function handleSponsorClick() {
    const item = displaySponsors[current];
    if (item.link) window.open(item.link, "_blank");
  }

  const activeSocials = Object.entries(SOCIAL_ICONS).filter(([key]) => !!(social as any)[key]);

  return (
    <div style={{ background: "#F9FAFB", borderTop: "1px solid #E5E7EB", direction: "rtl" }}>
      {/* Sponsor */}
      <div style={{ padding: "16px 16px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#9CA3AF", letterSpacing: 0.5 }}>الراعي الرسمي</span>
          <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
          {totalSlides > 1 && (
            <span style={{ fontSize: 10, color: "#9CA3AF" }}>{current + 1}/{totalSlides}</span>
          )}
        </div>

        {/* Slider */}
        <div style={{ position: "relative", overflow: "hidden", borderRadius: 12, width: "100%" }}>
          <div style={{
            display: "flex",
            width: `${totalSlides * 100}%`,
            transform: `translateX(-${current * (100 / totalSlides)}%)`,
            transition: "transform 0.5s ease",
            direction: "ltr",
          }}>
            {displaySponsors.map((sp) => (
              <div key={sp.id} style={{ width: `${100 / totalSlides}%`, flexShrink: 0 }}>
                <img
                  src={sp.imageUrl}
                  alt="راعي رسمي"
                  onClick={sp.link ? handleSponsorClick : undefined}
                  style={{
                    width: "100%",
                    aspectRatio: "1067 / 600",
                    objectFit: "cover",
                    display: "block",
                    cursor: sp.link ? "pointer" : "default",
                    borderRadius: 12,
                  }}
                  onError={e => { (e.target as HTMLImageElement).src = DEFAULT_SPONSOR_IMG; }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        {totalSlides > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 8 }}>
            {displaySponsors.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} style={{
                width: i === current ? 18 : 6, height: 6, borderRadius: 4, border: "none", padding: 0, cursor: "pointer",
                background: i === current ? "#246BFD" : "#D1D5DB",
                transition: "all 0.3s",
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Social */}
      {activeSocials.length > 0 && (
        <div style={{ padding: "10px 16px 12px", borderTop: "1px solid #F3F4F6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#9CA3AF" }}>تواصل معنا</span>
            <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            {activeSocials.map(([key, { svg, label, color, bg }]) => (
              <a key={key} href={(social as any)[key]} target="_blank" rel="noopener noreferrer"
                style={{
                  width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                  background: bg, color, flexShrink: 0, textDecoration: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
                title={label}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", color }}
                  dangerouslySetInnerHTML={{ __html: svg }} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Copyright */}
      <div style={{ textAlign: "center", padding: "8px 16px 14px", fontSize: 11, color: "#9CA3AF" }}>
        جميع الحقوق محفوظة لمنصة JO Driver © {new Date().getFullYear()}
      </div>
    </div>
  );
}
