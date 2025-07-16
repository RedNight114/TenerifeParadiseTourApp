require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Usuario de prueba
const testEmail = 'testuser@tenerifeparadise.com'
const testPassword = 'test123456'

async function debugApiLogic() {
  console.log('🔍 Debuggeando lógica de la API...')

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

    // 2. Simular datos que llegan a la API
    const body = {
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

    console.log('📤 Datos recibidos en la API:', JSON.stringify(body, null, 2))

    // 3. Verificar que el usuario solo puede crear reservas para sí mismo
    if (body.user_id !== user.id) {
      console.error('❌ Usuario intentando crear reserva para otro usuario')
      return
    }
    console.log('✅ Verificación de usuario correcta')

    // 4. Simular sanitización (función simple)
    function sanitizeString(input) {
      if (typeof input !== 'string') return input
      return input
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim()
    }

    function sanitizeObject(obj) {
      const sanitized = {}
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          sanitized[key] = sanitizeString(value)
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = sanitizeObject(value)
        } else {
          sanitized[key] = value
        }
      }
      return sanitized
    }

    console.log('📤 Datos antes de sanitizar:', JSON.stringify(body, null, 2))
    const sanitizedData = sanitizeObject(body)
    console.log('📤 Datos después de sanitizar:', JSON.stringify(sanitizedData, null, 2))

    // 5. Intentar crear la reserva
    console.log('📤 Creando reserva con datos sanitizados...')
    
    const { data, error } = await supabase
      .from("reservations")
      .insert([
        {
          user_id: sanitizedData.user_id,
          service_id: sanitizedData.service_id,
          reservation_date: sanitizedData.reservation_date,
          reservation_time: sanitizedData.reservation_time,
          guests: sanitizedData.guests,
          total_amount: sanitizedData.total_amount,
          status: sanitizedData.status,
          payment_status: sanitizedData.payment_status,
          special_requests: sanitizedData.special_requests,
          contact_name: sanitizedData.contact_name,
          contact_email: sanitizedData.contact_email,
          contact_phone: sanitizedData.contact_phone,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('❌ Error al crear la reserva en Supabase:', error)
      console.error('Código de error:', error.code)
      console.error('Mensaje de error:', error.message)
      console.error('Detalles de error:', error.details)
      return
    }

    console.log('✅ Reserva creada exitosamente:', data.id)

    // 6. Limpiar
    const { error: deleteError } = await supabase
      .from('reservations')
      .delete()
      .eq('id', data.id)

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

debugApiLogic() 