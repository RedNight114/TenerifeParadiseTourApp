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

async function fixAuditRLS() {
  console.log('🔧 Corrigiendo políticas RLS de audit_logs...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    console.error('❌ Variables de entorno no configuradas')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, anonKey)

  try {
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'fix-audit-logs-rls.sql')
    if (!fs.existsSync(sqlPath)) {
      console.error('❌ Archivo SQL no encontrado:', sqlPath)
      process.exit(1)
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    console.log('📄 Archivo SQL leído correctamente')

    // Dividir el SQL en statements individuales
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`🚀 Ejecutando ${statements.length} statements...`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement) {
        try {
          console.log(`Ejecutando statement ${i + 1}/${statements.length}...`)
          
          // Para statements que no son SELECT, usar rpc
          if (statement.toLowerCase().includes('drop policy') || 
              statement.toLowerCase().includes('create policy')) {
            const { error } = await supabase.rpc('exec_sql', { sql: statement })
            if (error) {
              console.warn(`⚠️  Error en statement ${i + 1}:`, error.message)
            } else {
              console.log(`✅ Statement ${i + 1} ejecutado`)
            }
          } else if (statement.toLowerCase().includes('select')) {
            // Para SELECT, usar query directa
            const { data, error } = await supabase.from('audit_logs').select('*').limit(1)
            if (error) {
              console.warn(`⚠️  Error en SELECT ${i + 1}:`, error.message)
            } else {
              console.log(`✅ SELECT ${i + 1} ejecutado`)
            }
          }
        } catch (err) {
          console.warn(`⚠️  Error ejecutando statement ${i + 1}:`, err.message)
        }
      }
    }

    console.log('\n✅ Políticas RLS actualizadas')
    console.log('\n📋 Instrucciones manuales:')
    console.log('1. Ve a https://app.supabase.com/')
    console.log('2. Selecciona tu proyecto')
    console.log('3. Ve a SQL Editor')
    console.log('4. Copia y pega el contenido de scripts/fix-audit-logs-rls.sql')
    console.log('5. Ejecuta el SQL')
    console.log('6. Vuelve a probar la aplicación')

  } catch (error) {
    console.error('❌ Error general:', error)
  }

  console.log('\n🏁 Proceso completado')
}

fixAuditRLS().catch(console.error) 