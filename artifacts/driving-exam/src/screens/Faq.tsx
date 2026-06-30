import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import type { GuideSection, GuideSectionType, GuideSectionItem } from "../types";

interface Props { onBack: () => void; }

/* ── Accordion ─────────────────────────────────── */
function Accordion({ icon, iconColor, iconBg, title, children, defaultOpen = false }: {
  icon: string; iconColor: string; iconBg: string; title: string;
  children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #F0F1F3", overflow: "hidden" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", padding: "14px 16px", display: "flex", flexDirection: "row", alignItems: "center",
        gap: 12, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0,
          background: iconBg, color: iconColor,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19,
        }}><i className={`ph ph-${icon}`} /></div>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 800, color: "#111827", textAlign: "right", display: "block" }}>{title}</span>
        <i className={`ph ph-caret-${open ? "up" : "down"}`} style={{ fontSize: 15, color: "#9CA3AF", flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{ padding: "4px 16px 14px" }}>
          <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: 10 }}>{children}</div>
        </div>
      )}
    </div>
  );
}

/* ── Step (numbered) ────────────────────────── */
function Step({ n, title, desc, last }: { n: number; title: string; desc: string; last?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "row", gap: 12, paddingBottom: last ? 0 : 14 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "#246BFD", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 900,
        }}>{n}</div>
        {!last && <div style={{ width: 2, flex: 1, background: "#E5E7EB", marginTop: 5 }} />}
      </div>
      <div style={{ paddingTop: 3, textAlign: "right", flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#111827", marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.6 }}>{desc}</div>
      </div>
    </div>
  );
}

