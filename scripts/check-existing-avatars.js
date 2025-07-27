const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkExistingAvatars() {
  console.log('🔍 Verificando perfiles con avatares existentes...')
  
  try {
    // Obtener todos los perfiles con avatares
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, created_at')
      .not('avatar_url', 'is', null)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error consultando perfiles:', error)
      return
    }
    
    console.log(`📊 Perfiles con avatares encontrados: ${profiles.length}`)
    
    if (profiles.length > 0) {
      console.log('\n👥 Perfiles con avatares:')
      profiles.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.full_name || 'Sin nombre'} (${profile.email})`)
        console.log(`   - ID: ${profile.id}`)
        console.log(`   - Avatar: ${profile.avatar_url}`)
        console.log(`   - Creado: ${new Date(profile.created_at).toLocaleDateString()}`)
        console.log('')
      })
    } else {
      console.log('ℹ️ No hay perfiles con avatares configurados')
    }
    
    // Verificar también perfiles sin avatares
    const { data: profilesWithoutAvatar, error: error2 } = await supabase
      .from('profiles')
      .select('id, full_name, email, created_at')
      .is('avatar_url', null)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error2) {
      console.error('❌ Error consultando perfiles sin avatar:', error2)
      return
    }
    
    console.log(`📊 Perfiles sin avatares (primeros 5): ${profilesWithoutAvatar.length}`)
    
    if (profilesWithoutAvatar.length > 0) {
      console.log('\n👤 Perfiles sin avatares:')
      profilesWithoutAvatar.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.full_name || 'Sin nombre'} (${profile.email})`)
        console.log(`   - ID: ${profile.id}`)
        console.log(`   - Creado: ${new Date(profile.created_at).toLocaleDateString()}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

checkExistingAvatars() 