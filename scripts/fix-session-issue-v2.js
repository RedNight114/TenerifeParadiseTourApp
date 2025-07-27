// Script corregido para identificar y solucionar el problema de sesión
console.log('🔧 SOLUCIÓN DIRECTA V2 - PROBLEMA DE SESIÓN');
console.log('============================================');

// Función para obtener Supabase desde el contexto de React
function getSupabase() {
  // Intentar diferentes formas de acceder a Supabase
  if (window.supabase) {
    return window.supabase;
  }
  
  // Buscar en el contexto de React
  const reactRoot = document.querySelector('#__next') || document.querySelector('#root');
  if (reactRoot && reactRoot._reactInternalFiber) {
    // Intentar acceder a través del contexto de React
    try {
      const fiber = reactRoot._reactInternalFiber;
      if (fiber.memoizedState && fiber.memoizedState.element) {
        // Buscar en el contexto
        return null; // Fallback
      }
    } catch (e) {
      console.log('No se pudo acceder al contexto de React');
    }
  }
  
  return null;
}

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
  
  // Verificar sesión usando fetch directo
  try {
    console.log('🔐 Verificando sesión con fetch...');
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      const sessionData = await response.json();
      console.log('✅ Sesión verificada con fetch:', {
        hasSession: !!sessionData.session,
        hasUser: !!sessionData.session?.user,
        userId: sessionData.session?.user?.id
      });
    } else {
      console.log('⚠️ No se pudo verificar sesión con fetch');
    }
  } catch (error) {
    console.log('⚠️ Error al verificar sesión con fetch:', error.message);
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
  
  // Interceptar el evento submit del formulario
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log('🚨 FORMULARIO INTERCEPTADO - Verificando sesión...');
    
    try {
      // Verificar sesión antes del envío
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const sessionData = await response.json();
        console.log('🔐 Estado de sesión en submit:', {
          hasSession: !!sessionData.session,
          hasUser: !!sessionData.session?.user,
          userId: sessionData.session?.user?.id
        });
        
        if (!sessionData.session?.access_token) {
          console.error('❌ PROBLEMA IDENTIFICADO: No hay token de acceso en el submit');
          alert('❌ PROBLEMA IDENTIFICADO: La sesión se perdió antes del envío del formulario');
          return;
        }
        
        console.log('✅ Sesión válida, procediendo con envío...');
        // Continuar con el envío original
        form.submit();
      } else {
        console.error('❌ No se pudo verificar sesión');
        alert('❌ Error al verificar sesión');
      }
    } catch (error) {
      console.error('❌ Error al verificar sesión en submit:', error);
      alert('❌ Error al verificar sesión: ' + error.message);
    }
  });
  
  console.log('✅ Interceptación del formulario configurada');
}

// Función para crear botón de solución directa
function createDirectSolutionButton() {
  console.log('🔧 Creando botón de solución directa...');
  
  const solutionButton = document.createElement('button');
  solutionButton.textContent = '🔧 Solución Directa V2';
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
    console.log('🔧 Aplicando solución directa V2...');
    
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
      
      // Obtener sesión usando fetch
      console.log('🔐 Obteniendo sesión...');
      const sessionResponse = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!sessionResponse.ok) {
        alert('❌ No se pudo obtener la sesión. Por favor, inicia sesión.');
        return;
      }
      
      const sessionData = await sessionResponse.json();
      
      if (!sessionData.session?.access_token) {
        alert('❌ No hay sesión activa. Por favor, inicia sesión.');
        return;
      }
      
      console.log('✅ Sesión válida obtenida');
      
      // Crear datos de prueba
      const testData = {
        user_id: sessionData.session.user.id,
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
          'Authorization': `Bearer ${sessionData.session.access_token}`,
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
      const sessionAfterReservation = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (sessionAfterReservation.ok) {
        const sessionAfterData = await sessionAfterReservation.json();
        console.log('🔐 Sesión después de reserva:', {
          hasSession: !!sessionAfterData.session,
          hasToken: !!sessionAfterData.session?.access_token
        });
      }
      
      console.log('💳 Creando pago...');
      
      // Crear pago
      const paymentResponse = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`,
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
      const sessionAfterPayment = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (sessionAfterPayment.ok) {
        const sessionAfterPaymentData = await sessionAfterPayment.json();
        console.log('🔐 Sesión después de pago:', {
          hasSession: !!sessionAfterPaymentData.session,
          hasToken: !!sessionAfterPaymentData.session?.access_token
        });
      }
      
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
      const finalSessionCheck = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (finalSessionCheck.ok) {
        const finalSessionData = await finalSessionCheck.json();
        
        if (!finalSessionData.session?.access_token) {
          console.error('❌ PROBLEMA CRÍTICO: Sesión perdida antes del envío final');
          alert('❌ PROBLEMA CRÍTICO: La sesión se perdió antes del envío final. Esto explica por qué no funciona.');
          return;
        }
        
        console.log('✅ Sesión válida antes del envío final');
      }
      
      const confirmed = confirm(`¿Proceder con el envío?\n\nImporte: 90€\nServicio: Glamping\n\nLa sesión está verificada y debería funcionar.`);
      
      if (confirmed) {
        console.log('🚀 Enviando formulario con sesión verificada...');
        form.submit();
      }
      
    } catch (error) {
      console.error('❌ Error en solución directa V2:', error);
      alert(`Error: ${error.message}`);
    }
  };
  
  document.body.appendChild(solutionButton);
  console.log('✅ Botón de solución directa V2 creado');
}

// Función para crear botón de diagnóstico de sesión
function createSessionDiagnosticButton() {
  console.log('🔍 Creando botón de diagnóstico de sesión...');
  
  const diagnosticButton = document.createElement('button');
  diagnosticButton.textContent = '🔍 Diagnóstico Sesión V2';
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
    console.log('🔍 Ejecutando diagnóstico de sesión V2...');
    
    await checkCurrentState();
    interceptFormSubmission();
    
    alert('✅ Diagnóstico V2 aplicado. Ahora intenta usar el formulario normal y veremos dónde se rompe la sesión.');
  };
  
  document.body.appendChild(diagnosticButton);
  console.log('✅ Botón de diagnóstico de sesión V2 creado');
}

// Función para crear botón de prueba simple
function createSimpleTestButton() {
  console.log('🧪 Creando botón de prueba simple...');
  
  const testButton = document.createElement('button');
  testButton.textContent = '🧪 Prueba Simple';
  testButton.style.cssText = `
    position: fixed;
    top: 820px;
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
  
  testButton.onclick = async () => {
    console.log('🧪 Ejecutando prueba simple...');
    
    try {
      // Verificar si hay sesión
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const sessionData = await response.json();
        console.log('🔐 Datos de sesión:', sessionData);
        
        if (sessionData.session?.access_token) {
          alert('✅ Sesión válida encontrada');
        } else {
          alert('❌ No hay sesión activa');
        }
      } else {
        alert('❌ Error al verificar sesión');
      }
    } catch (error) {
      console.error('❌ Error en prueba simple:', error);
      alert(`Error: ${error.message}`);
    }
  };
  
  document.body.appendChild(testButton);
  console.log('✅ Botón de prueba simple creado');
}

// Ejecutar funciones
createDirectSolutionButton();
createSessionDiagnosticButton();
createSimpleTestButton();

console.log('🎉 Script de solución directa V2 completado');
console.log('💡 Usa el botón rojo para solución directa, el naranja para diagnóstico, o el verde para prueba simple'); 