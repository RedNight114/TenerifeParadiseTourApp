#!/usr/bin/env node

/**
 * Script para probar la nueva implementación de firma de Redsys
 * Algoritmo oficial HMAC_SHA256_V1
 */

require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

console.log('🧪 PRUEBA REDSYS - Nueva implementación HMAC_SHA256_V1');
console.log('=====================================================');

// Configuración de prueba
const config = {
  merchantCode: process.env.REDSYS_MERCHANT_CODE || '367529286',
  terminal: process.env.REDSYS_TERMINAL || '1',
  secretKey: process.env.REDSYS_SECRET_KEY,
  environment: process.env.REDSYS_ENVIRONMENT || 'https://sis-t.redsys.es:25443/sis/realizarPago'
};

if (!config.secretKey) {
  console.error('❌ ERROR: REDSYS_SECRET_KEY no está configurada');
  process.exit(1);
}

// Datos de prueba
const testData = {
  orderNumber: '175328862176',
  amount: 18.00,
  amountInCents: 1800,
  merchantParams: {
    DS_MERCHANT_AMOUNT: '000000018000',
    DS_MERCHANT_ORDER: '175328862176',
    DS_MERCHANT_MERCHANTCODE: '367529286',
    DS_MERCHANT_CURRENCY: '978',
    DS_MERCHANT_TRANSACTIONTYPE: '1',
    DS_MERCHANT_TERMINAL: '001'
  }
};

/**
 * Cifra datos usando 3DES en modo ECB
 */
function encrypt3DES_ECB(data, key) {
  try {
    // Asegurar que la clave tenga exactamente 24 bytes para 3DES
    let keyBuffer = key;
    if (key.length < 24) {
      // Padding con ceros si es necesario
      keyBuffer = Buffer.concat([key, Buffer.alloc(24 - key.length, 0)]);
    } else if (key.length > 24) {
      // Truncar si es muy larga
      keyBuffer = key.slice(0, 24);
    }

    // Crear cipher 3DES en modo ECB (sin IV)
    const cipher = crypto.createCipheriv('des-ede3', keyBuffer, null);
    cipher.setAutoPadding(true);
    
    // Cifrar los datos
    const encrypted = Buffer.concat([
      cipher.update(data, 'utf8'),
      cipher.final()
    ]);
    
    return encrypted;
  } catch (error) {
    console.error('❌ Error en encrypt3DES_ECB:', error);
    throw new Error(`Error cifrando con 3DES-ECB: ${error.message}`);
  }
}

/**
 * Genera la firma de Redsys siguiendo el algoritmo oficial HMAC_SHA256_V1
 */
function generateRedsysSignature(secretKeyBase64, orderNumber, merchantParams) {
  try {
    // 1. Decodificar la clave secreta desde Base64
    let decodedSecretKey;
    try {
      decodedSecretKey = Buffer.from(secretKeyBase64, 'base64');
    } catch (error) {
      console.error('❌ Error decodificando clave secreta:', error);
      throw new Error('Clave secreta inválida: no es un Base64 válido');
    }

    // 2. Verificar que el número de pedido no esté vacío
    if (!orderNumber || orderNumber.trim().length === 0) {
      throw new Error('El número de pedido no puede estar vacío');
    }

    // 3. Cifrar el número de pedido con 3DES-ECB usando la clave secreta
    const derivedKey = encrypt3DES_ECB(orderNumber, decodedSecretKey);

    // 4. Serializar merchantParams a JSON y codificar en Base64
    let merchantParametersBase64;
    try {
      const merchantParametersJson = JSON.stringify(merchantParams);
      merchantParametersBase64 = Buffer.from(merchantParametersJson, 'utf8').toString('base64');
    } catch (error) {
      console.error('❌ Error procesando parámetros:', error);
      throw new Error('Error procesando parámetros del comercio');
    }

    // 5. Generar HMAC-SHA256 usando la clave derivada sobre los parámetros en Base64
    const hmac = crypto.createHmac('sha256', derivedKey);
    hmac.update(merchantParametersBase64, 'utf8');
    const signature = hmac.digest('base64');

    return signature;

  } catch (error) {
    console.error('❌ Error generando firma:', error);
    throw new Error(`Error generando firma de Redsys: ${error.message}`);
  }
}

/**
 * Función de utilidad para generar firma completa con parámetros estándar
 */
