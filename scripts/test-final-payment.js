// Script final para probar el pago con la corrección de URLs
console.log('🎯 PRUEBA FINAL DE PAGO - URLs Corregidas');
console.log('==========================================');

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
  serviceInfoContainer.id = 'final-payment-test';
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
    <h3 style="margin: 0 0 10px 0; color: #60a5fa;">🎯 Prueba Final de Pago</h3>
    <p><strong>ID:</strong> ${hardcodedService.id}</p>
    <p><strong>Título:</strong> ${hardcodedService.title}</p>
    <p><strong>Precio:</strong> ${hardcodedService.price}€</p>
    <p><strong>Max. grupo:</strong> ${hardcodedService.max_group_size}</p>
    <p style="color: #10b981; margin-top: 10px;">✅ URLs corregidas sin caracteres escapados</p>
    <p style="color: #f59e0b; font-size: 10px;">🔧 Firma corregida para Redsys</p>
  `;
  
  document.body.appendChild(serviceInfoContainer);
  window.hardcodedService = hardcodedService;
  
  console.log('✅ Servicio hardcodeado inyectado');
  return hardcodedService;
}

// Función para crear botón de prueba final
function createFinalPaymentButton() {
  console.log('💳 Creando botón de prueba final...');
  
  const paymentButton = document.createElement('button');
  paymentButton.textContent = '🎯 Probar Pago Final (URLs Corregidas)';
  paymentButton.style.cssText = `
    position: fixed;
    top: 460px;
    right: 20px;
    z-index: 10000;
    background: #dc2626;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
  `;
  
  paymentButton.onclick = async () => {
    console.log('🚀 Iniciando prueba final de pago...');
    
    const service = window.hardcodedService;
    const form = document.querySelector('form');
    const guests = form ? parseInt(form.querySelector('[name="guests"]')?.value || '1') : 1;
    const total = service.price * guests;
    const validReservationId = generateUUID();
    
    console.log('💰 Datos de prueba final:', {
      servicePrice: service.price,
      guests,
      total,
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
      
      console.log('📥 Respuesta de pago final:', paymentResponse.status);
      
      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        console.log('✅ Datos de pago final recibidos:', paymentData);
        
        if (!paymentData.redsysUrl || !paymentData.formData) {
          throw new Error('Respuesta de pago incompleta');
        }
        
        // Verificar que las URLs no tengan caracteres escapados
        const merchantParamsBase64 = paymentData.formData.Ds_MerchantParameters;
        if (merchantParamsBase64) {
          try {
            const decodedParams = atob(merchantParamsBase64);
            console.log('📄 Parámetros decodificados final:', decodedParams);
            
            if (decodedParams.includes('\\/')) {
              console.error('❌ ERROR: URLs aún tienen caracteres escapados');
              alert('❌ ERROR: Las URLs aún tienen caracteres escapados. La corrección no se aplicó.');
              return;
            } else {
              console.log('✅ URLs corregidas correctamente sin caracteres escapados');
            }
          } catch (e) {
            console.log('📄 No se pudieron decodificar los parámetros para verificación');
          }
        }
        
        // Verificar la firma
        const signature = paymentData.formData.Ds_Signature;
        console.log('🔐 Firma generada:', signature);
        
        // Crear formulario y enviar a Redsys
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
        console.log('🚀 Enviando formulario a Redsys (URLs corregidas)...');
        console.log('📍 URL destino:', paymentData.redsysUrl);
        
        // Mostrar confirmación antes de enviar
        const confirmed = confirm(`¿Proceder con el pago?\n\nImporte: ${total}€\nServicio: ${service.title}\n\nLas URLs han sido corregidas y la firma debería ser válida.`);
        
        if (confirmed) {
          form.submit();
        } else {
          console.log('❌ Pago cancelado por el usuario');
        }
        
      } else {
        const errorData = await paymentResponse.json();
        console.error('❌ Error en pago final:', errorData);
        
        if (errorData.details && Array.isArray(errorData.details)) {
          console.error('📋 Detalles del error final:', errorData.details);
          alert(`Error en pago final:\n${errorData.error}\n\nDetalles:\n${errorData.details.join('\n')}`);
        } else {
          alert(`Error en pago final: ${errorData.error || 'Error desconocido'}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Error en prueba final de pago:', error);
      alert(`Error en prueba final de pago: ${error.message}`);
    }
  };
  
  document.body.appendChild(paymentButton);
  console.log('✅ Botón de prueba final creado');
}

// Función para crear botón de verificación de corrección
function createVerificationButton() {
  console.log('🔍 Creando botón de verificación...');
  
  const verifyButton = document.createElement('button');
  verifyButton.textContent = '🔍 Verificar Corrección';
  verifyButton.style.cssText = `
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
  
  verifyButton.onclick = async () => {
    console.log('🔍 Verificando corrección de URLs...');
    
    const service = window.hardcodedService;
    const total = service.price;
    const validReservationId = generateUUID();
    
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
      
      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        const merchantParamsBase64 = paymentData.formData.Ds_MerchantParameters;
        
        try {
          const decodedParams = atob(merchantParamsBase64);
          console.log('📄 Parámetros para verificación:', decodedParams);
          
          if (decodedParams.includes('\\/')) {
            alert('❌ ERROR: Las URLs aún tienen caracteres escapados. La corrección no funciona.');
            console.error('❌ URLs con caracteres escapados detectadas');
          } else {
            alert('✅ CORRECTO: Las URLs no tienen caracteres escapados. La corrección funciona.');
            console.log('✅ URLs corregidas correctamente');
          }
        } catch (e) {
          alert('⚠️ No se pudieron verificar los parámetros');
        }
      } else {
        alert('❌ Error al obtener datos de pago para verificación');
      }
      
    } catch (error) {
      console.error('❌ Error en verificación:', error);
      alert(`Error en verificación: ${error.message}`);
    }
  };
  
  document.body.appendChild(verifyButton);
  console.log('✅ Botón de verificación creado');
}

// Ejecutar funciones
injectHardcodedService();
createFinalPaymentButton();
createVerificationButton();

console.log('🎉 Script de prueba final completado');
console.log('💡 Usa el botón rojo para probar el pago final o el morado para verificar la corrección'); 