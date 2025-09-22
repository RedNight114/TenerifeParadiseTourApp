/**
 * Configuración de Vercel Analytics
 * Personalización de eventos y métricas
 */

// Importación segura de Vercel Analytics
let track: ((event: string, properties?: Record<string, any>) => void) | null = null

try {
  // Intentar importar Vercel Analytics
  const analytics = require('@vercel/analytics')
  if (analytics && typeof analytics.track === 'function') {
    track = analytics.track
  }
} catch (error) {
  console.warn('Vercel Analytics not available:', error)
}

// Tipos de eventos personalizados
export type CustomEvent = 
  | 'reservation_created'
  | 'reservation_cancelled'
  | 'service_viewed'
  | 'chat_started'
  | 'admin_login'
  | 'user_registration'
  | 'payment_initiated'
  | 'payment_completed'
  | 'search_performed'
  | 'contact_form_submitted'

// Función para trackear eventos personalizados
export function trackEvent(event: CustomEvent, properties?: Record<string, any>) {
  try {
    // Verificar que la función track esté disponible
    if (track && typeof track === 'function') {
      track(event, properties)
    } else {
      // En desarrollo, solo mostrar un log
      if (process.env.NODE_ENV === 'development') {
        console.log('Analytics event:', event, properties)
      }
    }
  } catch (error) {
    console.warn('Error tracking event:', error)
  }
}

// Eventos específicos del negocio
export const analytics = {
  // Reservas
  trackReservationCreated: (serviceId: string, price: number) => {
    trackEvent('reservation_created', {
      service_id: serviceId,
      price,
      timestamp: new Date().toISOString()
    })
  },

  trackReservationCancelled: (reservationId: string, reason?: string) => {
    trackEvent('reservation_cancelled', {
      reservation_id: reservationId,
      reason,
      timestamp: new Date().toISOString()
    })
  },

  // Servicios
  trackServiceViewed: (serviceId: string, serviceName: string) => {
    trackEvent('service_viewed', {
      service_id: serviceId,
      service_name: serviceName,
      timestamp: new Date().toISOString()
    })
  },

  // Chat
  trackChatStarted: (userId: string, isAdmin: boolean = false) => {
    trackEvent('chat_started', {
      user_id: userId,
      is_admin: isAdmin,
      timestamp: new Date().toISOString()
    })
  },

  // Autenticación
  trackAdminLogin: (adminId: string) => {
    trackEvent('admin_login', {
      admin_id: adminId,
      timestamp: new Date().toISOString()
    })
  },

  trackUserRegistration: (userId: string, method: string = 'email') => {
    trackEvent('user_registration', {
      user_id: userId,
      method,
      timestamp: new Date().toISOString()
    })
  },

  // Pagos
  trackPaymentInitiated: (amount: number, currency: string = 'EUR') => {
    trackEvent('payment_initiated', {
      amount,
      currency,
      timestamp: new Date().toISOString()
    })
  },

  trackPaymentCompleted: (amount: number, currency: string = 'EUR', method: string) => {
    trackEvent('payment_completed', {
      amount,
      currency,
      method,
      timestamp: new Date().toISOString()
    })
  },

  // Búsqueda
  trackSearchPerformed: (query: string, resultsCount: number) => {
    trackEvent('search_performed', {
      query,
      results_count: resultsCount,
      timestamp: new Date().toISOString()
    })
  },

  // Contacto
  trackContactFormSubmitted: (formType: string) => {
    trackEvent('contact_form_submitted', {
      form_type: formType,
      timestamp: new Date().toISOString()
    })
  }
}

// Configuración de Analytics
export const analyticsConfig = {
  // Habilitar/deshabilitar analytics en desarrollo
  enabled: process.env.NODE_ENV === 'production',
  
  // Configuración de privacidad
  respectDoNotTrack: true,
  
  // Configuración de cookies
  cookieConsent: true,
  
  // Configuración de eventos
  trackPageViews: true,
  trackUserInteractions: true,
  trackPerformance: true
}

export default analytics
