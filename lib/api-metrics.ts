import { log } from './edge-compatible-logger'

export interface ApiMetrics {
  requests: {
    total: number
    byMethod: Record<string, number>
    byEndpoint: Record<string, number>
    byStatus: Record<number, number>
  }
  performance: {
    averageResponseTime: number
    p95ResponseTime: number
    p99ResponseTime: number
    slowestEndpoints: Array<{ endpoint: string; avgTime: number; count: number }>
  }
  errors: {
    total: number
    byEndpoint: Record<string, number>
    byType: Record<string, number>
    recentErrors: Array<{ timestamp: string; endpoint: string; error: string; count: number }>
  }
  cache: {
    hits: number
    misses: number
    hitRate: number
    byKey: Record<string, { hits: number; misses: number }>
  }
  database: {
    queries: number
    slowQueries: Array<{ query: string; avgTime: number; count: number }>
    errors: number
    connections: number
  }
  users: {
    active: number
    total: number
    byCountry: Record<string, number>
    byDevice: Record<string, number>
  }
  system: {
    memoryUsage: number
    cpuUsage: number
    uptime: number
    lastUpdate: string
  }
}

export interface MetricEntry {
  timestamp: string
  type: 'request' | 'performance' | 'error' | 'cache' | 'database' | 'user' | 'system'
  endpoint?: string
  method?: string
  statusCode?: number
  duration?: number
  error?: string
  cacheKey?: string
  cacheHit?: boolean
  query?: string
  queryTime?: number
  userId?: string
  country?: string
  device?: string
  metadata?: Record<string, any>
}

export class ApiMetricsCollector {
  private metrics: Map<string, number> = new Map()
  private performanceData: Map<string, number[]> = new Map()
  private errorData: Map<string, Array<{ timestamp: string; endpoint: string; error: string; count: number }>> = new Map()
  private cacheData: Map<string, { hits: number; misses: number }> = new Map()
  private databaseData: Map<string, { time: number; count: number }> = new Map()
  private userData: Map<string, Set<string>> = new Map()
  private lastUpdate = Date.now()

  constructor() {
    this.startPeriodicUpdate()
  }

  // Métodos para recolectar métricas
  recordRequest(endpoint: string, method: string, statusCode: number, duration: number) {
    const timestamp = Date.now()
    
    // Métricas generales de requests
    this.incrementMetric('requests.total')
    this.incrementMetric(`requests.byMethod.${method}`)
    this.incrementMetric(`requests.byEndpoint.${endpoint}`)
    this.incrementMetric(`requests.byStatus.${statusCode}`)

    // Métricas de rendimiento
    this.recordPerformance(endpoint, duration)

    // Métricas de errores
    if (statusCode >= 400) {
      this.recordError(endpoint, `HTTP ${statusCode}`, timestamp)
    }

    // Log de la métrica
    log.debug('Metric recorded', {
      function: 'metrics',
      type: 'request',
      endpoint,
      method,
      statusCode,
      duration
    })
  }

  recordPerformance(endpoint: string, duration: number) {
    const key = `performance.${endpoint}`
    if (!this.performanceData.has(key)) {
      this.performanceData.set(key, [])
    }
    
    const times = this.performanceData.get(key)!
    times.push(duration)
    
    // Mantener solo los últimos 1000 valores para calcular percentiles
    if (times.length > 1000) {
      times.splice(0, times.length - 1000)
    }

    // Calcular métricas de rendimiento
    this.updatePerformanceMetrics(endpoint, times)
  }

  recordError(endpoint: string, error: string, timestamp: number) {
    this.incrementMetric('errors.total')
    this.incrementMetric(`errors.byEndpoint.${endpoint}`)
    this.incrementMetric(`errors.byType.${error}`)

    // Registrar error reciente
    const key = `errors.recent.${endpoint}`
    if (!this.errorData.has(key)) {
      this.errorData.set(key, [])
    }

    const errors = this.errorData.get(key)!
    const existingError = errors.find(e => e.error === error)
    
    if (existingError) {
      existingError.count++
      existingError.timestamp = new Date(timestamp).toISOString()
    } else {
      errors.push({
        timestamp: new Date(timestamp).toISOString(),
        endpoint,
        error,
        count: 1
      })
    }

    // Mantener solo los últimos 100 errores
    if (errors.length > 100) {
      errors.splice(0, errors.length - 100)
    }
  }

  recordCacheOperation(key: string, hit: boolean) {
    if (hit) {
      this.incrementMetric('cache.hits')
    } else {
      this.incrementMetric('cache.misses')
    }

    // Métricas por clave de cache
    if (!this.cacheData.has(key)) {
      this.cacheData.set(key, { hits: 0, misses: 0 })
    }

    const cacheStats = this.cacheData.get(key)!
    if (hit) {
      cacheStats.hits++
    } else {
      cacheStats.misses++
    }

    // Log de la operación de cache
    log.info('Cache operation', { function: 'metrics', type: 'cache' }, { hit, key })
  }

