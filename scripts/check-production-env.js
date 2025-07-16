require('dotenv').config({ path: '.env.local' })

// Variables críticas para producción
const CRITICAL_VARS = {
  // Supabase
  'NEXT_PUBLIC_SUPABASE_URL': 'URL de Supabase',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Clave anónima de Supabase',
  'SUPABASE_SERVICE_ROLE_KEY': 'Clave de servicio de Supabase',
  
  // Sitio web
  'NEXT_PUBLIC_SITE_URL': 'URL del sitio web',
  
  // Redsys (producción)
  'REDSYS_ENVIRONMENT': 'Entorno de Redsys',
  'REDSYS_MERCHANT_CODE': 'Código de comercio Redsys',
  'REDSYS_TERMINAL': 'Terminal Redsys',
  'REDSYS_SECRET_KEY': 'Clave secreta Redsys',
}

// Variables opcionales pero recomendadas
const OPTIONAL_VARS = {
  'ENCRYPTION_KEY': 'Clave de encriptación',
  'JWT_SECRET': 'Secreto JWT',
  'SENTRY_DSN': 'DSN de Sentry',
  'NEXT_PUBLIC_GA_ID': 'ID de Google Analytics',
  'BLOB_READ_WRITE_TOKEN': 'Token de Vercel Blob',
}

function checkEnvironment() {
  console.log('🔍 Verificando variables de entorno para producción...\n')
  
  let criticalErrors = 0
  let optionalWarnings = 0
  
  // Verificar variables críticas
  console.log('📋 Variables CRÍTICAS:')
  console.log('='.repeat(50))
  
  for (const [varName, description] of Object.entries(CRITICAL_VARS)) {
    const value = process.env[varName]
    
    if (!value) {
      console.log(`❌ ${varName}: ${description} - NO CONFIGURADA`)
      criticalErrors++
    } else if (value.includes('tu-') || value.includes('example')) {
      console.log(`⚠️  ${varName}: ${description} - VALOR DE EJEMPLO`)
      criticalErrors++
    } else {
      console.log(`✅ ${varName}: ${description} - CONFIGURADA`)
    }
  }
  
  console.log('\n📋 Variables OPCIONALES:')
  console.log('='.repeat(50))
  
  for (const [varName, description] of Object.entries(OPTIONAL_VARS)) {
    const value = process.env[varName]
    
    if (!value) {
      console.log(`⚠️  ${varName}: ${description} - NO CONFIGURADA (opcional)`)
      optionalWarnings++
    } else if (value.includes('tu-') || value.includes('example')) {
      console.log(`⚠️  ${varName}: ${description} - VALOR DE EJEMPLO`)
      optionalWarnings++
    } else {
      console.log(`✅ ${varName}: ${description} - CONFIGURADA`)
    }
  }
  
  // Verificaciones específicas
  console.log('\n🔒 Verificaciones de seguridad:')
  console.log('='.repeat(50))
  
  // Verificar entorno de Redsys
  const redsysEnv = process.env.REDSYS_ENVIRONMENT
  if (redsysEnv === 'production') {
    console.log('✅ Redsys configurado para PRODUCCIÓN')
  } else if (redsysEnv === 'test') {
    console.log('⚠️  Redsys configurado para PRUEBAS')
  } else {
    console.log('❌ Entorno de Redsys no configurado')
    criticalErrors++
  }
  
  // Verificar URL del sitio
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (siteUrl && siteUrl.includes('localhost')) {
    console.log('⚠️  URL del sitio apunta a localhost')
    criticalErrors++
  } else if (siteUrl && siteUrl.includes('tenerifeparadise')) {
    console.log('✅ URL del sitio configurada correctamente')
  } else {
    console.log('❌ URL del sitio no configurada o incorrecta')
    criticalErrors++
  }
  
  // Verificar longitud de claves
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (anonKey && anonKey.length < 50) {
    console.log('❌ Clave anónima de Supabase parece ser inválida')
    criticalErrors++
  }
  
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (serviceKey && serviceKey.length < 50) {
    console.log('❌ Clave de servicio de Supabase parece ser inválida')
    criticalErrors++
  }
  
  // Resumen
  console.log('\n📊 RESUMEN:')
  console.log('='.repeat(50))
  
  if (criticalErrors === 0) {
    console.log('🎉 ¡Todas las variables críticas están configuradas!')
    console.log('✅ La aplicación está lista para producción')
  } else {
    console.log(`❌ ${criticalErrors} variables críticas faltan o están mal configuradas`)
    console.log('⚠️  La aplicación NO está lista para producción')
  }
  
  if (optionalWarnings > 0) {
    console.log(`⚠️  ${optionalWarnings} variables opcionales no están configuradas`)
  }
  
  console.log('\n📝 PRÓXIMOS PASOS:')
  console.log('='.repeat(50))
  
  if (criticalErrors > 0) {
    console.log('1. Configura las variables críticas faltantes')
    console.log('2. Asegúrate de usar valores reales, no de ejemplo')
    console.log('3. Verifica que Redsys esté configurado para producción')
    console.log('4. Ejecuta este script nuevamente')
  } else {
    console.log('1. ✅ Variables críticas configuradas')
    console.log('2. Procede con el despliegue')
    console.log('3. Configura las variables opcionales según necesites')
  }
  
  return criticalErrors === 0
}

// Ejecutar verificación
const isReady = checkEnvironment()

// Salir con código de error si hay problemas críticos
if (!isReady) {
  process.exit(1)
} 