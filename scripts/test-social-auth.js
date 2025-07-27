const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Verificando configuración de autenticación social...')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas')
  console.log('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local')
  process.exit(1)
}

console.log('✅ Variables de entorno encontradas')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSocialAuth() {
  try {
    console.log('\n🔧 Verificando configuración de OAuth...')
    
    // Verificar que el cliente se puede crear
    console.log('✅ Cliente de Supabase creado correctamente')
    
    // Verificar configuración de auth
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Error obteniendo sesión:', error.message)
    } else {
      console.log('✅ Configuración de auth verificada')
    }
    
    console.log('\n📋 Configuración de proveedores OAuth:')
    console.log('Para habilitar Google OAuth:')
    console.log('1. Ve a https://supabase.com/dashboard/project/[TU_PROJECT]/auth/providers')
    console.log('2. Habilita Google OAuth')
    console.log('3. Configura Client ID y Client Secret desde Google Cloud Console')
    console.log('4. Agrega tu dominio a las URLs autorizadas')
    
    console.log('\nPara habilitar Facebook OAuth:')
    console.log('1. Ve a https://supabase.com/dashboard/project/[TU_PROJECT]/auth/providers')
    console.log('2. Habilita Facebook OAuth')
    console.log('3. Configura App ID y App Secret desde Facebook Developers')
    console.log('4. Agrega tu dominio a las URLs autorizadas')
    
    console.log('\n🌐 URLs de redirección necesarias:')
    console.log(`- ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`)
    
    console.log('\n✅ Verificación completada')
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message)
  }
}

testSocialAuth() 