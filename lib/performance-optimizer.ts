// Sistema de optimización de rendimiento para Tenerife Paradise Tour
// Implementa técnicas avanzadas de optimización

interface PerformanceConfig {
  enableImageLazyLoading: boolean;
  enableServiceVirtualization: boolean;
  enableRoutePrefetching: boolean;
  enableBackgroundSync: boolean;
  cacheStrategy: 'memory' | 'localStorage' | 'hybrid';
  maxCacheSize: number;
  cacheTTL: number;
}

class PerformanceOptimizer {
  private config: PerformanceConfig;
  private imageObserver: IntersectionObserver | null = null;
  private routeCache: Map<string, any> = new Map();
  private serviceCache: Map<string, any> = new Map();
  private isInitialized = false;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableImageLazyLoading: true,
      enableServiceVirtualization: true,
      enableRoutePrefetching: true,
      enableBackgroundSync: true,
      cacheStrategy: 'hybrid',
      maxCacheSize: 100,
      cacheTTL: 5 * 60 * 1000, // 5 minutos
      ...config
    };
  }

  // Inicializar optimizaciones
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Configurar lazy loading de imágenes
      if (this.config.enableImageLazyLoading) {
        this.setupImageLazyLoading();
      }

      // Configurar precarga de rutas
      if (this.config.enableRoutePrefetching) {
        this.setupRoutePrefetching();
      }

      // Configurar sincronización en segundo plano
      if (this.config.enableBackgroundSync && 'serviceWorker' in navigator) {
        this.setupBackgroundSync();
      }

      // Limpiar caché expirado
      this.cleanupExpiredCache();

      this.isInitialized = true;
} catch (error) {
}
  }

  // Configurar lazy loading de imágenes
  private setupImageLazyLoading() {
    if (!('IntersectionObserver' in window)) return;

    this.imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              img.classList.remove('lazy');
              this.imageObserver?.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01
      }
    );

    // Observar imágenes existentes
    document.querySelectorAll('img[data-src]').forEach(img => {
      this.imageObserver?.observe(img);
    });
  }

  // Configurar precarga de rutas
  private setupRoutePrefetching() {
    if (typeof window === 'undefined') return;

    // Precargar rutas comunes
    const commonRoutes = [
      '/services',
      '/about',
      '/contact',
      '/booking'
    ];

    // Precargar en segundo plano
    setTimeout(() => {
      commonRoutes.forEach(route => {
        this.prefetchRoute(route);
      });
    }, 2000);
  }

  // Precargar una ruta específica
  private async prefetchRoute(route: string) {
    try {
      const response = await fetch(route, {
        method: 'HEAD'
      });
      
      if (response.ok) {
        this.routeCache.set(route, {
          timestamp: Date.now(),
          status: 'available'
        });
      }
    } catch (error) {
      // Silenciar errores de precarga
    }
  }

  // Configurar sincronización en segundo plano
  private setupBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        try {
          // Registrar sincronización para datos offline
          (registration as any).sync?.register('background-sync');
        } catch (error) {
          // Silenciar errores de sincronización
        }
      });
    }
  }

  // Sistema de caché inteligente
  setCache(key: string, data: any, ttl?: number) {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.cacheTTL
    };

    // Estrategia de caché híbrida
    if (this.config.cacheStrategy === 'hybrid' || this.config.cacheStrategy === 'localStorage') {
      try {
        const cacheKey = `tpt_cache_${key}`;
        localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
      } catch (error) {
        // Fallback a caché en memoria
        this.serviceCache.set(key, cacheEntry);
      }
    } else {
      this.serviceCache.set(key, cacheEntry);
    }

    // Limpiar caché si excede el tamaño máximo
    this.cleanupCache();
  }

  getCache(key: string): any | null {
    try {
      // Intentar obtener del localStorage primero
      if (this.config.cacheStrategy === 'hybrid' || this.config.cacheStrategy === 'localStorage') {
        const cacheKey = `tpt_cache_${key}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const entry = JSON.parse(cached);
          if (Date.now() - entry.timestamp < entry.ttl) {
            return entry.data;
          } else {
            localStorage.removeItem(cacheKey);
          }
        }
      }

      // Fallback a caché en memoria
      const entry = this.serviceCache.get(key);
      if (entry && Date.now() - entry.timestamp < entry.ttl) {
        return entry.data;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  // Limpiar caché expirado
  private cleanupExpiredCache() {
    const now = Date.now();

    // Limpiar caché en memoria
    for (const [key, entry] of this.serviceCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.serviceCache.delete(key);
      }
    }

    // Limpiar localStorage
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('tpt_cache_')) {
            const cached = localStorage.getItem(key);
            if (cached) {
              const entry = JSON.parse(cached);
              if (now - entry.timestamp > entry.ttl) {
                localStorage.removeItem(key);
              }
            }
          }
        });
      } catch (error) {
        // Silenciar errores de limpieza
      }
    }
  }

  // Limpiar caché si excede el tamaño máximo
  private cleanupCache() {
    if (this.serviceCache.size > this.config.maxCacheSize) {
      const entries = Array.from(this.serviceCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Eliminar entradas más antiguas
      const toRemove = entries.slice(0, Math.floor(this.config.maxCacheSize / 2));
      toRemove.forEach(([key]) => this.serviceCache.delete(key));
    }
  }

  // Optimizar imágenes
  optimizeImage(img: HTMLImageElement) {
    if (!this.imageObserver) return;

    // Marcar como lazy si no tiene src
    if (!img.src && img.dataset.src) {
      img.classList.add('lazy');
      this.imageObserver.observe(img);
    }

    // Agregar atributos de optimización
    img.loading = 'lazy';
    img.decoding = 'async';
  }

  // Optimizar lista de servicios con virtualización
  optimizeServiceList(container: HTMLElement, items: any[], itemHeight: number = 200) {
    if (!this.config.enableServiceVirtualization) return;

    const containerHeight = container.clientHeight;
    const visibleItems = Math.ceil(containerHeight / itemHeight) + 2; // +2 para buffer

    // Implementar virtualización básica
    const scrollTop = container.scrollTop;
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleItems, items.length);

    // Solo renderizar elementos visibles
    return items.slice(startIndex, endIndex);
  }

  // Prefetch de datos críticos
  async prefetchCriticalData() {
    try {
      // Prefetch de categorías
      const categoriesPromise = fetch('/api/categories').then(r => r.json());
      
      // Prefetch de servicios destacados
      const featuredPromise = fetch('/api/services?featured=true&limit=6').then(r => r.json());

      // Ejecutar en paralelo
      const [categories, featuredServices] = await Promise.allSettled([
        categoriesPromise,
        featuredPromise
      ]);

      // Guardar en caché
      if (categories.status === 'fulfilled') {
        this.setCache('categories', categories.value, 10 * 60 * 1000); // 10 minutos
      }

      if (featuredServices.status === 'fulfilled') {
        this.setCache('featured_services', featuredServices.value, 5 * 60 * 1000); // 5 minutos
      }
    } catch (error) {
      // Silenciar errores de prefetch
    }
  }

  // Métricas de rendimiento
  getPerformanceMetrics() {
    if (typeof window === 'undefined') return null;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      cacheSize: this.serviceCache.size,
      localStorageUsage: this.getLocalStorageUsage()
    };
  }

  private getLocalStorageUsage(): number {
    try {
      let total = 0;
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          total += localStorage[key].length;
        }
      }
      return total;
    } catch {
      return 0;
    }
  }

  // Limpiar recursos
  cleanup() {
    if (this.imageObserver) {
      this.imageObserver.disconnect();
      this.imageObserver = null;
    }

    this.serviceCache.clear();
    this.routeCache.clear();
    this.isInitialized = false;
  }
}

// Instancia global del optimizador
export const performanceOptimizer = new PerformanceOptimizer();

// Funciones de conveniencia
export const optimizeImage = (img: HTMLImageElement) => performanceOptimizer.optimizeImage(img);
export const setCache = (key: string, data: any, ttl?: number) => performanceOptimizer.setCache(key, data, ttl);
export const getCache = (key: string) => performanceOptimizer.getCache(key);
export const prefetchCriticalData = () => performanceOptimizer.prefetchCriticalData();
export const getPerformanceMetrics = () => performanceOptimizer.getPerformanceMetrics();

export default performanceOptimizer;





