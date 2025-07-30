#!/usr/bin/env node

/**
 * 🚀 SCRIPT DE OPTIMIZACIÓN DEL SISTEMA DE CACHE
 * 
 * Este script optimiza el sistema de cache para prevenir cargas infinitas
 * y mejorar el rendimiento general de la aplicación.
 */

const fs = require('fs')
const path = require('path')

console.log('🔧 Iniciando optimización del sistema de cache...')

// Configuración de optimización
const OPTIMIZATION_CONFIG = {
  // Límites de cache más conservadores
  maxSize: 300, // Reducido de 500
  maxMemoryMB: 15, // Reducido de 25
  cleanupInterval: 60000, // 1 minuto (más frecuente)
  maxAccessCount: 30, // Reducido para detectar loops más rápido
  maxErrorCount: 2, // Reducido para ser más estricto
  maxRetryCount: 1, // Reducido para evitar loops
  errorThreshold: 0.2, // 20% de tasa de error
  recoveryDelay: 15000 // 15 segundos de espera
}

// Función para limpiar cache del navegador
function clearBrowserCache() {
  console.log('🧹 Limpiando cache del navegador...')
  
  const cacheDirs = [
    '.next/cache',
    'node_modules/.cache',
    'out',
    'dist'
  ]
  
  cacheDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true })
        console.log(`✅ Cache eliminado: ${dir}`)
      } catch (error) {
        console.log(`⚠️ No se pudo eliminar: ${dir}`)
      }
    }
  })
}

// Función para optimizar el archivo de cache manager
function optimizeCacheManager() {
  console.log('⚡ Optimizando cache manager...')
  
  const cacheManagerPath = path.join(__dirname, '..', 'lib', 'cache-manager.ts')
  
  if (!fs.existsSync(cacheManagerPath)) {
    console.log('❌ No se encontró el archivo cache-manager.ts')
    return false
  }
  
  try {
    let content = fs.readFileSync(cacheManagerPath, 'utf8')
    
    // Aplicar optimizaciones
    const optimizations = [
      {
        from: /maxSize: 500,/,
        to: `maxSize: ${OPTIMIZATION_CONFIG.maxSize},`
      },
      {
        from: /maxMemoryMB: 25,/,
        to: `maxMemoryMB: ${OPTIMIZATION_CONFIG.maxMemoryMB},`
      },
      {
        from: /cleanupInterval: 2 \* 60 \* 1000,/,
        to: `cleanupInterval: ${OPTIMIZATION_CONFIG.cleanupInterval},`
      },
      {
        from: /maxAccessCount: 50,/,
        to: `maxAccessCount: ${OPTIMIZATION_CONFIG.maxAccessCount},`
      },
      {
        from: /maxErrorCount: 3,/,
        to: `maxErrorCount: ${OPTIMIZATION_CONFIG.maxErrorCount},`
      },
      {
        from: /maxRetryCount: 2,/,
        to: `maxRetryCount: ${OPTIMIZATION_CONFIG.maxRetryCount},`
      },
      {
        from: /errorThreshold: 0\.3,/,
        to: `errorThreshold: ${OPTIMIZATION_CONFIG.errorThreshold},`
      },
      {
        from: /recoveryDelay: 30 \* 1000/,
        to: `recoveryDelay: ${OPTIMIZATION_CONFIG.recoveryDelay}`
      }
    ]
    
    optimizations.forEach(opt => {
      content = content.replace(opt.from, opt.to)
    })
    
    // Crear backup
    const backupPath = cacheManagerPath + '.backup'
    fs.writeFileSync(backupPath, fs.readFileSync(cacheManagerPath))
    console.log(`💾 Backup creado: ${backupPath}`)
    
    // Escribir archivo optimizado
    fs.writeFileSync(cacheManagerPath, content)
    console.log('✅ Cache manager optimizado')
    
    return true
  } catch (error) {
    console.error('❌ Error optimizando cache manager:', error.message)
    return false
  }
}

