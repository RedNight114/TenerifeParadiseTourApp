// Sistema de namespaces para organizar mensajes i18n
export interface MessageNamespace {
  name: string
  messages: Record<string, any>
  locales: string[]
  lastUpdated: Date
}

export interface CoverageMetrics {
  namespace: string
  locale: string
  totalKeys: number
  translatedKeys: number
  coveragePercentage: number
  missingKeys: string[]
  outdatedKeys: string[]
}

export interface LocaleCoverage {
  locale: string
  totalNamespaces: number
  coveredNamespaces: number
  overallCoverage: number
  namespaces: CoverageMetrics[]
}

// Namespaces disponibles
export const I18N_NAMESPACES = {
  COMMON: 'common',
  HOME: 'home',
  SERVICES: 'services',
  RESERVATIONS: 'reservations',
  NAVIGATION: 'navigation',
  FORMS: 'forms',
  ERRORS: 'errors',
  SEO: 'seo'
} as const

export type I18nNamespace = typeof I18N_NAMESPACES[keyof typeof I18N_NAMESPACES]

// Función para cargar mensajes de un namespace específico
export async function loadNamespaceMessages(
  namespace: I18nNamespace,
  locale: string
): Promise<Record<string, any>> {
  try {
    // En producción, esto cargaría desde archivos o base de datos
    const messages = await import(`@/i18n/messages/${locale}/${namespace}.json`)
    return messages.default || messages
  } catch (error) {
    console.warn(`Failed to load namespace ${namespace} for locale ${locale}:`, error)
    return {}
  }
}

// Función para cargar todos los mensajes de un locale
export async function loadAllMessages(locale: string): Promise<Record<string, any>> {
  const allMessages: Record<string, any> = {}
  
  for (const namespace of Object.values(I18N_NAMESPACES)) {
    try {
      const namespaceMessages = await loadNamespaceMessages(namespace, locale)
      allMessages[namespace] = namespaceMessages
    } catch (error) {
      console.warn(`Failed to load namespace ${namespace} for locale ${locale}:`, error)
      allMessages[namespace] = {}
    }
  }
  
  return allMessages
}

// Función para calcular cobertura de un namespace
export function calculateNamespaceCoverage(
  namespace: I18nNamespace,
  locale: string,
  referenceLocale: string = 'es'
): CoverageMetrics {
  // Mock implementation - en producción consultaría la base de datos
  const mockData: Record<string, CoverageMetrics> = {
    'common': {
      namespace: 'common',
      locale,
      totalKeys: 10,
      translatedKeys: locale === 'es' ? 10 : 8,
      coveragePercentage: locale === 'es' ? 100 : 80,
      missingKeys: locale === 'es' ? [] : ['title', 'description'],
      outdatedKeys: []
    },
    'home': {
      namespace: 'home',
      locale,
      totalKeys: 15,
      translatedKeys: locale === 'es' ? 15 : 12,
      coveragePercentage: locale === 'es' ? 100 : 80,
      missingKeys: locale === 'es' ? [] : ['hero.title', 'hero.subtitle', 'features.title'],
      outdatedKeys: []
    },
    'services': {
      namespace: 'services',
      locale,
      totalKeys: 20,
      translatedKeys: locale === 'es' ? 20 : 16,
      coveragePercentage: locale === 'es' ? 100 : 80,
      missingKeys: locale === 'es' ? [] : ['list.title', 'list.empty', 'detail.book', 'detail.price'],
      outdatedKeys: []
    }
  }
  
  return mockData[namespace] || {
    namespace,
    locale,
    totalKeys: 0,
    translatedKeys: 0,
    coveragePercentage: 0,
    missingKeys: [],
    outdatedKeys: []
  }
}

// Función para calcular cobertura general por locale
export function calculateLocaleCoverage(locale: string): LocaleCoverage {
  const namespaces = Object.values(I18N_NAMESPACES)
  const namespaceMetrics = namespaces.map(ns => calculateNamespaceCoverage(ns, locale))
  
  const totalKeys = namespaceMetrics.reduce((sum, ns) => sum + ns.totalKeys, 0)
  const translatedKeys = namespaceMetrics.reduce((sum, ns) => sum + ns.translatedKeys, 0)
  const overallCoverage = totalKeys > 0 ? (translatedKeys / totalKeys) * 100 : 0
  
  return {
    locale,
    totalNamespaces: namespaces.length,
    coveredNamespaces: namespaceMetrics.filter(ns => ns.coveragePercentage > 0).length,
    overallCoverage,
    namespaces: namespaceMetrics
  }
}

// Función para obtener métricas de cobertura para todos los locales
export function getAllLocaleCoverage(): LocaleCoverage[] {
  const supportedLocales = ['es', 'en', 'de', 'fr']
  return supportedLocales.map(locale => calculateLocaleCoverage(locale))
}

// Función para detectar claves faltantes comparando con locale de referencia
export function detectMissingKeys(
  targetLocale: string,
  referenceLocale: string = 'es'
): Record<string, string[]> {
  const missingKeys: Record<string, string[]> = {}
  
  for (const namespace of Object.values(I18N_NAMESPACES)) {
    const targetCoverage = calculateNamespaceCoverage(namespace, targetLocale, referenceLocale)
    missingKeys[namespace] = targetCoverage.missingKeys
  }
  
  return missingKeys
}

// Función para generar reporte de cobertura
export function generateCoverageReport(): {
  summary: {
    totalLocales: number
    averageCoverage: number
    bestLocale: string
    worstLocale: string
  }
  locales: LocaleCoverage[]
  recommendations: string[]
} {
  const allCoverage = getAllLocaleCoverage()
  
  const averageCoverage = allCoverage.reduce((sum, locale) => sum + locale.overallCoverage, 0) / allCoverage.length
  const bestLocale = allCoverage.reduce((best, current) => 
    current.overallCoverage > best.overallCoverage ? current : best
  )
  const worstLocale = allCoverage.reduce((worst, current) => 
    current.overallCoverage < worst.overallCoverage ? current : worst
  )
  
  const recommendations: string[] = []
  
  if (averageCoverage < 80) {
    recommendations.push('Priorizar traducción de namespaces con menor cobertura')
  }
  
  if (worstLocale.overallCoverage < 50) {
    recommendations.push(`Mejorar cobertura del locale ${worstLocale.locale}`)
  }
  
  const lowCoverageNamespaces = allCoverage
    .flatMap(locale => locale.namespaces)
    .filter(ns => ns.coveragePercentage < 70)
    .map(ns => ns.namespace)
  
  if (lowCoverageNamespaces.length > 0) {
    recommendations.push(`Completar traducción de namespaces: ${[...new Set(lowCoverageNamespaces)].join(', ')}`)
  }
  
  return {
    summary: {
      totalLocales: allCoverage.length,
      averageCoverage,
      bestLocale: bestLocale.locale,
      worstLocale: worstLocale.locale
    },
    locales: allCoverage,
    recommendations
  }
}
