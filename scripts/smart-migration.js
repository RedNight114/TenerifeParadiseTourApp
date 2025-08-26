// =====================================================
// SCRIPT DE MIGRACIÓN INTELIGENTE
// Mapea imágenes locales existentes a servicios
// =====================================================

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

console.log('🚀 INICIANDO MIGRACIÓN INTELIGENTE CON IMÁGENES LOCALES\n')

// Configuración
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no configuradas')
  process.exit(1)
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

// Mapeo inteligente de servicios a imágenes locales
const SERVICE_IMAGE_MAPPING = {
  // Barcos y catamaranes
  'Ragnarock': ['boat_tour.jpg', 'boat_tour2.jpg', 'boat_tour3.jpg'],
  'La Pinta Barco sin licencia': ['boat_tour.jpg', 'boat_tour2.jpg', 'boat_tour3.jpg', 'boat_tour4.jpg'],
  'Santa María barco sin licencia': ['boat_tour.jpg', 'boat_tour2.jpg', 'boat_tour3.jpg', 'boat_tour4.jpg'],
  'Elody barco sin licencia': ['boat_tour.jpg', 'boat_tour2.jpg', 'boat_tour3.jpg', 'boat_tour4.jpg'],
  'idea 70 barco con licencia': ['boat_tour.jpg', 'boat_tour2.jpg', 'boat_tour3.jpg'],
  'Shogun': ['boat_tour.jpg'],
  'Blue Oceany Catamarán': ['boat_tour.jpg', 'boat_tour2.jpg'],
  'White Paradise': ['boat_tour.jpg', 'boat_tour2.jpg', 'boat_tour3.jpg'],
  'Mizendhoa': ['boat_tour.jpg', 'boat_tour2.jpg'],
  'Peter Pan': ['boat_tour.jpg'],
  'idea 53 barco sin licencia': ['boat_tour.jpg'],
  'Idea 58 barco con licencia': ['boat_tour.jpg', 'boat_tour2.jpg', 'boat_tour3.jpg'],
  'Lina Siete velero': ['boat_tour.jpg', 'boat_tour2.jpg', 'boat_tour3.jpg'],
  'Neptuno': ['boat_tour.jpg'],
  'La Niña barco sin licencia': ['boat_tour.jpg', 'boat_tour2.jpg', 'boat_tour3.jpg', 'boat_tour4.jpg'],
  'Madoudou': ['boat_tour.jpg', 'boat_tour2.jpg', 'boat_tour3.jpg'],
  'No Tocar': ['boat_tour.jpg', 'boat_tour2.jpg'],
  'Five Star Catamarán': ['boat_tour.jpg', 'boat_tour2.jpg', 'boat_tour3.jpg', 'boat_tour4.jpg'],
  'Blue Jack Sail': ['boat_tour.jpg', 'boat_tour2.jpg', 'boat_tour3.jpg'],
  'Freebird F13': ['boat_tour.jpg', 'boat_tour2.jpg'],
  'Teide Jeep Adventure': ['quad1.jpg', 'quad2.jpg', 'quad3.jpg', 'quad4.jpg'],
  'Forestal Park': ['forest1.jpg', 'forest2.jpg', 'forest3.jpg'],
  'Freebird One': ['boat_tour.jpg', 'boat_tour2.jpg', 'boat_tour3.jpg', 'boat_tour4.jpg'],
  'Jet Ski': ['jetski1.jpg', 'jetski2.jpg', 'jetski3.jpg'],
  'Freebird F24': ['boat_tour.jpg', 'boat_tour2.jpg', 'boat_tour3.jpg']
}

// Imágenes disponibles en /public/images/
const AVAILABLE_IMAGES = [
  'boat_tour.jpg', 'boat_tour2.jpg', 'boat_tour3.jpg', 'boat_tour4.jpg',
  'quad1.jpg', 'quad2.jpg', 'quad3.jpg', 'quad4.jpg',
  'forest1.jpg', 'forest2.jpg', 'forest3.jpg',
  'jetski1.jpg', 'jetski2.jpg', 'jetski3.jpg',
  'anaga1.jpg', 'anaga2.jpg', 'anaga3.jpg',
  'teide1.jpg', 'teide2.jpg', 'teide3.jpg',
  'siam1.jpg', 'siam2.jpg', 'siam3.jpg',
  'placeholder.jpg'
]

