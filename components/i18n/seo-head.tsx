"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { generateHreflangTags, generateCanonicalUrl } from '@/lib/i18n/slugs'
import { I18N_ENABLED, I18N_DEFAULT_LOCALE } from '@/app/config/i18n'

interface SEOHeadProps {
  slug: string
  locale: string
  baseUrl?: string
  availableLocales?: string[]
}

export function SEOHead({ slug, locale, baseUrl, availableLocales }: SEOHeadProps) {
  const pathname = usePathname()
  
  useEffect(() => {
    if (!I18N_ENABLED) return

    const canonicalUrl = generateCanonicalUrl(slug, locale, baseUrl || window.location.origin)
    const hreflangTags = generateHreflangTags(slug, baseUrl || window.location.origin, availableLocales)

    // Actualizar canonical
    let canonicalLink = document.querySelector('link[rel="canonical"]')
    if (!canonicalLink) {
      canonicalLink = document.createElement('link')
      canonicalLink.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalLink)
    }
    canonicalLink.setAttribute('href', canonicalUrl)

    // Actualizar hreflang tags
    const existingHreflangTags = document.querySelectorAll('link[rel="alternate"][hreflang]')
    existingHreflangTags.forEach(tag => tag.remove())

    hreflangTags.forEach(tag => {
      const link = document.createElement('link')
      link.setAttribute('rel', tag.rel)
      link.setAttribute('hreflang', tag.hreflang)
      link.setAttribute('href', tag.href)
      document.head.appendChild(link)
    })

    // Actualizar lang del documento
    document.documentElement.lang = locale

  }, [slug, locale, baseUrl, availableLocales, pathname])

  return null // Este componente no renderiza nada visible
}

// Hook para obtener información SEO del locale actual
export function useSEOInfo() {
  const pathname = usePathname()
  
  const getCurrentLocale = (): string => {
    if (!I18N_ENABLED) return I18N_DEFAULT_LOCALE
    
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length > 0 && segments[0].length === 2) {
      return segments[0]
    }
    return I18N_DEFAULT_LOCALE
  }

  const getCurrentSlug = (): string => {
    const segments = pathname.split('/').filter(Boolean)
    
    if (!I18N_ENABLED) {
      return segments.join('/')
    }
    
    // Si el primer segmento es un locale, saltarlo
    if (segments.length > 0 && segments[0].length === 2) {
      return segments.slice(1).join('/')
    }
    
    return segments.join('/')
  }

  return {
    locale: getCurrentLocale(),
    slug: getCurrentSlug(),
    pathname
  }
}
