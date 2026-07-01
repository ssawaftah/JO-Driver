interface Props {
  onMenuOpen: () => void;
  showMenu?: boolean;
}

export default function Header({ onMenuOpen, showMenu = true }: Props) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "#fff",
      borderBottom: "1px solid #E5E7EB",
      padding: "12px 16px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 12,
    }}>
      {showMenu && (
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
      )}

      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        flex: 1, justifyContent: showMenu ? "center" : "flex-start",
      }}>
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

      {showMenu && <div style={{ width: 40, flexShrink: 0 }} />}
    </header>
  );
}
