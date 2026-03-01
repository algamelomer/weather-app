"use client";

import type { Lang } from "@/lib/i18n";
import { dirForLang } from "@/lib/i18n";
import LanguageToggle from "@/app/components/LanguageToggle";
import { useRouter } from "next/navigation";
import SearchBar from "@/app/components/SearchBar";

export default function LanguageCityHeader({ lang, q }: { lang: Lang; q: string }) {
  const router = useRouter();

  return (
    <div dir={dirForLang(lang)} className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => router.push(`/?lang=${lang}`)}
          className="rounded-full glass px-4 py-2 font-bold hover:bg-white/15 transition"
        >
          {lang === "ar" ? "← الرئيسية" : "← Home"}
        </button>

        <LanguageToggle
          lang={lang}
          onChange={(l) => router.push(`?lang=${l}&q=${encodeURIComponent(q)}`)}
        />
      </div>

      <SearchBar initial={q} lang={lang} />
    </div>
  );
}