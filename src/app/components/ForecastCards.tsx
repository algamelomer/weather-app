import type { Lang } from "@/lib/i18n";
import { codeToDesc, formatDayLabel, weatherToEmoji, type WeatherPayload } from "@/lib/weather";
import { t } from "@/lib/i18n";

export default function ForecastCards({
  lang,
  daily,
}: {
  lang: Lang;
  daily: WeatherPayload["daily"];
}) {
  const tr = t(lang);

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-lg sm:text-xl font-extrabold">{tr.forecast7}</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {daily.map((d) => {
          const desc = codeToDesc(d.code, lang);
          return (
            <div key={d.date} className="rounded-2xl glass p-4 hover:bg-white/12 transition">
              <div className="text-xs text-white/70">{formatDayLabel(d.date, lang)}</div>
              <div className="mt-2 flex items-center gap-2">
                <div className="text-2xl">{weatherToEmoji(d.code)}</div>
                <div className="text-sm font-bold leading-tight">{desc}</div>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <div className="text-2xl font-extrabold">{d.maxC}°</div>
                <div className="text-sm text-white/70">{d.minC}°</div>
              </div>
              <div className="mt-2 text-xs text-white/70">
                {d.precipProb == null ? "—" : `${d.precipProb}%`}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}