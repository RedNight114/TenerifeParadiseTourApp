#!/usr/bin/env node

/**
 * Script que prueba directamente la lógica de la API de pagos
 * Para identificar por qué se está enviando importe 0 a Redsys
 */

const crypto = require('crypto');

// Simular la configuración de Redsys
const config = {
  merchantCode: process.env.REDSYS_MERCHANT_CODE || '999008881',
  terminal: process.env.REDSYS_TERMINAL || '1',
  secretKey: process.env.REDSYS_SECRET_KEY || 'sq7HjrUOBfKmC576ILgskD5srU870gJ7',
  environment: process.env.REDSYS_ENVIRONMENT || 'https://sis-t.redsys.es:25443/sis/realizarPago',
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
};

// Función para generar firma (copiada de la API)
function generateSignature(order, merchantParameters, secretKey) {
  try {
    const decodedKey = Buffer.from(secretKey, "base64");
    const hmac = crypto.createHmac("sha256", decodedKey);
    hmac.update(order + merchantParameters);
    return hmac.digest("base64");
  } catch (error) {
    console.error("Error generando firma:", error);
    throw new Error("Error al generar la firma de seguridad");
  }
}

// Función que simula el procesamiento de la API
function processPaymentRequest(data) {
  console.log(`\n🔍 Procesando datos:`, data);
  
  // Validación básica
  if (!data.amount || data.amount <= 0) {
    return {
      error: "Importe inválido",
      details: "El importe debe ser mayor que 0",
      receivedAmount: data.amount,
      receivedType: typeof data.amount
    };
  }

  if (!data.reservationId || data.reservationId.trim() === '') {
    return {
      error: "ID de reserva inválido",
      details: "El ID de reserva no puede estar vacío",
      receivedReservationId: data.reservationId
    };
  }

  // Convertir amount a céntimos
  const amountInCents = Math.round(data.amount * 100);
  
  console.log(`💰 Cálculo de importe:`, {
    originalAmount: data.amount,
    amountType: typeof data.amount,
    amountInCents,
    calculation: `${data.amount} * 100 = ${amountInCents}`
  });

  if (amountInCents <= 0) {
    return {
      error: "Importe en céntimos inválido",
      details: "El importe convertido a céntimos debe ser mayor que 0",
      originalAmount: data.amount,
      amountInCents
    };
  }

  // Generar número de pedido
  const orderNumber = `${Date.now()}${data.reservationId.slice(-4)}`.slice(0, 12);
  
  console.log(`📋 Número de pedido:`, {
    timestamp: Date.now(),
    reservationIdSuffix: data.reservationId.slice(-4),
    orderNumber,
    orderNumberLength: orderNumber.length
  });

  if (!orderNumber || orderNumber.length === 0) {
    return {
      error: "Número de pedido inválido",
      details: "No se pudo generar un número de pedido válido",
      orderNumber,
      timestamp: Date.now()
    };
  }

  // URLs de respuesta
  const urlOK = `${config.baseUrl}/payment/success?reservationId=${data.reservationId}`;
  const urlKO = `${config.baseUrl}/payment/error?reservationId=${data.reservationId}`;
  const urlNotification = `${config.baseUrl}/api/payment/webhook`;

  // Parámetros de Redsys
  const merchantParameters = {
    DS_MERCHANT_AMOUNT: amountInCents.toString().padStart(12, '0'),
    DS_MERCHANT_ORDER: orderNumber,
    DS_MERCHANT_MERCHANTCODE: config.merchantCode,
    DS_MERCHANT_CURRENCY: "978",
    DS_MERCHANT_TRANSACTIONTYPE: "1",
    DS_MERCHANT_TERMINAL: config.terminal,
    DS_MERCHANT_MERCHANTURL: urlNotification,
    DS_MERCHANT_URLOK: urlOK,
    DS_MERCHANT_URLKO: urlKO,
    DS_MERCHANT_PRODUCTDESCRIPTION: data.description,
    DS_MERCHANT_MERCHANTNAME: "Tenerife Paradise Tours",
    DS_MERCHANT_CONSUMERLANGUAGE: "001",
    DS_MERCHANT_MERCHANTDATA: data.reservationId,
  };

  console.log(`📊 Parámetros de Redsys:`, merchantParameters);

  // Validación final
  if (merchantParameters.DS_MERCHANT_AMOUNT === '000000000000') {
    return {
      error: "Importe final es 0",
      details: "El importe final enviado a Redsys es 0",
      originalAmount: data.amount,
      amountInCents,
      finalAmount: merchantParameters.DS_MERCHANT_AMOUNT
    };
  }

  if (!merchantParameters.DS_MERCHANT_ORDER || merchantParameters.DS_MERCHANT_ORDER.length === 0) {
    return {
      error: "Número de pedido final vacío",
      details: "El número de pedido enviado a Redsys está vacío",
      orderNumber,
      finalOrder: merchantParameters.DS_MERCHANT_ORDER
    };
  }

  // Codificar parámetros
  const merchantParametersBase64 = Buffer.from(JSON.stringify(merchantParameters)).toString("base64");
  const signature = generateSignature(orderNumber, merchantParametersBase64, config.secretKey);

  return {
    success: true,
    orderNumber,
    amount: data.amount,
    amountInCents,
    finalAmount: merchantParameters.DS_MERCHANT_AMOUNT,
    finalOrder: merchantParameters.DS_MERCHANT_ORDER,
    signatureLength: signature.length,
    debug: {
      amountInCents,
      finalAmount: merchantParameters.DS_MERCHANT_AMOUNT,
      finalOrder: merchantParameters.DS_MERCHANT_ORDER
    }
  };
}

