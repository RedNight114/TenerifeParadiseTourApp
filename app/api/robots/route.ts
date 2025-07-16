import { NextResponse } from 'next/server'

export async function GET() {
  const robotsTxt = `# Tenerife Paradise Tours & Excursions - Robots.txt
User-agent: *
Allow: /

# Sitemap
Sitemap: https://tenerifeparadisetoursexcursions.com/sitemap.xml

# Disallow admin areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/

# Allow important pages
Allow: /services
Allow: /about
Allow: /contact
Allow: /booking/

# Crawl delay
Crawl-delay: 1

# Google AdsBot ignores robots.txt unless specifically named
User-agent: AdsBot-Google
Allow: /

# Bing Bot
User-agent: Bingbot
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