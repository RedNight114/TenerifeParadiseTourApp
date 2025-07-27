
#!/usr/bin/env node

const { execSync } = require('child_process')

console.log('🔄 Reiniciando servidor de desarrollo...')

try {
  // Detener procesos en puerto 3000
  console.log('🛑 Deteniendo procesos en puerto 3000...')
  execSync('npx kill-port 3000', { stdio: 'inherit' })
  console.log('✅ Puerto 3000 liberado')
  
  // Limpiar cache de Next.js
  console.log('🧹 Limpiando cache de Next.js...')
  execSync('npx next clean', { stdio: 'inherit' })
  console.log('✅ Cache limpiado')
  
  // Limpiar node_modules (opcional, solo si hay problemas)
  // console.log('🗑️ Limpiando node_modules...')
  // execSync('rm -rf node_modules', { stdio: 'inherit' })
  // execSync('npm install', { stdio: 'inherit' })
  
  // Reiniciar servidor
  console.log('🚀 Reiniciando servidor...')
  execSync('npm run dev', { stdio: 'inherit' })
} catch (error) {
  console.error('❌ Error reiniciando servidor:', error.message)
  console.log('\n🔧 Intentando reinicio manual...')
  console.log('1. Detén el servidor manualmente (Ctrl+C)')
  console.log('2. Ejecuta: npm run dev')
}
