import { NextResponse } from "next/server";
import type { WeatherPayload } from "@/lib/weather";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "Alexandria").trim();

  // Geocoding (cache 24h)
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    q
  )}&count=1&language=en&format=json`;

  const geoRes = await fetch(geoUrl, { next: { revalidate: 60 * 60 * 24 } });
  if (!geoRes.ok) return NextResponse.json({ error: "Geocoding failed" }, { status: 500 });

  const geo = await geoRes.json();
  const first = geo?.results?.[0];
  if (!first) return NextResponse.json({ error: "Not found" }, { status: 404 });

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
  if (!wRes.ok) return NextResponse.json({ error: "Weather failed" }, { status: 500 });

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

  const payload: WeatherPayload = {
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

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
    },
  });
}