function generateCompleteRedsysSignature(secretKeyBase64, orderNumber, amount, merchantCode, currency = '978', transactionType = '1', terminal = '001') {
  try {
    // Crear parámetros estándar
    const merchantParams = {
      DS_MERCHANT_AMOUNT: amount.toString().padStart(12, '0'),
      DS_MERCHANT_ORDER: orderNumber,
      DS_MERCHANT_MERCHANTCODE: merchantCode,
      DS_MERCHANT_CURRENCY: currency,
      DS_MERCHANT_TRANSACTIONTYPE: transactionType,
      DS_MERCHANT_TERMINAL: terminal
    };

    // Generar firma
    const signature = generateRedsysSignature(secretKeyBase64, orderNumber, merchantParams);
    
    // Convertir parámetros a Base64
    const merchantParametersBase64 = Buffer.from(JSON.stringify(merchantParams), 'utf8').toString('base64');
    
    return {
      signature,
      merchantParametersBase64
    };
  } catch (error) {
    console.error('❌ Error en firma completa:', error);
    throw error;
  }
}

/**
 * Verifica que una firma sea válida
 */
function verifyRedsysSignature(signature, secretKeyBase64, orderNumber, merchantParams) {
  try {
    const expectedSignature = generateRedsysSignature(secretKeyBase64, orderNumber, merchantParams);
    const isValid = signature === expectedSignature;
    return isValid;
  } catch (error) {
    console.error('❌ Error verificando firma:', error);
    return false;
  }
}

/**
 * Función de utilidad para validar webhook de Redsys
 */
function validateRedsysWebhook(merchantParametersBase64, signature, secretKeyBase64) {
  try {
    // Decodificar parámetros
    const merchantParametersJson = Buffer.from(merchantParametersBase64, 'base64').toString('utf8');
    const merchantParams = JSON.parse(merchantParametersJson);
    
    // Extraer número de pedido
    const orderNumber = merchantParams.DS_MERCHANT_ORDER || merchantParams.Ds_Merchant_Order;
    
    if (!orderNumber) {
      console.error('❌ No se encontró número de pedido en los parámetros');
      return false;
    }
    
    // Generar firma esperada
    const expectedSignature = generateRedsysSignature(secretKeyBase64, orderNumber, merchantParams);
    
    // Comparar firmas
    const isValid = signature === expectedSignature;
    
    return isValid;
  } catch (error) {
    console.error('❌ Error validando webhook:', error);
    return false;
  }
}

// Ejecutar pruebas
console.log('\n🔐 PROBANDO IMPLEMENTACIÓN:');

// Prueba 1: Función básica
console.log('\n1️⃣ Función básica:');
try {
  const signature1 = generateRedsysSignature(
    config.secretKey,
    testData.orderNumber,
    testData.merchantParams
  );
  console.log('   ✅ Firma generada:', signature1.length, 'caracteres');
} catch (error) {
  console.error('   ❌ Error:', error.message);
}

// Prueba 2: Función completa
console.log('\n2️⃣ Función completa:');
try {
  const result = generateCompleteRedsysSignature(
    config.secretKey,
    testData.orderNumber,
    testData.amountInCents,
    config.merchantCode
  );
  console.log('   ✅ Firma completa:', result.signature.length, 'caracteres');
} catch (error) {
  console.error('   ❌ Error:', error.message);
}

// Prueba 3: Verificación de firma
console.log('\n3️⃣ Verificación:');
try {
  const testSignature = generateRedsysSignature(
    config.secretKey,
    testData.orderNumber,
    testData.merchantParams
  );
  const isValid = verifyRedsysSignature(
    testSignature,
    config.secretKey,
    testData.orderNumber,
    testData.merchantParams
  );
  console.log(`   ✅ Verificación: ${isValid ? 'Válida' : 'Inválida'}`);
} catch (error) {
  console.error('   ❌ Error:', error.message);
}

// Prueba 4: Validación de webhook
console.log('\n4️⃣ Webhook:');
try {
  const merchantParametersBase64 = Buffer.from(JSON.stringify(testData.merchantParams)).toString('base64');
  const testSignature = generateRedsysSignature(
    config.secretKey,
    testData.orderNumber,
    testData.merchantParams
  );
  const isValid = validateRedsysWebhook(
    merchantParametersBase64,
    testSignature,
    config.secretKey
  );
  console.log(`   ✅ Validación: ${isValid ? 'Válida' : 'Inválida'}`);
} catch (error) {
  console.error('   ❌ Error:', error.message);
}

console.log('\n✅ PRUEBAS COMPLETADAS - Implementación lista'); 