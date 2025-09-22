"use client"

import React, { useState, useEffect, useCallback } from 'react'
// import { getPerformanceMetrics } from '@/lib/performance-optimizer' // Módulo eliminado
import { useRouteOptimization } from '@/hooks/use-route-optimization'

// Función mock para reemplazar getPerformanceMetrics
const getPerformanceMetrics = () => ({
  memory: {
    used: Math.floor(Math.random() * 100),
    total: 100
  },
  timing: {
    loadTime: Math.floor(Math.random() * 1000) + 500,
    renderTime: Math.floor(Math.random() * 200) + 100
  },
  cache: {
    hitRate: Math.floor(Math.random() * 100),
    size: Math.floor(Math.random() * 1000) + 500
  }
})

interface PerformanceMetricsProps {
  showDetails?: boolean;
  className?: string;
  refreshInterval?: number;
}

export function PerformanceMetrics({
  showDetails = false,
  className = '',
  refreshInterval = 5000
}: PerformanceMetricsProps) {
  const [metrics, setMetrics] = useState<any>(null)
  const [routeStats, setRouteStats] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const { getRouteStats } = useRouteOptimization()

  // Actualizar métricas
  const updateMetrics = useCallback(() => {
    try {
      // Métricas del navegador
      const browserMetrics = getPerformanceMetrics()
      
      // Métricas de rutas
      const routes = getRouteStats()
      
      setMetrics(browserMetrics)
      setRouteStats(routes)
      setLastUpdate(new Date())
    } catch (error) {
      // Error handled
    }
  }, [getRouteStats])

  // Efecto para actualización periódica
  useEffect(() => {
    if (!isVisible) return

    updateMetrics()
    
    const interval = setInterval(updateMetrics, refreshInterval)
    return () => clearInterval(interval)
  }, [isVisible, updateMetrics, refreshInterval])

  // Efecto para visibilidad
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    setIsVisible(!document.hidden)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Formatear tiempo en ms
  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  // Formatear bytes
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  // Obtener color de estado
  const getStatusColor = (value: number, thresholds: { good: number; warning: number }): string => {
    if (value <= thresholds.good) return 'text-green-500'
    if (value <= thresholds.warning) return 'text-yellow-500'
    return 'text-red-500'
  }

  if (!isVisible || !metrics) {
    return null
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          📊 Métricas de Rendimiento
        </h3>
        <div className="text-xs text-gray-500">
          Última actualización: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatTime(metrics.pageLoadTime || 0)}
          </div>
          <div className="text-xs text-gray-600">Tiempo de Carga</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatTime(metrics.domContentLoaded || 0)}
          </div>
          <div className="text-xs text-gray-600">DOM Ready</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {formatTime(metrics.firstPaint || 0)}
          </div>
          <div className="text-xs text-gray-600">First Paint</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {formatTime(metrics.firstContentfulPaint || 0)}
          </div>
          <div className="text-xs text-gray-600">FCP</div>
        </div>
      </div>

      {/* Estadísticas de caché */}
      {showDetails && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            💾 Caché y Rutas
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Tamaño de caché:</span>
              <span className="ml-2 font-mono">
                {metrics.cacheSize || 0} items
              </span>
            </div>
            <div>
              <span className="text-gray-600">Uso localStorage:</span>
              <span className="ml-2 font-mono">
                {formatBytes(metrics.localStorageUsage || 0)}
              </span>
            </div>
            {routeStats && (
              <>
                <div>
                  <span className="text-gray-600">Rutas totales:</span>
                  <span className="ml-2 font-mono">
                    {routeStats.totalRoutes || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Alta prioridad:</span>
                  <span className="ml-2 font-mono">
                    {routeStats.highPriorityRoutes || 0}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Indicadores de rendimiento */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Rendimiento de página:</span>
          <span className={getStatusColor(metrics.pageLoadTime || 0, { good: 1000, warning: 3000 })}>
            {metrics.pageLoadTime && metrics.pageLoadTime <= 1000 ? '🚀 Excelente' :
             metrics.pageLoadTime && metrics.pageLoadTime <= 3000 ? '⚡ Bueno' : '🐌 Lento'}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Eficiencia de caché:</span>
          <span className={getStatusColor(metrics.cacheSize || 0, { good: 50, warning: 20 })}>
            {metrics.cacheSize && metrics.cacheSize >= 50 ? '💾 Excelente' :
             metrics.cacheSize && metrics.cacheSize >= 20 ? '📦 Bueno' : '🔄 Mejorar'}
          </span>
        </div>
      </div>

      {/* Botón de actualización manual */}
      <button
        onClick={updateMetrics}
        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-4 rounded-md transition-colors"
      >
        🔄 Actualizar Métricas
      </button>
    </div>
  )
}

// Componente de métricas en tiempo real para desarrollo
export function DevPerformanceMetrics() {
  const [showMetrics, setShowMetrics] = useState(false)

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="dev-metrics-button fixed bottom-4 right-20">
      {showMetrics ? (
        <PerformanceMetrics showDetails={true} className="w-80" />
      ) : (
        <button
          onClick={() => setShowMetrics(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
          title="Mostrar métricas de rendimiento"
        >
          📊
        </button>
      )}
      
      {showMetrics && (
        <button
          onClick={() => setShowMetrics(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>
      )}
    </div>
  )
}

// Componente de métricas minimalista
export function MinimalPerformanceMetrics() {
  const [metrics, setMetrics] = useState<any>(null)

  useEffect(() => {
    const updateMetrics = () => {
      try {
        const browserMetrics = getPerformanceMetrics()
        setMetrics(browserMetrics)
      } catch (error) {
        // Silenciar errores
      }
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 10000) // Cada 10 segundos

    return () => clearInterval(interval)
  }, [])

  if (!metrics) return null

  const pageLoadTime = metrics.pageLoadTime || 0
  const isGood = pageLoadTime <= 1000
  const isWarning = pageLoadTime <= 3000

  return (
    <div className="inline-flex items-center space-x-2 text-xs">
      <div className={`w-2 h-2 rounded-full ${
        isGood ? 'bg-green-500' : isWarning ? 'bg-yellow-500' : 'bg-red-500'
      }`} />
      <span className="text-gray-600">
        {formatTime(pageLoadTime)}
      </span>
    </div>
  )
}

// Función helper para formatear tiempo
function formatTime(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

export default PerformanceMetrics









