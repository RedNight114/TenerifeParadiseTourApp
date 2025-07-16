require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function debugReservation() {
  console.log('🔍 Debuggeando inserción de reserva...\n')

  try {
    // 1. Iniciar sesión
    console.log('1️⃣ Iniciando sesión...')
    const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'brian12guargacho@gmail.com',
      password: 'Claudia1712'
    })

    if (signInError) {
      console.error('❌ Error al iniciar sesión:', signInError.message)
      return
    }

    console.log('✅ Sesión iniciada:', user.email)

    // 2. Obtener servicio
    console.log('\n2️⃣ Obteniendo servicio...')
    const { data: services } = await supabase
      .from('services')
      .select('*')
      .eq('available', true)
      .limit(1)

    const service = services[0]
    console.log('✅ Servicio:', service.title)

    // 3. Probar inserción directa
    console.log('\n3️⃣ Probando inserción directa en Supabase...')
    
    const reservationData = {
      user_id: user.id,
      service_id: service.id,
      reservation_date: '2025-07-17',
      reservation_time: '14:00',
      guests: 4,
      total_amount: service.price * 4,
      status: 'pendiente',
      payment_status: 'pendiente',
      special_requests: 'Prueba de reserva',
      contact_name: 'Usuario de Prueba',
      contact_email: user.email,
      contact_phone: '600000000',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Datos a insertar:')
    console.log(JSON.stringify(reservationData, null, 2))

    const { data, error } = await supabase
      .from('reservations')
      .insert([reservationData])
      .select()
      .single()

    if (error) {
      console.error('❌ Error en inserción directa:')
      console.error('Código:', error.code)
      console.error('Mensaje:', error.message)
      console.error('Detalles:', error.details)
      console.error('Hint:', error.hint)
      return
    }

    console.log('✅ Inserción exitosa:')
    console.log('ID:', data.id)
    console.log('Estado:', data.status)

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

debugReservation() 