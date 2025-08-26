// =====================================================
// SCRIPT DE MIGRACIÓN SIMPLIFICADO
// Migra imágenes de Vercel a Supabase de forma más directa
// =====================================================

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const https = require('https')
const fs = require('fs')
const path = require('path')

console.log('🚀 INICIANDO MIGRACIÓN SIMPLIFICADA\n')

// Configuración
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const BUCKET_NAME = 'service-images'
const TEMP_DIR = './temp-images-migration'

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no configuradas')
  process.exit(1)
}

// Crear cliente y directorio temporal
const supabase = createClient(supabaseUrl, supabaseKey)
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true })
}

// Función simplificada para descargar imagen
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(TEMP_DIR, filename)
    const file = fs.createWriteStream(filePath)
    
    const request = https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file)
        file.on('finish', () => {
          file.close()
          resolve(filePath)
        })
      } else {
        reject(new Error(`HTTP ${response.statusCode}`))
      }
    })
    
    request.on('error', reject)
    request.setTimeout(30000, () => request.destroy())
  })
}

// Función simplificada para subir a Supabase
async function uploadToSupabase(filePath, filename) {
  try {
    const fileBuffer = fs.readFileSync(filePath)
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, fileBuffer, { upsert: true })
    
    if (error) throw error
    
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename)
    
    return urlData.publicUrl
  } catch (error) {
    throw error
  }
}

// Función principal de migración
async function migrateImages() {
  try {
    console.log('🔄 Obteniendo servicios...')
    
    // Obtener servicios con imágenes de Vercel
    const { data: services, error } = await supabase
      .from('services')
      .select('id, title, images')
      .not('images', 'is', null)
    
    if (error) throw error
    
    console.log(`✅ ${services.length} servicios encontrados`)
    
    let totalMigrated = 0
    let totalFailed = 0
    
    // Procesar cada servicio
    for (const service of services) {
      if (!service.images || !Array.isArray(service.images)) continue
      
      console.log(`\n📍 Procesando: ${service.title}`)
      
      const updatedImages = []
      let serviceUpdated = false
      
      // Procesar cada imagen del servicio
      for (let i = 0; i < service.images.length; i++) {
        const imageUrl = service.images[i]
        if (!imageUrl || !imageUrl.includes('vercel-storage.com')) {
          updatedImages.push(imageUrl)
          continue
        }
        
        try {
          // Extraer nombre del archivo
          const filename = imageUrl.split('/').pop() || `image_${service.id}_${i}.jpg`
          console.log(`  📥 Descargando: ${filename}`)
          
          // Descargar imagen
          const tempPath = await downloadImage(imageUrl, filename)
          console.log(`  ✅ Descargada`)
          
          // Subir a Supabase
          console.log(`  📤 Subiendo a Supabase...`)
          const newUrl = await uploadToSupabase(tempPath, filename)
          console.log(`  ✅ Subida: ${newUrl}`)
          
          // Limpiar archivo temporal
          fs.unlinkSync(tempPath)
          
          // Agregar nueva URL
          updatedImages.push(newUrl)
          serviceUpdated = true
          totalMigrated++
          
        } catch (error) {
          console.error(`  ❌ Error: ${error.message}`)
          updatedImages.push(imageUrl) // Mantener URL original
          totalFailed++
        }
      }
      
      // Actualizar servicio si se modificó
      if (serviceUpdated) {
        try {
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
            console.log(`  ✅ Servicio actualizado`)
          }
        } catch (error) {
          console.error(`  ❌ Error en actualización: ${error.message}`)
        }
      }
    }
    
    // Limpiar directorio temporal
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true })
    }
    
    // Resumen final
    console.log('\n🎉 MIGRACIÓN COMPLETADA!')
    console.log(`✅ Imágenes migradas: ${totalMigrated}`)
    console.log(`❌ Imágenes fallidas: ${totalFailed}`)
    console.log(`📊 Total procesadas: ${totalMigrated + totalFailed}`)
    
  } catch (error) {
    console.error('❌ Error en migración:', error.message)
    process.exit(1)
  }
}

// Ejecutar migración
migrateImages()




