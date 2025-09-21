// Script para probar la autenticación específicamente
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
        'User-Agent': 'Auth-Test/1.0',
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

// Función principal de prueba
async function testAuthentication() {
  console.log('🔐 PROBANDO AUTENTICACIÓN')
  console.log('=' .repeat(50))
  
  // 1. Verificar endpoint de sesión
  console.log('\n1. Verificando sesión actual...')
  const sessionResponse = await makeRequest('/api/auth/session')
  
  if (sessionResponse.success) {
    console.log('✅ Endpoint de sesión disponible')
    console.log(`   Status: ${sessionResponse.statusCode}`)
    
    if (sessionResponse.data && sessionResponse.data.user) {
      console.log('✅ Usuario autenticado')
      console.log(`   Email: ${sessionResponse.data.user.email}`)
      console.log(`   ID: ${sessionResponse.data.user.id}`)
      console.log(`   Verificado: ${sessionResponse.data.user.email_confirmed_at ? 'Sí' : 'No'}`)
    } else {
      console.log('❌ Usuario NO autenticado')
      console.log('   Datos de sesión:', sessionResponse.data)
    }
  } else {
    console.log('❌ Error en endpoint de sesión')
    console.log(`   Status: ${sessionResponse.statusCode}`)
    console.log(`   Error: ${sessionResponse.data}`)
  }

  // 2. Verificar página de login
  console.log('\n2. Verificando página de login...')
  const loginResponse = await makeRequest('/auth/login')
  if (loginResponse.success) {
    console.log('✅ Página de login accesible')
  } else {
    console.log('❌ Problema con página de login')
    console.log(`   Status: ${loginResponse.statusCode}`)
  }

  // 3. Verificar página de chat
  console.log('\n3. Verificando página de chat...')
  const chatResponse = await makeRequest('/chat')
  if (chatResponse.success) {
    console.log('✅ Página de chat accesible')
  } else {
    console.log('❌ Problema con página de chat')
    console.log(`   Status: ${chatResponse.statusCode}`)
  }

  // 4. Verificar endpoints de chat
  console.log('\n4. Verificando endpoints de chat...')
  const chatEndpoints = [
    { path: '/api/chat/conversations', name: 'Conversaciones V1' },
    { path: '/api/chat/v3/conversations', name: 'Conversaciones V3' }
  ]

  for (const endpoint of chatEndpoints) {
    const response = await makeRequest(endpoint.path)
    console.log(`   ${endpoint.name}: ${response.success ? '✅' : '❌'} (${response.statusCode})`)
    
    if (!response.success && response.data) {
      console.log(`      Error: ${response.data.error || 'Unknown error'}`)
    }
  }

  // Resumen y recomendaciones
  console.log('\n📋 RESUMEN')
  console.log('=' .repeat(50))
  
  if (sessionResponse.success && sessionResponse.data?.user) {
    console.log('✅ Usuario autenticado correctamente')
    console.log('✅ Sistema de autenticación funcionando')
    console.log('\n💡 Si el chat no funciona:')
    console.log('   1. Recarga la página de chat')
    console.log('   2. Verifica que no haya errores en la consola del navegador')
    console.log('   3. Limpia el caché del navegador')
  } else {
    console.log('❌ Usuario NO autenticado')
    console.log('\n💡 Para autenticarte:')
    console.log('   1. Ve a /auth/login')
    console.log('   2. Inicia sesión con tus credenciales')
    console.log('   3. Verifica que el login sea exitoso')
    console.log('   4. Luego ve a /chat')
  }
  
  console.log('\n🔧 Para probar el chat:')
  console.log('   1. Asegúrate de estar autenticado')
  console.log('   2. Ve a /chat')
  console.log('   3. Haz clic en "Nueva" para crear una conversación')
  console.log('   4. Escribe un mensaje y haz clic en "Enviar"')
}

// Ejecutar prueba
testAuthentication().catch(console.error)

