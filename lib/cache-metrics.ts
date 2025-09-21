/**
 * Sistema de métricas avanzado para el caché unificado
 * Proporciona monitoreo en tiempo real y alertas automáticas
 */

import { METRICS_CONFIG } from './cache-config'

export interface CacheMetrics {
  // Métricas básicas
  hitRate: number
  missRate: number
  totalRequests: number
  
  // Métricas de rendimiento
  avgResponseTime: number
  maxResponseTime: number
  minResponseTime: number
  
  // Métricas de memoria
  memoryUsage: number
  memoryUsagePercent: number
  compressionRatio: number
  
  // Métricas de limpieza
  evictedEntries: number
  expiredEntries: number
  cleanupCount: number
  
  // Métricas de persistencia
  persistenceHits: number
  persistenceMisses: number
  lastSyncTime: number
  
  // Métricas de tags
  tagStats: Record<string, {
    hits: number
    misses: number
    entries: number
    avgSize: number
  }>
}

export interface CacheAlert {
  type: 'warning' | 'error' | 'info'
  message: string
  timestamp: number
  metric: string
  value: number
  threshold: number
}

export class CacheMetricsCollector {
  private metrics: CacheMetrics
  private alerts: CacheAlert[] = []
  private listeners: Array<(metrics: CacheMetrics) => void> = []
  private alertListeners: Array<(alert: CacheAlert) => void> = []
  private intervalId?: NodeJS.Timeout

  constructor() {
    this.metrics = this.initializeMetrics()
  }

  private initializeMetrics(): CacheMetrics {
    return {
      hitRate: 0,
      missRate: 0,
      totalRequests: 0,
      avgResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: Infinity,
      memoryUsage: 0,
      memoryUsagePercent: 0,
      compressionRatio: 0,
      evictedEntries: 0,
      expiredEntries: 0,
      cleanupCount: 0,
      persistenceHits: 0,
      persistenceMisses: 0,
      lastSyncTime: 0,
      tagStats: {}
    }
  }

  // Registrar hit
  recordHit(responseTime: number, tag?: string): void {
    this.metrics.totalRequests++
    this.updateResponseTime(responseTime)
    
    if (tag) {
      this.updateTagStats(tag, 'hit', responseTime)
    }
    
    this.calculateRates()
    this.notifyListeners()
  }

  // Registrar miss
  recordMiss(responseTime: number, tag?: string): void {
    this.metrics.totalRequests++
    this.updateResponseTime(responseTime)
    
    if (tag) {
      this.updateTagStats(tag, 'miss', responseTime)
    }
    
    this.calculateRates()
    this.notifyListeners()
  }

  // Registrar entrada evadida
  recordEviction(count: number): void {
    this.metrics.evictedEntries += count
    this.notifyListeners()
  }

  // Registrar entrada expirada
  recordExpiration(count: number): void {
    this.metrics.expiredEntries += count
    this.notifyListeners()
  }

  // Registrar limpieza
  recordCleanup(): void {
    this.metrics.cleanupCount++
    this.notifyListeners()
  }

  // Registrar persistencia
  recordPersistenceHit(): void {
    this.metrics.persistenceHits++
    this.notifyListeners()
  }

  recordPersistenceMiss(): void {
    this.metrics.persistenceMisses++
    this.notifyListeners()
  }

  // Actualizar métricas de memoria
  updateMemoryMetrics(usage: number, maxUsage: number): void {
    this.metrics.memoryUsage = usage
    this.metrics.memoryUsagePercent = (usage / maxUsage) * 100
    this.checkMemoryAlerts()
    this.notifyListeners()
  }

  // Actualizar métricas de compresión
  updateCompressionMetrics(originalSize: number, compressedSize: number): void {
    this.metrics.compressionRatio = compressedSize / originalSize
    this.notifyListeners()
  }

  // Actualizar tiempo de respuesta
  private updateResponseTime(responseTime: number): void {
    this.metrics.avgResponseTime = 
      (this.metrics.avgResponseTime * (this.metrics.totalRequests - 1) + responseTime) / 
      this.metrics.totalRequests
    
    this.metrics.maxResponseTime = Math.max(this.metrics.maxResponseTime, responseTime)
    this.metrics.minResponseTime = Math.min(this.metrics.minResponseTime, responseTime)
    
    this.checkResponseTimeAlerts(responseTime)
  }

  // Actualizar estadísticas de tags
  private updateTagStats(tag: string, type: 'hit' | 'miss', responseTime: number): void {
    if (!this.metrics.tagStats[tag]) {
      this.metrics.tagStats[tag] = {
        hits: 0,
        misses: 0,
        entries: 0,
        avgSize: 0
      }
    }

    const tagStats = this.metrics.tagStats[tag]
    
    if (type === 'hit') {
      tagStats.hits++
    } else {
      tagStats.misses++
    }
  }

