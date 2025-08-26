// Script para probar diferentes formatos de importe en Redsys
console.log('🧪 PRUEBA DE FORMATO DE IMPORTE EN REDSYS');
console.log('==========================================');

// Función para probar diferentes formatos de importe
function testAmountFormats() {
  const testAmounts = [
    { original: 30, expected: '000000003000', description: '30€ en céntimos' },
    { original: 30.50, expected: '000000003050', description: '30.50€ en céntimos' },
    { original: 1, expected: '000000000100', description: '1€ en céntimos' },
    { original: 0.01, expected: '000000000001', description: '0.01€ en céntimos' },
    { original: 100, expected: '000000010000', description: '100€ en céntimos' }
  ];

  console.log('📊 Formatos de importe a probar:');
  testAmounts.forEach((test, index) => {
    const amountInCents = Math.round(test.original * 100);
    const formatted = amountInCents.toString().padStart(12, '0');
    
    console.log(`${index + 1}. ${test.description}:`);
    console.log(`   Original: ${test.original}€`);
    console.log(`   En céntimos: ${amountInCents}`);
    console.log(`   Formateado: ${formatted}`);
    console.log(`   Esperado: ${test.expected}`);
    console.log(`   ✅ Correcto: ${formatted === test.expected}`);
    console.log('');
  });
}

// Función para simular el envío a Redsys con diferentes formatos
function simulateRedsysSubmission() {
  console.log('🌐 SIMULACIÓN DE ENVÍO A REDSYS');
  console.log('================================');
  
  const testAmount = 30; // 30€
  const amountInCents = Math.round(testAmount * 100); // 3000 céntimos
  const formattedAmount = amountInCents.toString().padStart(12, '0'); // 000000003000
  
  console.log('💰 Datos de prueba:', {
    originalAmount: testAmount,
    amountInCents,
    formattedAmount,
    formattedLength: formattedAmount.length
  });
  
  // Simular parámetros de Redsys
  const merchantParameters = {
    DS_MERCHANT_AMOUNT: formattedAmount,
    DS_MERCHANT_ORDER: '175328002186',
    DS_MERCHANT_MERCHANTCODE: '367529286',
    DS_MERCHANT_CURRENCY: '978',
    DS_MERCHANT_TRANSACTIONTYPE: '1',
    DS_MERCHANT_TERMINAL: '001',
    DS_MERCHANT_MERCHANTURL: 'https://tenerifeparadisetoursexcursions.com/api/payment/webhook',
    DS_MERCHANT_URLOK: 'https://tenerifeparadisetoursexcursions.com/payment/success?reservationId=test',
    DS_MERCHANT_URLKO: 'https://tenerifeparadisetoursexcursions.com/payment/error?reservationId=test',
    DS_MERCHANT_PRODUCTDESCRIPTION: 'Reserva: Test',
    DS_MERCHANT_MERCHANTNAME: 'Tenerife Paradise Tours',
    DS_MERCHANT_CONSUMERLANGUAGE: '001',
    DS_MERCHANT_MERCHANTDATA: 'test-reservation-id'
  };
  
  console.log('📋 Parámetros de Redsys:', merchantParameters);
  
  // Codificar en base64
  const merchantParametersJson = JSON.stringify(merchantParameters);
  const merchantParametersBase64 = btoa(merchantParametersJson);
  
  console.log('🔍 Codificación Base64:', {
    jsonLength: merchantParametersJson.length,
    base64Length: merchantParametersBase64.length,
    base64Preview: `${merchantParametersBase64.substring(0, 100)  }...`
  });
  
  // Decodificar para verificar
  try {
    const decoded = atob(merchantParametersBase64);
    const decodedParams = JSON.parse(decoded);
    
    console.log('✅ Verificación de decodificación:', {
      decodedAmount: decodedParams.DS_MERCHANT_AMOUNT,
      originalAmount: formattedAmount,
      match: decodedParams.DS_MERCHANT_AMOUNT === formattedAmount
    });
  } catch (error) {
    console.error('❌ Error en decodificación:', error);
  }
}

