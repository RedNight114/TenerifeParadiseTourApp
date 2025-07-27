require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkAndFixConstraint() {
  console.log('🔍 Verificando constraint de status...')
  
  try {
    // 1. Verificar la constraint actual
    console.log('1. Verificando constraint actual...')
    const { data: constraintData, error: constraintError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT conname, pg_get_constraintdef(oid) as definition
          FROM pg_constraint 
          WHERE conrelid = 'contact_messages'::regclass 
          AND conname = 'contact_messages_status_check';
        `
      })
    
    if (constraintError) {
      console.log('⚠️ No se puede verificar constraint con RPC, intentando método alternativo...')
    } else {
      console.log('Constraint actual:', constraintData)
    }
    
    // 2. Probar diferentes estados
    console.log('2. Probando diferentes estados...')
    const testStates = ['new', 'read', 'replied', 'archived']
    
    for (const state of testStates) {
      console.log(`Probando estado: ${state}`)
      
      try {
        const { data: testData, error: testError } = await supabase
          .from('contact_messages')
          .update({ status: state })
          .eq('id', (await supabase.from('contact_messages').select('id').limit(1)).data[0].id)
          .select()
        
        if (testError) {
          console.log(`❌ Error con estado "${state}":`, testError.message)
        } else {
          console.log(`✅ Estado "${state}" funciona correctamente`)
        }
      } catch (error) {
        console.log(`❌ Error al probar estado "${state}":`, error.message)
      }
    }
    
    // 3. Intentar corregir la constraint
    console.log('3. Intentando corregir constraint...')
    try {
      const fixSQL = `
        ALTER TABLE contact_messages DROP CONSTRAINT IF EXISTS contact_messages_status_check;
        ALTER TABLE contact_messages ADD CONSTRAINT contact_messages_status_check 
        CHECK (status IN ('new', 'read', 'replied', 'archived'));
      `
      
      const { error: fixError } = await supabase.rpc('exec_sql', { sql: fixSQL })
      
      if (fixError) {
        console.log('⚠️ No se puede corregir constraint con RPC')
        console.log('Por favor, ejecuta manualmente en Supabase:')
        console.log(`
          ALTER TABLE contact_messages DROP CONSTRAINT IF EXISTS contact_messages_status_check;
          ALTER TABLE contact_messages ADD CONSTRAINT contact_messages_status_check 
          CHECK (status IN ('new', 'read', 'replied', 'archived'));
        `)
      } else {
        console.log('✅ Constraint corregida exitosamente')
      }
    } catch (error) {
      console.log('⚠️ Error al corregir constraint:', error.message)
    }
    
    // 4. Verificar estructura final
    console.log('4. Verificando estructura final...')
    const { data: finalData, error: finalError } = await supabase
      .from('contact_messages')
      .select('*')
      .limit(1)
    
    if (finalError) {
      console.error('❌ Error al verificar estructura final:', finalError)
    } else {
      console.log('✅ Estructura final correcta')
      console.log('Columnas disponibles:', Object.keys(finalData[0] || {}))
    }
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar la verificación
checkAndFixConstraint() 