#!/usr/bin/env node

/**
 * Script para limpiar completamente las URLs de imágenes problemáticas
 * Este script elimina URLs duplicadas, mal formadas y que no existen
 * Versión CommonJS compatible con Node.js estándar
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanupBrokenImageUrls() {
  try {
    console.log('🧹 INICIANDO LIMPIEZA COMPLETA DE URLs DE IMÁGENES')
    console.log('📊 Conectando a Supabase...')

    // 1. Obtener todos los servicios con imágenes
    const { data: services, error: fetchError } = await supabase
      .from('services')
      .select('id, title, images')
      .not('images', 'is', null)
      .neq('images', '{}')

    if (fetchError) {
      throw new Error(`Error al obtener servicios: ${fetchError.message}`)
    }

    console.log(`✅ Encontrados ${services.length} servicios con imágenes`)

    let updatedCount = 0
    let totalImages = 0
    let brokenUrlsFound = 0

    // 2. Procesar cada servicio
    for (const service of services) {
      if (!service.images || !Array.isArray(service.images)) continue

      let hasChanges = false
      const cleanedImages = []

      for (const img of service.images) {
        if (img && typeof img === 'string') {
          totalImages++
          let shouldKeep = true
          let cleanedUrl = img

          // PROBLEMA 1: Eliminar URLs duplicadas (services/services/)
          if (cleanedUrl.includes('services/services/')) {
            cleanedUrl = cleanedUrl.replace('services/services/', 'services/')
            hasChanges = true
            brokenUrlsFound++
            console.log(`  🔄 Corrigiendo duplicado: ${img} → ${cleanedUrl}`)
          }

          // PROBLEMA 2: Eliminar URLs con service-images/ (ya corregido antes)
          if (cleanedUrl.includes('service-images/')) {
            cleanedUrl = cleanedUrl.replace('service-images/', 'services/')
            hasChanges = true
            brokenUrlsFound++
            console.log(`  🔄 Corrigiendo service-images: ${img} → ${cleanedUrl}`)
          }

          // PROBLEMA 3: Eliminar URLs que sabemos que no existen
          const brokenImages = [
            'quad1.jpg',
            'forest1.jpg', 
            'boat_tour.jpg',
            'jetski1.jpg',
            'placeholder.jpg'
          ]

          if (brokenImages.some(broken => cleanedUrl.includes(broken))) {
            console.log(`  🗑️ Eliminando imagen rota: ${cleanedUrl}`)
            shouldKeep = false
            brokenUrlsFound++
            hasChanges = true
          }

          // Solo mantener URLs válidas
          if (shouldKeep && cleanedUrl.trim()) {
            cleanedImages.push(cleanedUrl)
          }
        }
      }

      // 3. Actualizar el servicio si hay cambios
      if (hasChanges) {
        const { error: updateError } = await supabase
          .from('services')
          .update({ images: cleanedImages })
          .eq('id', service.id)

        if (updateError) {
          console.error(`❌ Error actualizando servicio ${service.title}:`, updateError.message)
        } else {
          updatedCount++
          console.log(`✅ Servicio "${service.title}" limpiado: ${service.images.length} → ${cleanedImages.length} imágenes`)
        }
      }
    }

    // 4. Resumen
    console.log('\n📊 RESUMEN DE LIMPIEZA:')
    console.log(`  📸 Total de imágenes procesadas: ${totalImages}`)
    console.log(`  🗑️ URLs problemáticas encontradas: ${brokenUrlsFound}`)
    console.log(`  🔧 Servicios actualizados: ${updatedCount}`)
    console.log(`  📋 Total de servicios: ${services.length}`)
    
    if (updatedCount > 0) {
      console.log('\n🎉 ¡URLs de imágenes limpiadas exitosamente!')
      console.log('💡 Las imágenes ahora deberían mostrarse correctamente.')
      console.log('💡 No más bucles infinitos de errores 400.')
    } else {
      console.log('\nℹ️ No se encontraron URLs que necesiten limpieza.')
    }

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message)
    process.exit(1)
  }
}

// Ejecutar el script
cleanupBrokenImageUrls()
  .then(() => {
    console.log('\n✨ Script completado exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error.message)
    process.exit(1)
  })
