const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testImageLoading() {
  console.log('🖼️ Probando carga de imágenes de servicios...')
  
  try {
    // Obtener algunos servicios con imágenes
    const { data, error } = await supabase
      .from('services')
      .select('id, title, images')
      .not('images', 'is', null)
      .limit(5)

    if (error) {
      console.error('❌ Error al obtener servicios:', error)
      return
    }

    console.log('📋 Servicios con imágenes encontrados:')
    data.forEach((service, index) => {
      console.log(`\n${index + 1}. ${service.title}`)
      console.log(`   ID: ${service.id}`)
      console.log(`   Imágenes:`, service.images)
      
      if (service.images && service.images.length > 0) {
        const firstImage = service.images[0]
        console.log(`   Primera imagen: ${firstImage}`)
        
        // Verificar si es una URL válida
        try {
          const url = new URL(firstImage)
          console.log(`   ✅ URL válida: ${url.protocol}//${url.hostname}${url.pathname}`)
        } catch (e) {
          console.log(`   ❌ URL inválida: ${firstImage}`)
        }
      }
    })

    // Verificar específicamente el servicio de glamping
    console.log('\n🎯 Verificando servicio de Glamping...')
    const { data: glampingData, error: glampingError } = await supabase
      .from('services')
      .select('id, title, images')
      .ilike('title', '%glamping%')
      .limit(1)

    if (glampingError) {
      console.error('❌ Error al obtener glamping:', glampingError)
    } else if (glampingData && glampingData.length > 0) {
      const glamping = glampingData[0]
      console.log('🏕️ Glamping:')
      console.log(`   Título: ${glamping.title}`)
      console.log(`   ID: ${glamping.id}`)
      console.log(`   Imágenes:`, glamping.images)
      
      if (glamping.images && glamping.images.length > 0) {
        const firstImage = glamping.images[0]
        console.log(`   Primera imagen: ${firstImage}`)
        
        // Verificar si es una URL válida
        try {
          const url = new URL(firstImage)
          console.log(`   ✅ URL válida: ${url.protocol}//${url.hostname}${url.pathname}`)
          
          // Intentar acceder a la imagen
          console.log(`   🔗 Probando acceso a la imagen...`)
          const response = await fetch(firstImage, { method: 'HEAD' })
          if (response.ok) {
            console.log(`   ✅ Imagen accesible (${response.status})`)
          } else {
            console.log(`   ❌ Imagen no accesible (${response.status})`)
          }
        } catch (e) {
          console.log(`   ❌ Error al verificar imagen: ${e.message}`)
        }
      } else {
        console.log(`   ❌ No tiene imágenes`)
      }
    } else {
      console.log('❌ No se encontró ningún servicio de glamping')
    }

  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

testImageLoading() 