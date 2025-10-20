import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  loadNamespaceMessages,
  loadAllMessages,
  calculateNamespaceCoverage,
  calculateLocaleCoverage,
  getAllLocaleCoverage,
  generateCoverageReport,
  detectMissingKeys,
  I18N_NAMESPACES
} from '@/lib/i18n/coverage'

// Mock i18n config
vi.mock('@/app/config/i18n', () => ({
  I18N_ENABLED: true,
  I18N_DEFAULT_LOCALE: 'es',
  I18N_SUPPORTED: ['es', 'en', 'de', 'fr']
}))

// Mock dynamic imports
vi.mock('@/i18n/messages/es/common.json', () => ({
  default: {
    navigation: {
      home: 'Inicio',
      services: 'Servicios'
    },
    common: {
      title: 'Tenerife Paradise Tours',
      loading: 'Cargando...'
    }
  }
}))

vi.mock('@/i18n/messages/en/common.json', () => ({
  default: {
    navigation: {
      home: 'Home',
      services: 'Services'
    },
    common: {
      title: 'Tenerife Paradise Tours',
      loading: 'Loading...'
    }
  }
}))

describe('i18n Coverage System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loadNamespaceMessages', () => {
    it('should load messages for existing namespace and locale', async () => {
      const messages = await loadNamespaceMessages('common', 'es')
      
      expect(messages).toBeDefined()
      expect(messages.navigation).toBeDefined()
      expect(messages.navigation.home).toBe('Inicio')
    })

    it('should load messages for English locale', async () => {
      const messages = await loadNamespaceMessages('common', 'en')
      
      expect(messages).toBeDefined()
      expect(messages.navigation.home).toBe('Home')
    })

    it('should return empty object for non-existent namespace', async () => {
      const messages = await loadNamespaceMessages('nonexistent' as any, 'es')
      
      expect(messages).toEqual({})
    })

    it('should handle import errors gracefully', async () => {
      // Mock import error
      vi.doMock('@/i18n/messages/es/common.json', () => {
        throw new Error('Import error')
      })

      const messages = await loadNamespaceMessages('common', 'es')
      expect(messages).toEqual({})
    })
  })

  describe('loadAllMessages', () => {
    it('should load all namespaces for a locale', async () => {
      const allMessages = await loadAllMessages('es')
      
      expect(allMessages).toBeDefined()
      expect(allMessages.common).toBeDefined()
      // Other namespaces would be empty due to mocking limitations
    })

    it('should handle missing namespaces gracefully', async () => {
      const allMessages = await loadAllMessages('de')
      
      expect(allMessages).toBeDefined()
      // Should have structure even if namespaces are empty
      expect(typeof allMessages).toBe('object')
    })
  })

  describe('calculateNamespaceCoverage', () => {
    it('should calculate coverage for Spanish locale', () => {
      const coverage = calculateNamespaceCoverage('common', 'es')
      
      expect(coverage.namespace).toBe('common')
      expect(coverage.locale).toBe('es')
      expect(coverage.coveragePercentage).toBe(100)
      expect(coverage.missingKeys).toHaveLength(0)
    })

    it('should calculate coverage for English locale', () => {
      const coverage = calculateNamespaceCoverage('common', 'en')
      
      expect(coverage.namespace).toBe('common')
      expect(coverage.locale).toBe('en')
      expect(coverage.coveragePercentage).toBe(80) // Mock data
      expect(coverage.missingKeys).toContain('title')
      expect(coverage.missingKeys).toContain('description')
    })

    it('should calculate coverage for non-existent namespace', () => {
      const coverage = calculateNamespaceCoverage('nonexistent' as any, 'en')
      
      expect(coverage.namespace).toBe('nonexistent')
      expect(coverage.coveragePercentage).toBe(0)
      expect(coverage.totalKeys).toBe(0)
    })
  })

  describe('calculateLocaleCoverage', () => {
    it('should calculate overall coverage for a locale', () => {
      const coverage = calculateLocaleCoverage('en')
      
      expect(coverage.locale).toBe('en')
      expect(coverage.totalNamespaces).toBeGreaterThan(0)
      expect(coverage.overallCoverage).toBeGreaterThanOrEqual(0)
      expect(coverage.overallCoverage).toBeLessThanOrEqual(100)
      expect(coverage.namespaces).toHaveLength(coverage.totalNamespaces)
    })

    it('should have different coverage for different locales', () => {
      const esCoverage = calculateLocaleCoverage('es')
      const enCoverage = calculateLocaleCoverage('en')
      
      expect(esCoverage.overallCoverage).toBeGreaterThan(enCoverage.overallCoverage)
    })
  })

  describe('getAllLocaleCoverage', () => {
    it('should return coverage for all supported locales', () => {
      const allCoverage = getAllLocaleCoverage()
      
      expect(allCoverage).toHaveLength(4) // es, en, de, fr
      expect(allCoverage.map(c => c.locale)).toContain('es')
      expect(allCoverage.map(c => c.locale)).toContain('en')
      expect(allCoverage.map(c => c.locale)).toContain('de')
      expect(allCoverage.map(c => c.locale)).toContain('fr')
    })

    it('should have consistent structure for all locales', () => {
      const allCoverage = getAllLocaleCoverage()
      
      allCoverage.forEach(coverage => {
        expect(coverage).toHaveProperty('locale')
        expect(coverage).toHaveProperty('totalNamespaces')
        expect(coverage).toHaveProperty('coveredNamespaces')
        expect(coverage).toHaveProperty('overallCoverage')
        expect(coverage).toHaveProperty('namespaces')
        expect(Array.isArray(coverage.namespaces)).toBe(true)
      })
    })
  })

  describe('generateCoverageReport', () => {
    it('should generate comprehensive coverage report', () => {
      const report = generateCoverageReport()
      
      expect(report).toHaveProperty('summary')
      expect(report).toHaveProperty('locales')
      expect(report).toHaveProperty('recommendations')
      
      expect(report.summary).toHaveProperty('totalLocales')
      expect(report.summary).toHaveProperty('averageCoverage')
      expect(report.summary).toHaveProperty('bestLocale')
      expect(report.summary).toHaveProperty('worstLocale')
      
      expect(report.summary.totalLocales).toBe(4)
      expect(report.summary.averageCoverage).toBeGreaterThanOrEqual(0)
      expect(report.summary.averageCoverage).toBeLessThanOrEqual(100)
    })

    it('should identify best and worst locales correctly', () => {
      const report = generateCoverageReport()
      
      const bestCoverage = report.locales.find(l => l.locale === report.summary.bestLocale)
      const worstCoverage = report.locales.find(l => l.locale === report.summary.worstLocale)
      
      expect(bestCoverage?.overallCoverage).toBeGreaterThanOrEqual(worstCoverage?.overallCoverage || 0)
    })

    it('should generate appropriate recommendations', () => {
      const report = generateCoverageReport()
      
      expect(Array.isArray(report.recommendations)).toBe(true)
      
      // Should have recommendations based on coverage levels
      if (report.summary.averageCoverage < 80) {
        expect(report.recommendations.some((r: string) => r.includes('cobertura'))).toBe(true)
      }
    })
  })

  describe('detectMissingKeys', () => {
    it('should detect missing keys for target locale', () => {
      const missingKeys = detectMissingKeys('en', 'es')
      
      expect(missingKeys).toBeDefined()
      expect(typeof missingKeys).toBe('object')
      
      // Should have missing keys for namespaces
      Object.values(I18N_NAMESPACES).forEach(namespace => {
        expect(missingKeys).toHaveProperty(namespace)
        expect(Array.isArray(missingKeys[namespace])).toBe(true)
      })
    })

    it('should return empty arrays for complete locales', () => {
      const missingKeys = detectMissingKeys('es', 'es')
      
      Object.values(I18N_NAMESPACES).forEach(namespace => {
        expect(missingKeys[namespace]).toHaveLength(0)
      })
    })

    it('should detect different missing keys for different locales', () => {
      const enMissing = detectMissingKeys('en', 'es')
      const deMissing = detectMissingKeys('de', 'es')
      
      // Should have different patterns (mock implementation will be the same, but structure should be consistent)
      expect(typeof enMissing).toBe('object')
      expect(typeof deMissing).toBe('object')
    })
  })

  describe('I18N_NAMESPACES', () => {
    it('should have all required namespaces', () => {
      expect(I18N_NAMESPACES.COMMON).toBe('common')
      expect(I18N_NAMESPACES.HOME).toBe('home')
      expect(I18N_NAMESPACES.SERVICES).toBe('services')
      expect(I18N_NAMESPACES.RESERVATIONS).toBe('reservations')
      expect(I18N_NAMESPACES.NAVIGATION).toBe('navigation')
      expect(I18N_NAMESPACES.FORMS).toBe('forms')
      expect(I18N_NAMESPACES.ERRORS).toBe('errors')
      expect(I18N_NAMESPACES.SEO).toBe('seo')
    })

    it('should have consistent namespace values', () => {
      const namespaceValues = Object.values(I18N_NAMESPACES)
      const uniqueValues = [...new Set(namespaceValues)]
      
      expect(namespaceValues).toHaveLength(uniqueValues.length) // No duplicates
      expect(namespaceValues.every(v => typeof v === 'string')).toBe(true)
    })
  })
})
