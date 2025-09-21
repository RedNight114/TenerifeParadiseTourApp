import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-unified'
import { unifiedCache } from '@/lib/unified-cache-system'

export async function GET() {
  try {
    // Intentar obtener del caché primero
    const cacheKey = 'sitemap_xml'
    const cached = await unifiedCache.get(cacheKey)
    if (cached && typeof cached === 'string') {
      return new NextResponse(cached, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600, s-maxage=86400',
          'X-Cache': 'HIT'
        },
      })
    }

    // Obtener servicios para el sitemap con consulta optimizada
    const client = await getSupabaseClient()
    if (!client) {
      return new NextResponse('Error de conexión con la base de datos', { status: 500 })
    }

    const { data: services } = await client
      .from('services')
      .select('id, updated_at')
      .eq('available', true)
      .order('updated_at', { ascending: false })
      .limit(1000) // Limitar para evitar sitemaps muy grandes

    const baseUrl = 'https://tenerifeparadisetoursexcursions.com'
    const currentDate = new Date().toISOString()

    // Páginas estáticas
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/services', priority: '0.9', changefreq: 'daily' },
      { url: '/about', priority: '0.8', changefreq: 'monthly' },
      { url: '/contact', priority: '0.7', changefreq: 'monthly' },
      { url: '/auth/login', priority: '0.6', changefreq: 'monthly' },
      { url: '/auth/register', priority: '0.6', changefreq: 'monthly' },
      { url: '/terms', priority: '0.3', changefreq: 'yearly' },
      { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
    ]

    // Generar XML del sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`

    // Añadir páginas estáticas
    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    })

    // Añadir páginas de servicios
    if (services) {
      services.forEach((service: any) => {
        const lastmod = service.updated_at 
          ? new Date(String(service.updated_at)).toISOString()
          : currentDate
        
        sitemap += `
  <url>
    <loc>${baseUrl}/booking/${service.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
      })
    }

    sitemap += `
</urlset>`

    // Guardar en caché por 1 hora
    await unifiedCache.set(cacheKey, sitemap, { ttl: 60 * 60 * 1000 })

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        'X-Cache': 'MISS'
      },
    })
  } catch (error) {
    // Fallback sitemap básico
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://tenerifeparadisetoursexcursions.com/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://tenerifeparadisetoursexcursions.com/services</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`

    return new NextResponse(fallbackSitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    })
  }
} 

