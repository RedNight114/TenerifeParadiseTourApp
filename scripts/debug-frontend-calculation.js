#!/usr/bin/env node

/**
 * Script para diagnosticar el cálculo de precios del frontend
 * Simula exactamente la lógica de calculateTotal() del componente booking
 */

// Simular datos del servicio (como los que vendrían de la base de datos)
const mockServices = [
  {
    id: 'service-1',
    title: 'Excursión a Teide',
    price: 125.50,
    price_type: 'per_person',
    max_group_size: 10
  },
  {
    id: 'service-2',
    title: 'Alquiler de Coche',
    price: 45.00,
    price_type: 'per_person',
    max_group_size: 5
  },
  {
    id: 'service-3',
    title: 'Cena Gourmet',
    price: 0, // ⚠️ PROBLEMA: Precio 0
    price_type: 'per_person',
    max_group_size: 8
  },
  {
    id: 'service-4',
    title: 'Tour Privado',
    price: null, // ⚠️ PROBLEMA: Precio null
    price_type: 'per_person',
    max_group_size: 6
  },
  {
    id: 'service-5',
    title: 'Actividad Aventura',
    price: undefined, // ⚠️ PROBLEMA: Precio undefined
    price_type: 'per_person',
    max_group_size: 4
  }
];

// Simular datos del formulario
const mockFormData = {
  guests: 2,
  reservation_date: '2025-07-20',
  contact_name: 'Juan Pérez',
  contact_email: 'juan@example.com',
  contact_phone: '+34 123 456 789'
};

// Función calculateTotal() exactamente como está en el frontend
function calculateTotal(service, guests) {
  console.log(`🔍 Calculando total para servicio: ${service?.title}`);
  console.log(`   Precio del servicio: ${service?.price} (tipo: ${typeof service?.price})`);
  console.log(`   Número de huéspedes: ${guests} (tipo: ${typeof guests})`);
  
  if (!service) {
    console.log(`❌ No hay servicio - retornando 0`);
    return 0;
  }
  
  const total = service.price * guests;
  console.log(`💰 Cálculo: ${service.price} × ${guests} = ${total}`);
  
  return total;
}

// Función para validar el total antes de enviar
function validateTotal(total, service, guests) {
  console.log(`\n🔍 Validando total: ${total}`);
  
  const issues = [];
  
  if (total === 0) {
    issues.push('Total es 0');
  }
  
  if (total < 0) {
    issues.push('Total es negativo');
  }
  
  if (isNaN(total)) {
    issues.push('Total es NaN');
  }
  
  if (!isFinite(total)) {
    issues.push('Total no es un número finito');
  }
  
  if (issues.length > 0) {
    console.log(`❌ PROBLEMAS DETECTADOS:`);
    issues.forEach(issue => console.log(`   - ${issue}`));
    return false;
  }
  
  console.log(`✅ Total válido: ${total}`);
  return true;
}

// Función para simular el proceso completo de reserva
function simulateBookingProcess(service, formData) {
  console.log(`\n🚀 SIMULANDO PROCESO DE RESERVA`);
  console.log(`================================`);
  console.log(`Servicio: ${service.title}`);
  console.log(`Huéspedes: ${formData.guests}`);
  console.log(`Fecha: ${formData.reservation_date}`);
  
  // Paso 1: Calcular total
  const total = calculateTotal(service, formData.guests);
  
  // Paso 2: Validar total
  const isTotalValid = validateTotal(total, service, formData.guests);
  
  if (!isTotalValid) {
    console.log(`❌ RESERVA RECHAZADA: Total inválido`);
    return {
      success: false,
      error: 'Total inválido',
      total,
      service: service.title
    };
  }
  
  // Paso 3: Crear datos de reserva
  const reservationData = {
    service_id: service.id,
    guests: formData.guests,
    total_amount: total,
    reservation_date: formData.reservation_date,
    contact_name: formData.contact_name,
    contact_email: formData.contact_email,
    contact_phone: formData.contact_phone
  };
  
  console.log(`✅ DATOS DE RESERVA:`, reservationData);
  
  // Paso 4: Crear datos de pago
  const paymentData = {
    reservationId: 'mock-reservation-id',
    amount: total,
    description: `Reserva: ${service.title}`
  };
  
  console.log(`✅ DATOS DE PAGO:`, paymentData);
  
  return {
    success: true,
    reservationData,
    paymentData,
    total
  };
}

// Ejecutar pruebas
console.log('🧪 DIAGNÓSTICO DE CÁLCULO DE PRECIOS DEL FRONTEND');
console.log('==================================================');

const results = [];

mockServices.forEach((service, index) => {
  console.log(`\n${index + 1}. Probando servicio: ${service.title}`);
  console.log('─'.repeat(60));
  
  const result = simulateBookingProcess(service, mockFormData);
  results.push({
    service: service.title,
    ...result
  });
  
  if (result.success) {
    console.log(`✅ ÉXITO: Reserva procesada correctamente`);
  } else {
    console.log(`❌ ERROR: ${result.error}`);
  }
});

// Resumen de resultados
console.log('\n📊 RESUMEN DE RESULTADOS');
console.log('========================');

const successfulBookings = results.filter(r => r.success);
const failedBookings = results.filter(r => !r.success);

console.log(`✅ Reservas exitosas: ${successfulBookings.length}`);
console.log(`❌ Reservas fallidas: ${failedBookings.length}`);

if (failedBookings.length > 0) {
  console.log('\n❌ RESERVAS FALLIDAS:');
  failedBookings.forEach(booking => {
    console.log(`   - ${booking.service}: ${booking.error} (Total: ${booking.total})`);
  });
}

// Análisis específico del problema SIS0042
console.log('\n🔍 ANÁLISIS DEL ERROR SIS0042');
console.log('=============================');

const zeroAmountBookings = results.filter(r => r.total === 0 || r.total === null || r.total === undefined);

if (zeroAmountBookings.length > 0) {
  console.log('⚠️  Reservas que generarían error SIS0042:');
  zeroAmountBookings.forEach(booking => {
    console.log(`   - ${booking.service}: Total = ${booking.total}`);
  });
} else {
  console.log('✅ No se detectaron reservas con importe 0');
}

// Recomendaciones
console.log('\n💡 RECOMENDACIONES');
console.log('==================');

if (failedBookings.length > 0) {
  console.log('1. Verificar que todos los servicios tengan precio > 0 en la base de datos');
  console.log('2. Agregar validación en el frontend antes de calcular el total');
  console.log('3. Mostrar error al usuario si el precio del servicio es inválido');
  console.log('4. Revisar la base de datos para servicios con precio 0, null o undefined');
} else {
  console.log('1. Todos los cálculos están funcionando correctamente');
  console.log('2. El problema puede estar en datos específicos de la base de datos');
  console.log('3. Revisar los logs del servidor durante una transacción real');
}

console.log('\n🎯 PRÓXIMOS PASOS');
console.log('==================');
console.log('1. Ejecutar consulta SQL para verificar precios en la base de datos:');
console.log('   SELECT id, title, price FROM services WHERE price <= 0 OR price IS NULL;');
console.log('2. Revisar los logs del servidor durante una reserva real');
console.log('3. Verificar que el frontend reciba datos correctos del servicio');

console.log('\n✅ Diagnóstico completado'); 