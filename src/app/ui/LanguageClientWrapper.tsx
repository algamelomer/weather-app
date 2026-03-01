"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Lang } from "@/lib/i18n";
import { dirForLang, t } from "@/lib/i18n";
import LanguageToggle from "@/app/components/LanguageToggle";
import SearchBar from "@/app/components/SearchBar";
import { slugifyCity, weatherToEmoji, codeToDesc } from "@/lib/weather";
import Link from "next/link";

export default function LanguageClientWrapper({ initialLang }: { initialLang: Lang }) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [locLoading, setLocLoading] = useState(true);
  const [weatherList, setWeatherList] = useState<any[]>([]);
  const router = useRouter();
  const tr = t(lang);

  const fetchWeatherForCities = async (cities: string[]) => {
    try {
      setLocLoading(true);
      const uniqueCities = Array.from(new Set(cities));
      const promises = uniqueCities.map(city => 
        fetch(`/api/weather?q=${encodeURIComponent(city)}`).then(res => res.ok ? res.json() : null)
      );
      const results = await Promise.all(promises);
      setWeatherList(results.filter(r => r !== null));
    } catch (err) {
      console.error("Home weather fetch failed", err);
    } finally {
      setLocLoading(false);
    }
  };

  const getNearbyCities = (country: string | null, currentCity: string) => {
    const featured: Record<string, string[]> = {
      "Egypt": ["Cairo", "Alexandria", "Giza", "Luxor", "Aswan", "Sharm El Sheikh"],
      "Saudi Arabia": ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam"],
      "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah"],
      "Jordan": ["Amman", "Aqaba", "Zarqa"],
      "Morocco": ["Casablanca", "Marrakech", "Rabat", "Fes"],
    };

    const countryCities = featured[country || ""] || ["London", "New York", "Tokyo", "Paris", "Dubai"];
    // Filter out current city and take top 3
    const filtered = countryCities.filter(c => c.toLowerCase() !== currentCity.toLowerCase()).slice(0, 3);
    return [currentCity, ...filtered];
  };

  useEffect(() => {
    const last = localStorage.getItem("last_city");
    
    const startDiscovery = async () => {
      const DEFAULT_CITY = "Cairo";
      const DEFAULT_COUNTRY = "Egypt";

      // If we have a last city, show it immediately while we try to get location
      if (last) {
        fetchWeatherForCities([last]);
      } else {
        // Initial fallback if no last city and waiting for geo
        fetchWeatherForCities(getNearbyCities(DEFAULT_COUNTRY, DEFAULT_CITY));
      }

      if (!navigator.geolocation) {
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const rev = await fetch(`/api/reverse?lat=${latitude}&lon=${longitude}`);
            if (!rev.ok) throw new Error("reverse failed");
            const { city, country } = await rev.json();

            localStorage.setItem("last_city", city);
            const citiesToFetch = getNearbyCities(country, city);
            fetchWeatherForCities(citiesToFetch);
          } catch {
            // If reverse fails, we already have the fallback from above or 'last'
          }
        },
        () => {
          // Denied or error - fallback already handled by the start of the function
        },
        { enableHighAccuracy: false, timeout: 5000 }
      );
    };

    startDiscovery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div dir={dirForLang(lang)}>
      <div className="flex items-center justify-between gap-3">
        <LanguageToggle
          lang={lang}
          onChange={(l) => {
            setLang(l);
            localStorage.setItem("last_lang", l);
            router.push(`/?lang=${l}`);
          }}
        />
      </div>

      <div className="mt-8">
        <SearchBar initial="" lang={lang} />
      </div>

      <div className="mt-10">
        <h3 className="text-xl font-bold mb-4 px-1">
          {lang === 'ar' ? 'الطقس اليوم في مدينتك والمدن المجاورة' : 'Weather today in your city & nearby'}
        </h3>
        
        {locLoading && weatherList.length === 0 ? (
          <div className="rounded-2xl glass p-6 text-center animate-pulse">
            <div className="text-white/60">
              {lang === "ar" ? "جاري تحميل حالة الطقس..." : "Loading weather..."}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weatherList.map((weather, idx) => (
              <Link
                key={weather.place + idx}
                href={`/city/${slugifyCity(weather.place.split(",")[0])}?q=${encodeURIComponent(
                  weather.place.split(",")[0]
                )}&lang=${lang}`}
                className="block group"
              >
                <div className="h-full rounded-3xl glass p-6 hover:bg-white/10 transition-all border border-white/5 group-hover:border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-extrabold flex items-center gap-2">
                        {weatherToEmoji(weather.current.code)} {weather.place.split(',')[0]}
                      </h2>
                      <p className="text-sm text-white/60">
                        {codeToDesc(weather.current.code, lang)}
                      </p>
                    </div>
                    <div className="text-3xl font-black">
                      {weather.current.tempC}°
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-3">
                    <div className="bg-white/5 rounded-xl px-3 py-2 flex-1">
                      <div className="text-[9px] uppercase tracking-wider text-white/40">{tr.wind}</div>
                      <div className="text-sm font-bold">{weather.current.windKph} <span className="text-[10px] font-normal">km/h</span></div>
                    </div>
                    <div className="bg-white/5 rounded-xl px-3 py-2 flex-1">
                      <div className="text-[9px] uppercase tracking-wider text-white/40">{tr.humidity}</div>
                      <div className="text-sm font-bold">{weather.current.humidity}%</div>
                    </div>
                  </div>

                  <div className="mt-4 text-xs font-bold text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    {tr.openCityPage} {lang === 'ar' ? '←' : '→'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
