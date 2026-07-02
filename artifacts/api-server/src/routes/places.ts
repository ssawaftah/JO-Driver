import { Router, Request, Response } from "express";
import { logger } from "../lib/logger.js";

const placesRouter = Router();

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

async function getAddressFromCoords(lat: number, lng: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ar&zoom=18`;
    const res = await fetch(url, {
      headers: { "User-Agent": "JODriver/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { display_name?: string };
    if (!data.display_name) return null;
    return data.display_name.replace(/،\s*الأردن$|,\s*Jordan$/i, "").trim();
  } catch {
    return null;
  }
}

placesRouter.post("/places/lookup", async (req: Request, res: Response) => {
  const { url } = req.body as { url?: string };

  if (!url?.trim()) {
    return res.status(400).json({ error: "يرجى إدخال رابط Google Maps" });
  }

  try {
    const resolvedUrl = await resolveUrl(url.trim());

    // Detect iOS app deep-link format (ftid=...) — no name/coords available
    if (/[?&]ftid=/.test(resolvedUrl)) {
      return res.status(400).json({
        error: "رابط التطبيق لا يحتوي على بيانات كافية. افتح الرابط في المتصفح (Chrome أو Safari)، ثم انسخ الرابط من شريط العنوان وأعد لصقه هنا.",
        hint: "app_link",
      });
    }

    const { name: urlName, lat, lng } = parseGoogleMapsUrl(resolvedUrl);

    if (!urlName && lat === null) {
      return res.status(400).json({
        error: "تعذر قراءة الرابط. تأكد من نسخه من صفحة المركز في Google Maps (يجب أن يحتوي على اسم المكان في الرابط).",
      });
    }

    const nominatimAddr = lat !== null && lng !== null
      ? await getAddressFromCoords(lat, lng)
      : null;

    return res.json({
      name: urlName,
      address: nominatimAddr,
      phone: null,
      rating: null,
      startHour: null,
      endHour: null,
      workingDays: [],
    });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: "حدث خطأ أثناء جلب البيانات. يرجى المحاولة مجدداً." });
  }
});

export default placesRouter;
