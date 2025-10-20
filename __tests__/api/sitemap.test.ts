import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET as getSitemap } from '@/app/api/sitemap.xml/route'
import { GET as getLocaleSitemap } from '@/app/api/sitemap/[locale].xml/route'

// Mock i18n config
vi.mock('@/app/config/i18n', () => ({
  I18N_ENABLED: true,
  I18N_DEFAULT_LOCALE: 'es',
  I18N_SUPPORTED: ['es', 'en', 'de', 'fr']
}))

// Mock NextRequest
function mockRequest(origin: string = 'https://example.com'): any {
  return {
    nextUrl: {
      origin
    }
  }
}

describe('Sitemap Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Main Sitemap (/api/sitemap.xml)', () => {
    it('should generate XML sitemap with all locales', async () => {
      const request = mockRequest()
      const response = await getSitemap(request)
      
      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('application/xml')
      expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600')
      
      const xml = await response.text()
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
      expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"')
    })

    it('should include static pages for all locales', async () => {
      const request = mockRequest()
      const response = await getSitemap(request)
      const xml = await response.text()
      
      // Check for static pages in all locales
      expect(xml).toContain('<loc>https://example.com/</loc>')
      expect(xml).toContain('<loc>https://example.com/en/</loc>')
      expect(xml).toContain('<loc>https://example.com/de/</loc>')
      expect(xml).toContain('<loc>https://example.com/fr/</loc>')
      
      expect(xml).toContain('<loc>https://example.com/services</loc>')
      expect(xml).toContain('<loc>https://example.com/en/services</loc>')
    })

    it('should include hreflang alternates', async () => {
      const request = mockRequest()
      const response = await getSitemap(request)
      const xml = await response.text()
      
      expect(xml).toContain('<xhtml:link rel="alternate" hreflang="es" href="https://example.com/" />')
      expect(xml).toContain('<xhtml:link rel="alternate" hreflang="en" href="https://example.com/en/" />')
      expect(xml).toContain('<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/" />')
    })

    it('should include dynamic services', async () => {
      const request = mockRequest()
      const response = await getSitemap(request)
      const xml = await response.text()
      
      expect(xml).toContain('<loc>https://example.com/en/blue-ocean-catamaran</loc>')
      expect(xml).toContain('<loc>https://example.com/de/blauer-ozean-katamaran</loc>')
      expect(xml).toContain('<loc>https://example.com/fr/catamaran-ocean-bleu</loc>')
    })

    it('should handle errors gracefully', async () => {
      // Mock error in getServicesForSitemap
      vi.doMock('@/app/api/sitemap.xml/route', async () => {
        const actual = await vi.importActual('@/app/api/sitemap.xml/route')
        return {
          ...actual,
          getServicesForSitemap: vi.fn().mockRejectedValue(new Error('Database error'))
        }
      })

      const request = mockRequest()
      const response = await getSitemap(request)
      
      expect(response.status).toBe(500)
      const json = await response.json()
      expect(json.error).toBe('Error interno del servidor')
    })
  })

  describe('Locale-specific Sitemap (/api/sitemap/[locale].xml)', () => {
    it('should generate sitemap for specific locale', async () => {
      const request = mockRequest()
      const params = { locale: 'en' }
      
      const response = await getLocaleSitemap(request, { params })
      
      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('application/xml')
      
      const xml = await response.text()
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    })

    it('should include only English URLs for English locale', async () => {
      const request = mockRequest()
      const params = { locale: 'en' }
      
      const response = await getLocaleSitemap(request, { params })
      const xml = await response.text()
      
      expect(xml).toContain('<loc>https://example.com/en/</loc>')
      expect(xml).toContain('<loc>https://example.com/en/services</loc>')
      expect(xml).toContain('<loc>https://example.com/en/blue-ocean-catamaran</loc>')
      
      // Should not contain other locales
      expect(xml).not.toContain('<loc>https://example.com/de/</loc>')
      expect(xml).not.toContain('<loc>https://example.com/fr/</loc>')
    })

    it('should include only German URLs for German locale', async () => {
      const request = mockRequest()
      const params = { locale: 'de' }
      
      const response = await getLocaleSitemap(request, { params })
      const xml = await response.text()
      
      expect(xml).toContain('<loc>https://example.com/de/</loc>')
      expect(xml).toContain('<loc>https://example.com/de/services</loc>')
      expect(xml).toContain('<loc>https://example.com/de/blauer-ozean-katamaran</loc>')
      
      // Should not contain other locales
      expect(xml).not.toContain('<loc>https://example.com/en/</loc>')
      expect(xml).not.toContain('<loc>https://example.com/fr/</loc>')
    })

    it('should return 400 for unsupported locale', async () => {
      const request = mockRequest()
      const params = { locale: 'zh' }
      
      const response = await getLocaleSitemap(request, { params })
      
      expect(response.status).toBe(400)
      const json = await response.json()
      expect(json.error).toBe('Unsupported locale')
    })

    it('should return 400 when I18N is disabled', async () => {
      // Mock I18N_ENABLED as false
      vi.doMock('@/app/config/i18n', () => ({
        I18N_ENABLED: false,
        I18N_DEFAULT_LOCALE: 'es',
        I18N_SUPPORTED: ['es', 'en', 'de', 'fr']
      }))

      const request = mockRequest()
      const params = { locale: 'en' }
      
      const response = await getLocaleSitemap(request, { params })
      
      expect(response.status).toBe(400)
      const json = await response.json()
      expect(json.error).toBe('I18N is disabled')
    })

    it('should include correct priority and changefreq', async () => {
      const request = mockRequest()
      const params = { locale: 'en' }
      
      const response = await getLocaleSitemap(request, { params })
      const xml = await response.text()
      
      // Homepage should have highest priority
      expect(xml).toContain('<priority>1.0</priority>')
      expect(xml).toContain('<changefreq>daily</changefreq>')
      
      // Services should have lower priority
      expect(xml).toContain('<priority>0.8</priority>')
      expect(xml).toContain('<changefreq>weekly</changefreq>')
    })

    it('should handle errors gracefully', async () => {
      // Mock error in getServicesForLocale
      vi.doMock('@/app/api/sitemap/[locale].xml/route', async () => {
        const actual = await vi.importActual('@/app/api/sitemap/[locale].xml/route')
        return {
          ...actual,
          getServicesForLocale: vi.fn().mockRejectedValue(new Error('Database error'))
        }
      })

      const request = mockRequest()
      const params = { locale: 'en' }
      
      const response = await getLocaleSitemap(request, { params })
      
      expect(response.status).toBe(500)
      const json = await response.json()
      expect(json.error).toBe('Error interno del servidor')
    })
  })
})