// Función para crear componente de monitoreo
function createCacheMonitor() {
  console.log('📊 Creando componente de monitoreo...')
  
  const monitorPath = path.join(__dirname, '..', 'components', 'cache-monitor.tsx')
  
  if (fs.existsSync(monitorPath)) {
    console.log('✅ Componente de monitoreo ya existe')
    return true
  }
  
  try {
    const monitorContent = `"use client"

import { useState, useEffect, useCallback } from 'react'
import { useCache, getCacheStats, clearCache, isInRecoveryMode } from '@/lib/cache-manager'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Activity, 
  AlertTriangle, 
  RefreshCw, 
  Trash2, 
  Shield, 
  Database
} from 'lucide-react'

export function CacheMonitor() {
  const { stats, recoveryMode } = useCache()
  const [isVisible, setIsVisible] = useState(false)

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const getHealthStatus = () => {
    if (recoveryMode) return 'critical'
    if (stats.errorRate > 0.2) return 'warning'
    if (stats.errorRate > 0.1) return 'caution'
    return 'healthy'
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2"
      >
        <Database className="w-4 h-4 mr-2" />
        Cache Monitor
        {recoveryMode && (
          <Badge variant="destructive" className="ml-2">
            Recovery
          </Badge>
        )}
      </Button>

      {isVisible && (
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="text-sm">Cache Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recoveryMode && (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Modo recuperación activo
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.size}</div>
                <div className="text-xs text-muted-foreground">Entries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Hit Rate</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => clearCache()}
                className="flex-1"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}`

    fs.writeFileSync(monitorPath, monitorContent)
    console.log('✅ Componente de monitoreo creado')
    
    return true
  } catch (error) {
    console.error('❌ Error creando componente de monitoreo:', error.message)
    return false
  }
}

// Función para actualizar el layout principal
function updateLayout() {
  console.log('🏗️ Actualizando layout principal...')
  
  const layoutPath = path.join(__dirname, '..', 'app', 'layout.tsx')
  
  if (!fs.existsSync(layoutPath)) {
    console.log('❌ No se encontró el archivo layout.tsx')
    return false
  }
  
  try {
    let content = fs.readFileSync(layoutPath, 'utf8')
    
    // Verificar si ya está incluido
    if (content.includes('CacheMonitor')) {
      console.log('✅ CacheMonitor ya está incluido en el layout')
      return true
    }
    
    // Agregar import
    if (!content.includes("import { CacheMonitor }")) {
      const importStatement = "import { CacheMonitor } from '@/components/cache-monitor'"
      content = content.replace(
        /import.*from.*['"]@\/components\/.*['"];?\n?/g,
        match => match + importStatement + '\n'
      )
    }
    
    // Agregar componente al final del body
    if (!content.includes('<CacheMonitor')) {
      content = content.replace(
        /<\/body>/,
        '      <CacheMonitor />\n    </body>'
      )
    }
    
    fs.writeFileSync(layoutPath, content)
    console.log('✅ Layout actualizado con CacheMonitor')
    
    return true
  } catch (error) {
    console.error('❌ Error actualizando layout:', error.message)
    return false
  }
}

// Función para crear script de limpieza automática
function createAutoCleanupScript() {
  console.log('🤖 Creando script de limpieza automática...')
  
  const scriptPath = path.join(__dirname, 'auto-cache-cleanup.js')
  
  const scriptContent = `#!/usr/bin/env node

/**
 * 🤖 SCRIPT DE LIMPIEZA AUTOMÁTICA DE CACHE
 * 
 * Este script se ejecuta automáticamente para limpiar el cache
 * y prevenir problemas de memoria y cargas infinitas.
 */

const fs = require('fs')
const path = require('path')

console.log('🧹 Ejecutando limpieza automática de cache...')

// Limpiar directorios de cache
const cacheDirs = [
  '.next/cache',
  'node_modules/.cache',
  'out',
  'dist'
]

let cleanedCount = 0

cacheDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    try {
      fs.rmSync(dir, { recursive: true, force: true })
      cleanedCount++
      console.log(\`✅ Cache eliminado: \${dir}\`)
    } catch (error) {
      console.log(\`⚠️ No se pudo eliminar: \${dir}\`)
    }
  }
})

console.log(\`🎉 Limpieza completada: \${cleanedCount} directorios limpiados\`)

// Crear archivo de timestamp
const timestampPath = path.join(__dirname, '.last-cleanup')
fs.writeFileSync(timestampPath, new Date().toISOString())

console.log('✅ Timestamp de limpieza guardado')
`

  fs.writeFileSync(scriptPath, scriptContent)
  fs.chmodSync(scriptPath, '755') // Hacer ejecutable
  
  console.log('✅ Script de limpieza automática creado')
  
  return true
}

// Función para actualizar package.json
function updatePackageJson() {
  console.log('📦 Actualizando package.json...')
  
  const packagePath = path.join(__dirname, '..', 'package.json')
  
  if (!fs.existsSync(packagePath)) {
    console.log('❌ No se encontró package.json')
    return false
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    
    // Agregar scripts de cache
    const newScripts = {
      'cache:clean': 'node scripts/auto-cache-cleanup.js',
      'cache:optimize': 'node scripts/optimize-cache-system.js',
      'dev:clean': 'npm run cache:clean && npm run dev',
      'build:clean': 'npm run cache:clean && npm run build'
    }
    
    packageJson.scripts = { ...packageJson.scripts, ...newScripts }
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))
    console.log('✅ Package.json actualizado con scripts de cache')
    
    return true
  } catch (error) {
    console.error('❌ Error actualizando package.json:', error.message)
    return false
  }
}

