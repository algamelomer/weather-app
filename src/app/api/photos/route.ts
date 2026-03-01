import { NextResponse } from "next/server";
import { getPhotos } from "@/lib/api";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  try {
    const photo = await getPhotos(q);
    return NextResponse.json(photo);
  } catch (err: any) {
    const status = err.message === "No photos found" ? 404 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}