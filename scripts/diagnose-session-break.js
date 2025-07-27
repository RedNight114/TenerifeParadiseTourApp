// Script para diagnosticar dónde se rompe la sesión del usuario
console.log('🔍 DIAGNÓSTICO DE RUPTURA DE SESIÓN');
console.log('=====================================');

// Función para verificar el estado de la sesión
async function checkSessionStatus() {
  console.log('🔐 Verificando estado de sesión...');
  
  try {
    // Verificar si supabase está disponible
    if (typeof window.supabase === 'undefined') {
      console.error('❌ Supabase no está disponible en window');
      return { available: false, error: 'Supabase no disponible' };
    }
    
    const { data: { session }, error } = await window.supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Error al obtener sesión:', error);
      return { available: false, error: error.message };
    }
    
    if (!session) {
      console.warn('⚠️ No hay sesión activa');
      return { available: false, session: null };
    }
    
    console.log('✅ Sesión activa encontrada:', {
      userId: session.user?.id,
      email: session.user?.email,
      hasAccessToken: !!session.access_token,
      accessTokenLength: session.access_token?.length || 0,
      expiresAt: session.expires_at
    });
    
    return { available: true, session };
    
  } catch (error) {
    console.error('❌ Error inesperado al verificar sesión:', error);
    return { available: false, error: error.message };
  }
}

// Función para simular el proceso de reserva paso a paso
async function simulateReservationProcess() {
  console.log('🚀 Simulando proceso de reserva paso a paso...');
  
  // Paso 1: Verificar sesión inicial
  console.log('\n📋 PASO 1: Verificar sesión inicial');
  const initialSession = await checkSessionStatus();
  
  if (!initialSession.available) {
    console.error('❌ No se puede continuar sin sesión válida');
    return;
  }
  
  // Paso 2: Crear datos de reserva
  console.log('\n📋 PASO 2: Crear datos de reserva');
  const reservationData = {
    user_id: initialSession.session.user.id,
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
  
  console.log('📊 Datos de reserva:', reservationData);
  
  // Paso 3: Crear reserva
  console.log('\n📋 PASO 3: Crear reserva');
  try {
    const reservationResponse = await fetch('/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${initialSession.session.access_token}`,
      },
      body: JSON.stringify(reservationData)
    });
    
    console.log('📥 Respuesta de reserva:', reservationResponse.status);
    
    if (!reservationResponse.ok) {
      const errorData = await reservationResponse.json();
      console.error('❌ Error en reserva:', errorData);
      return;
    }
    
    const reservation = await reservationResponse.json();
    console.log('✅ Reserva creada:', reservation.id);
    
    // Verificar sesión después de crear reserva
    console.log('\n📋 PASO 3.5: Verificar sesión después de reserva');
    const sessionAfterReservation = await checkSessionStatus();
    
    // Paso 4: Crear pago
    console.log('\n📋 PASO 4: Crear pago');
    const paymentResponse = await fetch('/api/payment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${initialSession.session.access_token}`,
      },
      body: JSON.stringify({
        reservationId: reservation.id,
        amount: 90,
        description: 'Reserva: Glamping'
      })
    });
    
    console.log('📥 Respuesta de pago:', paymentResponse.status);
    
    if (!paymentResponse.ok) {
      const errorData = await paymentResponse.json();
      console.error('❌ Error en pago:', errorData);
      return;
    }
    
    const paymentData = await paymentResponse.json();
    console.log('✅ Datos de pago recibidos');
    
    // Verificar sesión después de crear pago
    console.log('\n📋 PASO 4.5: Verificar sesión después de pago');
    const sessionAfterPayment = await checkSessionStatus();
    
    // Paso 5: Crear formulario
    console.log('\n📋 PASO 5: Crear formulario');
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
    console.log('✅ Formulario creado y agregado al DOM');
    
    // Verificar sesión antes de enviar formulario
    console.log('\n📋 PASO 5.5: Verificar sesión antes de enviar');
    const sessionBeforeSubmit = await checkSessionStatus();
    
    // Paso 6: Enviar formulario (con confirmación)
    console.log('\n📋 PASO 6: Enviar formulario');
    console.log('📍 URL destino:', paymentData.redsysUrl);
    console.log('📊 Campos del formulario:', Object.keys(paymentData.formData));
    
    const confirmed = confirm(`¿Proceder con el envío del formulario?\n\nURL: ${paymentData.redsysUrl}\n\nEsto nos ayudará a identificar dónde se rompe la sesión.`);
    
    if (confirmed) {
      console.log('🚀 Enviando formulario...');
      form.submit();
    } else {
      console.log('❌ Envío cancelado por el usuario');
    }
    
  } catch (error) {
    console.error('❌ Error en simulación:', error);
  }
}

// Función para crear botón de diagnóstico
function createDiagnosticButton() {
  console.log('🔧 Creando botón de diagnóstico...');
  
  const diagnosticButton = document.createElement('button');
  diagnosticButton.textContent = '🔍 Diagnosticar Sesión';
  diagnosticButton.style.cssText = `
    position: fixed;
    top: 540px;
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
  
  diagnosticButton.onclick = async () => {
    console.log('🔍 Iniciando diagnóstico de sesión...');
    
    // Verificar sesión actual
    const currentSession = await checkSessionStatus();
    
    if (!currentSession.available) {
      alert('❌ No hay sesión activa. Por favor, inicia sesión primero.');
      return;
    }
    
    // Iniciar simulación paso a paso
    await simulateReservationProcess();
  };
  
  document.body.appendChild(diagnosticButton);
  console.log('✅ Botón de diagnóstico creado');
}

// Función para crear botón de verificación rápida
function createQuickCheckButton() {
  console.log('⚡ Creando botón de verificación rápida...');
  
  const quickButton = document.createElement('button');
  quickButton.textContent = '⚡ Verificar Sesión';
  quickButton.style.cssText = `
    position: fixed;
    top: 580px;
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
  
  quickButton.onclick = async () => {
    const sessionStatus = await checkSessionStatus();
    
    if (sessionStatus.available) {
      alert('✅ Sesión activa y válida');
    } else {
      alert(`❌ Problema con la sesión: ${sessionStatus.error || 'No hay sesión'}`);
    }
  };
  
  document.body.appendChild(quickButton);
  console.log('✅ Botón de verificación rápida creado');
}

// Función para crear panel de información
function createInfoPanel() {
  console.log('📊 Creando panel de información...');
  
  const infoPanel = document.createElement('div');
  infoPanel.id = 'session-diagnostic-panel';
  infoPanel.style.cssText = `
    position: fixed;
    top: 620px;
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
  
  infoPanel.innerHTML = `
    <h3 style="margin: 0 0 10px 0; color: #fbbf24;">🔍 Diagnóstico de Sesión</h3>
    <p style="margin: 5px 0; color: #60a5fa;">🔴 Diagnóstico Completo</p>
    <p style="margin: 5px 0; color: #fbbf24;">⚡ Verificación Rápida</p>
    <p style="color: #10b981; font-size: 10px; margin-top: 10px;">Identifica dónde se rompe la sesión</p>
  `;
  
  document.body.appendChild(infoPanel);
  console.log('✅ Panel de información creado');
}

// Ejecutar funciones
createDiagnosticButton();
createQuickCheckButton();
createInfoPanel();

console.log('🎉 Script de diagnóstico de sesión completado');
console.log('💡 Usa el botón rojo para diagnóstico completo o el naranja para verificación rápida'); 