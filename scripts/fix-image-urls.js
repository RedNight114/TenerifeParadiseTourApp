#!/usr/bin/env node

/**
 * Script para corregir las URLs de las imágenes en la base de datos
 * Este script soluciona el problema donde las imágenes no se muestran porque las URLs están mal formadas
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixImageUrls() {
  try {
    console.log('🔧 INICIANDO CORRECCIÓN DE URLs DE IMÁGENES')
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

    // 2. Procesar cada servicio
    for (const service of services) {
      if (!service.images || !Array.isArray(service.images)) continue

      let hasChanges = false
      const correctedImages = service.images.map(img => {
        if (img && typeof img === 'string') {
          totalImages++
          
          // Corregir URLs mal formadas
          let corrected = img
          
          // Cambiar 'service-images/' por 'services/'
          if (corrected.includes('service-images/')) {
            corrected = corrected.replace('service-images/', 'services/')
            hasChanges = true
            console.log(`  🔄 Corrigiendo: ${img} → ${corrected}`)
          }
          
          return corrected
        }
        return img
      })

      // 3. Actualizar el servicio si hay cambios
      if (hasChanges) {
        const { error: updateError } = await supabase
          .from('services')
          .update({ images: correctedImages })
          .eq('id', service.id)

        if (updateError) {
          console.error(`❌ Error actualizando servicio ${service.title}:`, updateError.message)
        } else {
          updatedCount++
          console.log(`✅ Servicio "${service.title}" actualizado`)
        }
      }
    }

    // 4. Resumen
    console.log('\n📊 RESUMEN DE CORRECCIÓN:')
    console.log(`  📸 Total de imágenes procesadas: ${totalImages}`)
    console.log(`  🔧 Servicios actualizados: ${updatedCount}`)
    console.log(`  📋 Total de servicios: ${services.length}`)
    
    if (updatedCount > 0) {
      console.log('\n🎉 ¡URLs de imágenes corregidas exitosamente!')
      console.log('💡 Las imágenes ahora deberían mostrarse correctamente.')
    } else {
      console.log('\nℹ️ No se encontraron URLs que necesiten corrección.')
    }

  } catch (error) {
    console.error('❌ Error durante la corrección:', error.message)
    process.exit(1)
  }
}

// Ejecutar el script
fixImageUrls()
  .then(() => {
    console.log('\n✨ Script completado exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error.message)
    process.exit(1)
  })
