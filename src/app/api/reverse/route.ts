import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });
  }

  // Nominatim policy: identify your app with a proper User-Agent / Referer
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
    lat
  )}&lon=${encodeURIComponent(lon)}&zoom=10&addressdetails=1`;

  const r = await fetch(url, {
    headers: {
      "User-Agent": "weather-photo-site/1.0 (your-email-or-domain)",
      "Accept-Language": "en",
    },
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!r.ok) return NextResponse.json({ error: "Reverse failed" }, { status: 500 });

  const data = await r.json();
  const addr = data?.address || {};
  const city =
    addr.city || addr.town || addr.village || addr.suburb || addr.county || null;
  const country = addr.country || null;

  if (!city) return NextResponse.json({ error: "City not found" }, { status: 404 });

  return NextResponse.json({ city, country });
}