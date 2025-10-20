import { NextRequest, NextResponse } from 'next/server'
import { I18N_ENABLED, I18N_DEFAULT_LOCALE, I18N_SUPPORTED } from '@/app/config/i18n'
import { generateLocalizedUrl } from '@/lib/i18n/slugs'

interface SitemapUrl {
  loc: string
  lastmod: string
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
  alternates?: Array<{
    hreflang: string
    href: string
  }>
}

// Generar sitemap XML
function generateSitemapXML(urls: SitemapUrl[]): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(url => {
  const alternatesXML = url.alternates?.map(alt => 
    `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}" />`
  ).join('\n') || ''
  
  return `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
${alternatesXML ? '\n' + alternatesXML + '\n' : ''}  </url>`
}).join('\n')}
</urlset>`

  return xml
}

// GET /api/sitemap.xml - Sitemap principal
export async function GET(request: NextRequest) {
  try {
    const baseUrl = request.nextUrl.origin
    const urls: SitemapUrl[] = []

    // Páginas estáticas
    const staticPages = [
      { path: '/', priority: 1.0, changefreq: 'daily' as const },
      { path: '/services', priority: 0.9, changefreq: 'daily' as const },
      { path: '/about', priority: 0.7, changefreq: 'monthly' as const },
      { path: '/contact', priority: 0.8, changefreq: 'monthly' as const }
    ]

    for (const page of staticPages) {
      if (I18N_ENABLED) {
        // Generar URLs para todos los locales
        for (const locale of I18N_SUPPORTED) {
          const url = generateLocalizedUrl(page.path.replace(/^\//, ''), locale, baseUrl)
          const alternates = I18N_SUPPORTED.map(altLocale => ({
            hreflang: altLocale,
            href: generateLocalizedUrl(page.path.replace(/^\//, ''), altLocale, baseUrl)
          }))

          urls.push({
            loc: url,
            lastmod: new Date().toISOString(),
            changefreq: page.changefreq,
            priority: page.priority,
            alternates
          })
        }
      } else {
        urls.push({
          loc: `${baseUrl}${page.path}`,
          lastmod: new Date().toISOString(),
          changefreq: page.changefreq,
          priority: page.priority
        })
      }
    }

    // Servicios dinámicos
    const services = await getServicesForSitemap()
    
    for (const service of services) {
      if (I18N_ENABLED) {
        // Generar URLs para todos los locales donde existe el servicio
        for (const locale of service.availableLocales) {
          const url = generateLocalizedUrl(service.slug, locale, baseUrl)
          const alternates = service.availableLocales.map(altLocale => ({
            hreflang: altLocale,
            href: generateLocalizedUrl(service.slug, altLocale, baseUrl)
          }))

          urls.push({
            loc: url,
            lastmod: service.updatedAt,
            changefreq: 'weekly' as const,
            priority: 0.8,
            alternates
          })
        }
      } else {
        urls.push({
          loc: `${baseUrl}/services/${service.slug}`,
          lastmod: service.updatedAt,
          changefreq: 'weekly' as const,
          priority: 0.8
        })
      }
    }

    const sitemapXML = generateSitemapXML(urls)

    return new NextResponse(sitemapXML, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600' // Cache por 1 hora
      }
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Mock function - would query Supabase
async function getServicesForSitemap(): Promise<Array<{
  slug: string
  availableLocales: string[]
  updatedAt: string
}>> {
  // Mock data
  return [
    {
      slug: 'blue-ocean-catamaran',
      availableLocales: ['en', 'es', 'de', 'fr'],
      updatedAt: '2024-01-20T10:00:00Z'
    },
    {
      slug: 'teide-national-park-tour',
      availableLocales: ['en', 'es'],
      updatedAt: '2024-01-19T15:30:00Z'
    },
    {
      slug: 'whale-watching-excursion',
      availableLocales: ['en', 'es', 'de'],
      updatedAt: '2024-01-18T09:15:00Z'
    }
  ]
}
