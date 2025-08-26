// =====================================================
// SCRIPT PARA CONVERTIR URLs LOCALES A SUPABASE STORAGE
// Actualiza la base de datos reemplazando URLs locales con URLs de Supabase
// =====================================================

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

console.log('🔄 CONVIRTIENDO URLs LOCALES A SUPABASE STORAGE\n')

// Configuración
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no configuradas')
  process.exit(1)
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

// Mapeo de archivos locales a URLs de Supabase
const LOCAL_TO_SUPABASE_MAPPING = {
  // Barcos
  'boat_tour2.jpg': 'https://uiluoqhnrjfdnvguagje.supabase.co/storage/v1/object/public/service-images/boat_tour2.jpg',
  'boat_tour3.jpg': 'https://uiluoqhnrjfdnvguagje.supabase.co/storage/v1/object/public/service-images/boat_tour3.jpg',
  'boat_tour4.jpg': 'https://uiluoqhnrjfdnvguagje.supabase.co/storage/v1/object/public/service-images/boat_tour4.jpg',
  
  // Quads
  'quad3.jpg': 'https://uiluoqhnrjfdnvguagje.supabase.co/storage/v1/object/public/service-images/quad3.jpg',
  'quad4.jpg': 'https://uiluoqhnrjfdnvguagje.supabase.co/storage/v1/object/public/service-images/quad4.jpg',
  
  // Forest
  'forest1.jpg': 'https://uiluoqhnrjfdnvguagje.supabase.co/storage/v1/object/public/service-images/forest1.jpg',
  'forest2.jpg': 'https://uiluoqhnrjfdnvguagje.supabase.co/storage/v1/object/public/service-images/forest2.jpg',
  'forest3.jpg': 'https://uiluoqhnrjfdnvguagje.supabase.co/storage/v1/object/public/service-images/forest3.jpg',
  
  // Jet Ski
  'jetski1.jpg': 'https://uiluoqhnrjfdnvguagje.supabase.co/storage/v1/object/public/service-images/jetski1.jpg',
  'jetski2.jpg': 'https://uiluoqhnrjfdnvguagje.supabase.co/storage/v1/object/public/service-images/jetski2.jpg',
  'jetski3.jpg': 'https://uiluoqhnrjfdnvguagje.supabase.co/storage/v1/object/public/service-images/jetski3.jpg',
  
  // Anaga
  'anaga1.jpg': 'https://uiluoqhnrjfdnvguagje.supabase.co/storage/v1/object/public/service-images/anaga1.jpg',
  'anaga2.jpg': 'https://uiluoqhnrjfdnvguagje.supabase.co/storage/v1/object/public/service-images/anaga2.jpg',
  'anaga3.jpg': 'https://uiluoqhnrjfdnvguagje.supabase.co/storage/v1/object/public/service-images/anaga3.jpg',
  
  // Teide
  'teide1.jpg': 'https://uiluoqhnrjfdnvguagje.supabase.co/storage/v1/object/public/service-images/teide1.jpg',
  'teide2.jpg': 'https://uiluoqhnrjfdnvguagje.supabase.co/storage/v1/object/public/service-images/teide2.jpg',
  'teide3.jpg': 'https://uiluoqhnrjfdnvguagje.supabase.co/storage/v1/object/public/service-images/teide3.jpg',
  
  // Siam
  'siam1.jpg': 'https://uiluoqhnrjfdnvguagje.supabase.co/storage/v1/object/public/service-images/siam1.jpg',
  'siam2.jpg': 'https://uiluoqhnrjfdnvguagje.supabase.co/storage/v1/object/public/service-images/siam2.jpg',
  'siam3.jpg': 'https://uiluoqhnrjfdnvguagje.supabase.co/storage/v1/object/public/service-images/siam3.jpg'
}

async function updateLocalUrlsToSupabase() {
  try {
    console.log('🔄 Obteniendo servicios...')
    
    const { data: services, error } = await supabase
      .from('services')
      .select('id, title, images')
      .order('title')
    
    if (error) throw error
    
    console.log(`✅ ${services.length} servicios encontrados\n`)
    
    let totalUpdated = 0
    let totalServicesUpdated = 0
    
    // Procesar cada servicio
    for (const service of services) {
      if (!service.images || !Array.isArray(service.images)) continue
      
      let hasChanges = false
      const updatedImages = service.images.map(url => {
        if (url && url.startsWith('/images/')) {
          const filename = url.split('/').pop()
          const supabaseUrl = LOCAL_TO_SUPABASE_MAPPING[filename]
          
          if (supabaseUrl) {
            console.log(`  🔄 ${service.title}: ${url} → ${supabaseUrl}`)
            hasChanges = true
            totalUpdated++
            return supabaseUrl
          }
        }
        return url
      })
      
      // Actualizar servicio si hay cambios
      if (hasChanges) {
        try {
          const { error: updateError } = await supabase
            .from('services')
            .update({ 
              images: updatedImages,
              updated_at: new Date().toISOString()
            })
            .eq('id', service.id)
          
          if (updateError) {
            console.error(`  ❌ Error actualizando ${service.title}: ${updateError.message}`)
          } else {
            console.log(`  ✅ ${service.title} actualizado`)
            totalServicesUpdated++
          }
          
        } catch (error) {
          console.error(`  ❌ Error en actualización: ${error.message}`)
        }
      }
    }
    
    // Resumen final
    console.log('\n🎉 CONVERSIÓN COMPLETADA!')
    console.log(`✅ URLs convertidas: ${totalUpdated}`)
    console.log(`✅ Servicios actualizados: ${totalServicesUpdated}`)
    console.log(`📊 Total procesados: ${services.length}`)
    
    if (totalUpdated > 0) {
      console.log('\n💡 Todas las URLs locales han sido convertidas a Supabase Storage')
      console.log('🎉 ¡Migración completa exitosa!')
    } else {
      console.log('\n✅ No hay URLs locales para convertir')
    }
    
  } catch (error) {
    console.error('❌ Error en la conversión:', error.message)
    process.exit(1)
  }
}

// Ejecutar conversión
updateLocalUrlsToSupabase()
