require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkServiceImages() {
  console.log('🔍 Verificando imágenes de servicios...')
  
  try {
    // 1. Obtener todos los servicios
    console.log('1. Obteniendo servicios de la base de datos...')
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id, title, images, featured')
      .order('created_at', { ascending: false })
    
    if (servicesError) {
      console.error('❌ Error al obtener servicios:', servicesError)
      return
    }
    
    console.log(`✅ ${services.length} servicios encontrados`)
    
    // 2. Analizar las imágenes de cada servicio
    console.log('\n2. Analizando imágenes de cada servicio:')
    let servicesWithImages = 0
    let servicesWithoutImages = 0
    let totalImages = 0
    
    services.forEach((service, index) => {
      console.log(`\n--- Servicio ${index + 1}: ${service.title} ---`)
      console.log('ID:', service.id)
      console.log('Destacado:', service.featured ? 'Sí' : 'No')
      console.log('Imágenes:', service.images)
      console.log('Tipo de imágenes:', typeof service.images)
      
      if (service.images && Array.isArray(service.images) && service.images.length > 0) {
        servicesWithImages++
        totalImages += service.images.length
        console.log('✅ Tiene imágenes:', service.images.length)
        
        service.images.forEach((img, imgIndex) => {
          console.log(`  Imagen ${imgIndex + 1}:`, img, typeof img)
        })
      } else {
        servicesWithoutImages++
        console.log('❌ No tiene imágenes')
      }
    })
    
    // 3. Estadísticas
    console.log('\n3. Estadísticas:')
    console.log(`Total de servicios: ${services.length}`)
    console.log(`Servicios con imágenes: ${servicesWithImages}`)
    console.log(`Servicios sin imágenes: ${servicesWithoutImages}`)
    console.log(`Total de imágenes: ${totalImages}`)
    
    // 4. Verificar servicios destacados específicamente
    console.log('\n4. Servicios destacados:')
    const featuredServices = services.filter(s => s.featured)
    console.log(`Servicios destacados: ${featuredServices.length}`)
    
    featuredServices.forEach((service, index) => {
      console.log(`\n--- Destacado ${index + 1}: ${service.title} ---`)
      console.log('Imágenes:', service.images)
      if (service.images && Array.isArray(service.images) && service.images.length > 0) {
        console.log('✅ Tiene imágenes')
        service.images.forEach((img, imgIndex) => {
          console.log(`  Imagen ${imgIndex + 1}:`, img)
        })
      } else {
        console.log('❌ No tiene imágenes')
      }
    })
    
    // 5. Verificar archivos en la carpeta public/images
    console.log('\n5. Verificando archivos en public/images...')
    const fs = require('fs')
    const path = require('path')
    
    try {
      const imagesDir = path.join(__dirname, '..', 'public', 'images')
      if (fs.existsSync(imagesDir)) {
        const files = fs.readdirSync(imagesDir)
        console.log(`Archivos en public/images: ${files.length}`)
        console.log('Primeros 10 archivos:', files.slice(0, 10))
      } else {
        console.log('❌ Directorio public/images no existe')
      }
    } catch (error) {
      console.log('⚠️ Error al verificar directorio de imágenes:', error.message)
    }
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar la verificación
checkServiceImages() 