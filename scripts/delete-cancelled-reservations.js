const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno necesarias')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function deleteCancelledReservations(serviceId) {
  console.log(`🗑️ Eliminando reservas canceladas para el servicio: ${serviceId}`)
  console.log('=' .repeat(60))

  try {
    // 1. Verificar si el servicio existe
    console.log('\n1️⃣ Verificando si el servicio existe...')
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, title')
      .eq('id', serviceId)
      .single()

    if (serviceError) {
      console.error('❌ Error al obtener el servicio:', serviceError)
      return
    }

    console.log('✅ Servicio encontrado:', service.title)

    // 2. Buscar reservas canceladas
    console.log('\n2️⃣ Buscando reservas canceladas...')
    const { data: cancelledReservations, error: reservationsError } = await supabase
      .from('reservations')
      .select(`
        id,
        service_id,
        user_id,
        status,
        created_at,
        profiles!inner(email, full_name)
      `)
      .eq('service_id', serviceId)
      .eq('status', 'cancelled')

    if (reservationsError) {
      console.error('❌ Error al obtener reservas canceladas:', reservationsError)
      return
    }

    console.log(`📊 Encontradas ${cancelledReservations.length} reservas canceladas`)

    if (cancelledReservations.length === 0) {
      console.log('✅ No hay reservas canceladas para eliminar')
      return
    }

    // 3. Mostrar reservas que se van a eliminar
    console.log('\n3️⃣ Reservas canceladas que se eliminarán:')
    console.log('─'.repeat(80))
    console.log('ID Reserva | Usuario | Fecha Creación')
    console.log('─'.repeat(80))

    cancelledReservations.forEach((reservation) => {
      const createdAt = new Date(reservation.created_at).toLocaleDateString('es-ES')
      const userEmail = reservation.profiles?.email || 'sin email'
      
      console.log(`${reservation.id.slice(0, 8)}... | ${userEmail} | ${createdAt}`)
    })

    // 4. Confirmar eliminación
    console.log('\n4️⃣ Confirmación:')
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const answer = await new Promise((resolve) => {
      rl.question(`¿Estás seguro de que quieres eliminar ${cancelledReservations.length} reservas canceladas? (s/N): `, resolve)
    })
    rl.close()

    if (answer.toLowerCase() !== 's' && answer.toLowerCase() !== 'si' && answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('❌ Operación cancelada')
      return
    }

    // 5. Eliminar reservas canceladas
    console.log('\n5️⃣ Eliminando reservas canceladas...')
    const reservationIds = cancelledReservations.map(r => r.id)
    
    const { error: deleteError } = await supabase
      .from('reservations')
      .delete()
      .in('id', reservationIds)

    if (deleteError) {
      console.error('❌ Error al eliminar reservas:', deleteError)
      return
    }

    console.log(`✅ ${cancelledReservations.length} reservas canceladas eliminadas exitosamente`)

    // 6. Verificar si ahora se puede eliminar el servicio
    console.log('\n6️⃣ Verificando si se puede eliminar el servicio...')
    const { data: remainingReservations, error: remainingError } = await supabase
      .from('reservations')
      .select('id, status')
      .eq('service_id', serviceId)

    if (remainingError) {
      console.error('❌ Error al verificar reservas restantes:', remainingError)
      return
    }

    if (remainingReservations.length === 0) {
      console.log('✅ No quedan reservas asociadas. El servicio se puede eliminar ahora.')
    } else {
      console.log(`⚠️ Aún quedan ${remainingReservations.length} reservas con otros estados:`)
      const statusCount = {}
      remainingReservations.forEach(reservation => {
        const status = reservation.status || 'sin estado'
        statusCount[status] = (statusCount[status] || 0) + 1
      })
      
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`   ${status}: ${count} reservas`)
      })
    }

  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Obtener el service_id de los argumentos de línea de comandos
const serviceId = process.argv[2]

if (!serviceId) {
  console.error('❌ Debes proporcionar un service_id')
  console.log('Uso: node scripts/delete-cancelled-reservations.js <service_id>')
  console.log('Ejemplo: node scripts/delete-cancelled-reservations.js 123e4567-e89b-12d3-a456-426614174000')
  process.exit(1)
}

deleteCancelledReservations(serviceId) 