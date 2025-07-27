// Script corregido V3 para arreglar la carga de servicios
console.log('🔧 ARREGLANDO CARGA DE SERVICIOS - VERSIÓN 3');
console.log('============================================');

// Función para generar UUID válido
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Función para inyectar datos de servicio hardcodeados
function injectHardcodedService() {
  console.log('💉 Inyectando servicio hardcodeado...');
  
  const hardcodedService = {
    id: '08ae78c2-5622-404a-81ae-1a6dbd4ebdea',
    title: 'Glamping',
    description: 'Experiencia de glamping en Tenerife',
    price: 90,
    max_group_size: 10,
    available: true,
    featured: false,
    category_id: '1',
    images: [],
    price_type: 'per_person'
  };
  
  console.log('📊 Servicio hardcodeado:', hardcodedService);
  
  // Crear panel de información
  const serviceInfoContainer = document.createElement('div');
  serviceInfoContainer.id = 'hardcoded-service-info-v3';
  serviceInfoContainer.style.cssText = `
    position: fixed;
    top: 420px;
    right: 20px;
    z-index: 10000;
    background: #1f2937;
    color: white;
    padding: 15px;
    border-radius: 8px;
    font-size: 12px;
    max-width: 300px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;
  
  serviceInfoContainer.innerHTML = `
    <h3 style="margin: 0 0 10px 0; color: #60a5fa;">🛠️ Servicio Hardcodeado V3</h3>
    <p><strong>ID:</strong> ${hardcodedService.id}</p>
    <p><strong>Título:</strong> ${hardcodedService.title}</p>
    <p><strong>Precio:</strong> ${hardcodedService.price}€</p>
    <p><strong>Max. grupo:</strong> ${hardcodedService.max_group_size}</p>
    <p style="color: #10b981; margin-top: 10px;">✅ Datos inyectados correctamente</p>
    <p style="color: #f59e0b; font-size: 10px;">🔧 URLs corregidas sin caracteres escapados</p>
  `;
  
  document.body.appendChild(serviceInfoContainer);
  window.hardcodedService = hardcodedService;
  
  console.log('✅ Servicio hardcodeado inyectado');
  return hardcodedService;
}

// Función para crear botón de prueba de pago corregido
function createPaymentTestButton() {
  console.log('💳 Creando botón de prueba de pago V3...');
  
  const paymentButton = document.createElement('button');
  paymentButton.textContent = '💳 Probar Pago V3 (URLs Corregidas)';
  paymentButton.style.cssText = `
    position: fixed;
    top: 460px;
    right: 20px;
    z-index: 10000;
    background: #059669;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
  `;
  
  paymentButton.onclick = async () => {
    console.log('🚀 Iniciando prueba de pago V3 con URLs corregidas...');
    
    const service = window.hardcodedService;
    const form = document.querySelector('form');
    const guests = form ? parseInt(form.querySelector('[name="guests"]')?.value || '1') : 1;
    const total = service.price * guests;
    const validReservationId = generateUUID();
    
    console.log('💰 Datos de prueba V3:', {
      servicePrice: service.price,
      guests: guests,
      total: total,
      reservationId: validReservationId,
      calculation: `${service.price} * ${guests} = ${total}`
    });
    
    try {
      const paymentResponse = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationId: validReservationId,
          amount: total,
          description: `Reserva: ${service.title}`
        })
      });
      
      console.log('📥 Respuesta de pago V3:', paymentResponse.status);
      
      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        console.log('✅ Datos de pago V3 recibidos:', paymentData);
        
        if (!paymentData.redsysUrl || !paymentData.formData) {
          throw new Error('Respuesta de pago incompleta');
        }
        
        // Verificar que las URLs no tengan caracteres escapados
        const merchantParamsBase64 = paymentData.formData.Ds_MerchantParameters;
        if (merchantParamsBase64) {
          try {
            const decodedParams = atob(merchantParamsBase64);
            console.log('📄 Parámetros decodificados V3:', decodedParams);
            
            if (decodedParams.includes('\\/')) {
              console.warn('⚠️  ADVERTENCIA: URLs aún tienen caracteres escapados');
            } else {
              console.log('✅ URLs corregidas sin caracteres escapados');
            }
          } catch (e) {
            console.log('📄 No se pudieron decodificar los parámetros para verificación');
          }
        }
        
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = paymentData.redsysUrl;
        
        Object.entries(paymentData.formData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
          console.log(`📝 Campo ${key}: ${value.substring(0, 50)}...`);
        });
        
        document.body.appendChild(form);
        console.log('🚀 Enviando formulario a Redsys V3...');
        console.log('📍 URL destino:', paymentData.redsysUrl);
        form.submit();
        
      } else {
        const errorData = await paymentResponse.json();
        console.error('❌ Error en pago V3:', errorData);
        
        if (errorData.details && Array.isArray(errorData.details)) {
          console.error('📋 Detalles del error V3:', errorData.details);
          alert(`Error en pago V3:\n${errorData.error}\n\nDetalles:\n${errorData.details.join('\n')}`);
        } else {
          alert(`Error en pago V3: ${errorData.error || 'Error desconocido'}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Error en prueba de pago V3:', error);
      alert(`Error en prueba de pago V3: ${error.message}`);
    }
  };
  
  document.body.appendChild(paymentButton);
  console.log('✅ Botón de prueba de pago V3 creado');
}

