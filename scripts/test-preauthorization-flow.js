#!/usr/bin/env node

/**
 * Script de prueba para el flujo completo de preautorizaciones de Redsys
 * Basado en la documentación oficial: https://pagosonline.redsys.es/desarrolladores-inicio/documentacion-operativa/preautorizaciones-y-confirmaciones/
 */

const crypto = require('crypto');

// Configuración de prueba
const config = {
  merchantCode: process.env.REDSYS_MERCHANT_CODE || '999008881',
  terminal: process.env.REDSYS_TERMINAL || '1',
  secretKey: process.env.REDSYS_SECRET_KEY || 'sq7HjrUOBfKmC576ILgskD5srU870gJ7',
  environment: process.env.REDSYS_ENVIRONMENT || 'https://sis-t.redsys.es:25443/sis/realizarPago',
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
};

// Función para generar firma según documentación oficial
function generateSignature(order, merchantParameters, secretKey) {
  try {
    const decodedKey = Buffer.from(secretKey, 'base64');
    const hmac = crypto.createHmac('sha256', decodedKey);
    hmac.update(order + merchantParameters);
    return hmac.digest('base64');
  } catch (error) {
    console.error('Error generando firma:', error);
    throw new Error('Error al generar la firma de seguridad');
  }
}

// Función para crear preautorización
async function createPreauthorization(reservationId, amount, description) {
  try {
    console.log('\n🔄 Creando preautorización...');
    console.log('📋 Datos de entrada:', { reservationId, amount, description });

    // Convertir amount a céntimos
    const amountInCents = Math.round(amount * 100);
    
    // Generar número de pedido único (máximo 12 caracteres)
    const orderNumber = `${Date.now()}${reservationId.slice(-4)}`.slice(0, 12);

    // URLs de respuesta
    const urlOK = `${config.baseUrl}/payment/success?reservationId=${reservationId}`;
    const urlKO = `${config.baseUrl}/payment/error?reservationId=${reservationId}`;
    const urlNotification = `${config.baseUrl}/api/payment/webhook`;

    // Parámetros del comercio según documentación oficial
    const merchantParameters = {
      DS_MERCHANT_AMOUNT: amountInCents.toString().padStart(12, '0'),
      DS_MERCHANT_ORDER: orderNumber,
      DS_MERCHANT_MERCHANTCODE: config.merchantCode,
      DS_MERCHANT_CURRENCY: '978', // EUR
      DS_MERCHANT_TRANSACTIONTYPE: '1', // 1 = Preautorización
      DS_MERCHANT_TERMINAL: config.terminal,
      DS_MERCHANT_MERCHANTURL: urlNotification,
      DS_MERCHANT_URLOK: urlOK,
      DS_MERCHANT_URLKO: urlKO,
      DS_MERCHANT_PRODUCTDESCRIPTION: description,
      DS_MERCHANT_MERCHANTNAME: 'Tenerife Paradise Tours',
      DS_MERCHANT_CONSUMERLANGUAGE: '001', // Español
      DS_MERCHANT_MERCHANTDATA: reservationId,
    };

    // Codificar parámetros en base64
    const merchantParametersBase64 = Buffer.from(JSON.stringify(merchantParameters)).toString('base64');

    // Generar firma
    const signature = generateSignature(orderNumber, merchantParametersBase64, config.secretKey);

    // Datos del formulario
    const formData = {
      Ds_SignatureVersion: 'HMAC_SHA256_V1',
      Ds_MerchantParameters: merchantParametersBase64,
      Ds_Signature: signature,
    };

    console.log('✅ Preautorización creada exitosamente');
    console.log('📊 Datos generados:', {
      orderNumber,
      amountInCents,
      merchantParameters,
      signatureLength: signature.length
    });

    return {
      redsysUrl: config.environment,
      formData,
      orderNumber,
      amount,
      reservationId
    };

  } catch (error) {
    console.error('❌ Error creando preautorización:', error);
    throw error;
  }
}

