// Script corregido V4 - Obtener token correctamente desde localStorage
console.log('🔧 SOLUCIÓN DIRECTA V4 - TOKEN ENCONTRADO');
console.log('==========================================');

// Función para obtener el token de sesión del frontend
async function getSessionToken() {
  console.log('🔐 Obteniendo token de sesión del frontend...');
  
  try {
    // Buscar en localStorage con la clave correcta
    const localStorageKeys = Object.keys(localStorage);
    const supabaseKeys = localStorageKeys.filter(key => 
      key.includes('supabase') || 
      key.includes('auth') || 
      key.includes('session') ||
      key.includes('token')
    );
    
    console.log('🔍 Claves de Supabase encontradas:', supabaseKeys);
    
    for (const key of supabaseKeys) {
      try {
        const value = localStorage.getItem(key);
        console.log(`📄 Explorando clave: ${key}`);
        
        if (value && value.includes('access_token')) {
          const parsed = JSON.parse(value);
          if (parsed.access_token) {
            console.log('✅ TOKEN ENCONTRADO en localStorage:', key);
            console.log('🔑 Token:', parsed.access_token.substring(0, 50) + '...');
            return parsed.access_token;
          }
        }
      } catch (e) {
        console.log(`❌ Error al procesar clave ${key}:`, e.message);
      }
    }
    
    // Buscar en cookies como respaldo
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      if (cookie.includes('supabase') && cookie.includes('auth-token')) {
        console.log('🍪 Cookie de Supabase encontrada');
        try {
          const cookieValue = decodeURIComponent(cookie.split('=')[1]);
          const parsed = JSON.parse(cookieValue);
          if (parsed.access_token) {
            console.log('✅ TOKEN ENCONTRADO en cookies');
            return parsed.access_token;
          }
        } catch (e) {
          console.log('❌ Error al procesar cookie:', e.message);
        }
      }
    }
    
    console.log('❌ No se pudo obtener token del frontend');
    return null;
    
  } catch (error) {
    console.error('❌ Error al obtener token:', error);
    return null;
  }
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
  
  // Obtener token de sesión
  const token = await getSessionToken();
  console.log('🔐 Token obtenido:', !!token);
  
  // Verificar sesión usando fetch con token
  if (token) {
    try {
      console.log('🔐 Verificando sesión con token...');
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        const sessionData = await response.json();
        console.log('✅ Sesión verificada con token:', {
          hasSession: !!sessionData.session,
          hasUser: !!sessionData.session?.user,
          userId: sessionData.session?.user?.id,
          method: sessionData.method
        });
      } else {
        console.log('⚠️ Error al verificar sesión con token');
      }
    } catch (error) {
      console.log('⚠️ Error al verificar sesión con token:', error.message);
    }
  }
  
  return { isBookingPage, hasForm: !!form, hasSubmitButton: !!submitButton, hasToken: !!token };
}

// Función para crear botón de solución directa
function createDirectSolutionButton() {
  console.log('🔧 Creando botón de solución directa V4...');
  
  const solutionButton = document.createElement('button');
  solutionButton.textContent = '🔧 Solución Directa V4';
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
    console.log('🔧 Aplicando solución directa V4...');
    
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
      
      if (!state.hasToken) {
        alert('❌ No se pudo obtener el token de sesión. Por favor, inicia sesión.');
        return;
      }
      
      // Obtener token de sesión
      const token = await getSessionToken();
      
      if (!token) {
        alert('❌ No hay token de sesión. Por favor, inicia sesión.');
        return;
      }
      
      console.log('✅ Token obtenido, procediendo...');
      
      // Obtener sesión usando fetch con token
      console.log('🔐 Obteniendo sesión con token...');
      const sessionResponse = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!sessionResponse.ok) {
        alert('❌ No se pudo obtener la sesión. Por favor, inicia sesión.');
        return;
      }
      
      const sessionData = await sessionResponse.json();
      
      if (!sessionData.session?.user?.id) {
        alert('❌ No hay sesión válida. Por favor, inicia sesión.');
        return;
      }
      
      console.log('✅ Sesión válida obtenida:', sessionData.session.user.id);
      
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
          'Authorization': `Bearer ${token}`,
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
          'Authorization': `Bearer ${token}`,
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
          'Authorization': `Bearer ${token}`,
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
          'Authorization': `Bearer ${token}`,
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
          'Authorization': `Bearer ${token}`,
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
      console.error('❌ Error en solución directa V4:', error);
      alert(`Error: ${error.message}`);
    }
  };
  
  document.body.appendChild(solutionButton);
  console.log('✅ Botón de solución directa V4 creado');
}

// Función para crear botón de prueba simple
function createSimpleTestButton() {
  console.log('🧪 Creando botón de prueba simple V4...');
  
  const testButton = document.createElement('button');
  testButton.textContent = '🧪 Prueba Simple V4';
  testButton.style.cssText = `
    position: fixed;
    top: 780px;
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
    console.log('🧪 Ejecutando prueba simple V4...');
    
    const token = await getSessionToken();
    
    if (token) {
      console.log('✅ Token encontrado:', token.substring(0, 50) + '...');
      
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        const sessionData = await response.json();
        console.log('🔐 Datos de sesión:', sessionData);
        
        if (sessionData.session?.user?.id) {
          alert('✅ Sesión válida encontrada con token');
        } else {
          alert('❌ No hay sesión activa con token');
        }
      } else {
        alert('❌ Error al verificar sesión con token');
      }
    } else {
      alert('❌ No se pudo obtener token de sesión');
    }
  };
  
  document.body.appendChild(testButton);
  console.log('✅ Botón de prueba simple V4 creado');
}

// Función para crear botón de verificación de token
function createTokenVerificationButton() {
  console.log('🔍 Creando botón de verificación de token...');
  
  const verifyButton = document.createElement('button');
  verifyButton.textContent = '🔍 Verificar Token';
  verifyButton.style.cssText = `
    position: fixed;
    top: 820px;
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
  
  verifyButton.onclick = async () => {
    console.log('🔍 Verificando token...');
    
    const token = await getSessionToken();
    
    if (token) {
      console.log('✅ Token encontrado y válido');
      alert(`✅ Token encontrado: ${token.substring(0, 30)}...`);
    } else {
      console.log('❌ No se pudo obtener token');
      alert('❌ No se pudo obtener token de sesión');
    }
  };
  
  document.body.appendChild(verifyButton);
  console.log('✅ Botón de verificación de token creado');
}

// Ejecutar funciones
createDirectSolutionButton();
createSimpleTestButton();
createTokenVerificationButton();

console.log('🎉 Script de solución directa V4 completado');
console.log('💡 Usa el botón verde para probar el token, el naranja para verificar, o el rojo para la solución directa'); 