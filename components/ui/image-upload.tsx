"use client"

import React, { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { X, Upload, Loader2, CheckCircle, AlertCircle, Image as ImageIcon } from "lucide-react"
import { useImageCompression } from "@/hooks/use-image-compression"
import { toast } from "@/components/ui/use-toast"
import { getSupabaseClient } from '@/lib/supabase-unified'

interface ImageUploadProps {
  onImagesUploaded: (urls: string[]) => void
  maxImages?: number
  maxSizeMB?: number
  className?: string
  disabled?: boolean
  showCompressionInfo?: boolean
  initialImages?: string[] // Agregar soporte para imágenes existentes
  onImageRemove?: (index: number) => void // Callback para eliminar imágenes
}

interface ImageFile {
  file: File
  preview: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
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
  showCompressionInfo = true,
  initialImages = [],
  onImageRemove
}: ImageUploadProps) {
  const [images, setImages] = useState<ImageFile[]>([])
  const [existingImages, setExistingImages] = useState<string[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const { compressImage } = useImageCompression()

  // Sincronizar imágenes existentes cuando cambien
  useEffect(() => {
    setExistingImages(initialImages)
  }, [initialImages])

  // Calcular el total de imágenes (existentes + nuevas)
  const totalImages = existingImages.length + images.length

  // Validar archivo
  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Solo se permiten archivos de imagen'
    }
    
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `El archivo es demasiado grande. Máximo ${maxSizeMB}MB`
    }
    
    return null
  }

  // Subir imagen a Supabase Storage
  const uploadImage = useCallback(async (imageFile: ImageFile): Promise<string> => {
    try {
      // Iniciando upload de imagen
      
      // Actualizar estado a uploading
      setImages(prev => prev.map(img => 
        img.file === imageFile.file 
          ? { ...img, status: 'uploading' as const, progress: 0 }
          : img
      ))

      let fileToUpload = imageFile.file
      let compressionInfo = {
        originalSize: imageFile.file.size,
        compressedSize: imageFile.file.size,
        compressionRatio: 1,
        iterations: 0
      }

      // Intentar comprimir la imagen
      try {
        // Comprimiendo imagen
        const compressionResult = await compressImage(fileToUpload, {
          maxSizeMB: 5,
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.85
        })

        // Resultado de compresión

        if (compressionResult.error) {
          // Error en compresión, usando archivo original
          // Continuar con el archivo original
        } else {
          fileToUpload = compressionResult.file
          compressionInfo = {
            originalSize: compressionResult.originalSize,
            compressedSize: compressionResult.compressedSize,
            compressionRatio: compressionResult.compressionRatio,
            iterations: 0
          }
          // Compresión exitosa
        }
      } catch (compressionError) {
        // Error en compresión, usando archivo original
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

      // Iniciando upload a Supabase Storage

      // Obtener cliente de Supabase
      const supabaseClient = getSupabaseClient()
      const supabase = await getSupabaseClient()
      
      if (!supabase) {
        throw new Error('No se pudo obtener el cliente de Supabase')
      }

      // Generar nombre único para el archivo
      const timestamp = Date.now()
      const fileExt = fileToUpload.name.split('.').pop() || 'jpg'
      const uniqueFilename = `services/${timestamp}-${Math.random().toString(36).substring(2)}.${fileExt}`

      // Subiendo archivo como
      
      // Simular progreso de upload
      const progressInterval = setInterval(() => {
        setImages(prev => prev.map(img => 
          img.file === imageFile.file 
            ? { ...img, progress: Math.min(img.progress + 10, 90) }
            : img
        ))
      }, 200)

      // Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('service-images') // Bucket para imágenes de servicios
        .upload(uniqueFilename, fileToUpload, {
          cacheControl: '3600',
          upsert: false,
        })

      clearInterval(progressInterval)

      if (uploadError) {
throw new Error(uploadError.message)
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('service-images')
        .getPublicUrl(uniqueFilename)

      if (!urlData?.publicUrl) {
        throw new Error('No se pudo obtener la URL pública de la imagen')
      }

      const publicUrl = urlData.publicUrl

      // Actualizar progreso al 100%
      setImages(prev => prev.map(img => 
        img.file === imageFile.file 
          ? { ...img, status: 'success' as const, progress: 100 }
          : img
      ))
return publicUrl
      
    } catch (error) {
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
      
      throw error
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
    if (totalImages + newImages.length > maxImages) {
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
          // Error handled
        }
      })
      return
    }
    
    // Agregar nuevas imágenes
    setImages(prev => [...prev, ...newImages])
    
    // Limpiar input
    event.target.value = ''
  }, [images.length, maxImages, existingImages.length])

  const handleUpload = useCallback(async () => {
    if (uploading || totalImages === 0) return
    
    const pendingImages = images.filter(img => img.status === 'pending')
    if (pendingImages.length === 0) {
      toast({
        title: "No hay imágenes para subir",
        description: "Todas las imágenes ya han sido procesadas",
        variant: "default"
      })
      return
    }
    
    setUploading(true)
    const uploadedUrls: string[] = []
    const errors: string[] = []
    
    try {
      // Subir imágenes en paralelo (máximo 3 a la vez)
      const batchSize = 3
      for (let i = 0; i < pendingImages.length; i += batchSize) {
        const batch = pendingImages.slice(i, i + batchSize)
        
        const batchPromises = batch.map(async (imageFile) => {
          try {
            const url = await uploadImage(imageFile)
            uploadedUrls.push(url)
            return { success: true, url }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            errors.push(`${imageFile.file.name}: ${errorMessage}`)
            return { success: false, error: errorMessage }
          }
        })
        
        await Promise.all(batchPromises)
      }
      
      // Mostrar resultados
      if (uploadedUrls.length > 0) {
onImagesUploaded(uploadedUrls)
        toast({
          title: "Subida completada",
          description: `${uploadedUrls.length} imagen(es) subida(s) exitosamente`,
          variant: "default"
        })
      }
      
      if (errors.length > 0) {
        toast({
          title: "Algunas imágenes fallaron",
          description: `${errors.length} error(es) durante la subida`,
          variant: "destructive"
        })
      }
      
    } catch (error) {
toast({
        title: "Error en la subida",
        description: "Error desconocido al subir la imagen. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }, [uploading, images, uploadImage, onImagesUploaded, totalImages])

  const removeImage = useCallback((imageFile: ImageFile) => {
    setImages(prev => prev.filter(img => img.file !== imageFile.file))
    
    // Limpiar preview
    try {
      URL.revokeObjectURL(imageFile.preview)
    } catch (error) {
      // Error handled
    }}, [])

  const retryUpload = useCallback(async (imageFile: ImageFile) => {
    try {
      const url = await uploadImage(imageFile)
      onImagesUploaded([url])
      toast({
        title: "Reintento exitoso",
        description: "La imagen se subió correctamente",
        variant: "default"
      })
            } catch {
          toast({
            title: "Error en reintento",
            description: "No se pudo subir la imagen. Inténtalo de nuevo.",
            variant: "destructive"
          })
        }
  }, [uploadImage, onImagesUploaded])

  // Limpiar previews al desmontar
  useEffect(() => {
    return () => {
      images.forEach(img => {
        try {
          URL.revokeObjectURL(img.preview)
        } catch (error) {
          // Error handled
        }
      })
    }
  }, [images])

  const pendingCount = images.filter(img => img.status === 'pending').length
  const uploadingCount = images.filter(img => img.status === 'uploading').length
  const successCount = images.filter(img => img.status === 'success').length
  const errorCount = images.filter(img => img.status === 'error').length

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Input de archivos */}
      <div className="space-y-2">
        <Label htmlFor="image-upload">Imágenes del servicio</Label>
        <Input
          id="image-upload"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="cursor-pointer"
        />
        <p className="text-xs text-gray-500">
          Máximo {maxImages} imágenes, {maxSizeMB}MB cada una. Formatos: JPG, PNG, GIF, WebP
        </p>
      </div>

      {/* Estadísticas */}
      {totalImages > 0 && (
        <div className="flex flex-wrap gap-2 text-sm">
          {pendingCount > 0 && (
            <Badge variant="secondary">{pendingCount} pendiente(s)</Badge>
          )}
          {uploadingCount > 0 && (
            <Badge variant="default">{uploadingCount} subiendo</Badge>
          )}
          {successCount > 0 && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              {successCount} exitosa(s)
            </Badge>
          )}
          {errorCount > 0 && (
            <Badge variant="destructive">{errorCount} error(es)</Badge>
          )}
        </div>
      )}

      {/* Grid de imágenes */}
      {totalImages > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Mostrar imágenes existentes */}
          {existingImages.map((imageUrl, index) => (
            <div key={`existing-${index}`} className="relative group">
              <div className="aspect-square relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
                <img
                  src={imageUrl}
                  alt={`Imagen existente ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Badge de imagen existente */}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                    Existente
                  </Badge>
                </div>
                
                {/* Botón eliminar */}
                {onImageRemove && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    onClick={() => onImageRemove(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {/* Mostrar imágenes nuevas */}
          {images.map((imageFile, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-0">
                {/* Preview de imagen */}
                <div className="relative aspect-square">
                  <img
                    src={imageFile.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay de estado */}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    {imageFile.status === 'pending' && (
                      <div className="text-center text-white">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">Pendiente</p>
                      </div>
                    )}
                    
                    {imageFile.status === 'uploading' && (
                      <div className="text-center text-white">
                        <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                        <p className="text-sm">Subiendo...</p>
                        <Progress value={imageFile.progress} className="w-20 mx-auto mt-2" />
                      </div>
                    )}
                    
                    {imageFile.status === 'success' && (
                      <div className="text-center text-white">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                        <p className="text-sm">Completado</p>
                      </div>
                    )}
                    
                    {imageFile.status === 'error' && (
                      <div className="text-center text-white">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
                        <p className="text-sm">Error</p>
                        <p className="text-xs text-red-200">{imageFile.error}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Botón de eliminar */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 w-6 h-6 p-0"
                    onClick={() => removeImage(imageFile)}
                    disabled={uploading}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                
                {/* Información de compresión */}
                {showCompressionInfo && imageFile.compressionRatio && imageFile.compressionRatio < 1 && (
                  <div className="p-2 bg-green-50 border-t">
                    <p className="text-xs text-green-700">
                      Comprimido: {Math.round((1 - imageFile.compressionRatio) * 100)}% más pequeño
                    </p>
                  </div>
                )}
                
                {/* Botón de reintento para errores */}
                {imageFile.status === 'error' && (
                  <div className="p-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => retryUpload(imageFile)}
                      disabled={uploading}
                    >
                      Reintentar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Botón de subida */}
      {pendingCount > 0 && (
        <Button
          onClick={handleUpload}
          disabled={disabled || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Subir {pendingCount} imagen(es)
            </>
          )}
        </Button>
      )}
    </div>
  )
} 

