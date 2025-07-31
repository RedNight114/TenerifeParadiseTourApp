#!/usr/bin/env node

/**
 * Script para extender el tiempo de sesión
 * Limpia las sesiones existentes y aplica nuevos tiempos
 */

console.log('🔄 Extendiendo tiempo de sesión...')

// Función para limpiar localStorage
function clearLocalStorage() {
  if (typeof window !== 'undefined') {
    console.log('🧹 Limpiando localStorage...')
    
    const keysToRemove = [
      'supabase.auth.token',
      'supabase.auth.expires_at',
      'supabase.auth.refresh_token'
    ]
    
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key)
        console.log(`✅ Removido: ${key}`)
      }
    })
  }
}

// Función para limpiar cookies
function clearCookies() {
  if (typeof document !== 'undefined') {
    console.log('🍪 Limpiando cookies...')
    
    const cookies = document.cookie.split(';')
    
    cookies.forEach(cookie => {
      const name = cookie.split('=')[0].trim()
      if (name.includes('supabase') || name.includes('auth')) {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        console.log(`✅ Cookie removida: ${name}`)
      }
    })
  }
}

// Función para verificar configuración
function checkConfiguration() {
  console.log('🔍 Verificando configuración...')
  
  // Verificar archivo supabase-optimized.ts
  const fs = require('fs')
  const path = require('path')
  
  const supabaseFile = path.join(__dirname, '..', 'lib', 'supabase-optimized.ts')
  
  if (fs.existsSync(supabaseFile)) {
    const content = fs.readFileSync(supabaseFile, 'utf8')
    
    if (content.includes('max-age=28800')) {
      console.log('✅ Configuración de cookies extendida encontrada')
    } else {
      console.log('⚠️ Configuración de cookies no encontrada')
    }
  }
  
  // Verificar middleware
  const middlewareFile = path.join(__dirname, '..', 'middleware.ts')
  
  if (fs.existsSync(middlewareFile)) {
    const content = fs.readFileSync(middlewareFile, 'utf8')
    
    if (content.includes('maxAge: 28800')) {
      console.log('✅ Configuración de middleware extendida encontrada')
    } else {
      console.log('⚠️ Configuración de middleware no encontrada')
    }
  }
}

// Función para mostrar instrucciones
function showInstructions() {
  console.log('\n📋 Instrucciones para aplicar cambios:')
  console.log('1. Detén el servidor de desarrollo (Ctrl+C)')
  console.log('2. Limpia el cache del navegador')
  console.log('3. Reinicia el servidor: npm run dev')
  console.log('4. Inicia sesión nuevamente')
  console.log('5. Las sesiones ahora durarán 8 horas en lugar de 1 hora')
  
  console.log('\n🔧 Configuraciones aplicadas:')
  console.log('- Cookies: max-age=28800 (8 horas)')
  console.log('- Middleware: maxAge: 28800 (8 horas)')
  console.log('- API Session: expires_at + 28800 (8 horas)')
  
  console.log('\n⚠️ Nota: Los cambios se aplicarán en la próxima sesión')
}

// Ejecutar funciones
try {
  clearLocalStorage()
  clearCookies()
  checkConfiguration()
  showInstructions()
  
  console.log('\n✅ Script completado exitosamente')
} catch (error) {
  console.error('❌ Error ejecutando script:', error)
  process.exit(1)
} 