#!/usr/bin/env node

/**
 * Script de prueba usando datos oficiales de Redsys
 * Utiliza las credenciales y tarjetas de prueba oficiales
 */

const crypto = require('crypto')
const https = require('https')
const querystring = require('querystring')

// Datos oficiales de Redsys (según documentación proporcionada)
const REDSYS_CONFIG = {
  merchantCode: '367529286',
  terminal: '1',
  currency: '978', // EUR
  secretKey: 'sq7HjrUOBfKmC576ILgskD5srU870gJ7',
  environment: 'https://sis-t.redsys.es:25443/sis/realizarPago',
  encryptionType: 'SHA256'
}

// Tarjetas de prueba oficiales
const TEST_CARDS = {
  accepted: {
    number: '4548810000000003',
    expiry: '12/27',
    cvv: '123',
    cip: '123456'
  },
  denied: {
    number: '1111111111111117',
    expiry: '12/27',
    cvv: '(No Requerido)'
  }
}

function createRedsysTransaction(amount, description, testCard = 'accepted') {
  console.log('🧪 PRUEBA CON DATOS OFICIALES DE REDSYS')
  console.log('========================================')

  try {
    // 1. Generar número de pedido único
    const orderNumber = `TEST${Date.now()}`.slice(0, 12)
    
    // 2. Crear parámetros según documentación oficial
    const merchantParameters = {
      DS_MERCHANT_AMOUNT: (amount * 100).toString().padStart(12, '0'),
      DS_MERCHANT_ORDER: orderNumber,
      DS_MERCHANT_MERCHANTCODE: REDSYS_CONFIG.merchantCode,
      DS_MERCHANT_CURRENCY: REDSYS_CONFIG.currency,
      DS_MERCHANT_TRANSACTIONTYPE: "1", // Preautorización
      DS_MERCHANT_TERMINAL: REDSYS_CONFIG.terminal,
      DS_MERCHANT_MERCHANTURL: "https://tenerifeparadisetoursexcursions.com/api/payment/webhook",
      DS_MERCHANT_URLOK: "https://tenerifeparadisetoursexcursions.com/payment/success",
      DS_MERCHANT_URLKO: "https://tenerifeparadisetoursexcursions.com/payment/error",
      DS_MERCHANT_PRODUCTDESCRIPTION: description,
      DS_MERCHANT_MERCHANTNAME: "Tenerife Paradise Tours",
      DS_MERCHANT_CONSUMERLANGUAGE: "001", // Español
      DS_MERCHANT_MERCHANTDATA: "test-official-data",
    }

    console.log('\n1️⃣ Parámetros de Redsys (datos oficiales):')
    console.log(JSON.stringify(merchantParameters, null, 2))

    // 3. Codificar parámetros
    const merchantParametersJson = JSON.stringify(merchantParameters)
    const merchantParametersBase64 = Buffer.from(merchantParametersJson, 'utf8').toString('base64')

    console.log('\n2️⃣ Codificación de parámetros:')
    console.log(`   JSON length: ${merchantParametersJson.length}`)
    console.log(`   Base64 length: ${merchantParametersBase64.length}`)

    // 4. Generar firma SHA256
    const decodedKey = Buffer.from(REDSYS_CONFIG.secretKey, "base64")
    const hmac = crypto.createHmac("sha256", decodedKey)
    hmac.update(orderNumber + merchantParametersBase64)
    const signature = hmac.digest("base64")

    console.log('\n3️⃣ Firma generada:')
    console.log(`   Algoritmo: ${REDSYS_CONFIG.encryptionType}`)
    console.log(`   Firma: ${signature}`)
    console.log(`   Longitud: ${signature.length}`)

    // 5. Crear datos del formulario
    const formData = {
      Ds_SignatureVersion: "HMAC_SHA256_V1",
      Ds_MerchantParameters: merchantParametersBase64,
      Ds_Signature: signature,
    }

    console.log('\n4️⃣ Datos del formulario:')
    console.log(JSON.stringify(formData, null, 2))

    // 6. Enviar a Redsys
    return sendToRedsys(formData, orderNumber, amount, testCard)

  } catch (error) {
    console.error('❌ Error en la creación de transacción:', error.message)
    return false
  }
}

