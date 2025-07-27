const http = require('http')

async function verifyLayout() {
  console.log('🔍 Verificando layout de la aplicación...')
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      timeout: 10000
    }

    const req = http.request(options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        console.log('📊 Status Code:', res.statusCode)
        console.log('📋 Headers:', res.headers['content-type'])
        
        // Verificar elementos críticos
        const checks = [
          { name: 'Navbar', pattern: /navbar|nav/i, found: false },
          { name: 'Footer', pattern: /footer/i, found: false },
          { name: 'Geist Fonts', pattern: /geist/i, found: false },
          { name: 'Hero Section', pattern: /hero/i, found: false },
          { name: 'Tenerife Paradise Tours', pattern: /tenerife paradise tours/i, found: false }
        ]
        
        checks.forEach(check => {
          check.found = check.pattern.test(data)
          const status = check.found ? '✅' : '❌'
          console.log(`${status} ${check.name}: ${check.found ? 'Encontrado' : 'No encontrado'}`)
        })
        
        // Verificar estructura HTML
        const hasHtml = /<html/i.test(data)
        const hasBody = /<body/i.test(data)
        const hasHead = /<head/i.test(data)
        
        console.log(`\n📄 Estructura HTML:`)
        console.log(`${hasHtml ? '✅' : '❌'} HTML tag: ${hasHtml ? 'Presente' : 'Ausente'}`)
        console.log(`${hasHead ? '✅' : '❌'} Head tag: ${hasHead ? 'Presente' : 'Ausente'}`)
        console.log(`${hasBody ? '✅' : '❌'} Body tag: ${hasBody ? 'Presente' : 'Ausente'}`)
        
        // Verificar fuentes
        const fontChecks = [
          { name: 'GeistSans Variable', pattern: /--font-geist-sans/i, found: false },
          { name: 'GeistMono Variable', pattern: /--font-geist-mono/i, found: false },
          { name: 'Geist Font Import', pattern: /geist\/font/i, found: false }
        ]
        
        console.log(`\n🔤 Fuentes:`)
        fontChecks.forEach(check => {
          check.found = check.pattern.test(data)
          const status = check.found ? '✅' : '❌'
          console.log(`${status} ${check.name}: ${check.found ? 'Encontrado' : 'No encontrado'}`)
        })
        
        // Resumen
        const totalChecks = checks.length + 3 + fontChecks.length
        const passedChecks = checks.filter(c => c.found).length + 
                           [hasHtml, hasHead, hasBody].filter(Boolean).length +
                           fontChecks.filter(c => c.found).length
        
        console.log(`\n📈 Resumen:`)
        console.log(`✅ Checks pasados: ${passedChecks}/${totalChecks}`)
        console.log(`📊 Porcentaje de éxito: ${Math.round((passedChecks/totalChecks)*100)}%`)
        
        if (passedChecks >= totalChecks * 0.8) {
          console.log('\n🎉 Layout funcionando correctamente')
          resolve(true)
        } else {
          console.log('\n⚠️ Problemas detectados en el layout')
          resolve(false)
        }
      })
    })
    
    req.on('error', (error) => {
      console.error('❌ Error conectando al servidor:', error.message)
      reject(error)
    })
    
    req.on('timeout', () => {
      console.error('❌ Timeout conectando al servidor')
      req.destroy()
      reject(new Error('Timeout'))
    })
    
    req.end()
  })
}

// Ejecutar verificación
verifyLayout()
  .then((success) => {
    if (success) {
      console.log('\n🚀 El servidor está funcionando correctamente')
      console.log('🌐 Abre http://localhost:3000 en tu navegador')
    } else {
      console.log('\n🔧 Revisa los problemas detectados arriba')
    }
  })
  .catch((error) => {
    console.error('💥 Error en la verificación:', error.message)
    console.log('\n💡 Asegúrate de que el servidor esté ejecutándose: npm run dev')
  }) 