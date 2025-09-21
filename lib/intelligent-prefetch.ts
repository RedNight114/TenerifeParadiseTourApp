// Sistema de prefetch inteligente para optimizar la navegación
// Implementa precarga basada en comportamiento del usuario y análisis de patrones

import { optimizationConfig } from './optimization-config'

interface PrefetchConfig {
  enabled: boolean
  maxConcurrent: number
  timeout: number
  priority: 'high' | 'medium' | 'low'
  enableAnalytics: boolean
  enablePredictive: boolean
}

interface PrefetchRequest {
  id: string
  url: string
  priority: 'high' | 'medium' | 'low'
  timestamp: number
  status: 'pending' | 'loading' | 'completed' | 'failed'
  retries: number
  maxRetries: number
}

class IntelligentPrefetch {
  private config: PrefetchConfig
  private queue: Map<string, PrefetchRequest> = new Map()
  private activeRequests: Set<string> = new Set()
  private userPatterns: Map<string, number> = new Map()
  private navigationHistory: string[] = []
  private maxHistorySize = 100
  private analytics: PrefetchAnalytics

  constructor(config: Partial<PrefetchConfig> = {}) {
    this.config = {
      enabled: true,
      maxConcurrent: 3,
      timeout: 10000,
      priority: 'medium',
      enableAnalytics: true,
      enablePredictive: true,
      ...config
    }

    this.analytics = new PrefetchAnalytics()
    this.initialize()
  }

  private initialize() {
    if (!this.config.enabled) return

    // Escuchar eventos de navegación
    this.setupNavigationListeners()
    
    // Escuchar eventos de hover y focus
    this.setupInteractionListeners()
    
    // Iniciar procesamiento de cola
    this.processQueue()
    
    // Iniciar análisis predictivo
    if (this.config.enablePredictive) {
      this.startPredictiveAnalysis()
    }
  }

