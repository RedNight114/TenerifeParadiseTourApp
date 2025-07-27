// Script directo para identificar y solucionar el problema de sesión
console.log('🔧 SOLUCIÓN DIRECTA - PROBLEMA DE SESIÓN');
console.log('=========================================');

// Función para verificar el estado actual
async function checkCurrentState() {
  console.log('🔍 Verificando estado actual...');
  
  // Verificar si estamos en la página de booking
  const isBookingPage = window.location.pathname.includes('/booking/');
  console.log('📍 Página actual:', window.location.pathname, isBookingPage ? '(✅ Página de booking)' : '(❌ No es página de booking)');
  
  // Verificar si hay formulario
  const form = document.querySelector('form');
  console.log('📝 Formulario encontrado:', !!form);
  
  // Verificar si hay botón de envío
  const submitButton = document.querySelector('button[type="submit"]');
  console.log('🔘 Botón de envío encontrado:', !!submitButton);
  
  // Verificar sesión de Supabase
  try {
    const { data: { session } } = await window.supabase.auth.getSession();
    console.log('🔐 Sesión de Supabase:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasToken: !!session?.access_token,
      userId: session?.user?.id
    });
  } catch (error) {
    console.error('❌ Error al verificar sesión:', error);
  }
  
  return { isBookingPage, hasForm: !!form, hasSubmitButton: !!submitButton };
}

// Función para interceptar el envío del formulario
function interceptFormSubmission() {
  console.log('🔄 Interceptando envío del formulario...');
  
  const form = document.querySelector('form');
  if (!form) {
    console.error('❌ No se encontró el formulario');
    return;
  }
  
  // Guardar el submit original
  const originalSubmit = form.submit;
  
  // Interceptar el submit
  form.submit = function() {
    console.log('🚨 FORMULARIO INTERCEPTADO - Verificando sesión...');
    
    // Verificar sesión antes del envío
    window.supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 Estado de sesión en submit:', {
        hasSession: !!session,
        hasToken: !!session?.access_token,
        userId: session?.user?.id
      });
      
      if (!session?.access_token) {
        console.error('❌ PROBLEMA IDENTIFICADO: No hay token de acceso en el submit');
        alert('❌ PROBLEMA IDENTIFICADO: La sesión se perdió antes del envío del formulario');
        return;
      }
      
      console.log('✅ Sesión válida, procediendo con envío original...');
      originalSubmit.call(form);
    }).catch(error => {
      console.error('❌ Error al verificar sesión en submit:', error);
      alert('❌ Error al verificar sesión: ' + error.message);
    });
  };
  
  console.log('✅ Interceptación del formulario configurada');
}

