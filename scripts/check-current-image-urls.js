// =====================================================
// SCRIPT PARA VERIFICAR URLs DE IMÁGENES ACTUALES
// Muestra el estado actual de las URLs en los servicios
// =====================================================

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

console.log('🔍 VERIFICANDO ESTADO ACTUAL DE URLs DE IMÁGENES\n')

// Configuración
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no configuradas')
  process.exit(1)
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCurrentImageUrls() {
  try {
    console.log('🔄 Obteniendo servicios...')
    
    const { data: services, error } = await supabase
      .from('services')
      .select('id, title, images')
      .order('title')
    
    if (error) throw error
    
    console.log(`✅ ${services.length} servicios encontrados\n`)
    
    // Estadísticas de URLs
    let totalImages = 0
    let supabaseUrls = 0
    let localUrls = 0
    let vercelUrls = 0
    let otherUrls = 0
    
    // Analizar cada servicio
    services.forEach((service, index) => {
      console.log(`${index + 1}. ${service.title}`)
      
      if (service.images && Array.isArray(service.images)) {
        console.log(`   🖼️  ${service.images.length} imagen(es):`)
        
        service.images.forEach((url, imgIndex) => {
          if (!url) {
            console.log(`     ${imgIndex + 1}. ❌ URL vacía`)
            return
          }
          
          totalImages++
          
          if (url.includes('supabase.co')) {
            console.log(`     ${imgIndex + 1}. ✅ Supabase: ${url}`)
            supabaseUrls++
          } else if (url.startsWith('/images/') || url.includes('localhost')) {
            console.log(`     ${imgIndex + 1}. 🏠 Local: ${url}`)
            localUrls++
          } else if (url.includes('vercel-storage.com') || url.includes('blob.vercel-storage.com')) {
            console.log(`     ${imgIndex + 1}. ⚠️  Vercel: ${url}`)
            vercelUrls++
          } else {
            console.log(`     ${imgIndex + 1}. ❓ Otro: ${url}`)
            otherUrls++
          }
        })
      } else {
        console.log(`   ❌ Sin imágenes`)
      }
      
      console.log('')
    })
    
    // Resumen estadístico
    console.log('📊 RESUMEN ESTADÍSTICO:')
    console.log(`  Total de servicios: ${services.length}`)
    console.log(`  Total de imágenes: ${totalImages}`)
    console.log(`  URLs de Supabase: ${supabaseUrls} (${((supabaseUrls/totalImages)*100).toFixed(1)}%)`)
    console.log(`  URLs locales: ${localUrls} (${((localUrls/totalImages)*100).toFixed(1)}%)`)
    console.log(`  URLs de Vercel: ${vercelUrls} (${((vercelUrls/totalImages)*100).toFixed(1)}%)`)
    console.log(`  Otras URLs: ${otherUrls} (${((otherUrls/totalImages)*100).toFixed(1)}%)`)
    
    // Recomendaciones
    console.log('\n💡 RECOMENDACIONES:')
    
    if (vercelUrls > 0) {
      console.log(`  ⚠️  ${vercelUrls} imágenes aún están en Vercel Blob`)
      console.log('  💡 Ejecuta: node scripts/migrate-vercel-to-supabase.js')
    }
    
    if (localUrls > 0) {
      console.log(`  🏠 ${localUrls} imágenes están en URLs locales`)
      console.log('  💡 Considera subirlas a Supabase Storage')
    }
    
    if (supabaseUrls === totalImages) {
      console.log('  ✅ Todas las imágenes están en Supabase Storage')
      console.log('  🎉 ¡Migración completa exitosa!')
    }
    
  } catch (error) {
    console.error('❌ Error verificando URLs:', error.message)
    process.exit(1)
  }
}

// Ejecutar verificación
checkCurrentImageUrls()
