// Script para diagnosticar datos del servicio y cálculo de importe
console.log('🔍 DIAGNÓSTICO DE DATOS DEL SERVICIO');
console.log('=====================================');

// Función para obtener datos del servicio actual
function debugServiceData() {
  // Obtener el serviceId de la URL
  const pathParts = window.location.pathname.split('/');
  const serviceId = pathParts[pathParts.length - 1];
  
  console.log('📍 ServiceId de la URL:', serviceId);
  
  // Buscar el servicio en el estado global (si está disponible)
  if (window.__NEXT_DATA__) {
    console.log('📊 Datos de Next.js disponibles');
  }
  
  // Intentar obtener datos del localStorage o sessionStorage
  const storedServices = localStorage.getItem('services') || sessionStorage.getItem('services');
  if (storedServices) {
    try {
      const services = JSON.parse(storedServices);
      const currentService = services.find(s => s.id === serviceId);
      if (currentService) {
        console.log('✅ Servicio encontrado en storage:', {
          id: currentService.id,
          title: currentService.title,
          price: currentService.price,
          priceType: typeof currentService.price,
          max_group_size: currentService.max_group_size
        });
      } else {
        console.log('❌ Servicio no encontrado en storage');
      }
    } catch (error) {
      console.error('❌ Error parseando servicios del storage:', error);
    }
  } else {
    console.log('❌ No hay servicios en storage');
  }
  
  // Verificar si hay datos en el DOM
  const serviceElements = document.querySelectorAll('[data-service-id]');
  console.log('🔍 Elementos con data-service-id encontrados:', serviceElements.length);
  
  // Buscar información del servicio en el DOM
  const serviceTitle = document.querySelector('h1, h2, h3')?.textContent;
  const priceElements = document.querySelectorAll('[class*="price"], [class*="Price"]');
  
  console.log('📋 Información encontrada en DOM:', {
    serviceTitle: serviceTitle,
    priceElements: priceElements.length
  });
  
  // Mostrar todos los elementos que podrían contener precio
  priceElements.forEach((el, index) => {
    console.log(`💰 Elemento de precio ${index + 1}:`, {
      text: el.textContent?.trim(),
      className: el.className,
      tagName: el.tagName
    });
  });
}

// Función para simular el cálculo de total
function simulateTotalCalculation() {
  console.log('\n💰 SIMULACIÓN DE CÁLCULO DE TOTAL');
  console.log('==================================');
  
  // Obtener datos del formulario
  const form = document.querySelector('form');
  if (form) {
    const formData = new FormData(form);
    const guests = formData.get('guests') || document.querySelector('[name="guests"]')?.value || 1;
    
    console.log('👥 Huéspedes del formulario:', guests);
    
    // Buscar precio en el DOM
    const priceText = document.querySelector('[class*="price"], [class*="Price"]')?.textContent;
    if (priceText) {
      const priceMatch = priceText.match(/(\d+(?:,\d+)?)/);
      if (priceMatch) {
        const price = parseFloat(priceMatch[1].replace(',', '.'));
        const total = price * parseInt(guests);
        
        console.log('💰 Cálculo simulado:', {
          priceText: priceText,
          extractedPrice: price,
          guests: guests,
          calculatedTotal: total
        });
      }
    }
  }
}

// Función para verificar la respuesta de la API
function checkAPIResponse() {
  console.log('\n🌐 VERIFICACIÓN DE RESPUESTA DE API');
  console.log('====================================');
  
  // Interceptar llamadas a la API de pago
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const [url, options] = args;
    
    if (url.includes('/api/payment/create')) {
      console.log('🔍 Interceptando llamada a API de pago:', url);
      
      return originalFetch.apply(this, args).then(response => {
        if (response.ok) {
          response.clone().json().then(data => {
            console.log('📥 Respuesta de API de pago:', data);
            
            // Verificar el importe en la respuesta
            if (data.amount) {
              console.log('✅ Importe en respuesta:', data.amount);
            } else {
              console.log('❌ No hay importe en la respuesta');
            }
          });
        }
        return response;
      });
    }
    
    return originalFetch.apply(this, args);
  };
  
  console.log('✅ Interceptor de fetch configurado');
}

// Ejecutar diagnóstico
debugServiceData();
simulateTotalCalculation();
checkAPIResponse();

// Crear botón para ejecutar diagnóstico manual
const debugButton = document.createElement('button');
debugButton.textContent = '🔍 Diagnosticar Datos';
debugButton.style.cssText = `
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 10000;
  background: #dc2626;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
`;
debugButton.onclick = () => {
  console.clear();
  debugServiceData();
  simulateTotalCalculation();
};
document.body.appendChild(debugButton);

console.log('🔧 Botón de diagnóstico creado en la esquina superior derecha'); 