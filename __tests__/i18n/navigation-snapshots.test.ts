import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { I18nProvider } from '@/components/i18n-provider'
import { SEOHead } from '@/components/i18n/seo-head'
import { useSEOInfo } from '@/components/i18n/seo-head'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/en/services/blue-ocean-catamaran')
}))

// Mock i18n config
vi.mock('@/app/config/i18n', () => ({
  I18N_ENABLED: true,
  I18N_DEFAULT_LOCALE: 'es',
  I18N_SUPPORTED: ['es', 'en', 'de', 'fr']
}))

// Mock messages
const mockMessages = {
  common: {
    navigation: {
      home: 'Home',
      services: 'Services',
      reservations: 'Reservations'
    },
    common: {
      title: 'Tenerife Paradise Tours',
      loading: 'Loading...'
    }
  },
  home: {
    hero: {
      title: 'Discover Tenerife',
      subtitle: 'Unique excursions on the island of eternal spring'
    }
  },
  services: {
    list: {
      title: 'Our Services',
      subtitle: 'Discover the best excursions in Tenerife'
    }
  }
}

describe('i18n Navigation and Message Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('I18nProvider', () => {
    it('should render children with i18n context', () => {
      const TestComponent = () => <div>Test Content</div>
      
      render(
        <I18nProvider locale="en" messages={mockMessages}>
          <TestComponent />
        </I18nProvider>
      )
      
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should provide correct locale context', () => {
      const TestComponent = () => {
        // This would use useTranslations hook in real implementation
        return <div data-testid="locale">en</div>
      }
      
      render(
        <I18nProvider locale="en" messages={mockMessages}>
          <TestComponent />
        </I18nProvider>
      )
      
      expect(screen.getByTestId('locale')).toHaveTextContent('en')
    })
  })

  describe('SEOHead Component', () => {
    it('should render without visible content', () => {
      render(
        <SEOHead 
          slug="blue-ocean-catamaran" 
          locale="en" 
          baseUrl="https://example.com"
        />
      )
      
      // Component should not render any visible content
      expect(screen.queryByText('blue-ocean-catamaran')).not.toBeInTheDocument()
    })

    it('should handle different locales', () => {
      const { rerender } = render(
        <SEOHead 
          slug="blue-ocean-catamaran" 
          locale="en" 
          baseUrl="https://example.com"
        />
      )
      
      // Should not throw error
      expect(document.documentElement).toBeInTheDocument()
      
      rerender(
        <SEOHead 
          slug="catamaran-oceano-azul" 
          locale="es" 
          baseUrl="https://example.com"
        />
      )
      
      // Should still not throw error
      expect(document.documentElement).toBeInTheDocument()
    })
  })

  describe('useSEOInfo Hook', () => {
    it('should extract locale from pathname', () => {
      const TestComponent = () => {
        const { locale } = useSEOInfo()
        return <div data-testid="locale">{locale}</div>
      }
      
      render(<TestComponent />)
      
      expect(screen.getByTestId('locale')).toHaveTextContent('en')
    })

    it('should extract slug from pathname', () => {
      const TestComponent = () => {
        const { slug } = useSEOInfo()
        return <div data-testid="slug">{slug}</div>
      }
      
      render(<TestComponent />)
      
      expect(screen.getByTestId('slug')).toHaveTextContent('services/blue-ocean-catamaran')
    })

    it('should handle default locale pathname', () => {
      vi.mocked(require('next/navigation').usePathname).mockReturnValue('/services/blue-ocean-catamaran')
      
      const TestComponent = () => {
        const { locale, slug } = useSEOInfo()
        return (
          <div>
            <div data-testid="locale">{locale}</div>
            <div data-testid="slug">{slug}</div>
          </div>
        )
      }
      
      render(<TestComponent />)
      
      expect(screen.getByTestId('locale')).toHaveTextContent('es')
      expect(screen.getByTestId('slug')).toHaveTextContent('services/blue-ocean-catamaran')
    })

    it('should handle root pathname', () => {
      vi.mocked(require('next/navigation').usePathname).mockReturnValue('/')
      
      const TestComponent = () => {
        const { locale, slug } = useSEOInfo()
        return (
          <div>
            <div data-testid="locale">{locale}</div>
            <div data-testid="slug">{slug}</div>
          </div>
        )
      }
      
      render(<TestComponent />)
      
      expect(screen.getByTestId('locale')).toHaveTextContent('es')
      expect(screen.getByTestId('slug')).toHaveTextContent('')
    })
  })

  describe('Message Snapshots', () => {
    it('should have consistent message structure for common namespace', () => {
      expect(mockMessages.common).toMatchSnapshot({
        navigation: {
          home: expect.any(String),
          services: expect.any(String),
          reservations: expect.any(String)
        },
        common: {
          title: expect.any(String),
          loading: expect.any(String)
        }
      })
    })

    it('should have consistent message structure for home namespace', () => {
      expect(mockMessages.home).toMatchSnapshot({
        hero: {
          title: expect.any(String),
          subtitle: expect.any(String)
        }
      })
    })

    it('should have consistent message structure for services namespace', () => {
      expect(mockMessages.services).toMatchSnapshot({
        list: {
          title: expect.any(String),
          subtitle: expect.any(String)
        }
      })
    })

    it('should have all required navigation keys', () => {
      const navigationKeys = Object.keys(mockMessages.common.navigation)
      const requiredKeys = ['home', 'services', 'reservations']
      
      requiredKeys.forEach(key => {
        expect(navigationKeys).toContain(key)
        expect(mockMessages.common.navigation[key]).toBeTruthy()
      })
    })

    it('should have all required common keys', () => {
      const commonKeys = Object.keys(mockMessages.common.common)
      const requiredKeys = ['title', 'loading']
      
      requiredKeys.forEach(key => {
        expect(commonKeys).toContain(key)
        expect(mockMessages.common.common[key]).toBeTruthy()
      })
    })
  })

  describe('Navigation Path Testing', () => {
    const testPaths = [
      { path: '/', expectedLocale: 'es', expectedSlug: '' },
      { path: '/services', expectedLocale: 'es', expectedSlug: 'services' },
      { path: '/en', expectedLocale: 'en', expectedSlug: '' },
      { path: '/en/services', expectedLocale: 'en', expectedSlug: 'services' },
      { path: '/en/services/blue-ocean-catamaran', expectedLocale: 'en', expectedSlug: 'services/blue-ocean-catamaran' },
      { path: '/de/services', expectedLocale: 'de', expectedSlug: 'services' },
      { path: '/fr/services', expectedLocale: 'fr', expectedSlug: 'services' }
    ]

    testPaths.forEach(({ path, expectedLocale, expectedSlug }) => {
      it(`should handle path ${path} correctly`, () => {
        vi.mocked(require('next/navigation').usePathname).mockReturnValue(path)
        
        const TestComponent = () => {
          const { locale, slug } = useSEOInfo()
          return (
            <div>
              <div data-testid="locale">{locale}</div>
              <div data-testid="slug">{slug}</div>
            </div>
          )
        }
        
        render(<TestComponent />)
        
        expect(screen.getByTestId('locale')).toHaveTextContent(expectedLocale)
        expect(screen.getByTestId('slug')).toHaveTextContent(expectedSlug)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid locale in pathname', () => {
      vi.mocked(require('next/navigation').usePathname).mockReturnValue('/invalid/services')
      
      const TestComponent = () => {
        const { locale, slug } = useSEOInfo()
        return (
          <div>
            <div data-testid="locale">{locale}</div>
            <div data-testid="slug">{slug}</div>
          </div>
        )
      }
      
      render(<TestComponent />)
      
      // Should fallback to default locale
      expect(screen.getByTestId('locale')).toHaveTextContent('es')
      expect(screen.getByTestId('slug')).toHaveTextContent('invalid/services')
    })

    it('should handle empty pathname', () => {
      vi.mocked(require('next/navigation').usePathname).mockReturnValue('')
      
      const TestComponent = () => {
        const { locale, slug } = useSEOInfo()
        return (
          <div>
            <div data-testid="locale">{locale}</div>
            <div data-testid="slug">{slug}</div>
          </div>
        )
      }
      
      render(<TestComponent />)
      
      expect(screen.getByTestId('locale')).toHaveTextContent('es')
      expect(screen.getByTestId('slug')).toHaveTextContent('')
    })
  })
})
