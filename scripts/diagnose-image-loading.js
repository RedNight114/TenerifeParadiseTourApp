// =====================================================
// SCRIPT DE DIAGNÓSTICO: CARGA DE IMÁGENES EN TARJETAS
// Verifica por qué las imágenes no se están mostrando
// =====================================================

// Cargar variables de entorno desde .env
require('dotenv').config()

const { createClient } = require('@supabase/supabase-js')

console.log('🔍 DIAGNÓSTICO DE CARGA DE IMÁGENES EN TARJETAS\n')

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

async function diagnoseImageLoading() {
  try {
    console.log('\n🔄 Diagnosticando carga de imágenes...')
    
    // 1. Verificar servicios con imágenes
    console.log('\n📊 1. Verificando servicios con imágenes...')
    const { data: servicesWithImages, error: servicesError } = await supabase
      .from('services')
      .select(`
        id,
        title,
        images,
        available,
        featured
      `)
      .not('images', 'is', null)
      .limit(10)
    
    if (servicesError) {
      console.error('❌ Error obteniendo servicios:', servicesError)
      return false
    }
    
    console.log(`✅ Servicios con imágenes encontrados: ${servicesWithImages.length}`)
    
    if (servicesWithImages.length === 0) {
      console.log('⚠️ No hay servicios con imágenes en la base de datos')
      return false
    }
    
    // 2. Analizar estructura de imágenes
    console.log('\n🖼️ 2. Analizando estructura de imágenes...')
    servicesWithImages.forEach((service, index) => {
      console.log(`\n   Servicio ${index + 1}: ${service.title}`)
      console.log(`   - ID: ${service.id}`)
      console.log(`   - Disponible: ${service.available}`)
      console.log(`   - Destacado: ${service.featured}`)
      console.log(`   - Imágenes: ${service.images ? service.images.length : 0}`)
      
      if (service.images && service.images.length > 0) {
        service.images.forEach((img, imgIndex) => {
          console.log(`     Imagen ${imgIndex + 1}: ${img}`)
        })
      }
    })
    
    // 3. Verificar URLs de imágenes
    console.log('\n🔗 3. Verificando URLs de imágenes...')
    const allImages = servicesWithImages.flatMap(service => service.images || [])
    const validImages = allImages.filter(img => img && img.trim() !== '')
    
    console.log(`   Total de imágenes: ${allImages.length}`)
    console.log(`   Imágenes válidas: ${validImages.length}`)
    
    if (validImages.length > 0) {
      console.log('\n   Ejemplos de URLs válidas:')
      validImages.slice(0, 5).forEach((img, index) => {
        console.log(`     ${index + 1}. ${img}`)
      })
    }
    
    // 4. Verificar accesibilidad de imágenes
    console.log('\n🌐 4. Verificando accesibilidad de imágenes...')
    const sampleImages = validImages.slice(0, 3)
    
    for (let i = 0; i < sampleImages.length; i++) {
      const imageUrl = sampleImages[i]
      console.log(`\n   Probando imagen ${i + 1}: ${imageUrl}`)
      
      try {
        // Crear imagen para probar carga
        const img = new Image()
        
        const loadPromise = new Promise((resolve) => {
          const timeout = setTimeout(() => {
            resolve({ success: false, error: 'Timeout después de 10 segundos' })
          }, 10000)
          
          img.onload = () => {
            clearTimeout(timeout)
            resolve({ success: true, width: img.width, height: img.height })
          }
          
          img.onerror = () => {
            clearTimeout(timeout)
            resolve({ success: false, error: 'Error de carga' })
          }
        })
        
        img.src = imageUrl
        const result = await loadPromise
        
        if (result.success) {
          console.log(`     ✅ Carga exitosa: ${result.width}x${result.height}`)
        } else {
          console.log(`     ❌ Error de carga: ${result.error}`)
        }
        
      } catch (error) {
        console.log(`     ❌ Error inesperado: ${error.message}`)
      }
    }
    
    // 5. Verificar configuración de storage
    console.log('\n📦 5. Verificando configuración de storage...')
    
    // Verificar si las URLs son de Supabase Storage
    const supabaseImages = validImages.filter(img => img.includes('supabase.co'))
    const otherImages = validImages.filter(img => !img.includes('supabase.co'))
    
    console.log(`   Imágenes de Supabase Storage: ${supabaseImages.length}`)
    console.log(`   Otras imágenes: ${otherImages.length}`)
    
    if (supabaseImages.length > 0) {
      console.log('\n   Ejemplos de URLs de Supabase:')
      supabaseImages.slice(0, 3).forEach((img, index) => {
        console.log(`     ${index + 1}. ${img}`)
      })
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error)
    return false
  }
}

async function main() {
  console.log('🚀 INICIANDO DIAGNÓSTICO DE IMÁGENES\n')
  
  try {
    const success = await diagnoseImageLoading()
    
    if (success) {
      console.log('\n🎯 DIAGNÓSTICO COMPLETADO EXITOSAMENTE!')
      console.log('✅ Se han verificado todos los aspectos de las imágenes')
      console.log('💡 Revisa los resultados para identificar el problema')
      console.log('\n🔍 POSIBLES PROBLEMAS IDENTIFICADOS:')
      console.log('   1. URLs de imágenes inválidas o malformadas')
      console.log('   2. Problemas de permisos en Supabase Storage')
      console.log('   3. Imágenes que no se pueden cargar (timeout/error)')
      console.log('   4. Problemas en el hook useImageOptimization')
      console.log('   5. Problemas en el componente OptimizedServiceCard')
    } else {
      console.log('\n❌ DIAGNÓSTICO FALLÓ')
      console.log('💡 Verifica la conexión con Supabase y los datos')
    }
    
  } catch (error) {
    console.error('\n❌ Error en el diagnóstico:', error)
    process.exit(1)
  }
}

// Ejecutar diagnóstico
main()




