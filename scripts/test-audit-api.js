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

async function testAuditAPI() {
  console.log('🧪 Probando API de audit-logs...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    console.error('❌ Variables de entorno no configuradas')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, anonKey)

  try {
    // 1. Verificar que la tabla existe
    console.log('1️⃣ Verificando tabla audit_logs...')
    const { data: tableData, error: tableError } = await supabase
      .from('audit_logs')
      .select('id')
      .limit(1)

    if (tableError) {
      console.error('❌ Error accediendo a la tabla:', tableError)
      return
    }
    console.log('✅ Tabla audit_logs accesible')

    // 2. Obtener logs directamente
    console.log('\n2️⃣ Obteniendo logs directamente...')
    const { data: logs, error: logsError } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (logsError) {
      console.error('❌ Error obteniendo logs:', logsError)
    } else {
      console.log('✅ Logs obtenidos correctamente')
      console.log(`📊 Total de logs: ${logs.length}`)
      if (logs.length > 0) {
        console.log('📋 Primer log:', {
          id: logs[0].id,
          action: logs[0].action,
          category: logs[0].category,
          user_email: logs[0].user_email,
          created_at: logs[0].created_at
        })
      }
    }

    // 3. Probar con filtros
    console.log('\n3️⃣ Probando con filtros...')
    const { data: filteredLogs, error: filterError } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('category', 'authentication')
      .limit(5)

    if (filterError) {
      console.error('❌ Error con filtros:', filterError)
    } else {
      console.log('✅ Filtros funcionando correctamente')
      console.log(`📊 Logs de autenticación: ${filteredLogs.length}`)
    }

    // 4. Probar estadísticas
    console.log('\n4️⃣ Probando estadísticas...')
    const { data: stats, error: statsError } = await supabase
      .from('audit_logs')
      .select('category, level, success')

    if (statsError) {
      console.error('❌ Error obteniendo estadísticas:', statsError)
    } else {
      console.log('✅ Estadísticas obtenidas correctamente')
      
      const categoryStats = {}
      const levelStats = {}
      let successCount = 0
      let totalCount = stats.length

      stats.forEach(log => {
        categoryStats[log.category] = (categoryStats[log.category] || 0) + 1
        levelStats[log.level] = (levelStats[log.level] || 0) + 1
        if (log.success) successCount++
      })

      console.log('📊 Estadísticas:')
      console.log('- Total de logs:', totalCount)
      console.log('- Por categoría:', categoryStats)
      console.log('- Por nivel:', levelStats)
      console.log('- Tasa de éxito:', totalCount > 0 ? `${((successCount / totalCount) * 100).toFixed(1)}%` : '0%')
    }

  } catch (error) {
    console.error('❌ Error general:', error)
  }

  console.log('\n🏁 Prueba completada')
}

testAuditAPI().catch(console.error) 