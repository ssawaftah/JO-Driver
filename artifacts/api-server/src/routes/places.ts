import { Router } from "express";

const placesRouter = Router();

const DAYS_AR: Record<number, string> = {
  0: "الأحد",
  1: "الاثنين",
  2: "الثلاثاء",
  3: "الأربعاء",
  4: "الخميس",
  5: "الجمعة",
  6: "السبت",
};

const JORDAN_ORDER = [6, 0, 1, 2, 3, 4, 5];

async function resolveShortUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return res.url || url;
  } catch {
    return url;
  }
}

function extractSearchQuery(url: string): string {
  const placeMatch = url.match(/\/maps\/place\/([^/@?#]+)/);
  if (placeMatch) return decodeURIComponent(placeMatch[1].replace(/\+/g, " "));

  const qMatch = url.match(/[?&]q=([^&]+)/);
  if (qMatch) return decodeURIComponent(qMatch[1].replace(/\+/g, " "));

  const searchMatch = url.match(/\/maps\/search\/([^/@?#]+)/);
  if (searchMatch) return decodeURIComponent(searchMatch[1].replace(/\+/g, " "));

  return "";
}

function normalizeJordanPhone(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/[\s\-().]/g, "");
  if (cleaned.startsWith("+9627")) return "0" + cleaned.slice(4);
  if (cleaned.startsWith("9627")) return "0" + cleaned.slice(3);
  return cleaned;
}

placesRouter.post("/places/lookup", async (req, res) => {
  const { url } = req.body as { url?: string };
  if (!url?.trim()) return res.status(400).json({ error: "URL مطلوب" });

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "مفتاح API غير مهيأ" });

  try {
    let resolvedUrl = url.trim();
    if (/goo\.gl|maps\.app/.test(resolvedUrl)) {
      resolvedUrl = await resolveShortUrl(resolvedUrl);
    }

    const searchQuery = extractSearchQuery(resolvedUrl);
    if (!searchQuery) {
      return res.status(400).json({ error: "تعذر استخراج اسم المكان من الرابط. جرب نسخ الرابط الكامل من Google Maps." });
    }

    const findRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json` +
        `?input=${encodeURIComponent(searchQuery)}&inputtype=textquery` +
        `&fields=place_id&key=${apiKey}`
    );
    const findData = (await findRes.json()) as {
      candidates?: { place_id: string }[];
      status: string;
    };

    if (!findData.candidates?.length) {
      return res.status(404).json({
        error: `لم يتم العثور على المكان (${findData.status}). تحقق من الرابط وحاول مجدداً.`,
      });
    }

    const placeId = findData.candidates[0].place_id;

    const fields =
      "name,formatted_address,rating,formatted_phone_number,international_phone_number,opening_hours";
    const detailRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json` +
        `?place_id=${encodeURIComponent(placeId)}&fields=${fields}&language=ar&key=${apiKey}`
    );
    const detailData = (await detailRes.json()) as {
      status: string;
      result?: {
        name?: string;
        formatted_address?: string;
        rating?: number;
        formatted_phone_number?: string;
        international_phone_number?: string;
        opening_hours?: {
          periods?: {
            open?: { day: number; time: string };
            close?: { day: number; time: string };
          }[];
        };
      };
    };

    if (detailData.status !== "OK" || !detailData.result) {
      return res.status(404).json({ error: "تعذر جلب تفاصيل المكان من Google Maps." });
    }

    const place = detailData.result;

    let startHour = "";
    let endHour = "";
    const workingDays: string[] = [];

    const periods = place.opening_hours?.periods ?? [];
    if (periods.length) {
      const first = periods[0];
      if (first.open?.time) {
        const t = first.open.time;
        startHour = `${t.slice(0, 2)}:${t.slice(2)}`;
      }
      if (first.close?.time) {
        const t = first.close.time;
        endHour = `${t.slice(0, 2)}:${t.slice(2)}`;
      }

      const daySet = new Set<number>();
      for (const p of periods) {
        if (p.open?.day !== undefined) daySet.add(p.open.day);
      }
      for (const d of JORDAN_ORDER) {
        if (daySet.has(d)) workingDays.push(DAYS_AR[d]);
      }
    }

    const rawPhone =
      place.formatted_phone_number || place.international_phone_number || "";

    return res.json({
      name: place.name ?? "",
      address: place.formatted_address ?? "",
      rating: place.rating ?? null,
      phone: normalizeJordanPhone(rawPhone),
      startHour,
      endHour,
      workingDays,
    });
  } catch (err) {
    console.error("Places lookup error:", err);
    return res.status(500).json({ error: "خطأ داخلي في الخادم" });
  }
});

export default placesRouter;
