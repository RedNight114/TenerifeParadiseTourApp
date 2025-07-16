require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

console.log('🔍 Iniciando prueba simple...')
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurada' : 'No configurada')
console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurada' : 'No configurada')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testSimple() {
  try {
    console.log('📤 Intentando login...')
    
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email: 'brian12guargacho@gmail.com',
      password: 'brian123456'
    })

    if (error) {
      console.error('❌ Error en login:', error.message)
      return
    }

    console.log('✅ Login exitoso:', user.email)
    console.log('User ID:', user.id)

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

testSimple() 