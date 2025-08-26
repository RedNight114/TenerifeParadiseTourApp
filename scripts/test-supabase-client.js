require('dotenv').config({ path: '.env.local' })

console.log('🔧 Probando getSupabaseClient...')

// Verificar variables de entorno
console.log('Variables de entorno:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ Faltante')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Faltante')

// Simular la función getSupabaseClient
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('\n🔧 Probando creación de cliente...')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas')
  process.exit(1)
}

async function testSupabaseClient() {
  try {
    const { createClient } = require('@supabase/supabase-js')
    
    console.log('🔧 Creando cliente de Supabase...')
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      db: {
        schema: 'public',
      },
    })
    
    console.log('✅ Cliente de Supabase creado exitosamente')
    console.log('🔧 Probando conexión...')
    
    // Probar una consulta simple
    const { data, error } = await client
      .from('services')
      .select('id, title')
      .limit(1)
    
    if (error) {
      console.error('❌ Error en consulta de prueba:', error)
    } else {
      console.log('✅ Conexión exitosa, datos obtenidos:', data)
    }
    
  } catch (error) {
    console.error('❌ Error creando cliente:', error)
    process.exit(1)
  }
}

// Ejecutar la función de prueba
testSupabaseClient()
