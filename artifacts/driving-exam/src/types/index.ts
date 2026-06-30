export type Screen =
  | "landing" | "register" | "home"
  | "centers" | "categories"
  | "study" | "test" | "result";

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
