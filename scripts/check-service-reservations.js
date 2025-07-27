const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno necesarias')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkServiceReservations(serviceId) {
  console.log(`🔍 Verificando reservas para el servicio: ${serviceId}`)
  console.log('=' .repeat(60))

  try {
    // 1. Verificar si el servicio existe
    console.log('\n1️⃣ Verificando si el servicio existe...')
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, title, description')
      .eq('id', serviceId)
      .single()

    if (serviceError) {
      console.error('❌ Error al obtener el servicio:', serviceError)
      return
    }

    console.log('✅ Servicio encontrado:', service.title)

    // 2. Buscar todas las reservas asociadas
    console.log('\n2️⃣ Buscando reservas asociadas...')
    const { data: reservations, error: reservationsError } = await supabase
      .from('reservations')
      .select(`
        id,
        service_id,
        user_id,
        status,
        created_at,
        updated_at,
        profiles!inner(email, full_name)
      `)
      .eq('service_id', serviceId)

    if (reservationsError) {
      console.error('❌ Error al obtener reservas:', reservationsError)
      return
    }

    console.log(`📊 Encontradas ${reservations.length} reservas asociadas`)

    if (reservations.length === 0) {
      console.log('✅ No hay reservas asociadas. El servicio se puede eliminar.')
      return
    }

    // 3. Mostrar detalles de cada reserva
    console.log('\n3️⃣ Detalles de las reservas:')
    console.log('─'.repeat(80))
    console.log('ID Reserva | Usuario | Estado | Fecha Creación | Fecha Actualización')
    console.log('─'.repeat(80))

    reservations.forEach((reservation, index) => {
      const status = reservation.status || 'sin estado'
      const createdAt = new Date(reservation.created_at).toLocaleDateString('es-ES')
      const updatedAt = new Date(reservation.updated_at).toLocaleDateString('es-ES')
      const userEmail = reservation.profiles?.email || 'sin email'
      
      console.log(`${reservation.id.slice(0, 8)}... | ${userEmail} | ${status} | ${createdAt} | ${updatedAt}`)
    })

    // 4. Contar por estado
    console.log('\n4️⃣ Resumen por estado:')
    const statusCount = {}
    reservations.forEach(reservation => {
      const status = reservation.status || 'sin estado'
      statusCount[status] = (statusCount[status] || 0) + 1
    })

    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} reservas`)
    })

    // 5. Verificar si todas están canceladas
    const allCancelled = reservations.every(r => r.status === 'cancelled')
    const hasActiveReservations = reservations.some(r => r.status === 'confirmed' || r.status === 'pending')

    console.log('\n5️⃣ Análisis de eliminación:')
    if (allCancelled) {
      console.log('✅ Todas las reservas están canceladas')
      console.log('⚠️ Pero aún así no se puede eliminar por restricciones de clave foránea')
    } else if (hasActiveReservations) {
      console.log('❌ Hay reservas activas (confirmadas o pendientes)')
      console.log('⚠️ No se puede eliminar el servicio')
    } else {
      console.log('⚠️ Hay reservas con otros estados')
    }

    // 6. Opciones de solución
    console.log('\n6️⃣ Opciones de solución:')
    console.log('📋 Opción 1: Eliminar manualmente las reservas canceladas')
    console.log('📋 Opción 2: Cambiar el estado de las reservas a "deleted"')
    console.log('📋 Opción 3: Modificar la política de eliminación en cascada')
    console.log('📋 Opción 4: Usar soft delete (marcar como eliminado en lugar de eliminar)')

  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Obtener el service_id de los argumentos de línea de comandos
const serviceId = process.argv[2]

if (!serviceId) {
  console.error('❌ Debes proporcionar un service_id')
  console.log('Uso: node scripts/check-service-reservations.js <service_id>')
  console.log('Ejemplo: node scripts/check-service-reservations.js 123e4567-e89b-12d3-a456-426614174000')
  process.exit(1)
}

checkServiceReservations(serviceId) 