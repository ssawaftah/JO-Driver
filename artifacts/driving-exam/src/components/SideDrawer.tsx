import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  onClose: () => void;
}

const links = [
  { icon: "pencil-line",   color: "#16A34A", path: "/exam-rules",  label: "الامتحان النظري"     },
  { icon: "book-open",     color: "#2563EB", path: "/categories",  label: "دراسة الأسئلة"        },
  { icon: "map-pin",       color: "#D97706", path: "/centers",     label: "مراكز التدريب"         },
  { icon: "book-open-text", color: "#7C3AED", path: "/guide",       label: "دليل الامتحان النظري" },
];

export default function SideDrawer({ open, onClose }: Props) {
  const navigate = useNavigate();
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

        {/* Nav links */}
        <div style={{ padding: "12px 8px", flex: 1, overflowY: "auto" }}>
          {links.map(l => (
            <button
              key={l.path}
              onClick={() => { navigate(l.path); onClose(); }}
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
