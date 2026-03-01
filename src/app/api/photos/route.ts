import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "cinematic city night").trim();

  const r = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=20`,
    {
      headers: {
        Authorization: process.env.PEXELS_API_KEY || "",
      },
      next: { revalidate: 60 * 60 * 24 }, // cache 24h
    }
  );

  if (!r.ok) {
    return NextResponse.json({ error: "Pexels failed" }, { status: 500 });
  }

  const data = await r.json();
  const photos = data?.photos || [];
  if (!photos.length) {
    return NextResponse.json({ error: "No photos found" }, { status: 404 });
  }

  // Pick a stable-ish image of the day by hashing date
  const day = new Date().toISOString().slice(0, 10);
  const idx = Math.abs(hash(`${q}-${day}`)) % photos.length;
  const p = photos[idx];

  return NextResponse.json({
    url: p.src?.large2x || p.src?.large || p.src?.original,
    photographer: p.photographer,
    photographer_url: p.photographer_url,
    photo_url: p.url,
    provider: "Pexels",
  });
}

// tiny hash helper
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h | 0;
}