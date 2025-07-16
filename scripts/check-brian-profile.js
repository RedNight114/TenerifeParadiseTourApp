require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkBrianProfile() {
  console.log('🔍 Verificando perfil de Brian...')

  try {
    // 1. Buscar el usuario en auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error obteniendo usuarios:', authError.message)
      return
    }

    const brianUser = users.find(u => u.email === 'brian12guargacho@gmail.com')
    
    if (!brianUser) {
      console.error('❌ Usuario Brian no encontrado en auth')
      return
    }

    console.log('✅ Usuario encontrado en auth:', {
      id: brianUser.id,
      email: brianUser.email,
      confirmed: brianUser.email_confirmed_at ? 'Sí' : 'No'
    })

    // 2. Buscar el perfil
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'brian12guargacho@gmail.com')

    if (profileError) {
      console.error('❌ Error obteniendo perfiles:', profileError.message)
      return
    }

    console.log(`📊 Perfiles encontrados: ${profiles.length}`)
    
    if (profiles.length === 0) {
      console.log('❌ No hay perfil creado')
      return
    }

    profiles.forEach((profile, index) => {
      console.log(`Perfil ${index + 1}:`, {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        created_at: profile.created_at
      })
    })

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

checkBrianProfile() 