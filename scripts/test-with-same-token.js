require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Usuario de prueba
const testEmail = 'testuser@tenerifeparadise.com'
const testPassword = 'test123456'

async function testWithSameToken() {
  console.log('🔍 Probando con el mismo token que usa la API...')

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

    // 2. Obtener token de sesión (igual que en la API)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      console.error('❌ No se pudo obtener el token de sesión')
      return
    }

    console.log('✅ Token obtenido:', session.access_token.substring(0, 20) + '...')

    // 3. Verificar que el token es válido usando la misma función que la API
    const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(session.access_token)
    
    if (tokenError || !tokenUser) {
      console.error('❌ Error verificando token:', tokenError?.message)
      return
    }

    console.log('✅ Token válido para usuario:', tokenUser.email)

    // 4. Preparar datos de reserva
    const reservationData = {
      user_id: user.id,
      service_id: '9d2efab6-8323-4374-94a5-c7dbbd297630',
      reservation_date: '2025-07-17',
      reservation_time: '10:00',
      guests: 2,
      total_amount: 110,
      status: 'pendiente',
      payment_status: 'pendiente',
      special_requests: null,
      contact_name: 'Usuario de Prueba',
      contact_email: testEmail,
      contact_phone: '600000000'
    }

    console.log('📤 Enviando datos a la API con el mismo token...')
    console.log('Datos:', JSON.stringify(reservationData, null, 2))

    // 5. Llamar a la API con el mismo token
    const response = await fetch('http://localhost:3000/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(reservationData)
    })

    const body = await response.json().catch(() => ({}))
    console.log('\n📥 Respuesta de la API:')
    console.log('Status:', response.status, response.statusText)
    console.log('Body:', body)

    if (!response.ok) {
      console.error('❌ Error en la API')
      return
    }

    console.log('✅ Reserva creada correctamente')

  } catch (error) {
    console.error('❌ Error general:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

testWithSameToken() 