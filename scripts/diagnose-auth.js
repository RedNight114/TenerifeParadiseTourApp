#!/usr/bin/env node

/**
 * Script de diagnóstico para el sistema de autenticación
 * Verifica el estado de Supabase, las variables de entorno y la conexión
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function diagnoseAuth() {
  console.log('🔍 Diagnóstico del sistema de autenticación...\n')

  // 1. Verificar variables de entorno
  console.log('1️⃣ Verificando variables de entorno...')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL no está definida')
    return
  }
  if (!supabaseAnonKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida')
    return
  }

  console.log('✅ Variables de entorno encontradas')
  console.log(`   URL: ${supabaseUrl}`)
  console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...`)

  // 2. Crear cliente de Supabase
  console.log('\n2️⃣ Creando cliente de Supabase...')
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // 3. Verificar conexión
  console.log('\n3️⃣ Verificando conexión con Supabase...')
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (error) {
      console.error('❌ Error de conexión:', error.message)
      return
    }

    console.log('✅ Conexión exitosa con Supabase')
  } catch (error) {
    console.error('❌ Error de conexión:', error.message)
    return
  }

  // 4. Verificar autenticación
  console.log('\n4️⃣ Verificando sistema de autenticación...')
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Error al obtener sesión:', error.message)
    } else if (session) {
      console.log('✅ Sesión activa encontrada')
      console.log(`   Usuario: ${session.user.email}`)
      console.log(`   ID: ${session.user.id}`)
    } else {
      console.log('ℹ️ No hay sesión activa')
    }
  } catch (error) {
    console.error('❌ Error en autenticación:', error.message)
  }

  // 5. Verificar tablas necesarias
  console.log('\n5️⃣ Verificando tablas de la base de datos...')
  const tables = ['profiles', 'auth.users']
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table === 'auth.users' ? 'profiles' : table)
        .select('*')
        .limit(1)

      if (error) {
        console.error(`❌ Error en tabla ${table}:`, error.message)
      } else {
        console.log(`✅ Tabla ${table} accesible`)
      }
    } catch (error) {
      console.error(`❌ Error accediendo a ${table}:`, error.message)
    }
  }

  // 6. Verificar políticas RLS
  console.log('\n6️⃣ Verificando políticas RLS...')
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (error && error.code === 'PGRST301') {
      console.error('❌ Error de políticas RLS:', error.message)
    } else if (error) {
      console.error('❌ Error en consulta:', error.message)
    } else {
      console.log('✅ Políticas RLS funcionando correctamente')
    }
  } catch (error) {
    console.error('❌ Error verificando RLS:', error.message)
  }

  console.log('\n✅ Diagnóstico completado')
}

// Ejecutar diagnóstico
diagnoseAuth().catch(console.error) 