// Script para diagnosticar la carga de servicios
console.log('🔍 DIAGNÓSTICO DE CARGA DE SERVICIOS');
console.log('=====================================');

// Función para verificar el estado de Supabase
function checkSupabaseConnection() {
  console.log('🌐 Verificando conexión con Supabase...');
  
  // Verificar si Supabase está disponible
  if (typeof window !== 'undefined' && window.supabase) {
    console.log('✅ Supabase disponible en window');
  } else {
    console.log('❌ Supabase no disponible en window');
  }
  
  // Verificar variables de entorno
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('🔧 Variables de entorno:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    urlLength: supabaseUrl?.length || 0,
    keyLength: supabaseKey?.length || 0
  });
}

// Función para verificar el estado de React
function checkReactState() {
  console.log('⚛️ Verificando estado de React...');
  
  // Buscar elementos que indiquen el estado de carga
  const loadingElements = document.querySelectorAll('[class*="loading"], [class*="Loading"]');
  const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"]');
  
  console.log('📊 Elementos de estado:', {
    loadingElements: loadingElements.length,
    errorElements: errorElements.length
  });
  
  // Verificar si hay mensajes de error visibles
  errorElements.forEach((el, i) => {
    console.log(`❌ Error ${i + 1}:`, el.textContent?.trim());
  });
}

// Función para verificar el hook useServices
function checkUseServicesHook() {
  console.log('🎣 Verificando hook useServices...');
  
  // Buscar elementos que usen el hook
  const serviceElements = document.querySelectorAll('[data-service], [data-service-id]');
  console.log('🔍 Elementos de servicio encontrados:', serviceElements.length);
  
  // Verificar si hay algún estado de carga visible
  const skeletonElements = document.querySelectorAll('[class*="skeleton"], [class*="Skeleton"]');
  console.log('💀 Elementos skeleton:', skeletonElements.length);
  
  // Verificar si hay contenido de placeholder
  const placeholderElements = document.querySelectorAll('[class*="placeholder"], [class*="Placeholder"]');
  console.log('📝 Elementos placeholder:', placeholderElements.length);
}

// Función para verificar la URL y parámetros
function checkURLAndParams() {
  console.log('🌍 Verificando URL y parámetros...');
  
  const currentUrl = window.location.href;
  const pathParts = currentUrl.split('/');
  const serviceId = pathParts[pathParts.length - 1];
  
  console.log('📍 Información de URL:', {
    currentUrl: currentUrl,
    pathParts: pathParts,
    serviceId: serviceId,
    serviceIdLength: serviceId?.length || 0
  });
  
  // Verificar si el serviceId parece válido (UUID)
  if (serviceId && serviceId.length === 36) {
    console.log('✅ ServiceId parece ser un UUID válido');
  } else {
    console.log('❌ ServiceId no parece ser un UUID válido');
  }
}

// Función para verificar errores en la consola
function checkConsoleErrors() {
  console.log('🚨 Verificando errores en consola...');
  
  // Interceptar errores futuros
  const originalError = console.error;
  const originalWarn = console.warn;
  
  let errorCount = 0;
  let warnCount = 0;
  
  console.error = function(...args) {
    errorCount++;
    console.log(`🚨 Error ${errorCount}:`, ...args);
    originalError.apply(console, args);
  };
  
  console.warn = function(...args) {
    warnCount++;
    console.log(`⚠️ Warning ${warnCount}:`, ...args);
    originalWarn.apply(console, args);
  };
  
  console.log('🔧 Interceptores de errores configurados');
}

// Función para simular la carga de servicios
function simulateServiceLoad() {
  console.log('🧪 Simulando carga de servicios...');
  
  // Crear un servicio de prueba
  const testService = {
    id: 'test-service-id',
    title: 'Servicio de Prueba',
    price: 50,
    description: 'Descripción de prueba',
    max_group_size: 10
  };
  
  console.log('📊 Servicio de prueba:', testService);
  
  // Simular el cálculo de total
  const guests = 2;
  const total = testService.price * guests;
  
  console.log('💰 Cálculo simulado:', {
    servicePrice: testService.price,
    guests: guests,
    total: total,
    calculation: `${testService.price} * ${guests} = ${total}`
  });
  
  return testService;
}

// Función para verificar el DOM completo
function checkCompleteDOM() {
  console.log('🏗️ Verificando DOM completo...');
  
  // Buscar todos los elementos que podrían contener información del servicio
  const allElements = document.querySelectorAll('*');
  const serviceRelatedElements = Array.from(allElements).filter(el => {
    const text = el.textContent?.toLowerCase() || '';
    const className = el.className?.toLowerCase() || '';
    const id = el.id?.toLowerCase() || '';
    
    return text.includes('servicio') || 
           text.includes('service') || 
           text.includes('precio') || 
           text.includes('price') ||
           className.includes('service') ||
           className.includes('price') ||
           id.includes('service') ||
           id.includes('price');
  });
  
  console.log('🔍 Elementos relacionados con servicios:', serviceRelatedElements.length);
  
  serviceRelatedElements.slice(0, 10).forEach((el, i) => {
    console.log(`📋 Elemento ${i + 1}:`, {
      tagName: el.tagName,
      className: el.className,
      text: el.textContent?.trim().substring(0, 50) + '...'
    });
  });
}

// Ejecutar todas las verificaciones
checkSupabaseConnection();
checkReactState();
checkUseServicesHook();
checkURLAndParams();
checkConsoleErrors();
const testService = simulateServiceLoad();
checkCompleteDOM();

// Crear botón para recargar servicios
const reloadButton = document.createElement('button');
reloadButton.textContent = '🔄 Recargar Servicios';
reloadButton.style.cssText = `
  position: fixed;
  top: 320px;
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
reloadButton.onclick = () => {
  console.log('🔄 Recargando página...');
  window.location.reload();
};
document.body.appendChild(reloadButton);

console.log('🔧 Botón de recarga creado');
console.log('💡 Si los servicios no se cargan, usa el botón rojo para recargar'); 