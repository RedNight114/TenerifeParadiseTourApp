require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Usuario de prueba
const testEmail = 'testuser@tenerifeparadise.com'
const testPassword = 'test123456'

async function testFrontendFlow() {
  console.log('🧪 Probando flujo completo del frontend...')

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

    // 3. Simular datos del formulario del frontend
    const reservationData = {
      user_id: user.id,
      service_id: '9d2efab6-8323-4374-94a5-c7dbbd297630', // Tour Completo de la Isla
      reservation_date: '2025-07-21',
      reservation_time: '16:00',
      guests: 2,
      total_amount: 110, // 55 * 2
      status: 'pendiente',
      payment_status: 'pendiente',
      special_requests: null,
      contact_name: 'Usuario de Prueba',
      contact_email: testEmail,
      contact_phone: '600000000'
    }

    console.log('📤 Paso 1: Creando reserva...')
    console.log('Datos de reserva:', JSON.stringify(reservationData, null, 2))

    const reservationResponse = await fetch('http://localhost:3000/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(reservationData)
    })

    if (!reservationResponse.ok) {
      const errorText = await reservationResponse.text()
      console.error('❌ Error creando reserva:', errorText)
      return
    }

    const reservation = await reservationResponse.json()
    console.log('✅ Reserva creada:', reservation.id)

    // 4. Simular creación de pago (como hace el frontend)
    const paymentData = {
      reservationId: reservation.id,
      amount: 110,
      description: 'Reserva: Tour Completo de la Isla'
    }

    console.log('📤 Paso 2: Creando pago...')
    console.log('Datos de pago:', JSON.stringify(paymentData, null, 2))

    const paymentResponse = await fetch('http://localhost:3000/api/payment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(paymentData)
    })

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text()
      console.error('❌ Error creando pago:', errorText)
      return
    }

    const paymentResult = await paymentResponse.json()
    console.log('✅ Pago creado exitosamente')
    console.log('Datos de pago recibidos:', paymentResult)

    // 5. Simular redirección a Redsys
    console.log('\n🌐 Simulando redirección a Redsys...')
    console.log('URL de Redsys:', paymentResult.redsysUrl)
    console.log('FormData:')
    Object.entries(paymentResult.formData).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`)
    })

    // 6. Crear formulario HTML (como hace el frontend)
    const formHtml = `
      <form method="POST" action="${paymentResult.redsysUrl}">
        ${Object.entries(paymentResult.formData).map(([key, value]) => 
          `<input type="hidden" name="${key}" value="${value}">`
        ).join('')}
        <button type="submit">Enviar a Redsys</button>
      </form>
    `

    console.log('\n📝 Formulario HTML generado:')
    console.log(formHtml)

    console.log('\n✅ Flujo completo simulado exitosamente')
    console.log('En el navegador, esto redirigiría a:', paymentResult.redsysUrl)

    // 7. Limpiar - eliminar la reserva de prueba
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

testFrontendFlow() 