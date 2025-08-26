#!/usr/bin/env node

/**
 * Script para verificar la configuración de autenticación
 * Ejecutar con: node scripts/check-auth-config.js
 */

// Cargar variables de entorno desde .env.local
const fs = require('fs')
const path = require('path')

// Función para cargar variables de entorno desde archivo
function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n')
    
    lines.forEach(line => {
      const trimmedLine = line.trim()
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '')
          process.env[key] = value
        }
      }
    })
    
    console.log(`✅ Archivo ${path.basename(filePath)} cargado`)
  } else {
    console.log(`⚠️ Archivo ${path.basename(filePath)} no encontrado`)
  }
}

// Cargar archivos de entorno en orden de prioridad
const envFiles = ['.env.local', '.env']
envFiles.forEach(file => {
  loadEnvFile(path.join(process.cwd(), file))
})

console.log('🔍 Verificando configuración de autenticación...\n')

// Verificar variables de entorno
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
]

const missingVars = []
const configVars = {}

requiredEnvVars.forEach(varName => {
  const value = process.env[varName]
  if (!value) {
    missingVars.push(varName)
    configVars[varName] = '❌ FALTANTE'
  } else {
    configVars[varName] = '✅ Configurada'
  }
})

console.log('📋 Variables de entorno:')
Object.entries(configVars).forEach(([varName, status]) => {
  console.log(`  ${varName}: ${status}`)
})

if (missingVars.length > 0) {
  console.log('\n❌ ERROR: Faltan variables de entorno requeridas:')
  missingVars.forEach(varName => {
    console.log(`  - ${varName}`)
  })
  console.log('\n💡 Solución:')
  console.log('1. Verifica que el archivo .env.local existe y contiene las variables')
  console.log('2. Asegúrate de que las variables estén en el formato correcto:')
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co')
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima')
  console.log('3. Reinicia el servidor de desarrollo')
  process.exit(1)
}

console.log('\n✅ Todas las variables de entorno están configuradas')

// Verificar formato de URL de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
  console.log('\n⚠️ ADVERTENCIA: La URL de Supabase no parece ser válida')
  console.log(`   URL actual: ${supabaseUrl}`)
  console.log('   Debería ser algo como: https://tu-proyecto.supabase.co')
}

// Verificar formato de clave anónima
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (supabaseKey && !supabaseKey.startsWith('eyJ')) {
  console.log('\n⚠️ ADVERTENCIA: La clave anónima de Supabase no parece ser válida')
  console.log('   Debería empezar con "eyJ" (formato JWT)')
}

console.log('\n🎉 Configuración de autenticación verificada correctamente')
console.log('\n📝 Próximos pasos:')
console.log('1. Asegúrate de que tu proyecto de Supabase esté activo')
console.log('2. Verifica que la autenticación esté habilitada en Supabase')
console.log('3. Confirma que las políticas RLS permitan inserción en la tabla profiles')
console.log('4. Prueba el registro en la aplicación') 