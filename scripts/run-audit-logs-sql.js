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
      if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
        process.env.SUPABASE_SERVICE_ROLE_KEY = line.split('=')[1]?.trim()
      }
    }
  }
}

loadEnvFile(path.join(__dirname, '..', '.env.local'))

async function createAuditLogsTable() {
  console.log('🔧 Creando tabla audit_logs...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Variables de entorno no configuradas')
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
    console.error('SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✅' : '❌')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '27-create-audit-logs-table.sql')
    if (!fs.existsSync(sqlPath)) {
      console.error('❌ Archivo SQL no encontrado:', sqlPath)
      process.exit(1)
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    console.log('📄 Archivo SQL leído correctamente')

    // Ejecutar el SQL
    console.log('🚀 Ejecutando SQL...')
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent })

    if (error) {
      console.error('❌ Error ejecutando SQL:', error)
      
      // Intentar ejecutar por partes
      console.log('🔄 Intentando ejecutar por partes...')
      const statements = sqlContent.split(';').filter(stmt => stmt.trim())
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim()
        if (statement) {
          try {
            console.log(`Ejecutando statement ${i + 1}/${statements.length}...`)
            const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement })
            if (stmtError) {
              console.warn(`⚠️  Error en statement ${i + 1}:`, stmtError.message)
            }
          } catch (err) {
            console.warn(`⚠️  Error ejecutando statement ${i + 1}:`, err.message)
          }
        }
      }
    } else {
      console.log('✅ SQL ejecutado correctamente')
    }

    // Verificar que la tabla existe
    console.log('\n🔍 Verificando tabla...')
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'audit_logs')

    if (tableError) {
      console.error('❌ Error verificando tabla:', tableError)
    } else if (tables && tables.length > 0) {
      console.log('✅ Tabla audit_logs creada correctamente')
    } else {
      console.log('⚠️  Tabla audit_logs no encontrada')
    }

    // Insertar algunos logs de prueba
    console.log('\n📝 Insertando logs de prueba...')
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
      }
    ]

    const { error: insertError } = await supabase
      .from('audit_logs')
      .insert(testLogs)

    if (insertError) {
      console.error('❌ Error insertando logs de prueba:', insertError)
    } else {
      console.log('✅ Logs de prueba insertados correctamente')
    }

  } catch (error) {
    console.error('❌ Error general:', error)
  }

  console.log('\n🏁 Proceso completado')
}

createAuditLogsTable().catch(console.error) 