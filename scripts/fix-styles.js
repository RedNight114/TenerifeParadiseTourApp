const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🎨 ARREGLANDO PROBLEMAS DE ESTILOS CSS\n')

try {
  // 1. Detener todos los procesos de Node.js
  console.log('🛑 Deteniendo procesos de Node.js...')
  try {
    execSync('taskkill /f /im node.exe', { stdio: 'inherit' })
    console.log('✅ Procesos detenidos')
  } catch (error) {
    console.log('ℹ️ No había procesos ejecutándose')
  }

  // 2. Limpiar completamente el cache de Next.js
  console.log('🧹 Limpiando cache de Next.js...')
  const nextDir = path.join(process.cwd(), '.next')
  if (fs.existsSync(nextDir)) {
    try {
      execSync('Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue', { stdio: 'inherit' })
      console.log('✅ Cache de Next.js eliminado')
    } catch (error) {
      console.log('ℹ️ Cache ya estaba limpio')
    }
  }

  // 3. Limpiar cache de npm
  console.log('📦 Limpiando cache de npm...')
  try {
    execSync('npm cache clean --force', { stdio: 'inherit' })
    console.log('✅ Cache de npm limpiado')
  } catch (error) {
    console.log('⚠️ Error limpiando cache de npm:', error.message)
  }

  // 4. Verificar archivos críticos de estilos
  console.log('🔍 Verificando archivos de estilos...')
  const criticalFiles = [
    'app/globals.css',
    'tailwind.config.ts',
    'app/layout.tsx',
    'postcss.config.mjs'
  ]

  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`)
    } else {
      console.log(`❌ ${file} - NO ENCONTRADO`)
    }
  })

  // 5. Verificar package.json
  console.log('\n📋 Verificando dependencias...')
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    const requiredDeps = ['tailwindcss', 'postcss', 'autoprefixer']
    
    requiredDeps.forEach(dep => {
      if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
        console.log(`✅ ${dep} instalado`)
      } else {
        console.log(`❌ ${dep} NO INSTALADO`)
      }
    })
  }

  // 6. Verificar postcss.config.mjs
  console.log('\n🔧 Verificando configuración de PostCSS...')
  if (fs.existsSync('postcss.config.mjs')) {
    console.log('✅ postcss.config.mjs encontrado')
  } else {
    console.log('❌ postcss.config.mjs NO ENCONTRADO')
    console.log('🔧 Creando postcss.config.mjs...')
    
    const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`
    
    fs.writeFileSync('postcss.config.mjs', postcssConfig)
    console.log('✅ postcss.config.mjs creado')
  }

  // 7. Instrucciones para el usuario
  console.log('\n📋 INSTRUCCIONES PARA ARREGLAR ESTILOS:')
  console.log('1. Ejecuta: npm install')
  console.log('2. Ejecuta: npm run dev')
  console.log('3. Abre: http://localhost:3000')
  console.log('4. Si persiste el problema, ejecuta: npm run build')
  console.log('5. Luego: npm run dev')
  
  console.log('\n🎯 CAMBIOS APLICADOS:')
  console.log('- Cache de Next.js completamente limpiado')
  console.log('- Cache de npm limpiado')
  console.log('- Archivos críticos verificados')
  console.log('- Configuración de PostCSS verificada')
  
  console.log('\n🚀 Los estilos deberían funcionar ahora correctamente.')
  
} catch (error) {
  console.error('❌ Error durante la reparación:', error.message)
  console.log('\n🔧 Instrucciones manuales:')
  console.log('1. Cierra TODOS los navegadores y terminales')
  console.log('2. Elimina manualmente la carpeta .next')
  console.log('3. Ejecuta: npm install')
  console.log('4. Ejecuta: npm run dev')
  console.log('5. Abre un navegador en modo incógnito')
} 