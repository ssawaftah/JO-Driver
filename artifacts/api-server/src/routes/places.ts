import { Router, Request, Response } from "express";
import { createRequire } from "module";
import { logger } from "../lib/logger.js";

const require = createRequire(import.meta.url);
const { S2 } = require("s2-geometry");

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

function extractFtidCoords(url: string): { lat: number; lng: number } | null {
  // ftid format: ftid=0xHEX:0xHEX — first hex is S2 CellID
  const match = url.match(/[?&]ftid=(0x[0-9a-f]+)/i);
  if (!match) return null;
  try {
    const decimal = BigInt(match[1]).toString();
    const result = S2.idToLatLng(decimal) as { lat: number; lng: number };
    if (
      typeof result.lat === "number" &&
      typeof result.lng === "number" &&
      isFinite(result.lat) &&
      isFinite(result.lng)
    ) {
      return result;
    }
  } catch {
    // ignore
  }
  return null;
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
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ar&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "JODriver/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      display_name?: string;
      address?: {
        neighbourhood?: string;
        suburb?: string;
        county?: string;
        state?: string;
        city?: string;
      };
    };
    const a = data.address || {};
    // City: state or city field
    const city = a.state || a.city || "";
    // Area: neighbourhood first, then suburb, then county
    const area = a.neighbourhood || a.suburb || a.county || "";
    if (!city) return null;
    return area ? `${area}، ${city}` : city;
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

    // ── Path A: standard /maps/place/NAME/@lat,lng URL ──────────────────────
    const { name: urlName, lat: urlLat, lng: urlLng } = parseGoogleMapsUrl(resolvedUrl);

    if (urlName || urlLat !== null) {
      const address =
        urlLat !== null && urlLng !== null
          ? await getAddressFromCoords(urlLat, urlLng)
          : null;
      return res.json({
        name: urlName,
        address,
        phone: null,
        rating: null,
        startHour: null,
        endHour: null,
        workingDays: [],
      });
    }

    // ── Path B: iOS app deep-link → ftid=0xHEX format ───────────────────────
    const ftidCoords = extractFtidCoords(resolvedUrl);
    if (ftidCoords) {
      const address = await getAddressFromCoords(ftidCoords.lat, ftidCoords.lng);
      return res.json({
        name: null,          // can't extract name from ftid without API key
        address,
        phone: null,
        rating: null,
        startHour: null,
        endHour: null,
        workingDays: [],
      });
    }

    // ── Nothing worked ───────────────────────────────────────────────────────
    return res.status(400).json({
      error: "تعذر قراءة الرابط. تأكد من نسخه من صفحة المركز في Google Maps.",
    });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: "حدث خطأ أثناء جلب البيانات. يرجى المحاولة مجدداً." });
  }
});

export default placesRouter;
