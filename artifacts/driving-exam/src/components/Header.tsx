import { useLocation, useNavigate } from "react-router-dom";

interface Props {
  onMenuOpen?: () => void;
}

export default function Header({ onMenuOpen }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/" || location.pathname === "";
  const isCenters = location.pathname === "/centers";

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "#fff",
      borderBottom: "1px solid #E5E7EB",
      padding: "12px 16px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 12,
    }}>
      {/* Left group: button + logo (always side-by-side) */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {isHome ? (
          <button
            onClick={onMenuOpen}
            style={{
              width: 40, height: 40, borderRadius: 12,
              border: "1.5px solid #E5E7EB", background: "#F9FAFB",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}
            aria-label="فتح القائمة"
          >
            <i className="ph ph-list" style={{ fontSize: 22, color: "#111827" }} />
          </button>
        ) : (
          <button
            onClick={() => {
              const fromInternal = document.referrer && document.referrer.startsWith(window.location.origin);
              if (fromInternal) navigate(-1);
              else navigate("/");
            }}
            style={{
              width: 40, height: 40, borderRadius: 12,
              border: "1.5px solid #E5E7EB", background: "#F9FAFB",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}
            aria-label="رجوع"
          >
            <i className="ph ph-arrow-right" style={{ fontSize: 20, color: "#246BFD" }} />
          </button>
        )}

        {/* Logo next to button */}
        <div
          onClick={() => navigate("/")}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            cursor: "pointer",
          }}
        >
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: "linear-gradient(135deg, #246BFD, #4f86ff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, color: "#fff", flexShrink: 0,
          }}>
            <i className="ph ph-steering-wheel" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#111827", letterSpacing: "-0.3px" }}>JO Driver</div>
            <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>تحضير لامتحان القيادة النظري</div>
          </div>
        </div>
      </div>

      {/* Join button — only on /centers */}
      {isCenters && (
        <button
          onClick={() => navigate("/centers/join")}
          style={{
            padding: "8px 14px", borderRadius: 10,
            background: "#246BFD", color: "#fff",
            fontSize: 12, fontWeight: 800,
            border: "none", cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 5,
            flexShrink: 0,
          }}
        >
          <i className="ph ph-plus" />
          انضمام
        </button>
      )}
    </header>
  );
}
