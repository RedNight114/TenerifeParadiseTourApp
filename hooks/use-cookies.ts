"use client"

import { useState, useEffect, useCallback } from "react"

export interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
}

export interface UseCookiesReturn {
  preferences: CookiePreferences
  hasConsent: boolean
  acceptAll: () => void
  acceptNecessary: () => void
  updatePreferences: (preferences: CookiePreferences) => void
  resetPreferences: () => void
  getCookieValue: (name: string) => string | null
  setCookie: (name: string, value: string, options?: CookieOptions) => void
  deleteCookie: (name: string) => void
}

interface CookieOptions {
  maxAge?: number
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: 'Strict' | 'Lax' | 'None'
}

export function useCookies(): UseCookiesReturn {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false
  })
  const [hasConsent, setHasConsent] = useState(false)

  // Cargar preferencias guardadas
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedConsent = localStorage.getItem('cookieConsent')
      if (savedConsent) {
        try {
          const savedPreferences = JSON.parse(savedConsent)
          setPreferences(savedPreferences)
          setHasConsent(true)
          applyPreferences(savedPreferences)
        } catch (error) {
          console.error('Error parsing saved cookie preferences:', error)
        }
      }
    }
  }, [])

  // Aplicar preferencias de cookies
  const applyPreferences = useCallback((newPreferences: CookiePreferences) => {
    // Cookies necesarias (siempre activas)
    if (newPreferences.necessary) {
      setCookie('session_id', generateSessionId(), { maxAge: 3600, sameSite: 'Strict' })
    }

    // Cookies de analytics
    if (newPreferences.analytics) {
      setCookie('analytics_consent', 'true', { maxAge: 31536000, sameSite: 'Lax' })
      // Configurar Google Analytics si está disponible
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          'analytics_storage': 'granted'
        })
      }
    } else {
      deleteCookie('analytics_consent')
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          'analytics_storage': 'denied'
        })
      }
    }

    // Cookies de marketing
    if (newPreferences.marketing) {
      setCookie('marketing_consent', 'true', { maxAge: 31536000, sameSite: 'Lax' })
    } else {
      deleteCookie('marketing_consent')
    }

    // Cookies funcionales
    if (newPreferences.functional) {
      setCookie('functional_consent', 'true', { maxAge: 31536000, sameSite: 'Lax' })
    } else {
      deleteCookie('functional_consent')
    }
  }, [])

  // Generar ID de sesión
  const generateSessionId = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  // Obtener valor de cookie
  const getCookieValue = useCallback((name: string): string | null => {
    if (typeof document === 'undefined') return null
    
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null
    }
    return null
  }, [])

  // Establecer cookie
  const setCookie = useCallback((name: string, value: string, options: CookieOptions = {}): void => {
    if (typeof document === 'undefined') return

    let cookieString = `${name}=${value}`

    if (options.maxAge) {
      cookieString += `; max-age=${options.maxAge}`
    }
    if (options.path) {
      cookieString += `; path=${options.path}`
    } else {
      cookieString += '; path=/'
    }
    if (options.domain) {
      cookieString += `; domain=${options.domain}`
    }
    if (options.secure) {
      cookieString += '; secure'
    }
    if (options.sameSite) {
      cookieString += `; SameSite=${options.sameSite}`
    }

    document.cookie = cookieString
  }, [])

  // Eliminar cookie
  const deleteCookie = useCallback((name: string): void => {
    if (typeof document === 'undefined') return
    document.cookie = `${name}=; max-age=0; path=/`
  }, [])

  // Aceptar todas las cookies
  const acceptAll = useCallback(() => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    }
    setPreferences(allAccepted)
    setHasConsent(true)
    applyPreferences(allAccepted)
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted))
  }, [applyPreferences])

  // Aceptar solo cookies necesarias
  const acceptNecessary = useCallback(() => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    }
    setPreferences(necessaryOnly)
    setHasConsent(true)
    applyPreferences(necessaryOnly)
    localStorage.setItem('cookieConsent', JSON.stringify(necessaryOnly))
  }, [applyPreferences])

  // Actualizar preferencias personalizadas
  const updatePreferences = useCallback((newPreferences: CookiePreferences) => {
    setPreferences(newPreferences)
    setHasConsent(true)
    applyPreferences(newPreferences)
    localStorage.setItem('cookieConsent', JSON.stringify(newPreferences))
  }, [applyPreferences])

  // Resetear preferencias
  const resetPreferences = useCallback(() => {
    const defaultPreferences: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    }
    setPreferences(defaultPreferences)
    setHasConsent(false)
    localStorage.removeItem('cookieConsent')
    
    // Eliminar todas las cookies excepto las necesarias
    deleteCookie('analytics_consent')
    deleteCookie('marketing_consent')
    deleteCookie('functional_consent')
  }, [deleteCookie])

  return {
    preferences,
    hasConsent,
    acceptAll,
    acceptNecessary,
    updatePreferences,
    resetPreferences,
    getCookieValue,
    setCookie,
    deleteCookie
  }
} 