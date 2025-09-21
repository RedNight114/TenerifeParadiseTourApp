const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase (usar variables de entorno)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const sampleNotifications = [
  {
    title: 'Bienvenido al Panel de Administración',
    message: 'El sistema de notificaciones está ahora activo. Recibirás notificaciones sobre nuevas reservas, pagos y eventos importantes.',
    type: 'system',
    data: { welcome: true },
    read: false
  },
  {
    title: 'Sistema de Configuración Disponible',
    message: 'Puedes configurar el sistema desde el icono de configuración en la barra superior.',
    type: 'info',
    data: { feature: 'settings' },
    read: false
  },
  {
    title: 'Notificaciones en Tiempo Real',
    message: 'Las notificaciones se actualizan automáticamente cada 30 segundos.',
    type: 'info',
    data: { feature: 'notifications' },
    read: true
  }
]

async function createSampleNotifications() {
  console.log('🚀 Creando notificaciones de ejemplo...')

  try {
    // Verificar si la tabla existe
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'notifications')

    if (tablesError || !tables || tables.length === 0) {
      console.error('❌ La tabla notifications no existe. Ejecuta primero la migración SQL.')
      process.exit(1)
    }

    // Obtener usuarios administradores
    const { data: adminProfiles, error: adminError } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['admin', 'staff'])

    if (adminError) {
      console.error('❌ Error obteniendo usuarios admin:', adminError)
      process.exit(1)
    }

    if (!adminProfiles || adminProfiles.length === 0) {
      console.log('⚠️  No se encontraron usuarios administradores. Creando notificaciones sin usuario específico.')
      
      // Crear notificaciones sin user_id (para todos los admins)
      const { data, error } = await supabase
        .from('notifications')
        .insert(sampleNotifications)

      if (error) {
        console.error('❌ Error insertando notificaciones:', error)
        process.exit(1)
      }

      console.log('✅ Notificaciones de ejemplo creadas correctamente')
      console.log(`📊 Se crearon ${sampleNotifications.length} notificaciones`)
      return
    }

    // Crear notificaciones para cada admin
    const notificationsToInsert = []
    
    adminProfiles.forEach(admin => {
      sampleNotifications.forEach(notification => {
        notificationsToInsert.push({
          ...notification,
          user_id: admin.id
        })
      })
    })

    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationsToInsert)

    if (error) {
      console.error('❌ Error insertando notificaciones:', error)
      process.exit(1)
    }

    console.log('✅ Notificaciones de ejemplo creadas correctamente')
    console.log(`📊 Se crearon ${notificationsToInsert.length} notificaciones para ${adminProfiles.length} administradores`)

    // Mostrar resumen
    console.log('\n📋 Tipos de notificaciones creadas:')
    const types = [...new Set(sampleNotifications.map(n => n.type))]
    types.forEach(type => {
      const count = sampleNotifications.filter(n => n.type === type).length
      console.log(`   • ${type}: ${count} notificaciones`)
    })

  } catch (error) {
    console.error('❌ Error general:', error)
    process.exit(1)
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createSampleNotifications()
}

module.exports = { createSampleNotifications, sampleNotifications }
