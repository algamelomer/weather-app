import { WeatherPayload } from "./weather";

export async function getWeather(q: string): Promise<WeatherPayload> {
  // Geocoding (cache 24h)
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    q
  )}&count=1&language=en&format=json`;

  const geoRes = await fetch(geoUrl, { next: { revalidate: 60 * 60 * 24 } });
  if (!geoRes.ok) throw new Error("Geocoding failed");

  const geo = await geoRes.json();
  const first = geo?.results?.[0];
  if (!first) throw new Error("City not found");

  const lat = first.latitude;
  const lon = first.longitude;
  const place = first.name as string;
  const country = (first.country as string | undefined) ?? undefined;

  // Forecast 7 days (cache 15min)
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&forecast_days=7&timezone=auto`;

  const wRes = await fetch(url, { next: { revalidate: 60 * 15 } });
  if (!wRes.ok) throw new Error("Weather failed");

  const w = await wRes.json();

  const days: WeatherPayload["daily"] = (w.daily.time || []).map((date: string, i: number) => ({
    date,
    minC: Math.round(w.daily.temperature_2m_min?.[i]),
    maxC: Math.round(w.daily.temperature_2m_max?.[i]),
    code: w.daily.weather_code?.[i],
    precipProb:
      typeof w.daily.precipitation_probability_max?.[i] === "number"
        ? w.daily.precipitation_probability_max[i]
        : null,
  }));

  return {
    place: country ? `${place}, ${country}` : place,
    country,
    lat,
    lon,
    tz: w.timezone ?? "auto",
    current: {
      tempC: Math.round(w.current.temperature_2m),
      windKph: Math.round(w.current.wind_speed_10m),
      humidity: typeof w.current.relative_humidity_2m === "number" ? w.current.relative_humidity_2m : null,
      code: w.current.weather_code,
      time: w.current.time,
    },
    daily: days,
  };
}

export async function getPhotos(q: string) {
  const query = q || "cinematic city night";
  const r = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=20`,
    {
      headers: {
        Authorization: process.env.PEXELS_API_KEY || "",
      },
      next: { revalidate: 60 * 60 * 24 }, // cache 24h
    }
  );

  if (!r.ok) throw new Error("Pexels failed");

  const data = await r.json();
  const photos = data?.photos || [];
  if (!photos.length) throw new Error("No photos found");

  // Pick a stable-ish image of the day by hashing date
  const day = new Date().toISOString().slice(0, 10);
  const idx = Math.abs(hash(`${query}-${day}`)) % photos.length;
  const p = photos[idx];

  return {
    url: p.src?.large2x || p.src?.large || p.src?.original,
    photographer: p.photographer,
    photographer_url: p.photographer_url,
    photo_url: p.url,
    provider: "Pexels",
  };
}

// tiny hash helper
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h | 0;
}
