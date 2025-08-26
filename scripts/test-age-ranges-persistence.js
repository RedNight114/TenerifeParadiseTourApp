const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno necesarias')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAgeRangesPersistence() {
  console.log('🧪 Probando persistencia de rangos de edad...\n')

  try {
    // 1. Verificar que existe la tabla age_price_ranges
    console.log('1️⃣ Verificando tabla age_price_ranges...')
    const { data: tableExists, error: tableError } = await supabase
      .from('age_price_ranges')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Error al verificar tabla:', tableError.message)
      return
    }
    
    console.log('✅ Tabla age_price_ranges existe\n')

    // 2. Verificar que existe la columna age_ranges en services
    console.log('2️⃣ Verificando columna age_ranges en services...')
    const { data: servicesData, error: servicesError } = await supabase
      .from('services')
      .select('id, title, age_ranges')
      .limit(5)
    
    if (servicesError) {
      console.error('❌ Error al verificar columna age_ranges:', servicesError.message)
      return
    }
    
    console.log('✅ Columna age_ranges existe en services')
    console.log('📊 Servicios encontrados:', servicesData.length)
    
    // Mostrar algunos ejemplos
    servicesData.forEach(service => {
      console.log(`   - ${service.title}: age_ranges =`, service.age_ranges || 'null')
    })
    console.log()

    // 3. Probar inserción de un servicio con rangos de edad
    console.log('3️⃣ Probando inserción de servicio con rangos de edad...')
    
    const testServiceData = {
      title: 'Test Service Age Ranges',
      description: 'Servicio de prueba para rangos de edad',
      category_id: '1', // Asegúrate de que esta categoría existe
      price: 100,
      available: true,
      duration: 120, // Cambiar de string vacío a número
      min_group_size: 1, // Agregar campos numéricos requeridos
      max_group_size: 10,
      capacity: 10,
      min_age: 18,
      seats: 4,
      doors: 4,
      deposit_amount: 0,
      age_ranges: [
        {
          id: 'test-1',
          min_age: 0,
          max_age: 2,
          price: 0,
          price_type: 'baby',
          is_active: true
        },
        {
          id: 'test-2',
          min_age: 3,
          max_age: 11,
          price: 70,
          price_type: 'child',
          is_active: true
        },
        {
          id: 'test-3',
          min_age: 18,
          max_age: 64,
          price: 100,
          price_type: 'adult',
          is_active: true
        }
      ]
    }

    const { data: insertedService, error: insertError } = await supabase
      .rpc('create_service_with_age_ranges', {
        service_data: testServiceData
      })

    if (insertError) {
      console.error('❌ Error al insertar servicio:', insertError.message)
      return
    }

    console.log('✅ Servicio insertado exitosamente')
    console.log('🆔 ID del servicio:', insertedService.id)
    console.log()

    // 4. Verificar que se insertó correctamente
    console.log('4️⃣ Verificando inserción...')
    const { data: verifyService, error: verifyError } = await supabase
      .from('services')
      .select('id, title, age_ranges')
      .eq('id', insertedService.id)
      .single()

    if (verifyError) {
      console.error('❌ Error al verificar servicio:', verifyError.message)
      return
    }

    console.log('✅ Servicio verificado:')
    console.log('   - Título:', verifyService.title)
    console.log('   - age_ranges:', verifyService.age_ranges)
    console.log()

    // 5. Probar actualización del servicio
    console.log('5️⃣ Probando actualización del servicio...')
    
    const updatedAgeRanges = [
      {
        id: 'test-1',
        min_age: 0,
        max_age: 2,
        price: 0,
        price_type: 'baby',
        is_active: false // Desactivar bebés
      },
      {
        id: 'test-2',
        min_age: 3,
        max_age: 11,
        price: 80, // Cambiar precio
        price_type: 'child',
        is_active: true
      },
      {
        id: 'test-3',
        min_age: 18,
        max_age: 64,
        price: 100,
        price_type: 'adult',
        is_active: true
      }
    ]

    const updateData = {
      ...testServiceData,
      title: 'Test Service Age Ranges - UPDATED',
      age_ranges: updatedAgeRanges
    }

    const { data: updatedService, error: updateError } = await supabase
      .rpc('update_service_with_age_ranges', {
        service_id: insertedService.id,
        service_data: updateData
      })

    if (updateError) {
      console.error('❌ Error al actualizar servicio:', updateError.message)
      return
    }

    console.log('✅ Servicio actualizado exitosamente')
    console.log()

    // 6. Verificar la actualización
    console.log('6️⃣ Verificando actualización...')
    const { data: finalService, error: finalError } = await supabase
      .from('services')
      .select('id, title, age_ranges')
      .eq('id', insertedService.id)
      .single()

    if (finalError) {
      console.error('❌ Error al verificar servicio final:', finalError.message)
      return
    }

    console.log('✅ Servicio final verificado:')
    console.log('   - Título:', finalService.title)
    console.log('   - age_ranges:', finalService.age_ranges)
    console.log()

    // 7. Limpiar - eliminar el servicio de prueba
    console.log('7️⃣ Limpiando servicio de prueba...')
    const { error: deleteError } = await supabase
      .rpc('delete_service_complete', {
        service_id: insertedService.id
      })

    if (deleteError) {
      console.error('❌ Error al eliminar servicio:', deleteError.message)
      return
    }

    console.log('✅ Servicio de prueba eliminado')
    console.log()

    console.log('🎉 ¡Prueba completada exitosamente!')
    console.log('✅ Los rangos de edad persisten correctamente en la base de datos')

  } catch (error) {
    console.error('❌ Error general:', error.message)
    console.error(error.stack)
  }
}

// Ejecutar la prueba
testAgeRangesPersistence()
