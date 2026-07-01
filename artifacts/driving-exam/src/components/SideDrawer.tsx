interface Props {
  open: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

const links = [
  { icon: "pencil-line",      color: "#16A34A", label: "الامتحان النظري",     screen: "exam-rules" },
  { icon: "book-open",        color: "#2563EB", label: "دراسة الأسئلة",         screen: "categories" },
  { icon: "map-pin",          color: "#D97706", label: "مراكز التدريب",          screen: "centers" },
  { icon: "book-open-text",   color: "#7C3AED", label: "دليل الامتحان النظري",    screen: "guide" },
];

const externalLinks = [
  { label: "قواعد السير",           href: "/quaed-al-sayr.html" },
  { label: "الميكانيك",               href: "/al-mechanic.html" },
  { label: "الشواخص والعلامات",      href: "/al-shwakhes.html" },
  { label: "السلامة على الطريق",     href: "/al-salamah.html" },
  { label: "الأسعافات الأولية",     href: "/al-asafat.html" },
  { label: "المخالفات والنقاط",     href: "/al-mokhalafat.html" },
  { label: "الصور المتحركة",      href: "/al-soor-al-mutaharrek.html" },
];

export default function SideDrawer({ open, onClose, onNavigate }: Props) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.4)",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "absolute", top: 0, right: 0, bottom: 0,
          width: "min(320px, 85vw)",
          background: "#fff",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column",
          animation: "slideInRight 0.25s ease",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer header */}
        <div style={{
          padding: "16px", borderBottom: "1px solid #F3F4F6",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #246BFD, #4f86ff)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, color: "#fff",
            }}>
              <i className="ph ph-steering-wheel" />
            </div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#111827" }}>JO Driver</div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: 10,
              border: "1.5px solid #E5E7EB", background: "#F9FAFB",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <i className="ph ph-x" style={{ fontSize: 18, color: "#6B7280" }} />
          </button>
        </div>

        {/* Main nav */}
        <div style={{ padding: "12px 8px", flex: 1, overflowY: "auto" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", padding: "8px 12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            القائمة الرئيسية
          </div>
          {links.map(l => (
            <button
              key={l.screen}
              onClick={() => { onNavigate(l.screen); onClose(); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", borderRadius: 12,
                border: "none", background: "transparent", cursor: "pointer",
                fontFamily: "inherit", textAlign: "right", direction: "rtl",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: l.color + "15", color: l.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, flexShrink: 0,
              }}>
                <i className={`ph ph-${l.icon}`} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#111827", flex: 1 }}>{l.label}</span>
              <i className="ph ph-caret-left" style={{ fontSize: 14, color: "#D1D5DB" }} />
            </button>
          ))}

          <div style={{ height: 1, background: "#F3F4F6", margin: "12px 16px" }} />

          <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", padding: "8px 12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            الأقسام التفصيلية
          </div>
          {externalLinks.map(l => (
            <a
              key={l.href}
              href={l.href}
              onClick={onClose}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 12,
                textDecoration: "none", direction: "rtl",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: "#F3F4F6", color: "#6B7280",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, flexShrink: 0,
              }}>
                <i className="ph ph-arrow-up-right" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#374151", flex: 1 }}>{l.label}</span>
              <i className="ph ph-arrow-square-out" style={{ fontSize: 12, color: "#9CA3AF" }} />
            </a>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: "14px 16px", borderTop: "1px solid #F3F4F6",
          textAlign: "center", fontSize: 11, color: "#9CA3AF",
        }}>
          JO Driver · تحضير مجاني لامتحان القيادة النظري
        </div>
      </div>
    </div>
  );
}
