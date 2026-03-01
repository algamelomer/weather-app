"use client";

import type { Lang } from "@/lib/i18n";

export default function LanguageToggle({
  lang,
  onChange,
}: {
  lang: Lang;
  onChange: (l: Lang) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full glass px-2 py-2">
      <button
        onClick={() => onChange("en")}
        className={`px-3 py-1.5 rounded-full text-sm font-bold transition ${
          lang === "en" ? "bg-white/20" : "hover:bg-white/10"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => onChange("ar")}
        className={`px-3 py-1.5 rounded-full text-sm font-bold transition ${
          lang === "ar" ? "bg-white/20" : "hover:bg-white/10"
        }`}
      >
        عربي
      </button>
    </div>
  );
}