/* ── DocRow ─────────────────────────────────── */
function DocRow({ icon, text, sub }: { icon: string; text: string; sub?: string }) {
  return (
    <div style={{
      display: "flex", flexDirection: "row", alignItems: "flex-start",
      gap: 10, paddingBottom: 10, marginBottom: 2,
      borderBottom: "1px solid #F9FAFB",
    }}>
      <i className={`ph ph-${icon}`} style={{ fontSize: 16, color: "#246BFD", marginTop: 2, flexShrink: 0 }} />
      <div style={{ flex: 1, textAlign: "right" }}>
        <div style={{ fontSize: 13, color: "#374151", fontWeight: 600, lineHeight: 1.5 }}>{text}</div>
        {sub && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ── FeeRow ─────────────────────────────────── */
function FeeRow({ label, amount, note }: { label: string; amount: string; note?: string }) {
  return (
    <div style={{
      display: "flex", flexDirection: "row", alignItems: "center",
      justifyContent: "space-between", paddingBottom: 10,
      borderBottom: "1px solid #F9FAFB", marginBottom: 2,
    }}>
      <div style={{ flex: 1, textAlign: "right", paddingLeft: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{label}</div>
        {note && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{note}</div>}
      </div>
      <span style={{
        fontSize: 13, fontWeight: 900, color: "#246BFD",
        background: "#EEF4FF", borderRadius: 10, padding: "4px 10px",
        flexShrink: 0,
      }}>{amount}</span>
    </div>
  );
}

/* ── FaqItem ─────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 5 }}>
        <i className="ph ph-question" style={{ fontSize: 15, color: "#246BFD", flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1, fontSize: 13, fontWeight: 800, color: "#111827", textAlign: "right" }}>{q}</div>
      </div>
      <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.7, paddingRight: 23, textAlign: "right" }}>{a}</div>
    </div>
  );
}

/* ── Section renderer by type ────────────────────── */
function SectionContent({ type, items }: { type: GuideSectionType; items: GuideSectionItem[] }) {
  switch (type) {
    case "steps":
      return (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {items.map((it, i) => (
            <Step key={i} n={i + 1} title={it.text} desc={it.sub || ""} last={i === items.length - 1} />
          ))}
        </div>
      );
    case "documents":
      return (
        <div>
          {items.map((it, i) => (
            <DocRow key={i} icon={it.icon || "file-text"} text={it.text} sub={it.sub} />
          ))}
        </div>
      );
    case "fees":
      return (
        <div>
          {items.map((it, i) => (
            <FeeRow key={i} label={it.text} amount={it.amount || ""} note={it.note} />
          ))}
          <div style={{
            marginTop: 8, background: "#FFFBEB", borderRadius: 10,
            padding: "9px 12px", fontSize: 12, color: "#92400E",
            display: "flex", flexDirection: "row", gap: 8, alignItems: "flex-start", textAlign: "right",
          }}>
            <i className="ph ph-warning" style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }} />
            <span>الرسوم قابلة للتغيير — تحقق من دائرة الترخيص قبل الذهاب.</span>
          </div>
        </div>
      );
    case "conditions":
      return (
        <div>
          {items.map((it, i) => (
            <DocRow key={i} icon={it.icon || "check-circle"} text={it.text} sub={it.sub} />
          ))}
        </div>
      );
    case "faq":
      return (
        <div>
          {items.map((it, i) => (
            <FaqItem key={i} q={it.text} a={it.answer || ""} />
          ))}
        </div>
      );
    default:
      return <div style={{ fontSize: 12, color: "#9CA3AF" }}>---</div>;
  }
}

/* ── Root ──────────────────────────────────────────── */
export default function GuideScreen({ onBack }: Props) {
  const [sections, setSections] = useState<GuideSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.ref("guide/sections").once("value")
      .then(snap => {
        const val = snap.val() || {};
        const arr: GuideSection[] = Object.entries(val).map(([id, s]: [string, any]) => ({
          id, ...s,
        }));
        arr.sort((a, b) => (a.order || 0) - (b.order || 0));
        setSections(arr);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{
      height: "100dvh", display: "flex", flexDirection: "column",
      background: "#F9FAFB", direction: "rtl",
    }}>
      {/* Header */}
      <div style={{
        background: "#fff", borderBottom: "1.5px solid #F0F1F3",
        padding: "14px 16px", display: "flex", flexDirection: "row", alignItems: "center", gap: 12,
        flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          width: 40, height: 40, borderRadius: 12,
          border: "1.5px solid #E5E7EB", background: "#F9FAFB",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0,
        }}>
          <i className="ph ph-arrow-right" style={{ fontSize: 19, color: "#246BFD" }} />
        </button>
        <div style={{ flex: 1, textAlign: "right" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#111827" }}>دليل الامتحان النظري</div>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>كل ما تحتاجه قبل يوم الاختبار</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: "1 1 0", minHeight: 0, overflowY: "auto", padding: "14px 14px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF", fontSize: 13 }}>جارٍ التحميل...</div>
        ) : sections.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF", fontSize: 13 }}>لا توجد أقسام</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* SMS notice card */}
            <div style={{
              background: "linear-gradient(135deg, #246BFD 0%, #4f86ff 100%)",
              borderRadius: 18, padding: "16px", color: "#fff", textAlign: "right",
            }}>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "rgba(255,255,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0,
                }}><i className="ph ph-device-mobile-speaker" /></div>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 900 }}>متى تذهب لدائرة الترخيص؟</div>
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.7, opacity: 0.92, marginBottom: 8 }}>
                انتظر رسالة SMS على هاتفك تحمل النص:
              </div>
              <div style={{
                background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: 10, padding: "10px 12px", fontSize: 12, fontWeight: 700, lineHeight: 1.8,
              }}>
                "تم استكمال دروس النظري والعملي المطلوبة للتقدم للفحص لدى الترخيص"
              </div>
              <div style={{ fontSize: 12, opacity: 0.85, marginTop: 8, lineHeight: 1.6 }}>
                عند وصول هذه الرسالة فقط يمكنك التوجه لأقرب دائرة ترخيص وتقديم طلبك.
              </div>
            </div>

            {/* Sections from Firebase */}
            {sections.map(s => (
              <Accordion
                key={s.id}
                icon={s.icon}
                iconColor={s.iconColor}
                iconBg={s.iconBg}
                title={s.title}
                defaultOpen={s.type === "steps"}
              >
                <SectionContent type={s.type} items={s.items} />
              </Accordion>
            ))}

            {/* Official link */}
            <a href="https://www.motc.gov.jo" target="_blank" rel="noreferrer" style={{
              display: "flex", flexDirection: "row", alignItems: "center",
              justifyContent: "center", gap: 8, padding: "14px",
              borderRadius: 14, border: "1.5px solid #E5E7EB", background: "#fff",
              fontSize: 13, fontWeight: 700, color: "#246BFD", textDecoration: "none",
            }}>
              <i className="ph ph-globe" style={{ fontSize: 18 }} />
              الموقع الرسمي لوزارة الداخلية — دائرة الترخيص
            </a>
            <div style={{ height: 16 }} />
          </div>
        )}
      </div>
    </div>
  );
}
