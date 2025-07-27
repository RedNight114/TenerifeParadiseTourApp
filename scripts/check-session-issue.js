// Script simple para verificar el problema de sesión
console.log('🔍 VERIFICACIÓN DE PROBLEMA DE SESIÓN');
console.log('=====================================');

// Función para verificar si el usuario está autenticado
async function checkAuth() {
  console.log('🔐 Verificando autenticación...');
  
  try {
    // Verificar si useAuth está disponible
    if (typeof window.useAuth === 'undefined') {
      console.error('❌ useAuth no está disponible');
      return false;
    }
    
    // Verificar si hay usuario activo
    const user = window.useAuth?.user;
    if (!user) {
      console.error('❌ No hay usuario activo');
      return false;
    }
    
    console.log('✅ Usuario autenticado:', {
      id: user.id,
      email: user.email
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Error al verificar autenticación:', error);
    return false;
  }
}

// Función para verificar la sesión de Supabase
async function checkSupabaseSession() {
  console.log('🔐 Verificando sesión de Supabase...');
  
  try {
    if (typeof window.supabase === 'undefined') {
      console.error('❌ Supabase no está disponible');
      return false;
    }
    
    const { data: { session }, error } = await window.supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Error en sesión de Supabase:', error);
      return false;
    }
    
    if (!session) {
      console.error('❌ No hay sesión de Supabase');
      return false;
    }
    
    console.log('✅ Sesión de Supabase válida:', {
      userId: session.user?.id,
      hasAccessToken: !!session.access_token,
      tokenLength: session.access_token?.length || 0
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Error al verificar sesión de Supabase:', error);
    return false;
  }
}

// Función para probar la API de reservas
async function testReservationsAPI() {
  console.log('🧪 Probando API de reservas...');
  
  try {
    const { data: { session } } = await window.supabase.auth.getSession();
    
    if (!session?.access_token) {
      console.error('❌ No hay token de acceso');
      return false;
    }
    
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
    
    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📥 Respuesta de API:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API de reservas funciona:', data.id);
      return true;
    } else {
      const error = await response.json();
      console.error('❌ Error en API de reservas:', error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error al probar API de reservas:', error);
    return false;
  }
}

// Función para probar la API de pagos
async function testPaymentAPI() {
  console.log('💳 Probando API de pagos...');
  
  try {
    const { data: { session } } = await window.supabase.auth.getSession();
    
    if (!session?.access_token) {
      console.error('❌ No hay token de acceso');
      return false;
    }
    
    // Primero crear una reserva de prueba
    const reservationData = {
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
    
    const reservationResponse = await fetch('/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(reservationData)
    });
    
    if (!reservationResponse.ok) {
      console.error('❌ No se pudo crear reserva de prueba');
      return false;
    }
    
    const reservation = await reservationResponse.json();
    
    // Ahora probar la API de pagos
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
    
    console.log('📥 Respuesta de API de pagos:', paymentResponse.status);
    
    if (paymentResponse.ok) {
      const paymentData = await paymentResponse.json();
      console.log('✅ API de pagos funciona');
      console.log('📊 Datos de pago:', {
        hasRedsysUrl: !!paymentData.redsysUrl,
        hasFormData: !!paymentData.formData,
        formDataKeys: Object.keys(paymentData.formData || {})
      });
      return true;
    } else {
      const error = await paymentResponse.json();
      console.error('❌ Error en API de pagos:', error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error al probar API de pagos:', error);
    return false;
  }
}

// Función para crear botón de verificación completa
function createCompleteCheckButton() {
  console.log('🔧 Creando botón de verificación completa...');
  
  const checkButton = document.createElement('button');
  checkButton.textContent = '🔍 Verificación Completa';
  checkButton.style.cssText = `
    position: fixed;
    top: 660px;
    right: 20px;
    z-index: 10000;
    background: #059669;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
  `;
  
  checkButton.onclick = async () => {
    console.log('🔍 Iniciando verificación completa...');
    
    const results = {
      auth: await checkAuth(),
      supabase: await checkSupabaseSession(),
      reservations: await testReservationsAPI(),
      payment: await testPaymentAPI()
    };
    
    console.log('📊 Resultados de verificación:', results);
    
    const allPassed = Object.values(results).every(result => result === true);
    
    if (allPassed) {
      alert('✅ Todas las verificaciones pasaron. El problema puede estar en el envío del formulario.');
    } else {
      const failedTests = Object.entries(results)
        .filter(([test, result]) => !result)
        .map(([test]) => test)
        .join(', ');
      
      alert(`❌ Fallaron las siguientes verificaciones: ${failedTests}`);
    }
  };
  
  document.body.appendChild(checkButton);
  console.log('✅ Botón de verificación completa creado');
}

// Función para crear botón de prueba de formulario
function createFormTestButton() {
  console.log('📝 Creando botón de prueba de formulario...');
  
  const formButton = document.createElement('button');
  formButton.textContent = '📝 Probar Formulario';
  formButton.style.cssText = `
    position: fixed;
    top: 700px;
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
  
  formButton.onclick = async () => {
    console.log('📝 Probando envío de formulario...');
    
    try {
      // Obtener datos de pago
      const { data: { session } } = await window.supabase.auth.getSession();
      
      if (!session?.access_token) {
        alert('❌ No hay sesión activa');
        return;
      }
      
      // Crear reserva de prueba
      const reservationData = {
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
      
      const reservationResponse = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(reservationData)
      });
      
      if (!reservationResponse.ok) {
        alert('❌ Error al crear reserva de prueba');
        return;
      }
      
      const reservation = await reservationResponse.json();
      
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
        alert('❌ Error al crear pago');
        return;
      }
      
      const paymentData = await paymentResponse.json();
      
      // Crear formulario
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
      
      console.log('📝 Formulario creado, verificando antes del envío...');
      
      // Verificar sesión antes del envío
      const sessionBeforeSubmit = await window.supabase.auth.getSession();
      console.log('🔐 Sesión antes del envío:', {
        hasSession: !!sessionBeforeSubmit.data.session,
        hasToken: !!sessionBeforeSubmit.data.session?.access_token
      });
      
      const confirmed = confirm(`¿Enviar formulario a Redsys?\n\nURL: ${paymentData.redsysUrl}\n\nEsto nos ayudará a identificar si el problema está en el envío.`);
      
      if (confirmed) {
        console.log('🚀 Enviando formulario...');
        form.submit();
      }
      
    } catch (error) {
      console.error('❌ Error en prueba de formulario:', error);
      alert(`Error: ${error.message}`);
    }
  };
  
  document.body.appendChild(formButton);
  console.log('✅ Botón de prueba de formulario creado');
}

// Ejecutar funciones
createCompleteCheckButton();
createFormTestButton();

console.log('🎉 Script de verificación de sesión completado');
console.log('💡 Usa el botón verde para verificación completa o el morado para probar el formulario'); 