require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testReservationFlow() {
  console.log('🧪 Probando flujo completo de reserva...\n')

  try {
    // 1. Crear o iniciar sesión con un usuario de prueba
    console.log('1️⃣ Creando/iniciando sesión con usuario de prueba...')
    
    const testEmail = 'brian12guargacho@gmail.com'
    const testPassword = 'Claudia1712'
    
    // Intentar iniciar sesión primero
    let { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })

    if (signInError) {
      console.log('Usuario no existe, creando nuevo usuario...')
      
      // Crear nuevo usuario
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: 'Usuario de Prueba'
          }
        }
      })

      if (signUpError) {
        console.error('❌ Error al crear usuario:', signUpError.message)
        return
      }

      user = signUpData.user
      console.log('✅ Usuario creado correctamente')
    } else {
      console.log('✅ Sesión iniciada correctamente')
    }

    if (!user) {
      console.error('❌ No se pudo obtener el usuario')
      return
    }

    console.log(`   Usuario: ${user.email}`)
    console.log(`   ID: ${user.id}\n`)

    // 1.5. Verificar y crear perfil si es necesario
    console.log('1.5️⃣ Verificando perfil del usuario...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.log('   Perfil no encontrado, creando...')
      const { data: newProfile, error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || 'Usuario de Prueba',
          role: 'client',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createProfileError) {
        console.error('❌ Error al crear perfil:', createProfileError.message)
        return
      }

      console.log('✅ Perfil creado correctamente')
    } else {
      console.log('✅ Perfil encontrado')
    }

    // 2. Obtener un servicio disponible
    console.log('2️⃣ Obteniendo servicios disponibles...')
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .eq('available', true)
      .limit(1)

    if (servicesError) {
      console.error('❌ Error al obtener servicios:', servicesError.message)
      return
    }

    if (!services || services.length === 0) {
      console.error('❌ No hay servicios disponibles')
      return
    }

    const service = services[0]
    console.log('✅ Servicio encontrado:')
    console.log(`   Título: ${service.title}`)
    console.log(`   Precio: ${service.price}€`)
    console.log(`   ID: ${service.id}\n`)

    // 3. Crear una reserva
    console.log('3️⃣ Creando reserva...')
    
    // Obtener el token de sesión
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      console.error('❌ No hay token de sesión')
      return
    }

    console.log('   Token de sesión obtenido correctamente')
    console.log('   Preparando datos de reserva...')

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
      contact_phone: '600000000'
    }

    console.log('   Datos de reserva preparados:')
    console.log(`   - User ID: ${reservationData.user_id}`)
    console.log(`   - Service ID: ${reservationData.service_id}`)
    console.log(`   - Total: ${reservationData.total_amount}€`)
    console.log('   Enviando petición a /api/reservations...')

    try {
      const reservationResponse = await fetch('http://localhost:3000/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(reservationData)
      })

      console.log(`   Respuesta recibida: ${reservationResponse.status} ${reservationResponse.statusText}`)

      if (!reservationResponse.ok) {
        const errorData = await reservationResponse.json()
        console.error('❌ Error al crear reserva:', errorData)
        return
      }

      const reservation = await reservationResponse.json()
      console.log('✅ Reserva creada correctamente:')
      console.log(`   ID: ${reservation.id}`)
      console.log(`   Total: ${reservation.total_amount}€`)
      console.log(`   Estado: ${reservation.status}\n`)

      // 4. Crear pago
      console.log('4️⃣ Creando pago...')
      const paymentData = {
        reservationId: reservation.id,
        amount: reservation.total_amount,
        description: `Reserva: ${service.title}`
      }

      console.log('   Enviando petición a /api/payment/create...')

      const paymentResponse = await fetch('http://localhost:3000/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(paymentData)
      })

      console.log(`   Respuesta de pago recibida: ${paymentResponse.status} ${paymentResponse.statusText}`)

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json()
        console.error('❌ Error al crear pago:', errorData)
        return
      }

      const payment = await paymentResponse.json()
      console.log('✅ Pago creado correctamente:')
      console.log(`   URL Redsys: ${payment.redsysUrl}`)
      console.log(`   Datos del formulario:`, Object.keys(payment.formData))

      // 5. Verificar que la reserva existe
      console.log('\n5️⃣ Verificando reserva en base de datos...')
      const { data: verifyReservation, error: verifyError } = await supabase
        .from('reservations')
        .select('*')
        .eq('id', reservation.id)
        .single()

      if (verifyError) {
        console.error('❌ Error al verificar reserva:', verifyError.message)
        return
      }

      console.log('✅ Reserva verificada en base de datos:')
      console.log(`   Estado: ${verifyReservation.status}`)
      console.log(`   Pago: ${verifyReservation.payment_status}`)
      console.log(`   Fecha: ${verifyReservation.reservation_date}`)

      console.log('\n🎉 ¡Flujo de reserva completado exitosamente!')
      console.log('\n📋 Resumen:')
      console.log(`   - Usuario autenticado: ${user.email}`)
      console.log(`   - Servicio: ${service.title}`)
      console.log(`   - Reserva ID: ${reservation.id}`)
      console.log(`   - Total: ${reservation.total_amount}€`)
      console.log(`   - URL de pago: ${payment.redsysUrl}`)

    } catch (fetchError) {
      console.error('❌ Error en petición HTTP:', fetchError.message)
      console.error('   Detalles:', fetchError)
      return
    }

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

// Ejecutar la prueba
testReservationFlow() 