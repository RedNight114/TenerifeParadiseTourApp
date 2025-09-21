"use client"

import { useEffect, useRef, useState } from "react"
import type { Service } from "@/lib/supabase"

interface SmartImagePreloaderProps {
  services: Service[]
  enabled?: boolean
  priority?: number
}

export function SmartImagePreloader({ 
  services, 
  enabled = true, 
  priority = 1 
}: SmartImagePreloaderProps) {
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set())
  const [isPreloading, setIsPreloading] = useState(false)
  const preloadQueue = useRef<string[]>([])
  const isProcessing = useRef(false)

  // ✅ OPTIMIZADO: Precargar imágenes de manera eficiente
  useEffect(() => {
    if (!enabled || services.length === 0) return

    // ✅ NUEVO: Filtrar solo imágenes válidas y únicas
    const validImages = services
      .flatMap(service => service.images || [])
      .filter(img => img && img.trim() && !preloadedImages.has(img))
      .slice(0, 20) // Limitar a 20 imágenes para evitar sobrecarga

    if (validImages.length === 0) return
// ✅ OPTIMIZADO: Procesar imágenes en lotes pequeños
    const processImageBatch = async (imageBatch: string[]) => {
      if (isProcessing.current) return
      isProcessing.current = true
      setIsPreloading(true)

      try {
        const promises = imageBatch.map((imageUrl) => {
          return new Promise<void>((resolve) => {
            const img = new Image()
            
            img.onload = () => {
              setPreloadedImages(prev => new Set([...prev, imageUrl]))
              resolve()
            }
            
            img.onerror = () => {
resolve()
            }
            
            // ✅ OPTIMIZADO: Timeout para evitar bloqueos
            setTimeout(() => resolve(), 5000)
            
            img.src = imageUrl
          })
        })

        await Promise.allSettled(promises)
      } catch (error) {
        // Error handled
      } finally {
        isProcessing.current = false
        setIsPreloading(false)
      }
    }

    // ✅ OPTIMIZADO: Procesar en lotes de 5 imágenes
    const batchSize = 5
    for (let i = 0; i < validImages.length; i += batchSize) {
      const batch = validImages.slice(i, i + batchSize)
      setTimeout(() => processImageBatch(batch), i * 100) // Espaciado de 100ms entre lotes
    }

  }, [services, enabled, preloadedImages])

  // ✅ OPTIMIZADO: Limpiar imágenes precargadas cuando cambian los servicios
  useEffect(() => {
    if (services.length === 0) {
      setPreloadedImages(new Set())
    }
  }, [services])

  // ✅ OPTIMIZADO: No renderizar nada si está deshabilitado
  if (!enabled) return null

  // ✅ OPTIMIZADO: Mostrar progreso solo en desarrollo
  if (process.env.NODE_ENV === 'development' && isPreloading) {
    return (
      <div className="fixed top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs z-50">
        🖼️ Precargando: {preloadedImages.size} imágenes
      </div>
    )
  }

  return null
}


