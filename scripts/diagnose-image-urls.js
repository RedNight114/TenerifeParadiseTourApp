// =====================================================
// SCRIPT DE DIAGNÓSTICO: URLs DE IMÁGENES
// Verifica exactamente qué URLs están llegando desde Supabase
// =====================================================

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

console.log('🔍 DIAGNÓSTICO DE URLs DE IMÁGENES\n')

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

// Función para analizar URLs
function analyzeImageUrl(url) {
  if (!url) return { type: 'empty', valid: false, issue: 'URL vacía' }
  
  try {
    // Si es una URL completa
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url)
      
      // Verificar si es Vercel Blob
      if (url.includes('vercel-storage.com') || url.includes('blob.vercel-storage.com')) {
        return {
          type: 'vercel-blob',
          valid: true,
          issue: 'URL de Vercel Blob (puede tener problemas de permisos)',
          hostname: urlObj.hostname,
          pathname: urlObj.pathname
        }
      }
      
      // Verificar si es Supabase Storage
      if (url.includes('supabase.co') || url.includes('storage.googleapis.com')) {
        return {
          type: 'supabase-storage',
          valid: true,
          issue: 'URL de Supabase Storage',
          hostname: urlObj.hostname,
          pathname: urlObj.pathname
        }
      }
      
      // Otra URL externa
      return {
        type: 'external',
        valid: true,
        issue: 'URL externa',
        hostname: urlObj.hostname,
        pathname: urlObj.pathname
      }
    }
    
    // Si es una ruta relativa
    if (url.startsWith('/')) {
      return {
        type: 'relative',
        valid: true,
        issue: 'Ruta relativa local',
        pathname: url
      }
    }
    
    // Si no tiene protocolo
    return {
      type: 'no-protocol',
      valid: false,
      issue: 'Sin protocolo, asumiendo ruta relativa',
      suggested: `/${url}`
    }
    
  } catch (error) {
    return {
      type: 'invalid',
      valid: false,
      issue: `URL inválida: ${error.message}`,
      original: url
    }
  }
}

async function diagnoseImageUrls() {
  try {
    console.log('🔄 Conectando a Supabase...')
    
    // 1. Obtener servicios con imágenes
    console.log('\n📊 1. Obteniendo servicios con imágenes...')
    const { data: services, error } = await supabase
      .from('services')
      .select('id, title, images, featured')
      .not('images', 'is', null)
      .limit(10)
    
    if (error) {
      console.error('❌ Error obteniendo servicios:', error)
      return
    }
    
    console.log(`✅ Servicios encontrados: ${services.length}`)
    
    if (services.length === 0) {
      console.log('⚠️ No hay servicios con imágenes')
      return
    }
    
    // 2. Analizar cada servicio y sus imágenes
    console.log('\n🔍 2. ANALIZANDO IMÁGENES DE CADA SERVICIO:')
    
    let totalImages = 0
    let validUrls = 0
    let invalidUrls = 0
    let vercelBlobUrls = 0
    let supabaseUrls = 0
    let localUrls = 0
    
    services.forEach((service, serviceIndex) => {
      console.log(`\n--- SERVICIO ${serviceIndex + 1}: ${service.title} ---`)
      console.log('ID:', service.id)
      console.log('Destacado:', service.featured ? 'Sí' : 'No')
      
      if (service.images && Array.isArray(service.images)) {
        console.log(`Imágenes: ${service.images.length}`)
        
        service.images.forEach((imageUrl, imageIndex) => {
          totalImages++
          console.log(`\n  Imagen ${imageIndex + 1}:`)
          console.log(`  URL: ${imageUrl}`)
          
          const analysis = analyzeImageUrl(imageUrl)
          console.log(`  Tipo: ${analysis.type}`)
          console.log(`  Válida: ${analysis.valid ? '✅ Sí' : '❌ No'}`)
          console.log(`  Problema: ${analysis.issue}`)
          
          if (analysis.hostname) {
            console.log(`  Hostname: ${analysis.hostname}`)
          }
          if (analysis.pathname) {
            console.log(`  Pathname: ${analysis.pathname}`)
          }
          if (analysis.suggested) {
            console.log(`  Sugerido: ${analysis.suggested}`)
          }
          
          // Contar tipos
          if (analysis.valid) validUrls++
          else invalidUrls++
          
          if (analysis.type === 'vercel-blob') vercelBlobUrls++
          else if (analysis.type === 'supabase-storage') supabaseUrls++
          else if (analysis.type === 'relative' || analysis.type === 'no-protocol') localUrls++
        })
      } else {
        console.log('❌ No tiene imágenes o formato incorrecto')
      }
    })
    
    // 3. Resumen estadístico
    console.log('\n📈 3. RESUMEN ESTADÍSTICO:')
    console.log(`Total de servicios analizados: ${services.length}`)
    console.log(`Total de imágenes encontradas: ${totalImages}`)
    console.log(`URLs válidas: ${validUrls}`)
    console.log(`URLs inválidas: ${invalidUrls}`)
    console.log(`URLs de Vercel Blob: ${vercelBlobUrls}`)
    console.log(`URLs de Supabase Storage: ${supabaseUrls}`)
    console.log(`URLs locales: ${localUrls}`)
    
    // 4. Análisis de problemas
    console.log('\n🔍 4. ANÁLISIS DE PROBLEMAS:')
    
    if (vercelBlobUrls > 0) {
      console.log(`\n⚠️ PROBLEMA IDENTIFICADO: ${vercelBlobUrls} URLs de Vercel Blob`)
      console.log('   - Estas URLs pueden devolver 403 Forbidden')
      console.log('   - Necesitan configuración de permisos en Vercel')
      console.log('   - Solución: Configurar CORS y permisos de acceso')
    }
    
    if (invalidUrls > 0) {
      console.log(`\n❌ PROBLEMA IDENTIFICADO: ${invalidUrls} URLs inválidas`)
      console.log('   - Estas URLs no se pueden cargar')
      console.log('   - Solución: Corregir formato en la base de datos')
    }
    
    if (localUrls > 0) {
      console.log(`\n📁 URLs locales: ${localUrls}`)
      console.log('   - Estas URLs apuntan a archivos locales')
      console.log('   - Verificar que los archivos existan en public/images/')
    }
    
    // 5. Recomendaciones
    console.log('\n💡 5. RECOMENDACIONES:')
    
    if (vercelBlobUrls > 0) {
      console.log('   🔧 Para URLs de Vercel Blob:')
      console.log('     1. Verificar permisos en el dashboard de Vercel')
      console.log('     2. Configurar CORS correctamente')
      console.log('     3. Regenerar tokens de acceso si es necesario')
      console.log('     4. Considerar migrar a Supabase Storage')
    }
    
    if (invalidUrls > 0) {
      console.log('   🔧 Para URLs inválidas:')
      console.log('     1. Corregir formato en la base de datos')
      console.log('     2. Asegurar que todas las URLs tengan protocolo')
      console.log('     3. Validar URLs antes de guardarlas')
    }
    
    console.log('\n✅ DIAGNÓSTICO COMPLETADO')
    
  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error)
  }
}

// Ejecutar diagnóstico
diagnoseImageUrls()




