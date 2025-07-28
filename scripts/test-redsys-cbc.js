require('dotenv').config({path: '.env.local'});

const crypto = require('crypto');

// Función de firma con 3DES CBC
function generateRedsysSignatureCBC(secretKeyBase64, orderNumber, merchantParams) {
  console.log('🔧 PRUEBA CON 3DES CBC');
  console.log('========================');
  
  // Paso 1: Decodificar clave secreta
  const secretKey = Buffer.from(secretKeyBase64, 'base64');
  console.log('Clave secreta (base64):', secretKeyBase64);
  console.log('Clave secreta (hex):', secretKey.toString('hex'));
  console.log('Longitud clave:', secretKey.length, 'bytes');
  
  // Paso 2: Cifrar con 3DES CBC
  const iv = Buffer.alloc(8, 0); // IV de 8 bytes a cero
  const cipher = crypto.createCipheriv('des-ede3-cbc', secretKey, iv);
  cipher.setAutoPadding(true);
  
  let encryptedOrder = cipher.update(orderNumber, 'utf8');
  encryptedOrder = Buffer.concat([encryptedOrder, cipher.final()]);
  
  console.log('Order original:', orderNumber);
  console.log('IV (hex):', iv.toString('hex'));
  console.log('Cifrado (hex):', encryptedOrder.toString('hex'));
  console.log('Cifrado (base64):', encryptedOrder.toString('base64'));
  console.log('Longitud cifrado:', encryptedOrder.length, 'bytes');
  
  // Paso 3: Ordenar parámetros alfabéticamente
  const orderedParams = Object.fromEntries(
    Object.entries(merchantParams).sort(([a], [b]) => a.localeCompare(b))
  );
  
  // Paso 4: Serializar y codificar
  const merchantParamsJson = JSON.stringify(orderedParams);
  const merchantParamsBase64 = Buffer.from(merchantParamsJson, 'utf8').toString('base64');
  
  console.log('Parámetros ordenados:', merchantParamsJson);
  console.log('Base64:', merchantParamsBase64);
  
  // Paso 5: Calcular HMAC
  const hmac = crypto.createHmac('sha256', encryptedOrder);
  hmac.update(merchantParamsBase64);
  const signature = hmac.digest('base64');
  
  console.log('Firma final:', signature);
  console.log('');
  
  return signature;
}

// Datos de prueba
const testData = {
  secretKey: process.env.REDSYS_SECRET_KEY,
  order: 'testreservat',
  merchantParams: {
    DS_MERCHANT_AMOUNT: '000000018000',
    DS_MERCHANT_CURRENCY: '978',
    DS_MERCHANT_MERCHANTCODE: '367529286',
    DS_MERCHANT_ORDER: 'testreservat',
    DS_MERCHANT_TERMINAL: '1',
    DS_MERCHANT_TRANSACTIONTYPE: '1'
  }
};

console.log('🔍 VERIFICACIÓN DE VARIABLES DE ENTORNO');
console.log('=======================================');
console.log('REDSYS_SECRET_KEY:', testData.secretKey ? 'DEFINIDA' : 'NO DEFINIDA');
console.log('');

if (!testData.secretKey) {
  console.error('❌ ERROR: REDSYS_SECRET_KEY no está definida');
  process.exit(1);
}

// Generar firma con 3DES CBC
const signature = generateRedsysSignatureCBC(
  testData.secretKey,
  testData.order,
  testData.merchantParams
);

console.log('✅ PRUEBA COMPLETADA');
console.log('Firma generada con 3DES CBC:', signature); 