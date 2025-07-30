#!/usr/bin/env node

/**
 * Script para limpiar el cache de autenticación y resolver problemas de loading infinito
 * Uso: node scripts/fix-auth-cache.js
 */

const fs = require('fs')
const path = require('path')

console.log('🧹 Iniciando limpieza de cache de autenticación...')

// Función para limpiar localStorage y sessionStorage (simulado)
function clearBrowserStorage() {
  console.log('📱 Limpiando storage del navegador...')
  
  // Crear script para ejecutar en el navegador
  const clearScript = `
    // Limpiar localStorage
    try {
      localStorage.removeItem('supabase.auth.token')
      localStorage.removeItem('supabase.auth.expires_at')
      localStorage.removeItem('supabase.auth.refresh_token')
      localStorage.removeItem('supabase.auth.provider_token')
      localStorage.removeItem('supabase.auth.provider_refresh_token')
      console.log('✅ localStorage limpiado')
    } catch (e) {
      console.error('❌ Error limpiando localStorage:', e)
    }
    
    // Limpiar sessionStorage
    try {
      sessionStorage.clear()
      console.log('✅ sessionStorage limpiado')
    } catch (e) {
      console.error('❌ Error limpiando sessionStorage:', e)
    }
    
    // Limpiar cookies relacionadas con Supabase
    try {
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      console.log('✅ Cookies limpiadas')
    } catch (e) {
      console.error('❌ Error limpiando cookies:', e)
    }
  `
  
  // Guardar script para uso manual
  const scriptPath = path.join(__dirname, 'clear-auth-cache.js')
  fs.writeFileSync(scriptPath, clearScript)
  console.log(`📝 Script de limpieza guardado en: ${scriptPath}`)
}

// Función para verificar configuración de Supabase
function checkSupabaseConfig() {
  console.log('🔧 Verificando configuración de Supabase...')
  
  const envPath = path.join(process.cwd(), '.env.local')
  const envExamplePath = path.join(process.cwd(), 'env.example')
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ]
    
    const missingVars = requiredVars.filter(varName => !envContent.includes(varName))
    
    if (missingVars.length > 0) {
      console.log('⚠️ Variables de entorno faltantes:')
      missingVars.forEach(varName => console.log(`   - ${varName}`))
    } else {
      console.log('✅ Variables de entorno de Supabase configuradas')
    }
  } else {
    console.log('⚠️ Archivo .env.local no encontrado')
    if (fs.existsSync(envExamplePath)) {
      console.log('📝 Copiando env.example a .env.local...')
      fs.copyFileSync(envExamplePath, envPath)
      console.log('✅ Archivo .env.local creado desde env.example')
    }
  }
}

// Función para verificar archivos de configuración
function checkConfigFiles() {
  console.log('📁 Verificando archivos de configuración...')
  
  const configFiles = [
    'lib/supabase-optimized.ts',
    'hooks/use-auth-fixed.ts',
    'components/auth-provider-fixed.tsx',
    'components/auth-guard-fixed.tsx'
  ]
  
  configFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file)
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}`)
    } else {
      console.log(`❌ ${file} - NO ENCONTRADO`)
    }
  })
}

// Función para generar instrucciones de solución
function generateSolutionSteps() {
  console.log('\n📋 Pasos para resolver problemas de autenticación:')
  console.log('')
  console.log('1. 🔄 Recargar la página (Ctrl+F5 o Cmd+Shift+R)')
  console.log('2. 🧹 Ejecutar el script de limpieza en la consola del navegador:')
  console.log('   - Abrir DevTools (F12)')
  console.log('   - Ir a la pestaña Console')
  console.log('   - Copiar y pegar el contenido de scripts/clear-auth-cache.js')
  console.log('3. 🔐 Verificar credenciales de Supabase en .env.local')
  console.log('4. 🌐 Verificar conexión a internet')
  console.log('5. 🚀 Reiniciar el servidor de desarrollo (npm run dev)')
  console.log('')
  console.log('🔍 Para diagnóstico avanzado:')
  console.log('- Revisar la consola del navegador para errores')
  console.log('- Verificar el componente AuthDiagnostic en la esquina inferior derecha')
  console.log('- Comprobar la pestaña Network en DevTools')
}

// Función principal
function main() {
  console.log('🚀 Iniciando diagnóstico de autenticación...\n')
  
  clearBrowserStorage()
  console.log('')
  
  checkSupabaseConfig()
  console.log('')
  
  checkConfigFiles()
  console.log('')
  
  generateSolutionSteps()
  
  console.log('✅ Diagnóstico completado')
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main()
}

module.exports = {
  clearBrowserStorage,
  checkSupabaseConfig,
  checkConfigFiles,
  generateSolutionSteps
} 