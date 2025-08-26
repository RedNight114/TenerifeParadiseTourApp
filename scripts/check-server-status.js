const { execSync } = require('child_process')

console.log('🔍 Verificando estado del servidor...')

try {
  // Verificar puerto 3000
  const result3000 = execSync('netstat -an | findstr :3000', { encoding: 'utf8' })
  console.log('✅ Servidor corriendo en puerto 3000')
  console.log(result3000)
} catch (error) {
  console.log('❌ No hay servidor en puerto 3000')
}

try {
  // Verificar puerto 3001
  const result3001 = execSync('netstat -an | findstr :3001', { encoding: 'utf8' })
  console.log('✅ Servidor corriendo en puerto 3001')
  console.log(result3001)
} catch (error) {
  console.log('❌ No hay servidor en puerto 3001')
}

console.log('🎯 Verificación completada') 