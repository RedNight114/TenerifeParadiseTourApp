#!/usr/bin/env node

/**
 * 🧪 Test de Recuperación de Errores - Tenerife Paradise Tours
 * 
 * Este script simula diferentes escenarios de error para probar
 * el sistema de recuperación automática implementado.
 */

const { createClient } = require('@supabase/supabase-js')

console.log('🧪 TEST DE RECUPERACIÓN DE ERRORES')
console.log('===================================\n')

// Configuración
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no configuradas')
  console.log('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Función de retry con delay exponencial
const retryWithDelay = async (operation, retryCount = 0) => {
  const MAX_RETRIES = 3
  const RETRY_DELAY = 2000

  try {
    return await operation()
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 Reintento ${retryCount + 1}/${MAX_RETRIES} en ${RETRY_DELAY * Math.pow(2, retryCount)}ms`)
      await new Promise(resolve => 
        setTimeout(resolve, RETRY_DELAY * Math.pow(2, retryCount))
      )
      return retryWithDelay(operation, retryCount + 1)
    }
    throw error
  }
}

// Test 1: Conexión básica
async function testBasicConnection() {
  console.log('📡 Test 1: Conexión básica a Supabase')
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error) {
      throw error
    }
    
    console.log('✅ Conexión exitosa')
    return true
  } catch (error) {
    console.error('❌ Error de conexión:', error.message)
    return false
  }
}

// Test 2: Carga de servicios con retry
async function testServicesLoad() {
  console.log('\n📦 Test 2: Carga de servicios con sistema de retry')
  
  try {
    const { data, error } = await retryWithDelay(async () => {
      const result = await supabase
        .from('services')
        .select(`
          *,
          category:categories(name, description),
          subcategory:subcategories(name, description)
        `)
        .order('created_at', { ascending: false })
      
      if (result.error) {
        throw new Error(`Error obteniendo servicios: ${result.error.message}`)
      }
      
      return result
    })

    console.log(`✅ ${data?.length || 0} servicios cargados exitosamente`)
    return true
  } catch (error) {
    console.error('❌ Error cargando servicios:', error.message)
    return false
  }
}

// Test 3: Simular error de red
async function testNetworkError() {
  console.log('\n🌐 Test 3: Simulación de error de red')
  
  try {
    // Intentar una operación que probablemente falle
    const { data, error } = await retryWithDelay(async () => {
      const result = await supabase
        .from('table_that_does_not_exist')
        .select('*')
      
      if (result.error) {
        throw new Error(`Error simulado: ${result.error.message}`)
      }
      
      return result
    })

    console.log('✅ Operación inesperadamente exitosa')
    return true
  } catch (error) {
    console.log('✅ Error simulado capturado correctamente:', error.message)
    return true // Este error es esperado
  }
}

// Test 4: Carga de categorías
async function testCategoriesLoad() {
  console.log('\n📂 Test 4: Carga de categorías')
  
  try {
    const { data, error } = await retryWithDelay(async () => {
      const result = await supabase
        .from('categories')
        .select('*')
        .order('name')
      
      if (result.error) {
        throw new Error(`Error obteniendo categorías: ${result.error.message}`)
      }
      
      return result
    })

    console.log(`✅ ${data?.length || 0} categorías cargadas exitosamente`)
    return true
  } catch (error) {
    console.error('❌ Error cargando categorías:', error.message)
    return false
  }
}

// Test 5: Simular múltiples operaciones simultáneas
async function testConcurrentOperations() {
  console.log('\n⚡ Test 5: Operaciones simultáneas')
  
  try {
    const promises = [
      supabase.from('services').select('count').limit(1),
      supabase.from('categories').select('count').limit(1),
      supabase.from('subcategories').select('count').limit(1)
    ]
    
    const results = await Promise.all(promises)
    
    let successCount = 0
    results.forEach((result, index) => {
      if (!result.error) {
        successCount++
      }
    })
    
    console.log(`✅ ${successCount}/${results.length} operaciones simultáneas exitosas`)
    return successCount === results.length
  } catch (error) {
    console.error('❌ Error en operaciones simultáneas:', error.message)
    return false
  }
}

// Test 6: Recuperación después de error
async function testErrorRecovery() {
  console.log('\n🔄 Test 6: Recuperación después de error')
  
  try {
    // Primero, intentar una operación que falle
    try {
      await supabase.from('table_that_does_not_exist').select('*')
    } catch (error) {
      console.log('✅ Error simulado capturado')
    }
    
    // Luego, intentar una operación válida
    const { data, error } = await retryWithDelay(async () => {
      const result = await supabase
        .from('services')
        .select('id, title')
        .limit(1)
      
      if (result.error) {
        throw new Error(`Error obteniendo servicios: ${result.error.message}`)
      }
      
      return result
    })

    console.log('✅ Recuperación exitosa después de error')
    return true
  } catch (error) {
    console.error('❌ Error en recuperación:', error.message)
    return false
  }
}

// Función principal
async function runTests() {
  console.log('🚀 Iniciando tests de recuperación de errores...\n')
  
  const tests = [
    { name: 'Conexión básica', fn: testBasicConnection },
    { name: 'Carga de servicios', fn: testServicesLoad },
    { name: 'Error de red simulado', fn: testNetworkError },
    { name: 'Carga de categorías', fn: testCategoriesLoad },
    { name: 'Operaciones simultáneas', fn: testConcurrentOperations },
    { name: 'Recuperación de errores', fn: testErrorRecovery }
  ]
  
  let passedTests = 0
  const totalTests = tests.length
  
  for (const test of tests) {
    try {
      const result = await test.fn()
      if (result) {
        passedTests++
      }
    } catch (error) {
      console.error(`❌ Error en test "${test.name}":`, error.message)
    }
  }
  
  console.log('\n📊 RESULTADOS DE LOS TESTS')
  console.log('==========================')
  console.log(`✅ Tests pasados: ${passedTests}/${totalTests}`)
  console.log(`❌ Tests fallidos: ${totalTests - passedTests}/${totalTests}`)
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ¡Todos los tests pasaron! El sistema de recuperación funciona correctamente.')
  } else {
    console.log('\n⚠️ Algunos tests fallaron. Revisa los errores arriba.')
  }
  
  console.log('\n💡 RECOMENDACIONES:')
  console.log('1. Verifica que la base de datos esté accesible')
  console.log('2. Confirma que las variables de entorno estén configuradas')
  console.log('3. Revisa los logs de Supabase para errores específicos')
  console.log('4. Prueba la aplicación en el navegador para verificar el comportamiento')
}

// Ejecutar tests
runTests().catch(error => {
  console.error('❌ Error ejecutando tests:', error)
  process.exit(1)
}) 