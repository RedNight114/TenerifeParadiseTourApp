#!/usr/bin/env node

/**
 * Script para probar el registro directamente con Supabase
 * Ejecutar con: node scripts/test-registration.js
 */

// Cargar variables de entorno
const fs = require('fs')
const path = require('path')

function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n')
    
    lines.forEach(line => {
      const trimmedLine = line.trim()
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '')
          process.env[key] = value
        }
      }
    })
  }
}

// Cargar archivos de entorno
loadEnvFile(path.join(process.cwd(), '.env.local'))
loadEnvFile(path.join(process.cwd(), '.env'))

// Verificar variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Variables de Supabase no configuradas')
  process.exit(1)
}

console.log('🔍 Probando conexión con Supabase...')
console.log(`URL: ${supabaseUrl}`)
console.log(`Key: ${supabaseKey.substring(0, 20)}...`)

// Crear cliente de Supabase
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRegistration() {
  try {
    console.log('\n📝 Probando registro de usuario...')
    
    const testEmail = `testuser${Date.now()}@gmail.com`
    const testPassword = 'testpassword123'
    const testName = 'Usuario de Prueba'
    
    console.log(`Email: ${testEmail}`)
    console.log(`Nombre: ${testName}`)
    
    // Intentar registro
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testName
        },
        emailRedirectTo: 'http://localhost:3000/auth/callback'
      }
    })
    
    console.log('📥 Respuesta de Supabase:', {
      hasData: !!data,
      hasUser: !!data?.user,
      hasSession: !!data?.session,
      hasError: !!error
    })
    
    if (error) {
      console.log('❌ Error en registro:', error.message)
      console.log('🔍 Detalles del error:', error)
      return false
    }
    
    if (data.user) {
      console.log('✅ Usuario creado exitosamente')
      console.log(`ID: ${data.user.id}`)
      console.log(`Email: ${data.user.email}`)
      console.log(`Email confirmado: ${data.user.email_confirmed_at ? 'Sí' : 'No'}`)
      
      // Intentar crear perfil
      console.log('\n📝 Creando perfil...')
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            full_name: testName,
            email: testEmail,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
      
      if (profileError) {
        console.log('⚠️ Error creando perfil:', profileError.message)
        console.log('   (Esto puede ser normal si el perfil ya existe)')
      } else {
        console.log('✅ Perfil creado exitosamente')
      }
      
      return true
    } else {
      console.log('❌ No se recibió usuario en la respuesta')
      console.log('📥 Datos recibidos:', data)
      return false
    }
    
  } catch (error) {
    console.log('❌ Error inesperado:', error.message)
    console.log('🔍 Stack trace:', error.stack)
    return false
  }
}

async function testConnection() {
  try {
    console.log('\n🔗 Probando conexión básica...')
    
    // Intentar una consulta simple
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('❌ Error de conexión:', error.message)
      return false
    }
    
    console.log('✅ Conexión exitosa')
    return true
    
  } catch (error) {
    console.log('❌ Error de conexión:', error.message)
    return false
  }
}

async function main() {
  console.log('🧪 Iniciando pruebas de registro...\n')
  
  // Probar conexión
  const connectionOk = await testConnection()
  if (!connectionOk) {
    console.log('\n❌ No se pudo conectar con Supabase')
    console.log('💡 Verifica:')
    console.log('   - Que el proyecto esté activo')
    console.log('   - Que las credenciales sean correctas')
    console.log('   - Que la tabla profiles exista')
    process.exit(1)
  }
  
  // Probar registro
  const registrationOk = await testRegistration()
  
  if (registrationOk) {
    console.log('\n🎉 ¡Pruebas exitosas!')
    console.log('✅ La configuración de Supabase está correcta')
    console.log('✅ El registro debería funcionar en la aplicación')
  } else {
    console.log('\n❌ Pruebas fallidas')
    console.log('💡 Verifica la configuración de autenticación en Supabase')
  }
}

main().catch(console.error) 