// Función para crear botón de prueba con datos reales
function createRealDataTestButton() {
  console.log('🎯 Creando botón de prueba con datos reales V3...');
  
  const realButton = document.createElement('button');
  realButton.textContent = '🎯 Probar con Datos Reales V3';
  realButton.style.cssText = `
    position: fixed;
    top: 500px;
    right: 20px;
    z-index: 10000;
    background: #7c3aed;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
  `;
  
  realButton.onclick = async () => {
    console.log('🎯 Iniciando prueba con datos reales V3...');
    
    const form = document.querySelector('form');
    if (!form) {
      alert('❌ No se encontró el formulario');
      return;
    }
    
    const formData = new FormData(form);
    const contactName = formData.get('contact_name') || 'Test User';
    const contactEmail = formData.get('contact_email') || 'test@example.com';
    const contactPhone = formData.get('contact_phone') || '123456789';
    const guests = parseInt(formData.get('guests') || '1');
    const reservationDate = formData.get('reservation_date') || '2025-07-25';
    const reservationTime = formData.get('reservation_time') || '11:00';
    
    const service = window.hardcodedService;
    const total = service.price * guests;
    const validReservationId = generateUUID();
    
    console.log('📊 Datos reales del formulario V3:', {
      contactName,
      contactEmail,
      contactPhone,
      guests,
      reservationDate,
      reservationTime,
      total
    });
    
    try {
      // Primero crear la reserva real
      const reservationResponse = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'test-user-id',
          service_id: service.id,
          reservation_date: reservationDate,
          reservation_time: reservationTime,
          guests: guests,
          total_amount: total,
          status: 'pendiente',
          payment_status: 'pendiente',
          special_requests: null,
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone
        })
      });
      
      console.log('📥 Respuesta de reserva V3:', reservationResponse.status);
      
      if (reservationResponse.ok) {
        const reservationData = await reservationResponse.json();
        console.log('✅ Reserva creada V3:', reservationData);
        
        // Ahora crear el pago con el ID real de la reserva
        const paymentResponse = await fetch('/api/payment/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reservationId: reservationData.id,
            amount: total,
            description: `Reserva: ${service.title}`
          })
        });
        
        console.log('📥 Respuesta de pago V3:', paymentResponse.status);
        
        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json();
          console.log('✅ Datos de pago V3 recibidos:', paymentData);
          
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = paymentData.redsysUrl;
          
          Object.entries(paymentData.formData).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
          });
          
          document.body.appendChild(form);
          console.log('🚀 Enviando formulario a Redsys V3...');
          form.submit();
          
        } else {
          const errorData = await paymentResponse.json();
          console.error('❌ Error en pago V3:', errorData);
          alert(`Error en pago V3: ${errorData.error || 'Error desconocido'}`);
        }
        
      } else {
        const errorData = await reservationResponse.json();
        console.error('❌ Error en reserva V3:', errorData);
        alert(`Error en reserva V3: ${errorData.error || 'Error desconocido'}`);
      }
      
    } catch (error) {
      console.error('❌ Error en prueba con datos reales V3:', error);
      alert(`Error en prueba V3: ${error.message}`);
    }
  };
  
  document.body.appendChild(realButton);
  console.log('✅ Botón de prueba con datos reales V3 creado');
}

// Ejecutar funciones
injectHardcodedService();
createPaymentTestButton();
createRealDataTestButton();

console.log('🎉 Script de arreglo V3 completado');
console.log('💡 Usa el botón verde para probar el pago con URLs corregidas'); 