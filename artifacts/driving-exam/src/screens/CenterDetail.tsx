import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import Header from "../components/Header";
import AppFooter from "../components/Footer";
import type { Center, Governorate, Area } from "../types";

interface Props {
  govs: Record<string, Governorate>;
  areas: Record<string, Area>;
  centers: Record<string, Center>;
}

const ALL_DAYS_SHORT = ["س","ح","ن","ث","ر","خ","ج"];
const ALL_DAYS_FULL = ["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];

function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 4, direction: "ltr" as const }}>
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
        >
          <i
            className={n <= value ? "ph-fill ph-star" : "ph ph-star"}
            style={{ fontSize: 28, color: n <= value ? "#F59E0B" : "#D1D5DB" }}
          />
        </button>
      ))}
    </div>
  );
}

export default function CenterDetail({ govs, areas, centers }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<{ id: string; name: string; comment?: string; rating: number; createdAt: string }[]>([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [sendingReview, setSendingReview] = useState(false);
  const [toast, setToast] = useState("");

  const center: (Center & { id: string }) | null = useMemo(() => {
    if (!id || !centers[id]) return null;
    return { id, ...centers[id] };
  }, [id, centers]);

  const govName = center?.governorateId ? govs[center.governorateId]?.name : "";

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    db.ref(`centerReviews/${id}`).once("value").then(snap => {
      const val = snap.val() || {};
      const list = Object.entries(val).map(([k, v]: [string, any]) => ({
        id: k, name: v.name || "", comment: v.comment || "", rating: v.rating || 0,
        createdAt: v.createdAt || "",
      })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setReviews(list);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  async function submitReview() {
    if (!center) return;
    if (!reviewName.trim()) { setToast("أدخل اسمك"); setTimeout(() => setToast(""), 2000); return; }
    setSendingReview(true);
    try {
      await db.ref(`centerReviews/${center.id}`).push({
        name: reviewName.trim(),
        comment: reviewComment.trim() || null,
        rating: reviewRating,
        createdAt: new Date().toISOString(),
      });
      setReviews(prev => [{
        id: "tmp", name: reviewName.trim(), comment: reviewComment.trim() || undefined,
        rating: reviewRating, createdAt: new Date().toISOString(),
      }, ...prev]);
      setReviewName(""); setReviewComment(""); setReviewRating(5);
      setToast("تم إرسال التقييم بنجاح");
    } catch {
      setToast("خطأ في إرسال التقييم");
    }
    setSendingReview(false);
    setTimeout(() => setToast(""), 2000);
  }

  function shareCenter() {
    const url = `${window.location.origin}/centers/${center?.id}`;
    const text = `مركز تدريب القيادة — ${center?.name}`;
    if (navigator.share) {
      navigator.share({ title: text, url });
    } else {
      navigator.clipboard.writeText(url);
      setToast("تم نسخ الرابط");
      setTimeout(() => setToast(""), 2000);
    }
  }

  if (!center) {
    return (
      <div style={{ minHeight: "100dvh", background: "#FAFBFC", direction: "rtl" }}>
        <Header />
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <i className="ph ph-storefront" style={{ fontSize: 48, color: "#D1D5DB", marginBottom: 16 }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: "#6B7280" }}>المركز غير موجود</div>
        </div>
        <AppFooter />
      </div>
    );
  }

  const activeDays = center.workingDays || [];
  const cleanPhone = (center.phone || "").replace(/[^0-9+]/g, "");
  const cleanWhatsapp = (center.whatsapp || center.phone || "").replace(/[^0-9+]/g, "");

  return (
    <div style={{ minHeight: "100dvh", background: "#FAFBFC", direction: "rtl" }}>
      <Header />

      <div style={{ padding: "16px 14px", maxWidth: 720, margin: "0 auto" }}>
        {/* Header card */}
        <div style={{
          background: "#fff", borderRadius: 16, border: "1.5px solid #E2E8F0",
          padding: 20, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", marginBottom: 8 }}>{center.name}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {govName && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                    background: "#F3F4F6", color: "#6B7280", display: "inline-flex", alignItems: "center", gap: 4,
                  }}>
                    <i className="ph ph-map-trifold" style={{ fontSize: 12 }} /> {govName}
                  </span>
                )}
                {center.areas?.map(a => (
                  <span key={a.id} style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                    background: "#EFF6FF", color: "#2563EB",
                  }}>{a.name}</span>
                ))}
                {center.promoted && (
                  <span style={{
                    fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20,
                    background: "#FFFBEB", color: "#D97706", display: "inline-flex", alignItems: "center", gap: 4,
                  }}>
                    <i className="ph ph-crown" style={{ fontSize: 12 }} /> مميز
                  </span>
                )}
              </div>
            </div>
            {center.rating != null && (
              <div style={{
                display: "flex", alignItems: "center", gap: 4,
                background: "#FFFBEB", border: "1.5px solid #FDE68A",
                borderRadius: 10, padding: "4px 8px", flexShrink: 0,
              }}>
                <i className="ph-fill ph-star" style={{ fontSize: 14, color: "#F59E0B" }} />
                <span style={{ fontSize: 14, fontWeight: 900, color: "#92400E" }}>{center.rating}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {center.phone && (
            <a href={`tel:${cleanPhone}`} style={{
              flex: 1, height: 44, borderRadius: 12, border: "1.5px solid #E2E8F0",
              background: "#F8FAFC", color: "#374151", fontSize: 13, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              textDecoration: "none",
            }}>
              <i className="ph ph-phone" style={{ fontSize: 18, color: "#2563EB" }} />
              اتصال
            </a>
          )}
          {cleanWhatsapp && (
            <a href={`https://wa.me/${cleanWhatsapp.replace(/^\+/, "")}`} target="_blank" rel="noreferrer" style={{
              flex: 1, height: 44, borderRadius: 12, border: "1.5px solid #E2E8F0",
              background: "#ECFDF5", color: "#059669", fontSize: 13, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              textDecoration: "none",
            }}>
              <i className="ph ph-whatsapp-logo" style={{ fontSize: 18 }} />
              واتساب
            </a>
          )}
          {center.mapLink && (
            <a href={center.mapLink} target="_blank" rel="noreferrer" style={{
              flex: 1, height: 44, borderRadius: 12,
              background: "#2563EB", color: "#fff", fontSize: 13, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              textDecoration: "none",
            }}>
              <i className="ph ph-map-pin-line" style={{ fontSize: 18 }} />
              الموقع
            </a>
          )}
          <button onClick={shareCenter} style={{
            width: 44, height: 44, borderRadius: 12, border: "1.5px solid #E2E8F0",
            background: "#F8FAFC", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className="ph ph-share-network" style={{ fontSize: 20, color: "#64748B" }} />
          </button>
        </div>

        {/* Info card */}
        <div style={{
          background: "#fff", borderRadius: 16, border: "1.5px solid #E2E8F0",
          padding: 20, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          {center.address && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: "#EFF6FF",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <i className="ph ph-map-pin" style={{ fontSize: 18, color: "#2563EB" }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", marginBottom: 2 }}>العنوان</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{center.address}</div>
              </div>
            </div>
          )}
          {center.phone && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: "#F5F3FF",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <i className="ph ph-phone" style={{ fontSize: 18, color: "#7C3AED" }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", marginBottom: 2 }}>الهاتف</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{center.phone}</div>
              </div>
            </div>
          )}
          {center.workingHours && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: "#ECFEFF",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <i className="ph ph-clock" style={{ fontSize: 18, color: "#0891B2" }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", marginBottom: 2 }}>ساعات الدوام</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{center.workingHours}</div>
              </div>
            </div>
          )}
          {activeDays.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", marginBottom: 8 }}>أيام الدوام</div>
              <div style={{ display: "flex", gap: 5 }}>
                {ALL_DAYS_FULL.map((day, i) => {
                  const on = activeDays.includes(day);
                  return (
                    <div key={day} style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: on ? "#2563EB" : "#F1F5F9",
                      color: on ? "#fff" : "#94A3B8",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 800,
                    }}>
                      {ALL_DAYS_SHORT[i]}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Reviews */}
        <div style={{
          background: "#fff", borderRadius: 16, border: "1.5px solid #E2E8F0",
          padding: 20, marginBottom: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A" }}>آراء الزوار</div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>{reviews.length} تقييم</span>
          </div>

          {/* Review form */}
          <div style={{
            background: "#F8FAFC", borderRadius: 14, padding: 16, marginBottom: 20,
            border: "1.5px solid #E2E8F0",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>أضف تقييمك</div>
            <StarInput value={reviewRating} onChange={setReviewRating} />
            <input
              value={reviewName}
              onChange={e => setReviewName(e.target.value)}
              placeholder="اسمك"
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 10,
                border: "1.5px solid #E2E8F0", background: "#fff", fontSize: 14,
                fontFamily: "inherit", color: "#0F172A", marginTop: 12,
              }}
            />
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="تعليقك عن المركز (اختياري)"
              rows={3}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 10,
                border: "1.5px solid #E2E8F0", background: "#fff", fontSize: 14,
                fontFamily: "inherit", color: "#0F172A", marginTop: 10, resize: "vertical",
              }}
            />
            <button
              onClick={submitReview}
              disabled={sendingReview}
              style={{
                width: "100%", marginTop: 12, padding: "12px",
                background: "#2563EB", color: "#fff", borderRadius: 12,
                border: "none", fontSize: 14, fontWeight: 800,
                cursor: sendingReview ? "wait" : "pointer", fontFamily: "inherit",
                opacity: sendingReview ? 0.7 : 1,
              }}
            >
              {sendingReview ? "جارٍ إرسال..." : "إرسال التقييم"}
            </button>
          </div>

          {/* Review list */}
          {reviews.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "#94A3B8" }}>
              <i className="ph ph-chat-circle-dots" style={{ fontSize: 40, display: "block", marginBottom: 10 }} />
              <div style={{ fontSize: 14, fontWeight: 600 }}>لا توجد تقييمات بعد. كن أول مقيّم!</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {reviews.map(r => (
                <div key={r.id} style={{
                  borderBottom: "1px solid #F1F5F9", paddingBottom: 12,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{r.name}</span>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[1,2,3,4,5].map(n => (
                        <i key={n} className={n <= r.rating ? "ph-fill ph-star" : "ph ph-star"} style={{ fontSize: 12, color: n <= r.rating ? "#F59E0B" : "#E2E8F0" }} />
                      ))}
                    </div>
                  </div>
                  {r.comment && (
                    <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{r.comment}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)",
          background: "#0F172A", color: "#fff", padding: "12px 20px",
          borderRadius: 12, fontSize: 13, fontWeight: 700, zIndex: 200,
        }}>{toast}</div>
      )}

      <AppFooter />
    </div>
  );
}
