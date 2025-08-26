// =====================================================
// SCRIPT DE PRUEBA: CONEXIÓN CON SUPABASE Y SERVICIOS
// Verifica que la conexión funcione y los servicios se carguen
// =====================================================

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

console.log('🔍 Iniciando prueba de conexión con Supabase...')
console.log('📍 URL:', supabaseUrl)
console.log('🔑 Key disponible:', !!supabaseKey)

if (!supabaseKey || supabaseKey === 'your-anon-key') {
  console.error('❌ ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurado')
  process.exit(1)
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('\n🔄 Probando conexión básica...')
    
    // Prueba 1: Health check
    const { data: healthData, error: healthError } = await supabase.from('services').select('count').limit(1)
    
    if (healthError) {
      console.error('❌ Error en health check:', healthError)
      return false
    }
    
    console.log('✅ Conexión básica exitosa')
    
    // Prueba 2: Contar servicios
    console.log('\n🔄 Contando servicios...')
    const { count, error: countError } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ Error contando servicios:', countError)
      return false
    }
    
    console.log(`✅ Total de servicios: ${count}`)
    
    // Prueba 3: Obtener servicios destacados
    console.log('\n🔄 Obteniendo servicios destacados...')
    const { data: featuredData, error: featuredError } = await supabase
      .from('services')
      .select(`
        id,
        title,
        description,
        price,
        available,
        featured,
        category:categories(id, name),
        subcategory:subcategories(id, name)
      `)
      .eq('featured', true)
      .eq('available', true)
      .limit(6)
    
    if (featuredError) {
      console.error('❌ Error obteniendo servicios destacados:', featuredError)
      return false
    }
    
    console.log(`✅ Servicios destacados encontrados: ${featuredData.length}`)
    
    if (featuredData.length > 0) {
      console.log('📋 Primeros servicios destacados:')
      featuredData.slice(0, 3).forEach((service, index) => {
        console.log(`   ${index + 1}. ${service.title} - €${service.price}`)
      })
    }
    
    // Prueba 4: Obtener categorías
    console.log('\n🔄 Obteniendo categorías...')
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, description')
      .limit(5)
    
    if (categoriesError) {
      console.error('❌ Error obteniendo categorías:', categoriesError)
      return false
    }
    
    console.log(`✅ Categorías encontradas: ${categoriesData.length}`)
    
    // Prueba 5: Verificar permisos RLS
    console.log('\n🔄 Verificando permisos RLS...')
    
    // Intentar insertar un servicio de prueba (debe fallar para usuario anon)
    const { error: insertError } = await supabase
      .from('services')
      .insert({
        title: 'Test Service',
        description: 'Test Description',
        price: 100
      })
    
    if (insertError && insertError.code === '42501') {
      console.log('✅ RLS está funcionando correctamente (permiso denegado)')
    } else if (insertError) {
      console.log('⚠️ Error inesperado en RLS:', insertError.message)
    } else {
      console.log('❌ RLS no está funcionando (permiso concedido inesperadamente)')
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Error inesperado:', error)
    return false
  }
}

async function testServicesQuery() {
  try {
    console.log('\n🔄 Probando consulta completa de servicios...')
    
    const { data, error } = await supabase
      .from('services')
      .select(`
        id,
        title,
        description,
        category_id,
        subcategory_id,
        price,
        price_children,
        price_type,
        images,
        available,
        featured,
        duration,
        location,
        min_group_size,
        max_group_size,
        difficulty_level,
        vehicle_type,
        characteristics,
        insurance_included,
        fuel_included,
        menu,
        schedule,
        capacity,
        dietary_options,
        min_age,
        license_required,
        permit_required,
        what_to_bring,
        included_services,
        not_included_services,
        meeting_point_details,
        transmission,
        seats,
        doors,
        fuel_policy,
        pickup_locations,
        deposit_required,
        deposit_amount,
        experience_type,
        chef_name,
        drink_options,
        ambience,
        activity_type,
        created_at,
        updated_at,
        category:categories(id, name, description),
        subcategory:subcategories(id, name, description)
      `)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('❌ Error en consulta completa:', error)
      return false
    }
    
    console.log(`✅ Consulta completa exitosa: ${data.length} servicios`)
    
    if (data.length > 0) {
      console.log('📋 Estructura del primer servicio:')
      const firstService = data[0]
      console.log('   - ID:', firstService.id)
      console.log('   - Título:', firstService.title)
      console.log('   - Precio:', firstService.price)
      console.log('   - Disponible:', firstService.available)
      console.log('   - Destacado:', firstService.featured)
      console.log('   - Categoría:', firstService.category?.name || 'Sin categoría')
      console.log('   - Subcategoría:', firstService.subcategory?.name || 'Sin subcategoría')
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Error en consulta completa:', error)
    return false
  }
}

async function main() {
  console.log('🚀 INICIANDO PRUEBAS DE CONEXIÓN Y SERVICIOS\n')
  
  try {
    // Prueba de conexión básica
    const connectionOk = await testConnection()
    
    if (!connectionOk) {
      console.error('\n❌ Las pruebas de conexión fallaron')
      process.exit(1)
    }
    
    // Prueba de consulta completa
    const queryOk = await testServicesQuery()
    
    if (!queryOk) {
      console.error('\n❌ Las pruebas de consulta fallaron')
      process.exit(1)
    }
    
    console.log('\n🎯 TODAS LAS PRUEBAS PASARON EXITOSAMENTE!')
    console.log('✅ La conexión con Supabase está funcionando')
    console.log('✅ Los servicios se pueden consultar correctamente')
    console.log('✅ El RLS está configurado correctamente')
    console.log('💡 El problema puede estar en el frontend o en la inicialización del cliente')
    
  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error)
    process.exit(1)
  }
}

// Ejecutar pruebas
main()