  // Configurar listeners de navegación
  private setupNavigationListeners() {
    if (typeof window === 'undefined') return

    // Escuchar cambios de ruta
    let currentPath = window.location.pathname
    const observer = new MutationObserver(() => {
      const newPath = window.location.pathname
      if (newPath !== currentPath) {
        this.recordNavigation(currentPath, newPath)
        currentPath = newPath
      }
    })

    if (typeof document !== 'undefined') {
      observer.observe(document.body, { childList: true, subtree: true })
    }

    // Escuchar eventos de popstate
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => {
        const newPath = window.location.pathname
        this.recordNavigation(currentPath, newPath)
        currentPath = newPath
      })
    }
  }

  // Configurar listeners de interacción
  private setupInteractionListeners() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    // Prefetch en hover de enlaces
    document.addEventListener('mouseover', (e) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (link && link.href) {
        const url = new URL(link.href)
        if (url.origin === window.location.origin) {
          this.prefetch(url.pathname, 'medium')
        }
      }
    })

    // Prefetch en focus de enlaces
    document.addEventListener('focusin', (e) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (link && link.href) {
        const url = new URL(link.href)
        if (url.origin === window.location.origin) {
          this.prefetch(url.pathname, 'high')
        }
      }
    })
  }

  // Registrar navegación
  private recordNavigation(from: string, to: string) {
    // Agregar a historial
    this.navigationHistory.push(`${from} -> ${to}`)
    
    // Mantener tamaño del historial
    if (this.navigationHistory.length > this.maxHistorySize) {
      this.navigationHistory.shift()
    }

    // Actualizar patrones de usuario
    const pattern = `${from} -> ${to}`
    this.userPatterns.set(pattern, (this.userPatterns.get(pattern) || 0) + 1)

    // Analizar para prefetch predictivo
    this.analyzeNavigationPattern(from, to)
  }

  // Analizar patrones de navegación
  private analyzeNavigationPattern(from: string, to: string) {
    if (!this.config.enablePredictive) return

    // Buscar patrones similares
    const similarPatterns = Array.from(this.userPatterns.entries())
      .filter(([pattern, count]) => {
        const [patternFrom] = pattern.split(' -> ')
        return patternFrom === from && count > 2
      })
      .sort(([, a], [, b]) => b - a)

    // Prefetch rutas más probables
    similarPatterns.slice(0, 3).forEach(([pattern]) => {
      const [, patternTo] = pattern.split(' -> ')
      if (patternTo && patternTo !== to) {
        this.prefetch(patternTo, 'low')
      }
    })
  }

  // Prefetch de ruta
  prefetch(url: string, priority: 'high' | 'medium' | 'low' = 'medium') {
    if (!this.config.enabled) return

    // Normalizar URL
    const normalizedUrl = this.normalizeUrl(url)
    
    // Verificar si ya está en cola
    if (this.queue.has(normalizedUrl)) {
      const existing = this.queue.get(normalizedUrl)!
      if (priority === 'high' && existing.priority !== 'high') {
        existing.priority = 'high'
        existing.timestamp = Date.now()
      }
      return
    }

    // Crear solicitud de prefetch
    const request: PrefetchRequest = {
      id: this.generateId(),
      url: normalizedUrl,
      priority,
      timestamp: Date.now(),
      status: 'pending',
      retries: 0,
      maxRetries: 2
    }

    // Agregar a cola
    this.queue.set(normalizedUrl, request)
    
    // Registrar en analytics
    if (this.config.enableAnalytics) {
      this.analytics.recordPrefetchRequest(request)
    }
  }

  // Normalizar URL
  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url, window.location.origin)
      return urlObj.pathname
    } catch {
      return url.startsWith('/') ? url : `/${url}`
    }
  }

  // Generar ID único
  private generateId(): string {
    return `prefetch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Procesar cola de prefetch
  private async processQueue() {
    if (this.activeRequests.size >= this.config.maxConcurrent) {
      return
    }

    // Obtener siguiente solicitud por prioridad
    const nextRequest = this.getNextRequest()
    if (!nextRequest) return

    // Marcar como activa
    this.activeRequests.add(nextRequest.id)
    nextRequest.status = 'loading'

    try {
      // Ejecutar prefetch
      await this.executePrefetch(nextRequest)
      
      // Marcar como completada
      nextRequest.status = 'completed'
      this.queue.delete(nextRequest.url)
      
      // Registrar éxito en analytics
      if (this.config.enableAnalytics) {
        this.analytics.recordPrefetchSuccess(nextRequest)
      }
    } catch (error) {
      // Manejar error
      nextRequest.status = 'failed'
      nextRequest.retries++
      
      if (nextRequest.retries < nextRequest.maxRetries) {
        // Reintentar
        setTimeout(() => {
          this.queue.set(nextRequest.url, nextRequest)
          this.processQueue()
        }, 1000 * nextRequest.retries)
      } else {
        // Eliminar después de máximo de reintentos
        this.queue.delete(nextRequest.url)
      }
      
      // Registrar error en analytics
      if (this.config.enableAnalytics) {
        this.analytics.recordPrefetchError(nextRequest, error)
      }
    } finally {
      // Liberar slot activo
      this.activeRequests.delete(nextRequest.id)
      
      // Procesar siguiente solicitud
      setTimeout(() => this.processQueue(), 0)
    }
  }

  // Obtener siguiente solicitud por prioridad
  private getNextRequest(): PrefetchRequest | null {
    const requests = Array.from(this.queue.values())
      .filter(req => req.status === 'pending')
      .sort((a, b) => {
        // Ordenar por prioridad
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        
        if (priorityDiff !== 0) return priorityDiff
        
        // Si misma prioridad, ordenar por timestamp
        return a.timestamp - b.timestamp
      })

    return requests[0] || null
  }

  // Ejecutar prefetch
  private async executePrefetch(request: PrefetchRequest): Promise<void> {
    if (typeof document === 'undefined') {
      return Promise.reject(new Error('Document not available'))
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Prefetch timeout'))
      }, this.config.timeout)

      // Crear link de prefetch
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = request.url
      link.as = 'document'
      
      link.onload = () => {
        clearTimeout(timeout)
        resolve()
      }
      
      link.onerror = () => {
        clearTimeout(timeout)
        reject(new Error('Prefetch failed'))
      }

      // Agregar al DOM
      document.head.appendChild(link)
      
      // Limpiar después de un tiempo
      setTimeout(() => {
        if (document.head.contains(link)) {
          document.head.removeChild(link)
        }
      }, 30000)
    })
  }

  // Iniciar análisis predictivo
  private startPredictiveAnalysis() {
    setInterval(() => {
      this.analyzeUserBehavior()
    }, 30000) // Cada 30 segundos
  }

  // Analizar comportamiento del usuario
  private analyzeUserBehavior() {
    if (this.navigationHistory.length < 5) return

    // Analizar patrones de navegación
    const patterns = this.extractNavigationPatterns()
    
    // Prefetch rutas más probables
    patterns.forEach(pattern => {
      if (pattern.probability > 0.3) {
        this.prefetch(pattern.to, 'low')
      }
    })
  }

  // Extraer patrones de navegación
  private extractNavigationPatterns() {
    const patterns: Array<{ from: string; to: string; probability: number }> = []
    const currentPath = window.location.pathname
    
    // Buscar patrones desde la ruta actual
    this.userPatterns.forEach((count, pattern) => {
      const [from, to] = pattern.split(' -> ')
      if (from === currentPath) {
        const totalFrom = Array.from(this.userPatterns.entries())
          .filter(([p]) => p.startsWith(`${from} ->`))
          .reduce((sum, [, c]) => sum + c, 0)
        
        patterns.push({
          from,
          to,
          probability: count / totalFrom
        })
      }
    })

    return patterns.sort((a, b) => b.probability - a.probability)
  }

  // Obtener estadísticas
  getStats() {
    return {
      queueSize: this.queue.size,
      activeRequests: this.activeRequests.size,
      maxConcurrent: this.config.maxConcurrent,
      navigationHistory: this.navigationHistory.length,
      userPatterns: this.userPatterns.size,
      analytics: this.analytics.getStats()
    }
  }

  // Limpiar cola
  clearQueue() {
    this.queue.clear()
    this.activeRequests.clear()
  }

  // Destruir instancia
  destroy() {
    this.clearQueue()
    this.userPatterns.clear()
    this.navigationHistory = []
  }
}

// Clase para analytics de prefetch
class PrefetchAnalytics {
  private requests: Array<{ timestamp: number; success: boolean; priority: string; url: string }> = []
  private maxRecords = 1000

  recordPrefetchRequest(request: PrefetchRequest) {
    this.requests.push({
      timestamp: Date.now(),
      success: false,
      priority: request.priority,
      url: request.url
    })

    if (this.requests.length > this.maxRecords) {
      this.requests.shift()
    }
  }

  recordPrefetchSuccess(request: PrefetchRequest) {
    const record = this.requests.find(r => r.url === request.url && !r.success)
    if (record) {
      record.success = true
    }
  }

  recordPrefetchError(request: PrefetchRequest, error: unknown) {
    // Los errores ya están marcados como no exitosos por defecto
  }

  getStats() {
    const total = this.requests.length
    const successful = this.requests.filter(r => r.success).length
    const successRate = total > 0 ? successful / total : 0

    const priorityStats = this.requests.reduce((acc, r) => {
      acc[r.priority] = (acc[r.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      successful,
      successRate,
      priorityStats,
      recentRequests: this.requests.slice(-10)
    }
  }
}

// Instancia global
export const intelligentPrefetch = new IntelligentPrefetch()

// Funciones de utilidad
export function prefetchRoute(url: string, priority: 'high' | 'medium' | 'low' = 'medium') {
  intelligentPrefetch.prefetch(url, priority)
}

export function getPrefetchStats() {
  return intelligentPrefetch.getStats()
}

export function clearPrefetchQueue() {
  intelligentPrefetch.clearQueue()
}

