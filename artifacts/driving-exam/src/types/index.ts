export type Screen =
  | "register" | "home"
  | "centers" | "categories"
  | "study" | "test" | "result"
  | "exam-rules" | "exam" | "exam-result"
  | "guide"
  | "admin"
  | "admin-login";

/* ── Guide section types ─────────────────────────────────── */
export type GuideSectionType = "steps" | "documents" | "fees" | "conditions" | "faq";

export interface GuideSectionItem {
  text: string;
  sub?: string;
  note?: string;
  amount?: string;
  answer?: string;
  icon?: string;
}

export interface GuideSection {
  id?: string;
  title: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  type: GuideSectionType;
  order: number;
  items: GuideSectionItem[];
}

export interface Question {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  explanation?: string;
  mediaUrl?: string;
  mediaType?: "image" | "video" | "gif" | "text";
}

export interface Governorate { id?: string; name: string; }
export interface Area { id?: string; name: string; governorateId: string; }
export interface Center {
  id?: string;
  name: string;
  address?: string;
  phone?: string;
  mapLink?: string;
  rating?: number;
  workingDays?: string[];
  workingHours?: string;
  governorateId?: string;
  areaId?: string;
  areas?: { id: string; name: string }[];
}
