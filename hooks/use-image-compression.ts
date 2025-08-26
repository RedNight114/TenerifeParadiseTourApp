"use client"

import { useState, useCallback } from 'react'
import { logError, logWarn, logInfo, logDebug, logPerformance } from '@/lib/logger'

interface CompressionConfig {
  maxSizeMB: number
  quality: number
  maxWidth: number
  maxHeight: number
  format: 'webp' | 'jpeg' | 'png'
}

interface CompressionResult {
  file: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
  success: boolean
  error?: string
}

const DEFAULT_CONFIG: CompressionConfig = {
  maxSizeMB: 1,
  quality: 0.8,
  maxWidth: 1920,
  maxHeight: 1080,
  format: 'webp'
}

export function useImageCompression() {
  const [isCompressing, setIsCompressing] = useState(false)
  const [progress, setProgress] = useState(0)

  // Función para comprimir una sola imagen
  const compressImage = useCallback(async (
    file: File,
    config: Partial<CompressionConfig> = {}
  ): Promise<CompressionResult> => {
    const finalConfig = { ...DEFAULT_CONFIG, ...config }
    const startTime = performance.now()

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo no es una imagen válida')
      }

      const originalSizeMB = file.size / (1024 * 1024)
      
      // Solo log en desarrollo
      if (process.env.NODE_ENV === 'development') {
        logDebug(`Procesando imagen: ${file.name} (${originalSizeMB.toFixed(2)}MB)`)
      }

      // Si la imagen ya está en el tamaño correcto, no comprimir
      if (originalSizeMB <= finalConfig.maxSizeMB) {
        if (process.env.NODE_ENV === 'development') {
          logDebug(`Imagen ya está en el tamaño correcto: ${originalSizeMB.toFixed(2)}MB`)
        }
        return {
          file,
          originalSize: file.size,
          compressedSize: file.size,
          compressionRatio: 1,
          success: true
        }
      }

      // Crear canvas para comprimir
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('No se pudo crear el contexto del canvas')
      }

      // Cargar imagen
      const img = new Image()
      const imageUrl = URL.createObjectURL(file)
      
      try {
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject(new Error('Error cargando imagen'))
          img.src = imageUrl
        })
      } catch (error) {
        URL.revokeObjectURL(imageUrl)
        throw error
      }

      // Calcular dimensiones
      let { width, height } = img
      const aspectRatio = width / height

      if (width > finalConfig.maxWidth) {
        width = finalConfig.maxWidth
        height = width / aspectRatio
      }

      if (height > finalConfig.maxHeight) {
        height = finalConfig.maxHeight
        width = height * aspectRatio
      }

      // Configurar canvas
      canvas.width = width
      canvas.height = height

      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height)

      // Comprimir con calidad adaptativa
      let currentQuality = finalConfig.quality
      let iterations = 0
      const maxIterations = 5

      while (iterations < maxIterations) {
        iterations++
        
        const compressedBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob(
            (blob) => resolve(blob!),
            `image/${finalConfig.format}`,
            currentQuality
          )
        })

        const compressedSizeMB = compressedBlob.size / (1024 * 1024)
        
        if (process.env.NODE_ENV === 'development') {
          logDebug(`Iteración ${iterations}: ${compressedSizeMB.toFixed(2)}MB → ${finalConfig.maxSizeMB}MB (calidad: ${currentQuality})`)
        }

        if (compressedSizeMB <= finalConfig.maxSizeMB) {
          const compressionRatio = compressedSizeMB / originalSizeMB
          
          if (process.env.NODE_ENV === 'development') {
            logPerformance('Compresión exitosa', performance.now() - startTime, { 
              iterations, 
              compressionRatio: `${(compressionRatio * 100).toFixed(1)  }%` 
            })
          }

          // Crear archivo comprimido
          const compressedFile = new File([compressedBlob], file.name, {
            type: `image/${finalConfig.format}`,
            lastModified: Date.now()
          })

          return {
            file: compressedFile,
            originalSize: file.size,
            compressedSize: compressedBlob.size,
            compressionRatio,
            success: true
          }
        }

        // Reducir calidad para la siguiente iteración
        currentQuality = Math.max(0.1, currentQuality - 0.1)
      }

      // Si no se pudo comprimir lo suficiente, usar la mejor compresión posible
      const finalBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => resolve(blob!),
          `image/${finalConfig.format}`,
          0.1
        )
      })

      const finalSizeMB = finalBlob.size / (1024 * 1024)
      const finalCompressionRatio = finalSizeMB / originalSizeMB

      if (process.env.NODE_ENV === 'development') {
        logWarn(`Compresión limitada: ${finalSizeMB.toFixed(2)}MB (${(finalCompressionRatio * 100).toFixed(1)}% del original)`)
      }

      const compressedFile = new File([finalBlob], file.name, {
        type: `image/${finalConfig.format}`,
        lastModified: Date.now()
      })

      return {
        file: compressedFile,
        originalSize: file.size,
        compressedSize: finalBlob.size,
        compressionRatio: finalCompressionRatio,
        success: true
      }

    } catch (error) {
      logError('Error comprimiendo imagen', { fileName: file.name, error })
      return {
        file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 1,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }, [])

  // Función para comprimir múltiples imágenes
  const compressImages = useCallback(async (
    files: File[],
    config: Partial<CompressionConfig> = {}
  ): Promise<CompressionResult[]> => {
    if (files.length === 0) return []

    setIsCompressing(true)
    setProgress(0)

    const results: CompressionResult[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        if (process.env.NODE_ENV === 'development') {
          logDebug(`Procesando imagen ${i + 1}/${files.length}`)
        }

        const result = await compressImage(files[i], config)
        results.push(result)

        // Actualizar progreso
        const newProgress = ((i + 1) / files.length) * 100
        setProgress(newProgress)
      }

      if (process.env.NODE_ENV === 'development') {
        logInfo('Compresión completada', { 
          total: files.length, 
          successful: results.filter(r => r.success).length 
        })
      }

    } catch (error) {
      logError('Error en compresión múltiple', error)
    } finally {
      setIsCompressing(false)
      setProgress(0)
    }

    return results
  }, [compressImage])

  // Función para comprimir imagen con configuración específica
  const compressWithConfig = useCallback(async (
    file: File,
    maxSizeMB: number,
    quality: number = 0.8
  ): Promise<CompressionResult> => {
    return compressImage(file, {
      maxSizeMB,
      quality,
      format: 'webp'
    })
  }, [compressImage])

  return {
    compressImage,
    compressImages,
    compressWithConfig,
    isCompressing,
    progress,
    defaultConfig: DEFAULT_CONFIG
  }
} 