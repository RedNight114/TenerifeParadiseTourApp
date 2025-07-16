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

async function insertTestLogs() {
  console.log('📝 Insertando logs de prueba...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    console.error('❌ Variables de entorno no configuradas')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, anonKey)

  try {
    const testLogs = [
      {
        user_id: '781412ba-4ee4-486e-a428-e1b052d20538',
        user_email: 'tecnicos@tenerifeparadise.com',
        action: 'login',
        category: 'authentication',
        level: 'info',
        details: { ip_address: '127.0.0.1', user_agent: 'test' },
        success: true,
        resource_type: 'user',
        resource_id: '781412ba-4ee4-486e-a428-e1b052d20538'
      },
      {
        user_id: '781412ba-4ee4-486e-a428-e1b052d20538',
        user_email: 'tecnicos@tenerifeparadise.com',
        action: 'view_audit_logs',
        category: 'admin_action',
        level: 'info',
        details: { page: 'audit_dashboard' },
        success: true,
        resource_type: 'audit_logs',
        resource_id: 'all'
      },
      {
        user_id: '781412ba-4ee4-486e-a428-e1b052d20538',
        user_email: 'tecnicos@tenerifeparadise.com',
        action: 'create_service',
        category: 'data_modification',
        level: 'info',
        details: { service_name: 'Test Service' },
        success: true,
        resource_type: 'service',
        resource_id: 'test-service-1'
      },
      {
        user_id: '781412ba-4ee4-486e-a428-e1b052d20538',
        user_email: 'tecnicos@tenerifeparadise.com',
        action: 'failed_login',
        category: 'authentication',
        level: 'warning',
        details: { ip_address: '192.168.1.100', reason: 'invalid_password' },
        success: false,
        resource_type: 'user',
        resource_id: 'unknown'
      },
      {
        user_id: '781412ba-4ee4-486e-a428-e1b052d20538',
        user_email: 'tecnicos@tenerifeparadise.com',
        action: 'export_data',
        category: 'data_access',
        level: 'info',
        details: { format: 'csv', records: 150 },
        success: true,
        resource_type: 'data_export',
        resource_id: 'export-001'
      }
    ]

    console.log('🚀 Insertando logs...')
    const { data, error } = await supabase
      .from('audit_logs')
      .insert(testLogs)
      .select()

    if (error) {
      console.error('❌ Error insertando logs:', error)
      return
    }

    console.log('✅ Logs insertados correctamente')
    console.log(`📊 Total insertados: ${data.length}`)

    // Verificar que se insertaron
    const { data: verifyData, error: verifyError } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (verifyError) {
      console.error('❌ Error verificando logs:', verifyError)
    } else {
      console.log(`📋 Total de logs en la tabla: ${verifyData.length}`)
      console.log('📋 Últimos logs:')
      verifyData.slice(0, 3).forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.action} (${log.category}) - ${log.success ? '✅' : '❌'}`)
      })
    }

  } catch (error) {
    console.error('❌ Error general:', error)
  }

  console.log('\n🏁 Proceso completado')
}

insertTestLogs().catch(console.error) 