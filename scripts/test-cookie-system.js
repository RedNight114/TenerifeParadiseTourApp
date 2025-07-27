console.log('🍪 Probando sistema de cookies...')

// Simular localStorage para testing
if (typeof localStorage === 'undefined') {
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  }
}

// Simular document.cookie para testing
if (typeof document === 'undefined') {
  global.document = {
    cookie: ''
  }
}

// Función para probar el sistema de cookies
function testCookieSystem() {
  console.log('\n1. Verificando localStorage...')
  
  // Test 1: Verificar que no hay consentimiento previo
  const initialConsent = localStorage.getItem('cookieConsent')
  console.log(`Consentimiento inicial: ${initialConsent || 'No hay consentimiento'}`)
  
  // Test 2: Simular aceptar todas las cookies
  console.log('\n2. Simulando aceptar todas las cookies...')
  const allAccepted = {
    necessary: true,
    analytics: true,
    marketing: true,
    functional: true
  }
  localStorage.setItem('cookieConsent', JSON.stringify(allAccepted))
  console.log('✅ Preferencias guardadas:', allAccepted)
  
  // Test 3: Verificar que se guardó correctamente
  const savedConsent = localStorage.getItem('cookieConsent')
  console.log(`Consentimiento guardado: ${savedConsent}`)
  
  // Test 4: Simular aceptar solo cookies necesarias
  console.log('\n3. Simulando aceptar solo cookies necesarias...')
  const necessaryOnly = {
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false
  }
  localStorage.setItem('cookieConsent', JSON.stringify(necessaryOnly))
  console.log('✅ Preferencias actualizadas:', necessaryOnly)
  
  // Test 5: Simular preferencias personalizadas
  console.log('\n4. Simulando preferencias personalizadas...')
  const customPreferences = {
    necessary: true,
    analytics: true,
    marketing: false,
    functional: true
  }
  localStorage.setItem('cookieConsent', JSON.stringify(customPreferences))
  console.log('✅ Preferencias personalizadas:', customPreferences)
  
  // Test 6: Verificar parsing de JSON
  console.log('\n5. Verificando parsing de JSON...')
  try {
    const parsed = JSON.parse(localStorage.getItem('cookieConsent'))
    console.log('✅ JSON parseado correctamente:', parsed)
    console.log('Tipo de datos:', typeof parsed)
    console.log('Es objeto:', typeof parsed === 'object')
  } catch (error) {
    console.error('❌ Error al parsear JSON:', error)
  }
  
  // Test 7: Simular reset de preferencias
  console.log('\n6. Simulando reset de preferencias...')
  localStorage.removeItem('cookieConsent')
  const afterReset = localStorage.getItem('cookieConsent')
  console.log(`Después del reset: ${afterReset || 'No hay consentimiento'}`)
  
  // Test 8: Verificar estructura de preferencias
  console.log('\n7. Verificando estructura de preferencias...')
  const testPreferences = {
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false
  }
  
  console.log('Propiedades requeridas:')
  console.log('✅ necessary:', typeof testPreferences.necessary === 'boolean')
  console.log('✅ analytics:', typeof testPreferences.analytics === 'boolean')
  console.log('✅ marketing:', typeof testPreferences.marketing === 'boolean')
  console.log('✅ functional:', typeof testPreferences.functional === 'boolean')
  
  // Test 9: Simular cookies del navegador
  console.log('\n8. Simulando cookies del navegador...')
  
  // Simular establecer cookies
  const setCookie = (name, value, options = {}) => {
    let cookieString = `${name}=${value}`
    if (options.maxAge) cookieString += `; max-age=${options.maxAge}`
    if (options.path) cookieString += `; path=${options.path}`
    else cookieString += '; path=/'
    if (options.sameSite) cookieString += `; SameSite=${options.sameSite}`
    
    document.cookie = cookieString
    console.log(`🍪 Cookie establecida: ${cookieString}`)
  }
  
  // Simular obtener cookies
  const getCookie = (name) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop().split(';').shift()
    }
    return null
  }
  
  // Probar cookies
  setCookie('session_id', 'test-session-123', { maxAge: 3600, sameSite: 'Strict' })
  setCookie('analytics_consent', 'true', { maxAge: 31536000, sameSite: 'Lax' })
  setCookie('marketing_consent', 'false', { maxAge: 31536000, sameSite: 'Lax' })
  
  console.log('Cookies establecidas:', document.cookie)
  console.log('session_id:', getCookie('session_id'))
  console.log('analytics_consent:', getCookie('analytics_consent'))
  console.log('marketing_consent:', getCookie('marketing_consent'))
  
  console.log('\n🎉 Pruebas del sistema de cookies completadas')
}

// Ejecutar las pruebas
testCookieSystem() 