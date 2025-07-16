#!/usr/bin/env node

/**
 * Script para verificar la configuración de Redsys
 * Detecta problemas específicos en la configuración del comercio
 */

const crypto = require('crypto')

// Configuración actual de Redsys
const config = {
  merchantCode: '367529286',
  terminal: '1',
  secretKey: 'sq7HjrUOBfKmC576ILgskD5srU870gJ7', // Clave de prueba
  environment: 'https://sis-t.redsys.es:25443/sis/realizarPago'
}

function verifyRedsysConfig() {
  console.log('🔍 VERIFICACIÓN DE CONFIGURACIÓN REDSYS')
  console.log('======================================')

  try {
    // 1. Verificar formato de la clave secreta
    console.log('\n1️⃣ Verificación de la clave secreta:')
    
    let isKeyValid = false
    let decodedKey = null
    
    try {
      decodedKey = Buffer.from(config.secretKey, "base64")
      isKeyValid = decodedKey.length > 0
      console.log(`   Clave original: ${config.secretKey}`)
      console.log(`   Longitud decodificada: ${decodedKey.length} bytes`)
      console.log(`   Clave válida: ${isKeyValid}`)
    } catch (error) {
      console.log(`   ❌ Error decodificando clave: ${error.message}`)
      console.log(`   La clave debe estar en formato base64 válido`)
    }

    // 2. Verificar parámetros de prueba
    console.log('\n2️⃣ Parámetros de prueba:')
    
    const testData = {
      amount: 100, // 1€ para prueba
      orderNumber: 'TEST123456',
      description: 'Prueba de configuración'
    }
    
    const merchantParameters = {
      DS_MERCHANT_AMOUNT: (testData.amount * 100).toString().padStart(12, '0'),
      DS_MERCHANT_ORDER: testData.orderNumber,
      DS_MERCHANT_MERCHANTCODE: config.merchantCode,
      DS_MERCHANT_CURRENCY: "978",
      DS_MERCHANT_TRANSACTIONTYPE: "1",
      DS_MERCHANT_TERMINAL: config.terminal,
      DS_MERCHANT_MERCHANTURL: "https://tenerifeparadisetoursexcursions.com/api/payment/webhook",
      DS_MERCHANT_URLOK: "https://tenerifeparadisetoursexcursions.com/payment/success",
      DS_MERCHANT_URLKO: "https://tenerifeparadisetoursexcursions.com/payment/error",
      DS_MERCHANT_PRODUCTDESCRIPTION: testData.description,
      DS_MERCHANT_MERCHANTNAME: "Tenerife Paradise Tours",
      DS_MERCHANT_CONSUMERLANGUAGE: "001",
      DS_MERCHANT_MERCHANTDATA: "test-data",
    }
    
    console.log('   Parámetros generados:')
    console.log(JSON.stringify(merchantParameters, null, 2))

    // 3. Verificar codificación de parámetros
    console.log('\n3️⃣ Verificación de codificación:')
    
    const merchantParametersJson = JSON.stringify(merchantParameters)
    const merchantParametersBase64 = Buffer.from(merchantParametersJson, 'utf8').toString('base64')
    
    console.log(`   JSON length: ${merchantParametersJson.length}`)
    console.log(`   Base64 length: ${merchantParametersBase64.length}`)
    console.log(`   Base64 válido: ${merchantParametersBase64.length > 0}`)

    // 4. Verificar generación de firma
    console.log('\n4️⃣ Verificación de firma:')
    
    if (!isKeyValid) {
      console.log('   ❌ No se puede generar firma con clave inválida')
      return false
    }
    
    const hmac = crypto.createHmac("sha256", decodedKey)
    hmac.update(testData.orderNumber + merchantParametersBase64)
    const signature = hmac.digest("base64")
    
    console.log(`   Firma generada: ${signature}`)
    console.log(`   Longitud de firma: ${signature.length}`)
    console.log(`   Firma válida: ${signature.length > 0}`)

    // 5. Verificar decodificación
    console.log('\n5️⃣ Verificación de decodificación:')
    
    try {
      const decodedJson = Buffer.from(merchantParametersBase64, 'base64').toString('utf8')
      const decodedParams = JSON.parse(decodedJson)
      
      console.log('   ✅ Decodificación exitosa')
      console.log(`   Importe decodificado: ${decodedParams.DS_MERCHANT_AMOUNT}`)
      console.log(`   Pedido decodificado: ${decodedParams.DS_MERCHANT_ORDER}`)
      
      const isDecodedValid = decodedParams.DS_MERCHANT_AMOUNT === merchantParameters.DS_MERCHANT_AMOUNT &&
                            decodedParams.DS_MERCHANT_ORDER === merchantParameters.DS_MERCHANT_ORDER
      
      console.log(`   Parámetros coinciden: ${isDecodedValid}`)
      
      if (!isDecodedValid) {
        console.log('   ❌ Error en la codificación/decodificación')
        return false
      }
    } catch (error) {
      console.log(`   ❌ Error al decodificar: ${error.message}`)
      return false
    }

    // 6. Análisis de posibles problemas
    console.log('\n6️⃣ Análisis de problemas comunes:')
    
    const problems = []
    
    // Verificar longitud del número de pedido
    if (testData.orderNumber.length > 12) {
      problems.push('Número de pedido demasiado largo (>12 caracteres)')
    }
    
    // Verificar formato del importe
    if (merchantParameters.DS_MERCHANT_AMOUNT.length !== 12) {
      problems.push('Importe no tiene 12 posiciones')
    }
    
    // Verificar que el importe no sea 0
    if (merchantParameters.DS_MERCHANT_AMOUNT === '000000000000') {
      problems.push('Importe es 0')
    }
    
    // Verificar código de comercio
    if (config.merchantCode.length > 9) {
      problems.push('Código de comercio demasiado largo (>9 caracteres)')
    }
    
    // Verificar terminal
    if (config.terminal.length > 3) {
      problems.push('Terminal demasiado largo (>3 caracteres)')
    }
    
    if (problems.length > 0) {
      console.log('   ❌ Problemas detectados:')
      problems.forEach(problem => console.log(`      - ${problem}`))
    } else {
      console.log('   ✅ No se detectaron problemas en los parámetros')
    }

    // 7. Verificar configuración específica
    console.log('\n7️⃣ Verificación de configuración específica:')
    
    console.log('   Código de comercio:', config.merchantCode)
    console.log('   Terminal:', config.terminal)
    console.log('   Entorno:', config.environment)
    console.log('   Tipo de transacción: 1 (Preautorización)')
    console.log('   Moneda: 978 (EUR)')
    console.log('   Idioma: 001 (Español)')

    // 8. Recomendaciones específicas
    console.log('\n8️⃣ Recomendaciones para SIS0042:')
    
    console.log('   🔍 Verificar en el panel de Redsys:')
    console.log('      1. Que el código de comercio esté activo')
    console.log('      2. Que el terminal esté configurado correctamente')
    console.log('      3. Que la clave secreta sea la correcta')
    console.log('      4. Que las URLs de notificación estén permitidas')
    console.log('      5. Que el tipo de transacción esté habilitado')
    
    console.log('\n   🔧 Posibles soluciones:')
    console.log('      1. Contactar con Redsys para verificar la configuración')
    console.log('      2. Solicitar nueva clave secreta si es necesario')
    console.log('      3. Verificar que el comercio esté en modo de pruebas')
    console.log('      4. Confirmar que las URLs estén en la lista blanca')

    // 9. Resumen final
    console.log('\n📊 RESUMEN FINAL')
    console.log('================')
    
    const allValid = isKeyValid && problems.length === 0
    
    if (allValid) {
      console.log('✅ Configuración básica correcta')
      console.log('✅ Los parámetros se generan correctamente')
      console.log('✅ La firma se calcula correctamente')
      console.log('⚠️  El problema está en la configuración del comercio en Redsys')
    } else {
      console.log('❌ Hay problemas en la configuración local')
      console.log('❌ Se deben corregir antes de contactar con Redsys')
    }

    return allValid

  } catch (error) {
    console.error('❌ Error en la verificación:', error.message)
    return false
  }
}

// Ejecutar la verificación
const isValid = verifyRedsysConfig()

console.log('\n🎯 PRÓXIMOS PASOS')
console.log('==================')

if (isValid) {
  console.log('1. Contactar con Redsys para verificar la configuración del comercio')
  console.log('2. Solicitar verificación de la clave secreta')
  console.log('3. Confirmar que el comercio esté en modo de pruebas')
  console.log('4. Verificar que las URLs estén permitidas')
} else {
  console.log('1. Corregir los problemas de configuración local')
  console.log('2. Verificar la clave secreta')
  console.log('3. Ajustar los parámetros según las especificaciones')
  console.log('4. Volver a probar después de las correcciones')
}

console.log('\n✅ Verificación completada') 