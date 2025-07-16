#!/usr/bin/env node

/**
 * Script para probar el envío del formulario a Redsys
 * Simula exactamente lo que hace el frontend
 */

const https = require('https')
const querystring = require('querystring')

// Datos de prueba (usar los mismos que en el test anterior)
const testData = {
  reservationId: '187b6b33-e97e-4700-a239-ab6fe9842329',
  amount: 210,
  description: 'Reserva: Ruta de los Miradores'
}

// Configuración de Redsys
const merchantCode = '367529286'
const terminal = '1'
const secretKey = 'sq7HjrUOBfKmC576ILgskD5srU870gJ7' // Clave de prueba
const environment = 'https://sis-t.redsys.es:25443/sis/realizarPago'

function generateRedsysFormData() {
  // 1. Calcular importe en céntimos
  const amountInCents = Math.round(testData.amount * 100)
  
  // 2. Generar número de pedido
  const orderNumber = `${Date.now()}${testData.reservationId.slice(-4)}`.slice(0, 12)
  
  // 3. Crear parámetros de Redsys
  const merchantParameters = {
    DS_MERCHANT_AMOUNT: amountInCents.toString().padStart(12, '0'),
    DS_MERCHANT_ORDER: orderNumber,
    DS_MERCHANT_MERCHANTCODE: merchantCode,
    DS_MERCHANT_CURRENCY: "978",
    DS_MERCHANT_TRANSACTIONTYPE: "1",
    DS_MERCHANT_TERMINAL: terminal,
    DS_MERCHANT_MERCHANTURL: "https://tenerifeparadisetoursexcursions.com/api/payment/webhook",
    DS_MERCHANT_URLOK: "https://tenerifeparadisetoursexcursions.com/payment/success?reservationId=" + testData.reservationId,
    DS_MERCHANT_URLKO: "https://tenerifeparadisetoursexcursions.com/payment/error?reservationId=" + testData.reservationId,
    DS_MERCHANT_PRODUCTDESCRIPTION: testData.description,
    DS_MERCHANT_MERCHANTNAME: "Tenerife Paradise Tours",
    DS_MERCHANT_CONSUMERLANGUAGE: "001",
    DS_MERCHANT_MERCHANTDATA: testData.reservationId,
  }
  
  // 4. Codificar parámetros
  const merchantParametersJson = JSON.stringify(merchantParameters)
  const merchantParametersBase64 = Buffer.from(merchantParametersJson, 'utf8').toString('base64')
  
  // 5. Generar firma
  const crypto = require('crypto')
  const decodedKey = Buffer.from(secretKey, "base64")
  const hmac = crypto.createHmac("sha256", decodedKey)
  hmac.update(orderNumber + merchantParametersBase64)
  const signature = hmac.digest("base64")
  
  // 6. Crear datos del formulario
  const formData = {
    Ds_SignatureVersion: "HMAC_SHA256_V1",
    Ds_MerchantParameters: merchantParametersBase64,
    Ds_Signature: signature,
  }
  
  return {
    formData,
    orderNumber,
    amount: testData.amount,
    amountInCents,
    merchantParameters
  }
}

function testFormSubmission() {
  console.log('🧪 PRUEBA DE ENVÍO DE FORMULARIO A REDSYS')
  console.log('==========================================')

  try {
    // Generar datos del formulario
    const { formData, orderNumber, amount, amountInCents, merchantParameters } = generateRedsysFormData()
    
    console.log('\n1️⃣ Datos generados:')
    console.log(`   Número de pedido: ${orderNumber}`)
    console.log(`   Importe: ${amount}€ (${amountInCents} céntimos)`)
    console.log(`   Importe formateado: ${merchantParameters.DS_MERCHANT_AMOUNT}`)
    
    console.log('\n2️⃣ Parámetros de Redsys:')
    console.log(JSON.stringify(merchantParameters, null, 2))
    
    console.log('\n3️⃣ Datos del formulario:')
    console.log(JSON.stringify(formData, null, 2))
    
    // Simular el envío del formulario
    console.log('\n4️⃣ Simulando envío del formulario...')
    
    // Crear el cuerpo de la petición POST
    const postData = querystring.stringify(formData)
    
    console.log('\n5️⃣ Datos POST a enviar:')
    console.log(postData)
    
    // Configurar la petición HTTPS
    const url = new URL(environment)
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
    
    console.log('\n6️⃣ Configuración de la petición:')
    console.log(`   Hostname: ${options.hostname}`)
    console.log(`   Port: ${options.port}`)
    console.log(`   Path: ${options.path}`)
    console.log(`   Method: ${options.method}`)
    console.log(`   Content-Length: ${options.headers['Content-Length']}`)
    
    // Realizar la petición
    const req = https.request(options, (res) => {
      console.log(`\n7️⃣ Respuesta de Redsys:`)
      console.log(`   Status: ${res.statusCode}`)
      console.log(`   Headers:`, res.headers)
      
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        console.log(`\n8️⃣ Cuerpo de la respuesta:`)
        console.log(data)
        
        // Analizar la respuesta
        if (res.statusCode === 200) {
          console.log('\n✅ Petición enviada correctamente')
          
          // Verificar si la respuesta contiene el formulario de Redsys
          if (data.includes('form') || data.includes('Ds_')) {
            console.log('✅ Redsys respondió con el formulario de pago')
          } else {
            console.log('⚠️  Redsys respondió pero no se detectó el formulario de pago')
          }
        } else {
          console.log(`❌ Error en la respuesta: ${res.statusCode}`)
        }
        
        console.log('\n📊 ANÁLISIS DE LA RESPUESTA')
        console.log('===========================')
        
        // Buscar indicadores de error
        if (data.includes('SIS0042')) {
          console.log('❌ Error SIS0042 detectado en la respuesta')
        }
        
        if (data.includes('0,00')) {
          console.log('❌ Importe 0,00 detectado en la respuesta')
        }
        
        if (data.includes('error') || data.includes('Error')) {
          console.log('❌ Mensaje de error detectado en la respuesta')
        }
        
        if (data.includes('form') && data.includes('action')) {
          console.log('✅ Formulario de pago detectado en la respuesta')
        }
        
        console.log('\n🎯 RECOMENDACIONES')
        console.log('==================')
        
        if (res.statusCode === 200 && data.includes('form')) {
          console.log('1. La petición se envía correctamente')
          console.log('2. Redsys responde con el formulario de pago')
          console.log('3. El problema puede estar en el procesamiento de Redsys')
          console.log('4. Verificar la configuración del comercio en Redsys')
        } else {
          console.log('1. Hay un problema en el envío de la petición')
          console.log('2. Verificar la configuración de Redsys')
          console.log('3. Revisar los parámetros enviados')
        }
      })
    })
    
    req.on('error', (error) => {
      console.error('❌ Error en la petición:', error.message)
    })
    
    // Enviar los datos
    req.write(postData)
    req.end()
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message)
  }
}

// Ejecutar la prueba
testFormSubmission()

console.log('\n✅ Prueba completada')
console.log('\n💡 NOTA: Esta prueba simula el envío real a Redsys.')
console.log('   Si funciona, el problema está en el frontend.')
console.log('   Si falla, el problema está en la configuración de Redsys.') 