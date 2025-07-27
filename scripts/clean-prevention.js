const fs = require('fs')
const path = require('path')

console.log('🧹 Sistema de Limpieza y Prevención')
console.log('Verificando archivos críticos...\n')

// Verificar archivos críticos
const criticalFiles = [
  'hooks/use-auth.ts',
  'components/auth-guard.tsx',
  'middleware.ts',
  'lib/supabase-optimized.ts'
]

let allClean = true

criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file)
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - NO ENCONTRADO`)
    allClean = false
  }
})

console.log()
if (allClean) {
  console.log('✅ Todos los archivos críticos están presentes')
  console.log('🚀 Listo para desarrollo')
} else {
  console.log('⚠️ Algunos archivos críticos faltan')
  process.exit(1)
} 