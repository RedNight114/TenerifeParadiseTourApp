// =====================================================
// SCRIPT DE MIGRACIÓN COMPLETA: VERCEL BLOB → SUPABASE STORAGE
// Descarga imágenes de Vercel Blob y las sube a Supabase Storage
// =====================================================

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

console.log('🚀 INICIANDO MIGRACIÓN COMPLETA: VERCEL BLOB → SUPABASE STORAGE\n')

// Configuración
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no configuradas')
  console.error('💡 Necesitas SUPABASE_SERVICE_ROLE_KEY para subir archivos')
  process.exit(1)
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

// Configuración
const BUCKET_NAME = 'service-images'
const TEMP_DIR = './temp-images'

// Función para descargar imagen desde URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http
    
    const file = fs.createWriteStream(filepath)
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file)
        file.on('finish', () => {
          file.close()
          resolve(true)
        })
      } else if (response.statusCode === 403) {
        console.log(`  ⚠️  Acceso denegado (403) para: ${url}`)
        resolve(false)
      } else {
        console.log(`  ⚠️  Error HTTP ${response.statusCode} para: ${url}`)
        resolve(false)
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}) // Eliminar archivo parcial
      reject(err)
    })
  })
}

// Función para subir imagen a Supabase
async function uploadImageToSupabase(filePath, filename) {
  try {
    console.log(`  📤 Subiendo: ${filename}`)
    
    const fileBuffer = fs.readFileSync(filePath)
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      })
    
    if (error) throw error
    
    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename)
    
    console.log(`  ✅ Subida exitosa: ${urlData.publicUrl}`)
    return urlData.publicUrl
    
  } catch (error) {
    console.error(`  ❌ Error subiendo ${filename}: ${error.message}`)
    return null
  }
}

// Función para obtener servicios con URLs de Vercel Blob
async function getServicesWithVercelImages() {
  try {
    console.log('🔄 Obteniendo servicios con imágenes de Vercel Blob...')
    
    const { data: services, error } = await supabase
      .from('services')
      .select('id, title, images')
    
    if (error) throw error
    
    // Filtrar servicios que tienen URLs de Vercel Blob
    const servicesWithVercelImages = services.filter(service => 
      service.images && 
      Array.isArray(service.images) && 
      service.images.some(url => 
        url && 
        (url.includes('blob.vercel-storage.com') || url.includes('vercel-storage.com'))
      )
    )
    
    console.log(`✅ ${servicesWithVercelImages.length} servicios con imágenes de Vercel Blob encontrados`)
    
    return servicesWithVercelImages
    
  } catch (error) {
    console.error('❌ Error obteniendo servicios:', error.message)
    return []
  }
}

// Función para extraer nombre de archivo de URL
function extractFilenameFromUrl(url) {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const filename = pathname.split('/').pop()
    
    // Si no hay extensión, agregar .jpg por defecto
    if (!filename.includes('.')) {
      return `${filename}.jpg`
    }
    
    return filename
  } catch (error) {
    // Si la URL no es válida, generar nombre único
    return `image_${Date.now()}.jpg`
  }
}

