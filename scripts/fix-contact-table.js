require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixContactTable() {
  console.log('🔧 Arreglando tabla contact_messages...')
  
  try {
    // 1. Verificar estructura actual
    console.log('1. Verificando estructura actual...')
    const { data: testData, error: testError } = await supabase
      .from('contact_messages')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('❌ Error al acceder a la tabla:', testError)
      return
    }
    
    console.log('✅ Tabla accesible')
    console.log('Columnas disponibles:', Object.keys(testData[0] || {}))
    
    // 2. Intentar añadir columna admin_notes si no existe
    console.log('2. Añadiendo columna admin_notes...')
    try {
      const addColumnSQL = `
        ALTER TABLE contact_messages 
        ADD COLUMN IF NOT EXISTS admin_notes TEXT;
      `
      
      const { error: addError } = await supabase.rpc('exec_sql', { sql: addColumnSQL })
      
      if (addError) {
        console.log('⚠️ Error al añadir columna con RPC:', addError.message)
        
        // Método alternativo: intentar actualizar un registro con admin_notes
        console.log('Intentando método alternativo...')
        const { data: messages } = await supabase
          .from('contact_messages')
          .select('id')
          .limit(1)
        
        if (messages && messages.length > 0) {
          const { error: updateError } = await supabase
            .from('contact_messages')
            .update({ admin_notes: 'Test note' })
            .eq('id', messages[0].id)
          
          if (updateError) {
            console.log('❌ La columna admin_notes no existe y no se puede crear automáticamente')
            console.log('Por favor, ejecuta manualmente en Supabase:')
            console.log('ALTER TABLE contact_messages ADD COLUMN admin_notes TEXT;')
            return
          } else {
            console.log('✅ Columna admin_notes añadida exitosamente')
          }
        }
      } else {
        console.log('✅ Columna admin_notes añadida exitosamente')
      }
    } catch (error) {
      console.log('⚠️ Error al añadir columna:', error.message)
    }
    
    // 3. Verificar estructura final
    console.log('3. Verificando estructura final...')
    const { data: finalData, error: finalError } = await supabase
      .from('contact_messages')
      .select('*')
      .limit(1)
    
    if (finalError) {
      console.error('❌ Error al verificar estructura final:', finalError)
      return
    }
    
    console.log('✅ Estructura final:', Object.keys(finalData[0] || {}))
    
    // 4. Probar actualización con admin_notes
    console.log('4. Probando actualización con admin_notes...')
    const { data: messages } = await supabase
      .from('contact_messages')
      .select('id, status')
      .limit(1)
    
    if (messages && messages.length > 0) {
      const testMessage = messages[0]
      console.log('Mensaje de prueba:', testMessage.id, 'Estado:', testMessage.status)
      
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
      } else {
        console.log('✅ Actualización exitosa:')
        console.log('Nuevo estado:', updateData[0].status)
        console.log('Notas:', updateData[0].admin_notes)
      }
    }
    
    console.log('🎉 Tabla contact_messages arreglada correctamente')
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar el arreglo
fixContactTable() 