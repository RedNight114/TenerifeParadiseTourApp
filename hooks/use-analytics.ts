/**
 * Hook personalizado para Vercel Analytics
 * Facilita el uso de analytics en componentes React
 */

import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { analytics, analyticsConfig } from '@/lib/analytics'

export function useAnalytics() {
  const { user, profile } = useAuth()

  // Trackear información del usuario cuando esté disponible
  useEffect(() => {
    if (user && analyticsConfig.enabled) {
      // Trackear información básica del usuario (sin datos sensibles)
      analytics.trackUserRegistration(user.id, 'email')
    }
  }, [user])

  // Función para trackear eventos con contexto del usuario
  const trackWithUser = (event: string, properties?: Record<string, any>) => {
    if (!analyticsConfig.enabled) return

    const eventProperties = {
      ...properties,
      user_id: user?.id,
      user_role: profile?.role,
      timestamp: new Date().toISOString()
    }

    analytics.trackEvent(event as any, eventProperties)
  }

  return {
    track: trackWithUser,
    analytics,
    isEnabled: analyticsConfig.enabled
  }
}

// Hook específico para trackear páginas
export function usePageTracking(pageName: string) {
  const { track } = useAnalytics()

  useEffect(() => {
    if (analyticsConfig.enabled && analyticsConfig.trackPageViews) {
      track('page_viewed', {
        page_name: pageName,
        url: window.location.pathname
      })
    }
  }, [pageName, track])
}

// Hook para trackear interacciones del usuario
export function useInteractionTracking() {
  const { track } = useAnalytics()

  const trackClick = (element: string, properties?: Record<string, any>) => {
    if (analyticsConfig.enabled && analyticsConfig.trackUserInteractions) {
      track('user_click', {
        element,
        ...properties
      })
    }
  }

  const trackFormSubmit = (formName: string, success: boolean, properties?: Record<string, any>) => {
    if (analyticsConfig.enabled && analyticsConfig.trackUserInteractions) {
      track('form_submit', {
        form_name: formName,
        success,
        ...properties
      })
    }
  }

  const trackError = (errorType: string, errorMessage: string, properties?: Record<string, any>) => {
    if (analyticsConfig.enabled) {
      track('error_occurred', {
        error_type: errorType,
        error_message: errorMessage,
        ...properties
      })
    }
  }

  return {
    trackClick,
    trackFormSubmit,
    trackError
  }
}

export default useAnalytics