// Función principal de migración
async function migrateVercelToSupabase() {
  try {
    // Crear directorio temporal si no existe
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true })
    }
    
    // Verificar que el bucket existe
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    
    if (bucketError) throw bucketError
    
    const bucket = buckets.find(b => b.name === BUCKET_NAME)
    
    if (!bucket) {
      console.error(`❌ El bucket '${BUCKET_NAME}' no existe`)
      console.error('💡 Ejecuta primero: node scripts/create-storage-bucket.js')
      process.exit(1)
    }
    
    console.log(`✅ Bucket '${BUCKET_NAME}' encontrado`)
    
    // Obtener servicios con imágenes de Vercel
    const services = await getServicesWithVercelImages()
    
    if (services.length === 0) {
      console.log('✅ No hay servicios con imágenes de Vercel Blob para migrar')
      return
    }
    
    let totalMigrated = 0
    let totalFailed = 0
    const migrationResults = {}
    
    console.log(`\n🔄 Iniciando migración de ${services.length} servicios...`)
    
    // Procesar cada servicio
    for (const service of services) {
      console.log(`\n📍 Procesando: ${service.title}`)
      
      const vercelImages = service.images.filter(url => 
        url && (url.includes('blob.vercel-storage.com') || url.includes('vercel-storage.com'))
      )
      
      console.log(`  🖼️  ${vercelImages.length} imágenes de Vercel encontradas`)
      
      const migratedImages = []
      
      // Migrar cada imagen
      for (const vercelUrl of vercelImages) {
        try {
          const filename = extractFilenameFromUrl(vercelUrl)
          const tempFilePath = path.join(TEMP_DIR, filename)
          
          console.log(`  📥 Descargando: ${filename}`)
          
          // Intentar descargar la imagen
          const downloadSuccess = await downloadImage(vercelUrl, tempFilePath)
          
          if (downloadSuccess && fs.existsSync(tempFilePath)) {
            // Subir a Supabase
            const supabaseUrl = await uploadImageToSupabase(tempFilePath, filename)
            
            if (supabaseUrl) {
              migratedImages.push(supabaseUrl)
              migrationResults[filename] = supabaseUrl
              
              // Limpiar archivo temporal
              fs.unlinkSync(tempFilePath)
              
              console.log(`  ✅ Migración exitosa: ${filename}`)
            } else {
              console.log(`  ❌ Error subiendo a Supabase: ${filename}`)
              totalFailed++
            }
          } else {
            console.log(`  ⚠️  No se pudo descargar: ${filename}`)
            totalFailed++
          }
          
        } catch (error) {
          console.error(`  ❌ Error procesando imagen: ${error.message}`)
          totalFailed++
        }
      }
      
      // Actualizar servicio con nuevas URLs
      if (migratedImages.length > 0) {
        try {
          const updatedImages = service.images.map(url => {
            if (url && (url.includes('blob.vercel-storage.com') || url.includes('vercel-storage.com'))) {
              // Reemplazar URL de Vercel con URL de Supabase
              const filename = extractFilenameFromUrl(url)
              return migrationResults[filename] || url
            }
            return url
          })
          
          const { error: updateError } = await supabase
            .from('services')
            .update({ 
              images: updatedImages,
              updated_at: new Date().toISOString()
            })
            .eq('id', service.id)
          
          if (updateError) {
            console.error(`  ❌ Error actualizando servicio: ${updateError.message}`)
          } else {
            console.log(`  ✅ Servicio actualizado con ${migratedImages.length} imágenes migradas`)
            totalMigrated++
          }
          
        } catch (error) {
          console.error(`  ❌ Error en actualización: ${error.message}`)
        }
      }
    }
    
    // Limpiar directorio temporal
    try {
      if (fs.existsSync(TEMP_DIR)) {
        fs.rmSync(TEMP_DIR, { recursive: true, force: true })
        console.log('\n🧹 Directorio temporal limpiado')
      }
    } catch (error) {
      console.log('\n⚠️  No se pudo limpiar el directorio temporal')
    }
    
    // Resumen final
    console.log('\n🎉 MIGRACIÓN COMPLETADA!')
    console.log(`✅ Servicios migrados: ${totalMigrated}`)
    console.log(`❌ Errores: ${totalFailed}`)
    console.log(`📊 Total procesados: ${services.length}`)
    
    if (Object.keys(migrationResults).length > 0) {
      console.log('\n📋 IMÁGENES MIGRADAS EXITOSAMENTE:')
      Object.entries(migrationResults).forEach(([filename, url]) => {
        console.log(`  ${filename}: ${url}`)
      })
    }
    
    console.log('\n💡 Las imágenes ahora están disponibles en Supabase Storage')
    
  } catch (error) {
    console.error('❌ Error en la migración:', error.message)
    process.exit(1)
  }
}

// Ejecutar migración
migrateVercelToSupabase()