// Función para crear formulario de prueba
function createTestForm() {
  console.log('📝 CREANDO FORMULARIO DE PRUEBA');
  console.log('================================');
  
  const testData = {
    redsysUrl: "https://sis-t.redsys.es:25443/sis/realizarPago",
    formData: {
      Ds_SignatureVersion: "HMAC_SHA256_V1",
      Ds_MerchantParameters: "eyJEU19NRVJDSEFOVF9BTU9VTlQiOiIwMDAwMDAwMDMwMDAiLCJEU19NRVJDSEFOVF9PUkRFUiI6IjE3NTMyODAwMjE4NiIsIkRTX01FUkNIQU5UX01FUkNIQU5UQ09ERSI6IjM2NzUyOTI4NiIsIkRTX01FUkNIQU5UX0NVUlJFTkNZIjoiOTc4IiwiRFNfTUVSQ0hBTlRfVFJBTlNBQ1RJT05UWVBFIjoiMSIsIkRTX01FUkNIQU5UX1RFUk1JTkFMIjoiMDAxIiwiRFNfTUVSQ0hBTlRfTUVSQ0hBTlRVUkwiOiJodHRwczovL3RlbmVyaWZlcGFyYWRpc2V0b3Vyc2V4Y3Vyc2lvbnMuY29tL2FwaS9wYXltZW50L3dlYmhvb2siLCJEU19NRVJDSEFOVF9VUkxPSyI6Imh0dHBzOi8vdGVuZXJpZmVwYXJhZGlzZXRvdXJzZXhjdXJzaW9ucy5jb20vcGF5bWVudC9zdWNjZXNzP3Jlc2VydmF0aW9uSWQ9dGVzdCIsIkRTX01FUkNIQU5UX1VSTEsiOiJodHRwczovL3RlbmVyaWZlcGFyYWRpc2V0b3Vyc2V4Y3Vyc2lvbnMuY29tL3BheW1lbnQvZXJyb3I/cmVzZXJ2YXRpb25JZD10ZXN0IiwiRFNfTUVSQ0hBTlRfUFJPRFVDVERFU0NSSVBUSU9OIjoiUmVzZXJ2YTogVGVzdCIsIkRTX01FUkNIQU5UX01FUkNIQU5UTkFNRSI6IlRlbmVyaWZlIFBhcmFkaXNlIFRvdXJzIiwiRFNfTUVSQ0hBTlRfQ09OU1VNRVJMQU5HVUFHRSI6IjAwMSIsIkRTX01FUkNIQU5UX01FUkNIQU5UREFUQSI6InRlc3QtcmVzZXJ2YXRpb24taWQifQ==",
      Ds_Signature: "test-signature"
    }
  };
  
  console.log('📊 Datos de prueba:', testData);
  
  // Crear formulario
  const form = document.createElement("form");
  form.method = "POST";
  form.action = testData.redsysUrl;
  
  Object.entries(testData.formData).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
    console.log(`📝 Campo ${key}: ${value}`);
  });
  
  document.body.appendChild(form);
  console.log('✅ Formulario de prueba creado');
  
  return form;
}

// Ejecutar pruebas
testAmountFormats();
simulateRedsysSubmission();

// Crear botón para formulario de prueba
const testButton = document.createElement('button');
testButton.textContent = '🧪 Probar Formato Importe';
testButton.style.cssText = `
  position: fixed;
  top: 140px;
  right: 20px;
  z-index: 10000;
  background: #059669;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
`;
testButton.onclick = () => {
  const form = createTestForm();
  console.log('🚀 Enviando formulario de prueba...');
  form.submit();
};
document.body.appendChild(testButton);

console.log('🔧 Botón de prueba de formato creado'); 