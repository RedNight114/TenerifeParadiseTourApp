require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testStatusUpdate() {
  console.log('🧪 Probando actualización de estado...')
  
  try {
    // 1. Obtener mensajes existentes
    const { data: messages, error: fetchError } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (fetchError) {
      console.error('❌ Error al obtener mensajes:', fetchError)
      return
    }
    
    if (messages.length === 0) {
      console.log('❌ No hay mensajes para probar')
      return
    }
    
    const testMessage = messages[0]
    console.log('📋 Mensaje de prueba:', testMessage.id)
    console.log('Estado actual:', testMessage.status)
    
    // 2. Probar actualización de estado
    console.log('\n🔄 Actualizando estado a "read"...')
    const { data: updateData, error: updateError } = await supabase
      .from('contact_messages')
      .update({ 
        status: 'read',
        admin_notes: `Prueba de actualización - ${  new Date().toISOString()}`
      })
      .eq('id', testMessage.id)
      .select()
    
    if (updateError) {
      console.error('❌ Error al actualizar:', updateError)
      return
    }
    
    console.log('✅ Actualización exitosa:')
    console.log('Nuevo estado:', updateData[0].status)
    console.log('Notas:', updateData[0].admin_notes)
    
    // 3. Verificar que se actualizó correctamente
    console.log('\n🔍 Verificando actualización...')
    const { data: verifyData, error: verifyError } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('id', testMessage.id)
      .single()
    
    if (verifyError) {
      console.error('❌ Error al verificar:', verifyError)
      return
    }
    
    console.log('✅ Verificación exitosa:')
    console.log('Estado:', verifyData.status)
    console.log('Notas:', verifyData.admin_notes)
    console.log('Actualizado:', verifyData.updated_at)
    
    // 4. Probar diferentes estados
    const states = ['replied', 'archived', 'new']
    for (const state of states) {
      console.log(`\n🔄 Probando estado: ${state}`)
      
      const { data: stateData, error: stateError } = await supabase
        .from('contact_messages')
        .update({ 
          status: state,
          admin_notes: `Estado cambiado a ${state} - ${new Date().toISOString()}`
        })
        .eq('id', testMessage.id)
        .select()
      
      if (stateError) {
        console.error(`❌ Error al cambiar a ${state}:`, stateError)
      } else {
        console.log(`✅ Estado ${state} aplicado correctamente`)
      }
      
      // Esperar un poco entre actualizaciones
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    console.log('\n🎉 Pruebas de actualización completadas')
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar la prueba
testStatusUpdate() 