export type WeatherPayload = {
  place: string;
  country?: string;
  lat: number;
  lon: number;
  tz: string;

  current: {
    tempC: number;
    windKph: number;
    humidity: number | null;
    code: number;
    time: string;
  };

  daily: Array<{
    date: string; // YYYY-MM-DD
    minC: number;
    maxC: number;
    code: number;
    precipProb: number | null;
  }>;
};

export function codeToDesc(code: number, lang: "en" | "ar") {
  const map: Record<string, { en: string; ar: string }> = {
    clear: { en: "Clear sky", ar: "سماء صافية" },
    partly: { en: "Partly cloudy", ar: "غائم جزئياً" },
    fog: { en: "Fog", ar: "ضباب" },
    drizzle: { en: "Drizzle", ar: "رذاذ" },
    rain: { en: "Rain", ar: "أمطار" },
    snow: { en: "Snow", ar: "ثلوج" },
    showers: { en: "Rain showers", ar: "زخات مطر" },
    thunder: { en: "Thunderstorm", ar: "عاصفة رعدية" },
    weather: { en: "Weather", ar: "الطقس" },
  };

  let key = "weather";
  if (code === 0) key = "clear";
  else if ([1, 2, 3].includes(code)) key = "partly";
  else if ([45, 48].includes(code)) key = "fog";
  else if ([51, 53, 55, 56, 57].includes(code)) key = "drizzle";
  else if ([61, 63, 65, 66, 67].includes(code)) key = "rain";
  else if ([71, 73, 75, 77].includes(code)) key = "snow";
  else if ([80, 81, 82].includes(code)) key = "showers";
  else if ([95, 96, 99].includes(code)) key = "thunder";

  return map[key][lang];
}

export function weatherToEmoji(code: number) {
  if (code === 0) return "☀️";
  if ([1, 2, 3].includes(code)) return "⛅";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75, 77].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌡️";
}

export function backgroundQuery(desc: string, place: string) {
  const d = desc.toLowerCase();
  // نديها “premium vibe”
  if (d.includes("clear")) return `cinematic city night lights, ${place}`;
  if (d.includes("cloud")) return `cinematic cloudy skyline, ${place}`;
  if (d.includes("fog")) return `moody fog street, ${place}`;
  if (d.includes("rain")) return `rainy neon street, reflections, ${place}`;
  if (d.includes("snow")) return `snow city cinematic, ${place}`;
  if (d.includes("thunder")) return `dramatic storm clouds, cinematic, ${place}`;
  return `cinematic cityscape, ${place}`;
}

export function slugifyCity(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[\u0600-\u06FF]/g, (m) => m) // keep Arabic
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatDayLabel(date: string, lang: "en" | "ar") {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}