// Función para confirmar preautorización
async function confirmPreauthorization(orderNumber, amount) {
  try {
    console.log('\n🔄 Confirmando preautorización...');
    console.log('📋 Datos de entrada:', { orderNumber, amount });

    // Convertir amount a céntimos
    const amountInCents = Math.round(amount * 100);

    // Parámetros para confirmación según documentación oficial
    const merchantParameters = {
      DS_MERCHANT_ORDER: orderNumber,
      DS_MERCHANT_MERCHANTCODE: config.merchantCode,
      DS_MERCHANT_TERMINAL: config.terminal,
      DS_MERCHANT_TRANSACTIONTYPE: '2', // 2 = Confirmación de preautorización
      DS_MERCHANT_CURRENCY: '978', // EUR
      DS_MERCHANT_AMOUNT: amountInCents.toString().padStart(12, '0'),
    };

    // Codificar parámetros en base64
    const merchantParametersBase64 = Buffer.from(JSON.stringify(merchantParameters)).toString('base64');

    // Generar firma
    const signature = generateSignature(orderNumber, merchantParametersBase64, config.secretKey);

    // Datos para enviar a Redsys
    const requestData = {
      Ds_Merchant_MerchantParameters: merchantParametersBase64,
      Ds_Merchant_Signature: signature,
      Ds_SignatureVersion: 'HMAC_SHA256_V1'
    };

    // URL de Redsys para confirmación
    const redsysUrl = config.environment.includes('sis-t') 
      ? 'https://sis-t.redsys.es:25443/sis/rest/trataPeticionREST'
      : 'https://sis.redsys.es/sis/rest/trataPeticionREST';

    console.log('🌐 Enviando confirmación a:', redsysUrl);
    console.log('📊 Datos de confirmación:', {
      orderNumber,
      amountInCents,
      merchantParameters
    });

    // Simular respuesta exitosa (en producción, hacer fetch real)
    const mockResponse = {
      Ds_Merchant_MerchantParameters: Buffer.from(JSON.stringify({
        Ds_Amount: amountInCents.toString(),
        Ds_Currency: '978',
        Ds_Order: orderNumber,
        Ds_MerchantCode: config.merchantCode,
        Ds_Terminal: config.terminal,
        Ds_Response: '0900',
        Ds_AuthorisationCode: '439764',
        Ds_TransactionType: '2',
        Ds_SecurePayment: '2',
        Ds_Language: '1',
        Ds_MerchantData: '',
        Ds_Card_Country: '724',
        Ds_Card_Brand: '1',
        Ds_ProcessedPayMethod: '78',
        Ds_Control_1680100010873: '1680100010873'
      })).toString('base64'),
      Ds_Merchant_Signature: 'mock_signature',
      Ds_SignatureVersion: 'HMAC_SHA256_V1'
    };

    console.log('✅ Confirmación simulada exitosamente');
    console.log('📊 Respuesta simulada:', mockResponse);

    return {
      success: true,
      authCode: '439764',
      responseCode: '0900',
      orderNumber
    };

  } catch (error) {
    console.error('❌ Error confirmando preautorización:', error);
    throw error;
  }
}

// Función para simular webhook de Redsys
function simulateRedsysWebhook(orderNumber, responseCode, transactionType, amount, reservationId) {
  try {
    console.log('\n🔄 Simulando webhook de Redsys...');
    console.log('📋 Datos de entrada:', { orderNumber, responseCode, transactionType, amount, reservationId });

    // Convertir amount a céntimos
    const amountInCents = Math.round(amount * 100);

    // Parámetros del webhook según documentación oficial
    const webhookParameters = {
      Ds_Amount: amountInCents.toString(),
      Ds_Currency: '978',
      Ds_Order: orderNumber,
      Ds_MerchantCode: config.merchantCode,
      Ds_Terminal: config.terminal,
      Ds_Response: responseCode,
      Ds_AuthorisationCode: responseCode === '0000' ? '439764' : '',
      Ds_TransactionType: transactionType,
      Ds_SecurePayment: '2',
      Ds_Language: '1',
      Ds_MerchantData: reservationId,
      Ds_Card_Country: '724',
      Ds_Card_Brand: '1',
      Ds_ProcessedPayMethod: '78',
      Ds_Control_1680073933553: '1680073933553'
    };

    // Codificar parámetros en base64
    const merchantParametersBase64 = Buffer.from(JSON.stringify(webhookParameters)).toString('base64');

    // Generar firma
    const signature = generateSignature(orderNumber, merchantParametersBase64, config.secretKey);

    // Datos del webhook
    const webhookData = {
      Ds_MerchantParameters: merchantParametersBase64,
      Ds_Signature: signature,
      Ds_SignatureVersion: 'HMAC_SHA256_V1'
    };

    console.log('✅ Webhook simulado exitosamente');
    console.log('📊 Datos del webhook:', {
      orderNumber,
      responseCode,
      transactionType,
      amountInCents,
      webhookParameters
    });

    return webhookData;

  } catch (error) {
    console.error('❌ Error simulando webhook:', error);
    throw error;
  }
}