// Datos de prueba
const testCases = [
  {
    name: 'Datos válidos',
    data: {
      reservationId: 'test-reservation-123',
      amount: 125.50,
      description: 'Excursión a Teide'
    }
  },
  {
    name: 'Amount como string numérico',
    data: {
      reservationId: 'test-reservation-123',
      amount: '125.50',
      description: 'Excursión a Teide'
    }
  },
  {
    name: 'Amount 0',
    data: {
      reservationId: 'test-reservation-123',
      amount: 0,
      description: 'Excursión a Teide'
    }
  },
  {
    name: 'Amount undefined',
    data: {
      reservationId: 'test-reservation-123',
      amount: undefined,
      description: 'Excursión a Teide'
    }
  },
  {
    name: 'Amount null',
    data: {
      reservationId: 'test-reservation-123',
      amount: null,
      description: 'Excursión a Teide'
    }
  },
  {
    name: 'Amount como string vacío',
    data: {
      reservationId: 'test-reservation-123',
      amount: '',
      description: 'Excursión a Teide'
    }
  },
  {
    name: 'Amount como string "0"',
    data: {
      reservationId: 'test-reservation-123',
      amount: '0',
      description: 'Excursión a Teide'
    }
  },
  {
    name: 'Amount negativo',
    data: {
      reservationId: 'test-reservation-123',
      amount: -50,
      description: 'Excursión a Teide'
    }
  },
  {
    name: 'Amount muy pequeño',
    data: {
      reservationId: 'test-reservation-123',
      amount: 0.001,
      description: 'Excursión a Teide'
    }
  },
  {
    name: 'ReservationId vacío',
    data: {
      reservationId: '',
      amount: 125.50,
      description: 'Excursión a Teide'
    }
  },
  {
    name: 'Sin reservationId',
    data: {
      amount: 125.50,
      description: 'Excursión a Teide'
    }
  }
];

// Ejecutar pruebas
console.log('🧪 PRUEBAS DE LÓGICA DE PAGOS');
console.log('==============================');
console.log(`🔧 Configuración:`, config);
console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

const results = [];

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}`);
  console.log('─'.repeat(50));
  
  const result = processPaymentRequest(testCase.data);
  results.push({
    testCase: testCase.name,
    ...result
  });
  
  if (result.success) {
    console.log(`✅ ÉXITO: ${result.orderNumber} - ${result.amount}€`);
  } else {
    console.log(`❌ ERROR: ${result.error}`);
    if (result.details) {
      console.log(`   Detalles: ${result.details}`);
    }
  }
});

// Resumen
console.log('\n📊 RESUMEN DE RESULTADOS');
console.log('========================');

const successfulTests = results.filter(r => r.success);
const failedTests = results.filter(r => !r.success);

console.log(`✅ Pruebas exitosas: ${successfulTests.length}`);
console.log(`❌ Pruebas fallidas: ${failedTests.length}`);

if (failedTests.length > 0) {
  console.log('\n❌ PRUEBAS FALLIDAS:');
  failedTests.forEach(test => {
    console.log(`   - ${test.testCase}: ${test.error}`);
  });
}

// Análisis específico del problema SIS0042
console.log('\n🔍 ANÁLISIS DEL ERROR SIS0042');
console.log('=============================');

const zeroAmountTests = results.filter(r => 
  r.error && (r.error.includes('Importe') || r.error.includes('0'))
);

if (zeroAmountTests.length > 0) {
  console.log('⚠️  Casos que generarían error SIS0042:');
  zeroAmountTests.forEach(test => {
    console.log(`   - ${test.testCase}: ${test.error}`);
    if (test.details) {
      console.log(`     ${test.details}`);
    }
  });
} else {
  console.log('✅ No se detectaron casos que generen error SIS0042');
}

console.log('\n💡 RECOMENDACIONES');
console.log('==================');
console.log('1. Verificar que el frontend envía amount como número > 0');
console.log('2. Asegurar que amount no sea undefined, null, o string vacío');
console.log('3. Validar que reservationId no esté vacío');
console.log('4. Revisar los logs del servidor para ver qué datos llegan realmente');

console.log('\n✅ Análisis completado'); 