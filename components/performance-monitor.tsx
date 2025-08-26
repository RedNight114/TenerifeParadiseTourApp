"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, 
  Database, 
  HardDrive, 
  Cpu, 
  Network, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  X,
  Maximize2,
  Minimize2,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { supabaseClient } from '@/lib/supabase-client'
import { getPersistentCacheStats } from '@/lib/persistent-cache'
import { optimizationConfig } from '@/lib/optimization-config'

interface PerformanceMetrics {
  timestamp: number
  memory: {
    used: number
    total: number
    percentage: number
  }
  network: {
    requests: number
    errors: number
    avgResponseTime: number
  }
  cache: {
    memoryHitRate: number
    persistentHitRate: number
    memorySize: number
    persistentSize: number
  }
  supabase: {
    poolSize: number
    maxPoolSize: number
    queueLength: number
    isProcessing: boolean
  }
  components: {
    renderCount: number
    reRenderCount: number
    memoizationEfficiency: number
  }
}

interface PerformanceMonitorProps {
  className?: string
  showDetails?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export function PerformanceMonitor({ 
  className = "", 
  showDetails = false,
  autoRefresh = true,
  refreshInterval = 5000
}: PerformanceMonitorProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(showDetails)
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Función para obtener métricas de rendimiento
  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Métricas de memoria
      const memoryInfo = (performance as any).memory || {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0
      }

      // Métricas de Supabase
      const supabaseStats = supabaseClient.getStats()

      // Métricas de caché persistente
      const persistentCacheStats = getPersistentCacheStats()

      // Obtener estadísticas detalladas del caché
      const detailedCacheStats = supabaseClient.getDetailedCacheStats()

      // Métricas de red (simuladas por ahora)
      const networkMetrics = {
        requests: Math.floor(Math.random() * 100) + 50,
        errors: Math.floor(Math.random() * 5),
        avgResponseTime: Math.floor(Math.random() * 200) + 50
      }

      // Métricas de componentes (simuladas por ahora)
      const componentMetrics = {
        renderCount: Math.floor(Math.random() * 1000) + 500,
        reRenderCount: Math.floor(Math.random() * 100) + 20,
        memoizationEfficiency: Math.floor(Math.random() * 30) + 70
      }

      const newMetrics: PerformanceMetrics = {
        timestamp: Date.now(),
        memory: {
          used: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024 * 100) / 100, // MB
          total: Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024 * 100) / 100, // MB
          percentage: Math.round((memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100)
        },
        network: networkMetrics,
        cache: {
          memoryHitRate: detailedCacheStats.hitRate || 0,
          persistentHitRate: persistentCacheStats.categories.hitRate || 0,
          memorySize: detailedCacheStats.totalSize || 0,
          persistentSize: persistentCacheStats.categories.totalSize || 0
        },
        supabase: {
          poolSize: supabaseStats.poolSize || 0,
          maxPoolSize: supabaseStats.maxPoolSize || 5,
          queueLength: supabaseStats.queueLength || 0,
          isProcessing: supabaseStats.isProcessing || false
        },
        components: componentMetrics
      }

