// Simular el procesamiento del frontend
function simulateFrontendProcessing() {
  console.log('🧪 SIMULANDO PROCESAMIENTO DEL FRONTEND');
  console.log('========================================');

  // Simular datos de respuesta de la API (basado en los logs del servidor)
  const paymentData = {
    redsysUrl: "https://sis-t.redsys.es:25443/sis/realizarPago",
    formData: {
      Ds_SignatureVersion: "HMAC_SHA256_V1",
      Ds_MerchantParameters: "eyJEU19NRVJDSEFOVF9BTU9VTlQiOiIwMDAwMDAwMTgwMDAiLCJEU19NRVJDSEFOVF9PUkRFUiI6IjE3NTMyNzk3MDYyNiIsIkRTX01FUkNIQU5UX01FUkNIQU5UQ09ERSI6IjM2NzUyOTI4NiIsIkRTX01FUkNIQU5UX0NVUlJFTkNZIjoiOTc4IiwiRFNfTUVSQ0hBTlRfVFJBTlNBQ1RJT05UWVBFIjoiMSIsIkRTX01FUkNIQU5UX1RFUk1JTkFMIjoiMDAxIiwiRFNfTUVSQ0hBTlRfTUVSQ0hBTlRVUkwiOiJodHRwczovL3RlbmVyaWZlcGFyYWRpc2V0b3Vyc2V4Y3Vyc2lvbnMuY29tL2FwaS9wYXltZW50L3dlYmhvb2siLCJEU19NRVJDSEFOVF9VUkxPSyI6Imh0dHBzOi8vdGVuZXJpZmVwYXJhZGlzZXRvdXJzZXhjdXJzaW9ucy5jb20vcGF5bWVudC9zdWNjZXNzP3Jlc2VydmF0aW9uSWQ9ZmU0YzAyNTYtZGNjYS00OTY2LWFmNGEtZTRlZDRhMzM4Y2IyIiwiRFNfTUVSQ0hBTlRfVVJMS08iOiJodHRwczovL3RlbmVyaWZlcGFyYWRpc2V0b3Vyc2V4Y3Vyc2lvbnMuY29tL3BheW1lbnQvZXJyb3I/cmVzZXJ2YXRpb25JZD1mZTRjMDI1Ni1kY2NhLTQ5NjYtYWY0YS1lNGVkNGEzMzhjYjIiLCJEU19NRVJDSEFOVF9QUk9EVUNUREVTQ1JJUFRJT04iOiJSZXNlcnZhOiBHbGFtcGluZyIsIkRTX01FUkNIQU5UX01FUkNIQU5UTkFNRSI6IlRlbmVyaWZlIFBhcmFkaXNlIFRvdXJzIiwiRFNfTUVSQ0hBTlRfQ09OU1VNRVJMQU5HVUFHRSI6IjAwMSIsIkRTX01FUkNIQU5UX01FUkNIQU5UREFUQSI6ImZlNGMwMjU2LWRjY2EtNDk2Ni1hZjRhLWU0ZWQ0YTMzOGNiMiJ9",
      Ds_Signature: "429jNQr2eQ0ZKKWpBgGT..."
    },
    orderNumber: "175327970626",
    amount: 180,
    reservationId: "fe4c0256-dcca-4966-af4a-e4ed4a338cb2"
  };

  console.log('📊 Datos de pago simulados:', JSON.stringify(paymentData, null, 2));
  console.log('🔍 Verificando estructura de datos...');

  // Verificar que paymentData tenga la estructura correcta
  if (!paymentData.redsysUrl) {
    console.error('❌ URL de Redsys no encontrada en la respuesta');
    return;
  }

  if (!paymentData.formData) {
    console.error('❌ Datos del formulario no encontrados en la respuesta');
    return;
  }

  console.log('✅ Estructura de datos válida');

  // Crear formulario para enviar a Redsys
  const form = document.createElement("form");
  form.method = "POST";
  form.action = paymentData.redsysUrl;

  console.log('🌐 URL de Redsys:', paymentData.redsysUrl);

  // Validar que todos los campos requeridos estén presentes
  const requiredFields = ['Ds_SignatureVersion', 'Ds_MerchantParameters', 'Ds_Signature'];
  const missingFields = requiredFields.filter(field => !paymentData.formData[field]);
  
  if (missingFields.length > 0) {
    console.error('❌ Campos faltantes:', missingFields);
    return;
  }

  console.log('✅ Todos los campos requeridos están presentes');

  // Agregar campos al formulario
  Object.entries(paymentData.formData).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
    console.log(`📝 Campo ${key}:`, value);
  });

  console.log('📋 Formulario creado con', form.elements.length, 'campos');
  console.log('🔗 Agregando formulario al DOM...');
  
  document.body.appendChild(form);
  
  console.log('🚀 Enviando formulario a Redsys...');
  console.log('📍 URL destino:', form.action);
  console.log('📊 Método:', form.method);
  
  // Intentar enviar el formulario
  try {
    form.submit();
    console.log('✅ Formulario enviado exitosamente');
  } catch (submitError) {
    console.error('❌ Error al enviar formulario:', submitError);
    console.log('🔄 Intentando redirección alternativa...');
    
    // Redirección alternativa usando window.location
    const formData = new URLSearchParams();
    Object.entries(paymentData.formData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    console.log('🌐 Redirigiendo a:', paymentData.redsysUrl);
    window.location.href = `${paymentData.redsysUrl}?${formData.toString()}`;
  }
}

// Función para crear un botón de prueba en la página
function createTestButton() {
  const button = document.createElement('button');
  button.textContent = '🧪 Probar Redirección a Redsys';
  button.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    background: #0061A8;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
  `;
  button.onclick = simulateFrontendProcessing;
  document.body.appendChild(button);
  console.log('🔧 Botón de prueba creado en la esquina superior derecha');
}

// Ejecutar cuando se carga la página
if (typeof window !== 'undefined') {
  createTestButton();
  console.log('🧪 Script de prueba cargado. Haz clic en el botón azul para probar la redirección.');
} 