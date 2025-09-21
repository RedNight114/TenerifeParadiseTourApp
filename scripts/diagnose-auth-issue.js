// Script para diagnosticar el problema de autenticación en el chat
const https = require('https')
const http = require('http')

// Configuración
const BASE_URL = 'http://localhost:3000'

// Función para hacer una petición HTTP
function makeRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE_URL)
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Auth-Diagnostic/1.0',
        ...headers
      }
    }

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(body)
    }

    const req = http.request(url, options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        let parsedData = null
        try {
          parsedData = data ? JSON.parse(data) : null
        } catch (e) {
          parsedData = data
        }
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsedData,
          success: res.statusCode >= 200 && res.statusCode < 300
        })
      })
    })

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        statusCode: 0
      })
    })

    if (body) {
      req.write(body)
    }

    req.end()
  })
}

// Función principal de diagnóstico
async function diagnoseAuthIssue() {
  console.log('🔐 DIAGNÓSTICO DEL PROBLEMA DE AUTENTICACIÓN')
  console.log('=' .repeat(60))
  
  // 1. Verificar endpoint de sesión
  console.log('\n1. Verificando endpoint de sesión...')
  const sessionResponse = await makeRequest('/api/auth/session')
  
  if (sessionResponse.success) {
    console.log('✅ Endpoint de sesión disponible')
    console.log(`   Status: ${sessionResponse.statusCode}`)
    
    if (sessionResponse.data) {
      console.log('   Datos de sesión:')
      console.log(`   - Usuario: ${sessionResponse.data.user ? sessionResponse.data.user.email : 'No autenticado'}`)
      console.log(`   - Sesión activa: ${sessionResponse.data.user ? 'Sí' : 'No'}`)
      
      if (sessionResponse.data.user) {
        console.log(`   - ID de usuario: ${sessionResponse.data.user.id}`)
        console.log(`   - Email verificado: ${sessionResponse.data.user.email_confirmed_at ? 'Sí' : 'No'}`)
      }
    } else {
      console.log('   ⚠️ No hay datos de sesión')
    }
  } else {
    console.log('❌ Problema con endpoint de sesión')
    console.log(`   Status: ${sessionResponse.statusCode}`)
    if (sessionResponse.data) {
      console.log(`   Error: ${JSON.stringify(sessionResponse.data, null, 2)}`)
    }
  }

  // 2. Verificar endpoints de chat con autenticación
  console.log('\n2. Verificando endpoints de chat...')
  
  const chatEndpoints = [
    { path: '/api/chat/conversations', name: 'Conversaciones V1' },
    { path: '/api/chat/v3/conversations', name: 'Conversaciones V3' },
    { path: '/api/chat/messages', name: 'Mensajes V1' },
    { path: '/api/chat/v3/messages', name: 'Mensajes V3' }
  ]

  for (const endpoint of chatEndpoints) {
    const response = await makeRequest(endpoint.path)
    console.log(`   ${endpoint.name}: ${response.success ? '✅' : '❌'} (${response.statusCode})`)
    
    if (!response.success && response.data) {
      console.log(`      Error: ${response.data.error || 'Unknown error'}`)
    }
  }

  // 3. Verificar página de chat
  console.log('\n3. Verificando página de chat...')
  const chatPageResponse = await makeRequest('/chat')
  if (chatPageResponse.success) {
    console.log('✅ Página de chat accesible')
    console.log(`   Status: ${chatPageResponse.statusCode}`)
  } else {
    console.log('❌ Problema con página de chat')
    console.log(`   Status: ${chatPageResponse.statusCode}`)
  }

  // 4. Verificar página de login
  console.log('\n4. Verificando página de login...')
  const loginPageResponse = await makeRequest('/auth/login')
  if (loginPageResponse.success) {
    console.log('✅ Página de login accesible')
    console.log(`   Status: ${loginPageResponse.statusCode}`)
  } else {
    console.log('❌ Problema con página de login')
    console.log(`   Status: ${loginPageResponse.statusCode}`)
  }

  // Resumen y recomendaciones
  console.log('\n📋 RESUMEN DEL DIAGNÓSTICO')
  console.log('=' .repeat(60))
  
  if (sessionResponse.success && sessionResponse.data?.user) {
    console.log('✅ Usuario autenticado correctamente')
    console.log('✅ Sistema de autenticación funcionando')
    console.log('⚠️ El problema puede estar en el frontend')
  } else {
    console.log('❌ Usuario NO autenticado')
    console.log('⚠️ Necesitas iniciar sesión primero')
  }
  
  console.log('\n💡 RECOMENDACIONES:')
  console.log('1. Si no estás autenticado:')
  console.log('   - Ve a /auth/login')
  console.log('   - Inicia sesión con tus credenciales')
  console.log('   - Verifica que el login sea exitoso')
  
  console.log('\n2. Si estás autenticado pero el chat no funciona:')
  console.log('   - Verifica que las cookies estén habilitadas')
  console.log('   - Limpia el caché del navegador')
  console.log('   - Recarga la página de chat')
  
  console.log('\n3. Para probar el chat:')
  console.log('   - Asegúrate de estar autenticado')
  console.log('   - Ve a /chat')
  console.log('   - Haz clic en "Nueva" para crear una conversación')
  console.log('   - Escribe un mensaje y haz clic en "Enviar"')
}

// Ejecutar diagnóstico
diagnoseAuthIssue().catch(console.error)
