// Sistema simple de code splitting para optimizar el rendimiento
// Implementa lazy loading básico sin problemas de tipos

import React, { lazy, Suspense, ComponentType, ReactNode } from 'react'

// Componentes lazy cargados
export const LazyComponents = {
  // Componentes de administración (comentados hasta que se implementen)
  // ServicesManagement: lazy(() => import('@/components/admin/services-management')),
  // ServiceForm: lazy(() => import('@/components/admin/service-form')),
  // ContactMessages: lazy(() => import('@/components/admin/contact-messages')),
  // AuditDashboard: lazy(() => import('@/components/admin/audit-dashboard')),
  // ReservationsManagement: lazy(() => import('@/components/admin/reservations-management')),
  
  // Componentes de chat - Temporalmente deshabilitados
  // AdminChatDashboard: lazy(() => import('@/components/chat/admin-chat-dashboard')),
  // ChatWidget: lazy(() => import('@/components/chat/unified-chat-widget').then(mod => ({ default: mod.UnifiedChatWidget }))),
  
  // Componentes de servicios (comentados hasta que se implementen)
  // ServiceGallery: lazy(() => import('@/components/service-gallery')),
  // PricingSelector: lazy(() => import('@/components/unified-pricing-participant-selector')),
  
  // Componentes de autenticación (comentados hasta que se implementen)
  // AuthGuard: lazy(() => import('@/components/auth-guard')),
  
  // Componentes de paginación (comentados hasta que se implementen)
  // Pagination: lazy(() => import('@/components/ui/pagination')),
  // VirtualizedList: lazy(() => import('@/components/ui/advanced-virtualized-list'))
}

// Componente wrapper con Suspense
export function LazyComponentWrapper({
  component: Component,
  fallback,
  ...props
}: {
  component: ComponentType<any>
  fallback?: ReactNode
  [key: string]: any
}) {
  return React.createElement(
    React.Suspense,
    { fallback: fallback || React.createElement(DefaultFallback) },
    React.createElement(Component, props)
  )
}

// Fallback por defecto
function DefaultFallback() {
  return React.createElement(
    'div',
    { className: 'flex items-center justify-center p-4' },
    React.createElement(
      'div',
      { className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-primary' }
    ),
    React.createElement(
      'span',
      { className: 'ml-2 text-muted-foreground' },
      'Cargando...'
    )
  )
}

// Función para precargar componentes
export function preloadComponent(componentName: keyof typeof LazyComponents) {
  const component = LazyComponents[componentName]
  if (component) {
    // Forzar la carga del componente
    try {
      // @ts-ignore - preload puede no existir en todos los componentes
      component.preload?.()
    } catch (error) {
      }
  }
}

// Función para precargar múltiples componentes
export function preloadComponents(componentNames: (keyof typeof LazyComponents)[]) {
  componentNames.forEach(name => preloadComponent(name))
}

// Hook para precarga inteligente
export function usePreloading() {
  const preloadRoute = (route: string) => {
    if (typeof window === 'undefined') return
    
    // Mapeo de rutas a componentes
    const routeComponents: Record<string, (keyof typeof LazyComponents)[]> = {
      // '/admin/services-management': ['ServicesManagement', 'ServiceForm'],
      // '/chat': ['AdminChatDashboard', 'ChatWidget'],
      // '/services': ['ServiceGallery', 'PricingSelector'],
      // '/auth/login': ['AuthGuard'],
      // '/auth/register': ['AuthGuard']
    }
    
    const components = routeComponents[route]
    if (components) {
      preloadComponents(components)
    }
  }
  
  return { preloadRoute }
}


