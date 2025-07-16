const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Cargar variables de entorno
function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n')
    
    for (const line of lines) {
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        process.env.NEXT_PUBLIC_SUPABASE_URL = line.split('=')[1]?.trim()
      }
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = line.split('=')[1]?.trim()
      }
    }
  }
}

loadEnvFile(path.join(__dirname, '..', '.env.local'))

async function testAuthorization() {
  console.log('🔐 Probando autorización...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    console.error('❌ Variables de entorno no configuradas')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, anonKey)

  try {
    // 1. Verificar el perfil del usuario técnico
    console.log('1️⃣ Verificando perfil del usuario técnico...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', '781412ba-4ee4-486e-a428-e1b052d20538')
      .single()

    if (profileError) {
      console.error('❌ Error obteniendo perfil:', profileError)
      return
    }

    console.log('✅ Perfil encontrado:', {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      full_name: profile.full_name
    })

    // 2. Verificar si el usuario es admin
    console.log('\n2️⃣ Verificando si es admin...')
    const isAdmin = profile.role === 'admin'
    console.log(`📊 Rol: ${profile.role} - ¿Es admin? ${isAdmin ? '✅' : '❌'}`)

    // 3. Probar acceso a audit_logs
    console.log('\n3️⃣ Probando acceso a audit_logs...')
    const { data: logs, error: logsError } = await supabase
      .from('audit_logs')
      .select('*')
      .limit(5)

    if (logsError) {
      console.error('❌ Error accediendo a audit_logs:', logsError)
    } else {
      console.log('✅ Acceso a audit_logs exitoso')
      console.log(`📊 Total de logs: ${logs.length}`)
    }

    // 4. Probar función get_audit_stats
    console.log('\n4️⃣ Probando función get_audit_stats...')
    const { data: stats, error: statsError } = await supabase
      .rpc('get_audit_stats', { days_back: 30, user_id_filter: null })

    if (statsError) {
      console.error('❌ Error en get_audit_stats:', statsError)
    } else {
      console.log('✅ Función get_audit_stats exitosa')
      console.log('📊 Estadísticas:', stats)
    }

    // 5. Probar función detect_suspicious_activity
    console.log('\n5️⃣ Probando función detect_suspicious_activity...')
    const { data: suspicious, error: suspiciousError } = await supabase
      .rpc('detect_suspicious_activity', { hours_back: 24 })

    if (suspiciousError) {
      console.error('❌ Error en detect_suspicious_activity:', suspiciousError)
    } else {
      console.log('✅ Función detect_suspicious_activity exitosa')
      console.log('📊 Actividad sospechosa:', suspicious)
    }

    // 6. Verificar vistas
    console.log('\n6️⃣ Probando vistas...')
    const { data: recentLogs, error: recentError } = await supabase
      .from('recent_audit_logs')
      .select('*')
      .limit(5)

    if (recentError) {
      console.error('❌ Error en recent_audit_logs:', recentError)
    } else {
      console.log('✅ Vista recent_audit_logs accesible')
      console.log(`📊 Logs recientes: ${recentLogs.length}`)
    }

  } catch (error) {
    console.error('❌ Error general:', error)
  }

  console.log('\n🏁 Prueba completada')
}

testAuthorization().catch(console.error) 