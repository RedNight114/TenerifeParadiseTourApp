import { createClient } from '@supabase/supabase-js'

interface ImageCleanupResult {
  success: boolean
  message: string
  deletedCount?: number
  error?: string
}

/**
 * Limpia imágenes huérfanas de Supabase Storage
 * Elimina imágenes que no están referenciadas en ningún servicio
 */
export async function cleanupOrphanedImages(): Promise<ImageCleanupResult> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('Variables de entorno de Supabase no configuradas')
    }

    const supabase = createClient(url, key)

    // 1. Obtener todas las imágenes del storage
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('service-images')
      .list('', { limit: 1000 })

    if (storageError) {
      throw new Error(`Error listando archivos de storage: ${storageError.message}`)
    }

    if (!storageFiles || storageFiles.length === 0) {
      return {
        success: true,
        message: 'No hay imágenes en storage para limpiar',
        deletedCount: 0
      }
    }

    // 2. Obtener todas las URLs de imágenes de los servicios
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('images')

    if (servicesError) {
      throw new Error(`Error obteniendo servicios: ${servicesError.message}`)
    }

    // Extraer todas las URLs de imágenes de los servicios
    const serviceImageUrls = new Set<string>()
    services?.forEach(service => {
      if (service.images && Array.isArray(service.images)) {
        service.images.forEach((url: string) => {
          if (url) {
            // Extraer el nombre del archivo de la URL
            const fileName = url.split('/').pop()
            if (fileName) {
              serviceImageUrls.add(fileName)
            }
          }
        })
      }
    })

    // 3. Identificar archivos huérfanos
    const orphanedFiles = storageFiles.filter(file => {
      // Verificar si el archivo está referenciado en algún servicio
      return !serviceImageUrls.has(file.name)
    })

    if (orphanedFiles.length === 0) {
      return {
        success: true,
        message: 'No hay imágenes huérfanas para eliminar',
        deletedCount: 0
      }
    }

    // 4. Eliminar archivos huérfanos
    let deletedCount = 0
    for (const file of orphanedFiles) {
      try {
        const { error: deleteError } = await supabase.storage
          .from('service-images')
          .remove([file.name])

        if (deleteError) {
} else {
          deletedCount++
        }
      } catch (error) {
}
    }

    return {
      success: true,
      message: `Limpieza completada. ${deletedCount} imágenes huérfanas eliminadas`,
      deletedCount
    }

  } catch (error) {
return {
      success: false,
      message: 'Error durante la limpieza de imágenes',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Verifica si una imagen está siendo utilizada por algún servicio
 */
export async function isImageReferenced(imageUrl: string): Promise<boolean> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('Variables de entorno de Supabase no configuradas')
    }

    const supabase = createClient(url, key)

    // Buscar servicios que referencien esta imagen
    const { data: services, error } = await supabase
      .from('services')
      .select('id, title, images')
      .contains('images', [imageUrl])

    if (error) {
      throw new Error(`Error verificando referencia de imagen: ${error.message}`)
    }

    return services && services.length > 0
  } catch (error) {
return false
  }
}

/**
 * Obtiene estadísticas del storage de imágenes
 */
export async function getImageStorageStats(): Promise<{
  totalFiles: number
  totalSize: number
  orphanedFiles: number
  orphanedSize: number
}> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('Variables de entorno de Supabase no configuradas')
    }

    const supabase = createClient(url, key)

    // Listar todos los archivos
    const { data: files, error } = await supabase.storage
      .from('service-images')
      .list('', { limit: 1000 })

    if (error) {
      throw new Error(`Error listando archivos: ${error.message}`)
    }

    if (!files || files.length === 0) {
      return {
        totalFiles: 0,
        totalSize: 0,
        orphanedFiles: 0,
        orphanedSize: 0
      }
    }

    // Calcular tamaños totales
    const totalSize = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0)

    // Obtener servicios para identificar archivos huérfanos
    const { data: services } = await supabase
      .from('services')
      .select('images')

    const serviceImageUrls = new Set<string>()
    services?.forEach(service => {
      if (service.images && Array.isArray(service.images)) {
        service.images.forEach((url: string) => {
          if (url) {
            const fileName = url.split('/').pop()
            if (fileName) {
              serviceImageUrls.add(fileName)
            }
          }
        })
      }
    })

    // Identificar archivos huérfanos
    const orphanedFiles = files.filter(file => !serviceImageUrls.has(file.name))
    const orphanedSize = orphanedFiles.reduce((sum, file) => sum + (file.metadata?.size || 0), 0)

    return {
      totalFiles: files.length,
      totalSize,
      orphanedFiles: orphanedFiles.length,
      orphanedSize
    }

  } catch (error) {
throw error
  }
}

