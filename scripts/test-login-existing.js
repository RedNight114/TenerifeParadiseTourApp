require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testLoginExisting() {
  console.log('🔍 Probando login con usuarios existentes...')

  const testUsers = [
    { email: 'admin@tenerifeparadise.com', password: 'admin123' },
    { email: 'samuel@tenerifeparadise.com', password: 'samuel123' },
    { email: 'tecnicos@tenerifeparadise.com', password: 'tecnicos123' },
    { email: 'brian12guargacho@gmail.com', password: 'brian123456' }
  ]

  for (const user of testUsers) {
    try {
      console.log(`\n📤 Probando login con: ${user.email}`)
      
      const { data: { user: authUser }, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      })

      if (error) {
        console.log(`❌ Error con ${user.email}:`, error.message)
        continue
      }

      console.log(`✅ Login exitoso con ${user.email}:`, authUser.id)

      // Verificar perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileError) {
        console.log(`⚠️ Error obteniendo perfil de ${user.email}:`, profileError.message)
      } else {
        console.log(`✅ Perfil de ${user.email}:`, {
          role: profile.role,
          full_name: profile.full_name
        })
      }

      // Cerrar sesión
      await supabase.auth.signOut()

    } catch (error) {
      console.log(`❌ Error general con ${user.email}:`, error.message)
    }
  }
}

testLoginExisting() 