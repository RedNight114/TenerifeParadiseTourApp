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

async function setupAuditLogs() {
  console.log('🔧 Configurando tabla audit_logs...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    console.error('❌ Variables de entorno no configuradas')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, anonKey)

  try {
    // Verificar si la tabla existe
    console.log('🔍 Verificando si la tabla audit_logs existe...')
    const { data: existingTable, error: tableError } = await supabase
      .from('audit_logs')
      .select('id')
      .limit(1)

    if (tableError && tableError.code === 'PGRST116') {
      console.log('❌ La tabla audit_logs no existe')
      console.log('\n📋 Para crear la tabla, ejecuta el siguiente SQL en el panel de Supabase:')
      console.log('\n1. Ve a https://app.supabase.com/')
      console.log('2. Selecciona tu proyecto')
      console.log('3. Ve a SQL Editor')
      console.log('4. Copia y pega el contenido del archivo: scripts/27-create-audit-logs-table.sql')
      console.log('5. Ejecuta el SQL')
      console.log('\nO agrega SUPABASE_SERVICE_ROLE_KEY a tu .env.local para ejecutar automáticamente')
    } else if (tableError) {
      console.error('❌ Error verificando tabla:', tableError)
    } else {
      console.log('✅ La tabla audit_logs ya existe')
      
      // Insertar logs de prueba
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
    }

  } catch (error) {
    console.error('❌ Error general:', error)
  }

  console.log('\n🏁 Proceso completado')
}

setupAuditLogs().catch(console.error) 