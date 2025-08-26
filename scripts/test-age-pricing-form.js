const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function testAgePricingForm() {
  console.log('🧪 Probando sistema de rangos de edad personalizados...\n')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    // 1. Verificar que las funciones existen
    console.log('1️⃣ Verificando funciones SQL...')
    
    // Probar función get_service_age_ranges
    const { data: testService, error: serviceError } = await supabase
      .from('services')
      .select('id, title')
      .limit(1)

    if (serviceError || !testService || testService.length === 0) {
      console.log('❌ No se pudo obtener un servicio de prueba')
      return
    }

    const testServiceId = testService[0].id
    console.log(`✅ Servicio de prueba: ${testService[0].title} (ID: ${testServiceId})`)

    // 2. Probar función get_service_age_ranges
    console.log('\n2️⃣ Probando función get_service_age_ranges...')
    const { data: ageRanges, error: rangesError } = await supabase
      .rpc('get_service_age_ranges', {
        service_id_param: testServiceId
      })

    if (rangesError) {
      console.log('❌ Error en get_service_age_ranges:', rangesError.message)
    } else {
      console.log(`✅ Rangos de edad obtenidos: ${ageRanges.length}`)
      ageRanges.forEach(range => {
        console.log(`   - ${range.age_label}: €${range.price} (${range.min_age}-${range.max_age} años)`)
      })
    }

    // 3. Probar función upsert_service_age_ranges
    console.log('\n3️⃣ Probando función upsert_service_age_ranges...')
    
    const testAgeRanges = [
      {
        min_age: 0,
        max_age: 2,
        price: 0,
        price_type: 'baby',
        is_active: true
      },
      {
        min_age: 3,
        max_age: 11,
        price: 25.50,
        price_type: 'child',
        is_active: true
      },
      {
        min_age: 12,
        max_age: 17,
        price: 38.25,
        price_type: 'child',
        is_active: true
      },
      {
        min_age: 18,
        max_age: 64,
        price: 51.00,
        price_type: 'adult',
        is_active: true
      },
      {
        min_age: 65,
        max_age: 120,
        price: 45.90,
        price_type: 'senior',
        is_active: true
      }
    ]

    const { error: upsertError } = await supabase
      .rpc('upsert_service_age_ranges', {
        service_id_param: testServiceId,
        age_ranges_param: testAgeRanges
      })

    if (upsertError) {
      console.log('❌ Error en upsert_service_age_ranges:', upsertError.message)
    } else {
      console.log('✅ Rangos de edad actualizados correctamente')
    }

    // 4. Verificar que los rangos se guardaron
    console.log('\n4️⃣ Verificando rangos guardados...')
    const { data: savedRanges, error: savedError } = await supabase
      .rpc('get_service_age_ranges', {
        service_id_param: testServiceId
      })

    if (savedError) {
      console.log('❌ Error al obtener rangos guardados:', savedError.message)
    } else {
      console.log(`✅ Rangos guardados: ${savedRanges.length}`)
      savedRanges.forEach(range => {
        console.log(`   - ${range.age_label}: €${range.price} (${range.min_age}-${range.max_age} años)`)
      })
    }

    // 5. Verificar tabla age_price_ranges
    console.log('\n5️⃣ Verificando tabla age_price_ranges...')
    const { data: tableData, error: tableError } = await supabase
      .from('age_price_ranges')
      .select('*')
      .eq('service_id', testServiceId)
      .eq('is_active', true)

    if (tableError) {
      console.log('❌ Error al acceder a la tabla:', tableError.message)
    } else {
      console.log(`✅ Registros en tabla: ${tableData.length}`)
      tableData.forEach(record => {
        console.log(`   - ID: ${record.id}, Edad: ${record.min_age}-${record.max_age}, Precio: €${record.price}, Tipo: ${record.price_type}`)
      })
    }

    // 6. Resumen final
    console.log('\n🎉 Prueba del sistema completada!')
    console.log('\n📋 Resumen:')
    console.log(`   - Servicio de prueba: ${testService[0].title}`)
    console.log(`   - Rangos configurados: ${savedRanges ? savedRanges.length : 0}`)
    console.log(`   - Funciones SQL: ${rangesError ? '❌' : '✅'}`)
    console.log(`   - Actualización de rangos: ${upsertError ? '❌' : '✅'}`)
    console.log(`   - Base de datos: ${tableError ? '❌' : '✅'}`)

    if (!rangesError && !upsertError && !tableError) {
      console.log('\n✅ El sistema de rangos de edad personalizados está funcionando correctamente!')
      console.log('💡 Ahora puedes usar el formulario para configurar precios por edad')
    } else {
      console.log('\n⚠️  Hay algunos errores que necesitan ser corregidos')
      console.log('💡 Ejecuta el script SQL update-service-with-age-ranges.sql en Supabase')
    }

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

testAgePricingForm()
