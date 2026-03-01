export type Lang = "en" | "ar";

export function normalizeLang(v?: string | null): Lang {
  return v === "ar" ? "ar" : "en";
}

export function dirForLang(lang: Lang) {
  return lang === "ar" ? "rtl" : "ltr";
}

export function t(lang: Lang) {
  const isAr = lang === "ar";
  return {
    appTitle: isAr ? "طقس اليوم" : "Weather Today",
    tagline: isAr
      ? "توقعات 7 أيام مع خلفية صور جميلة"
      : "7-day forecast with beautiful photo backgrounds",
    searchPlaceholder: isAr ? "ابحث عن مدينة… (مثال: القاهرة)" : "Search city… (e.g. Cairo)",
    searchBtn: isAr ? "بحث" : "Search",
    updated: isAr ? "آخر تحديث" : "Updated",
    humidity: isAr ? "الرطوبة" : "Humidity",
    wind: isAr ? "الرياح" : "Wind",
    temp: isAr ? "الحرارة" : "Temp",
    forecast7: isAr ? "توقعات 7 أيام" : "7-day Forecast",
    adLabel: isAr ? "إعلان" : "Ad",
    notFound: isAr ? "المدينة غير موجودة" : "City not found",
    openCityPage: isAr ? "افتح صفحة المدينة" : "Open city page",
    metaDescription: isAr 
      ? "توقعات الطقس لمدة 7 أيام مع خلفيات صور سينمائية جميلة. ابحث عن أي مدينة واحصل على حالة الطقس الحالية والتوقعات الأسبوعية."
      : "7-day weather forecast with beautiful cinematic photo backgrounds. Search any city and get current weather and weekly forecasts.",
    keywords: isAr
      ? "طقس, توقعات الطقس, طقس اليوم, درجة الحرارة, رياح, رطوبة, خرائط الطقس"
      : "weather, forecast, weather today, temperature, wind, humidity, weather maps, weather forecast 7 days",
  };
}