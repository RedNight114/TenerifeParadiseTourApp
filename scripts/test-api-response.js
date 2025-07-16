require('dotenv').config({ path: '.env.local' })

async function testAPIResponse() {
  console.log('🧪 Verificando estructura de datos de la API...\n')

  try {
    // Probar API de estadísticas
    console.log('1️⃣ Probando API de estadísticas...')
    const statsResponse = await fetch('http://localhost:3000/api/admin/audit-stats?days=30')
    const statsData = await statsResponse.json()
    
    if (statsResponse.ok) {
      console.log('✅ API de estadísticas funcionando')
      console.log('📊 Estructura de datos:')
      console.log(JSON.stringify(statsData, null, 2))
    } else {
      console.log('❌ Error en API de estadísticas:', statsData.error)
    }

    // Probar API de logs
    console.log('\n2️⃣ Probando API de logs...')
    const logsResponse = await fetch('http://localhost:3000/api/admin/audit-logs?limit=2')
    const logsData = await logsResponse.json()
    
    if (logsResponse.ok) {
      console.log('✅ API de logs funcionando')
      console.log('📊 Estructura de datos:')
      console.log(JSON.stringify(logsData, null, 2))
    } else {
      console.log('❌ Error en API de logs:', logsData.error)
    }

  } catch (error) {
    console.error('❌ Error probando APIs:', error.message)
  }
}

// Ejecutar prueba
testAPIResponse() 