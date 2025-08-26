const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function checkAgePricingStatus() {
  console.log('🔍 Verificando estado del sistema de precios por edad...\n')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    // 1. Verificar si existe la tabla age_price_ranges
    console.log('1️⃣ Verificando tabla age_price_ranges...')
    const { data: tableExists, error: tableError } = await supabase
      .from('age_price_ranges')
      .select('count')
      .limit(1)

    if (tableError) {
      console.log('❌ Tabla age_price_ranges NO existe')
      console.log('   Error:', tableError.message)
      console.log('\n💡 Necesitas ejecutar el script 42-create-age-based-pricing.sql')
      return
    }

    console.log('✅ Tabla age_price_ranges existe')

    // 2. Verificar cuántos rangos de edad hay
    console.log('\n2️⃣ Contando rangos de edad...')
    const { count: rangesCount, error: countError } = await supabase
      .from('age_price_ranges')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.log('❌ Error contando rangos:', countError.message)
      return
    }

    console.log(`✅ Hay ${rangesCount} rangos de edad configurados`)

    // 3. Verificar cuántos servicios tienen precios por edad
    console.log('\n3️⃣ Verificando servicios con precios por edad...')
    const { data: servicesWithPricing, error: servicesError } = await supabase
      .from('age_price_ranges')
      .select('service_id')
      .eq('is_active', true)

    if (servicesError) {
      console.log('❌ Error consultando servicios:', servicesError.message)
      return
    }

    const uniqueServices = [...new Set(servicesWithPricing.map(r => r.service_id))]
    console.log(`✅ ${uniqueServices.length} servicios tienen precios por edad configurados`)

    // 4. Mostrar algunos ejemplos de rangos
    console.log('\n4️⃣ Ejemplos de rangos de edad:')
    const { data: sampleRanges, error: sampleError } = await supabase
      .from('age_price_ranges')
      .select('*')
      .eq('is_active', true)
      .limit(5)

    if (sampleError) {
      console.log('❌ Error obteniendo ejemplos:', sampleError.message)
      return
    }

    sampleRanges.forEach((range, index) => {
      console.log(`   ${index + 1}. ${range.min_age}-${range.max_age} años: €${range.price} (${range.price_type})`)
    })

    // 5. Verificar si hay servicios sin precios por edad
    console.log('\n5️⃣ Verificando servicios sin precios por edad...')
    const { data: allServices, error: allServicesError } = await supabase
      .from('services')
      .select('id, title, available')
      .eq('available', true)

    if (allServicesError) {
      console.log('❌ Error consultando servicios:', allServicesError.message)
      return
    }

    const servicesWithoutPricing = allServices.filter(service => 
      !uniqueServices.includes(service.id)
    )

    if (servicesWithoutPricing.length > 0) {
      console.log(`⚠️  ${servicesWithoutPricing.length} servicios NO tienen precios por edad:`)
      servicesWithoutPricing.slice(0, 5).forEach(service => {
        console.log(`   - ${service.title} (ID: ${service.id})`)
      })
      if (servicesWithoutPricing.length > 5) {
        console.log(`   ... y ${servicesWithoutPricing.length - 5} más`)
      }
    } else {
      console.log('✅ Todos los servicios tienen precios por edad configurados')
    }

    // 6. Resumen final
    console.log('\n📊 RESUMEN DEL SISTEMA DE PRECIOS POR EDAD:')
    console.log(`   • Tabla: ✅ Existe`)
    console.log(`   • Rangos totales: ${rangesCount}`)
    console.log(`   • Servicios con precios: ${uniqueServices.length}/${allServices.length}`)
    console.log(`   • Cobertura: ${Math.round((uniqueServices.length / allServices.length) * 100)}%`)

    if (uniqueServices.length < allServices.length) {
      console.log('\n💡 RECOMENDACIONES:')
      console.log('   • Ejecuta el script 42-create-age-based-pricing.sql para configurar precios faltantes')
      console.log('   • O ejecuta el script de inserción manual para servicios específicos')
    }

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

// Ejecutar la verificación
checkAgePricingStatus()
  .then(() => {
    console.log('\n✅ Verificación completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
