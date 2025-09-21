"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase-unified'
import { toast } from 'sonner'

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  bucketName?: string
  folderPath?: string
}

export function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 10,
  bucketName = 'service-images',
  folderPath = 'services'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    
    // Validar número máximo de imágenes
    if (images.length + fileArray.length > maxImages) {
      toast.error(`No puedes subir más de ${maxImages} imágenes`)
      return
    }

    setUploading(true)

    try {
      const supabase = await getSupabaseClient()
      const uploadPromises = fileArray.map(async (file) => {
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          throw new Error(`El archivo ${file.name} no es una imagen válida`)
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`El archivo ${file.name} es demasiado grande (máximo 5MB)`)
        }

        // Generar nombre único
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${folderPath}/${fileName}`

        // Subir archivo
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          throw error
        }

        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath)

        return publicUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      onImagesChange([...images, ...uploadedUrls])
      
      toast.success(`${uploadedUrls.length} imagen(es) subida(s) correctamente`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error subiendo imágenes')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async (imageUrl: string, index: number) => {
    try {
      // Extraer el path del archivo de la URL
      const url = new URL(imageUrl)
      const pathParts = url.pathname.split('/')
      const filePath = pathParts.slice(-2).join('/') // Obtener 'services/filename.jpg'

      const supabase = await getSupabaseClient()
      
      // Eliminar archivo del storage
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath])

      if (error) {
        toast.error('Error eliminando imagen del storage')
      }

      // Remover de la lista local
      const newImages = images.filter((_, i) => i !== index)
      onImagesChange(newImages)
      
      toast.success('Imagen eliminada correctamente')
    } catch (error) {
      toast.error('Error eliminando imagen')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    handleFileUpload(files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      handleFileUpload(files)
    }
  }

  return (
    <div className="space-y-4">
      {/* Zona de subida */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="p-6">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              {uploading ? (
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              ) : (
                <Upload className="w-6 h-6 text-gray-400" />
              )}
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {uploading ? 'Subiendo imágenes...' : 'Subir imágenes del servicio'}
            </h3>
            
            <p className="text-sm text-gray-500 mb-4">
              Arrastra y suelta imágenes aquí, o haz clic para seleccionar archivos
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || images.length >= maxImages}
                className="border-gray-300 hover:bg-gray-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Seleccionar archivos
              </Button>
              
              <div className="text-xs text-gray-500 flex items-center justify-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                Máximo {maxImages} imágenes, 5MB cada una
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={uploading || images.length >= maxImages}
            />
          </div>
        </CardContent>
      </Card>

      {/* Imágenes subidas */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Imágenes del servicio ({images.length}/{maxImages})
            </h4>
            <Badge variant="outline" className="text-xs">
              <ImageIcon className="w-3 h-3 mr-1" />
              {images.length} imagen{images.length !== 1 ? 'es' : ''}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  <img
                    src={image}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveImage(image, index)}
                >
                  <X className="w-3 h-3" />
                </Button>
                
                <div className="absolute bottom-1 left-1">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    {index + 1}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
