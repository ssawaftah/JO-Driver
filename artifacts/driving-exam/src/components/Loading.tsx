export default function Loading({ msg }: { msg: string }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(255,255,255,0.94)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 16,
    }}>
      <div className="spinner" />
      <p style={{ fontWeight: 700, color: "#374151", fontSize: 15 }}>{msg}</p>
    </div>
  );
}
