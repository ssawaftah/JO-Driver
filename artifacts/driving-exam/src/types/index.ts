export type Screen =
  | "home"
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

export interface FooterSponsor { id: string; imageUrl: string; link?: string; }
export interface FooterData {
  sponsors: FooterSponsor[];
  social: Record<string, string>;
  defaultSponsorLink: string;
  aboutText?: string;
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
  publicId?: number;
  name: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  mapLink?: string;
  lat?: number;
  lng?: number;
  rating?: number;
  reviewCount?: number;
  workingDays?: string[];
  workingHours?: string;
  schedule?: { closed: boolean; from: string; to: string }[];
  governorateId?: string;
  areaId?: string;
  areas?: { id: string; name: string }[];
  promoted?: boolean;
  createdAt?: string;
}

export interface CenterReview {
  id?: string;
  centerId: string;
  name: string;
  comment?: string;
  rating: number;
  createdAt: string;
}
