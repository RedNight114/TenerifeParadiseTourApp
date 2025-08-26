// =====================================================
// SCRIPT DE MIGRACIÓN: VERCEL BLOB → SUPABASE STORAGE
// Descarga imágenes de Vercel y las sube a Supabase
// =====================================================

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const https = require('https')
const fs = require('fs')
const path = require('path')

console.log('🚀 INICIANDO MIGRACIÓN DE IMÁGENES A SUPABASE STORAGE\n')

// Verificar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('📋 VARIABLES DE ENTORNO:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Configurado' : '❌ NO configurado')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurado' : '❌ NO configurado')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ NO configurado')

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ ERROR: Las variables de Supabase no están configuradas')
  console.error('💡 Necesitas configurar:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY (recomendado) o NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

// Configuración
const BUCKET_NAME = 'service-images'
const TEMP_DIR = './temp-images'
const MAX_CONCURRENT_DOWNLOADS = 3
const DOWNLOAD_TIMEOUT = 30000 // 30 segundos

// Crear directorio temporal si no existe
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true })
  console.log('📁 Directorio temporal creado:', TEMP_DIR)
}

// Función para descargar imagen
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout descargando imagen'))
    }, DOWNLOAD_TIMEOUT)

    const filePath = path.join(TEMP_DIR, filename)
    const file = fs.createWriteStream(filePath)

    const request = https.get(url, (response) => {
      clearTimeout(timeout)
      
      if (response.statusCode === 200) {
        response.pipe(file)
        
        file.on('finish', () => {
          file.close()
          resolve(filePath)
        })
        
        file.on('error', (err) => {
          fs.unlink(filePath, () => {}) // Eliminar archivo si hay error
          reject(err)
        })
      } else {
        clearTimeout(timeout)
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`))
      }
    })

    request.on('error', (err) => {
      clearTimeout(timeout)
      reject(err)
    })

    request.setTimeout(DOWNLOAD_TIMEOUT, () => {
      request.destroy()
      reject(new Error('Timeout en la conexión'))
    })
  })
}

// Función para subir imagen a Supabase
async function uploadToSupabase(filePath, filename) {
  try {
    const fileBuffer = fs.readFileSync(filePath)
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, fileBuffer, {
        contentType: 'image/jpeg', // Ajustar según el tipo de imagen
        upsert: true
      })

    if (error) {
      throw error
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename)

    return urlData.publicUrl
  } catch (error) {
    throw error
  }
}

// Función para limpiar archivo temporal
function cleanupTempFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch (error) {
    console.warn('⚠️ No se pudo eliminar archivo temporal:', filePath)
  }
}

// Función para procesar una imagen
async function processImage(vercelUrl, serviceId, imageIndex) {
  try {
    // Extraer nombre del archivo de la URL de Vercel
    const filename = vercelUrl.split('/').pop() || `image_${serviceId}_${imageIndex}.jpg`
    
    console.log(`📥 Descargando: ${filename}`)
    
    // Descargar imagen
    const tempFilePath = await downloadImage(vercelUrl, filename)
    console.log(`✅ Descargada: ${filename}`)
    
    // Subir a Supabase
    console.log(`📤 Subiendo a Supabase: ${filename}`)
    const supabaseUrl = await uploadToSupabase(tempFilePath, filename)
    console.log(`✅ Subida a Supabase: ${filename}`)
    
    // Limpiar archivo temporal
    cleanupTempFile(tempFilePath)
    
    return {
      success: true,
      oldUrl: vercelUrl,
      newUrl: supabaseUrl,
      filename
    }
  } catch (error) {
    console.error(`❌ Error procesando imagen: ${error.message}`)
    return {
      success: false,
      oldUrl: vercelUrl,
      error: error.message
    }
  }
}

// Función para procesar múltiples imágenes con límite de concurrencia
async function processImagesWithConcurrency(images, maxConcurrent) {
  const results = []
  const chunks = []
  
  // Dividir en chunks
  for (let i = 0; i < images.length; i += maxConcurrent) {
    chunks.push(images.slice(i, i + maxConcurrent))
  }
  
  // Procesar chunks secuencialmente
  for (const chunk of chunks) {
    const chunkResults = await Promise.all(chunk)
    results.push(...chunkResults)
    
    // Pequeña pausa entre chunks
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  return results
}

// Función principal de migración
async function migrateImagesToSupabase() {
  try {
    console.log('🔄 Obteniendo servicios con imágenes...')
    
    // 1. Obtener servicios con imágenes de Vercel
    const { data: services, error } = await supabase
      .from('services')
      .select('id, title, images')
      .not('images', 'is', null)
      .filter('images', 'cs', ['vercel-storage.com'])
    
    if (error) {
      throw new Error(`Error obteniendo servicios: ${error.message}`)
    }
    
    console.log(`✅ Servicios encontrados: ${services.length}`)
    
    if (services.length === 0) {
      console.log('🎉 No hay imágenes de Vercel para migrar')
      return
    }
    
    // 2. Preparar lista de imágenes para migrar
    const imagesToMigrate = []
    
    services.forEach(service => {
      if (service.images && Array.isArray(service.images)) {
        service.images.forEach((imageUrl, index) => {
          if (imageUrl && imageUrl.includes('vercel-storage.com')) {
            imagesToMigrate.push({
              vercelUrl: imageUrl,
              serviceId: service.id,
              serviceTitle: service.title,
              imageIndex: index
            })
          }
        })
      }
    })
    
    console.log(`🖼️ Total de imágenes a migrar: ${imagesToMigrate.length}`)
    
    if (imagesToMigrate.length === 0) {
      console.log('🎉 No hay imágenes de Vercel para migrar')
      return
    }
    
    // 3. Procesar imágenes
    console.log('\n🚀 Iniciando migración de imágenes...')
    
    const results = await processImagesWithConcurrency(
      imagesToMigrate.map(img => 
        processImage(img.vercelUrl, img.serviceId, img.imageIndex)
      ),
      MAX_CONCURRENT_DOWNLOADS
    )
    
    // 4. Analizar resultados
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)
    
    console.log('\n📊 RESUMEN DE MIGRACIÓN:')
    console.log(`✅ Exitosas: ${successful.length}`)
    console.log(`❌ Fallidas: ${failed.length}`)
    console.log(`📈 Tasa de éxito: ${((successful.length / results.length) * 100).toFixed(1)}%`)
    
    // 5. Mostrar errores si los hay
    if (failed.length > 0) {
      console.log('\n❌ IMÁGENES QUE FALLARON:')
      failed.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.oldUrl}`)
        console.log(`      Error: ${result.error}`)
      })
    }
    
    // 6. Actualizar URLs en la base de datos (solo las exitosas)
    if (successful.length > 0) {
      console.log('\n🔄 Actualizando URLs en la base de datos...')
      
      for (const service of services) {
        const serviceImages = service.images || []
        let updated = false
        
        for (let i = 0; i < serviceImages.length; i++) {
          const oldUrl = serviceImages[i]
          const migrationResult = successful.find(r => r.oldUrl === oldUrl)
          
          if (migrationResult) {
            serviceImages[i] = migrationResult.newUrl
            updated = true
          }
        }
        
        if (updated) {
          const { error: updateError } = await supabase
            .from('services')
            .update({ 
              images: serviceImages,
              updated_at: new Date().toISOString()
            })
            .eq('id', service.id)
          
          if (updateError) {
            console.error(`❌ Error actualizando servicio ${service.id}:`, updateError.message)
          } else {
            console.log(`✅ Servicio actualizado: ${service.title}`)
          }
        }
      }
    }
    
    console.log('\n🎉 MIGRACIÓN COMPLETADA!')
    
  } catch (error) {
    console.error('❌ Error en la migración:', error.message)
    process.exit(1)
  } finally {
    // Limpiar directorio temporal
    try {
      if (fs.existsSync(TEMP_DIR)) {
        fs.rmSync(TEMP_DIR, { recursive: true, force: true })
        console.log('🧹 Directorio temporal limpiado')
      }
    } catch (error) {
      console.warn('⚠️ No se pudo limpiar directorio temporal:', error.message)
    }
  }
}

