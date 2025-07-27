#!/usr/bin/env node

/**
 * Script para probar el login directamente con Supabase
 * Verifica si las credenciales funcionan correctamente
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testLogin() {
  console.log('🧪 Probando login con Supabase...\n')

  // 1. Verificar variables de entorno
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Variables de entorno no encontradas')
    return
  }

  console.log('✅ Variables de entorno encontradas')

  // 2. Crear cliente
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log('✅ Cliente de Supabase creado')

  // 3. Verificar sesión actual
  console.log('\n🔍 Verificando sesión actual...')
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError) {
    console.error('❌ Error obteniendo sesión:', sessionError.message)
  } else if (session) {
    console.log('✅ Sesión activa encontrada')
    console.log(`   Usuario: ${session.user.email}`)
    console.log(`   ID: ${session.user.id}`)
    return
  } else {
    console.log('ℹ️ No hay sesión activa')
  }

  // 4. Probar login con credenciales reales
  console.log('\n🔐 Probando login con credenciales reales...')
  
  // Credenciales reales proporcionadas por el usuario
  const testCredentials = [
    { 
      email: 'brian12guargacho@gmail.com', 
      password: 'Claudia1712', 
      name: 'Cliente Brian',
      role: 'client'
    },
    { 
      email: 'Tecnicos@tenerifeparadise.com', 
      password: 'TenerifeparadiseTour2025', 
      name: 'Admin Tecnicos',
      role: 'admin'
    }
  ]

  for (const cred of testCredentials) {
    console.log(`\n📧 Probando: ${cred.email}`)
    console.log(`🔑 Password: ${cred.password}`)
    console.log(`👤 Rol: ${cred.role}`)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cred.email,
        password: cred.password
      })

      if (error) {
        console.log(`❌ Error: ${error.message}`)
      } else {
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
        }

        // Cerrar sesión para probar la siguiente
        await supabase.auth.signOut()
        console.log('🔓 Sesión cerrada')
        break
      }
    } catch (error) {
      console.error('❌ Error inesperado:', error.message)
    }
  }

  // 5. Verificar usuarios en la base de datos
  console.log('\n👥 Verificando usuarios en la base de datos...')
  try {
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .limit(5)

    if (usersError) {
      console.error('❌ Error obteniendo usuarios:', usersError.message)
    } else {
      console.log('✅ Usuarios encontrados:')
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.full_name}) - ${user.role}`)
      })
    }
  } catch (error) {
    console.error('❌ Error verificando usuarios:', error.message)
  }

  console.log('\n✅ Prueba completada')
}

// Ejecutar prueba
testLogin().catch(console.error) 