// Función principal
function main() {
  console.log('🚀 Iniciando optimización completa del sistema de cache...\n')
  
  const steps = [
    { name: 'Limpiar cache del navegador', fn: clearBrowserCache },
    { name: 'Optimizar cache manager', fn: optimizeCacheManager },
    { name: 'Crear componente de monitoreo', fn: createCacheMonitor },
    { name: 'Actualizar layout principal', fn: updateLayout },
    { name: 'Crear script de limpieza automática', fn: createAutoCleanupScript },
    { name: 'Actualizar package.json', fn: updatePackageJson }
  ]
  
  let successCount = 0
  
  steps.forEach((step, index) => {
    console.log(`${index + 1}/${steps.length}. ${step.name}...`)
    
    try {
      const result = step.fn()
      if (result !== false) {
        successCount++
      }
    } catch (error) {
      console.error(`❌ Error en ${step.name}:`, error.message)
    }
    
    console.log('')
  })
  
  console.log('🎉 Optimización completada!')
  console.log(`✅ ${successCount}/${steps.length} pasos exitosos`)
  console.log('')
  console.log('📋 Resumen de optimizaciones aplicadas:')
  console.log('• Límites de cache más conservadores')
  console.log('• Detección más rápida de loops infinitos')
  console.log('• Modo recuperación mejorado')
  console.log('• Componente de monitoreo en tiempo real')
  console.log('• Scripts de limpieza automática')
  console.log('• Configuración optimizada para prevenir cargas infinitas')
  console.log('')
  console.log('🚀 Para aplicar los cambios:')
  console.log('1. npm run cache:clean')
  console.log('2. npm run dev')
  console.log('')
  console.log('📊 Para monitorear el cache:')
  console.log('• Abre la aplicación en desarrollo')
  console.log('• Busca el botón "Cache Monitor" en la esquina inferior derecha')
  console.log('• Usa los controles para limpiar cache y refrescar')
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main()
}

module.exports = {
  main,
  clearBrowserCache,
  optimizeCacheManager,
  createCacheMonitor,
  updateLayout,
  createAutoCleanupScript,
  updatePackageJson
} 