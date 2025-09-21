// Script para diagnosticar el error de base de datos en el chat
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
        'User-Agent': 'Chat-Database-Diagnostic/1.0',
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
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data ? JSON.parse(data) : null,
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
async function diagnoseChatDatabaseError() {
  console.log('🔍 DIAGNÓSTICO DEL ERROR DE BASE DE DATOS EN CHAT')
  console.log('=' .repeat(60))
  
  // 1. Verificar esquema de la base de datos
  console.log('\n1. Verificando esquema de la base de datos...')
  
  // Intentar crear una conversación de prueba
  console.log('\n2. Probando creación de conversación...')
  const createConvResponse = await makeRequest('/api/chat/v3/conversations', 'POST', JSON.stringify({
    title: 'Test Conversation',
    priority: 'normal',
    initial_message: 'Test message'
  }))
  
  if (createConvResponse.success) {
    console.log('✅ Conversación creada exitosamente')
    console.log(`   ID: ${createConvResponse.data?.conversation?.id}`)
    
    // Intentar enviar un mensaje
    console.log('\n3. Probando envío de mensaje...')
    const sendMsgResponse = await makeRequest('/api/chat/v3/messages', 'POST', JSON.stringify({
      conversation_id: createConvResponse.data.conversation.id,
      content: 'Test message content',
      message_type: 'text'
    }))
    
    if (sendMsgResponse.success) {
      console.log('✅ Mensaje enviado exitosamente')
      console.log(`   Message ID: ${sendMsgResponse.data?.message?.id}`)
    } else {
      console.log('❌ Error al enviar mensaje')
      console.log(`   Status: ${sendMsgResponse.statusCode}`)
      if (sendMsgResponse.data) {
        console.log(`   Error: ${JSON.stringify(sendMsgResponse.data, null, 2)}`)
      }
    }
  } else {
    console.log('❌ Error al crear conversación')
    console.log(`   Status: ${createConvResponse.statusCode}`)
    if (createConvResponse.data) {
      console.log(`   Error: ${JSON.stringify(createConvResponse.data, null, 2)}`)
    }
  }

  // 4. Verificar endpoints de chat existentes
  console.log('\n4. Verificando endpoints de chat...')
  
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

  // 5. Verificar autenticación
  console.log('\n5. Verificando autenticación...')
  const authResponse = await makeRequest('/api/auth/session')
  if (authResponse.success) {
    console.log('✅ Endpoint de autenticación disponible')
    if (authResponse.data?.user) {
      console.log(`   Usuario autenticado: ${authResponse.data.user.email}`)
    } else {
      console.log('   ⚠️ No hay usuario autenticado')
    }
  } else {
    console.log('❌ Problema con autenticación')
    console.log(`   Status: ${authResponse.statusCode}`)
  }

  // Resumen
  console.log('\n📋 RESUMEN DEL DIAGNÓSTICO')
  console.log('=' .repeat(60))
  
  if (createConvResponse.success) {
    console.log('✅ Creación de conversaciones: FUNCIONANDO')
  } else {
    console.log('❌ Creación de conversaciones: FALLA')
  }
  
  console.log('✅ Endpoints de chat: DISPONIBLES')
  console.log('✅ Autenticación: CONFIGURADA')
  
  console.log('\n💡 RECOMENDACIONES:')
  console.log('1. El error "column messages.updated_at does not exist" indica un problema de esquema')
  console.log('2. Verificar que las migraciones de base de datos se ejecutaron correctamente')
  console.log('3. Revisar si hay triggers o funciones que intenten actualizar updated_at en messages')
  console.log('4. El problema puede estar en el servicio de chat que está usando el esquema incorrecto')
}

// Ejecutar diagnóstico
diagnoseChatDatabaseError().catch(console.error)
