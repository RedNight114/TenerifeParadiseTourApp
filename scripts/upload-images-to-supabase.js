// =====================================================
// SCRIPT PARA SUBIR IMÁGENES A SUPABASE STORAGE
// Sube todas las imágenes locales al bucket 'service-images'
// =====================================================

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

console.log('🚀 SUBIENDO IMÁGENES A SUPABASE STORAGE\n')

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
const IMAGES_DIR = './public/images'

// Lista de imágenes a subir (prioritarias)
const PRIORITY_IMAGES = [
  'boat_tour.jpg', 'boat_tour2.jpg', 'boat_tour3.jpg', 'boat_tour4.jpg',
  'quad1.jpg', 'quad2.jpg', 'quad3.jpg', 'quad4.jpg',
  'forest1.jpg', 'forest2.jpg', 'forest3.jpg',
  'jetski1.jpg', 'jetski2.jpg', 'jetski3.jpg',
  'anaga1.jpg', 'anaga2.jpg', 'anaga3.jpg',
  'teide1.jpg', 'teide2.jpg', 'teide3.jpg',
  'siam1.jpg', 'siam2.jpg', 'siam3.jpg',
  'placeholder.jpg'
]

// Función para subir imagen a Supabase
async function uploadImageToSupabase(filePath, filename) {
  try {
    console.log(`  📤 Subiendo: ${filename}`)
    
    const fileBuffer = fs.readFileSync(filePath)
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, fileBuffer, {
        contentType: 'image/jpeg', // Ajustar según el tipo
        upsert: true // Sobrescribir si existe
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

// Función para obtener todas las imágenes disponibles
function getAllAvailableImages() {
  const images = []
  
  if (fs.existsSync(IMAGES_DIR)) {
    const files = fs.readdirSync(IMAGES_DIR)
    files.forEach(file => {
      if (file.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
        images.push(file)
      }
    })
  }
  
  return images
}

// Función principal de subida
async function uploadAllImages() {
  try {
    console.log('🔄 Verificando bucket de almacenamiento...')
    
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
    
    // Obtener imágenes disponibles
    const availableImages = getAllAvailableImages()
    console.log(`\n📁 Imágenes encontradas en /public/images/: ${availableImages.length}`)
    
    if (availableImages.length === 0) {
      console.error('❌ No se encontraron imágenes en /public/images/')
      process.exit(1)
    }
    
    // Ordenar imágenes por prioridad
    const sortedImages = [
      ...PRIORITY_IMAGES.filter(img => availableImages.includes(img)),
      ...availableImages.filter(img => !PRIORITY_IMAGES.includes(img))
    ]
    
    console.log(`\n🔄 Iniciando subida de ${sortedImages.length} imágenes...`)
    
    let totalUploaded = 0
    let totalFailed = 0
    const uploadedUrls = {}
    
    // Subir imágenes con límite de concurrencia
    const CONCURRENT_UPLOADS = 3
    const chunks = []
    
    for (let i = 0; i < sortedImages.length; i += CONCURRENT_UPLOADS) {
      chunks.push(sortedImages.slice(i, i + CONCURRENT_UPLOADS))
    }
    
    for (const chunk of chunks) {
      const uploadPromises = chunk.map(async (filename) => {
        const filePath = path.join(IMAGES_DIR, filename)
        
        if (fs.existsSync(filePath)) {
          const url = await uploadImageToSupabase(filePath, filename)
          if (url) {
            uploadedUrls[filename] = url
            totalUploaded++
          } else {
            totalFailed++
          }
        } else {
          console.error(`  ❌ Archivo no encontrado: ${filename}`)
          totalFailed++
        }
      })
      
      await Promise.all(uploadPromises)
      
      // Pequeña pausa entre chunks para no sobrecargar
      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    // Resumen final
    console.log('\n🎉 SUBIDA COMPLETADA!')
    console.log(`✅ Imágenes subidas: ${totalUploaded}`)
    console.log(`❌ Imágenes fallidas: ${totalFailed}`)
    console.log(`📊 Total procesadas: ${sortedImages.length}`)
    
    // Mostrar URLs de las imágenes subidas
    console.log('\n📋 URLs DE IMÁGENES SUBIDAS:')
    Object.entries(uploadedUrls).forEach(([filename, url]) => {
      console.log(`  ${filename}: ${url}`)
    })
    
    // Actualizar base de datos con nuevas URLs
    console.log('\n🔄 Actualizando base de datos con nuevas URLs...')
    await updateDatabaseWithNewUrls(uploadedUrls)
    
    console.log('\n🎉 ¡MIGRACIÓN COMPLETA EXITOSA!')
    console.log('💡 Las imágenes ahora están disponibles en Supabase Storage')
    
  } catch (error) {
    console.error('❌ Error en la subida:', error.message)
    process.exit(1)
  }
}

// Función para actualizar la base de datos con las nuevas URLs
async function updateDatabaseWithNewUrls(uploadedUrls) {
  try {
    console.log('  🔄 Obteniendo servicios...')
    
    const { data: services, error } = await supabase
      .from('services')
      .select('id, title, images')
    
    if (error) throw error
    
    let totalUpdated = 0
    
    for (const service of services) {
      if (!service.images || !Array.isArray(service.images)) continue
      
      const updatedImages = service.images.map(imageUrl => {
        // Si es una imagen local, convertirla a URL de Supabase
        if (imageUrl.startsWith('/images/')) {
          const filename = imageUrl.split('/').pop()
          return uploadedUrls[filename] || imageUrl
        }
        return imageUrl
      })
      
      // Solo actualizar si hay cambios
      if (JSON.stringify(updatedImages) !== JSON.stringify(service.images)) {
        try {
          const { error: updateError } = await supabase
            .from('services')
            .update({ 
              images: updatedImages,
              updated_at: new Date().toISOString()
            })
            .eq('id', service.id)
          
          if (updateError) {
            console.error(`    ❌ Error actualizando ${service.title}: ${updateError.message}`)
          } else {
            console.log(`    ✅ ${service.title} actualizado`)
            totalUpdated++
          }
        } catch (error) {
          console.error(`    ❌ Error en actualización: ${error.message}`)
        }
      }
    }
    
    console.log(`  ✅ ${totalUpdated} servicios actualizados en la base de datos`)
    
  } catch (error) {
    console.error('  ❌ Error actualizando base de datos:', error.message)
  }
}

// Ejecutar subida de imágenes
uploadAllImages()