// Función para crear botón de solución directa
function createDirectSolutionButton() {
  console.log('🔧 Creando botón de solución directa...');
  
  const solutionButton = document.createElement('button');
  solutionButton.textContent = '🔧 Solución Directa';
  solutionButton.style.cssText = `
    position: fixed;
    top: 740px;
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
  
  solutionButton.onclick = async () => {
    console.log('🔧 Aplicando solución directa...');
    
    try {
      // Verificar estado actual
      const state = await checkCurrentState();
      
      if (!state.isBookingPage) {
        alert('❌ No estás en la página de booking');
        return;
      }
      
      if (!state.hasForm) {
        alert('❌ No se encontró el formulario');
        return;
      }
      
      // Verificar sesión
      const { data: { session } } = await window.supabase.auth.getSession();
      
      if (!session?.access_token) {
        alert('❌ No hay sesión activa. Por favor, inicia sesión.');
        return;
      }
      
      console.log('✅ Estado válido, procediendo con solución...');
      
      // Crear datos de prueba
      const testData = {
        user_id: session.user.id,
        service_id: '08ae78c2-5622-404a-81ae-1a6dbd4ebdea',
        reservation_date: '2025-07-25',
        reservation_time: '12:00',
        guests: 1,
        total_amount: 90,
        status: "pendiente",
        payment_status: "pendiente",
        special_requests: null,
        contact_name: 'Test User',
        contact_email: 'test@example.com',
        contact_phone: '123456789',
      };
      
      console.log('📤 Creando reserva...');
      
      // Crear reserva
      const reservationResponse = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(testData)
      });
      
      if (!reservationResponse.ok) {
        const error = await reservationResponse.json();
        alert(`❌ Error al crear reserva: ${error.error || 'Error desconocido'}`);
        return;
      }
      
      const reservation = await reservationResponse.json();
      console.log('✅ Reserva creada:', reservation.id);
      
      // Verificar sesión después de crear reserva
      const sessionAfterReservation = await window.supabase.auth.getSession();
      console.log('🔐 Sesión después de reserva:', {
        hasSession: !!sessionAfterReservation.data.session,
        hasToken: !!sessionAfterReservation.data.session?.access_token
      });
      
      console.log('💳 Creando pago...');
      
      // Crear pago
      const paymentResponse = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          reservationId: reservation.id,
          amount: 90,
          description: 'Reserva: Glamping'
        })
      });
      
      if (!paymentResponse.ok) {
        const error = await paymentResponse.json();
        alert(`❌ Error al crear pago: ${error.error || 'Error desconocido'}`);
        return;
      }
      
      const paymentData = await paymentResponse.json();
      console.log('✅ Pago creado');
      
      // Verificar sesión después de crear pago
      const sessionAfterPayment = await window.supabase.auth.getSession();
      console.log('🔐 Sesión después de pago:', {
        hasSession: !!sessionAfterPayment.data.session,
        hasToken: !!sessionAfterPayment.data.session?.access_token
      });
      
      // Crear formulario con verificación de sesión
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
      
      // Verificación final de sesión antes del envío
      const finalSessionCheck = await window.supabase.auth.getSession();
      
      if (!finalSessionCheck.data.session?.access_token) {
        console.error('❌ PROBLEMA CRÍTICO: Sesión perdida antes del envío final');
        alert('❌ PROBLEMA CRÍTICO: La sesión se perdió antes del envío final. Esto explica por qué no funciona.');
        return;
      }
      
      console.log('✅ Sesión válida antes del envío final');
      
      const confirmed = confirm(`¿Proceder con el envío?\n\nImporte: 90€\nServicio: Glamping\n\nLa sesión está verificada y debería funcionar.`);
      
      if (confirmed) {
        console.log('🚀 Enviando formulario con sesión verificada...');
        form.submit();
      }
      
    } catch (error) {
      console.error('❌ Error en solución directa:', error);
      alert(`Error: ${error.message}`);
    }
  };
  
  document.body.appendChild(solutionButton);
  console.log('✅ Botón de solución directa creado');
}

// Función para crear botón de diagnóstico de sesión
function createSessionDiagnosticButton() {
  console.log('🔍 Creando botón de diagnóstico de sesión...');
  
  const diagnosticButton = document.createElement('button');
  diagnosticButton.textContent = '🔍 Diagnóstico Sesión';
  diagnosticButton.style.cssText = `
    position: fixed;
    top: 780px;
    right: 20px;
    z-index: 10000;
    background: #f59e0b;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
  `;
  
  diagnosticButton.onclick = async () => {
    console.log('🔍 Ejecutando diagnóstico de sesión...');
    
    await checkCurrentState();
    interceptFormSubmission();
    
    alert('✅ Diagnóstico aplicado. Ahora intenta usar el formulario normal y veremos dónde se rompe la sesión.');
  };
  
  document.body.appendChild(diagnosticButton);
  console.log('✅ Botón de diagnóstico de sesión creado');
}

// Ejecutar funciones
createDirectSolutionButton();
createSessionDiagnosticButton();

console.log('🎉 Script de solución directa completado');
console.log('💡 Usa el botón rojo para solución directa o el naranja para diagnóstico de sesión'); 