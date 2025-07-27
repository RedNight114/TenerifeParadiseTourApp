// Script final para probar la solución completa
console.log('🎯 PRUEBA FINAL - SOLUCIÓN COMPLETA');
console.log('====================================');

// Función para obtener token de localStorage
function getTokenFromStorage() {
  const keys = Object.keys(localStorage);
  const supabaseKey = keys.find(key => key.includes('supabase') && key.includes('auth-token'));
  
  if (supabaseKey) {
    try {
      const value = localStorage.getItem(supabaseKey);
      const parsed = JSON.parse(value);
      if (parsed.access_token) {
        return parsed.access_token;
      }
    } catch (e) {
      console.log('❌ Error al parsear token:', e.message);
    }
  }
  
  return null;
}

// Función para crear botón de prueba final
function createFinalTestButton() {
  console.log('🎯 Creando botón de prueba final...');
  
  const testButton = document.createElement('button');
  testButton.textContent = '🎯 Prueba Final';
  testButton.style.cssText = `
    position: fixed;
    top: 740px;
    right: 20px;
    z-index: 10000;
    background: #dc2626;
    color: white;
    border: none;
    padding: 15px 25px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;
  
  testButton.onclick = async () => {
    console.log('🎯 Iniciando prueba final...');
    
    try {
      // Obtener token
      const token = getTokenFromStorage();
      if (!token) {
        alert('❌ No se pudo obtener token de sesión');
        return;
      }
      
      console.log('✅ Token obtenido:', token.substring(0, 30) + '...');
      
      // Verificar sesión
      const sessionResponse = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!sessionResponse.ok) {
        alert('❌ Error al verificar sesión');
        return;
      }
      
      const sessionData = await sessionResponse.json();
      console.log('🔐 Datos de sesión:', sessionData);
      
      if (!sessionData.session?.user?.id) {
        alert('❌ No hay sesión válida');
        return;
      }
      
      console.log('✅ Sesión válida:', sessionData.session.user.id);
      
      // Crear reserva de prueba
      const reservationData = {
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
      
      const reservationResponse = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(reservationData)
      });
      
      if (!reservationResponse.ok) {
        const error = await reservationResponse.json();
        alert(`❌ Error al crear reserva: ${error.error || 'Error desconocido'}`);
        return;
      }
      
      const reservation = await reservationResponse.json();
      console.log('✅ Reserva creada:', reservation.id);
      
      // Crear pago
      console.log('💳 Creando pago...');
      
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
      
      const confirmed = confirm(`¿Proceder con el pago?\n\nImporte: 90€\nServicio: Glamping\n\nEsta es la prueba final con todas las correcciones aplicadas.`);
      
      if (confirmed) {
        console.log('🚀 Enviando formulario final...');
        form.submit();
      }
      
    } catch (error) {
      console.error('❌ Error en prueba final:', error);
      alert(`Error: ${error.message}`);
    }
  };
  
  document.body.appendChild(testButton);
  console.log('✅ Botón de prueba final creado');
}

// Función para crear botón de verificación rápida
function createQuickVerifyButton() {
  console.log('⚡ Creando botón de verificación rápida...');
  
  const verifyButton = document.createElement('button');
  verifyButton.textContent = '⚡ Verificar Sesión';
  verifyButton.style.cssText = `
    position: fixed;
    top: 800px;
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
  
  verifyButton.onclick = async () => {
    console.log('⚡ Verificando sesión...');
    
    const token = getTokenFromStorage();
    
    if (token) {
      console.log('✅ Token encontrado');
      
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.session?.user?.id) {
          alert('✅ Sesión válida y activa');
        } else {
          alert('❌ Sesión inválida');
        }
      } else {
        alert('❌ Error al verificar sesión');
      }
    } else {
      alert('❌ No se encontró token de sesión');
    }
  };
  
  document.body.appendChild(verifyButton);
  console.log('✅ Botón de verificación rápida creado');
}

// Ejecutar funciones
createFinalTestButton();
createQuickVerifyButton();

console.log('🎉 Script de prueba final completado');
console.log('💡 Usa el botón rojo para la prueba final o el verde para verificación rápida'); 