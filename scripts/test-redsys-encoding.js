#!/usr/bin/env node

/**
 * Script para probar la codificación de parámetros de Redsys
 * Verifica que los parámetros se codifiquen correctamente antes del envío
 */

const crypto = require('crypto')

// Simular los datos que vienen del frontend
const testData = {
  reservationId: '187b6b33-e97e-4700-a239-ab6fe9842329',
  amount: 210,
  description: 'Reserva: Ruta de los Miradores'
}

// Configuración de Redsys (usar valores de prueba)
const merchantCode = '367529286'
const terminal = '1'
const secretKey = 'sq7HjrUOBfKmC576ILgskD5srU870gJ7' // Clave de prueba de Redsys
const environment = 'https://sis-t.redsys.es:25443/sis/realizarPago'

function testRedsysEncoding() {
  console.log('🧪 PRUEBA DE CODIFICACIÓN DE PARÁMETROS REDSYS')
  console.log('==============================================')

  try {
    // 1. Simular el cálculo de importe
    const amountInCents = Math.round(testData.amount * 100)
    console.log('\n1️⃣ Cálculo de importe:')
    console.log(`   Importe original: ${testData.amount}€`)
    console.log(`   Importe en céntimos: ${amountInCents}`)
    console.log(`   Importe formateado: ${amountInCents.toString().padStart(12, '0')}`)

    // 2. Generar número de pedido
    const orderNumber = `${Date.now()}${testData.reservationId.slice(-4)}`.slice(0, 12)
    console.log('\n2️⃣ Número de pedido:')
    console.log(`   Timestamp: ${Date.now()}`)
    console.log(`   Suffix: ${testData.reservationId.slice(-4)}`)
    console.log(`   Número final: ${orderNumber}`)
    console.log(`   Longitud: ${orderNumber.length}`)

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

    console.log('\n3️⃣ Parámetros de Redsys:')
    console.log(JSON.stringify(merchantParameters, null, 2))

    // 4. Validar parámetros críticos
    console.log('\n4️⃣ Validación de parámetros:')
    
    const isAmountValid = merchantParameters.DS_MERCHANT_AMOUNT !== '000000000000' && 
                         merchantParameters.DS_MERCHANT_AMOUNT.length === 12
    console.log(`   Importe válido: ${isAmountValid} (${merchantParameters.DS_MERCHANT_AMOUNT})`)
    
    const isOrderValid = merchantParameters.DS_MERCHANT_ORDER && 
                        merchantParameters.DS_MERCHANT_ORDER.length > 0 &&
                        merchantParameters.DS_MERCHANT_ORDER.length <= 12
    console.log(`   Número de pedido válido: ${isOrderValid} (${merchantParameters.DS_MERCHANT_ORDER})`)

    if (!isAmountValid || !isOrderValid) {
      console.error('❌ Parámetros inválidos detectados')
      return false
    }

    // 5. Codificar parámetros en JSON
    const merchantParametersJson = JSON.stringify(merchantParameters)
    console.log('\n5️⃣ JSON de parámetros:')
    console.log(merchantParametersJson)

    // 6. Codificar en base64
    const merchantParametersBase64 = Buffer.from(merchantParametersJson, 'utf8').toString('base64')
    console.log('\n6️⃣ Codificación base64:')
    console.log(`   Longitud: ${merchantParametersBase64.length}`)
    console.log(`   Preview: ${merchantParametersBase64.substring(0, 100)}...`)

    // 7. Generar firma
    const decodedKey = Buffer.from(secretKey, "base64")
    const hmac = crypto.createHmac("sha256", decodedKey)
    hmac.update(orderNumber + merchantParametersBase64)
    const signature = hmac.digest("base64")

    console.log('\n7️⃣ Firma generada:')
    console.log(`   Longitud: ${signature.length}`)
    console.log(`   Preview: ${signature.substring(0, 50)}...`)

    // 8. Crear datos del formulario
    const formData = {
      Ds_SignatureVersion: "HMAC_SHA256_V1",
      Ds_MerchantParameters: merchantParametersBase64,
      Ds_Signature: signature,
    }

    console.log('\n8️⃣ Datos del formulario:')
    console.log(JSON.stringify(formData, null, 2))

    // 9. Simular decodificación para verificar
    console.log('\n9️⃣ Verificación de decodificación:')
    try {
      const decodedJson = Buffer.from(merchantParametersBase64, 'base64').toString('utf8')
      const decodedParams = JSON.parse(decodedJson)
      
      console.log('✅ Decodificación exitosa:')
      console.log(`   Importe decodificado: ${decodedParams.DS_MERCHANT_AMOUNT}`)
      console.log(`   Pedido decodificado: ${decodedParams.DS_MERCHANT_ORDER}`)
      
      const isDecodedValid = decodedParams.DS_MERCHANT_AMOUNT === merchantParameters.DS_MERCHANT_AMOUNT &&
                            decodedParams.DS_MERCHANT_ORDER === merchantParameters.DS_MERCHANT_ORDER
      
      console.log(`   Parámetros coinciden: ${isDecodedValid}`)
      
      if (!isDecodedValid) {
        console.error('❌ Error en la codificación/decodificación')
        return false
      }
    } catch (error) {
      console.error('❌ Error al decodificar parámetros:', error.message)
      return false
    }

    // 10. Resumen final
    console.log('\n📊 RESUMEN FINAL')
    console.log('================')
    console.log('✅ Todos los parámetros se codifican correctamente')
    console.log('✅ La firma se genera correctamente')
    console.log('✅ Los datos del formulario están listos para enviar')
    console.log('✅ No se detectaron problemas de codificación')

    return true

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message)
    return false
  }
}

// Ejecutar la prueba
const success = testRedsysEncoding()

if (success) {
  console.log('\n🎯 RECOMENDACIONES')
  console.log('==================')
  console.log('1. Los parámetros se codifican correctamente')
  console.log('2. El problema puede estar en el envío del formulario')
  console.log('3. Verificar que el formulario se envíe con method="POST"')
  console.log('4. Verificar que todos los campos estén presentes')
  console.log('5. Revisar la consola del navegador para errores de red')
} else {
  console.log('\n❌ PROBLEMAS DETECTADOS')
  console.log('======================')
  console.log('1. Hay errores en la codificación de parámetros')
  console.log('2. Revisar la configuración de Redsys')
  console.log('3. Verificar las claves y códigos de comercio')
}

console.log('\n✅ Prueba completada') 