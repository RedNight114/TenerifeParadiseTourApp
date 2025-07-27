// Script para arreglar temporalmente la carga de servicios
console.log('🔧 ARREGLANDO CARGA DE SERVICIOS');
console.log('=================================');

// Función para inyectar datos de servicio hardcodeados
function injectHardcodedService() {
  console.log('💉 Inyectando servicio hardcodeado...');
  
  // Datos del servicio basados en los logs del servidor
  const hardcodedService = {
    id: '08ae78c2-5622-404a-81ae-1a6dbd4ebdea',
    title: 'Glamping',
    description: 'Experiencia de glamping en Tenerife',
    price: 90, // 90€ por persona según los logs
    max_group_size: 10,
    available: true,
    featured: false,
    category_id: '1',
    images: [],
    price_type: 'per_person'
  };
  
  console.log('📊 Servicio hardcodeado:', hardcodedService);
  
  // Crear elementos en el DOM para mostrar la información del servicio
  const serviceInfoContainer = document.createElement('div');
  serviceInfoContainer.id = 'hardcoded-service-info';
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
    <h3 style="margin: 0 0 10px 0; color: #60a5fa;">🛠️ Servicio Hardcodeado</h3>
    <p><strong>ID:</strong> ${hardcodedService.id}</p>
    <p><strong>Título:</strong> ${hardcodedService.title}</p>
    <p><strong>Precio:</strong> ${hardcodedService.price}€</p>
    <p><strong>Max. grupo:</strong> ${hardcodedService.max_group_size}</p>
    <p style="color: #10b981; margin-top: 10px;">✅ Datos inyectados correctamente</p>
  `;
  
  document.body.appendChild(serviceInfoContainer);
  
  // Hacer el servicio disponible globalmente
  window.hardcodedService = hardcodedService;
  
  console.log('✅ Servicio hardcodeado inyectado');
  return hardcodedService;
}

// Función para simular el hook useServices
function simulateUseServices() {
  console.log('🎣 Simulando hook useServices...');
  
  const service = injectHardcodedService();
  
  // Crear un objeto que simule el hook
  const mockUseServices = {
    services: [service],
    loading: false,
    error: null,
    fetchServices: () => {
      console.log('📡 fetchServices simulado llamado');
      return Promise.resolve([service]);
    }
  };
  
  // Hacer disponible globalmente
  window.mockUseServices = mockUseServices;
  
  console.log('✅ Hook useServices simulado');
  return mockUseServices;
}

// Función para calcular el total con el servicio hardcodeado
function calculateTotalWithHardcodedService() {
  console.log('💰 Calculando total con servicio hardcodeado...');
  
  const service = window.hardcodedService;
  if (!service) {
    console.error('❌ No hay servicio hardcodeado disponible');
    return 0;
  }
  
  const form = document.querySelector('form');
  const guests = form ? parseInt(form.querySelector('[name="guests"]')?.value || '1') : 1;
  
  const total = service.price * guests;
  
  console.log('✅ Cálculo de total:', {
    servicePrice: service.price,
    guests: guests,
    total: total,
    calculation: `${service.price} * ${guests} = ${total}`
  });
  
  return total;
}

// Función para crear botón de prueba de pago
function createPaymentTestButton() {
  console.log('💳 Creando botón de prueba de pago...');
  
  const paymentButton = document.createElement('button');
  paymentButton.textContent = '💳 Probar Pago con Datos Hardcodeados';
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
    console.log('🚀 Iniciando prueba de pago con datos hardcodeados...');
    
    const total = calculateTotalWithHardcodedService();
    if (total <= 0) {
      alert('❌ Error: No se pudo calcular el total');
      return;
    }
    
    // Simular datos de reserva
    const reservationData = {
      user_id: 'test-user-id',
      service_id: '08ae78c2-5622-404a-81ae-1a6dbd4ebdea',
      reservation_date: '2025-07-25',
      reservation_time: '11:00',
      guests: 2,
      total_amount: total,
      status: 'pendiente',
      payment_status: 'pendiente',
      special_requests: null,
      contact_name: 'Test User',
      contact_email: 'test@example.com',
      contact_phone: '123456789'
    };
    
    console.log('📤 Datos de reserva simulados:', reservationData);
    
    try {
      // Llamar directamente a la API de pago
      const paymentResponse = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationId: 'test-reservation-id',
          amount: total,
          description: `Reserva: ${window.hardcodedService.title}`
        })
      });
      
      console.log('📥 Respuesta de pago:', paymentResponse.status);
      
      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        console.log('✅ Datos de pago recibidos:', paymentData);
        
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
        });
        
        document.body.appendChild(form);
        console.log('🚀 Enviando formulario a Redsys...');
        form.submit();
        
      } else {
        const errorData = await paymentResponse.json();
        console.error('❌ Error en pago:', errorData);
        alert(`Error en pago: ${errorData.error || 'Error desconocido'}`);
      }
      
    } catch (error) {
      console.error('❌ Error en prueba de pago:', error);
      alert(`Error en prueba de pago: ${error.message}`);
    }
  };
  
  document.body.appendChild(paymentButton);
  console.log('✅ Botón de prueba de pago creado');
}

// Ejecutar todas las funciones
const service = simulateUseServices();
calculateTotalWithHardcodedService();
createPaymentTestButton();

console.log('🎉 Script de arreglo completado');
console.log('💡 Ahora puedes usar el botón verde para probar el pago'); 