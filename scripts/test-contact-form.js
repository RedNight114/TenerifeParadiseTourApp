require('dotenv').config({ path: '.env.local' })

async function testContactForm() {
  console.log('🧪 Probando formulario de contacto...')
  
  try {
    // Simular envío de formulario de contacto
    const formData = {
      name: "Juan Pérez",
      email: "juan.perez@test.com",
      phone: "+34 612 345 678",
      service: "Alquiler de Coche",
      date: "2024-02-20",
      guests: 2,
      message: "Hola, necesito alquilar un coche para el 20 de febrero. Somos 2 personas.",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      timestamp: new Date().toISOString()
    }
    
    console.log('📤 Enviando datos de prueba:')
    console.log(JSON.stringify(formData, null, 2))
    
    // Hacer petición POST al endpoint de contacto
    const response = await fetch('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })
    
    const result = await response.json()
    
    console.log('\n📥 Respuesta del servidor:')
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(result, null, 2))
    
    if (response.ok) {
      console.log('✅ Formulario enviado correctamente')
      
      // Verificar que se guardó en la base de datos
      console.log('\n🔍 Verificando datos en la base de datos...')
      await new Promise(resolve => setTimeout(resolve, 1000)) // Esperar 1 segundo
      
      const { createClient } = require('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
      
      const { data: messages, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (error) {
        console.error('❌ Error al obtener mensajes:', error)
      } else {
        console.log(`✅ ${messages.length} mensajes encontrados en la base de datos:`)
        messages.forEach((msg, index) => {
          console.log(`\n--- Mensaje ${index + 1} ---`)
          console.log('ID:', msg.id)
          console.log('Nombre:', msg.name, typeof msg.name)
          console.log('Email:', msg.email, typeof msg.email)
          console.log('Teléfono:', msg.phone, typeof msg.phone)
          console.log('Servicio:', msg.service, typeof msg.service)
          console.log('Fecha:', msg.date, typeof msg.date)
          console.log('Personas:', msg.guests, typeof msg.guests)
          console.log('Estado:', msg.status, typeof msg.status)
          console.log('Mensaje:', msg.message ? msg.message.substring(0, 100) + '...' : 'null', typeof msg.message)
          
          // Verificar problemas específicos
          if (msg.guests && isNaN(msg.guests)) {
            console.log('⚠️  PROBLEMA: guests es NaN')
          }
          if (msg.service && msg.service === 'renting') {
            console.log('⚠️  PROBLEMA: service es "renting"')
          }
        })
      }
    } else {
      console.log('❌ Error al enviar formulario')
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  }
}

// Ejecutar la prueba
testContactForm() 