  recordDatabaseQuery(query: string, duration: number) {
    this.incrementMetric('database.queries')
    
    if (duration > 1000) { // Queries lentas (>1s)
      this.incrementMetric('database.slowQueries')
    }

    // Métricas por query
    const key = `database.${query.substring(0, 50)}` // Truncar query larga
    if (!this.databaseData.has(key)) {
      this.databaseData.set(key, { time: 0, count: 0 })
    }

    const queryStats = this.databaseData.get(key)!
    queryStats.time += duration
    queryStats.count++

    // Log de la query
    log.debug('Database query recorded', {
      function: 'metrics',
      type: 'database',
      query: query.substring(0, 100),
      duration
    })
  }

  recordUserActivity(userId: string, country?: string, device?: string) {
    // Usuarios activos
    const activeKey = `users.active.${Date.now() - (Date.now() % (5 * 60 * 1000))}` // 5 minutos
    if (!this.userData.has(activeKey)) {
      this.userData.set(activeKey, new Set())
    }
    
    const activeUsers = this.userData.get(activeKey)!
    activeUsers.add(userId)

    // Usuarios totales
    this.incrementMetric('users.total')

    // Usuarios por país
    if (country) {
      this.incrementMetric(`users.byCountry.${country}`)
    }

    // Usuarios por dispositivo
    if (device) {
      this.incrementMetric(`users.byDevice.${device}`)
    }
  }

  // Métodos para obtener métricas
  getMetrics(): ApiMetrics {
    const now = Date.now()
    
    return {
      requests: this.getRequestMetrics(),
      performance: this.getPerformanceMetrics(),
      errors: this.getErrorMetrics(),
      cache: this.getCacheMetrics(),
      database: this.getDatabaseMetrics(),
      users: this.getUserMetrics(),
      system: {
        memoryUsage: 0, // No disponible en Edge Runtime
        cpuUsage: 0, // Implementar si es necesario
        uptime: 0, // No disponible en Edge Runtime
        lastUpdate: new Date(this.lastUpdate).toISOString()
      }
    }
  }

  private getRequestMetrics() {
    const total = this.getMetric('requests.total') || 0
    const byMethod: Record<string, number> = {}
    const byEndpoint: Record<string, number> = {}
    const byStatus: Record<number, number> = {}

    // Obtener métricas por método
    for (const [key, value] of this.metrics.entries()) {
      if (key.startsWith('requests.byMethod.')) {
        const method = key.replace('requests.byMethod.', '')
        byMethod[method] = value
      } else if (key.startsWith('requests.byEndpoint.')) {
        const endpoint = key.replace('requests.byEndpoint.', '')
        byEndpoint[endpoint] = value
      } else if (key.startsWith('requests.byStatus.')) {
        const status = parseInt(key.replace('requests.byStatus.', ''))
        byStatus[status] = value
      }
    }

    return { total, byMethod, byEndpoint, byStatus }
  }

  private getPerformanceMetrics() {
    const slowestEndpoints: Array<{ endpoint: string; avgTime: number; count: number }> = []
    
    for (const [key, times] of this.performanceData.entries()) {
      if (key.startsWith('performance.')) {
        const endpoint = key.replace('performance.', '')
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length
        const count = times.length
        
        slowestEndpoints.push({ endpoint, avgTime, count })
      }
    }

    // Ordenar por tiempo promedio descendente
    slowestEndpoints.sort((a, b) => b.avgTime - a.avgTime)

    // Calcular percentiles globales
    const allTimes = Array.from(this.performanceData.values()).flat()
    const sortedTimes = allTimes.sort((a, b) => a - b)
    
    const p95Index = Math.floor(sortedTimes.length * 0.95)
    const p99Index = Math.floor(sortedTimes.length * 0.99)

    return {
      averageResponseTime: allTimes.length > 0 ? allTimes.reduce((a, b) => a + b, 0) / allTimes.length : 0,
      p95ResponseTime: sortedTimes[p95Index] || 0,
      p99ResponseTime: sortedTimes[p99Index] || 0,
      slowestEndpoints: slowestEndpoints.slice(0, 10) // Top 10
    }
  }

  private getErrorMetrics() {
    const total = this.getMetric('errors.total') || 0
    const byEndpoint: Record<string, number> = {}
    const byType: Record<string, number> = {}
    const recentErrors: Array<{ timestamp: string; endpoint: string; error: string; count: number }> = []

    // Obtener métricas por endpoint y tipo
    for (const [key, value] of this.metrics.entries()) {
      if (key.startsWith('errors.byEndpoint.')) {
        const endpoint = key.replace('errors.byEndpoint.', '')
        byEndpoint[endpoint] = value
      } else if (key.startsWith('errors.byType.')) {
        const type = key.replace('errors.byType.', '')
        byType[type] = value
      }
    }

    // Obtener errores recientes
    for (const [key, errors] of this.errorData.entries()) {
      if (key.startsWith('errors.recent.')) {
        const endpoint = key.replace('errors.recent.', '')
        recentErrors.push(...errors)
      }
    }

    // Ordenar por timestamp descendente y tomar los últimos 50
    recentErrors.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    recentErrors.splice(50)

    return { total, byEndpoint, byType, recentErrors }
  }

