// Script para debuggear el problema de caracteres escapados
console.log('🔍 DEBUG: Problema de caracteres escapados');
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
  serviceInfoContainer.id = 'debug-url-escape';
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
    <h3 style="margin: 0 0 10px 0; color: #60a5fa;">🔍 Debug URLs</h3>
    <p><strong>ID:</strong> ${hardcodedService.id}</p>
    <p><strong>Título:</strong> ${hardcodedService.title}</p>
    <p><strong>Precio:</strong> ${hardcodedService.price}€</p>
    <p style="color: #f59e0b; font-size: 10px;">🔧 Verificando caracteres escapados</p>
  `;
  
  document.body.appendChild(serviceInfoContainer);
  window.hardcodedService = hardcodedService;
  
  console.log('✅ Servicio hardcodeado inyectado');
  return hardcodedService;
}

// Función para crear botón de debug
function createDebugButton() {
  console.log('🔍 Creando botón de debug...');
  
  const debugButton = document.createElement('button');
  debugButton.textContent = '🔍 Debug URLs Escapadas';
  debugButton.style.cssText = `
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
  
  debugButton.onclick = async () => {
    console.log('🔍 Iniciando debug de URLs escapadas...');
    
    const service = window.hardcodedService;
    const total = service.price;
    const validReservationId = generateUUID();
    
    console.log('💰 Datos de debug:', {
      servicePrice: service.price,
      total: total,
      reservationId: validReservationId
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
      
      console.log('📥 Respuesta de debug:', paymentResponse.status);
      
      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        console.log('✅ Datos de pago recibidos:', paymentData);
        
        if (!paymentData.formData) {
          throw new Error('Respuesta de pago incompleta');
        }
        
        // Verificar los parámetros de Redsys
        const merchantParamsBase64 = paymentData.formData.Ds_MerchantParameters;
        if (merchantParamsBase64) {
          try {
            const decodedParams = atob(merchantParamsBase64);
            console.log('📄 Parámetros decodificados:', decodedParams);
            
            // Verificar si hay caracteres escapados
            if (decodedParams.includes('\\/')) {
              console.error('❌ PROBLEMA: URLs con caracteres escapados detectadas');
              console.error('🔍 Caracteres escapados encontrados:', decodedParams.match(/\\\//g)?.length || 0);
              
              // Mostrar las URLs problemáticas
              const urlMatches = decodedParams.match(/"([^"]*https?:\\\/\\\/[^"]*)"/g);
              if (urlMatches) {
                console.error('🔍 URLs problemáticas:');
                urlMatches.forEach((match, index) => {
                  console.error(`  ${index + 1}. ${match}`);
                });
              }
              
              alert('❌ PROBLEMA: Las URLs tienen caracteres escapados (\\/). Esto causa el error de firma.');
            } else {
              console.log('✅ URLs sin caracteres escapados');
              alert('✅ CORRECTO: Las URLs no tienen caracteres escapados.');
            }
            
            // Verificar la firma
            const signature = paymentData.formData.Ds_Signature;
            console.log('🔐 Firma generada:', signature);
            
            // Mostrar información adicional
            console.log('📊 Información adicional:');
            console.log('  - Base64 length:', merchantParamsBase64.length);
            console.log('  - Signature length:', signature.length);
            console.log('  - Order number:', paymentData.orderNumber);
            
          } catch (e) {
            console.error('❌ Error decodificando parámetros:', e);
            alert('❌ Error decodificando parámetros para verificación');
          }
        } else {
          console.error('❌ No se encontraron parámetros de Redsys');
          alert('❌ No se encontraron parámetros de Redsys en la respuesta');
        }
        
      } else {
        const errorData = await paymentResponse.json();
        console.error('❌ Error en debug:', errorData);
        alert(`Error en debug: ${errorData.error || 'Error desconocido'}`);
      }
      
    } catch (error) {
      console.error('❌ Error en debug:', error);
      alert(`Error en debug: ${error.message}`);
    }
  };
  
  document.body.appendChild(debugButton);
  console.log('✅ Botón de debug creado');
}

// Función para crear botón de prueba de JSON.stringify
function createJsonTestButton() {
  console.log('📄 Creando botón de prueba JSON...');
  
  const jsonButton = document.createElement('button');
  jsonButton.textContent = '📄 Probar JSON.stringify';
  jsonButton.style.cssText = `
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
  
  jsonButton.onclick = () => {
    console.log('📄 Probando JSON.stringify...');
    
    // Simular los parámetros de Redsys
    const testParams = {
      DS_MERCHANT_AMOUNT: '000000009000',
      DS_MERCHANT_ORDER: '175328242370',
      DS_MERCHANT_MERCHANTCODE: '367529286',
      DS_MERCHANT_CURRENCY: '978',
      DS_MERCHANT_TRANSACTIONTYPE: '1',
      DS_MERCHANT_TERMINAL: '001',
      DS_MERCHANT_MERCHANTURL: 'https://tenerifeparadisetoursexcursions.com/api/payment/webhook',
      DS_MERCHANT_URLOK: 'https://tenerifeparadisetoursexcursions.com/payment/success?reservationId=test',
      DS_MERCHANT_URLKO: 'https://tenerifeparadisetoursexcursions.com/payment/error?reservationId=test',
      DS_MERCHANT_PRODUCTDESCRIPTION: 'Reserva: Glamping',
      DS_MERCHANT_MERCHANTNAME: 'Tenerife Paradise Tours',
      DS_MERCHANT_CONSUMERLANGUAGE: '001',
      DS_MERCHANT_MERCHANTDATA: 'test-reservation-id'
    };
    
    console.log('📊 Parámetros de prueba:', testParams);
    
    // Probar JSON.stringify
    const jsonString = JSON.stringify(testParams);
    console.log('📄 JSON.stringify resultado:', jsonString);
    
    // Verificar caracteres escapados
    if (jsonString.includes('\\/')) {
      console.error('❌ JSON.stringify genera caracteres escapados');
      console.error('🔍 Caracteres escapados encontrados:', jsonString.match(/\\\//g)?.length || 0);
      
      // Mostrar las URLs problemáticas
      const urlMatches = jsonString.match(/"([^"]*https?:\\\/\\\/[^"]*)"/g);
      if (urlMatches) {
        console.error('🔍 URLs problemáticas en JSON:');
        urlMatches.forEach((match, index) => {
          console.error(`  ${index + 1}. ${match}`);
        });
      }
      
      // Probar corrección
      const correctedJson = jsonString.replace(/\\\//g, '/');
      console.log('🔧 JSON corregido:', correctedJson);
      
      alert('❌ JSON.stringify genera caracteres escapados automáticamente. Necesitamos corregir esto.');
    } else {
      console.log('✅ JSON.stringify no genera caracteres escapados');
      alert('✅ JSON.stringify no genera caracteres escapados en el frontend.');
    }
  };
  
  document.body.appendChild(jsonButton);
  console.log('✅ Botón de prueba JSON creado');
}

// Ejecutar funciones
injectHardcodedService();
createDebugButton();
createJsonTestButton();

console.log('🎉 Script de debug completado');
console.log('💡 Usa el botón rojo para debuggear las URLs o el morado para probar JSON.stringify'); 