require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugContactMessages() {
  console.log('🔍 Debuggeando mensajes de contacto...')
  
  try {
    // 1. Verificar si la tabla existe
    console.log('\n1. Verificando tabla contact_messages...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('contact_messages')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Error al acceder a la tabla:', tableError)
      return
    }
    
    console.log('✅ Tabla contact_messages accesible')
    
    // 2. Obtener todos los mensajes
    console.log('\n2. Obteniendo todos los mensajes...')
    const { data: messages, error: messagesError } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (messagesError) {
      console.error('❌ Error al obtener mensajes:', messagesError)
      return
    }
    
    console.log(`✅ ${messages.length} mensajes encontrados`)
    
    // 3. Analizar cada mensaje
    console.log('\n3. Analizando datos de cada mensaje:')
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
      console.log('Notas admin:', msg.admin_notes, typeof msg.admin_notes)
      console.log('Creado:', msg.created_at, typeof msg.created_at)
      console.log('Actualizado:', msg.updated_at, typeof msg.updated_at)
      
      // Verificar problemas específicos
      if (msg.guests && isNaN(msg.guests)) {
        console.log('⚠️  PROBLEMA: guests es NaN')
      }
      if (msg.service && msg.service === 'renting') {
        console.log('⚠️  PROBLEMA: service es "renting" (debería ser más descriptivo)')
      }
    })
    
    // 4. Verificar estadísticas
    console.log('\n4. Verificando estadísticas...')
    const stats = {
      total: messages.length,
      new: messages.filter(msg => msg.status === 'new').length,
      read: messages.filter(msg => msg.status === 'read').length,
      replied: messages.filter(msg => msg.status === 'replied').length,
      archived: messages.filter(msg => msg.status === 'archived').length,
    }
    
    console.log('Estadísticas:', stats)
    
    // 5. Probar actualización de estado
    if (messages.length > 0) {
      console.log('\n5. Probando actualización de estado...')
      const testMessage = messages[0]
      console.log('Mensaje de prueba:', testMessage.id, 'Estado actual:', testMessage.status)
      
      const { data: updateData, error: updateError } = await supabase
        .from('contact_messages')
        .update({ 
          status: 'read',
          admin_notes: 'Prueba de actualización desde script'
        })
        .eq('id', testMessage.id)
        .select()
      
      if (updateError) {
        console.error('❌ Error al actualizar:', updateError)
      } else {
        console.log('✅ Actualización exitosa:', updateData[0])
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar el debug
debugContactMessages() 