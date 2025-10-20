import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  generateSlug, 
  generateLocalizedSlugs, 
  resolveSlugFromPath, 
  generateLocalizedUrl,
  generateHreflangTags,
  generateCanonicalUrl,
  getAlternativeSlug
} from '@/lib/i18n/slugs'
import { handleSlugRedirects } from '@/lib/i18n/redirects'

// Mock i18n config
vi.mock('@/app/config/i18n', () => ({
  I18N_ENABLED: true,
  I18N_DEFAULT_LOCALE: 'es',
  I18N_SUPPORTED: ['es', 'en', 'de', 'fr']
}))

describe('Slug Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateSlug', () => {
    it('should generate basic slug from text', () => {
      const slug = generateSlug('Blue Ocean Catamaran')
      expect(slug).toBe('blue-ocean-catamaran')
    })

    it('should handle special characters', () => {
      const slug = generateSlug('Tenerife: Whale Watching & Snorkeling!')
      expect(slug).toBe('tenerife-whale-watching-snorkeling')
    })

    it('should normalize Spanish characters', () => {
      const slug = generateSlug('Excursión al Teide', 'es')
      expect(slug).toBe('excursion-al-teide')
    })

    it('should normalize German characters', () => {
      const slug = generateSlug('Teneriffa: Walbeobachtung', 'de')
      expect(slug).toBe('teneriffa-walbeobachtung')
    })

    it('should normalize French characters', () => {
      const slug = generateSlug('Excursion à Ténérife', 'fr')
      expect(slug).toBe('excursion-a-tenerife')
    })

    it('should handle empty text', () => {
      const slug = generateSlug('')
      expect(slug).toBe('')
    })

    it('should handle multiple spaces and dashes', () => {
      const slug = generateSlug('  Blue   Ocean---Catamaran  ')
      expect(slug).toBe('blue-ocean-catamaran')
    })
  })

  describe('generateLocalizedSlugs', () => {
    it('should generate slugs for all supported locales', () => {
      const slugs = generateLocalizedSlugs('Blue Ocean Catamaran')
      
      expect(slugs).toHaveLength(4)
      expect(slugs.find(s => s.locale === 'es')).toBeDefined()
      expect(slugs.find(s => s.locale === 'en')).toBeDefined()
      expect(slugs.find(s => s.locale === 'de')).toBeDefined()
      expect(slugs.find(s => s.locale === 'fr')).toBeDefined()
    })

    it('should mark default locale correctly', () => {
      const slugs = generateLocalizedSlugs('Blue Ocean Catamaran')
      const defaultSlug = slugs.find(s => s.locale === 'es')
      
      expect(defaultSlug?.isDefault).toBe(true)
    })

    it('should use custom slugs when provided', () => {
      const customSlugs = {
        'en': 'custom-english-slug',
        'de': 'custom-german-slug'
      }
      
      const slugs = generateLocalizedSlugs('Blue Ocean Catamaran', undefined, customSlugs)
      
      expect(slugs.find(s => s.locale === 'en')?.slug).toBe('custom-english-slug')
      expect(slugs.find(s => s.locale === 'de')?.slug).toBe('custom-german-slug')
    })
  })

  describe('resolveSlugFromPath', () => {
    it('should resolve slug from default locale path', () => {
      const result = resolveSlugFromPath('/blue-ocean-catamaran')
      
      expect(result).toEqual({
        locale: 'es',
        slug: 'blue-ocean-catamaran'
      })
    })

    it('should resolve slug from localized path', () => {
      const result = resolveSlugFromPath('/en/blue-ocean-catamaran')
      
      expect(result).toEqual({
        locale: 'en',
        slug: 'blue-ocean-catamaran'
      })
    })

    it('should handle nested paths', () => {
      const result = resolveSlugFromPath('/en/services/blue-ocean-catamaran')
      
      expect(result).toEqual({
        locale: 'en',
        slug: 'services/blue-ocean-catamaran'
      })
    })

    it('should return null for invalid paths', () => {
      const result = resolveSlugFromPath('/invalid-locale/slug')
      
      expect(result).toBeNull()
    })

    it('should handle trailing slashes', () => {
      const result = resolveSlugFromPath('/en/blue-ocean-catamaran/')
      
      expect(result).toEqual({
        locale: 'en',
        slug: 'blue-ocean-catamaran'
      })
    })
  })

  describe('generateLocalizedUrl', () => {
    it('should generate URL for default locale', () => {
      const url = generateLocalizedUrl('blue-ocean-catamaran', 'es')
      
      expect(url).toBe('/blue-ocean-catamaran')
    })

    it('should generate URL for non-default locale', () => {
      const url = generateLocalizedUrl('blue-ocean-catamaran', 'en')
      
      expect(url).toBe('/en/blue-ocean-catamaran')
    })

    it('should include base URL when provided', () => {
      const url = generateLocalizedUrl('blue-ocean-catamaran', 'en', 'https://example.com')
      
      expect(url).toBe('https://example.com/en/blue-ocean-catamaran')
    })
  })

  describe('generateHreflangTags', () => {
    it('should generate hreflang tags for all locales', () => {
      const tags = generateHreflangTags('blue-ocean-catamaran', 'https://example.com')
      
      expect(tags).toHaveLength(5) // 4 locales + x-default
      
      const localeTags = tags.filter(t => t.hreflang !== 'x-default')
      expect(localeTags).toHaveLength(4)
      
      const defaultTag = tags.find(t => t.hreflang === 'x-default')
      expect(defaultTag?.href).toBe('https://example.com/blue-ocean-catamaran')
    })

    it('should generate correct URLs for each locale', () => {
      const tags = generateHreflangTags('blue-ocean-catamaran', 'https://example.com')
      
      const enTag = tags.find(t => t.hreflang === 'en')
      expect(enTag?.href).toBe('https://example.com/en/blue-ocean-catamaran')
      
      const esTag = tags.find(t => t.hreflang === 'es')
      expect(esTag?.href).toBe('https://example.com/blue-ocean-catamaran')
    })

    it('should filter available locales', () => {
      const tags = generateHreflangTags('blue-ocean-catamaran', 'https://example.com', ['en', 'es'])
      
      expect(tags).toHaveLength(3) // 2 locales + x-default
      expect(tags.find(t => t.hreflang === 'en')).toBeDefined()
      expect(tags.find(t => t.hreflang === 'es')).toBeDefined()
      expect(tags.find(t => t.hreflang === 'de')).toBeUndefined()
    })
  })

  describe('generateCanonicalUrl', () => {
    it('should generate canonical URL for default locale', () => {
      const url = generateCanonicalUrl('blue-ocean-catamaran', 'es', 'https://example.com')
      
      expect(url).toBe('https://example.com/blue-ocean-catamaran')
    })

    it('should generate canonical URL for non-default locale', () => {
      const url = generateCanonicalUrl('blue-ocean-catamaran', 'en', 'https://example.com')
      
      expect(url).toBe('https://example.com/en/blue-ocean-catamaran')
    })
  })
})