  private getCacheMetrics() {
    const hits = this.getMetric('cache.hits') || 0
    const misses = this.getMetric('cache.misses') || 0
    const hitRate = hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0

    const byKey: Record<string, { hits: number; misses: number }> = {}
    for (const [key, stats] of this.cacheData.entries()) {
      byKey[key] = { ...stats }
    }

    return { hits, misses, hitRate, byKey }
  }

  private getDatabaseMetrics() {
    const queries = this.getMetric('database.queries') || 0
    const slowQueries: Array<{ query: string; avgTime: number; count: number }> = []
    const errors = this.getMetric('database.errors') || 0

    // Obtener queries lentas
    for (const [key, stats] of this.databaseData.entries()) {
      if (key.startsWith('database.')) {
        const query = key.replace('database.', '')
        const avgTime = stats.count > 0 ? stats.time / stats.count : 0
        
        if (avgTime > 100) { // Solo queries con tiempo promedio > 100ms
          slowQueries.push({ query, avgTime, count: stats.count })
        }
      }
    }

    // Ordenar por tiempo promedio descendente
    slowQueries.sort((a, b) => b.avgTime - a.avgTime)

    return {
      queries,
      slowQueries: slowQueries.slice(0, 20), // Top 20
      errors,
      connections: 0 // Implementar si es necesario
    }
  }

  private getUserMetrics() {
    const total = this.getMetric('users.total') || 0
    const byCountry: Record<string, number> = {}
    const byDevice: Record<string, number> = {}

    // Obtener métricas por país y dispositivo
    for (const [key, value] of this.metrics.entries()) {
      if (key.startsWith('users.byCountry.')) {
        const country = key.replace('users.byCountry.', '')
        byCountry[country] = value
      } else if (key.startsWith('users.byDevice.')) {
        const device = key.replace('users.byDevice.', '')
        byDevice[device] = value
      }
    }

    // Calcular usuarios activos (últimos 5 minutos)
    const activeKey = `users.active.${Date.now() - (Date.now() % (5 * 60 * 1000))}`
    const active = this.userData.get(activeKey)?.size || 0

    return { active, total, byCountry, byDevice }
  }

  // Métodos de utilidad
  private incrementMetric(key: string) {
    const current = this.metrics.get(key) || 0
    this.metrics.set(key, current + 1)
  }

  private getMetric(key: string): number | undefined {
    return this.metrics.get(key)
  }

  private updatePerformanceMetrics(endpoint: string, times: number[]) {
    // Métricas ya se actualizan en recordPerformance
  }

  // Métodos de mantenimiento
  private startPeriodicUpdate() {
    // Actualizar métricas cada minuto
    setInterval(() => {
      this.lastUpdate = Date.now()
      this.cleanupOldData()
    }, 60 * 1000)
  }

  private cleanupOldData() {
    const now = Date.now()
    const fiveMinutesAgo = now - (5 * 60 * 1000)

    // Limpiar datos de usuarios activos antiguos
    for (const [key] of this.userData.entries()) {
      if (key.startsWith('users.active.')) {
        const timestamp = parseInt(key.replace('users.active.', ''))
        if (timestamp < fiveMinutesAgo) {
          this.userData.delete(key)
        }
      }
    }

    // Limpiar métricas antiguas (mantener solo las últimas 24 horas)
    const oneDayAgo = now - (24 * 60 * 60 * 1000)
    // Implementar limpieza de métricas antiguas si es necesario
  }

  // Métodos públicos para reset y export
  resetMetrics() {
    this.metrics.clear()
    this.performanceData.clear()
    this.errorData.clear()
    this.cacheData.clear()
    this.databaseData.clear()
    this.userData.clear()
    this.lastUpdate = Date.now()
    
    log.info('Metrics reset', { function: 'metrics' })
  }

  exportMetrics(): string {
    const metrics = this.getMetrics()
    return JSON.stringify(metrics, null, 2)
  }
}

// Instancia singleton del colector de métricas
export const metricsCollector = new ApiMetricsCollector()

// Función helper para registrar métricas rápidamente
export const recordMetric = {
  request: (endpoint: string, method: string, statusCode: number, duration: number) =>
    metricsCollector.recordRequest(endpoint, method, statusCode, duration),
  
  error: (endpoint: string, error: string) =>
    metricsCollector.recordError(endpoint, error, Date.now()),
  
  cache: (key: string, hit: boolean) =>
    metricsCollector.recordCacheOperation(key, hit),
  
  database: (query: string, duration: number) =>
    metricsCollector.recordDatabaseQuery(query, duration),
  
  user: (userId: string, country?: string, device?: string) =>
    metricsCollector.recordUserActivity(userId, country, device)
}
