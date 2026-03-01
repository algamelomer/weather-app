import { NextResponse } from "next/server";
import { getWeather } from "@/lib/api";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "Alexandria").trim();

  try {
    const payload = await getWeather(q);
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
      },
    });
  } catch (err: any) {
    const status = err.message === "City not found" ? 404 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}