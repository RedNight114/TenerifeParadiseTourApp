#!/usr/bin/env node

/**
 * Script que simula exactamente las llamadas del frontend a la API de pagos
 * Para identificar por qué se está enviando importe 0 a Redsys
 */

// Usar fetch nativo de Node.js (disponible desde Node 18+)
// Si estás usando una versión anterior, instala: npm install node-fetch

// Datos de prueba que simulan diferentes escenarios del frontend
const testScenarios = [
  {
    name: 'Datos válidos',
    data: {
      reservationId: 'test-reservation-123',
      amount: 125.50,
      description: 'Excursión a Teide'
    }
  },
  {
    name: 'Amount como string',
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
    name: 'Sin amount',
    data: {
      reservationId: 'test-reservation-123',
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

async function testPaymentAPI(scenario) {
  console.log(`\n🧪 Probando escenario: ${scenario.name}`);
  console.log(`📋 Datos enviados:`, scenario.data);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scenario.data),
    });

    const responseData = await response.json();
    
    console.log(`📊 Respuesta HTTP: ${response.status} ${response.statusText}`);
    console.log(`📄 Datos de respuesta:`, responseData);
    
    if (response.ok) {
      console.log(`✅ ÉXITO: API respondió correctamente`);
      if (responseData.debug) {
        console.log(`🔍 Datos de debug:`, responseData.debug);
      }
    } else {
      console.log(`❌ ERROR: API respondió con error`);
      if (responseData.error) {
        console.log(`🚨 Error: ${responseData.error}`);
      }
      if (responseData.details) {
        console.log(`📝 Detalles: ${responseData.details}`);
      }
    }
    
    return {
      success: response.ok,
      status: response.status,
      data: responseData
    };
    
  } catch (error) {
    console.log(`💥 ERROR DE RED: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

async function runAllTests() {
  console.log('🚀 INICIANDO PRUEBAS DE LA API DE PAGOS');
  console.log('=======================================');
  console.log(`🌐 API Base URL: ${API_BASE_URL}`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  
  const results = [];
  
  for (const scenario of testScenarios) {
    const result = await testPaymentAPI(scenario);
    results.push({
      scenario: scenario.name,
      ...result
    });
    
    // Pausa entre pruebas para no sobrecargar el servidor
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Resumen de resultados
  console.log('\n📊 RESUMEN DE RESULTADOS');
  console.log('========================');
  
  const successfulTests = results.filter(r => r.success);
  const failedTests = results.filter(r => !r.success);
  
  console.log(`✅ Pruebas exitosas: ${successfulTests.length}`);
  console.log(`❌ Pruebas fallidas: ${failedTests.length}`);
  
  if (failedTests.length > 0) {
    console.log('\n❌ PRUEBAS FALLIDAS:');
    failedTests.forEach(test => {
      console.log(`   - ${test.scenario}: ${test.status || test.error}`);
    });
  }
  
  if (successfulTests.length > 0) {
    console.log('\n✅ PRUEBAS EXITOSAS:');
    successfulTests.forEach(test => {
      console.log(`   - ${test.scenario}`);
    });
  }
  
  // Análisis específico del problema SIS0042
  console.log('\n🔍 ANÁLISIS DEL ERROR SIS0042');
  console.log('=============================');
  
  const zeroAmountTests = results.filter(r => 
    r.data && r.data.error && r.data.error.includes('Importe')
  );
  
  if (zeroAmountTests.length > 0) {
    console.log('⚠️  Pruebas que generan importe 0 o inválido:');
    zeroAmountTests.forEach(test => {
      console.log(`   - ${test.scenario}: ${test.data.error}`);
      if (test.data.details) {
        console.log(`     Detalles: ${test.data.details}`);
      }
    });
  } else {
    console.log('✅ No se detectaron problemas de importe 0 en las pruebas');
  }
  
  // Recomendaciones
  console.log('\n💡 RECOMENDACIONES');
  console.log('==================');
  
  if (failedTests.length > 0) {
    console.log('1. Revisar los logs del servidor para ver los detalles completos');
    console.log('2. Verificar que el frontend envía los datos en el formato correcto');
    console.log('3. Asegurar que amount sea siempre un número mayor que 0');
    console.log('4. Verificar que reservationId no esté vacío');
  } else {
    console.log('1. Todas las pruebas pasaron correctamente');
    console.log('2. El problema puede estar en el frontend real');
    console.log('3. Revisar los logs del servidor en producción');
  }
  
  console.log('\n🎯 PRÓXIMOS PASOS');
  console.log('==================');
  console.log('1. Ejecutar este script en el entorno de producción');
  console.log('2. Revisar los logs del servidor durante una transacción real');
  console.log('3. Verificar los datos que envía el frontend real');
  console.log('4. Comparar con los datos de prueba exitosos');
  
  return results;
}

// Configuración
const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Ejecutar si se llama directamente
if (require.main === module) {
  runAllTests()
    .then(results => {
      console.log('\n✅ Pruebas completadas');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Error ejecutando pruebas:', error);
      process.exit(1);
    });
}

module.exports = {
  testPaymentAPI,
  runAllTests,
  testScenarios
}; 