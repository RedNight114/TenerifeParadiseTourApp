import { I18N_ENABLED, I18N_DEFAULT_LOCALE, I18N_SUPPORTED } from '@/app/config/i18n'

export interface LocalizedSlug {
  locale: string
  slug: string
  isDefault: boolean
}

export interface SlugRedirect {
  fromSlug: string
  toSlug: string
  locale: string
  statusCode: 302 | 308
  createdAt: Date
}

// Función para generar slug a partir de texto
export function generateSlug(text: string, locale: string = I18N_DEFAULT_LOCALE): string {
  if (!text) return ''
  
  // Normalizar texto según locale
  const normalized = normalizeTextForLocale(text, locale)
  
  return normalized
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remover caracteres especiales
    .replace(/[\s_-]+/g, '-') // Reemplazar espacios y guiones múltiples
    .replace(/^-+|-+$/g, '') // Remover guiones al inicio y final
}

// Normalizar texto según locale para mejor generación de slugs
function normalizeTextForLocale(text: string, locale: string): string {
  switch (locale) {
    case 'es':
      return text
        .replace(/ñ/g, 'n')
        .replace(/á/g, 'a')
        .replace(/é/g, 'e')
        .replace(/í/g, 'i')
        .replace(/ó/g, 'o')
        .replace(/ú/g, 'u')
        .replace(/ü/g, 'u')
    case 'de':
      return text
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
    case 'fr':
      return text
        .replace(/à/g, 'a')
        .replace(/á/g, 'a')
        .replace(/â/g, 'a')
        .replace(/ä/g, 'a')
        .replace(/è/g, 'e')
        .replace(/é/g, 'e')
        .replace(/ê/g, 'e')
        .replace(/ë/g, 'e')
        .replace(/ì/g, 'i')
        .replace(/í/g, 'i')
        .replace(/î/g, 'i')
        .replace(/ï/g, 'i')
        .replace(/ò/g, 'o')
        .replace(/ó/g, 'o')
        .replace(/ô/g, 'o')
        .replace(/ö/g, 'o')
        .replace(/ù/g, 'u')
        .replace(/ú/g, 'u')
        .replace(/û/g, 'u')
        .replace(/ü/g, 'u')
        .replace(/ç/g, 'c')
    default:
      return text
  }
}

// Generar slugs para todos los locales soportados
export function generateLocalizedSlugs(
  title: string,
  description?: string,
  customSlugs?: Record<string, string>
): LocalizedSlug[] {
  if (!I18N_ENABLED) {
    return [{
      locale: I18N_DEFAULT_LOCALE,
      slug: generateSlug(title),
      isDefault: true
    }]
  }

  const slugs: LocalizedSlug[] = []
  const baseText = `${title} ${description || ''}`.trim()

  for (const locale of I18N_SUPPORTED) {
    const isDefault = locale === I18N_DEFAULT_LOCALE
    let slug: string

    if (customSlugs && customSlugs[locale]) {
      slug = customSlugs[locale]
    } else {
      slug = generateSlug(baseText, locale)
    }

    slugs.push({
      locale,
      slug,
      isDefault
    })
  }

  return slugs
}

// Resolver slug a partir de URL path
export function resolveSlugFromPath(path: string): { locale: string; slug: string } | null {
  if (!I18N_ENABLED) {
    const slug = path.replace(/^\//, '').replace(/\/$/, '')
    return { locale: I18N_DEFAULT_LOCALE, slug }
  }

  // Patrón: /{locale}/{slug} o /{slug} (default locale)
  const pathSegments = path.replace(/^\//, '').replace(/\/$/, '').split('/')
  
  if (pathSegments.length === 1) {
    // Solo slug, usar locale por defecto
    return { locale: I18N_DEFAULT_LOCALE, slug: pathSegments[0] }
  }
  
  if (pathSegments.length === 2) {
    const [locale, slug] = pathSegments
    if (I18N_SUPPORTED.includes(locale)) {
      return { locale, slug }
    }
  }

  return null
}

// Generar URL localizada
export function generateLocalizedUrl(slug: string, locale: string, baseUrl: string = ''): string {
  if (!I18N_ENABLED || locale === I18N_DEFAULT_LOCALE) {
    return `${baseUrl}/${slug}`
  }
  
  return `${baseUrl}/${locale}/${slug}`
}

// Verificar si un slug necesita redirección
export function needsRedirect(
  currentSlug: string,
  currentLocale: string,
  targetSlug: string,
  targetLocale: string
): SlugRedirect | null {
  if (currentSlug === targetSlug && currentLocale === targetLocale) {
    return null
  }

  return {
    fromSlug: currentSlug,
    toSlug: targetSlug,
    locale: targetLocale,
    statusCode: 302, // Inicialmente 302, cambiar a 308 después de 48h
    createdAt: new Date()
  }
}

// Generar hreflang tags para SEO
export function generateHreflangTags(
  slug: string,
  baseUrl: string,
  availableLocales: string[] = I18N_SUPPORTED
): Array<{ rel: string; hreflang: string; href: string }> {
  const tags: Array<{ rel: string; hreflang: string; href: string }> = []

  for (const locale of availableLocales) {
    const url = generateLocalizedUrl(slug, locale, baseUrl)
    tags.push({
      rel: 'alternate',
      hreflang: locale,
      href: url
    })
  }

  // Añadir x-default (locale por defecto)
  const defaultUrl = generateLocalizedUrl(slug, I18N_DEFAULT_LOCALE, baseUrl)
  tags.push({
    rel: 'alternate',
    hreflang: 'x-default',
    href: defaultUrl
  })

  return tags
}

// Generar canonical URL
export function generateCanonicalUrl(
  slug: string,
  locale: string,
  baseUrl: string
): string {
  return generateLocalizedUrl(slug, locale, baseUrl)
}

// Validar slug único por locale
export async function validateSlugUniqueness(
  slug: string,
  locale: string,
  excludeServiceId?: string
): Promise<boolean> {
  // Mock implementation - would query Supabase
  // SELECT COUNT(*) FROM service_translations WHERE slug = $1 AND locale = $2 AND service_id != $3
  return true
}

// Obtener slug alternativo si el principal no está disponible
export async function getAlternativeSlug(
  baseSlug: string,
  locale: string,
  maxAttempts: number = 5
): Promise<string> {
  let attempt = 0
  let currentSlug = baseSlug

  while (attempt < maxAttempts) {
    const isUnique = await validateSlugUniqueness(currentSlug, locale)
    if (isUnique) {
      return currentSlug
    }

    attempt++
    currentSlug = `${baseSlug}-${attempt}`
  }

  // Fallback: usar timestamp
  return `${baseSlug}-${Date.now()}`
}
