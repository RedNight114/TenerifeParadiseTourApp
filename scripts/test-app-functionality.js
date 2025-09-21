// Script para probar la funcionalidad de la aplicación
console.log('🧪 Iniciando pruebas de funcionalidad...')

// Función para hacer una petición HTTP
async function testEndpoint(url, description) {
  try {
    console.log(`\n📡 Probando: ${description}`)
    console.log(`   URL: ${url}`)
    
    const response = await fetch(url)
    const status = response.status
    const contentType = response.headers.get('content-type')
    
    if (status === 200) {
      console.log(`   ✅ Estado: ${status}`)
      console.log(`   ✅ Tipo de contenido: ${contentType}`)
      
      if (contentType && contentType.includes('text/html')) {
        const html = await response.text()
        if (html.includes('Tenerife Paradise Tour')) {
          console.log(`   ✅ Contenido HTML válido`)
        } else {
          console.log(`   ⚠️  Contenido HTML inesperado`)
        }
      }
    } else {
      console.log(`   ❌ Estado: ${status}`)
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }
}

// Función principal de pruebas
async function runTests() {
  const baseUrl = 'http://localhost:3000'
  
  console.log(`\n🌐 Probando aplicación en: ${baseUrl}`)
  
  // Probar página principal
  await testEndpoint(baseUrl, 'Página principal')
  
  // Probar página de servicios
  await testEndpoint(`${baseUrl}/services`, 'Página de servicios')
  
  // Probar página de admin (debería redirigir o mostrar login)
  await testEndpoint(`${baseUrl}/admin`, 'Página de admin')
  
  // Probar API de servicios
  await testEndpoint(`${baseUrl}/api/services`, 'API de servicios')
  
  // Probar API de categorías
  await testEndpoint(`${baseUrl}/api/categories`, 'API de categorías')
  
  console.log('\n🎉 Pruebas completadas')
  console.log('\n📋 Resumen:')
  console.log('   - Si todas las pruebas muestran ✅, la aplicación está funcionando correctamente')
  console.log('   - Si hay ❌, revisa los errores en la consola del navegador')
  console.log('   - Si hay ⚠️, puede haber problemas menores pero la aplicación debería funcionar')
}

// Ejecutar pruebas si estamos en un entorno con fetch
if (typeof fetch !== 'undefined') {
  runTests().catch(console.error)
} else {
  console.log('❌ fetch no está disponible en este entorno')
  console.log('   Ejecuta este script en el navegador o usa Node.js 18+')
}
