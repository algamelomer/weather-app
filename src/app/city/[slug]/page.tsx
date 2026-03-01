import type { Metadata } from "next";
import { normalizeLang, dirForLang, t, type Lang } from "@/lib/i18n";
import {
  backgroundQuery,
  codeToDesc,
  weatherToEmoji,
  type WeatherPayload,
} from "@/lib/weather";
import ForecastCards from "@/app/components/ForecastCards";
import Adsense from "@/app/components/Adsense";
import LanguageCityHeader from "./ui/LanguageCityHeader";

async function fetchWeather(q: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/weather?q=${encodeURIComponent(q)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Weather fetch failed");
  return res.json();
}

export async function generateMetadata({
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; lang?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const lang = normalizeLang(sp.lang);
  const q = (sp.q || "").trim();

  const titleCity = q || (lang === "ar" ? "مدينة" : "City");
  const tr = t(lang);

  return {
    title: `${tr.appTitle} • ${titleCity}`,
    description:
      lang === "ar"
        ? `توقعات الطقس لمدة 7 أيام لـ ${titleCity}`
        : `7-day weather forecast for ${titleCity}`,
    alternates: {
      languages: {
        en: `?lang=en&q=${encodeURIComponent(q)}`,
        ar: `?lang=ar&q=${encodeURIComponent(q)}`,
      },
    },
  };
}

export default async function CityPage({
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; lang?: string }>;
}) {
  const sp = await searchParams;
  const lang: Lang = normalizeLang(sp.lang);
  const dir = dirForLang(lang);
  const tr = t(lang);

  const q = (sp.q || "").trim();
  if (!q) {
    // لو دخل city page بدون q
    return (
      <main dir={dir} className="min-h-screen grid place-items-center px-6">
        <div className="max-w-lg rounded-3xl glass p-8 text-center">
          <div className="text-2xl font-extrabold">{tr.notFound}</div>
          <p className="mt-2 text-white/70">
            {lang === "ar"
              ? "ارجع وابحث عن مدينة."
              : "Go back and search for a city."}
          </p>
        </div>
      </main>
    );
  }

  const data = await fetchWeather(q);

  const desc = codeToDesc(data.current.code, lang);
  const emoji = weatherToEmoji(data.current.code);
  const bgQ = backgroundQuery(desc, data.place);

  const photoQuery = `${desc} cinematic city, ${data.place}`;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const photoRes = await fetch(
    `${baseUrl}/api/photos?q=${encodeURIComponent(photoQuery)}`,
    { cache: "no-store" },
  );

  // Fallback for local/dev where NEXT_PUBLIC_SITE_URL isn't set:
  const photo = photoRes.ok ? await photoRes.json() : null;
  const bgUrl =
    photo?.url ||
    "https://images.pexels.com/photos/290275/pexels-photo-290275.jpeg";
  return (
    <main dir={dir} className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-[1.02]"
        style={{ backgroundImage: `url(${bgUrl})` }}
      />
      <div className="absolute inset-0 bg-black/65" />
      <div className="absolute inset-0 bg-grain" />

      <div className="relative mx-auto max-w-6xl px-6 py-10">
        <LanguageCityHeader lang={lang} q={q} />

        {/* Hero Card */}
        <div className="mt-6 rounded-3xl glass p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                {emoji} {data.place}
              </h1>
              <p className="mt-2 text-white/75">
                {desc} • {tr.updated}:{" "}
                {new Date(data.current.time).toLocaleString(
                  lang === "ar" ? "ar-EG" : "en-US",
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="rounded-2xl glass px-4 py-3">
                <div className="text-xs text-white/70">{tr.temp}</div>
                <div className="text-2xl font-extrabold">
                  {data.current.tempC}°C
                </div>
              </div>
              <div className="rounded-2xl glass px-4 py-3">
                <div className="text-xs text-white/70">{tr.wind}</div>
                <div className="text-2xl font-extrabold">
                  {data.current.windKph} km/h
                </div>
              </div>
              <div className="rounded-2xl glass px-4 py-3">
                <div className="text-xs text-white/70">{tr.humidity}</div>
                <div className="text-2xl font-extrabold">
                  {data.current.humidity ?? "—"}%
                </div>
              </div>
            </div>
          </div>

          {/* Ad #1 */}
          <div className="mt-6 rounded-2xl glass p-4">
            <div className="text-xs text-white/60 mb-2">{tr.adLabel}</div>
            <Adsense slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP || ""} />
          </div>

          <ForecastCards lang={lang} daily={data.daily} />

          {/* Ad #2 */}
          <div className="mt-6 rounded-2xl glass p-4">
            <div className="text-xs text-white/60 mb-2">{tr.adLabel}</div>
            <Adsense slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM || ""} />
          </div>
        </div>

        <div className="mt-6 text-xs text-white/60">
          Weather: Open-Meteo • Images: Unsplash Source
        </div>
      </div>
    </main>
  );
}
