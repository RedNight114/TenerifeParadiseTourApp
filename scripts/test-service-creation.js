/**
 * Script para probar la creación de servicios con diferentes valores de difficulty_level
 */

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase (usa variables de entorno o configuración local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uiluoghnrjfdnvguagje.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'tu-anon-key'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testServiceCreation() {
  console.log('🧪 Probando creación de servicios...\n')

  // Test 1: Crear servicio con difficulty_level válido
  console.log('✅ Test 1: difficulty_level = "facil"')
  try {
    const { data, error } = await supabase.rpc('create_service_simple', {
      service_data: {
        title: 'Test Servicio Fácil',
        description: 'Servicio de prueba con dificultad fácil',
        price: 50.00,
        difficulty_level: 'facil',
        category_id: 'actividades',
        subcategory_id: 'aventura'
      }
    })

    if (error) {
      console.log('❌ Error:', error.message)
    } else if (data?.success) {
      console.log('✅ Servicio creado:', data.service_id)
      
      // Limpiar servicio de prueba
      await supabase.from('services').delete().eq('id', data.service_id)
      console.log('🗑️ Servicio de prueba eliminado')
    } else {
      console.log('❌ Error en respuesta:', data?.error)
    }
  } catch (err) {
    console.log('❌ Error:', err.message)
  }

  console.log('\n✅ Test 2: difficulty_level = "moderado"')
  try {
    const { data, error } = await supabase.rpc('create_service_simple', {
      service_data: {
        title: 'Test Servicio Moderado',
        description: 'Servicio de prueba con dificultad moderada',
        price: 75.00,
        difficulty_level: 'moderado',
        category_id: 'actividades',
        subcategory_id: 'aventura'
      }
    })

    if (error) {
      console.log('❌ Error:', error.message)
    } else if (data?.success) {
      console.log('✅ Servicio creado:', data.service_id)
      
      // Limpiar servicio de prueba
      await supabase.from('services').delete().eq('id', data.service_id)
      console.log('🗑️ Servicio de prueba eliminado')
    } else {
      console.log('❌ Error en respuesta:', data?.error)
    }
  } catch (err) {
    console.log('❌ Error:', err.message)
  }

  console.log('\n❌ Test 3: difficulty_level = "easy" (inválido)')
  try {
    const { data, error } = await supabase.rpc('create_service_simple', {
      service_data: {
        title: 'Test Servicio Inválido',
        description: 'Servicio de prueba con dificultad inválida',
        price: 100.00,
        difficulty_level: 'easy',
        category_id: 'actividades',
        subcategory_id: 'aventura'
      }
    })

    if (error) {
      console.log('❌ Error esperado:', error.message)
    } else if (!data?.success) {
      console.log('✅ Validación funcionando:', data?.error)
    } else {
      console.log('❌ ERROR: Debería haber fallado pero no lo hizo')
    }
  } catch (err) {
    console.log('❌ Error:', err.message)
  }

  console.log('\n❌ Test 4: difficulty_level = "hard" (inválido)')
  try {
    const { data, error } = await supabase.rpc('create_service_simple', {
      service_data: {
        title: 'Test Servicio Inválido 2',
        description: 'Servicio de prueba con dificultad inválida',
        price: 100.00,
        difficulty_level: 'hard',
        category_id: 'actividades',
        subcategory_id: 'aventura'
      }
    })

    if (error) {
      console.log('❌ Error esperado:', error.message)
    } else if (!data?.success) {
      console.log('✅ Validación funcionando:', data?.error)
    } else {
      console.log('❌ ERROR: Debería haber fallado pero no lo hizo')
    }
  } catch (err) {
    console.log('❌ Error:', err.message)
  }

  console.log('\n✅ Test 5: difficulty_level = "dificil" (válido)')
  try {
    const { data, error } = await supabase.rpc('create_service_simple', {
      service_data: {
        title: 'Test Servicio Difícil',
        description: 'Servicio de prueba con dificultad difícil',
        price: 120.00,
        difficulty_level: 'dificil',
        category_id: 'actividades',
        subcategory_id: 'aventura'
      }
    })

    if (error) {
      console.log('❌ Error:', error.message)
    } else if (data?.success) {
      console.log('✅ Servicio creado:', data.service_id)
      
      // Limpiar servicio de prueba
      await supabase.from('services').delete().eq('id', data.service_id)
      console.log('🗑️ Servicio de prueba eliminado')
    } else {
      console.log('❌ Error en respuesta:', data?.error)
    }
  } catch (err) {
    console.log('❌ Error:', err.message)
  }

  console.log('\n🎉 Pruebas completadas!')
  console.log('\n📋 Resumen:')
  console.log('✅ difficulty_level = "facil" - Válido')
  console.log('✅ difficulty_level = "moderado" - Válido') 
  console.log('✅ difficulty_level = "dificil" - Válido')
  console.log('❌ difficulty_level = "easy" - Inválido (debe fallar)')
  console.log('❌ difficulty_level = "hard" - Inválido (debe fallar)')
}

// Ejecutar las pruebas
testServiceCreation().catch(console.error)