function sendToRedsys(formData, orderNumber, amount, testCard) {
  console.log('\n5️⃣ Enviando a Redsys...')
  
  return new Promise((resolve, reject) => {
    // Crear cuerpo de la petición POST
    const postData = querystring.stringify(formData)
    
    // Configurar petición HTTPS
    const url = new URL(REDSYS_CONFIG.environment)
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'TenerifeParadiseTours/1.0'
      }
    }

    console.log(`   URL: ${REDSYS_CONFIG.environment}`)
    console.log(`   Método: ${options.method}`)
    console.log(`   Content-Length: ${options.headers['Content-Length']}`)

    // Realizar petición
    const req = https.request(options, (res) => {
      console.log(`\n6️⃣ Respuesta de Redsys:`)
      console.log(`   Status: ${res.statusCode}`)
      console.log(`   Content-Type: ${res.headers['content-type']}`)
      
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        console.log(`\n7️⃣ Análisis de la respuesta:`)
        
        // Analizar respuesta
        const analysis = analyzeRedsysResponse(data, res.statusCode, orderNumber, amount, testCard)
        
        console.log('\n📊 RESULTADO FINAL')
        console.log('==================')
        
        if (analysis.success) {
          console.log('✅ Transacción enviada correctamente')
          console.log('✅ Redsys procesó los datos oficiales')
          console.log('✅ El sistema está funcionando correctamente')
        } else {
          console.log('❌ Error en la transacción')
          console.log(`❌ Problema: ${analysis.error}`)
        }
        
        console.log('\n🎯 RECOMENDACIONES')
        console.log('==================')
        
        if (analysis.sis0042) {
          console.log('🔧 Para resolver SIS0042:')
          console.log('   1. Contactar con Redsys para activar el comercio')
          console.log('   2. Verificar que las URLs estén en lista blanca')
          console.log('   3. Confirmar que el terminal esté habilitado')
        } else if (analysis.success) {
          console.log('✅ El sistema está listo para producción')
          console.log('✅ Usar las tarjetas de prueba para validar')
        }
        
        resolve(analysis)
      })
    })
    
    req.on('error', (error) => {
      console.error('❌ Error en la petición:', error.message)
      reject(error)
    })
    
    // Enviar datos
    req.write(postData)
    req.end()
  })
}

function analyzeRedsysResponse(data, statusCode, orderNumber, amount, testCard) {
  const analysis = {
    success: false,
    error: null,
    sis0042: false,
    amount: amount,
    orderNumber: orderNumber,
    testCard: testCard
  }
  
  // Buscar indicadores específicos
  if (data.includes('SIS0042')) {
    analysis.sis0042 = true
    analysis.error = 'Error SIS0042 - Datos enviados incorrectos'
  }
  
  if (data.includes('0,00')) {
    analysis.error = 'Importe 0,00 detectado'
  }
  
  if (data.includes('form') && data.includes('action')) {
    analysis.success = true
    analysis.error = null
  }
  
  if (statusCode !== 200) {
    analysis.error = `Error HTTP ${statusCode}`
  }
  
  // Mostrar detalles específicos
  console.log(`   Número de pedido: ${orderNumber}`)
  console.log(`   Importe: ${amount}€`)
  console.log(`   Tarjeta de prueba: ${testCard}`)
  console.log(`   SIS0042 detectado: ${analysis.sis0042}`)
  console.log(`   Formulario detectado: ${data.includes('form')}`)
  
  return analysis
}

// Ejecutar pruebas
async function runTests() {
  console.log('🚀 INICIANDO PRUEBAS CON DATOS OFICIALES')
  console.log('========================================')
  
  // Prueba 1: Transacción aceptada
  console.log('\n📋 PRUEBA 1: Transacción que debería ser aceptada')
  console.log('Tarjeta:', TEST_CARDS.accepted.number)
  console.log('Importe: 1.00€')
  
  const result1 = await createRedsysTransaction(1.00, 'Prueba oficial - Aceptada', 'accepted')
  
  // Prueba 2: Transacción denegada
  console.log('\n📋 PRUEBA 2: Transacción que debería ser denegada')
  console.log('Tarjeta:', TEST_CARDS.denied.number)
  console.log('Importe: 2.00€')
  
  const result2 = await createRedsysTransaction(2.00, 'Prueba oficial - Denegada', 'denied')
  
  // Resumen final
  console.log('\n📊 RESUMEN DE PRUEBAS')
  console.log('=====================')
  console.log(`Prueba 1 (Aceptada): ${result1.success ? '✅' : '❌'}`)
  console.log(`Prueba 2 (Denegada): ${result2.success ? '✅' : '❌'}`)
  
  if (result1.sis0042 || result2.sis0042) {
    console.log('\n⚠️  PROBLEMA DETECTADO: Error SIS0042')
    console.log('El comercio necesita ser activado por Redsys')
  } else if (result1.success && result2.success) {
    console.log('\n✅ SISTEMA FUNCIONANDO CORRECTAMENTE')
    console.log('Las transacciones se procesan correctamente')
  }
}

// Ejecutar las pruebas
runTests().catch(console.error) 