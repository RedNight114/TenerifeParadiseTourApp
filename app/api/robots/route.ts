import { NextResponse } from 'next/server'

export async function GET() {
  const robotsTxt = `# TenerifeParadiseTour&Excursions - Robots.txt
# Generated for SEO optimization

User-agent: *
Allow: /

# Sitemap
Sitemap: https://www.tenerifeparadisetoursexcursions.com/sitemap.xml

# Disallow sensitive areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/
Disallow: /auth/
Disallow: /profile/
Disallow: /reservations/

# Allow important pages
Allow: /services
Allow: /about
Allow: /contact
Allow: /terms
Allow: /privacy-policy

# Crawl delay for all bots
Crawl-delay: 1

# Google AdsBot specific rules
User-agent: AdsBot-Google
Allow: /
Crawl-delay: 1

# Bing Bot specific rules
User-agent: Bingbot
Allow: /
Crawl-delay: 1

# Yandex Bot
User-agent: Yandex
Allow: /
Crawl-delay: 2

# Baidu Bot
User-agent: Baiduspider
Allow: /
Crawl-delay: 2

# DuckDuckGo Bot
User-agent: DuckDuckBot
Allow: /
Crawl-delay: 1

# Facebook Bot
User-agent: facebookexternalhit
Allow: /
Crawl-delay: 1

# Twitter Bot
User-agent: Twitterbot
Allow: /
Crawl-delay: 1

# LinkedIn Bot
User-agent: LinkedInBot
Allow: /
Crawl-delay: 1

# WhatsApp Bot
User-agent: WhatsApp
Allow: /
Crawl-delay: 1
`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
} 