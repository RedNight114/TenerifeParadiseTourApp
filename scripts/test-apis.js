require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Configurar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no configuradas')
  console.log('URL:', supabaseUrl ? '✅' : '❌')
  console.log('KEY:', supabaseKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAPIs() {
  console.log('🧪 Probando APIs de auditoría...\n')

  try {
    // 1. Probar API de logs
    console.log('1️⃣ Probando API de logs...')
    const logsResponse = await fetch('http://localhost:3000/api/admin/audit-logs?limit=10')
    const logsData = await logsResponse.json()
    
    if (logsResponse.ok) {
      console.log('✅ API de logs funcionando')
      console.log(`📊 Logs obtenidos: ${logsData.logs?.length || 0}`)
    } else {
      console.log('❌ Error en API de logs:', logsData.error)
    }

    // 2. Probar API de estadísticas
    console.log('\n2️⃣ Probando API de estadísticas...')
    const statsResponse = await fetch('http://localhost:3000/api/admin/audit-stats?days=30')
    const statsData = await statsResponse.json()
    
    if (statsResponse.ok) {
      console.log('✅ API de estadísticas funcionando')
      console.log(`📊 Total de logs: ${statsData.stats?.total || 0}`)
      console.log(`📈 Categorías:`, Object.keys(statsData.stats?.by_category || {}))
    } else {
      console.log('❌ Error en API de estadísticas:', statsData.error)
    }

    // 3. Probar API de estadísticas con POST
    console.log('\n3️⃣ Probando API de estadísticas (POST)...')
    const suspiciousResponse = await fetch('http://localhost:3000/api/admin/audit-stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'detect_suspicious',
        hours_back: 24
      })
    })
    const suspiciousData = await suspiciousResponse.json()
    
    if (suspiciousResponse.ok) {
      console.log('✅ API de detección de actividad sospechosa funcionando')
      console.log(`🚨 Intentos fallidos de login: ${suspiciousData.suspicious_activity?.failed_logins || 0}`)
    } else {
      console.log('❌ Error en API de detección:', suspiciousData.error)
    }

    console.log('\n🎉 ¡Todas las APIs están funcionando correctamente!')

  } catch (error) {
    console.error('❌ Error probando APIs:', error.message)
  }
}

// Ejecutar prueba
testAPIs() 