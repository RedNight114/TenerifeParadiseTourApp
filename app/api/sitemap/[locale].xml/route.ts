import { NextRequest, NextResponse } from 'next/server'
import { I18N_ENABLED, I18N_DEFAULT_LOCALE, I18N_SUPPORTED } from '@/app/config/i18n'
import { generateLocalizedUrl } from '@/lib/i18n/slugs'

interface SitemapUrl {
  loc: string
  lastmod: string
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}

// Generar sitemap XML simple
function generateSitemapXML(urls: SitemapUrl[]): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return xml
}

// GET /api/sitemap/[locale].xml - Sitemap por locale
export async function GET(
  request: NextRequest,
  { params }: { params: { locale: string } }
) {
  try {
    const { locale } = params
    
    if (!I18N_ENABLED) {
      return NextResponse.json(
        { error: 'I18N is disabled' },
        { status: 400 }
      )
    }

    if (!I18N_SUPPORTED.includes(locale)) {
      return NextResponse.json(
        { error: 'Unsupported locale' },
        { status: 400 }
      )
    }

    const baseUrl = request.nextUrl.origin
    const urls: SitemapUrl[] = []

    // Páginas estáticas para el locale específico
    const staticPages = [
      { path: '/', priority: 1.0, changefreq: 'daily' as const },
      { path: '/services', priority: 0.9, changefreq: 'daily' as const },
      { path: '/about', priority: 0.7, changefreq: 'monthly' as const },
      { path: '/contact', priority: 0.8, changefreq: 'monthly' as const }
    ]

    for (const page of staticPages) {
      const url = generateLocalizedUrl(page.path.replace(/^\//, ''), locale, baseUrl)
      urls.push({
        loc: url,
        lastmod: new Date().toISOString(),
        changefreq: page.changefreq,
        priority: page.priority
      })
    }

    // Servicios disponibles en este locale
    const services = await getServicesForLocale(locale)
    
    for (const service of services) {
      const url = generateLocalizedUrl(service.slug, locale, baseUrl)
      urls.push({
        loc: url,
        lastmod: service.updatedAt,
        changefreq: 'weekly' as const,
        priority: 0.8
      })
    }

    const sitemapXML = generateSitemapXML(urls)

    return new NextResponse(sitemapXML, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600' // Cache por 1 hora
      }
    })
  } catch (error) {
    console.error('Error generating locale sitemap:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Mock function - would query Supabase
async function getServicesForLocale(locale: string): Promise<Array<{
  slug: string
  updatedAt: string
}>> {
  // Mock data filtrada por locale
  const allServices = [
    {
      slug: 'blue-ocean-catamaran',
      locales: ['en', 'es', 'de', 'fr'],
      updatedAt: '2024-01-20T10:00:00Z'
    },
    {
      slug: 'teide-national-park-tour',
      locales: ['en', 'es'],
      updatedAt: '2024-01-19T15:30:00Z'
    },
    {
      slug: 'whale-watching-excursion',
      locales: ['en', 'es', 'de'],
      updatedAt: '2024-01-18T09:15:00Z'
    }
  ]

  return allServices
    .filter(service => service.locales.includes(locale))
    .map(service => ({
      slug: service.slug,
      updatedAt: service.updatedAt
    }))
}
