const crypto = require('crypto');

// Función para generar firma Redsys (corregida)
function generateRedsysSignature(order, merchantParameters, secretKey) {
  // Limpiar parámetros
  const cleanOrder = order.toString().trim();
  const cleanMerchantParameters = merchantParameters.toString().trim();
  const cleanSecretKey = secretKey.toString().trim();
  
  // Procesar clave secreta (múltiples formatos)
  let decodedKey;
  
  try {
    // Intentar como base64
    decodedKey = Buffer.from(cleanSecretKey, "base64");
  } catch (base64Error) {
    try {
      // Intentar como hexadecimal
      decodedKey = Buffer.from(cleanSecretKey, "hex");
    } catch (hexError) {
      // Usar como texto plano
      decodedKey = Buffer.from(cleanSecretKey, "utf8");
    }
  }
  
  // Crear HMAC
  const hmac = crypto.createHmac('sha256', decodedKey);
  
  // Concatenar order + merchantParameters (sin la clave al final)
  const dataToSign = cleanOrder + cleanMerchantParameters;
  
  // Generar firma
  hmac.update(dataToSign, 'utf8');
  const signature = hmac.digest('base64');
  
  return signature;
}

// Función para codificar parámetros en Base64
function encodeMerchantParameters(params) {
  return Buffer.from(JSON.stringify(params)).toString('base64');
}

// Parámetros de ejemplo (los mismos que usas)
const merchantParams = {
  "DS_MERCHANT_AMOUNT": "000000018000",
  "DS_MERCHANT_ORDER": "175327666781",
  "DS_MERCHANT_MERCHANTCODE": "367529286",
  "DS_MERCHANT_CURRENCY": "978",
  "DS_MERCHANT_TRANSACTIONTYPE": "1",
  "DS_MERCHANT_TERMINAL": "001",
  "DS_MERCHANT_MERCHANTURL": "https://tenerifeparadisetoursexcursions.com/api/payment/webhook",
  "DS_MERCHANT_URLOK": "https://tenerifeparadisetoursexcursions.com/payment/success?reservationId=5a6a778e-2516-4f9a-999f-dbb055bbaa49",
  "DS_MERCHANT_URLKO": "https://tenerifeparadisetoursexcursions.com/payment/error?reservationId=5a6a778e-2516-4f9a-999f-dbb055bbaa49",
  "DS_MERCHANT_PRODUCTDESCRIPTION": "Reserva: Glamping",
  "DS_MERCHANT_MERCHANTNAME": "Tenerife Paradise Tours",
  "DS_MERCHANT_CONSUMERLANGUAGE": "001",
  "DS_MERCHANT_MERCHANTDATA": "5a6a778e-2516-4f9a-999f-dbb055bbaa49"
};

const order = "175327666781";
const merchantParameters = encodeMerchantParameters(merchantParams);

console.log('🔍 DIAGNÓSTICO DE CLAVES REDSYS');
console.log('================================');
console.log(`📋 Orden: ${order}`);
console.log(`📊 Parámetros codificados: ${merchantParameters}`);
console.log(`📏 Longitud de parámetros: ${merchantParameters.length}`);
console.log('');

// Clave que estás usando actualmente (producción)
const currentKey = "sq7HjrUOBfKmC576ILgskD5srU870gJ7";
const currentSignature = generateRedsysSignature(order, merchantParameters, currentKey);

console.log('🔑 CLAVE ACTUAL (PRODUCCIÓN):');
console.log(`Clave: ${currentKey}`);
console.log(`Firma generada: ${currentSignature}`);
console.log(`Firma recibida: TOFJGFtaOY4RfKZlHY+WGFLhvOT34UaPVEQwHoCbYgY=`);
console.log(`¿Coinciden?: ${currentSignature === 'TOFJGFtaOY4RfKZlHY+WGFLhvOT34UaPVEQwHoCbYgY=' ? '✅ SÍ' : '❌ NO'}`);
console.log('');

// Posibles claves de test (ejemplos comunes)
const testKeys = [
  "sq7HjrUOBfKmC576ILgskD5srU870gJ7", // Tu clave actual
  "Mk9m98IfEblmPfrpsawt7BmxObt98Jev", // Ejemplo de clave test
  "1234567890abcdef1234567890abcdef", // Ejemplo hexadecimal
  "test_key_for_redsys_integration",   // Ejemplo de texto
];

console.log('🧪 PROBANDO POSIBLES CLAVES DE TEST:');
console.log('====================================');

testKeys.forEach((key, index) => {
  const signature = generateRedsysSignature(order, merchantParameters, key);
  console.log(`${index + 1}. Clave: ${key}`);
  console.log(`   Firma: ${signature}`);
  console.log(`   ¿Coincide?: ${signature === 'TOFJGFtaOY4RfKZlHY+WGFLhvOT34UaPVEQwHoCbYgY=' ? '✅ SÍ' : '❌ NO'}`);
  console.log('');
});

console.log('📋 INSTRUCCIONES:');
console.log('================');
console.log('1. Ve a tu panel de Redsys');
console.log('2. Busca la sección "Configuración" o "Integración"');
console.log('3. Busca "Clave Secreta de Test" o "Test Secret Key"');
console.log('4. Copia esa clave y actualiza tu .env.local');
console.log('');
console.log('🔍 POSIBLES UBICACIONES EN REDSYS:');
console.log('- Panel de administración > Configuración > Integración');
console.log('- Panel de administración > Herramientas > Configuración de comercio');
console.log('- Panel de administración > API > Claves de integración');
console.log('');
console.log('⚠️  IMPORTANTE:');
console.log('- Las claves de test y producción son DIFERENTES');
console.log('- La clave de test suele ser más larga o tener un formato diferente');
console.log('- Contacta con Redsys si no encuentras la clave de test'); 