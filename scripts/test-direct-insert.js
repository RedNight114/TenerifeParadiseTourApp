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

async function testDirectInsert() {
  console.log('🧪 Probando inserción directa en tabla services...\n')

  try {
    // 1. Verificar qué categorías y subcategorías existen
    console.log('1️⃣ Verificando categorías y subcategorías existentes...')
    
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(5)
    
    if (categoriesError) {
      console.error('❌ Error al obtener categorías:', categoriesError.message)
      return
    }
    
    console.log('📋 Categorías disponibles:')
    categories.forEach(cat => {
      console.log(`   - ID: ${cat.id}, Nombre: ${cat.name}`)
    })
    console.log()
    
    const { data: subcategories, error: subcategoriesError } = await supabase
      .from('subcategories')
      .select('id, name, category_id')
      .limit(10)
    
    if (subcategoriesError) {
      console.error('❌ Error al obtener subcategorías:', subcategoriesError.message)
      return
    }
    
    console.log('📋 Subcategorías disponibles:')
    subcategories.forEach(sub => {
      console.log(`   - ID: ${sub.id}, Nombre: ${sub.name}, Categoría: ${sub.category_id}`)
    })
    console.log()
    
    // Usar la primera categoría y subcategoría disponibles
    if (categories.length === 0 || subcategories.length === 0) {
      console.error('❌ No hay categorías o subcategorías disponibles')
      return
    }
    
    const categoryId = categories[0].id
    const subcategoryId = subcategories[0].id
    
    console.log(`✅ Usando categoría ID: ${categoryId} y subcategoría ID: ${subcategoryId}`)
    console.log()

    // 2. Probar inserción directa
    console.log('2️⃣ Probando inserción directa...')
    
    const testServiceData = {
      title: 'Test Direct Insert',
      description: 'Test description',
      category_id: categoryId,
      subcategory_id: subcategoryId,
      price: 100,
      available: true,
      duration: 120,
      min_group_size: 1,
      max_group_size: 10,
      capacity: 10,
      min_age: 18,
      seats: 4,
      doors: 4,
      deposit_amount: 0,
      price_type: 'per_person',
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

    console.log('📋 Datos a insertar:')
    console.log(JSON.stringify(testServiceData, null, 2))
    console.log()

    const { data: insertedService, error: insertError } = await supabase
      .from('services')
      .insert(testServiceData)
      .select()
      .single()

    if (insertError) {
      console.error('❌ Error al insertar directamente:', insertError.message)
      console.error('Detalles del error:', insertError)
      return
    }

    console.log('✅ Servicio insertado directamente exitosamente')
    console.log('🆔 ID del servicio:', insertedService.id)
    console.log('📊 age_ranges guardados:', insertedService.age_ranges)
    console.log()

    // 3. Verificar que se insertó correctamente
    console.log('3️⃣ Verificando inserción...')
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

    // 4. Probar actualización directa
    console.log('4️⃣ Probando actualización directa...')
    
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

    const { data: updatedService, error: updateError } = await supabase
      .from('services')
      .update({
        title: 'Test Direct Insert - UPDATED',
        age_ranges: updatedAgeRanges
      })
      .eq('id', insertedService.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error al actualizar directamente:', updateError.message)
      return
    }

    console.log('✅ Servicio actualizado directamente exitosamente')
    console.log('📊 age_ranges actualizados:', updatedService.age_ranges)
    console.log()

    // 5. Verificar la actualización
    console.log('5️⃣ Verificando actualización...')
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

    // 6. Limpiar - eliminar el servicio de prueba
    console.log('6️⃣ Limpiando servicio de prueba...')
    const { error: deleteError } = await supabase
      .from('services')
      .delete()
      .eq('id', insertedService.id)

    if (deleteError) {
      console.error('❌ Error al eliminar servicio:', deleteError.message)
      return
    }

    console.log('✅ Servicio de prueba eliminado')
    console.log()

    console.log('🎉 ¡Prueba completada exitosamente!')
    console.log('✅ Los rangos de edad persisten correctamente con inserción directa')

  } catch (error) {
    console.error('❌ Error general:', error.message)
    console.error(error.stack)
  }
}

// Ejecutar la prueba
testDirectInsert()
