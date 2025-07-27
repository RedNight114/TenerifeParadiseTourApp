const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno necesarias')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugServiceDeletion() {
  console.log('🔍 Diagnóstico de eliminación de servicios')
  console.log('=' .repeat(50))

  try {
    // 1. Verificar si existe la tabla services
    console.log('\n1️⃣ Verificando tabla services...')
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id, title')
      .limit(5)

    if (servicesError) {
      console.error('❌ Error al acceder a services:', servicesError)
      return
    }

    console.log(`✅ Tabla services accesible. ${services.length} servicios encontrados`)

    // 2. Verificar políticas RLS
    console.log('\n2️⃣ Verificando políticas RLS...')
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { table_name: 'services' })

    if (policiesError) {
      console.log('⚠️ No se pudieron obtener políticas (normal si no existe la función)')
    } else {
      console.log('✅ Políticas RLS:', policies)
    }

    // 3. Verificar permisos del usuario admin
    console.log('\n3️⃣ Verificando permisos de admin...')
    const { data: adminUser, error: adminError } = await supabase
      .from('profiles')
      .select('id, role, email')
      .eq('role', 'admin')
      .limit(1)

    if (adminError) {
      console.error('❌ Error al obtener usuario admin:', adminError)
    } else if (adminUser && adminUser.length > 0) {
      console.log('✅ Usuario admin encontrado:', adminUser[0])
    } else {
      console.log('⚠️ No se encontró usuario admin')
    }

    // 4. Verificar permisos en la tabla permissions
    console.log('\n4️⃣ Verificando permisos de services.delete...')
    const { data: permissions, error: permError } = await supabase
      .from('permissions')
      .select('*')
      .eq('resource', 'services')
      .eq('action', 'delete')

    if (permError) {
      console.error('❌ Error al verificar permisos:', permError)
    } else {
      console.log('✅ Permisos de services.delete:', permissions)
    }

    // 5. Verificar role_permissions
    console.log('\n5️⃣ Verificando role_permissions...')
    const { data: rolePerms, error: rolePermError } = await supabase
      .from('role_permissions')
      .select(`
        role,
        permissions!inner(resource, action)
      `)
      .eq('permissions.resource', 'services')
      .eq('permissions.action', 'delete')

    if (rolePermError) {
      console.error('❌ Error al verificar role_permissions:', rolePermError)
    } else {
      console.log('✅ Role permissions para services.delete:', rolePerms)
    }

    // 6. Probar eliminación con service role (bypass RLS)
    console.log('\n6️⃣ Probando eliminación con service role...')
    if (services && services.length > 0) {
      const testService = services[0]
      console.log(`🧪 Intentando eliminar servicio de prueba: ${testService.title} (ID: ${testService.id})`)
      
      const { error: deleteError } = await supabase
        .from('services')
        .delete()
        .eq('id', testService.id)

      if (deleteError) {
        console.error('❌ Error al eliminar con service role:', deleteError)
      } else {
        console.log('✅ Eliminación exitosa con service role')
        
        // Recrear el servicio para no perder datos
        console.log('🔄 Recreando servicio eliminado...')
        const { error: recreateError } = await supabase
          .from('services')
          .insert([{
            id: testService.id,
            title: testService.title,
            description: 'Servicio recreado para pruebas',
            category_id: '1', // Asumiendo que existe
            price: 50,
            price_type: 'per_person',
            available: true,
            featured: false
          }])

        if (recreateError) {
          console.error('❌ Error al recrear servicio:', recreateError)
        } else {
          console.log('✅ Servicio recreado exitosamente')
        }
      }
    }

    // 7. Verificar función can_access_resource
    console.log('\n7️⃣ Verificando función can_access_resource...')
    const { data: canAccess, error: canAccessError } = await supabase
      .rpc('can_access_resource', { 
        resource_name: 'services', 
        action_name: 'delete' 
      })

    if (canAccessError) {
      console.error('❌ Error al verificar can_access_resource:', canAccessError)
    } else {
      console.log('✅ Resultado de can_access_resource:', canAccess)
    }

    // 8. Recomendaciones
    console.log('\n8️⃣ Recomendaciones:')
    console.log('📋 Si hay errores de permisos:')
    console.log('   1. Ejecutar scripts/24-enhance-roles-permissions.sql')
    console.log('   2. Ejecutar scripts/25-update-rls-with-permissions.sql')
    console.log('   3. Verificar que el usuario tenga rol admin')
    console.log('   4. Verificar que existan los permisos en la tabla permissions')
    console.log('   5. Verificar que existan las relaciones en role_permissions')

  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

debugServiceDeletion() 