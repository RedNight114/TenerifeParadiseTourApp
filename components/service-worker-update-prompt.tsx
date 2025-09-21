"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useServiceWorkerUpdate } from '@/hooks/use-service-worker'
import { RefreshCw, X, Download } from 'lucide-react'

export function ServiceWorkerUpdatePrompt() {
  const { showUpdatePrompt, handleUpdate, dismissUpdate } = useServiceWorkerUpdate()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdateClick = async () => {
    setIsUpdating(true)
    try {
      await handleUpdate()
    } catch (error) {
      setIsUpdating(false)
    }
  }

  if (!showUpdatePrompt) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Actualización Disponible</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissUpdate}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <CardDescription className="mb-4">
            Hay una nueva versión de la aplicación disponible. 
            Actualiza para obtener las últimas mejoras y correcciones.
          </CardDescription>
          
          <div className="flex gap-2">
            <Button
              onClick={handleUpdateClick}
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Actualizar Ahora
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={dismissUpdate}
              disabled={isUpdating}
            >
              Más Tarde
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente para mostrar estado del Service Worker (solo en desarrollo)
export function ServiceWorkerStatus() {
  // TODO: Implementar useServiceWorker hook
  const isSupported = true
  const isInstalled = false
  const isOnline = true
  const cacheSize = 0
  const error = null

  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div className="fixed top-4 left-4 z-50 bg-background/95 backdrop-blur-sm border rounded-lg p-3 text-xs">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isSupported ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>SW: {isSupported ? 'Soportado' : 'No soportado'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isInstalled ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span>Instalado: {isInstalled ? 'Sí' : 'No'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>Conexión: {isOnline ? 'Online' : 'Offline'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Caché: {cacheSize} elementos</span>
        </div>
        
        {error && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-red-500">Error: {error}</span>
          </div>
        )}
      </div>
    </div>
  )
}


