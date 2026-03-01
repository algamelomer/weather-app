import { normalizeLang, dirForLang, t } from "@/lib/i18n";
import LanguageClientWrapper from "@/app/ui/LanguageClientWrapper";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const sp = await searchParams;
  const lang = normalizeLang(sp.lang);
  const tr = t(lang);
  const dir = dirForLang(lang);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const photoRes = await fetch(
    `${baseUrl}/api/photos?q=scenic cityscape`,
    { cache: "no-store" }
  );
  const photo = photoRes.ok ? await photoRes.json() : null;
  const bgUrl = photo?.url || "https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg";

  return (
    <main dir={dir} className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-[1.02]"
        style={{ backgroundImage: `url(${bgUrl})` }}
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-grain" />

      <div className="relative mx-auto max-w-5xl px-6 py-14">
        <LanguageClientWrapper initialLang={lang} />

        <div className="mt-10 rounded-3xl glass p-8 sm:p-10">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {tr.appTitle}
          </h1>
          <p className="mt-3 text-white/75">{tr.tagline}</p>

          <div className="mt-8">
            {/* Search bar + route to city page */}
            {/* This is a client component */}
            {/** rendered inside wrapper */}
          </div>
        </div>
      </div>
    </main>
  );
}