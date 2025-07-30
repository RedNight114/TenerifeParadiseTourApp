const crypto = require('crypto');

// 🔍 VERIFICACIÓN COMPLETA DE CONFIGURACIÓN REDSYS
console.log('🔍 VERIFICACIÓN COMPLETA DE CONFIGURACIÓN REDSYS');
console.log('================================================');

// Configuración esperada para pruebas
const EXPECTED_CONFIG = {
  REDSYS_ENVIRONMENT: 'https://sis-t.redsys.es:25443/sis/realizarPago',
  REDSYS_MERCHANT_CODE: '999008881',
  REDSYS_TERMINAL: '001',
  REDSYS_SECRET_KEY: 'sq7HjrUOBfKmC576ILgskD5srU870gJ7',
  NODE_ENV: 'development',
  BASE_URL: 'http://localhost:3000'
};

// Verificar variables de entorno
console.log('📋 VERIFICACIÓN DE VARIABLES DE ENTORNO:');
console.log('========================================');

const envVars = {
  'REDSYS_ENVIRONMENT': process.env.REDSYS_ENVIRONMENT,
  'REDSYS_MERCHANT_CODE': process.env.REDSYS_MERCHANT_CODE,
  'REDSYS_TERMINAL': process.env.REDSYS_TERMINAL,
  'REDSYS_SECRET_KEY': process.env.REDSYS_SECRET_KEY,
  'NODE_ENV': process.env.NODE_ENV,
  'NEXT_PUBLIC_SITE_URL': process.env.NEXT_PUBLIC_SITE_URL
};

let allCorrect = true;

Object.entries(envVars).forEach(([key, value]) => {
  const expected = EXPECTED_CONFIG[key];
  const isCorrect = value === expected;
  const status = isCorrect ? '✅' : '❌';
  
  console.log(`${status} ${key}:`);
  console.log(`   Actual: ${value || 'No configurado'}`);
  console.log(`   Esperado: ${expected}`);
  
  if (!isCorrect) {
    allCorrect = false;
  }
});

// Verificar URLs que se generarán
console.log('\n🌐 VERIFICACIÓN DE URLs:');
console.log('========================');

const baseUrl = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000' 
  : process.env.NEXT_PUBLIC_SITE_URL;

const urls = {
  'Webhook URL': `${baseUrl}/api/payment/webhook`,
  'URL OK': `${baseUrl}/reserva/estado`,
  'URL KO': `${baseUrl}/reserva/estado`
};

Object.entries(urls).forEach(([name, url]) => {
  console.log(`✅ ${name}: ${url}`);
});

// Verificar generación de firma
console.log('\n🔐 VERIFICACIÓN DE GENERACIÓN DE FIRMA:');
console.log('========================================');

const testParams = {
  DS_MERCHANT_AMOUNT: '000000018000',
  DS_MERCHANT_CURRENCY: '978',
  DS_MERCHANT_MERCHANTCODE: '999008881',
  DS_MERCHANT_ORDER: 'test12345678',
  DS_MERCHANT_TERMINAL: '001',
  DS_MERCHANT_TRANSACTIONTYPE: '1',
  DS_MERCHANT_MERCHANTURL: 'http://localhost:3000/api/payment/webhook',
  DS_MERCHANT_URLOK: 'http://localhost:3000/reserva/estado',
  DS_MERCHANT_URLKO: 'http://localhost:3000/reserva/estado'
};

try {
  // Generar firma de prueba
  const secretKey = Buffer.from(EXPECTED_CONFIG.REDSYS_SECRET_KEY, 'base64');
  const cipher = crypto.createCipheriv('des-ede3', secretKey, '');
  cipher.setAutoPadding(true);
  
  let encryptedOrder = cipher.update('test12345678', 'utf8');
  encryptedOrder = Buffer.concat([encryptedOrder, cipher.final()]);
  
  const orderedParams = Object.fromEntries(
    Object.entries(testParams).sort(([a], [b]) => a.localeCompare(b))
  );
  
  const merchantParamsJson = JSON.stringify(orderedParams);
  const merchantParamsBase64 = Buffer.from(merchantParamsJson, 'utf8').toString('base64');
  
  const hmac = crypto.createHmac('sha256', encryptedOrder);
  hmac.update(merchantParamsBase64);
  const signature = hmac.digest('base64');
  
  console.log('✅ Firma generada correctamente');
  console.log(`   Firma: ${signature}`);
  console.log(`   Longitud: ${signature.length} caracteres`);
  
} catch (error) {
  console.log('❌ Error generando firma:');
  console.log(`   ${error.message}`);
  allCorrect = false;
}

// Resumen final
console.log('\n📊 RESUMEN DE VERIFICACIÓN:');
console.log('============================');

if (allCorrect) {
  console.log('✅ TODA LA CONFIGURACIÓN ES CORRECTA');
  console.log('🎯 El error SIS0042 debería estar resuelto');
  console.log('\n📝 PRÓXIMOS PASOS:');
  console.log('1. Reinicia el servidor: npm run dev');
  console.log('2. Prueba un pago con tarjeta: 4548812049400004');
  console.log('3. Verifica que no aparezca el error SIS0042');
} else {
  console.log('❌ HAY PROBLEMAS EN LA CONFIGURACIÓN');
  console.log('🔧 Corrige las variables de entorno marcadas con ❌');
  console.log('📝 Revisa el archivo .env.local');
}

console.log('\n🔍 CONFIGURACIÓN ACTUAL DETECTADA:');
console.log('==================================');
console.log(`Entorno: ${process.env.NODE_ENV || 'No configurado'}`);
console.log(`Base URL: ${baseUrl}`);
console.log(`Merchant Code: ${process.env.REDSYS_MERCHANT_CODE || 'No configurado'}`);
console.log(`Terminal: ${process.env.REDSYS_TERMINAL || 'No configurado'}`); 