describe('Slug Redirects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('handleSlugRedirects', () => {
    it('should return null for non-service paths', async () => {
      const mockRequest = {
        nextUrl: {
          pathname: '/about',
          origin: 'https://example.com'
        }
      } as any

      const result = await handleSlugRedirects(mockRequest)
      expect(result).toBeNull()
    })

    it('should return null when I18N is disabled', async () => {
      // Mock I18N_ENABLED as false
      vi.doMock('@/app/config/i18n', () => ({
        I18N_ENABLED: false,
        I18N_DEFAULT_LOCALE: 'es',
        I18N_SUPPORTED: ['es', 'en', 'de', 'fr']
      }))

      const mockRequest = {
        nextUrl: {
          pathname: '/services/blue-ocean-catamaran',
          origin: 'https://example.com'
        }
      } as any

      const result = await handleSlugRedirects(mockRequest)
      expect(result).toBeNull()
    })

    it('should handle service path correctly', async () => {
      const mockRequest = {
        nextUrl: {
          pathname: '/services/blue-ocean-catamaran',
          origin: 'https://example.com'
        }
      } as any

      const result = await handleSlugRedirects(mockRequest)
      // Should return null since service exists (mock implementation)
      expect(result).toBeNull()
    })
  })
})

describe('Alternative Slug Generation', () => {
  it('should return original slug if unique', async () => {
    // Mock validateSlugUniqueness to return true
    vi.doMock('@/lib/i18n/slugs', async () => {
      const actual = await vi.importActual('@/lib/i18n/slugs')
      return {
        ...actual,
        validateSlugUniqueness: vi.fn().mockResolvedValue(true)
      }
    })

    const slug = await getAlternativeSlug('blue-ocean-catamaran', 'en')
    expect(slug).toBe('blue-ocean-catamaran')
  })

  it('should generate alternative slug if original is not unique', async () => {
    // Mock validateSlugUniqueness to return false for original, true for alternative
    let callCount = 0
    const mockValidateSlugUniqueness = vi.fn().mockImplementation(() => {
      callCount++
      return Promise.resolve(callCount > 1) // First call false, subsequent true
    })

    vi.doMock('@/lib/i18n/slugs', async () => {
      const actual = await vi.importActual('@/lib/i18n/slugs')
      return {
        ...actual,
        validateSlugUniqueness: mockValidateSlugUniqueness
      }
    })

    const slug = await getAlternativeSlug('blue-ocean-catamaran', 'en')
    expect(slug).toBe('blue-ocean-catamaran-1')
    expect(mockValidateSlugUniqueness).toHaveBeenCalledTimes(2)
  })

  it('should fallback to timestamp if max attempts reached', async () => {
    // Mock validateSlugUniqueness to always return false
    const mockValidateSlugUniqueness = vi.fn().mockResolvedValue(false)

    vi.doMock('@/lib/i18n/slugs', async () => {
      const actual = await vi.importActual('@/lib/i18n/slugs')
      return {
        ...actual,
        validateSlugUniqueness: mockValidateSlugUniqueness
      }
    })

    const slug = await getAlternativeSlug('blue-ocean-catamaran', 'en', 2)
    expect(slug).toMatch(/^blue-ocean-catamaran-\d+$/)
    expect(mockValidateSlugUniqueness).toHaveBeenCalledTimes(2)
  })
})
