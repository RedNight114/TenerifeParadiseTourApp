// =====================================================
// SCRIPT DE PRUEBA: ACCESIBILIDAD DE IMÁGENES VERCEL BLOB
// Verifica si las imágenes de Vercel Blob Storage son accesibles
// =====================================================

// Cargar variables de entorno desde .env
require('dotenv').config()

const { createClient } = require('@supabase/supabase-js')
const https = require('https')

console.log('🔍 PRUEBA DE ACCESIBILIDAD DE IMÁGENES VERCEL BLOB\n')

// Verificar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('📋 VARIABLES DE ENTORNO:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Configurado' : '❌ NO configurado')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Configurado' : '❌ NO configurado')

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ ERROR: Las variables de Supabase no están configuradas')
  process.exit(1)
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

// Función para verificar si una URL es accesible
function checkImageAccessibility(url) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({ accessible: false, error: 'Timeout después de 10 segundos' })
    }, 10000)

    const req = https.get(url, (res) => {
      clearTimeout(timeout)
      
      if (res.statusCode === 200) {
        resolve({ accessible: true, statusCode: res.statusCode, headers: res.headers })
      } else {
        resolve({ accessible: false, error: `Status code: ${res.statusCode}` })
      }
    })

    req.on('error', (error) => {
      clearTimeout(timeout)
      resolve({ accessible: false, error: error.message })
    })

    req.setTimeout(10000, () => {
      req.destroy()
      resolve({ accessible: false, error: 'Timeout en la conexión' })
    })
  })
}

async function testVercelImages() {
  try {
    console.log('🔄 Probando accesibilidad de imágenes Vercel Blob...')
    
    // 1. Obtener servicios con imágenes
    console.log('\n📊 1. Obteniendo servicios con imágenes...')
    const { data: servicesWithImages, error: servicesError } = await supabase
      .from('services')
      .select(`
        id,
        title,
        images
      `)
      .not('images', 'is', null)
      .limit(5)
    
    if (servicesError) {
      console.error('❌ Error obteniendo servicios:', servicesError)
      return false
    }
    
    console.log(`✅ Servicios encontrados: ${servicesWithImages.length}`)
    
    if (servicesWithImages.length === 0) {
      console.log('⚠️ No hay servicios con imágenes')
      return false
    }
    
    // 2. Extraer URLs de imágenes
    const allImages = servicesWithImages.flatMap(service => service.images || [])
    const validImages = allImages.filter(img => img && img.trim() !== '')
    
    console.log(`\n🖼️ 2. Total de imágenes a probar: ${validImages.length}`)
    
    if (validImages.length === 0) {
      console.log('⚠️ No hay imágenes válidas para probar')
      return false
    }
    
    // 3. Probar accesibilidad de cada imagen
    console.log('\n🌐 3. Probando accesibilidad de imágenes...')
    
    const results = []
    for (let i = 0; i < Math.min(validImages.length, 10); i++) {
      const imageUrl = validImages[i]
      console.log(`\n   Probando imagen ${i + 1}:`)
      console.log(`   URL: ${imageUrl}`)
      
      const result = await checkImageAccessibility(imageUrl)
      results.push({ url: imageUrl, ...result })
      
      if (result.accessible) {
        console.log(`   ✅ ACCESIBLE - Status: ${result.statusCode}`)
        if (result.headers['content-type']) {
          console.log(`   📋 Content-Type: ${result.headers['content-type']}`)
        }
        if (result.headers['content-length']) {
          console.log(`   📏 Tamaño: ${result.headers['content-length']} bytes`)
        }
      } else {
        console.log(`   ❌ NO ACCESIBLE - Error: ${result.error}`)
      }
      
      // Pequeña pausa entre pruebas
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    // 4. Resumen de resultados
    console.log('\n📈 4. RESUMEN DE RESULTADOS:')
    const accessibleCount = results.filter(r => r.accessible).length
    const totalTested = results.length
    
    console.log(`   Total probadas: ${totalTested}`)
    console.log(`   Accesibles: ${accessibleCount}`)
    console.log(`   No accesibles: ${totalTested - accessibleCount}`)
    console.log(`   Tasa de éxito: ${((accessibleCount / totalTested) * 100).toFixed(1)}%`)
    
    // 5. Análisis de problemas
    if (accessibleCount < totalTested) {
      console.log('\n🔍 5. ANÁLISIS DE PROBLEMAS:')
      const failedImages = results.filter(r => !r.accessible)
      
      failedImages.forEach((result, index) => {
        console.log(`\n   Problema ${index + 1}:`)
        console.log(`   URL: ${result.url}`)
        console.log(`   Error: ${result.error}`)
        
        // Sugerencias basadas en el error
        if (result.error.includes('Timeout')) {
          console.log(`   💡 Sugerencia: La imagen tarda demasiado en responder`)
        } else if (result.error.includes('Status code')) {
          console.log(`   💡 Sugerencia: Problema de permisos o imagen no encontrada`)
        } else {
          console.log(`   💡 Sugerencia: Problema de conectividad o CORS`)
        }
      })
    }
    
    return accessibleCount > 0
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error)
    return false
  }
}

async function main() {
  console.log('🚀 INICIANDO PRUEBA DE ACCESIBILIDAD DE IMÁGENES\n')
  
  try {
    const success = await testVercelImages()
    
    if (success) {
      console.log('\n🎯 PRUEBA COMPLETADA EXITOSAMENTE!')
      console.log('✅ Al menos algunas imágenes son accesibles')
      console.log('💡 Si hay problemas, revisa la configuración de Vercel Blob')
    } else {
      console.log('\n❌ PRUEBA FALLÓ')
      console.log('💡 Todas las imágenes fallaron - problema de configuración')
      console.log('🔧 Verifica:')
      console.log('   1. Permisos de Vercel Blob Storage')
      console.log('   2. Configuración de CORS')
      console.log('   3. URLs de las imágenes')
      console.log('   4. Estado del servicio Vercel')
    }
    
  } catch (error) {
    console.error('\n❌ Error en la prueba:', error)
    process.exit(1)
  }
}

// Ejecutar prueba
main()




