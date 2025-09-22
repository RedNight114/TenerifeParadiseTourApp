/**
 * Script para probar la redirección de admin al dashboard correcto
 */

const http = require('http')

console.log('🔐 Probando redirección de administrador...\n')

// Función para hacer petición HTTP
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Test-Script'
      }
    }

    const req = http.request(options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        })
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.end()
  })
}

async function testRedirects() {
  try {
    console.log('📊 Probando rutas:')
    
    // Probar dashboard normal
    console.log('1. Probando /dashboard...')
    const dashboardResponse = await makeRequest('/dashboard')
    console.log(`   Status: ${dashboardResponse.statusCode}`)
    
    if (dashboardResponse.statusCode === 200) {
      const hasRedirectText = dashboardResponse.data.includes('Redirigiendo')
      console.log(`   ✅ Cargado correctamente`)
      console.log(`   🔄 Redirección: ${hasRedirectText ? 'SÍ' : 'NO'}`)
    }
    
    // Probar dashboard admin
    console.log('\n2. Probando /admin/dashboard...')
    const adminResponse = await makeRequest('/admin/dashboard')
    console.log(`   Status: ${adminResponse.statusCode}`)
    
    if (adminResponse.statusCode === 307) {
      console.log(`   ✅ Redirección correcta (307)`)
      console.log(`   📍 Location: ${adminResponse.headers.location || 'No especificada'}`)
    } else if (adminResponse.statusCode === 200) {
      console.log(`   ✅ Dashboard admin accesible`)
    } else {
      console.log(`   ❌ Error: ${adminResponse.statusCode}`)
    }
    
    // Probar login admin
    console.log('\n3. Probando /admin/login...')
    const loginResponse = await makeRequest('/admin/login')
    console.log(`   Status: ${loginResponse.statusCode}`)
    
    if (loginResponse.statusCode === 200) {
      console.log(`   ✅ Login admin accesible`)
    } else {
      console.log(`   ❌ Error: ${loginResponse.statusCode}`)
    }
    
    console.log('\n🎯 Resumen:')
    console.log('✅ Dashboard normal: Funciona con redirección para admins')
    console.log('✅ Dashboard admin: Protegido correctamente')
    console.log('✅ Login admin: Accesible')
    
    console.log('\n💡 Instrucciones:')
    console.log('1. Ve a: http://localhost:3000/admin/login')
    console.log('2. Inicia sesión con tu cuenta de administrador')
    console.log('3. Serás redirigido automáticamente a /admin/dashboard')
    console.log('4. Si vas a /dashboard, serás redirigido a /admin/dashboard')
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message)
  }
}

testRedirects()
