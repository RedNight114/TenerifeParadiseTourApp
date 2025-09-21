/**
 * Configuración de imports dinámicos para optimizar el bundle
 */

import { ComponentType } from 'react';
import dynamic from 'next/dynamic';

// Componentes de loading reutilizables
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const LoadingPulse = () => (
  <div className="fixed bottom-4 right-4 w-12 h-12 bg-primary rounded-full animate-pulse"></div>
);

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const LoadingCard = () => (
  <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
);

const LoadingForm = () => (
  <div className="space-y-4">
    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
  </div>
);

const LoadingBooking = () => (
  <div className="space-y-6">
    <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
  </div>
);

const LoadingGallery = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
    ))}
  </div>
);

const LoadingMonitor = () => (
  <div className="fixed top-4 right-4 w-8 h-8 bg-blue-500 rounded-full animate-pulse"></div>
);

// Componentes pesados que se cargan dinámicamente
export const DynamicComponents = {
  // Componentes de administración (solo se cargan cuando se necesitan)
  // Componentes de administración (comentados hasta que se implementen)
  // AdminDashboard: dynamic(() => import('@/components/admin/dashboard'), {
  //   loading: LoadingSpinner,
  //   ssr: false
  // }),

  // ServicesManagement: dynamic(() => import('@/components/admin/services-management'), {
  //   loading: LoadingSpinner,
  //   ssr: false
  // }),

  // ImageManagement: dynamic(() => import('@/components/admin/image-management'), {
  //   loading: LoadingSpinner,
  //   ssr: false
  // }),

  // Componentes de chat (carga diferida) - Temporalmente deshabilitado
  // ChatWidget: dynamic(() => import('@/components/chat/unified-chat-widget').then(mod => ({ default: mod.UnifiedChatWidget })), {
  //   loading: LoadingPulse,
  //   ssr: false
  // }),

  // ChatPage: dynamic(() => import('@/components/chat/chat-page'), {
  //   loading: LoadingScreen,
  //   ssr: false
  // }),

  // Componentes de gráficos (solo cuando se necesitan)
  // Charts: dynamic(() => import('@/components/charts/performance-charts'), {
  //   loading: LoadingCard,
  //   ssr: false
  // }),

  // Componentes de pago (carga diferida para mejor rendimiento)
  // PaymentForm: dynamic(() => import('@/components/payment/payment-form'), {
  //   loading: LoadingForm,
  //   ssr: false
  // }),

  // Componentes de reservas (carga diferida)
  // BookingForm: dynamic(() => import('@/components/booking/booking-form'), {
  //   loading: LoadingBooking,
  //   ssr: false
  // }),

  // Componentes de galería (carga diferida)
  // ImageGallery: dynamic(() => import('@/components/optimized-service-gallery'), {
  //   loading: LoadingGallery,
  //   ssr: false
  // }),

  // Componentes de monitoreo (solo en desarrollo)
  // PerformanceMonitor: dynamic(() => import('@/components/performance-monitor'), {
  //   loading: LoadingMonitor,
  //   ssr: false
  // })
};

// Función helper para cargar componentes con prefetch
export function prefetchComponent(componentName: keyof typeof DynamicComponents) {
  if (typeof window !== 'undefined') {
    // Prefetch del componente cuando el usuario hace hover sobre elementos relacionados
    const component = DynamicComponents[componentName];
    if (component && 'prefetch' in component) {
      (component as any).prefetch();
    }
  }
}

// Configuración de prefetch inteligente
export function setupIntelligentPrefetch() {
  if (typeof window === 'undefined') return;

  // Prefetch de componentes de admin cuando el usuario está autenticado
  const prefetchAdminComponents = () => {
    // prefetchComponent('AdminDashboard');
    // prefetchComponent('ServicesManagement');
    // prefetchComponent('ImageManagement');
  };

  // Prefetch de componentes de chat cuando hay actividad
  const prefetchChatComponents = () => {
    // prefetchComponent('ChatWidget');
    // prefetchComponent('ChatPage');
  };

  // Prefetch de componentes de pago cuando se navega a servicios
  const prefetchPaymentComponents = () => {
    // prefetchComponent('PaymentForm');
    // prefetchComponent('BookingForm');
  };

  // Event listeners para prefetch inteligente
  if (typeof document !== 'undefined') {
    document.addEventListener('mouseover', (e) => {
      const target = e.target as HTMLElement;
      
      if (target.closest('[data-prefetch="admin"]')) {
        prefetchAdminComponents();
      } else if (target.closest('[data-prefetch="chat"]')) {
        prefetchChatComponents();
      } else if (target.closest('[data-prefetch="payment"]')) {
        prefetchPaymentComponents();
      }
    });
  }

  // Prefetch basado en la ruta actual
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/admin')) {
      prefetchAdminComponents();
    } else if (currentPath.includes('/chat')) {
      prefetchChatComponents();
    } else if (currentPath.includes('/booking') || currentPath.includes('/services')) {
      prefetchPaymentComponents();
    }
  }
}

// Exportar tipos para TypeScript
export type DynamicComponentName = keyof typeof DynamicComponents;
