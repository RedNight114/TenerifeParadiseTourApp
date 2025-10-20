import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { I18N_ENABLED, I18N_DEFAULT_LOCALE, I18N_SUPPORTED } from '@/app/config/i18n'
import { resolveSlugFromPath, generateLocalizedUrl, needsRedirect } from '@/lib/i18n/slugs'

interface RedirectRule {
  from: string
  to: string
  statusCode: 302 | 308
  createdAt: Date
}

// Cache de redirecciones para evitar consultas repetidas
const redirectCache = new Map<string, RedirectRule>()

export async function handleSlugRedirects(request: NextRequest): Promise<NextResponse | null> {
  if (!I18N_ENABLED) {
    return null
  }

  const { pathname } = request.nextUrl
  const baseUrl = request.nextUrl.origin

  // Solo procesar rutas de servicios (patrón: /services/* o /{locale}/services/*)
  if (!pathname.startsWith('/services/') && !pathname.match(/^\/[a-z]{2}\/services\//)) {
    return null
  }

  try {
    // Resolver slug desde la URL
    const slugInfo = resolveSlugFromPath(pathname)
    if (!slugInfo) {
      return null
    }

    const { locale, slug } = slugInfo

    // Verificar si hay redirección pendiente
    const cacheKey = `${locale}:${slug}`
    const cachedRedirect = redirectCache.get(cacheKey)
    
    if (cachedRedirect) {
      return createRedirectResponse(cachedRedirect.to, cachedRedirect.statusCode)
    }

    // Buscar servicio por slug en la base de datos
    const service = await findServiceBySlug(slug, locale)
    
    if (!service) {
      // Intentar encontrar en otros locales
      const alternativeService = await findServiceBySlugInOtherLocales(slug, locale)
      
      if (alternativeService) {
        const redirectRule: RedirectRule = {
          from: pathname,
          to: generateLocalizedUrl(alternativeService.slug, alternativeService.locale, baseUrl),
          statusCode: 302, // Inicialmente 302
          createdAt: new Date()
        }
        
        redirectCache.set(cacheKey, redirectRule)
        return createRedirectResponse(redirectRule.to, redirectRule.statusCode)
      }
      
      return null
    }

    // Verificar si el slug actual es el correcto
    if (service.slug !== slug || service.locale !== locale) {
      const correctUrl = generateLocalizedUrl(service.slug, service.locale, baseUrl)
      const redirectRule: RedirectRule = {
        from: pathname,
        to: correctUrl,
        statusCode: 302, // Inicialmente 302
        createdAt: new Date()
      }
      
      redirectCache.set(cacheKey, redirectRule)
      return createRedirectResponse(redirectRule.to, redirectRule.statusCode)
    }

    // Actualizar redirecciones antiguas a 308 después de 48h
    await updateOldRedirectsToPermanent()

    return null
  } catch (error) {
    console.error('Error handling slug redirects:', error)
    return null
  }
}

function createRedirectResponse(url: string, statusCode: 302 | 308): NextResponse {
  const response = NextResponse.redirect(url, { status: statusCode })
  
  // Añadir headers para SEO
  response.headers.set('Cache-Control', 'public, max-age=3600') // Cache por 1 hora
  response.headers.set('X-Redirect-Type', statusCode === 302 ? 'temporary' : 'permanent')
  
  return response
}

// Mock function - would query Supabase
async function findServiceBySlug(slug: string, locale: string): Promise<{ slug: string; locale: string } | null> {
  // Mock implementation
  const mockServices = [
    { slug: 'blue-ocean-catamaran', locale: 'en' },
    { slug: 'blauer-ozean-katamaran', locale: 'de' },
    { slug: 'catamaran-ocean-bleu', locale: 'fr' },
    { slug: 'catamaran-oceano-azul', locale: 'es' }
  ]
  
  return mockServices.find(s => s.slug === slug && s.locale === locale) || null
}

// Mock function - would query Supabase
async function findServiceBySlugInOtherLocales(slug: string, excludeLocale: string): Promise<{ slug: string; locale: string } | null> {
  // Mock implementation
  const mockServices = [
    { slug: 'blue-ocean-catamaran', locale: 'en' },
    { slug: 'blauer-ozean-katamaran', locale: 'de' },
    { slug: 'catamaran-ocean-bleu', locale: 'fr' },
    { slug: 'catamaran-oceano-azul', locale: 'es' }
  ]
  
  return mockServices.find(s => s.slug === slug && s.locale !== excludeLocale) || null
}

// Actualizar redirecciones antiguas a permanentes (308)
async function updateOldRedirectsToPermanent(): Promise<void> {
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)
  
  for (const [key, rule] of redirectCache.entries()) {
    if (rule.statusCode === 302 && rule.createdAt < fortyEightHoursAgo) {
      rule.statusCode = 308
      redirectCache.set(key, rule)
    }
  }
}

// Limpiar cache de redirecciones periódicamente
setInterval(() => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  
  for (const [key, rule] of redirectCache.entries()) {
    if (rule.createdAt < oneHourAgo) {
      redirectCache.delete(key)
    }
  }
}, 30 * 60 * 1000) // Cada 30 minutos
