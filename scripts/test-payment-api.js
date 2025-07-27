require('dotenv').config({ path: '.env.local' })

async function testPaymentAPI() {
  console.log('🧪 TESTING PAYMENT API')
  console.log('========================\n')

  const testData = {
    amount: 18.00,
    reservationId: '4d7a591b-d143-4677-9c02-b5d81a2c89c2', // UUID válido
    description: 'Reserva: Glamping'
  }

  console.log('📤 Enviando datos a la API:', testData)

  try {
    // Simular la llamada a la API
    const response = await fetch('http://localhost:3000/api/payment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    const result = await response.json()

    console.log('📥 Respuesta de la API:')
    console.log('Status:', response.status)
    console.log('Headers:', Object.fromEntries(response.headers.entries()))
    console.log('Body:', JSON.stringify(result, null, 2))

    if (response.ok) {
      console.log('\n✅ API funcionando correctamente')
      console.log('✅ Firma generada:', result.formData.Ds_Signature)
      console.log('✅ Parámetros codificados:', result.formData.Ds_MerchantParameters)
      console.log('✅ URL de Redsys:', result.redsysUrl)
      
      // Decodificar parámetros para verificación
      const decodedParams = JSON.parse(Buffer.from(result.formData.Ds_MerchantParameters, 'base64').toString('utf8'))
      console.log('\n📋 Parámetros decodificados:')
      Object.entries(decodedParams).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`)
      })

      console.log('\n🎯 Próximo paso: Probar el formulario de envío a Redsys')
      
      // Crear formulario HTML para probar Redsys
      console.log('\n📝 Formulario HTML para probar Redsys:')
      console.log(`
<!DOCTYPE html>
<html>
<head>
    <title>Test Redsys Payment</title>
</head>
<body>
    <h1>Test Redsys Payment</h1>
    <form action="${result.redsysUrl}" method="POST">
        <input type="hidden" name="Ds_SignatureVersion" value="${result.formData.Ds_SignatureVersion}">
        <input type="hidden" name="Ds_MerchantParameters" value="${result.formData.Ds_MerchantParameters}">
        <input type="hidden" name="Ds_Signature" value="${result.formData.Ds_Signature}">
        <button type="submit">Procesar Pago</button>
    </form>
</body>
</html>
      `)
    } else {
      console.error('\n❌ Error en la API:', result.error)
      console.error('Detalles:', result.details)
    }

  } catch (error) {
    console.error('\n❌ Error de conexión:', error.message)
    console.log('\n💡 Asegúrate de que el servidor esté ejecutándose: npm run dev')
  }
}

// Ejecutar la prueba
testPaymentAPI().catch(console.error) 