      setMetrics(newMetrics)
      setLastUpdate(new Date())

    } catch (error) {
setError('Error obteniendo métricas de rendimiento')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Efecto para auto-refresh
  useEffect(() => {
    if (!autoRefresh || !isVisible) return

    const interval = setInterval(fetchMetrics, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, isVisible, refreshInterval, fetchMetrics])

  // Efecto inicial
  useEffect(() => {
    if (isVisible) {
      fetchMetrics()
    }
  }, [isVisible, fetchMetrics])

  // Función para limpiar cachés
  const clearCaches = useCallback(async () => {
    try {
      // Limpiar caché de Supabase
supabaseClient.forceCacheRefresh()
      
      // Refresh después de limpiar
      await fetchMetrics()
    } catch (error) {
}
  }, [fetchMetrics])

  // Función para optimizar rendimiento
  const optimizePerformance = useCallback(async () => {
    try {
// Aquí podrías implementar optimizaciones automáticas
      await fetchMetrics()
    } catch (error) {
}
  }, [fetchMetrics])

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))  } ${  sizes[i]}`;
  };

  return (
    <div className={`fixed z-50 ${className}`}>
      {/* Botón de toggle - más discreto */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`
          fixed top-4 right-4 z-50 
          p-2 rounded-full shadow-lg transition-all duration-200
          ${isVisible 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-gray-800/80 text-white hover:bg-gray-700/90'
          }
          backdrop-blur-sm border border-white/20
        `}
        title="Toggle Performance Monitor"
      >
        {isVisible ? (
          <X className="h-4 w-4" />
        ) : (
          <Activity className="h-4 w-4" />
        )}
      </button>

      {/* Panel principal - mejor posicionado y menos intrusivo */}
      {isVisible && (
        <div className="
          fixed top-16 right-4 z-40 
          bg-white/95 backdrop-blur-md 
          border border-gray-200 rounded-lg shadow-xl
          p-4 min-w-[280px] max-w-[320px]
          transition-all duration-200 ease-in-out
        ">
          {/* Header mejorado */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-800">
                Performance Monitor
              </h3>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronUp className="h-3 w-3 text-gray-500" />
              ) : (
                <ChevronDown className="h-3 w-3 text-gray-500" />
              )}
            </button>
          </div>

          {/* Métricas principales - siempre visibles */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Status:</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  error ? 'bg-red-500' : isLoading ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <span className={`font-medium ${
                  error ? 'text-red-600' : isLoading ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {error ? 'Error' : isLoading ? 'Loading' : 'Ready'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Last Update:</span>
              <span className="text-gray-800 font-mono">
                {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Detalles expandibles */}
          {isExpanded && metrics && (
            <div className="space-y-3 pt-3 border-t border-gray-200">
              {/* Métricas de memoria */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Memory
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Used:</span>
                    <span className="ml-1 font-mono text-gray-800">
                      {formatBytes(metrics.memory?.used || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Total:</span>
                    <span className="ml-1 font-mono text-gray-800">
                      {formatBytes(metrics.memory?.total || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Métricas de Supabase */}
              {metrics.supabase && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Supabase
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Pool Size:</span>
                      <span className="ml-1 font-mono text-gray-800">
                        {metrics.supabase.poolSize}/{metrics.supabase.maxPoolSize}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Queue:</span>
                      <span className="ml-1 font-mono text-gray-800">
                        {metrics.supabase.queueLength}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Métricas de caché */}
              {metrics.cache && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Cache
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Memory Hit:</span>
                      <span className="ml-1 font-mono text-gray-800">
                        {Math.round(metrics.cache.memoryHitRate * 100)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Persistent Hit:</span>
                      <span className="ml-1 font-mono text-gray-800">
                        {Math.round(metrics.cache.persistentHitRate * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={fetchMetrics}
              disabled={isLoading}
              className="
                flex-1 px-3 py-1.5 text-xs font-medium
                bg-blue-600 text-white rounded
                hover:bg-blue-700 disabled:opacity-50
                transition-colors duration-200
              "
            >
              {isLoading ? 'Updating...' : 'Refresh'}
            </button>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="
                px-3 py-1.5 text-xs font-medium
                bg-gray-100 text-gray-700 rounded
                hover:bg-gray-200 transition-colors duration-200
              "
            >
              {isExpanded ? 'Less' : 'More'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Hook para usar el monitor de rendimiento
export function usePerformanceMonitor() {
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const show = useCallback(() => setIsVisible(true), [])
  const hide = useCallback(() => setIsVisible(false), [])
  const toggle = useCallback(() => setIsVisible(prev => !prev), [])
  const expand = useCallback(() => setIsExpanded(true), [])
  const collapse = useCallback(() => setIsExpanded(false), [])
  const toggleExpanded = useCallback(() => setIsExpanded(prev => !prev), [])

  return {
    isVisible,
    isExpanded,
    show,
    hide,
    toggle,
    expand,
    collapse,
    toggleExpanded
  }
}

