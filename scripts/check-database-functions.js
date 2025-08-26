require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabaseFunctions() {
  try {
    console.log('🔍 Verificando funciones de la base de datos...')
    
    // Verificar si existe la tabla de funciones
    const { data: functions, error } = await supabase
      .from('information_schema.routines')
      .select('routine_name, routine_type, routine_definition')
      .eq('routine_schema', 'public')
      .like('routine_name', '%service%')
    
    if (error) {
      console.error('❌ Error consultando funciones:', error)
      return
    }
    
    console.log('\n📋 Funciones relacionadas con servicios encontradas:')
    if (functions && functions.length > 0) {
      functions.forEach(func => {
        console.log(`  - ${func.routine_name} (${func.routine_type})`)
      })
    } else {
      console.log('  ❌ No se encontraron funciones relacionadas con servicios')
    }
    
    // Verificar funciones específicas que necesitamos
    const requiredFunctions = [
      'create_service_simple',
      'update_service_simple', 
      'delete_service_simple'
    ]
    
    console.log('\n🎯 Verificando funciones requeridas:')
    for (const funcName of requiredFunctions) {
      const { data: func, error: funcError } = await supabase
        .from('information_schema.routines')
        .select('routine_name')
        .eq('routine_schema', 'public')
        .eq('routine_name', funcName)
        .single()
      
      if (funcError || !func) {
        console.log(`  ❌ ${funcName}: NO EXISTE`)
      } else {
        console.log(`  ✅ ${funcName}: EXISTE`)
      }
    }
    
    // Intentar llamar a las funciones para ver si funcionan
    console.log('\n🧪 Probando funciones existentes:')
    try {
      const { data: testResult, error: testError } = await supabase
        .rpc('create_service_simple', { service_data: { title: 'Test Service' } })
      
      if (testError) {
        console.log(`  ❌ create_service_simple: ${testError.message}`)
      } else {
        console.log(`  ✅ create_service_simple: FUNCIONA`)
      }
    } catch (e) {
      console.log(`  ❌ create_service_simple: ${e.message}`)
    }
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

checkDatabaseFunctions()