// Función para obtener imágenes disponibles para un servicio
function getImagesForService(serviceTitle) {
  // Buscar mapeo exacto
  if (SERVICE_IMAGE_MAPPING[serviceTitle]) {
    return SERVICE_IMAGE_MAPPING[serviceTitle]
  }
  
  // Mapeo inteligente por palabras clave
  const title = serviceTitle.toLowerCase()
  
  if (title.includes('barco') || title.includes('catamarán') || title.includes('velero') || title.includes('boat')) {
    return ['boat_tour.jpg', 'boat_tour2.jpg', 'boat_tour3.jpg']
  }
  
  if (title.includes('jeep') || title.includes('quad') || title.includes('4x4')) {
    return ['quad1.jpg', 'quad2.jpg', 'quad3.jpg']
  }
  
  if (title.includes('forest') || title.includes('park')) {
    return ['forest1.jpg', 'forest2.jpg', 'forest3.jpg']
  }
  
  if (title.includes('jet') || title.includes('ski')) {
    return ['jetski1.jpg', 'jetski2.jpg', 'jetski3.jpg']
  }
  
  if (title.includes('teide')) {
    return ['teide1.jpg', 'teide2.jpg', 'teide3.jpg']
  }
  
  if (title.includes('anaga')) {
    return ['anaga1.jpg', 'anaga2.jpg', 'anaga3.jpg']
  }
  
  if (title.includes('siam')) {
    return ['siam1.jpg', 'siam2.jpg', 'siam3.jpg']
  }
  
  // Imagen por defecto
  return ['placeholder.jpg']
}

// Función para convertir imagen local a URL pública
function getPublicImageUrl(imageName) {
  return `/images/${imageName}`
}

// Función principal de migración
async function migrateImages() {
  try {
    console.log('🔄 Obteniendo servicios...')
    
    // Obtener todos los servicios
    const { data: services, error } = await supabase
      .from('services')
      .select('id, title, images')
      .order('title')
    
    if (error) throw error
    
    console.log(`✅ ${services.length} servicios encontrados`)
    
    let totalUpdated = 0
    let totalSkipped = 0
    
    // Procesar cada servicio
    for (const service of services) {
      console.log(`\n📍 Procesando: ${service.title}`)
      
      // Obtener imágenes para este servicio
      const imageNames = getImagesForService(service.title)
      const imageUrls = imageNames.map(getPublicImageUrl)
      
      console.log(`  🖼️  Imágenes asignadas: ${imageNames.join(', ')}`)
      
      // Verificar si el servicio ya tiene las imágenes correctas
      const currentImages = service.images || []
      const hasLocalImages = currentImages.some(url => 
        url.startsWith('/images/') || url.includes('localhost') || url.includes('127.0.0.1')
      )
      
      if (hasLocalImages && currentImages.length > 0) {
        console.log(`  ⏭️  Ya tiene imágenes locales, saltando...`)
        totalSkipped++
        continue
      }
      
      try {
        // Actualizar servicio con nuevas imágenes
        const { error: updateError } = await supabase
          .from('services')
          .update({ 
            images: imageUrls,
            updated_at: new Date().toISOString()
          })
          .eq('id', service.id)
        
        if (updateError) {
          console.error(`  ❌ Error actualizando: ${updateError.message}`)
        } else {
          console.log(`  ✅ Servicio actualizado con ${imageUrls.length} imágenes`)
          totalUpdated++
        }
        
      } catch (error) {
        console.error(`  ❌ Error en actualización: ${error.message}`)
      }
    }
    
    // Resumen final
    console.log('\n🎉 MIGRACIÓN COMPLETADA!')
    console.log(`✅ Servicios actualizados: ${totalUpdated}`)
    console.log(`⏭️  Servicios saltados: ${totalSkipped}`)
    console.log(`📊 Total procesados: ${services.length}`)
    
    // Mostrar estadísticas de mapeo
    console.log('\n📋 ESTADÍSTICAS DE MAPEO:')
    const mappingStats = {}
    services.forEach(service => {
      const imageCount = getImagesForService(service.title).length
      mappingStats[imageCount] = (mappingStats[imageCount] || 0) + 1
    })
    
    Object.entries(mappingStats).forEach(([count, services]) => {
      console.log(`  ${count} imagen(es): ${services} servicios`)
    })
    
  } catch (error) {
    console.error('❌ Error en migración:', error.message)
    process.exit(1)
  }
}

// Ejecutar migración
migrateImages()



