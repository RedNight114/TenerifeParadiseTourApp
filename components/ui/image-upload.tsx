"use client"

import React, { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { X, Upload, Loader2, CheckCircle, AlertCircle, Image as ImageIcon, FileWarning } from "lucide-react"
import { upload } from "@vercel/blob/client"
import { useImageCompression } from "@/hooks/use-image-compression"
import { toast } from "@/components/ui/use-toast"
import { vercelBlobConfig, getBlobErrorMessage } from "@/lib/vercel-blob-config"

interface ImageUploadProps {
  onImagesUploaded: (urls: string[]) => void
  maxImages?: number
  maxSizeMB?: number
  className?: string
  disabled?: boolean
  showCompressionInfo?: boolean
}

interface ImageFile {
  file: File
  preview: string
  status: 'pending' | 'compressing' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
  url?: string
  originalSize?: number
  compressedSize?: number
  compressionRatio?: number
  iterations?: number
}

export function ImageUpload({ 
  onImagesUploaded, 
  maxImages = 10, 
  maxSizeMB = 5,
  className = "",
  disabled = false,
  showCompressionInfo = true
}: ImageUploadProps) {
  const [images, setImages] = useState<ImageFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const { compressImage, isCompressing, compressionProgress } = useImageCompression()

  // Limpiar URLs de objetos al desmontar el componente
  useEffect(() => {
    return () => {
      images.forEach(image => {
        try {
          if (image.preview) {
            URL.revokeObjectURL(image.preview)
          }
        } catch (error) {
          console.warn('Error al limpiar URL del objeto:', error)
        }
      })
    }
  }, [images])

  const validateFile = useCallback((file: File): string | null => {
    // Verificar tipo
    if (!file.type.startsWith('image/')) {
      return 'El archivo debe ser una imagen'
    }
    
    // Verificar tamaño inicial
    const sizeMB = file.size / 1024 / 1024
    if (sizeMB > 50) {
      return `La imagen es demasiado grande (${sizeMB.toFixed(2)}MB). Máximo 50MB`
    }
    
    return null
  }, [])

  const uploadImage = useCallback(async (imageFile: ImageFile): Promise<string> => {
    try {
      console.log('🚀 Iniciando upload de imagen:', imageFile.file.name)
      console.log('📊 Tamaño original:', imageFile.file.size, 'bytes')
      
      // Debug: Verificar configuración
      vercelBlobConfig.debugConfig()
      
      let fileToUpload = imageFile.file
      let compressionInfo = {
        originalSize: imageFile.file.size,
        compressedSize: imageFile.file.size,
        compressionRatio: 1,
        iterations: 0
      }
      
      // Intentar comprimir imagen
      try {
        console.log('🗜️ Iniciando compresión...')
        const compressionResult = await compressImage(imageFile.file, {
          maxSizeMB: 5,
          maxWidthOrHeight: 1920,
          quality: 0.85,
          maxIterations: 3
        })

        console.log('📊 Resultado de compresión:', {
          originalSize: compressionResult.originalSize,
          compressedSize: compressionResult.compressedSize,
          compressionRatio: compressionResult.compressionRatio,
          iterations: compressionResult.iterations,
          error: compressionResult.error
        })

        if (compressionResult.error) {
          console.warn('⚠️ Error en compresión, usando archivo original:', compressionResult.error)
          // Continuar con el archivo original
        } else {
          fileToUpload = compressionResult.file
          compressionInfo = {
            originalSize: compressionResult.originalSize,
            compressedSize: compressionResult.compressedSize,
            compressionRatio: compressionResult.compressionRatio,
            iterations: compressionResult.iterations
          }
          console.log('✅ Compresión exitosa')
        }
      } catch (compressionError) {
        console.warn('⚠️ Error en compresión, usando archivo original:', compressionError)
        // Continuar con el archivo original
      }

      // Actualizar información de compresión
      setImages(prev => prev.map(img => 
        img.file === imageFile.file 
          ? { 
              ...img, 
              originalSize: compressionInfo.originalSize,
              compressedSize: compressionInfo.compressedSize,
              compressionRatio: compressionInfo.compressionRatio,
              iterations: compressionInfo.iterations
            }
          : img
      ))

      console.log('✅ Iniciando upload...')

      // Usar API route con FormData
      const formData = new FormData()
      formData.append('file', fileToUpload, imageFile.file.name)
      
      console.log('📤 Enviando archivo:', imageFile.file.name, 'Tamaño:', fileToUpload.size)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      console.log('📊 Response status:', response.status)
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        let errorMessage = `Error HTTP: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          console.warn('No se pudo parsear error response:', e)
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      
      if (!result.url) {
        throw new Error('No se recibió URL de la imagen subida')
      }

      console.log('✅ Imagen subida exitosamente:', result.url)
      return result.url
      
    } catch (error) {
      console.error('❌ Error subiendo imagen:', error)
      
      // Actualizar estado de error
      setImages(prev => prev.map(img => 
        img.file === imageFile.file 
          ? { 
              ...img, 
              status: 'error' as const,
              error: error instanceof Error ? error.message : 'Error desconocido'
            }
          : img
      ))
      
      // Usar función de manejo de errores mejorada
      const errorMessage = getBlobErrorMessage(error)
      throw new Error(errorMessage)
    }
  }, [compressImage, maxSizeMB])

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    
    const newImages: ImageFile[] = []
    const errors: string[] = []
    
    // Validar y crear previews
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const error = validateFile(file)
      
      if (error) {
        errors.push(`${file.name}: ${error}`)
        continue
      }
      
      // Crear preview de forma segura
      let preview = ''
      try {
        preview = URL.createObjectURL(file)
      } catch (error) {
        console.error('Error al crear preview:', error)
        errors.push(`${file.name}: Error al crear preview`)
        continue
      }
      
      newImages.push({
        file,
        preview,
        status: 'pending',
        progress: 0,
        originalSize: file.size
      })
    }
    
    // Mostrar errores si los hay
    if (errors.length > 0) {
      toast({
        title: "Errores de validación",
        description: errors.join(', '),
        variant: "destructive"
      })
    }
    
    // Verificar límite de imágenes
    if (images.length + newImages.length > maxImages) {
      toast({
        title: "Límite excedido",
        description: `Máximo ${maxImages} imágenes permitidas`,
        variant: "destructive"
      })
      // Limpiar previews creados
      newImages.forEach(img => {
        try {
          URL.revokeObjectURL(img.preview)
        } catch (error) {
          console.warn('Error al limpiar preview:', error)
        }
      })
      return
    }
    
    setImages(prev => [...prev, ...newImages])
    event.target.value = ""
  }, [images.length, maxImages, validateFile])

  const processImages = useCallback(async () => {
    if (images.length === 0) return
    
    setIsProcessing(true)
    const pendingImages = images.filter(img => img.status === 'pending')
    
    try {
      for (let i = 0; i < pendingImages.length; i++) {
        const imageIndex = images.findIndex(img => img.file === pendingImages[i].file)
        if (imageIndex === -1) continue
        
        // Actualizar estado a comprimiendo
        setImages(prev => prev.map((img, idx) => 
          idx === imageIndex ? { ...img, status: 'compressing', progress: 10 } : img
        ))
        
        // Simular progreso de compresión
        await new Promise(resolve => setTimeout(resolve, 200))
        setImages(prev => prev.map((img, idx) => 
          idx === imageIndex ? { ...img, status: 'uploading', progress: 50 } : img
        ))
        
        // Subir
        console.log('📤 Iniciando subida de imagen:', pendingImages[i].file.name)
        const url = await uploadImage(pendingImages[i])
        console.log('✅ URL obtenida de uploadImage:', url)
        
        // Actualizar estado a éxito
        setImages(prev => {
          const updatedImages = prev.map((img, idx) => 
            idx === imageIndex ? { ...img, status: 'success' as const, progress: 100, url } : img
          )
          console.log('🔄 Estado actualizado para imagen:', pendingImages[i].file.name, 'URL:', url)
          return updatedImages
        })
      }
      
      // Simplificar la obtención de URLs
      const uploadedUrls: string[] = []
      
      // Usar una función para obtener el estado actual de images
      const getCurrentImages = () => {
        return new Promise<string[]>((resolve) => {
          setImages(currentImages => {
            const urls: string[] = []
            
            for (const pendingImg of pendingImages) {
              const updatedImg = currentImages.find(img => img.file === pendingImg.file)
              if (updatedImg?.url && typeof updatedImg.url === 'string' && updatedImg.url.startsWith('http')) {
                urls.push(updatedImg.url)
                console.log('✅ URL válida encontrada:', updatedImg.url)
              } else {
                console.log('❌ URL no válida para:', pendingImg.file.name, 'URL:', updatedImg?.url)
              }
            }
            
            console.log('📊 Total de URLs válidas encontradas:', urls.length)
            console.log('🛡️ URLs válidas:', urls)
            
            resolve(urls)
            return currentImages
          })
        })
      }
      
      const validUrls = await getCurrentImages()
      
      if (validUrls.length > 0) {
        console.log('📤 Notificando URLs subidas:', validUrls)
        onImagesUploaded(validUrls)
        toast({
          title: "Imágenes subidas",
          description: `${validUrls.length} imagen(es) subida(s) exitosamente`,
        })
      } else {
        console.warn('⚠️ No se encontraron URLs válidas para notificar')
        // Notificar array vacío en lugar de nada
        onImagesUploaded([])
        toast({
          title: "Advertencia",
          description: "No se pudieron procesar las imágenes correctamente",
          variant: "destructive"
        })
      }
      
    } catch (error) {
      console.error('Error procesando imágenes:', error)
      toast({
        title: "Error",
        description: `Error procesando imágenes: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }, [images, uploadImage, onImagesUploaded])

  const removeImage = useCallback((index: number) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index)
      
      // Liberar memoria del preview de forma segura
      try {
        if (prev[index] && prev[index].preview) {
          URL.revokeObjectURL(prev[index].preview)
        }
      } catch (error) {
        console.warn('Error al liberar URL del objeto:', error)
      }
      
      return newImages
    })
  }, [])

  const getStatusIcon = (status: ImageFile['status']) => {
    switch (status) {
      case 'pending':
        return <ImageIcon className="h-4 w-4 text-gray-400" />
      case 'compressing':
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusText = (status: ImageFile['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'compressing':
        return 'Comprimiendo...'
      case 'uploading':
        return 'Subiendo...'
      case 'success':
        return 'Completado'
      case 'error':
        return 'Error'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label htmlFor="image-upload" className="cursor-pointer block border-2 border-dashed rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            Haz clic para seleccionar imágenes
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Máximo {maxImages} imágenes, {maxSizeMB}MB cada una
          </p>
          {showCompressionInfo && (
            <p className="text-xs text-blue-500 mt-1">
              Las imágenes se comprimirán automáticamente si superan {maxSizeMB}MB
            </p>
          )}
        </Label>
        <Input
          id="image-upload"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || isProcessing}
          className="hidden"
        />
      </div>

      {images.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Imágenes seleccionadas ({images.length}/{maxImages})</h4>
              <Button
                onClick={processImages}
                disabled={disabled || isProcessing || images.every(img => img.status === 'success')}
                size="sm"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Procesando...
                  </>
                ) : (
                  'Procesar imágenes'
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={`${image.file.name}-${index}`} className="relative group">
                  <div className="aspect-square relative overflow-hidden rounded-lg border">
                    {image.preview && (
                      <img
                        src={image.preview}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.warn('Error al cargar imagen:', image.file.name)
                          // Fallback a un placeholder
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YWFiYiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbjwvdGV4dD48L3N2Zz4='
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Estado */}
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      {getStatusIcon(image.status)}
                      <span className="text-xs text-white bg-black/50 px-1 rounded">
                        {getStatusText(image.status)}
                      </span>
                    </div>
                    
                    {/* Progreso */}
                    {image.status === 'compressing' || image.status === 'uploading' ? (
                      <div className="absolute bottom-2 left-2 right-2">
                        <Progress value={image.progress} className="h-1" />
                      </div>
                    ) : null}
                    
                    {/* Botón eliminar */}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                      disabled={image.status === 'compressing' || image.status === 'uploading'}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {/* Información del archivo */}
                  <div className="mt-1 text-xs text-gray-500">
                    <p className="truncate">{image.file.name}</p>
                    <p>{formatFileSize(image.file.size)}</p>
                    
                    {/* Información de compresión */}
                    {showCompressionInfo && image.compressionRatio && image.compressionRatio < 1 && (
                      <div className="mt-1 text-xs text-green-600">
                        <p>Comprimido: {formatFileSize(image.compressedSize!)}</p>
                        <p>Ahorro: {((1 - image.compressionRatio) * 100).toFixed(1)}%</p>
                        {image.iterations && image.iterations > 0 && (
                          <p>Iteraciones: {image.iterations}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 