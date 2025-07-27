import { useState, useCallback } from 'react'
import imageCompression from 'browser-image-compression'

interface CompressionOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  quality?: number
  fileType?: string
  useWebWorker?: boolean
  alwaysKeepResolution?: boolean
  maxIterations?: number
}

interface CompressionResult {
  file: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
  iterations: number
  error?: string
}

interface UseImageCompressionReturn {
  compressImage: (file: File, options?: CompressionOptions) => Promise<CompressionResult>
  compressMultipleImages: (files: File[], options?: CompressionOptions) => Promise<CompressionResult[]>
  isCompressing: boolean
  compressionProgress: number
}

const defaultOptions: Required<CompressionOptions> = {
  maxSizeMB: 5,
  maxWidthOrHeight: 1920,
  quality: 0.85,
  fileType: 'image/jpeg',
  useWebWorker: true,
  alwaysKeepResolution: false,
  maxIterations: 3
}

export function useImageCompression(): UseImageCompressionReturn {
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionProgress, setCompressionProgress] = useState(0)

  const compressImage = useCallback(async (
    file: File, 
    options: CompressionOptions = {}
  ): Promise<CompressionResult> => {
    const config = { ...defaultOptions, ...options }
    const originalSize = file.size
    const originalSizeMB = originalSize / 1024 / 1024

    console.log(`📸 Procesando imagen: ${file.name} (${originalSizeMB.toFixed(2)}MB)`)

    // Validar que el archivo sea una imagen
    if (!file.type.startsWith('image/')) {
      const error = `El archivo no es una imagen válida: ${file.type}`
      console.error('❌', error)
      return {
        file,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1,
        iterations: 0,
        error
      }
    }

    // Si el archivo ya es más pequeño que el máximo, no comprimir
    if (originalSizeMB <= config.maxSizeMB) {
      console.log(`✅ Imagen ya está en el tamaño correcto: ${originalSizeMB.toFixed(2)}MB`)
      return {
        file,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1,
        iterations: 0
      }
    }

    let currentFile = file
    let currentQuality = config.quality
    let iterations = 0

    try {
      while (iterations < config.maxIterations) {
        iterations++
        const currentSizeMB = currentFile.size / 1024 / 1024
        
        console.log(`🗜️ Iteración ${iterations}: ${currentSizeMB.toFixed(2)}MB → ${config.maxSizeMB}MB (calidad: ${currentQuality})`)
        
        const compressed = await imageCompression(currentFile, {
          maxSizeMB: config.maxSizeMB,
          maxWidthOrHeight: config.maxWidthOrHeight,
          useWebWorker: config.useWebWorker,
          fileType: config.fileType as any,
          alwaysKeepResolution: config.alwaysKeepResolution
        })

        const compressedSize = compressed.size
        const compressedSizeMB = compressedSize / 1024 / 1024
        const compressionRatio = compressedSize / originalSize

        console.log(`📊 Resultado iteración ${iterations}: ${compressedSizeMB.toFixed(2)}MB (${(compressionRatio * 100).toFixed(1)}% del original)`)

        // Si alcanzamos el tamaño objetivo, terminar
        if (compressedSizeMB <= config.maxSizeMB) {
          console.log(`✅ Compresión exitosa en ${iterations} iteraciones: ${compressedSizeMB.toFixed(2)}MB`)
          return {
            file: compressed,
            originalSize,
            compressedSize,
            compressionRatio,
            iterations
          }
        }

        // Si no alcanzamos el tamaño, reducir calidad y continuar
        currentFile = compressed
        currentQuality = Math.max(0.1, currentQuality * 0.8) // Reducir calidad gradualmente
      }

      // Si llegamos aquí, usar el último resultado
      const finalSizeMB = currentFile.size / 1024 / 1024
      const finalCompressionRatio = currentFile.size / originalSize
      
      console.log(`⚠️ Compresión limitada: ${finalSizeMB.toFixed(2)}MB (${(finalCompressionRatio * 100).toFixed(1)}% del original)`)
      
      return {
        file: currentFile,
        originalSize,
        compressedSize: currentFile.size,
        compressionRatio: finalCompressionRatio,
        iterations
      }

    } catch (error) {
      console.error('❌ Error comprimiendo imagen:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido en compresión'
      return {
        file,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1,
        iterations: 0,
        error: errorMessage
      }
    }
  }, [])

  const compressMultipleImages = useCallback(async (
    files: File[], 
    options: CompressionOptions = {}
  ): Promise<CompressionResult[]> => {
    setIsCompressing(true)
    setCompressionProgress(0)

    try {
      const results: CompressionResult[] = []
      
      for (let i = 0; i < files.length; i++) {
        console.log(`🔄 Procesando imagen ${i + 1}/${files.length}`)
        const result = await compressImage(files[i], options)
        results.push(result)
        
        // Actualizar progreso
        const progress = ((i + 1) / files.length) * 100
        setCompressionProgress(progress)
      }

      console.log(`✅ Compresión completada: ${results.length} imágenes procesadas`)
      return results
    } finally {
      setIsCompressing(false)
      setCompressionProgress(0)
    }
  }, [compressImage])

  return {
    compressImage,
    compressMultipleImages,
    isCompressing,
    compressionProgress
  }
} 