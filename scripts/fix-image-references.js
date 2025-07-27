require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixImageReferences() {
  console.log('🔧 Corrigiendo referencias de imágenes...')
  
  try {
    // 1. Obtener todos los servicios
    console.log('1. Obteniendo servicios...')
    const { data: services, error } = await supabase
      .from('services')
      .select('id, title, images')
    
    if (error) {
      console.error('❌ Error al obtener servicios:', error)
      return
    }
    
    console.log(`✅ ${services.length} servicios encontrados`)
    
    // 2. Lista de imágenes que realmente existen
    const existingImages = [
      'quad1.jpg', 'quad2.jpg', 'whales1.jpg', 'whales2.jpg',
      'ocean_dinner.jpg', 'ocean_dinner1.jpg', 'convertible_coast.jpg',
      'teide_sunset.jpg', 'teide_crater.jpg', 'teide_cable.jpg',
      'food_tour_market.jpg', 'food_tour1.jpg', 'quad_adventure.jpg',
      'volcanic_landscape.jpg', 'quad_group.jpg', 'convertible1.jpg',
      'bmw_interior.jpg', 'boat_tour.jpg', 'dolphins.jpg',
      'sunset_dining.jpg', 'canarian_food.jpg', 'local_tapas.jpg',
      'traditional_restaurant.jpg', 'whale_watching.jpg'
    ]
    
    console.log(`📁 Imágenes existentes: ${existingImages.length}`)
    
    // 3. Corregir servicios con imágenes que no existen
    let updatedCount = 0
    
    for (const service of services) {
      if (service.images && Array.isArray(service.images)) {
        const originalImages = [...service.images]
        const validImages = service.images.filter(img => {
          // Si es una URL completa (Vercel Blob), mantenerla
          if (img && (img.startsWith('http://') || img.startsWith('https://'))) {
            return true
          }
          // Si es un nombre de archivo local, verificar que existe
          return existingImages.includes(img)
        })
        
        // Si no hay imágenes válidas, asignar una imagen por defecto
        if (validImages.length === 0) {
          // Asignar imagen según la categoría o usar una genérica
          let defaultImage = 'teide_sunset.jpg' // Imagen por defecto
          
          if (service.title.toLowerCase().includes('quad')) {
            defaultImage = 'quad1.jpg'
          } else if (service.title.toLowerCase().includes('ballena') || service.title.toLowerCase().includes('whale')) {
            defaultImage = 'whale_watching.jpg'
          } else if (service.title.toLowerCase().includes('cena') || service.title.toLowerCase().includes('gastronom')) {
            defaultImage = 'ocean_dinner.jpg'
          } else if (service.title.toLowerCase().includes('coche') || service.title.toLowerCase().includes('convertible')) {
            defaultImage = 'convertible_coast.jpg'
          } else if (service.title.toLowerCase().includes('teide')) {
            defaultImage = 'teide_sunset.jpg'
          } else if (service.title.toLowerCase().includes('comida') || service.title.toLowerCase().includes('food')) {
            defaultImage = 'food_tour_market.jpg'
          }
          
          validImages.push(defaultImage)
        }
        
        // Si las imágenes cambiaron, actualizar en la base de datos
        if (JSON.stringify(originalImages) !== JSON.stringify(validImages)) {
          console.log(`🔄 Actualizando ${service.title}:`)
          console.log(`   Antes: ${originalImages.join(', ')}`)
          console.log(`   Después: ${validImages.join(', ')}`)
          
          const { error: updateError } = await supabase
            .from('services')
            .update({ images: validImages })
            .eq('id', service.id)
          
          if (updateError) {
            console.error(`❌ Error actualizando ${service.title}:`, updateError)
          } else {
            updatedCount++
            console.log(`✅ ${service.title} actualizado`)
          }
        }
      }
    }
    
    console.log(`\n🎉 Proceso completado:`)
    console.log(`   Servicios procesados: ${services.length}`)
    console.log(`   Servicios actualizados: ${updatedCount}`)
    
    // 4. Verificar resultado final
    console.log('\n4. Verificando resultado final...')
    const { data: finalServices, error: finalError } = await supabase
      .from('services')
      .select('id, title, images')
      .limit(5)
    
    if (finalError) {
      console.error('❌ Error al verificar resultado:', finalError)
    } else {
      console.log('📋 Muestra de servicios corregidos:')
      finalServices.forEach(service => {
        console.log(`   ${service.title}: ${service.images.join(', ')}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar la corrección
fixImageReferences() 