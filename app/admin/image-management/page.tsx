"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/components/ui/use-toast'
import { Loader2, Trash2, RefreshCw, Database, HardDrive, AlertTriangle, CheckCircle } from 'lucide-react'
import { cleanupOrphanedImages, getImageStorageStats } from '@/lib/image-cleanup'

interface StorageStats {
  totalFiles: number
  totalSize: number
  orphanedFiles: number
  orphanedSize: number
}

export default function ImageManagementPage() {
  const [stats, setStats] = useState<StorageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [cleaning, setCleaning] = useState(false)
  const [lastCleanup, setLastCleanup] = useState<Date | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const storageStats = await getImageStorageStats()
      setStats(storageStats)
    } catch (error) {
toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas del storage",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCleanup = async () => {
    try {
      setCleaning(true)
      const result = await cleanupOrphanedImages()
      
      if (result.success) {
        toast({
          title: "Limpieza completada",
          description: result.message,
          variant: "default"
        })
        setLastCleanup(new Date())
        // Recargar estadísticas
        await loadStats()
      } else {
        toast({
          title: "Error en limpieza",
          description: result.error || "Error desconocido",
          variant: "destructive"
        })
      }
    } catch (error) {
toast({
        title: "Error",
        description: "Error inesperado durante la limpieza",
        variant: "destructive"
      })
    } finally {
      setCleaning(false)
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))  } ${  sizes[i]}`
  }

  const getOrphanedPercentage = (): number => {
    if (!stats || stats.totalFiles === 0) return 0
    return (stats.orphanedFiles / stats.totalFiles) * 100
  }

  const getStorageUsagePercentage = (): number => {
    // Asumir un límite de 1GB para el ejemplo
    const maxStorage = 1024 * 1024 * 1024 // 1GB
    return Math.min((stats?.totalSize || 0) / maxStorage * 100, 100)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Imágenes</h1>
        <p className="text-gray-600">
          Administra el almacenamiento de imágenes y limpia archivos huérfanos
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Database className="h-4 w-4" />
              Total de Archivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats?.totalFiles || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Imágenes en storage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Espacio Utilizado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatBytes(stats?.totalSize || 0)}
            </div>
            <Progress value={getStorageUsagePercentage()} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">
              {getStorageUsagePercentage().toFixed(1)}% del límite
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Archivos Huérfanos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.orphanedFiles || 0}
            </div>
            <Progress value={getOrphanedPercentage()} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">
              {getOrphanedPercentage().toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500" />
              Espacio Recuperable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatBytes(stats?.orphanedSize || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.orphanedSize ? ((stats.orphanedSize / (stats?.totalSize || 1)) * 100).toFixed(1) : 0}% del total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Acciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Limpieza de Archivos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Los archivos huérfanos son imágenes que se subieron pero no están siendo utilizadas por ningún servicio.
              Puedes eliminarlos de forma segura para liberar espacio.
            </p>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={handleCleanup}
                disabled={cleaning || (stats?.orphanedFiles || 0) === 0}
                variant="destructive"
                className="flex items-center gap-2"
              >
                {cleaning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {cleaning ? 'Limpiando...' : 'Limpiar Archivos Huérfanos'}
              </Button>
              
              <Button
                onClick={loadStats}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Actualizar
              </Button>
            </div>

            {lastCleanup && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                Última limpieza: {lastCleanup.toLocaleString()}
              </div>
            )}

            {(stats?.orphanedFiles || 0) === 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                No hay archivos huérfanos para limpiar
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Información del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Bucket de Storage:</span>
                <Badge variant="secondary">service-images</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Formato de archivos:</span>
                <Badge variant="secondary">JPG, PNG, GIF, WebP</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Compresión automática:</span>
                <Badge variant="outline" className="text-green-600">Activada</Badge>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium text-gray-900 mb-2">Recomendaciones:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ejecuta la limpieza semanalmente para mantener el storage optimizado</li>
                <li>• Las imágenes se comprimen automáticamente al subirlas</li>
                <li>• Solo se eliminan archivos que no están referenciados</li>
                <li>• El proceso es seguro y no afecta a los servicios activos</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

