require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function createTestUser() {
  console.log('🔧 Creando usuario de prueba...')

  try {
    // 1. Crear el usuario en auth
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email: 'testuser@tenerifeparadise.com',
      password: 'test123456',
      options: {
        data: {
          full_name: 'Usuario de Prueba'
        }
      }
    })

    if (signUpError) {
      console.error('❌ Error creando usuario:', signUpError.message)
      return
    }

    console.log('✅ Usuario creado en auth:', user.email)
    console.log('User ID:', user.id)

    // 2. Verificar si el perfil se creó automáticamente
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('❌ Error obteniendo perfil:', profileError.message)
      console.log('Intentando crear perfil manualmente...')
      
      // Crear perfil manualmente
      const { data: newProfile, error: createProfileError } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          email: user.email,
          full_name: 'Usuario de Prueba',
          role: 'client'
        }])
        .select()
        .single()

      if (createProfileError) {
        console.error('❌ Error creando perfil manualmente:', createProfileError.message)
        return
      }

      console.log('✅ Perfil creado manualmente:', {
        id: newProfile.id,
        email: newProfile.email,
        full_name: newProfile.full_name,
        role: newProfile.role
      })
    } else {
      console.log('✅ Perfil creado automáticamente:', {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role
      })
    }

    console.log('\n📋 Credenciales del usuario de prueba:')
    console.log('Email: testuser@tenerifeparadise.com')
    console.log('Password: test123456')
    console.log('User ID:', user.id)

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

createTestUser() 