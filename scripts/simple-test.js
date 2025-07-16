require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function simpleTest() {
  console.log('🧪 Prueba simple de inserción...\n')

  try {
    // 1. Login
    const { data: { user } } = await supabase.auth.signInWithPassword({
      email: 'brian12guargacho@gmail.com',
      password: 'Claudia1712'
    })

    console.log('✅ Login exitoso:', user.email)

    // 2. Obtener servicio
    const { data: services } = await supabase
      .from('services')
      .select('*')
      .eq('available', true)
      .limit(1)

    const service = services[0]
    console.log('✅ Servicio:', service.title)

    // 3. Insertar reserva
    console.log('\n📝 Insertando reserva...')
    
    const reservationData = {
      user_id: user.id,
      service_id: service.id,
      reservation_date: '2025-07-17',
      reservation_time: '14:00',
      guests: 4,
      total_amount: service.price * 4,
      status: 'pendiente',
      payment_status: 'pendiente',
      special_requests: 'Prueba simple',
      contact_name: 'Brian Afonso',
      contact_email: user.email,
      contact_phone: '600000000'
    }

    console.log('Datos:', JSON.stringify(reservationData, null, 2))

    const { data, error } = await supabase
      .from('reservations')
      .insert([reservationData])
      .select()
      .single()

    if (error) {
      console.error('❌ Error:', error)
      console.error('Código:', error.code)
      console.error('Mensaje:', error.message)
      console.error('Detalles:', error.details)
      return
    }

    console.log('✅ Reserva creada:', data.id)

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

simpleTest() 