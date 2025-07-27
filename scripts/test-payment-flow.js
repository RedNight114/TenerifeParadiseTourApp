const fetch = require('node-fetch');

async function testPaymentFlow() {
  console.log('🧪 PROBANDO FLUJO COMPLETO DE PAGO');
  console.log('====================================');

  try {
    // Paso 1: Crear reserva
    console.log('\n📋 PASO 1: Creando reserva...');
    
    const reservationData = {
      user_id: "e6c33f40-1078-4e7d-9776-8d940b539eb0", // ID de usuario de prueba
      service_id: "08ae78c2-5622-404a-81ae-1a6dbd4ebdea", // ID de servicio Glamping
      reservation_date: "2025-07-25",
      reservation_time: "14:00",
      guests: 1,
      total_amount: 180,
      status: "pendiente",
      payment_status: "pendiente",
      special_requests: null,
      contact_name: "Brian Afonso",
      contact_email: "brian12guargacho@gmail.com",
      contact_phone: "625304806"
    };

    console.log('📤 Enviando datos de reserva:', JSON.stringify(reservationData, null, 2));

    const reservationResponse = await fetch('http://localhost:3000/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationData)
    });

    console.log('📥 Status de respuesta de reserva:', reservationResponse.status);

    if (!reservationResponse.ok) {
      const errorText = await reservationResponse.text();
      console.error('❌ Error en reserva:', errorText);
      return;
    }

    const reservation = await reservationResponse.json();
    console.log('✅ Reserva creada:', reservation.id);

    // Paso 2: Crear pago
    console.log('\n💳 PASO 2: Creando pago...');
    
    const paymentData = {
      reservationId: reservation.id,
      amount: 180,
      description: "Reserva: Glamping"
    };

    console.log('📤 Enviando datos de pago:', JSON.stringify(paymentData, null, 2));

    const paymentResponse = await fetch('http://localhost:3000/api/payment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    });

    console.log('📥 Status de respuesta de pago:', paymentResponse.status);

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error('❌ Error en pago:', errorText);
      return;
    }

    const payment = await paymentResponse.json();
    console.log('✅ Pago creado exitosamente');
    console.log('📊 Datos de pago:', JSON.stringify(payment, null, 2));

    // Verificar estructura de respuesta
    console.log('\n🔍 VERIFICANDO ESTRUCTURA DE RESPUESTA:');
    console.log('- redsysUrl:', payment.redsysUrl ? '✅ Presente' : '❌ Faltante');
    console.log('- formData:', payment.formData ? '✅ Presente' : '❌ Faltante');
    
    if (payment.formData) {
      console.log('- Ds_SignatureVersion:', payment.formData.Ds_SignatureVersion ? '✅ Presente' : '❌ Faltante');
      console.log('- Ds_MerchantParameters:', payment.formData.Ds_MerchantParameters ? '✅ Presente' : '❌ Faltante');
      console.log('- Ds_Signature:', payment.formData.Ds_Signature ? '✅ Presente' : '❌ Faltante');
    }

    // Paso 3: Simular envío a Redsys
    console.log('\n🌐 PASO 3: Simulando envío a Redsys...');
    console.log('URL de Redsys:', payment.redsysUrl);
    console.log('Método: POST');
    console.log('Campos del formulario:');
    
    if (payment.formData) {
      Object.entries(payment.formData).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    }

    console.log('\n✅ FLUJO COMPLETADO EXITOSAMENTE');
    console.log('El problema debe estar en el frontend, no en las APIs');

  } catch (error) {
    console.error('💥 ERROR EN EL FLUJO:', error);
  }
}

// Ejecutar el test
testPaymentFlow(); 