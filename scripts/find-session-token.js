// Script para encontrar el token de sesión en todas las ubicaciones posibles
console.log('🔍 EXPLORADOR DE TOKENS DE SESIÓN');
console.log('==================================');

// Función para explorar localStorage
function exploreLocalStorage() {
  console.log('🔍 Explorando localStorage...');
  
  const keys = Object.keys(localStorage);
  console.log('📋 Claves en localStorage:', keys);
  
  const supabaseKeys = keys.filter(key => 
    key.includes('supabase') || 
    key.includes('auth') || 
    key.includes('session') ||
    key.includes('token')
  );
  
  console.log('🔐 Claves relacionadas con Supabase:', supabaseKeys);
  
  supabaseKeys.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      console.log(`📄 ${key}:`, value ? value.substring(0, 100) + '...' : 'null');
      
      if (value && value.includes('access_token')) {
        try {
          const parsed = JSON.parse(value);
          if (parsed.access_token) {
            console.log('✅ TOKEN ENCONTRADO en localStorage:', key);
            return parsed.access_token;
          }
        } catch (e) {
          console.log('❌ Error al parsear:', key);
        }
      }
    } catch (e) {
      console.log('❌ Error al leer:', key);
    }
  });
  
  return null;
}

// Función para explorar sessionStorage
function exploreSessionStorage() {
  console.log('🔍 Explorando sessionStorage...');
  
  const keys = Object.keys(sessionStorage);
  console.log('📋 Claves en sessionStorage:', keys);
  
  const supabaseKeys = keys.filter(key => 
    key.includes('supabase') || 
    key.includes('auth') || 
    key.includes('session') ||
    key.includes('token')
  );
  
  console.log('🔐 Claves relacionadas con Supabase:', supabaseKeys);
  
  supabaseKeys.forEach(key => {
    try {
      const value = sessionStorage.getItem(key);
      console.log(`📄 ${key}:`, value ? value.substring(0, 100) + '...' : 'null');
      
      if (value && value.includes('access_token')) {
        try {
          const parsed = JSON.parse(value);
          if (parsed.access_token) {
            console.log('✅ TOKEN ENCONTRADO en sessionStorage:', key);
            return parsed.access_token;
          }
        } catch (e) {
          console.log('❌ Error al parsear:', key);
        }
      }
    } catch (e) {
      console.log('❌ Error al leer:', key);
    }
  });
  
  return null;
}

// Función para explorar cookies
function exploreCookies() {
  console.log('🔍 Explorando cookies...');
  
  const cookies = document.cookie.split(';');
  console.log('🍪 Todas las cookies:', cookies);
  
  const supabaseCookies = cookies.filter(cookie => 
    cookie.includes('supabase') || 
    cookie.includes('auth') || 
    cookie.includes('session') ||
    cookie.includes('token')
  );
  
  console.log('🔐 Cookies relacionadas con Supabase:', supabaseCookies);
  
  return null;
}

// Función para explorar el contexto de React
function exploreReactContext() {
  console.log('🔍 Explorando contexto de React...');
  
  try {
    // Buscar elementos con datos de usuario
    const userElements = document.querySelectorAll('[data-user-id], [data-user], [data-session]');
    console.log('👤 Elementos con datos de usuario:', userElements.length);
    
    userElements.forEach((element, index) => {
      console.log(`👤 Elemento ${index}:`, {
        tagName: element.tagName,
        className: element.className,
        dataUserId: element.dataset.userId,
        dataUser: element.dataset.user,
        dataSession: element.dataset.session
      });
    });
    
    // Buscar en el contexto de React
    const reactRoot = document.querySelector('#__next') || document.querySelector('#root');
    if (reactRoot) {
      console.log('🌳 React root encontrado:', reactRoot);
      
      // Intentar acceder a propiedades internas
      const props = Object.getOwnPropertyNames(reactRoot);
      console.log('🔧 Propiedades del React root:', props);
    }
    
  } catch (error) {
    console.log('❌ Error al explorar contexto de React:', error.message);
  }
  
  return null;
}

// Función para explorar variables globales
function exploreGlobalVariables() {
  console.log('🔍 Explorando variables globales...');
  
  const globalVars = [
    'supabase',
    'auth',
    'session',
    'user',
    'useAuth',
    'authContext'
  ];
  
  globalVars.forEach(varName => {
    if (window[varName]) {
      console.log(`🌐 Variable global encontrada: ${varName}`, window[varName]);
    }
  });
  
  return null;
}

