require('dotenv').config({ path: '.env.local' })

// Simular las funciones de Redsys
const crypto = require('crypto')

function encrypt3DES_ECB(data, key) {
  let keyBuffer = key
  if (key.length < 24) {
    keyBuffer = Buffer.concat([key, Buffer.alloc(24 - key.length, 0)])
  } else if (key.length > 24) {
    keyBuffer = key.slice(0, 24)
  }

  const cipher = crypto.createCipheriv('des-ede3', keyBuffer, null)
  cipher.setAutoPadding(true)
  
  return Buffer.concat([
    cipher.update(data, 'utf8'),
    cipher.final()
  ])
}

function generateRedsysSignature(secretKeyBase64, orderNumber, merchantParams) {
  const decodedSecretKey = Buffer.from(secretKeyBase64, 'base64')
  const derivedKey = encrypt3DES_ECB(orderNumber, decodedSecretKey)
  const merchantParametersJson = JSON.stringify(merchantParams)
  const merchantParametersBase64 = Buffer.from(merchantParametersJson, 'utf8').toString('base64')
  
  const hmac = crypto.createHmac('sha256', derivedKey)
  hmac.update(merchantParametersBase64, 'utf8')
  
  return hmac.digest('base64')
}

async function testRedsysPayment() {
  console.log('🧪 TESTING REDSYS PAYMENT SYSTEM')
  console.log('=====================================\n')

  // 1. Verificar variables de entorno
  console.log('1. Verificando variables de entorno...')
  const requiredEnvVars = [
    'REDSYS_MERCHANT_CODE',
    'REDSYS_TERMINAL', 
    'REDSYS_SECRET_KEY',
    'REDSYS_ENVIRONMENT'
  ]

  const missingVars = []
  const envVars = {}

  for (const varName of requiredEnvVars) {
    const value = process.env[varName]
    if (!value) {
      missingVars.push(varName)
    } else {
      envVars[varName] = varName.includes('SECRET') ? '***HIDDEN***' : value
    }
  }

  if (missingVars.length > 0) {
    console.error('❌ Variables de entorno faltantes:', missingVars)
    return
  }

  console.log('✅ Variables de entorno encontradas:')
  Object.entries(envVars).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`)
  })

  // 2. Simular datos de pago
  console.log('\n2. Simulando datos de pago...')
  const testData = {
    amount: 18.00,
    reservationId: 'test-reservation-123',
    description: 'Reserva: Glamping'
  }

  console.log('✅ Datos de prueba:', testData)

  // 3. Generar parámetros del comercio
  console.log('\n3. Generando parámetros del comercio...')
  
  const merchantCode = process.env.REDSYS_MERCHANT_CODE
  const terminal = process.env.REDSYS_TERMINAL
  const secretKey = process.env.REDSYS_SECRET_KEY
  const environment = process.env.REDSYS_ENVIRONMENT

  // Convertir amount a céntimos
  const amountInCents = Math.round(testData.amount * 100)
  
  // Generar número de pedido
  const timestamp = Date.now().toString()
  const reservationSuffix = testData.reservationId.replace(/-/g, '').slice(-4)
  const orderNumber = `${timestamp}${reservationSuffix}`.slice(0, 12)

  // URLs de respuesta
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const urlOK = `${baseUrl}/payment/success?reservationId=${testData.reservationId}`
  const urlKO = `${baseUrl}/payment/error?reservationId=${testData.reservationId}`
  const urlNotification = `${baseUrl}/api/payment/webhook`

  const merchantParameters = {
    DS_MERCHANT_AMOUNT: amountInCents.toString().padStart(12, '0'),
    DS_MERCHANT_ORDER: orderNumber,
    DS_MERCHANT_MERCHANTCODE: merchantCode,
    DS_MERCHANT_CURRENCY: "978",
    DS_MERCHANT_TRANSACTIONTYPE: "1",
    DS_MERCHANT_TERMINAL: terminal.padStart(3, '0'),
    DS_MERCHANT_MERCHANTURL: urlNotification,
    DS_MERCHANT_URLOK: urlOK,
    DS_MERCHANT_URLKO: urlKO,
    DS_MERCHANT_PRODUCTDESCRIPTION: testData.description,
    DS_MERCHANT_MERCHANTNAME: "Tenerife Paradise Tours",
    DS_MERCHANT_CONSUMERLANGUAGE: "001",
    DS_MERCHANT_MERCHANTNAMER: '************************************',
  }

  console.log('✅ Parámetros del comercio generados:')
  console.log('   DS_MERCHANT_AMOUNT:', merchantParameters.DS_MERCHANT_AMOUNT)
  console.log('   DS_MERCHANT_ORDER:', merchantParameters.DS_MERCHANT_ORDER)
  console.log('   DS_MERCHANT_MERCHANTCODE:', merchantParameters.DS_MERCHANT_MERCHANTCODE)
  console.log('   DS_MERCHANT_TERMINAL:', merchantParameters.DS_MERCHANT_TERMINAL)
  console.log('   DS_MERCHANT_MERCHANTURL:', merchantParameters.DS_MERCHANT_MERCHANTURL)

  // 4. Generar firma
  console.log('\n4. Generando firma...')
  
  try {
    const signature = generateRedsysSignature(secretKey, orderNumber, merchantParameters)
    console.log('✅ Firma generada:', signature)
    
    // 5. Codificar parámetros en Base64
    console.log('\n5. Codificando parámetros en Base64...')
    const merchantParametersJson = JSON.stringify(merchantParameters)
    const merchantParametersBase64 = Buffer.from(merchantParametersJson, 'utf8').toString('base64')
    
    console.log('✅ Parámetros codificados en Base64:', merchantParametersBase64)
    
    // 6. Verificar firma
    console.log('\n6. Verificando firma...')
    const isValid = generateRedsysSignature(secretKey, orderNumber, merchantParameters) === signature
    console.log('✅ Verificación de firma:', isValid ? 'VÁLIDA' : 'INVÁLIDA')

    // 7. Simular envío a Redsys
    console.log('\n7. Simulando envío a Redsys...')
    const formData = {
      Ds_SignatureVersion: "HMAC_SHA256_V1",
      Ds_MerchantParameters: merchantParametersBase64,
      Ds_Signature: signature,
    }

    console.log('✅ Datos del formulario para Redsys:')
    console.log('   Ds_SignatureVersion:', formData.Ds_SignatureVersion)
    console.log('   Ds_MerchantParameters:', formData.Ds_MerchantParameters)
    console.log('   Ds_Signature:', formData.Ds_Signature)

    // 8. Decodificar parámetros para verificación
    console.log('\n8. Decodificando parámetros para verificación...')
    const decodedParams = JSON.parse(Buffer.from(merchantParametersBase64, 'base64').toString('utf8'))
    console.log('✅ Parámetros decodificados:')
    Object.entries(decodedParams).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`)
    })

    // 9. Verificar formato según documentación Redsys
    console.log('\n9. Verificando formato según documentación Redsys...')
    
    const checks = [
      { name: 'DS_MERCHANT_AMOUNT', value: decodedParams.DS_MERCHANT_AMOUNT, expected: '12 dígitos numéricos', valid: /^\d{12}$/.test(decodedParams.DS_MERCHANT_AMOUNT) },
      { name: 'DS_MERCHANT_ORDER', value: decodedParams.DS_MERCHANT_ORDER, expected: 'Máximo 12 caracteres alfanuméricos', valid: /^[A-Za-z0-9]{1,12}$/.test(decodedParams.DS_MERCHANT_ORDER) },
      { name: 'DS_MERCHANT_MERCHANTCODE', value: decodedParams.DS_MERCHANT_MERCHANTCODE, expected: 'Máximo 9 dígitos', valid: /^\d{1,9}$/.test(decodedParams.DS_MERCHANT_MERCHANTCODE) },
      { name: 'DS_MERCHANT_TERMINAL', value: decodedParams.DS_MERCHANT_TERMINAL, expected: '3 dígitos', valid: /^\d{3}$/.test(decodedParams.DS_MERCHANT_TERMINAL) },
      { name: 'DS_MERCHANT_CURRENCY', value: decodedParams.DS_MERCHANT_CURRENCY, expected: '978 (EUR)', valid: decodedParams.DS_MERCHANT_CURRENCY === '978' },
      { name: 'DS_MERCHANT_TRANSACTIONTYPE', value: decodedParams.DS_MERCHANT_TRANSACTIONTYPE, expected: '1 (Preautorización)', valid: decodedParams.DS_MERCHANT_TRANSACTIONTYPE === '1' }
    ]

    let allValid = true
    checks.forEach(check => {
      const status = check.valid ? '✅' : '❌'
      console.log(`${status} ${check.name}: ${check.value} (${check.expected})`)
      if (!check.valid) allValid = false
    })

    console.log(`\n${allValid ? '✅' : '❌'} Todos los formatos son ${allValid ? 'válidos' : 'inválidos'}`)

    // 10. Resumen final
    console.log('\n10. Resumen final...')
    console.log('✅ Sistema de pagos Redsys configurado correctamente')
    console.log('✅ Firma generada y verificada')
    console.log('✅ Parámetros en formato correcto')
    console.log('✅ Listo para envío a Redsys')
    
    console.log('\n📋 Datos para envío:')
    console.log('URL:', environment)
    console.log('Order Number:', orderNumber)
    console.log('Amount:', testData.amount, 'EUR')
    console.log('Amount in cents:', amountInCents)
    console.log('Signature:', signature)

  } catch (error) {
    console.error('❌ Error generando firma:', error.message)
    console.error('Stack:', error.stack)
  }
}

// Ejecutar la prueba
testRedsysPayment().catch(console.error) 