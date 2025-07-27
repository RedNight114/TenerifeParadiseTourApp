// Script con datos de prueba oficiales de Redsys
console.log('🧪 PRUEBA CON DATOS OFICIALES DE REDSYS');
console.log('========================================');

// Datos de prueba oficiales de Redsys (según documentación)
function createOfficialTestForm() {
  console.log('📋 Creando formulario con datos oficiales de Redsys...');
  
  // Datos de prueba oficiales de Redsys
  const officialTestData = {
    redsysUrl: "https://sis-t.redsys.es:25443/sis/realizarPago",
    formData: {
      Ds_SignatureVersion: "HMAC_SHA256_V1",
      // Parámetros de prueba oficiales de Redsys
      Ds_MerchantParameters: "eyJEU19NRVJDSEFOVF9BTU9VTlQiOiIxMDAiLCJEU19NRVJDSEFOVF9PUkRFUiI6IjEyMzQ1Njc4OTAiLCJEU19NRVJDSEFOVF9NRVJDSEFOVENPREUiOiI5OTkMDA4ODg4IiwiRFNfTUVSQ0hBTlRfQ1VSUkVOQ1kiOiI5NzgiLCJEU19NRVJDSEFOVF9UUkFOU0FDVElPTlRZUEUiOiIwIiwiRFNfTUVSQ0hBTlRfVEVSTUlOQUwiOiIxIiwiRFNfTUVSQ0hBTlRfTUVSQ0hBTlRVUkwiOiJodHRwOi8vd3d3Lm15c2l0ZS5jb20vbm90aWZpY2F0aW9uIiwiRFNfTUVSQ0hBTlRfVVJMT0siOiJodHRwOi8vd3d3Lm15c2l0ZS5jb20vb2siLCJEU19NRVJDSEFOVF9VUktLIjoiaHR0cDovL3d3dy5teXNpdGUuY29tL2tvIiwiRFNfTUVSQ0hBTlRfUFJPRFVDVERFU0NSSVBUSU9OIjoiUHJvZHVjdG8gZGUgcHJ1ZWJhIiwiRFNfTUVSQ0hBTlRfTUVSQ0hBTlROQU1FIjoiQ29tZXJjaW8gZGUgcHJ1ZWJhIiwiRFNfTUVSQ0hBTlRfQ09OU1VNRVJMQU5HVUFHRSI6IjAwMSIsIkRTX01FUkNIQU5UX01FUkNIQU5UREFUQSI6IkRhdG9zIGFkaWNpb25hbGVzIn0=",
      Ds_Signature: "test-signature-official"
    }
  };
  
  console.log('📊 Datos oficiales de prueba:', {
    url: officialTestData.redsysUrl,
    parametersLength: officialTestData.formData.Ds_MerchantParameters.length
  });
  
  // Decodificar parámetros para verificar
  try {
    const decoded = atob(officialTestData.formData.Ds_MerchantParameters);
    const params = JSON.parse(decoded);
    
    console.log('✅ Parámetros decodificados:', {
      amount: params.DS_MERCHANT_AMOUNT,
      order: params.DS_MERCHANT_ORDER,
      merchantCode: params.DS_MERCHANT_MERCHANTCODE,
      terminal: params.DS_MERCHANT_TERMINAL,
      currency: params.DS_MERCHANT_CURRENCY,
      transactionType: params.DS_MERCHANT_TRANSACTIONTYPE
    });
  } catch (error) {
    console.error('❌ Error decodificando parámetros:', error);
  }
  
  // Crear formulario
  const form = document.createElement("form");
  form.method = "POST";
  form.action = officialTestData.redsysUrl;
  
  Object.entries(officialTestData.formData).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
    console.log(`📝 Campo ${key}: ${value.substring(0, 50)}...`);
  });
  
  document.body.appendChild(form);
  console.log('✅ Formulario oficial creado');
  
  return form;
}

// Función para probar con datos reales pero con importe mínimo
function createMinimalTestForm() {
  console.log('💰 Creando formulario con importe mínimo...');
  
  const minimalAmount = 1; // 1€
  const amountInCents = minimalAmount * 100; // 100 céntimos
  const formattedAmount = amountInCents.toString().padStart(12, '0'); // 000000000100
  
  const merchantParameters = {
    DS_MERCHANT_AMOUNT: formattedAmount,
    DS_MERCHANT_ORDER: Date.now().toString().slice(-12),
    DS_MERCHANT_MERCHANTCODE: '367529286',
    DS_MERCHANT_CURRENCY: '978',
    DS_MERCHANT_TRANSACTIONTYPE: '1',
    DS_MERCHANT_TERMINAL: '001',
    DS_MERCHANT_MERCHANTURL: 'https://tenerifeparadisetoursexcursions.com/api/payment/webhook',
    DS_MERCHANT_URLOK: 'https://tenerifeparadisetoursexcursions.com/payment/success?reservationId=minimal-test',
    DS_MERCHANT_URLKO: 'https://tenerifeparadisetoursexcursions.com/payment/error?reservationId=minimal-test',
    DS_MERCHANT_PRODUCTDESCRIPTION: 'Prueba Importe Mínimo',
    DS_MERCHANT_MERCHANTNAME: 'Tenerife Paradise Tours',
    DS_MERCHANT_CONSUMERLANGUAGE: '001',
    DS_MERCHANT_MERCHANTDATA: 'minimal-test-reservation'
  };
  
  console.log('📊 Parámetros con importe mínimo:', {
    amount: merchantParameters.DS_MERCHANT_AMOUNT,
    originalAmount: minimalAmount,
    amountInCents: amountInCents
  });
  
  const merchantParametersJson = JSON.stringify(merchantParameters);
  const merchantParametersBase64 = btoa(merchantParametersJson);
  
  const testData = {
    redsysUrl: "https://sis-t.redsys.es:25443/sis/realizarPago",
    formData: {
      Ds_SignatureVersion: "HMAC_SHA256_V1",
      Ds_MerchantParameters: merchantParametersBase64,
      Ds_Signature: "minimal-test-signature"
    }
  };
  
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
    console.log(`📝 Campo ${key}: ${value.substring(0, 50)}...`);
  });
  
  document.body.appendChild(form);
  console.log('✅ Formulario con importe mínimo creado');
  
  return form;
}

// Crear botones de prueba
const officialButton = document.createElement('button');
officialButton.textContent = '🧪 Prueba Oficial Redsys';
officialButton.style.cssText = `
  position: fixed;
  top: 200px;
  right: 20px;
  z-index: 10000;
  background: #7c3aed;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
`;
officialButton.onclick = () => {
  const form = createOfficialTestForm();
  console.log('🚀 Enviando formulario oficial...');
  form.submit();
};

const minimalButton = document.createElement('button');
minimalButton.textContent = '💰 Prueba 1€';
minimalButton.style.cssText = `
  position: fixed;
  top: 260px;
  right: 20px;
  z-index: 10000;
  background: #ea580c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
`;
minimalButton.onclick = () => {
  const form = createMinimalTestForm();
  console.log('🚀 Enviando formulario con 1€...');
  form.submit();
};

document.body.appendChild(officialButton);
document.body.appendChild(minimalButton);

console.log('🔧 Botones de prueba oficial creados');
console.log('💡 Usa estos botones para probar si el problema es de configuración'); 