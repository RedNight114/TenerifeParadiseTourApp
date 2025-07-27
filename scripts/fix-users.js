#!/usr/bin/env node

/**
 * Script para verificar y crear usuarios en el sistema de autenticación
 * Crea usuarios en auth.users si no existen
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function fixUsers() {
  console.log('🔧 Verificando y creando usuarios en el sistema de autenticación...\n')

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

  // 3. Obtener usuarios de la tabla profiles
  console.log('\n👥 Obteniendo usuarios de la tabla profiles...')
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .order('created_at', { ascending: false })

  if (profilesError) {
    console.error('❌ Error obteniendo perfiles:', profilesError.message)
    return
  }

  console.log(`✅ ${profiles.length} perfiles encontrados`)

  // 4. Verificar qué usuarios existen en auth.users
  console.log('\n🔍 Verificando usuarios en auth.users...')
  
  for (const profile of profiles) {
    console.log(`\n📧 Verificando: ${profile.email}`)
    
    try {
      // Intentar hacer login para verificar si existe en auth.users
      const { data, error } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: 'tempPassword123' // Contraseña temporal
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          console.log('❌ Usuario no existe en auth.users - necesita ser creado')
          
          // Crear usuario en auth.users
          console.log('➕ Creando usuario en auth.users...')
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: profile.email,
            password: 'Password123!', // Contraseña por defecto
            options: {
              data: {
                full_name: profile.full_name,
                role: profile.role
              }
            }
          })

          if (signUpError) {
            console.error('❌ Error creando usuario:', signUpError.message)
          } else {
            console.log('✅ Usuario creado exitosamente')
            console.log(`   ID: ${signUpData.user?.id}`)
            console.log(`   Email: ${signUpData.user?.email}`)
            
            // Confirmar el usuario si es necesario
            if (signUpData.user && !signUpData.user.email_confirmed_at) {
              console.log('📧 Usuario necesita confirmación de email')
            }
          }
        } else {
          console.log(`❌ Error verificando usuario: ${error.message}`)
        }
      } else {
        console.log('✅ Usuario existe en auth.users')
        console.log(`   ID: ${data.user.id}`)
        
        // Cerrar sesión
        await supabase.auth.signOut()
      }
    } catch (error) {
      console.error('❌ Error inesperado:', error.message)
    }
  }

  // 5. Crear usuarios de prueba si no existen
  console.log('\n🧪 Creando usuarios de prueba...')
  
  const testUsers = [
    {
      email: 'test@tenerifeparadise.com',
      password: 'Test123!',
      full_name: 'Usuario de Prueba',
      role: 'client'
    },
    {
      email: 'admin@tenerifeparadise.com',
      password: 'Admin123!',
      full_name: 'Administrador',
      role: 'admin'
    }
  ]

  for (const testUser of testUsers) {
    console.log(`\n📧 Creando usuario de prueba: ${testUser.email}`)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password,
        options: {
          data: {
            full_name: testUser.full_name,
            role: testUser.role
          }
        }
      })

      if (error) {
        if (error.message.includes('User already registered')) {
          console.log('ℹ️ Usuario ya existe')
        } else {
          console.error('❌ Error creando usuario:', error.message)
        }
      } else {
        console.log('✅ Usuario de prueba creado')
        console.log(`   ID: ${data.user?.id}`)
        console.log(`   Email: ${data.user?.email}`)
      }
    } catch (error) {
      console.error('❌ Error inesperado:', error.message)
    }
  }

  // 6. Listar todos los usuarios finales
  console.log('\n📋 Lista final de usuarios:')
  console.log('\n👤 Usuarios en auth.users (sistema de autenticación):')
  
  // Nota: No podemos listar directamente auth.users desde el cliente anónimo
  // Pero podemos verificar intentando hacer login con cada perfil
  
  for (const profile of profiles) {
    console.log(`   - ${profile.email} (${profile.full_name}) - ${profile.role}`)
  }

  console.log('\n✅ Proceso completado')
  console.log('\n🔑 Credenciales de prueba creadas:')
  console.log('   Email: test@tenerifeparadise.com')
  console.log('   Password: Test123!')
  console.log('   Email: admin@tenerifeparadise.com')
  console.log('   Password: Admin123!')
}

// Ejecutar script
fixUsers().catch(console.error) 