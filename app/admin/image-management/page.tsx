"use client"

import React, { useState, useEffect } from 'react'
import { AdminLayoutModern } from '@/components/admin/admin-layout-modern'
import { AdminGuard } from '@/components/admin/admin-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Progress } from '@/components/ui/progress'
import { 
  Image, 
  Upload, 
  Search, 
  Eye, 
  Trash2, 
  RefreshCw, 
  Loader2,
  AlertTriangle,
  CheckCircle,
  Database,
  HardDrive,
  Grid3X3,
  List
} from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase'
import { toast } from 'sonner'

interface ImageFile {
  id: string
  name: string
  size: number
  created_at: string
  updated_at: string
  url: string
  is_used: boolean
  service_count: number
  service_info?: { serviceId: string, serviceTitle: string } | null
}

interface StorageStats {
  totalFiles: number
  totalSize: number
  orphanedFiles: number
  orphanedSize: number
}

export default function ImageManagementPage() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null)
  const [stats, setStats] = useState<StorageStats>({
    totalFiles: 0,
    totalSize: 0,
    orphanedFiles: 0,
    orphanedSize: 0
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterMode, setFilterMode] = useState<'all' | 'used' | 'orphaned'>('all')
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadImages()
  }, [])

  const loadImages = async () => {
    try {
      setLoading(true)
      const supabase = await getSupabaseClient()
      
      // Intentar obtener archivos de la carpeta services primero
      let files: any[] = []
      let filesError: any = null

      try {
        const { data: servicesFiles, error: servicesError } = await supabase.storage
          .from('service-images')
          .list('services', { limit: 1000 })
        
        if (!servicesError && servicesFiles) {
          files = servicesFiles
        } else {
          throw servicesError
        }
    } catch (error) {
        // Si falla, intentar obtener de la carpeta raíz
        const { data: rootFiles, error: rootError } = await supabase.storage
          .from('service-images')
          .list('', { limit: 1000 })
        
        if (rootError) {
          filesError = rootError
        } else {
          files = rootFiles || []
        }
      }

      if (filesError) {
        toast.error('Error al cargar imágenes del storage')
        return
      }

      // Obtener servicios para verificar uso de imágenes
      const { data: services } = await supabase
        .from('services')
        .select('id, title, images')

      // Crear un mapa de archivos utilizados con información del servicio
      const serviceImageMap = new Map<string, { serviceId: string, serviceTitle: string }>()
      services?.forEach(service => {
        if (service.images && Array.isArray(service.images)) {
          service.images.forEach((url: string) => {
            if (url) {
              // Extraer el nombre del archivo de la URL
              const fileName = url.split('/').pop()
              if (fileName) {
                serviceImageMap.set(fileName, {
                  serviceId: service.id,
                  serviceTitle: service.title
                })
              }
            }
          })
        }
      })

      // Procesar archivos
      const imageFiles: ImageFile[] = files.map(file => {
        const serviceInfo = serviceImageMap.get(file.name)
        const isUsed = !!serviceInfo
        
        // Construir la URL correcta para la imagen
        let imageUrl = ''
        if (file.name.startsWith('services/')) {
          // Si el archivo ya incluye la carpeta services
          imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/service-images/${file.name}`
        } else {
          // Si el archivo no incluye la carpeta, agregarla
          imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/service-images/services/${file.name}`
        }
        
        // Debug: mostrar las URLs generadas
        return {
          id: file.id || file.name,
          name: file.name,
          size: file.metadata?.size || 0,
          created_at: file.created_at || new Date().toISOString(),
          updated_at: file.updated_at || file.created_at || new Date().toISOString(),
          url: imageUrl,
          is_used: isUsed,
          service_count: isUsed ? 1 : 0,
          service_info: serviceInfo || null
        }
      })

      setImages(imageFiles)
      calculateStats(imageFiles)
      
    } catch (error) {
      toast.error('Error al cargar imágenes')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (imageFiles: ImageFile[]) => {
    const totalFiles = imageFiles.length
    const totalSize = imageFiles.reduce((sum, img) => sum + img.size, 0)
    const orphanedFiles = imageFiles.filter(img => !img.is_used).length
    const orphanedSize = imageFiles.filter(img => !img.is_used).reduce((sum, img) => sum + img.size, 0)

    setStats({
      totalFiles,
      totalSize,
      orphanedFiles,
      orphanedSize
    })
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    try {
      setUploading(true)
      setUploadProgress(0)
      const supabase = await getSupabaseClient()

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          toast.error(`El archivo ${file.name} no es una imagen válida`)
          continue
        }

        // Validar tamaño (máximo 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`El archivo ${file.name} es demasiado grande (máximo 10MB)`)
          continue
        }

        // Generar nombre único para el archivo
        const timestamp = Date.now()
        const randomSuffix = Math.random().toString(36).substring(2, 15)
        const fileName = `services/${timestamp}-${randomSuffix}-${file.name}`

        // Subir archivo al bucket service-images
        const { error } = await supabase.storage
          .from('service-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          toast.error(`Error al subir ${file.name}: ${error.message}`)
      } else {
          toast.success(`${file.name} subido correctamente`)
        }

        // Actualizar progreso
        setUploadProgress(((i + 1) / files.length) * 100)
      }

      // Recargar imágenes
      await loadImages()
      
    } catch (error) {
      toast.error('Error al subir archivos')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      // Limpiar el input
      event.target.value = ''
    }
  }

  // Función auxiliar para encontrar la ruta correcta del archivo
  const findCorrectFilePath = async (imageName: string): Promise<string | null> => {
    const supabase = await getSupabaseClient()
    
    // Intentar diferentes rutas posibles
    const possiblePaths = [
      imageName, // Ruta directa
      `services/${imageName}`, // En subcarpeta services
    ]

    for (const path of possiblePaths) {
      try {
        const { data, error } = await supabase.storage
          .from('service-images')
          .list(path.includes('/') ? path.split('/')[0] : '', {
            search: path.includes('/') ? path.split('/')[1] : path
          })

        if (!error && data && data.length > 0) {
          return path
      }
    } catch (error) {
        }
    }

    return null
  }

  // Función para manejar selección múltiple
  const handleSelectImage = (imageId: string) => {
    const newSelected = new Set(selectedImages)
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId)
    } else {
      newSelected.add(imageId)
    }
    setSelectedImages(newSelected)
  }

  // Función para seleccionar/deseleccionar todas las imágenes visibles
  const handleSelectAll = () => {
    if (selectedImages.size === filteredImages.length) {
      setSelectedImages(new Set())
    } else {
      setSelectedImages(new Set(filteredImages.map(img => img.id)))
    }
  }

  // Función para eliminar múltiples imágenes
  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) return

    const selectedImageObjects = images.filter(img => selectedImages.has(img.id))
    const usedImages = selectedImageObjects.filter(img => img.is_used)
    const orphanedImages = selectedImageObjects.filter(img => !img.is_used)

    let confirmMessage = `¿Estás seguro de que quieres eliminar ${selectedImages.size} imágenes?\n\n`
    
    if (usedImages.length > 0) {
      confirmMessage += `• ${usedImages.length} imagen(es) en uso (se eliminarán de los servicios)\n`
    }
    
    if (orphanedImages.length > 0) {
      confirmMessage += `• ${orphanedImages.length} imagen(es) huérfanas\n`
    }
    
    confirmMessage += `\nEsta acción no se puede deshacer.`

    if (!window.confirm(confirmMessage)) {
      return
    }

    setDeleting(true)
    let successCount = 0
    let errorCount = 0

    try {
      for (const image of selectedImageObjects) {
        try {
          await handleDeleteImage(image, false) // false = no mostrar confirmación individual
          successCount++
        } catch (error) {
          errorCount++
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} imagen(es) eliminada(s) correctamente`)
      }
      
      if (errorCount > 0) {
        toast.error(`${errorCount} imagen(es) no se pudieron eliminar`)
      }

      setSelectedImages(new Set())
      await loadImages()
      
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteImage = async (image: ImageFile, showConfirmation: boolean = true) => {
    // Confirmación de eliminación (solo si se solicita)
    if (showConfirmation) {
      const confirmMessage = image.is_used 
        ? `¿Estás seguro de que quieres eliminar "${image.name}"?\n\nEsta imagen está siendo utilizada en el servicio "${image.service_info?.serviceTitle}". Se eliminará del servicio y del almacenamiento.`
        : `¿Estás seguro de que quieres eliminar "${image.name}"?\n\nEsta imagen no está siendo utilizada y se eliminará permanentemente.`

      if (!window.confirm(confirmMessage)) {
        return
      }
    }

    try {
      const supabase = await getSupabaseClient()
      
      // Si la imagen está siendo utilizada, primero la removemos de los servicios
      if (image.is_used && image.service_info) {
        // Obtener el servicio actual
        const { data: service, error: serviceError } = await supabase
          .from('services')
          .select('images')
          .eq('id', image.service_info.serviceId)
          .single()

        if (serviceError) {
          toast.error('Error al obtener información del servicio')
          return
        }

        // Remover la imagen del array de imágenes del servicio
        const updatedImages = service.images?.filter((url: string) => {
          const fileName = url.split('/').pop()
          return fileName !== image.name
        }) || []

        // Actualizar el servicio
        const { error: updateError } = await supabase
          .from('services')
          .update({ images: updatedImages })
          .eq('id', image.service_info.serviceId)

        if (updateError) {
          toast.error('Error al actualizar el servicio')
          return
        }

        toast.success(`Imagen removida del servicio "${image.service_info.serviceTitle}"`)
      }

      // Encontrar la ruta correcta del archivo
      const correctPath = await findCorrectFilePath(image.name)
      
      if (!correctPath) {
        toast.error('No se pudo encontrar el archivo en el almacenamiento')
        return
      }

      // Eliminar el archivo del storage
      const { error } = await supabase.storage
        .from('service-images')
        .remove([correctPath])

      if (error) {
        toast.error(`Error al eliminar imagen del almacenamiento: ${error.message}`)
        return
      }

      toast.success('Imagen eliminada correctamente')
      
      // Recargar imágenes para reflejar los cambios
      await loadImages()
      
    } catch (error) {
      toast.error(`Error al eliminar imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  const filteredImages = images.filter(image => {
    const matchesSearch = image.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterMode === 'all' || 
                         (filterMode === 'used' && image.is_used) ||
                         (filterMode === 'orphaned' && !image.is_used)
    
    return matchesSearch && matchesFilter
  })

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <AdminGuard>
        <AdminLayoutModern>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Cargando imágenes...</p>
        </div>
      </div>
        </AdminLayoutModern>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <AdminLayoutModern>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Image className="w-6 h-6" />
                Gestión de Imágenes
              </h1>
              <p className="text-gray-600">Administra las imágenes del sistema y el almacenamiento</p>
            </div>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer">
                <Button variant="outline" className="relative">
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Imágenes
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                </Button>
              </label>
              <Button onClick={loadImages} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </div>
      </div>

          {/* Selección Múltiple */}
          {selectedImages.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-blue-800 font-medium">
                    {selectedImages.size} imagen(es) seleccionada(s)
                  </span>
                  <Button 
                    onClick={() => setSelectedImages(new Set())} 
                    variant="ghost" 
                    size="sm"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Cancelar selección
                  </Button>
                </div>
                <Button 
                  onClick={handleBulkDelete}
                  variant="destructive"
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar Seleccionadas
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Database className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Archivos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalFiles}</p>
                  </div>
                </div>
          </CardContent>
        </Card>

        <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <HardDrive className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Espacio Utilizado</p>
                    <p className="text-2xl font-bold text-gray-900">{formatBytes(stats.totalSize)}</p>
                  </div>
            </div>
          </CardContent>
        </Card>

        <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Archivos Huérfanos</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.orphanedFiles}</p>
                  </div>
            </div>
          </CardContent>
        </Card>

        <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Espacio Recuperable</p>
                    <p className="text-2xl font-bold text-red-600">{formatBytes(stats.orphanedSize)}</p>
                  </div>
            </div>
          </CardContent>
        </Card>
      </div>

          {/* Upload Progress */}
          {uploading && (
        <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Subiendo imágenes...</p>
                    <Progress value={uploadProgress} className="mt-2" />
                    <p className="text-xs text-gray-500 mt-1">{uploadProgress.toFixed(0)}% completado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters and Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nombre de archivo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={filterMode === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterMode('all')}
                  >
                    Todas
                  </Button>
              <Button
                    variant={filterMode === 'used' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterMode('used')}
                  >
                    En Uso
              </Button>
              <Button
                    variant={filterMode === 'orphaned' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterMode('orphaned')}
                  >
                    Huérfanas
              </Button>
            </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="text-sm"
                  >
                    {selectedImages.size === filteredImages.length ? 'Deseleccionar Todas' : 'Seleccionar Todas'}
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
              </div>
              </div>
          </CardContent>
        </Card>

          {/* Images Gallery */}
        <Card>
          <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Image className="w-5 h-5" />
                <span>Imágenes ({filteredImages.length})</span>
            </CardTitle>
          </CardHeader>
            <CardContent>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredImages.map((image) => (
                    <div key={image.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-square bg-gray-100 relative">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const placeholder = target.nextElementSibling as HTMLElement
                            if (placeholder) placeholder.style.display = 'flex'
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100" style={{ display: 'none' }}>
                          <Image className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="absolute top-2 left-2">
                          <input
                            type="checkbox"
                            checked={selectedImages.has(image.id)}
                            onChange={() => handleSelectImage(image.id)}
                            className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                        <div className="absolute top-2 right-2">
                          {image.is_used ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              En uso
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Huérfana
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm truncate" title={image.name}>
                          {image.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatBytes(image.size)}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedImage(image)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Detalles de la Imagen</DialogTitle>
                              </DialogHeader>
                              {selectedImage && (
                                <div className="space-y-4">
                                  <div className="flex justify-center">
                                    <img
                                      src={selectedImage.url}
                                      alt={selectedImage.name}
                                      className="max-w-full max-h-96 object-contain rounded-lg"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold text-gray-900">Información del Archivo</h4>
                                      <div className="space-y-1 text-sm mt-2">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Nombre:</span>
                                          <span className="font-medium">{selectedImage.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Tamaño:</span>
                                          <span className="font-medium">{formatBytes(selectedImage.size)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Estado:</span>
                                          <Badge className={selectedImage.is_used ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                            {selectedImage.is_used ? 'En uso' : 'Huérfana'}
                                          </Badge>
                                        </div>
                                        {selectedImage.service_info && (
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Servicio:</span>
                                            <span className="font-medium text-sm">{selectedImage.service_info.serviceTitle}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-gray-900">Fechas</h4>
                                      <div className="space-y-1 text-sm mt-2">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Creada:</span>
                                          <span className="font-medium">{formatDate(selectedImage.created_at)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Modificada:</span>
                                          <span className="font-medium">{formatDate(selectedImage.updated_at)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminar Imagen</AlertDialogTitle>
                                <AlertDialogDescription>
                                  ¿Estás seguro de que quieres eliminar esta imagen? Esta acción no se puede deshacer.
                                  {image.is_used && (
                                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                      <p className="text-yellow-800 text-sm">
                                        ⚠️ Esta imagen está siendo utilizada por un servicio. Eliminarla puede causar problemas.
                                      </p>
                                    </div>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteImage(image)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredImages.map((image) => (
                    <div key={image.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedImages.has(image.id)}
                          onChange={() => handleSelectImage(image.id)}
                          className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden relative">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              const placeholder = target.nextElementSibling as HTMLElement
                              if (placeholder) placeholder.style.display = 'flex'
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100" style={{ display: 'none' }}>
                            <Image className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">
                              {image.name}
                            </h3>
                            {image.is_used ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                En uso
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Huérfana
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{formatBytes(image.size)}</p>
                          <p className="text-xs text-gray-500">
                            Subida: {formatDate(image.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedImage(image)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalles de la Imagen</DialogTitle>
                            </DialogHeader>
                            {selectedImage && (
                              <div className="space-y-4">
                                <div className="flex justify-center">
                                  <img
                                    src={selectedImage.url}
                                    alt={selectedImage.name}
                                    className="max-w-full max-h-96 object-contain rounded-lg"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold text-gray-900">Información del Archivo</h4>
                                    <div className="space-y-1 text-sm mt-2">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Nombre:</span>
                                        <span className="font-medium">{selectedImage.name}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Tamaño:</span>
                                        <span className="font-medium">{formatBytes(selectedImage.size)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Estado:</span>
                                        <Badge className={selectedImage.is_used ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                          {selectedImage.is_used ? 'En uso' : 'Huérfana'}
                                        </Badge>
                                      </div>
                                      {selectedImage.service_info && (
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Servicio:</span>
                                          <span className="font-medium text-sm">{selectedImage.service_info.serviceTitle}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">Fechas</h4>
                                    <div className="space-y-1 text-sm mt-2">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Creada:</span>
                                        <span className="font-medium">{formatDate(selectedImage.created_at)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Modificada:</span>
                                        <span className="font-medium">{formatDate(selectedImage.updated_at)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminar Imagen</AlertDialogTitle>
                              <AlertDialogDescription>
                                ¿Estás seguro de que quieres eliminar esta imagen? Esta acción no se puede deshacer.
                                {image.is_used && (
                                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                    <p className="text-yellow-800 text-sm">
                                      ⚠️ Esta imagen está siendo utilizada por un servicio. Eliminarla puede causar problemas.
                                    </p>
              </div>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteImage(image)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
              </div>
            </div>
                  ))}
            </div>
              )}
          </CardContent>
        </Card>
      </div>
      </AdminLayoutModern>
    </AdminGuard>
  )
}
