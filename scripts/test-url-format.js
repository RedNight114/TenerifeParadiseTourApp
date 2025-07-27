// Script para probar el formato de URLs sin caracteres escapados
console.log('🔧 PRUEBA DE FORMATO DE URLS');
console.log('============================');

// Simular los parámetros de Redsys
const merchantParameters = {
  DS_MERCHANT_AMOUNT: '000000009000',
  DS_MERCHANT_ORDER: '175328124305',
  DS_MERCHANT_MERCHANTCODE: '367529286',
  DS_MERCHANT_CURRENCY: '978',
  DS_MERCHANT_TRANSACTIONTYPE: '1',
  DS_MERCHANT_TERMINAL: '001',
  DS_MERCHANT_MERCHANTURL: 'https://tenerifeparadisetoursexcursions.com/api/payment/webhook',
  DS_MERCHANT_URLOK: 'https://tenerifeparadisetoursexcursions.com/payment/success?reservationId=3563e348-7f8e-426e-bb54-6f3151b03ad0',
  DS_MERCHANT_URLKO: 'https://tenerifeparadisetoursexcursions.com/payment/error?reservationId=3563e348-7f8e-426e-bb54-6f3151b03ad0',
  DS_MERCHANT_PRODUCTDESCRIPTION: 'Reserva: Glamping',
  DS_MERCHANT_MERCHANTNAME: 'Tenerife Paradise Tours',
  DS_MERCHANT_CONSUMERLANGUAGE: '001',
  DS_MERCHANT_MERCHANTDATA: '3563e348-7f8e-426e-bb54-6f3151b03ad0'
};

console.log('📊 Parámetros originales:', merchantParameters);

// Método ANTIGUO (con caracteres escapados)
const oldJson = JSON.stringify(merchantParameters);
console.log('\n❌ JSON ANTIGUO (con caracteres escapados):');
console.log(oldJson);

// Método NUEVO (sin caracteres escapados)
const newJson = JSON.stringify(merchantParameters).replace(/\\\//g, '/');
console.log('\n✅ JSON NUEVO (sin caracteres escapados):');
console.log(newJson);

// Verificar diferencias
console.log('\n🔍 COMPARACIÓN:');
console.log('¿Contiene caracteres escapados el JSON antiguo?', oldJson.includes('\\/') ? '❌ SÍ' : '✅ NO');
console.log('¿Contiene caracteres escapados el JSON nuevo?', newJson.includes('\\/') ? '❌ SÍ' : '✅ NO');

// Convertir a Base64
const oldBase64 = Buffer.from(oldJson, 'utf8').toString('base64');
const newBase64 = Buffer.from(newJson, 'utf8').toString('base64');

console.log('\n📄 COMPARACIÓN BASE64:');
console.log('Base64 antiguo:', oldBase64);
console.log('Base64 nuevo:', newBase64);
console.log('¿Son diferentes?', oldBase64 !== newBase64 ? '✅ SÍ' : '❌ NO');

// Decodificar para verificar
const decodedOld = Buffer.from(oldBase64, 'base64').toString('utf8');
const decodedNew = Buffer.from(newBase64, 'base64').toString('utf8');

console.log('\n🔍 DECODIFICACIÓN:');
console.log('Decodificado antiguo:', decodedOld);
console.log('Decodificado nuevo:', decodedNew);

console.log('\n🎉 PRUEBA COMPLETADA'); 