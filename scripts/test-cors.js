const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Cargar variables de entorno manualmente
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
loadEnvFile(path.join(__dirname, '..', '.env'))

async function testCORS() {
  console.log('🌐 Probando configuración de CORS...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Variables de entorno no configuradas')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    console.log('🔍 Probando petición con headers de CORS...')
    
    // Simular una petición como la haría el navegador
    const response = await fetch(`${supabaseUrl}/rest/v1/profiles?select=count`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      }
    })

    console.log('📊 Respuesta del servidor:')
    console.log('Status:', response.status)
    console.log('Status Text:', response.statusText)
    
    // Verificar headers de CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
    }
    
    console.log('\n🔒 Headers de CORS:')
    Object.entries(corsHeaders).forEach(([key, value]) => {
      console.log(`${key}: ${value || 'No configurado'}`)
    })

    if (response.ok) {
      const data = await response.json()
      console.log('\n✅ Petición exitosa')
      console.log('Datos:', data)
    } else {
      console.log('\n⚠️  Petición falló pero CORS puede estar funcionando')
      console.log('Error:', response.status, response.statusText)
    }

  } catch (error) {
    console.error('\n❌ Error de red/CORS:', error.message)
    
    if (error.message.includes('CORS')) {
      console.log('\n💡 Solución: Verifica que los orígenes estén configurados en Supabase:')
      console.log('- http://localhost:3000')
      console.log('- http://127.0.0.1:3000')
      console.log('- Tu dominio de producción')
    }
  }

  console.log('\n🏁 Prueba de CORS completada')
}

testCORS().catch(console.error) 