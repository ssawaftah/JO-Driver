import { Router, Request, Response } from "express";
import { logger } from "../lib/logger.js";

const placesRouter = Router();

// ---------- helpers ----------

function parseGoogleMapsUrl(url: string) {
  const nameMatch = url.match(/\/maps\/place\/([^/@?&#]+)/);
  const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);

  const name = nameMatch
    ? decodeURIComponent(nameMatch[1]).replace(/\+/g, " ").trim()
    : null;
  const lat = coordsMatch ? parseFloat(coordsMatch[1]) : null;
  const lng = coordsMatch ? parseFloat(coordsMatch[2]) : null;

  return { name, lat, lng };
}

async function resolveUrl(url: string): Promise<string> {
  if (!/maps\.app\.goo\.gl|goo\.gl\/maps/.test(url)) return url;
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });
    return res.url || url;
  } catch {
    return url;
  }
}

function normalizeJordanPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-().]/g, "");
  if (cleaned.startsWith("+9627")) return "0" + cleaned.slice(4);
  if (cleaned.startsWith("9627")) return "0" + cleaned.slice(3);
  if (cleaned.startsWith("+9626")) return "0" + cleaned.slice(4);
  return cleaned;
}

interface ScrapedData {
  name?: string;
  address?: string;
  phone?: string;
  rating?: number;
  startHour?: string;
  endHour?: string;
  workingDays?: string[];
}

async function scrapeGoogleMaps(url: string): Promise<ScrapedData> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept-Language": "ar-JO,ar;q=0.9,en;q=0.5",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(12000),
  });

  const html = await res.text();
  const result: ScrapedData = {};

  // --- name from <title> (reject generic Google Maps titles) ---
  const titleM = html.match(/<title>([^<]+?)\s*(?:[-–·]\s*Google Maps)?<\/title>/i);
  if (titleM) {
    const t = titleM[1].trim();
    if (t && !/google maps|خرائط\s*google|گوگل\s*مپ/i.test(t)) result.name = t;
  }

  // --- meta description: rating + hours ---
  const metaM =
    html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) ||
    html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);
  if (metaM) {
    const desc = metaM[1];

    const ratingM = desc.match(/★\s*([\d.]+)|([\d.]+)\s*★/);
    if (ratingM) result.rating = parseFloat(ratingM[1] ?? ratingM[2]);

    // "08:00 - 16:00" or "08:00–16:00"
    const hoursM = desc.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);
    if (hoursM) {
      result.startHour = hoursM[1];
      result.endHour = hoursM[2];
    }
    const openM = desc.match(/(?:يفتح|يُفتح|opens?)\D{0,20}?(\d{1,2}:\d{2})/i);
    const closeM = desc.match(/(?:يغلق|يُغلق|closes?)\D{0,20}?(\d{1,2}:\d{2})/i);
    if (openM && !result.startHour) result.startHour = openM[1];
    if (closeM && !result.endHour) result.endHour = closeM[1];
  }

  // --- Jordan phone patterns anywhere in HTML ---
  const phoneM = html.match(
    /(?:\+962\s?7[\d\s\-]{8,12}|\+962\s?[23][\d\s\-]{7,11}|07\d{8})/
  );
  if (phoneM) result.phone = normalizeJordanPhone(phoneM[0]);

  // --- JSON-LD structured data ---
  const jsonLds = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const m of jsonLds) {
    try {
      const obj = JSON.parse(m[1]) as Record<string, unknown>;
      if (!result.name && typeof obj.name === "string") result.name = obj.name;
      if (!result.phone && typeof obj.telephone === "string") {
        result.phone = normalizeJordanPhone(obj.telephone);
      }
      if (!result.rating) {
        const ar = obj.aggregateRating as Record<string, unknown> | undefined;
        if (ar?.ratingValue) result.rating = parseFloat(String(ar.ratingValue));
      }
      if (!result.address && obj.address) {
        const a = obj.address as Record<string, unknown>;
        const parts = [a.streetAddress, a.addressLocality, a.addressRegion]
          .filter(Boolean)
          .map(String);
        if (parts.length) result.address = parts.join("، ");
      }
    } catch {
      /* skip malformed JSON-LD */
    }
  }

  return result;
}

async function getAddressFromCoords(lat: number, lng: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ar&zoom=18`;
    const res = await fetch(url, {
      headers: { "User-Agent": "JODriver/1.0 contact@jodriver.jo" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { display_name?: string };
    if (!data.display_name) return null;
    return data.display_name
      .replace(/،\s*الأردن$|,\s*Jordan$/i, "")
      .trim();
  } catch {
    return null;
  }
}

// ---------- route ----------

placesRouter.post("/places/lookup", async (req: Request, res: Response) => {
  const { url } = req.body as { url?: string };

  if (!url?.trim()) {
    return res.status(400).json({ error: "يرجى إدخال رابط Google Maps" });
  }

  try {
    const resolvedUrl = await resolveUrl(url.trim());
    const { name: urlName, lat, lng } = parseGoogleMapsUrl(resolvedUrl);

    if (!urlName && lat === null) {
      return res.status(400).json({
        error:
          "تعذر استخراج معلومات المكان من الرابط. جرب نسخ الرابط الكامل من Google Maps.",
      });
    }

    // Scrape page + Nominatim reverse-geocode in parallel
    const [scrapedResult, nominatimResult] = await Promise.allSettled([
      scrapeGoogleMaps(resolvedUrl),
      lat !== null && lng !== null
        ? getAddressFromCoords(lat, lng)
        : Promise.resolve(null),
    ]);

    const s: ScrapedData =
      scrapedResult.status === "fulfilled" ? scrapedResult.value : {};
    const nominatimAddr: string | null =
      nominatimResult.status === "fulfilled" ? nominatimResult.value : null;

    return res.json({
      name: urlName || s.name,
      address: s.address || nominatimAddr,
      phone: s.phone || null,
      rating: s.rating ?? null,
      startHour: s.startHour || null,
      endHour: s.endHour || null,
      workingDays: s.workingDays || [],
    });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: "حدث خطأ أثناء جلب البيانات. يرجى المحاولة مجدداً." });
  }
});

export default placesRouter;