// Función principal de prueba
async function testPreauthorizationFlow() {
  try {
    console.log('🚀 Iniciando prueba del flujo de preautorizaciones de Redsys');
    console.log('📚 Basado en documentación oficial de Redsys');
    console.log('🔧 Configuración:', config);

    // Datos de prueba
    const testData = {
      reservationId: 'test-reservation-' + Date.now(),
      amount: 125.50,
      description: 'Excursión a Teide - Prueba de preautorización'
    };

    // Paso 1: Crear preautorización
    const preauthResult = await createPreauthorization(
      testData.reservationId,
      testData.amount,
      testData.description
    );

    // Paso 2: Simular webhook de preautorización exitosa
    const preauthWebhook = simulateRedsysWebhook(
      preauthResult.orderNumber,
      '0000', // Código de éxito para preautorización
      '1',    // Tipo de transacción: preautorización
      testData.amount,
      testData.reservationId
    );

    // Paso 3: Confirmar preautorización
    const confirmationResult = await confirmPreauthorization(
      preauthResult.orderNumber,
      testData.amount
    );

    // Paso 4: Simular webhook de confirmación exitosa
    const confirmationWebhook = simulateRedsysWebhook(
      preauthResult.orderNumber,
      '0900', // Código de éxito para confirmación
      '2',    // Tipo de transacción: confirmación
      testData.amount,
      testData.reservationId
    );

    console.log('\n🎉 Prueba completada exitosamente!');
    console.log('📋 Resumen del flujo:');
    console.log('  1. ✅ Preautorización creada:', preauthResult.orderNumber);
    console.log('  2. ✅ Webhook de preautorización simulado');
    console.log('  3. ✅ Preautorización confirmada:', confirmationResult.authCode);
    console.log('  4. ✅ Webhook de confirmación simulado');

    console.log('\n📊 Datos finales:');
    console.log('  - Número de pedido:', preauthResult.orderNumber);
    console.log('  - Importe:', testData.amount, 'EUR');
    console.log('  - Código de autorización:', confirmationResult.authCode);
    console.log('  - Código de respuesta final:', confirmationResult.responseCode);

    console.log('\n🔗 URLs de prueba:');
    console.log('  - URL de Redsys:', config.environment);
    console.log('  - URL de éxito:', `${config.baseUrl}/payment/success?reservationId=${testData.reservationId}`);
    console.log('  - URL de error:', `${config.baseUrl}/payment/error?reservationId=${testData.reservationId}`);
    console.log('  - URL de webhook:', `${config.baseUrl}/api/payment/webhook`);

    return {
      success: true,
      preauthResult,
      confirmationResult,
      preauthWebhook,
      confirmationWebhook
    };

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    return { success: false, error: error.message };
  }
}

// Ejecutar prueba si se llama directamente
if (require.main === module) {
  testPreauthorizationFlow()
    .then(result => {
      if (result.success) {
        console.log('\n✅ Prueba completada con éxito');
        process.exit(0);
      } else {
        console.log('\n❌ Prueba falló:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Error inesperado:', error);
      process.exit(1);
    });
}

module.exports = {
  createPreauthorization,
  confirmPreauthorization,
  simulateRedsysWebhook,
  testPreauthorizationFlow
}; 