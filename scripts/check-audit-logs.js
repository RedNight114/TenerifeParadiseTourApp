const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkAuditLogs() {
  console.log('🔍 Verificando sistema de logs de auditoría...')
  
  try {
    // 1. Verificar si la tabla existe
    console.log('\n1. Verificando tabla audit_logs...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('audit_logs')
      .select('*')
      .limit(1)

    if (tableError) {
      console.error('❌ Error accediendo a la tabla audit_logs:', tableError)
      console.log('💡 La tabla puede no existir o no tener permisos RLS configurados')
      return
    }

    console.log('✅ Tabla audit_logs accesible')

    // 2. Contar logs existentes
    console.log('\n2. Contando logs existentes...')
    const { count, error: countError } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Error contando logs:', countError)
    } else {
      console.log(`📊 Total de logs: ${count}`)
    }

    // 3. Obtener algunos logs de ejemplo
    console.log('\n3. Obteniendo logs de ejemplo...')
    const { data: logs, error: logsError } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (logsError) {
      console.error('❌ Error obteniendo logs:', logsError)
    } else {
      console.log('📋 Logs recientes:')
      logs?.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.action} - ${log.level} - ${log.created_at}`)
      })
    }

    // 4. Verificar estructura de la tabla
    console.log('\n4. Verificando estructura de la tabla...')
    const { data: sampleLog } = await supabase
      .from('audit_logs')
      .select('*')
      .limit(1)
      .single()

    if (sampleLog) {
      console.log('📋 Campos disponibles:')
      Object.keys(sampleLog).forEach(field => {
        console.log(`  - ${field}: ${typeof sampleLog[field]}`)
      })
    }

    // 5. Crear un log de prueba si no hay logs
    if (!logs || logs.length === 0) {
      console.log('\n5. Creando log de prueba...')
      const testLog = {
        user_id: null, // Sistema
        action: 'system_check',
        category: 'system',
        level: 'info',
        details: { message: 'Verificación del sistema de logs' },
        ip_address: '127.0.0.1',
        user_agent: 'Script de verificación'
      }

      const { data: newLog, error: insertError } = await supabase
        .from('audit_logs')
        .insert(testLog)
        .select()
        .single()

      if (insertError) {
        console.error('❌ Error creando log de prueba:', insertError)
      } else {
        console.log('✅ Log de prueba creado:', newLog.id)
      }
    }

    // 6. Verificar RLS policies
    console.log('\n6. Verificando políticas RLS...')
    console.log('💡 Asegúrate de que las políticas RLS permitan acceso a administradores')
    console.log('   Ejemplo de política necesaria:')
    console.log(`
      CREATE POLICY "Allow admin access to audit_logs" ON audit_logs
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
    `)

  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar verificación
checkAuditLogs() 