// Función para intentar obtener token desde el hook useAuth
async function tryGetTokenFromHook() {
  console.log('🔍 Intentando obtener token desde hook useAuth...');
  
  try {
    // Buscar si hay algún elemento que contenga información de sesión
    const authElements = document.querySelectorAll('[data-auth], [data-session], [data-user]');
    
    if (authElements.length > 0) {
      console.log('🔐 Elementos de autenticación encontrados:', authElements.length);
      
      // Intentar acceder a la información de sesión desde el DOM
      for (const element of authElements) {
        const sessionInfo = element.getAttribute('data-session') || 
                           element.getAttribute('data-auth') || 
                           element.getAttribute('data-user');
        
        if (sessionInfo) {
          try {
            const parsed = JSON.parse(sessionInfo);
            if (parsed.access_token) {
              console.log('✅ TOKEN ENCONTRADO en elemento DOM');
              return parsed.access_token;
            }
          } catch (e) {
            console.log('❌ Error al parsear datos del elemento');
          }
        }
      }
    }
    
    // Intentar hacer una llamada directa a la API de sesión
    console.log('🔐 Intentando llamada directa a API de sesión...');
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('📄 Respuesta de API de sesión:', data);
      
      if (data.session?.access_token) {
        console.log('✅ TOKEN ENCONTRADO en API de sesión');
        return data.session.access_token;
      }
    }
    
  } catch (error) {
    console.log('❌ Error al intentar obtener token desde hook:', error.message);
  }
  
  return null;
}

// Función para crear botón de exploración completa
function createExplorationButton() {
  console.log('🔍 Creando botón de exploración completa...');
  
  const exploreButton = document.createElement('button');
  exploreButton.textContent = '🔍 Explorar Tokens';
  exploreButton.style.cssText = `
    position: fixed;
    top: 740px;
    right: 20px;
    z-index: 10000;
    background: #7c3aed;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
  `;
  
  exploreButton.onclick = async () => {
    console.log('🔍 Iniciando exploración completa de tokens...');
    
    // Explorar todas las ubicaciones
    const localStorageToken = exploreLocalStorage();
    const sessionStorageToken = exploreSessionStorage();
    const cookiesToken = exploreCookies();
    const reactToken = exploreReactContext();
    const globalToken = exploreGlobalVariables();
    const hookToken = await tryGetTokenFromHook();
    
    // Resumen de la exploración
    console.log('📊 RESUMEN DE EXPLORACIÓN:');
    console.log('- localStorage:', !!localStorageToken);
    console.log('- sessionStorage:', !!sessionStorageToken);
    console.log('- cookies:', !!cookiesToken);
    console.log('- React context:', !!reactToken);
    console.log('- Global variables:', !!globalToken);
    console.log('- Hook:', !!hookToken);
    
    const foundToken = localStorageToken || sessionStorageToken || hookToken;
    
    if (foundToken) {
      console.log('✅ TOKEN ENCONTRADO:', foundToken.substring(0, 20) + '...');
      alert('✅ Token encontrado en la exploración');
    } else {
      console.log('❌ No se encontró ningún token');
      alert('❌ No se encontró ningún token en la exploración');
    }
  };
  
  document.body.appendChild(exploreButton);
  console.log('✅ Botón de exploración completa creado');
}

// Función para crear botón de prueba con token encontrado
function createTestWithTokenButton() {
  console.log('🧪 Creando botón de prueba con token...');
  
  const testButton = document.createElement('button');
  testButton.textContent = '🧪 Probar con Token';
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
    console.log('🧪 Probando con token encontrado...');
    
    // Intentar obtener token de todas las fuentes
    const localStorageToken = exploreLocalStorage();
    const sessionStorageToken = exploreSessionStorage();
    const hookToken = await tryGetTokenFromHook();
    
    const token = localStorageToken || sessionStorageToken || hookToken;
    
    if (token) {
      console.log('✅ Token encontrado, probando API...');
      
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        const sessionData = await response.json();
        console.log('🔐 Datos de sesión con token:', sessionData);
        
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
  console.log('✅ Botón de prueba con token creado');
}

// Ejecutar exploración automática al cargar
console.log('🚀 Iniciando exploración automática...');
exploreLocalStorage();
exploreSessionStorage();
exploreCookies();
exploreReactContext();
exploreGlobalVariables();

// Crear botones
createExplorationButton();
createTestWithTokenButton();

console.log('🎉 Script de exploración de tokens completado');
console.log('💡 Usa el botón morado para exploración completa o el verde para probar con token'); 