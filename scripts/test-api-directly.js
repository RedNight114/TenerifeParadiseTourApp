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

async function main() {
  console.log('🧪 Probando API directamente...')

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

  // 2. Servicio de prueba
  const serviceId = '9d2efab6-8323-4374-94a5-c7dbbd297630' // Tour Completo de la Isla
  const serviceTitle = 'Tour Completo de la Isla'
  const servicePrice = 55
  console.log('✅ Servicio:', serviceTitle, 'Precio:', servicePrice)

  // 3. Preparar datos de reserva
  const reservationData = {
    user_id: testUserId,
    service_id: serviceId,
    reservation_date: '2025-07-17',
    reservation_time: '10:00',
    guests: 2,
    total_amount: servicePrice * 2,
    status: 'pendiente',
    payment_status: 'pendiente',
    special_requests: null,
    contact_name: 'Usuario de Prueba',
    contact_email: testEmail,
    contact_phone: '600000000'
  }

  console.log('📤 Enviando datos a la API:')
  console.log(JSON.stringify(reservationData, null, 2))

  // 4. Obtener token de sesión
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) {
    console.error('❌ No se pudo obtener el token de sesión')
    return
  }

  // 5. Llamar a la API de reservas
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
}

main() 