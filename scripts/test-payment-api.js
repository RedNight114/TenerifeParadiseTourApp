require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Usuario de prueba
const testEmail = 'testuser@tenerifeparadise.com'
const testPassword = 'test123456'

async function testPaymentApi() {
  console.log('🧪 Probando API de pago...')

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

    // 2. Obtener token de sesión
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      console.error('❌ No se pudo obtener el token de sesión')
      return
    }

    // 3. Crear una reserva de prueba primero
    const reservationData = {
      user_id: user.id,
      service_id: '9d2efab6-8323-4374-94a5-c7dbbd297630',
      reservation_date: '2025-07-20',
      reservation_time: '15:00',
      guests: 1,
      total_amount: 55,
      status: 'pendiente',
      payment_status: 'pendiente',
      special_requests: null,
      contact_name: 'Usuario de Prueba',
      contact_email: testEmail,
      contact_phone: '600000000'
    }

    console.log('📤 Creando reserva de prueba...')
    const reservationResponse = await fetch('http://localhost:3000/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(reservationData)
    })

    if (!reservationResponse.ok) {
      console.error('❌ Error creando reserva:', await reservationResponse.text())
      return
    }

    const reservation = await reservationResponse.json()
    console.log('✅ Reserva creada:', reservation.id)

    // 4. Probar la API de pago
    const paymentData = {
      reservationId: reservation.id,
      amount: 55,
      description: 'Reserva: Tour Completo de la Isla'
    }

    console.log('📤 Probando API de pago...')
    console.log('Datos:', JSON.stringify(paymentData, null, 2))

    const paymentResponse = await fetch('http://localhost:3000/api/payment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(paymentData)
    })

    const paymentBody = await paymentResponse.json().catch(() => ({}))
    console.log('\n📥 Respuesta de la API de pago:')
    console.log('Status:', paymentResponse.status, paymentResponse.statusText)
    console.log('Body:', paymentBody)

    if (!paymentResponse.ok) {
      console.error('❌ Error en la API de pago')
      return
    }

    console.log('✅ Pago creado correctamente')
    console.log('URL de Redsys:', paymentBody.redsysUrl)
    console.log('Número de pedido:', paymentBody.orderNumber)

    // 5. Limpiar - eliminar la reserva de prueba
    const { error: deleteError } = await supabase
      .from('reservations')
      .delete()
      .eq('id', reservation.id)

    if (deleteError) {
      console.error('⚠️ Error al eliminar reserva de prueba:', deleteError)
    } else {
      console.log('✅ Reserva de prueba eliminada')
    }

  } catch (error) {
    console.error('❌ Error general:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

testPaymentApi() 