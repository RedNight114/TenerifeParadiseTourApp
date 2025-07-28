// Script con encoding correcto para la firma
const https = require('https');
const http = require('http');

// Datos de prueba
const testData = {
  url: 'http://localhost:3001/api/payment/webhook',
  merchantParameters: 'eyJEU19BVVRIT1JJU0FUSU9OQ09ERSI6IjEyMzQ1NiIsIkRTX01FUkNIQU5UX0FNT1VOVCI6IjAwMDAwMDAxODAwMCIsIkRTX01FUkNIQU5UX0NVUlJFTkNZIjoiOTc4IiwiRFNfTUVSQ0hBTlRfTUVSQ0hBTlRDT0RFIjoiMzY3NTI5Mjg2IiwiRFNfTUVSQ0hBTlRfT1JERVIiOiJ0ZXN0cmVzZXJ2YXQiLCJEU19NRVJDSEFOVF9URVJNSU5BTCI6IjEiLCJEU19NRVJDSEFOVF9UUkFOU0FDVElPTlRZUEUiOiIxIiwiRFNfUkVTUE9OU0UiOiIwMDAwIiwiRFNfUkVTUE9OU0VfVEVYVCI6IlRyYW5zYWNjacOzbiBhdXRvcml6YWRhIn0=',
  signature: 'Ra5i/tfm1fmkkuK0qU83Q+VAR6NlG9HgLBCnBkZsHfI='
};

// Crear el body de la petición con encoding correcto
const postData = new URLSearchParams({
  'Ds_MerchantParameters': testData.merchantParameters,
  'Ds_Signature': testData.signature
}).toString();

// Configurar la petición
const url = new URL(testData.url);
const options = {
  hostname: url.hostname,
  port: url.port,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 PROBANDO WEBHOOK CON ENCODING CORRECTO');
console.log('==========================================');
console.log('URL:', testData.url);
console.log('Método:', options.method);
console.log('Headers:', options.headers);
console.log('Body length:', postData.length);
console.log('Body:', postData);
console.log('');

// Realizar la petición
const req = http.request(options, (res) => {
  console.log('📡 RESPUESTA RECIBIDA:');
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  console.log('');

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📄 CUERPO DE LA RESPUESTA:');
    console.log(data);
    console.log('');
    
    if (res.statusCode === 200) {
      console.log('✅ WEBHOOK FUNCIONANDO CORRECTAMENTE');
    } else {
      console.log('❌ ERROR EN EL WEBHOOK');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ ERROR DE CONEXIÓN:', error.message);
});

req.write(postData);
req.end();

console.log('🚀 Enviando petición con encoding correcto...'); 