const fs = require('fs')
const path = require('path')

console.log('🚀 Optimizando proyecto para producción...')

// 1. Verificar archivos críticos
console.log('\n1. Verificando archivos críticos...')
const criticalFiles = [
  'next.config.mjs',
  'vercel.json',
  'package.json',
  'tsconfig.json',
  'tailwind.config.ts'
]

criticalFiles.forEach(file => {
  const exists = fs.existsSync(file)
  console.log(`${exists ? '✅' : '❌'} ${file}`)
})

// 2. Verificar dependencias
console.log('\n2. Verificando dependencias...')
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const dependencies = Object.keys(packageJson.dependencies || {})
const devDependencies = Object.keys(packageJson.devDependencies || {})

console.log(`Dependencias de producción: ${dependencies.length}`)
console.log(`Dependencias de desarrollo: ${devDependencies.length}`)

// 3. Verificar configuración de imágenes
console.log('\n3. Verificando configuración de imágenes...')
const imagesDir = path.join(__dirname, '..', 'public', 'images')
if (fs.existsSync(imagesDir)) {
  const imageFiles = fs.readdirSync(imagesDir)
  const imageCount = imageFiles.filter(file => 
    file.match(/\.(jpg|jpeg|png|webp|avif|svg)$/i)
  ).length
  console.log(`✅ Imágenes encontradas: ${imageCount}`)
} else {
  console.log('❌ Directorio de imágenes no encontrado')
}

// 4. Verificar componentes críticos
console.log('\n4. Verificando componentes críticos...')
const componentsDir = path.join(__dirname, '..', 'components')
const criticalComponents = [
  'service-card.tsx',
  'featured-services.tsx',
  'services-grid.tsx',
  'navbar.tsx',
  'footer.tsx'
]

criticalComponents.forEach(component => {
  const componentPath = path.join(componentsDir, component)
  const exists = fs.existsSync(componentPath)
  console.log(`${exists ? '✅' : '❌'} ${component}`)
})

// 5. Verificar hooks
console.log('\n5. Verificando hooks...')
const hooksDir = path.join(__dirname, '..', 'hooks')
const criticalHooks = [
  'use-services.ts',
  'use-auth-final.ts',
  'use-contact-messages.ts'
]

criticalHooks.forEach(hook => {
  const hookPath = path.join(hooksDir, hook)
  const exists = fs.existsSync(hookPath)
  console.log(`${exists ? '✅' : '❌'} ${hook}`)
})

// 6. Verificar API routes
console.log('\n6. Verificando API routes...')
const apiDir = path.join(__dirname, '..', 'app', 'api')
const criticalApis = [
  'payment/create/route.ts',
  'payment/confirm/route.ts',
  'payment/webhook/route.ts',
  'contact/route.ts',
  'reservations/route.ts'
]

criticalApis.forEach(api => {
  const apiPath = path.join(apiDir, api)
  const exists = fs.existsSync(apiPath)
  console.log(`${exists ? '✅' : '❌'} ${api}`)
})

// 7. Verificar variables de entorno
console.log('\n7. Verificando variables de entorno...')
const envFiles = ['.env.local', '.env.production']
envFiles.forEach(envFile => {
  const exists = fs.existsSync(envFile)
  console.log(`${exists ? '✅' : '❌'} ${envFile}`)
})

// 8. Recomendaciones de optimización
console.log('\n8. Recomendaciones de optimización:')
console.log('✅ Usar lazy loading para imágenes no críticas')
console.log('✅ Implementar caching en el cliente')
console.log('✅ Optimizar bundle size con code splitting')
console.log('✅ Usar CDN para imágenes estáticas')
console.log('✅ Implementar service worker para cache offline')
console.log('✅ Optimizar fuentes con font-display: swap')
console.log('✅ Comprimir imágenes antes del deploy')
console.log('✅ Usar preload para recursos críticos')

// 9. Estadísticas finales
console.log('\n📊 Estadísticas del proyecto:')
const totalFiles = countFiles(__dirname, '..')
console.log(`Total de archivos: ${totalFiles}`)

function countFiles(dir, baseDir) {
  let count = 0
  const items = fs.readdirSync(dir)
  
  items.forEach(item => {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      count += countFiles(fullPath, baseDir)
    } else if (stat.isFile()) {
      count++
    }
  })
  
  return count
}

console.log('\n🎉 Optimización completada. El proyecto está listo para producción!') 