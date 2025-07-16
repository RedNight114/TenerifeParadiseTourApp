const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Cargar variables de entorno manualmente
function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n')
    
    for (const line of lines) {
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        process.env.NEXT_PUBLIC_SUPABASE_URL = line.split('=')[1]?.trim()
      }
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = line.split('=')[1]?.trim()
      }
    }
  }
}

// Intentar cargar desde diferentes archivos
loadEnvFile(path.join(__dirname, '..', '.env.local'))
loadEnvFile(path.join(__dirname, '..', '.env'))

async function testSupabaseConnection() {
  console.log('🧪 Probando conexión a Supabase...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Variables de entorno no configuradas')
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌')
    process.exit(1)
  }

  console.log('📋 Configuración:')
  console.log(`URL: ${supabaseUrl}`)
  console.log(`Clave: ${supabaseAnonKey.substring(0, 10)}...`)
  console.log('')

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    console.log('🔍 Probando autenticación...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.error('❌ Error de autenticación:', authError.message)
    } else {
      console.log('✅ Autenticación funcionando')
      console.log('Sesión:', authData.session ? 'Activa' : 'No hay sesión')
    }

    console.log('\n🔍 Probando consulta a la base de datos...')
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('✅ Conexión exitosa (error esperado: tabla no encontrada o sin permisos)')
        console.log('Este error es normal si la tabla profiles no existe o no tienes permisos')
      } else {
        console.error('❌ Error de consulta:', error.message)
        console.error('Código:', error.code)
        console.error('Detalles:', error.details)
      }
    } else {
      console.log('✅ Consulta exitosa')
      console.log('Datos:', data)
    }

    console.log('\n🔍 Probando RPC...')
    const { data: rpcData, error: rpcError } = await supabase.rpc('version')
    
    if (rpcError) {
      console.log('⚠️  RPC no disponible (normal si no hay funciones personalizadas)')
    } else {
      console.log('✅ RPC funcionando')
      console.log('Versión:', rpcData)
    }

  } catch (error) {
    console.error('❌ Error general:', error.message)
    console.error('Stack:', error.stack)
  }

  console.log('\n🏁 Prueba completada')
}

testSupabaseConnection().catch(console.error) 