import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/home', '/auth/login', '/auth/signup'],
        disallow: ['/dashboard/', '/api/', '/super-admin/', '/admin/'],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://fastenr.com'}/sitemap.xml`,
  }
}