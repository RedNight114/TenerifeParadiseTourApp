#!/usr/bin/env node

/**
 * Script para probar el login del admin
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testAdminLogin() {
  console.log('🧪 Probando login del admin...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Variables de entorno no encontradas')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log('✅ Cliente de Supabase creado')

  // Credenciales del admin
  const adminEmail = 'Tecnicos@tenerifeparadise.com'
  const adminPassword = 'TenerifeparadiseTour2025'

  console.log(`📧 Email: ${adminEmail}`)
  console.log(`🔑 Password: ${adminPassword}`)

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    })

    if (error) {
      console.error('❌ Error en login:', error.message)
      return
    }

    console.log('✅ Login exitoso!')
    console.log(`   Usuario: ${data.user.email}`)
    console.log(`   ID: ${data.user.id}`)
    console.log(`   Email confirmado: ${data.user.email_confirmed_at ? 'Sí' : 'No'}`)

    // Verificar perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.error('❌ Error obteniendo perfil:', profileError.message)
    } else {
      console.log('✅ Perfil encontrado')
      console.log(`   Nombre: ${profile.full_name}`)
      console.log(`   Rol: ${profile.role}`)
      console.log(`   Email: ${profile.email}`)
      
      if (profile.role === 'admin') {
        console.log('🎉 ¡Usuario es admin!')
      } else {
        console.log('⚠️ Usuario no es admin')
      }
    }

    // Cerrar sesión
    await supabase.auth.signOut()
    console.log('🔓 Sesión cerrada')

  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
  }

  console.log('\n✅ Prueba completada')
}

testAdminLogin().catch(console.error) 