require('dotenv').config()

console.log('🔍 Verificando variables de entorno...')

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
]

console.log('\n📋 Variables requeridas:')
requiredVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`)
  } else {
    console.log(`❌ ${varName}: NO CONFIGURADA`)
  }
})

console.log('\n🔧 Otras variables disponibles:')
Object.keys(process.env)
  .filter(key => key.includes('SUPABASE') || key.includes('REDSYS') || key.includes('NEXT'))
  .forEach(key => {
    const value = process.env[key]
    if (value) {
      console.log(`✅ ${key}: ${value.substring(0, 30)}...`)
    }
  })

console.log('\n📁 Directorio actual:', process.cwd())
console.log('🌍 Entorno:', process.env.NODE_ENV || 'development') 