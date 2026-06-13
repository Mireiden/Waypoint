import config from "../config/config.js";
import { nominatimResultSchema } from "../schemas/nominatim.schema.js";

const USER_AGENT = "Waypoint/1.0";
const TIMEOUT_MS = 3000;

export const reverseGeocode = async (lng: number, lat: number) => {
  const url = new URL(config.geocoding.nominatimUrl);
  url.search = new URLSearchParams({
    format: "jsonv2",
    lat: String(lat),
    lon: String(lng),
    zoom: "10",
    layer: "address",
  }).toString();

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return { city: null, country: null };

    const parsed = nominatimResultSchema.safeParse(await res.json());
    if (!parsed.success) return { city: null, country: null };

    const a = parsed.data.address;
    return {
      city: a?.village ?? a?.town ?? a?.city ?? a?.municipality ?? null,
      country: a?.country ?? null,
    };
  } catch {
    return { city: null, country: null };
  }
};
