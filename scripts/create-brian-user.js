require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function createBrianUser() {
  console.log('🔧 Creando usuario Brian...')

  try {
    // 1. Crear el usuario en auth
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email: 'brian12guargacho@gmail.com',
      password: 'brian123456',
      options: {
        data: {
          full_name: 'Brian Afonso'
        }
      }
    })

    if (signUpError) {
      console.error('❌ Error creando usuario:', signUpError.message)
      return
    }

    console.log('✅ Usuario creado en auth:', user.email)

    // 2. Verificar si el perfil se creó automáticamente
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('❌ Error obteniendo perfil:', profileError.message)
      return
    }

    console.log('✅ Perfil creado:', {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role
    })

    // 3. Confirmar el email (simular confirmación)
    console.log('📧 Para completar el registro, confirma el email en tu bandeja de entrada')
    console.log('O ejecuta el script de confirmación manual')

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

createBrianUser() 