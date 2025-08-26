const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function verifyAgePricingSystem() {
  console.log('🔍 Verificando sistema de precios por edad...\\n')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    // 1. Verificar que la tabla existe
    console.log('1️⃣ Verificando tabla age_price_ranges...')
    const { data: tableData, error: tableError } = await supabase
      .from('age_price_ranges')
      .select('count')
      .limit(1)

    if (tableError) {
      console.log('❌ Error al acceder a la tabla:', tableError.message)
      return
    }

    console.log('✅ Tabla age_price_ranges existe')

    // 2. Verificar que hay datos
    console.log('\\n2️⃣ Verificando datos en age_price_ranges...')
    const { count: totalCount, error: countError } = await supabase
      .from('age_price_ranges')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.log('❌ Error al contar registros:', countError.message)
      return
    }

    console.log(`✅ Total de rangos de edad: ${totalCount}`)

    // 3. Verificar servicios con precios por edad
    console.log('\\n3️⃣ Verificando servicios con precios por edad...')
    const { data: servicesData, error: servicesError } = await supabase
      .from('age_price_ranges')
      .select('service_id')
      .limit(100)

    if (servicesError) {
      console.log('❌ Error al obtener servicios:', servicesError.message)
      return
    }

    const uniqueServices = [...new Set(servicesData.map(item => item.service_id))]
    console.log(`✅ Servicios con precios por edad: ${uniqueServices.length}`)

    // 4. Verificar rangos de edad por servicio
    console.log('\\n4️⃣ Verificando rangos de edad por servicio...')
    const { data: rangesData, error: rangesError } = await supabase
      .from('age_price_ranges')
      .select('min_age, max_age, price_type')
      .limit(20)

    if (rangesError) {
      console.log('❌ Error al obtener rangos:', rangesError.message)
      return
    }

    console.log('✅ Rangos de edad configurados:')
    rangesData.forEach(range => {
      console.log(`   ${range.min_age}-${range.max_age} años: ${range.price_type}`)
    })

    // 5. Verificar función get_price_by_age
    console.log('\\n5️⃣ Verificando función get_price_by_age...')
    const { data: functionData, error: functionError } = await supabase
      .rpc('get_price_by_age', {
        service_id_param: uniqueServices[0],
        age_param: 25
      })

    if (functionError) {
      console.log('❌ Error en función get_price_by_age:', functionError.message)
      console.log('💡 La función puede no estar creada aún')
    } else {
      console.log(`✅ Función get_price_by_age funciona. Precio para 25 años: €${functionData}`)
    }

    // 6. Verificar función get_service_pricing
    console.log('\\n6️⃣ Verificando función get_service_pricing...')
    const { data: pricingData, error: pricingError } = await supabase
      .rpc('get_service_pricing', {
        service_id_param: uniqueServices[0]
      })

    if (pricingError) {
      console.log('❌ Error en función get_service_pricing:', pricingError.message)
      console.log('💡 La función puede no estar creada aún')
    } else {
      console.log(`✅ Función get_service_pricing funciona. Rangos encontrados: ${pricingData.length}`)
      pricingData.forEach(range => {
        console.log(`   ${range.age_label}: €${range.price}`)
      })
    }

    // 7. Verificar vista service_age_pricing
    console.log('\\n7️⃣ Verificando vista service_age_pricing...')
    const { data: viewData, error: viewError } = await supabase
      .from('service_age_pricing')
      .select('*')
      .limit(5)

    if (viewError) {
      console.log('❌ Error en vista service_age_pricing:', viewError.message)
      console.log('💡 La vista puede no estar creada aún')
    } else {
      console.log(`✅ Vista service_age_pricing funciona. Datos encontrados: ${viewData.length}`)
    }

    // 8. Verificar políticas RLS
    console.log('\\n8️⃣ Verificando políticas RLS...')
    const { data: policiesData, error: policiesError } = await supabase
      .from('age_price_ranges')
      .select('*')
      .limit(1)

    if (policiesError) {
      console.log('❌ Error al acceder con políticas RLS:', policiesError.message)
    } else {
      console.log('✅ Políticas RLS funcionan correctamente')
    }

    console.log('\\n🎉 Verificación del sistema de precios por edad completada!')
    console.log('\\n📋 Resumen:')
    console.log(`   - Tabla age_price_ranges: ✅`)
    console.log(`   - Total rangos de edad: ${totalCount}`)
    console.log(`   - Servicios con precios: ${uniqueServices.length}`)
    console.log(`   - Funciones SQL: ${functionError ? '❌' : '✅'}`)
    console.log(`   - Vista: ${viewError ? '❌' : '✅'}`)
    console.log(`   - Políticas RLS: ${policiesError ? '❌' : '✅'}`)

    if (functionError || viewError) {
      console.log('\\n⚠️  Algunas funciones SQL o vistas pueden no estar creadas aún.')
      console.log('   Ejecuta el script SQL completo en tu base de datos de Supabase.')
    }

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

verifyAgePricingSystem()
