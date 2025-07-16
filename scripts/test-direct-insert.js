require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Usuario de prueba
const testEmail = 'testuser@tenerifeparadise.com'
const testPassword = 'test123456'
const testUserId = '65708f29-bd45-43fc-a10c-4bd2e1a7ee57'

async function testDirectInsert() {
  console.log('🧪 Probando inserción directa en Supabase...')

  try {
    // 1. Login
    const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })

    if (loginError) {
      console.error('❌ Error en login:', loginError.message)
      return
    }
    console.log('✅ Login exitoso:', user.email)

    // 2. Verificar que el usuario puede ver sus propias reservas
    const { data: existingReservations, error: selectError } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', user.id)

    if (selectError) {
      console.error('❌ Error consultando reservas existentes:', selectError)
      return
    }
    console.log(`✅ Consulta exitosa. Reservas existentes: ${existingReservations.length}`)

    // 3. Intentar crear una reserva directamente
    const reservationData = {
      user_id: user.id, // Usar el ID del usuario logueado
      service_id: '9d2efab6-8323-4374-94a5-c7dbbd297630',
      reservation_date: '2025-07-19',
      reservation_time: '14:00',
      guests: 1,
      total_amount: 55,
      status: 'pendiente',
      payment_status: 'pendiente',
      special_requests: null,
      contact_name: 'Usuario de Prueba',
      contact_email: testEmail,
      contact_phone: '600000000'
    }

    console.log('📤 Intentando crear reserva directamente...')
    console.log('Datos:', JSON.stringify(reservationData, null, 2))

    const { data: newReservation, error: insertError } = await supabase
      .from('reservations')
      .insert([reservationData])
      .select()
      .single()

    if (insertError) {
      console.error('❌ Error al crear reserva directamente:', insertError)
      console.error('Código:', insertError.code)
      console.error('Mensaje:', insertError.message)
      console.error('Detalles:', insertError.details)
      return
    }

    console.log('✅ Reserva creada exitosamente:', newReservation.id)

    // 4. Limpiar - eliminar la reserva de prueba
    const { error: deleteError } = await supabase
      .from('reservations')
      .delete()
      .eq('id', newReservation.id)

    if (deleteError) {
      console.error('⚠️ Error al eliminar reserva de prueba:', deleteError)
    } else {
      console.log('✅ Reserva de prueba eliminada')
    }

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

testDirectInsert() 