"use client";

import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/i18n";
import { slugifyCity, weatherToEmoji } from "@/lib/weather";
import { t } from "@/lib/i18n";
import { useState, useEffect, useRef } from "react";

export default function SearchBar({
  initial,
  lang,
}: {
  initial: string;
  lang: Lang;
}) {
  const [q, setQ] = useState(initial);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDirty, setIsDirty] = useState(false); // New state to prevent auto-open
  const router = useRouter();
  const tr = t(lang);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (q.trim().length >= 2 && isDirty) { // Only fetch if user typed
        setLoading(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
          if (res.ok) {
            const data = await res.json();
            setResults(data.results || []);
            setShowDropdown(true);
          }
        } catch (err) {
          console.error("Autocomplete failed", err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [q, isDirty]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (city: string) => {
    setQ(""); // Reset or set to city? Reset usually better for next search
    setShowDropdown(false);
    router.push(`/city/${slugifyCity(city)}?q=${encodeURIComponent(city)}&lang=${lang}`);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const city = q.trim();
          if (!city) return;
          handleSelect(city);
        }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <input
          value={q}
          onFocus={() => q.length >= 2 && isDirty && setShowDropdown(true)}
          onChange={(e) => {
            setQ(e.target.value);
            setIsDirty(true);
          }}
          placeholder={tr.searchPlaceholder}
          className="w-full flex-1 rounded-2xl glass px-4 py-3 outline-none placeholder:text-white/45 focus:border-white/25"
        />
        <button
          type="submit"
          className="rounded-2xl px-5 py-3 font-extrabold glass hover:bg-white/15 active:scale-[0.99] transition"
        >
          {tr.searchBtn}
        </button>
      </form>

      {showDropdown && (results.length > 0 || loading) && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl glass overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          {loading ? (
            <div className="p-4 text-center text-white/50 animate-pulse text-sm">
              {lang === 'ar' ? 'جاري البحث...' : 'Searching...'}
            </div>
          ) : (
            <ul className="max-h-60 overflow-y-auto scrollbar-none">
              {results.map((r, i) => (
                <li key={i}>
                  <button
                    onClick={() => handleSelect(r.name)}
                    className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors flex items-center justify-between group"
                    style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-white group-hover:text-blue-400 transition-colors">
                        {r.name}
                      </span>
                      <span className="text-xs text-white/50">
                        {r.admin1 ? `${r.admin1}, ` : ""}{r.country}
                      </span>
                    </div>
                    <span className="text-white/20 group-hover:translate-x-1 transition-transform">
                      {lang === 'ar' ? '←' : '→'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}