  // Calcular tasas
  private calculateRates(): void {
    const total = this.metrics.totalRequests
    if (total > 0) {
      const hits = Object.values(this.metrics.tagStats).reduce((sum, stats) => sum + stats.hits, 0)
      this.metrics.hitRate = hits / total
      this.metrics.missRate = 1 - this.metrics.hitRate
      
      this.checkHitRateAlerts()
    }
  }

  // Verificar alertas de hit rate
  private checkHitRateAlerts(): void {
    if (this.metrics.hitRate < METRICS_CONFIG.ALERT_THRESHOLDS.LOW_HIT_RATE) {
      this.addAlert({
        type: 'warning',
        message: `Hit rate bajo: ${(this.metrics.hitRate * 100).toFixed(1)}%`,
        timestamp: Date.now(),
        metric: 'hitRate',
        value: this.metrics.hitRate,
        threshold: METRICS_CONFIG.ALERT_THRESHOLDS.LOW_HIT_RATE
      })
    }
  }

  // Verificar alertas de memoria
  private checkMemoryAlerts(): void {
    if (this.metrics.memoryUsagePercent > METRICS_CONFIG.ALERT_THRESHOLDS.HIGH_MEMORY_USAGE * 100) {
      this.addAlert({
        type: 'warning',
        message: `Uso de memoria alto: ${this.metrics.memoryUsagePercent.toFixed(1)}%`,
        timestamp: Date.now(),
        metric: 'memoryUsage',
        value: this.metrics.memoryUsagePercent,
        threshold: METRICS_CONFIG.ALERT_THRESHOLDS.HIGH_MEMORY_USAGE * 100
      })
    }
  }

  // Verificar alertas de tiempo de respuesta
  private checkResponseTimeAlerts(responseTime: number): void {
    if (responseTime > METRICS_CONFIG.ALERT_THRESHOLDS.SLOW_RESPONSE_TIME) {
      this.addAlert({
        type: 'warning',
        message: `Tiempo de respuesta lento: ${responseTime.toFixed(1)}ms`,
        timestamp: Date.now(),
        metric: 'responseTime',
        value: responseTime,
        threshold: METRICS_CONFIG.ALERT_THRESHOLDS.SLOW_RESPONSE_TIME
      })
    }
  }

  // Añadir alerta
  private addAlert(alert: CacheAlert): void {
    this.alerts.push(alert)
    
    // Mantener solo las últimas 100 alertas
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100)
    }
    
    this.notifyAlertListeners(alert)
  }

  // Notificar listeners de métricas
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.metrics)
      } catch (error) {
        }
    })
  }

  // Notificar listeners de alertas
  private notifyAlertListeners(alert: CacheAlert): void {
    this.alertListeners.forEach(listener => {
      try {
        listener(alert)
      } catch (error) {
        }
    })
  }

  // Suscribirse a métricas
  subscribe(listener: (metrics: CacheMetrics) => void): () => void {
    this.listeners.push(listener)
    
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // Suscribirse a alertas
  subscribeToAlerts(listener: (alert: CacheAlert) => void): () => void {
    this.alertListeners.push(listener)
    
    return () => {
      const index = this.alertListeners.indexOf(listener)
      if (index > -1) {
        this.alertListeners.splice(index, 1)
      }
    }
  }

  // Obtener métricas actuales
  getMetrics(): CacheMetrics {
    return { ...this.metrics }
  }

  // Obtener alertas
  getAlerts(): CacheAlert[] {
    return [...this.alerts]
  }

  // Limpiar alertas
  clearAlerts(): void {
    this.alerts = []
  }

  // Iniciar monitoreo automático
  startMonitoring(interval: number = METRICS_CONFIG.REPORTING_INTERVALS.REAL_TIME): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }

    this.intervalId = setInterval(() => {
      this.notifyListeners()
    }, interval)
  }

  // Detener monitoreo
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
  }

  // Resetear métricas
  reset(): void {
    this.metrics = this.initializeMetrics()
    this.alerts = []
    this.notifyListeners()
  }

  // Generar reporte
  generateReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      alerts: this.alerts.slice(-10), // Últimas 10 alertas
      summary: {
        totalRequests: this.metrics.totalRequests,
        hitRate: `${(this.metrics.hitRate * 100).toFixed(1)}%`,
        avgResponseTime: `${this.metrics.avgResponseTime.toFixed(1)}ms`,
        memoryUsage: `${this.metrics.memoryUsagePercent.toFixed(1)}%`,
        compressionRatio: `${(this.metrics.compressionRatio * 100).toFixed(1)}%`
      }
    }

    return JSON.stringify(report, null, 2)
  }
}

// Instancia global de métricas
export const cacheMetrics = new CacheMetricsCollector()
