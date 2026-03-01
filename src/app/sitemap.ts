import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://weather-east.vercel.app'
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/?lang=ar`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    // For a real production app, you'd fetch popular city slugs here
    // and add them to the sitemap dynamically.
  ]
}
