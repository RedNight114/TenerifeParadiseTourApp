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

async function testSimpleInsert() {
  console.log('🧪 Probando inserción simple sin age_ranges...\n')

  try {
    // 1. Obtener categoría y subcategoría
    console.log('1️⃣ Obteniendo categoría y subcategoría...')
    
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(1)
    
    if (categoriesError) {
      console.error('❌ Error al obtener categorías:', categoriesError.message)
      return
    }
    
    const { data: subcategories, error: subcategoriesError } = await supabase
      .from('subcategories')
      .select('id, name')
      .limit(1)
    
    if (subcategoriesError) {
      console.error('❌ Error al obtener subcategorías:', subcategoriesError.message)
      return
    }
    
    const categoryId = categories[0].id
    const subcategoryId = subcategories[0].id
    
    console.log(`✅ Usando categoría: ${categoryId}, subcategoría: ${subcategoryId}`)
    console.log()

    // 2. Probar inserción simple (sin age_ranges)
    console.log('2️⃣ Probando inserción simple...')
    
    const simpleServiceData = {
      title: 'Test Simple Insert',
      description: 'Test description simple',
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
      price_type: 'per_person'
      // NO incluir age_ranges por ahora
    }

    console.log('📋 Datos a insertar (sin age_ranges):')
    console.log(JSON.stringify(simpleServiceData, null, 2))
    console.log()

    const { data: insertedService, error: insertError } = await supabase
      .from('services')
      .insert(simpleServiceData)
      .select()
      .single()

    if (insertError) {
      console.error('❌ Error al insertar servicio simple:', insertError.message)
      console.error('Detalles del error:', insertError)
      return
    }

    console.log('✅ Servicio simple insertado exitosamente')
    console.log('🆔 ID del servicio:', insertedService.id)
    console.log('📊 Datos insertados:', insertedService)
    console.log()

    // 3. Probar actualización con age_ranges
    console.log('3️⃣ Probando actualización con age_ranges...')
    
    const ageRanges = [
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

    const { data: updatedService, error: updateError } = await supabase
      .from('services')
      .update({
        age_ranges: ageRanges
      })
      .eq('id', insertedService.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error al actualizar con age_ranges:', updateError.message)
      console.error('Detalles del error:', updateError)
      return
    }

    console.log('✅ Servicio actualizado con age_ranges exitosamente')
    console.log('📊 age_ranges guardados:', updatedService.age_ranges)
    console.log()

    // 4. Limpiar
    console.log('4️⃣ Limpiando servicio de prueba...')
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

    console.log('🎉 ¡Prueba simple completada exitosamente!')
    console.log('✅ La inserción simple funciona, el problema está en age_ranges')

  } catch (error) {
    console.error('❌ Error general:', error.message)
    console.error(error.stack)
  }
}

// Ejecutar la prueba
testSimpleInsert()

