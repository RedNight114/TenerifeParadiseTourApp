const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SECRET_KEY = process.env.REDSYS_SECRET_KEY;

if (!supabaseUrl || !supabaseKey || !SECRET_KEY) {
  console.error('❌ Variables de entorno no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Función para generar firma (simulando el envío)
function generateRedsysSignature(secretKeyBase64, orderNumber, merchantParams) {
  const secretKey = Buffer.from(secretKeyBase64, 'base64');
  
  // Cifrar número de orden con 3DES ECB
  const cipher = crypto.createCipheriv('des-ede3', secretKey, null);
  cipher.setAutoPadding(true);
  
  let encryptedOrder = cipher.update(orderNumber, 'utf8');
  encryptedOrder = Buffer.concat([encryptedOrder, cipher.final()]);
  
  // Ordenar parámetros alfabéticamente
  const orderedParams = Object.fromEntries(
    Object.entries(merchantParams).sort(([a], [b]) => a.localeCompare(b))
  );
  
  // Serializar a JSON y codificar
  const merchantParamsJson = JSON.stringify(orderedParams);
  const merchantParamsBase64 = Buffer.from(merchantParamsJson, 'utf8').toString('base64');
  
  // Calcular HMAC-SHA256
  const hmac = crypto.createHmac('sha256', encryptedOrder);
  hmac.update(merchantParamsBase64);
  const signature = hmac.digest('base64');
  
  return { signature, merchantParamsBase64, orderedParams };
}

// Función para verificar firma (simulando la recepción)
function verifyRedsysSignature(secretKeyBase64, orderNumber, merchantParams, signature) {
  // 🔥 CORRECCIÓN: Agregar Ds_Order a los parámetros para validación
  const paramsForValidation = {
    ...merchantParams,
    Ds_Order: orderNumber // Campo requerido para validación de firma
  };
  
  const expected = generateRedsysSignature(secretKeyBase64, orderNumber, paramsForValidation);
  return expected.signature === signature;
}

async function testDsOrderFix() {
  console.log('🔧 PRUEBA DE CORRECCIÓN Ds_Order');
  console.log('=====================================');
  
  // Datos de prueba
  const orderNumber = '123456789012';
  const merchantParams = {
    DS_MERCHANT_AMOUNT: '1000',
    DS_MERCHANT_CURRENCY: '978',
    DS_MERCHANT_MERCHANTCODE: '999008881',
    DS_MERCHANT_ORDER: orderNumber,
    DS_MERCHANT_TERMINAL: '001',
    DS_MERCHANT_TRANSACTIONTYPE: '0',
    DS_RESPONSE: '0000',
    DS_AUTHORISATIONCODE: '123456'
  };
  
  console.log('📋 Datos de prueba:');
  console.log('- Order Number:', orderNumber);
  console.log('- Merchant Params:', JSON.stringify(merchantParams, null, 2));
  
  // Generar firma (simulando envío)
  console.log('\n🔐 Generando firma...');
  const { signature, merchantParamsBase64, orderedParams } = generateRedsysSignature(SECRET_KEY, orderNumber, merchantParams);
  console.log('- Firma generada:', signature);
  console.log('- Parámetros ordenados:', JSON.stringify(orderedParams, null, 2));
  
  // Verificar firma SIN Ds_Order (método anterior - debería fallar)
  console.log('\n❌ Verificación SIN Ds_Order (método anterior):');
  const isValidWithoutDsOrder = verifyRedsysSignature(SECRET_KEY, orderNumber, merchantParams, signature);
  console.log('- Resultado:', isValidWithoutDsOrder ? '✅ VÁLIDA' : '❌ INVÁLIDA');
  
  // Verificar firma CON Ds_Order (método corregido - debería funcionar)
  console.log('\n✅ Verificación CON Ds_Order (método corregido):');
  const paramsWithDsOrder = {
    ...merchantParams,
    Ds_Order: orderNumber
  };
  const isValidWithDsOrder = verifyRedsysSignature(SECRET_KEY, orderNumber, paramsWithDsOrder, signature);
  console.log('- Resultado:', isValidWithDsOrder ? '✅ VÁLIDA' : '❌ INVÁLIDA');
  
  // Simular datos recibidos de Redsys
  console.log('\n🔄 Simulando datos recibidos de Redsys:');
  const receivedParams = JSON.parse(Buffer.from(merchantParamsBase64, 'base64').toString('utf8'));
  console.log('- Parámetros recibidos:', JSON.stringify(receivedParams, null, 2));
  
  // Verificar con datos recibidos
  const isValidReceived = verifyRedsysSignature(SECRET_KEY, orderNumber, receivedParams, signature);
  console.log('- Verificación con datos recibidos:', isValidReceived ? '✅ VÁLIDA' : '❌ INVÁLIDA');
  
  console.log('\n🎯 CONCLUSIÓN:');
  if (isValidWithDsOrder && isValidReceived) {
    console.log('✅ La corrección del campo Ds_Order resuelve el error SIS0042');
    console.log('✅ Los pagos ahora deberían validarse correctamente');
  } else {
    console.log('❌ Aún hay problemas con la validación de firma');
  }
}

// Ejecutar la prueba
testDsOrderFix().catch(console.error); 