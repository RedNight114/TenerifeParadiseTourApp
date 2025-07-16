require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testUserPermissions() {
  console.log('🔍 Verificando permisos del usuario...')

  try {
    // 1. Login del usuario
    const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'brian12guargacho@gmail.com',
      password: 'brian123456'
    })

    if (loginError) {
      console.error('❌ Error en login:', loginError)
      return
    }

    console.log('✅ Login exitoso:', user.email)

    // 2. Verificar el perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('❌ Error obteniendo perfil:', profileError)
      return
    }

    console.log('✅ Perfil obtenido:', {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      full_name: profile.full_name
    })

    // 3. Verificar si el usuario puede ver sus propias reservas
    const { data: existingReservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', user.id)

    if (reservationsError) {
      console.error('❌ Error obteniendo reservas existentes:', reservationsError)
      return
    }

    console.log(`✅ Reservas existentes: ${existingReservations.length}`)

    // 4. Intentar crear una reserva directamente
    const testReservation = {
      user_id: user.id,
      service_id: '9d2efab6-8323-4374-94a5-c7dbbd297630', // Tour Completo de la Isla
      reservation_date: '2025-07-18',
      reservation_time: '11:00',
      guests: 1,
      total_amount: 55,
      status: 'pendiente',
      payment_status: 'pendiente',
      special_requests: null,
      contact_name: 'Brian Afonso',
      contact_email: 'brian12guargacho@gmail.com',
      contact_phone: '603850402'
    }

    console.log('📤 Intentando crear reserva directamente en Supabase...')
    console.log('Datos:', JSON.stringify(testReservation, null, 2))

    const { data: newReservation, error: insertError } = await supabase
      .from('reservations')
      .insert([testReservation])
      .select()
      .single()

    if (insertError) {
      console.error('❌ Error al crear reserva directamente:', insertError)
      console.error('Código de error:', insertError.code)
      console.error('Mensaje:', insertError.message)
      console.error('Detalles:', insertError.details)
      console.error('Hint:', insertError.hint)
      return
    }

    console.log('✅ Reserva creada exitosamente:', newReservation.id)

    // 5. Limpiar - eliminar la reserva de prueba
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
    console.error('❌ Error general:', error)
  }
}

testUserPermissions() 