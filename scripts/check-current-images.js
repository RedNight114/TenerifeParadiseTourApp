// =====================================================
// SCRIPT DE VERIFICACIÓN: ESTADO ACTUAL DE IMÁGENES
// Verifica qué imágenes tenemos y cuántas necesitamos migrar
// =====================================================

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

console.log('🔍 VERIFICANDO ESTADO ACTUAL DE IMÁGENES\n')

// Verificar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Las variables de Supabase no están configuradas')
  process.exit(1)
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCurrentImages() {
  try {
    console.log('🔄 Obteniendo servicios con imágenes...')
    
    // 1. Obtener todos los servicios con imágenes
    const { data: services, error } = await supabase
      .from('services')
      .select('id, title, images, category_id, subcategory_id')
      .not('images', 'is', null)
      .order('title')
    
    if (error) {
      throw new Error(`Error obteniendo servicios: ${error.message}`)
    }
    
    console.log(`✅ Servicios encontrados: ${services.length}`)
    
    if (services.length === 0) {
      console.log('🎉 No hay servicios con imágenes')
      return
    }
    
    // 2. Analizar tipos de imágenes
    let vercelImages = 0
    let supabaseImages = 0
    let localImages = 0
    let otherImages = 0
    let totalImages = 0
    
    const imageAnalysis = []
    
    services.forEach(service => {
      if (service.images && Array.isArray(service.images)) {
        service.images.forEach((imageUrl, index) => {
          if (imageUrl && imageUrl.trim() !== '') {
            totalImages++
            
            let imageType = 'other'
            if (imageUrl.includes('vercel-storage.com')) {
              imageType = 'vercel'
              vercelImages++
            } else if (imageUrl.includes('supabase.co')) {
              imageType = 'supabase'
              supabaseImages++
            } else if (imageUrl.startsWith('/') || imageUrl.startsWith('./')) {
              imageType = 'local'
              localImages++
            } else {
              otherImages++
            }
            
            imageAnalysis.push({
              serviceId: service.id,
              serviceTitle: service.title,
              imageUrl,
              imageType,
              imageIndex: index
            })
          }
        })
      }
    })
    
    // 3. Mostrar resumen
    console.log('\n📊 RESUMEN DE IMÁGENES:')
    console.log(`   Total de servicios: ${services.length}`)
    console.log(`   Total de imágenes: ${totalImages}`)
    console.log(`   Imágenes en Vercel: ${vercelImages}`)
    console.log(`   Imágenes en Supabase: ${supabaseImages}`)
    console.log(`   Imágenes locales: ${localImages}`)
    console.log(`   Otras imágenes: ${otherImages}`)
    
    // 4. Mostrar servicios que necesitan migración
    if (vercelImages > 0) {
      console.log('\n🔄 SERVICIOS QUE NECESITAN MIGRACIÓN:')
      
      const servicesToMigrate = new Map()
      
      imageAnalysis.forEach(img => {
        if (img.imageType === 'vercel') {
          if (!servicesToMigrate.has(img.serviceId)) {
            servicesToMigrate.set(img.serviceId, {
              title: img.serviceTitle,
              vercelImages: [],
              totalImages: 0
            })
          }
          
          const service = servicesToMigrate.get(img.serviceId)
          service.vercelImages.push(img.imageUrl)
          service.totalImages = service.totalImages + 1
        }
      })
      
      servicesToMigrate.forEach((service, serviceId) => {
        console.log(`\n   📍 ${service.title}`)
        console.log(`      Total de imágenes: ${service.totalImages}`)
        console.log(`      Imágenes a migrar: ${service.vercelImages.length}`)
        console.log(`      URLs de Vercel:`)
        service.vercelImages.forEach(url => {
          console.log(`        - ${url}`)
        })
      })
      
      console.log(`\n🎯 TOTAL DE IMÁGENES A MIGRAR: ${vercelImages}`)
    } else {
      console.log('\n✅ No hay imágenes de Vercel para migrar')
    }
    
    // 5. Mostrar servicios que ya están en Supabase
    if (supabaseImages > 0) {
      console.log('\n✅ SERVICIOS YA EN SUPABASE:')
      
      const servicesInSupabase = new Map()
      
      imageAnalysis.forEach(img => {
        if (img.imageType === 'supabase') {
          if (!servicesInSupabase.has(img.serviceId)) {
            servicesInSupabase.set(img.serviceId, {
              title: img.serviceTitle,
              supabaseImages: []
            })
          }
          
          const service = servicesInSupabase.get(img.serviceId)
          service.supabaseImages.push(img.imageUrl)
        }
      })
      
      servicesInSupabase.forEach((service, serviceId) => {
        console.log(`   📍 ${service.title} (${service.supabaseImages.length} imágenes)`)
      })
    }
    
    // 6. Mostrar servicios con imágenes locales
    if (localImages > 0) {
      console.log('\n🏠 SERVICIOS CON IMÁGENES LOCALES:')
      
      const servicesWithLocal = new Map()
      
      imageAnalysis.forEach(img => {
        if (img.imageType === 'local') {
          if (!servicesWithLocal.has(img.serviceId)) {
            servicesWithLocal.set(img.serviceId, {
              title: img.serviceTitle,
              localImages: []
            })
          }
          
          const service = servicesWithLocal.get(img.serviceId)
          service.localImages.push(img.imageUrl)
        }
      })
      
      servicesWithLocal.forEach((service, serviceId) => {
        console.log(`   📍 ${service.title} (${service.localImages.length} imágenes)`)
      })
    }
    
    // 7. Recomendaciones
    console.log('\n💡 RECOMENDACIONES:')
    
    if (vercelImages > 0) {
      console.log('   🔄 Migrar imágenes de Vercel a Supabase Storage')
      console.log('   📁 Crear bucket "service-images" en Supabase')
      console.log('   🚀 Ejecutar script de migración automática')
    }
    
    if (supabaseImages > 0) {
      console.log('   ✅ Algunas imágenes ya están en Supabase')
      console.log('   🔍 Verificar que las URLs funcionen correctamente')
    }
    
    if (localImages > 0) {
      console.log('   🏠 Imágenes locales detectadas - mantener como están')
    }
    
    console.log('\n🎯 ESTADO LISTO PARA MIGRACIÓN!')
    
  } catch (error) {
    console.error('❌ Error verificando imágenes:', error.message)
    process.exit(1)
  }
}

// Ejecutar verificación
checkCurrentImages()




