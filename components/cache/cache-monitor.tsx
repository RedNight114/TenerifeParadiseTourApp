"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { unifiedCache, clearAllCache, invalidateCacheByTags } from '@/lib/unified-cache-system'
import { cacheMetrics } from '@/lib/cache-metrics'
import { useCacheManagement } from '@/hooks/use-unified-cache'

interface CacheStats {
  totalEntries: number
  memoryUsage: number
  hitRate: number
  totalHits: number
  totalMisses: number
  avgResponseTime: number
  compressionRatio: number
  compressedSize: number
  originalSize: number
  evictedEntries: number
  expiredEntries: number
  lastCleanup: number
}

interface CacheMonitorProps {
  showDetails?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
  onStatsUpdate?: (stats: CacheStats) => void
}

export const CacheMonitor: React.FC<CacheMonitorProps> = ({
  showDetails = true,
  autoRefresh = true,
  refreshInterval = 5000, // 5 segundos
  onStatsUpdate,
}) => {
  const [stats, setStats] = useState(() => unifiedCache.getStats())
  const [metrics, setMetrics] = useState(() => cacheMetrics.getMetrics())
  const [alerts, setAlerts] = useState(() => cacheMetrics.getAlerts())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const { clearCache, invalidateAll } = useCacheManagement()

  // Actualizar estadísticas automáticamente
  useEffect(() => {
    if (!autoRefresh) return

    // Suscribirse a métricas en tiempo real
    const unsubscribeMetrics = cacheMetrics.subscribe((newMetrics) => {
      setMetrics(newMetrics)
    })

    const unsubscribeAlerts = cacheMetrics.subscribeToAlerts((newAlert) => {
      setAlerts(prev => [...prev.slice(-9), newAlert]) // Mantener últimas 10
    })

    const interval = setInterval(() => {
      const newStats = unifiedCache.getStats()
      setStats(newStats)
      setLastUpdate(Date.now())
      onStatsUpdate?.(newStats as any)
    }, refreshInterval)

    return () => {
      clearInterval(interval)
      unsubscribeMetrics()
      unsubscribeAlerts()
    }
  }, [autoRefresh, refreshInterval, onStatsUpdate])

  // Función para refrescar manualmente
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const newStats = unifiedCache.getStats()
      setStats(newStats)
      setLastUpdate(Date.now())
      onStatsUpdate?.(newStats as any)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Función para limpiar caché
  const handleClearCache = async () => {
    await clearCache()
    const newStats = unifiedCache.getStats()
    setStats(newStats)
    setLastUpdate(Date.now())
  }

  // Función para invalidar por tags
  const handleInvalidateByTag = async (tag: string) => {
    invalidateAll()
    const newStats = unifiedCache.getStats()
    setStats(newStats)
    setLastUpdate(Date.now())
  }

  // Calcular colores basados en métricas
  const getHitRateColor = (hitRate: number) => {
    if (hitRate >= 0.8) return 'bg-green-500'
    if (hitRate >= 0.6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getMemoryColor = (usage: number, max: number = 50) => {
    const percentage = (usage / max) * 100
    if (percentage >= 80) return 'bg-red-500'
    if (percentage >= 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <div className="space-y-4">
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold">Monitor de Caché</h3>
          <Badge variant="outline" className="text-xs">
            v2.0
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearCache}
          >
            Limpiar Todo
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Entradas totales */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Entradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats as any).totalEntries || (stats as any).size || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total en caché
            </p>
          </CardContent>
        </Card>

        {/* Uso de memoria */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Memoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((stats as any).memoryUsage || 0).toFixed(2)} MB</div>
            <div className="mt-2">
              <Progress 
                value={((stats as any).memoryUsage / 50) * 100} 
                className="h-2"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Límite: 50 MB
            </p>
          </CardContent>
        </Card>

        {/* Tasa de aciertos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hit Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(((stats as any).hitRate || 0) * 100).toFixed(1)}%
            </div>
            <div className="mt-2">
              <Progress 
                value={(stats as any).hitRate * 100} 
                className="h-2"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(stats as any).totalHits || (stats as any).hits} hits / {(stats as any).totalMisses || (stats as any).misses} misses
            </p>
          </CardContent>
        </Card>

        {/* Tiempo de respuesta */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Respuesta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((stats as any).avgResponseTime || 0).toFixed(1)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Promedio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detalles adicionales */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Detalles del Caché</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Compresión */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Compresión</span>
                <span className="text-sm text-muted-foreground">
                  {(((stats as any).compressionRatio || 0) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Original: {formatBytes((stats as any).originalSize || 0)} → 
                Comprimido: {formatBytes((stats as any).compressedSize || 0)}
              </div>
            </div>

            <Separator />

            {/* Estadísticas de limpieza */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Limpieza Automática</span>
                <span className="text-sm text-muted-foreground">
                  {formatTime((stats as any).lastCleanup || 0)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>Evadidas: {(stats as any).evictedEntries || 0}</div>
                <div>Expiradas: {(stats as any).expiredEntries || 0}</div>
              </div>
            </div>

            <Separator />

            {/* Controles de invalidación */}
            <div className="space-y-2">
              <span className="text-sm font-medium">Invalidación por Tags</span>
              <div className="flex flex-wrap gap-2">
                {['services', 'categories', 'users', 'api'].map((tag) => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    onClick={() => handleInvalidateByTag(tag)}
                    className="text-xs"
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información de última actualización */}
      <div className="text-xs text-muted-foreground text-center">
        Última actualización: {formatTime(lastUpdate)}
        {autoRefresh && ` • Auto-refresh cada ${refreshInterval / 1000}s`}
      </div>
    </div>
  )
}

// Componente compacto para mostrar en sidebar
export const CacheMonitorCompact: React.FC = () => {
  const [stats, setStats] = useState(() => unifiedCache.getStats())

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(unifiedCache.getStats())
    }, 10000) // 10 segundos

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Caché</span>
        <Badge variant="outline" className="text-xs">
          {(stats as any).totalEntries || (stats as any).size || 0}
        </Badge>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>Memoria</span>
          <span>{((stats as any).memoryUsage || 0).toFixed(1)}MB</span>
        </div>
        <Progress value={((stats as any).memoryUsage / 50) * 100} className="h-1" />
        
        <div className="flex justify-between text-xs">
          <span>Hit Rate</span>
          <span>{(((stats as any).hitRate || 0) * 100).toFixed(0)}%</span>
        </div>
        <Progress value={(stats as any).hitRate * 100} className="h-1" />
      </div>
    </div>
  )
}

export default CacheMonitor
