export function getBackgroundUrl(weatherCode: number) {
  // صور عامة حلوة من Wikimedia Commons (ثابتة)
  // تقدر تبدّل الملفات لصور تانية لاحقًا
  if (weatherCode === 0) {
    return "https://commons.wikimedia.org/wiki/Special:FilePath/Blue%20sky%20and%20clouds.jpg?width=1920";
  }
  if ([1, 2, 3].includes(weatherCode)) {
    return "https://commons.wikimedia.org/wiki/Special:FilePath/Cloudscape%20over%20the%20Atlantic%20Ocean.jpg?width=1920";
  }
  if ([45, 48].includes(weatherCode)) {
    return "https://commons.wikimedia.org/wiki/Special:FilePath/Fog%20in%20London.jpg?width=1920";
  }
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
    return "https://commons.wikimedia.org/wiki/Special:FilePath/Rainy%20street%20night.jpg?width=1920";
  }
  if ([71, 73, 75, 77].includes(weatherCode)) {
    return "https://commons.wikimedia.org/wiki/Special:FilePath/Snow%20in%20city%20street.jpg?width=1920";
  }
  if ([95, 96, 99].includes(weatherCode)) {
    return "https://commons.wikimedia.org/wiki/Special:FilePath/Thunderstorm%20over%20city.jpg?width=1920";
  }
  return "https://commons.wikimedia.org/wiki/Special:FilePath/City%20skyline%20at%20night.jpg?width=1920";
}