// Función para verificar estado del bucket
async function checkBucketStatus() {
  try {
    console.log('🔍 Verificando estado del bucket...')
    
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      throw error
    }
    
    const serviceImagesBucket = buckets.find(b => b.name === BUCKET_NAME)
    
    if (!serviceImagesBucket) {
      console.log('❌ Bucket no encontrado. Crea el bucket manualmente:')
      console.log('   1. Ve a Supabase Dashboard → Storage')
      console.log('   2. Click en "New Bucket"')
      console.log('   3. Nombre: service-images')
      console.log('   4. Public: true')
      console.log('   5. File size limit: 10MB')
      return false
    }
    
    console.log('✅ Bucket encontrado:', serviceImagesBucket.name)
    console.log('📊 Tamaño:', serviceImagesBucket.file_size_limit, 'bytes')
    console.log('🔓 Público:', serviceImagesBucket.public)
    
    return true
  } catch (error) {
    console.error('❌ Error verificando bucket:', error.message)
    return false
  }
}

// Función principal
async function main() {
  try {
    // Verificar bucket
    const bucketExists = await checkBucketStatus()
    if (!bucketExists) {
      console.log('\n💡 Crea el bucket primero y luego ejecuta este script')
      return
    }
    
    // Ejecutar migración
    await migrateImagesToSupabase()
    
  } catch (error) {
    console.error('❌ Error en el script principal:', error.message)
    process.exit(1)
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main()
}

module.exports = {
  migrateImagesToSupabase,
  checkBucketStatus
}
