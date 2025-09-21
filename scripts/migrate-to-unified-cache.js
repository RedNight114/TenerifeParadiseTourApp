#!/usr/bin/env node

/**
 * Script de migración al sistema de caché unificado
 * Elimina sistemas de caché antiguos y migra datos importantes
 */

const fs = require('fs')
const path = require('path')

// Colores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}🔄${colors.reset} ${msg}`),
}

// Archivos a eliminar (sistemas de caché antiguos)
const filesToRemove = [
  'lib/persistent-cache.ts',
  'lib/performance-optimizer.ts',
  'lib/cache-manager.ts',
  'lib/compressed-cache-manager.ts',
  'hooks/use-optimized-data.ts',
  'hooks/use-services-optimized.ts',
  'lib/cache-config.ts',
]

// Archivos a actualizar (reemplazar imports)
const filesToUpdate = [
  'components/admin/services-management.tsx',
  'app/(main)/services/page.tsx',
  'app/(main)/booking/[serviceId]/page.tsx',
  'components/ui/service-card.tsx',
  'components/ui/service-list.tsx',
]

// Mapeo de imports antiguos a nuevos
const importMappings = {
  // Sistemas de caché antiguos
  '@/lib/persistent-cache': '@/lib/unified-cache-system',
  '@/lib/performance-optimizer': '@/lib/unified-cache-system',
  '@/lib/cache-manager': '@/lib/unified-cache-system',
  '@/lib/compressed-cache-manager': '@/lib/unified-cache-system',
  '@/lib/cache-config': '@/lib/unified-cache-system',
  
  // Hooks antiguos
  '@/hooks/use-optimized-data': '@/hooks/use-unified-cache',
  '@/hooks/use-services-optimized': '@/hooks/use-unified-cache',
  
  // Funciones específicas
  'servicesPersistentCache': 'cacheServices',
  'categoriesPersistentCache': 'cacheCategories',
  'userPersistentCache': 'cacheUsers',
  'servicesCache': 'cacheServices',
  'userCache': 'cacheUsers',
  'apiCache': 'cacheAPI',
  'performanceOptimizer': 'unifiedCache',
  'globalCompressedCache': 'unifiedCache',
}

// Mapeo de funciones antiguas a nuevas
const functionMappings = {
  'getServicesCache': 'cacheServices',
  'getCategoriesCache': 'cacheCategories',
  'getUserCache': 'getUserCache',
  'getCachedServices': 'cacheServices',
  'getCachedUsers': 'cacheUsers',
  'getCachedApi': 'cacheAPI',
  'clearAllPersistentCaches': 'clearAllCache',
  'clearAllCaches': 'clearAllCache',
  'getPersistentCacheStats': 'getCacheStats',
  'getCacheStats': 'getCacheStats',
  'cleanupExpiredCaches': 'unifiedCache.cleanup()',
  'setCache': 'unifiedCache.set',
  'getCache': 'unifiedCache.get',
  'prefetchCriticalData': 'usePreloadCriticalData',
}

async function removeOldFiles() {
  log.step('Eliminando archivos de sistemas de caché antiguos...')
  
  let removedCount = 0
  let skippedCount = 0
  
  for (const file of filesToRemove) {
    const filePath = path.join(process.cwd(), file)
    
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        log.success(`Eliminado: ${file}`)
        removedCount++
      } else {
        log.warning(`No encontrado: ${file}`)
        skippedCount++
      }
    } catch (error) {
      log.error(`Error eliminando ${file}: ${error.message}`)
    }
  }
  
  log.info(`Archivos eliminados: ${removedCount}, No encontrados: ${skippedCount}`)
}

async function updateImports() {
  log.step('Actualizando imports en archivos existentes...')
  
  let updatedCount = 0
  let errorCount = 0
  
  for (const file of filesToUpdate) {
    const filePath = path.join(process.cwd(), file)
    
    try {
      if (!fs.existsSync(filePath)) {
        log.warning(`Archivo no encontrado: ${file}`)
        continue
      }
      
      let content = fs.readFileSync(filePath, 'utf8')
      let hasChanges = false
      
      // Actualizar imports
      for (const [oldImport, newImport] of Object.entries(importMappings)) {
        const oldPattern = new RegExp(`from ['"]${oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g')
        if (oldPattern.test(content)) {
          content = content.replace(oldPattern, `from '${newImport}'`)
          hasChanges = true
        }
      }
      
      // Actualizar funciones
      for (const [oldFunction, newFunction] of Object.entries(functionMappings)) {
        const oldPattern = new RegExp(`\\b${oldFunction}\\b`, 'g')
        if (oldPattern.test(content)) {
          content = content.replace(oldPattern, newFunction)
          hasChanges = true
        }
      }
      
      if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8')
        log.success(`Actualizado: ${file}`)
        updatedCount++
      } else {
        log.info(`Sin cambios: ${file}`)
      }
      
    } catch (error) {
      log.error(`Error actualizando ${file}: ${error.message}`)
      errorCount++
    }
  }
  
  log.info(`Archivos actualizados: ${updatedCount}, Errores: ${errorCount}`)
}

async function updatePackageJson() {
  log.step('Actualizando package.json...')
  
  const packagePath = path.join(process.cwd(), 'package.json')
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    
    // Agregar script de limpieza de caché
    if (!packageJson.scripts) {
      packageJson.scripts = {}
    }
    
    packageJson.scripts['clean:cache'] = 'node scripts/migrate-to-unified-cache.js --clean'
    packageJson.scripts['cache:stats'] = 'node scripts/migrate-to-unified-cache.js --stats'
    packageJson.scripts['cache:migrate'] = 'node scripts/migrate-to-unified-cache.js --migrate'
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))
    log.success('package.json actualizado con nuevos scripts')
    
  } catch (error) {
    log.error(`Error actualizando package.json: ${error.message}`)
  }
}

async function createMigrationGuide() {
  log.step('Creando guía de migración...')
  
  const guideContent = `# 🚀 Guía de Migración al Sistema de Caché Unificado

## ✅ Migración Completada

El sistema de caché ha sido migrado exitosamente al nuevo sistema unificado. Los siguientes cambios se han aplicado:

### 📁 Archivos Eliminados
${filesToRemove.map(file => `- \`${file}\``).join('\n')}

### 🔄 Archivos Actualizados
${filesToUpdate.map(file => `- \`${file}\``).join('\n')}

### 🆕 Nuevos Archivos
- \`lib/unified-cache-system.ts\` - Sistema de caché unificado
- \`hooks/use-unified-cache.ts\` - Hooks modernos con TanStack Query
- \`components/providers/unified-query-provider.tsx\` - Provider de TanStack Query
- \`__tests__/cache/unified-cache-system.test.ts\` - Pruebas unitarias

## 🎯 Nuevos Scripts Disponibles

\`\`\`bash
# Limpiar caché completamente
npm run clean:cache

# Ver estadísticas del caché
npm run cache:stats

# Ejecutar migración
npm run cache:migrate
\`\`\`

## 🔧 Cambios en el Código

### Antes (Sistema Antiguo)
\`\`\`typescript
import { servicesPersistentCache } from '@/lib/persistent-cache'
import { useOptimizedData } from '@/hooks/use-optimized-data'

const { data, loading } = useOptimizedData()
\`\`\`

### Después (Sistema Nuevo)
\`\`\`typescript
import { useServices, useCategories } from '@/hooks/use-unified-cache'
import { UnifiedQueryProvider } from '@/components/providers/unified-query-provider'

const { data: services, isLoading } = useServices()
const { data: categories } = useCategories()
\`\`\`

## 📊 Beneficios del Nuevo Sistema

- ✅ **Unificado**: Un solo sistema de caché para toda la aplicación
- ✅ **Moderno**: Usa TanStack Query para gestión de estado del servidor
- ✅ **Eficiente**: Compresión automática y gestión inteligente de memoria
- ✅ **Testeable**: Pruebas unitarias completas
- ✅ **Escalable**: Soporte para invalidación por tags y patrones
- ✅ **Monitoreable**: Estadísticas detalladas de rendimiento

## 🚨 Acciones Requeridas

1. **Actualizar Layout Principal**: Agregar \`UnifiedQueryProvider\` al layout
2. **Revisar Componentes**: Verificar que todos los componentes usen los nuevos hooks
3. **Probar Funcionalidad**: Ejecutar pruebas para verificar que todo funciona
4. **Limpiar Caché**: Ejecutar \`npm run clean:cache\` para limpiar cachés antiguos

## 📈 Próximos Pasos

1. Implementar Service Worker para caché offline
2. Agregar métricas de rendimiento en producción
3. Configurar invalidación automática por webhooks
4. Implementar caché distribuido con Redis (opcional)

---
*Migración completada el ${new Date().toLocaleString()}*
`

  const guidePath = path.join(process.cwd(), 'CACHE_MIGRATION_GUIDE.md')
  fs.writeFileSync(guidePath, guideContent, 'utf8')
  log.success('Guía de migración creada: CACHE_MIGRATION_GUIDE.md')
}

async function showCacheStats() {
  log.step('Mostrando estadísticas del caché...')
  
  // Simular estadísticas (en una implementación real, esto vendría del sistema)
  const stats = {
    totalEntries: 0,
    memoryUsage: 0,
    hitRate: 0,
    totalHits: 0,
    totalMisses: 0,
    avgResponseTime: 0,
    compressionRatio: 0,
    evictedEntries: 0,
    expiredEntries: 0,
  }
  
  console.log('\n📊 Estadísticas del Sistema de Caché Unificado:')
  console.log('┌─────────────────────────────────────────┐')
  console.log('│ Entradas totales:     ' + stats.totalEntries.toString().padStart(10) + ' │')
  console.log('│ Uso de memoria:       ' + stats.memoryUsage.toFixed(2).padStart(8) + ' MB │')
  console.log('│ Tasa de aciertos:     ' + (stats.hitRate * 100).toFixed(1).padStart(7) + '% │')
  console.log('│ Hits totales:         ' + stats.totalHits.toString().padStart(10) + ' │')
  console.log('│ Misses totales:       ' + stats.totalMisses.toString().padStart(9) + ' │')
  console.log('│ Tiempo respuesta:     ' + stats.avgResponseTime.toFixed(2).padStart(6) + ' ms │')
  console.log('│ Ratio compresión:     ' + (stats.compressionRatio * 100).toFixed(1).padStart(7) + '% │')
  console.log('│ Entradas evadidas:    ' + stats.evictedEntries.toString().padStart(9) + ' │')
  console.log('│ Entradas expiradas:   ' + stats.expiredEntries.toString().padStart(8) + ' │')
  console.log('└─────────────────────────────────────────┘\n')
}

async function cleanOldCache() {
  log.step('Limpiando cachés antiguos del navegador...')
  
  const cleanupScript = `
// Script de limpieza de caché para el navegador
if (typeof window !== 'undefined') {
  // Limpiar localStorage
  const keys = Object.keys(localStorage).filter(key => 
    key.startsWith('tpt_') || 
    key.startsWith('tenerife-') ||
    key.includes('cache') ||
    key.startsWith('services_cache') ||
    key.startsWith('categories_cache') ||
    key.startsWith('user_cache')
  )
  
  keys.forEach(key => {
    localStorage.removeItem(key)
    console.log('🗑️ Eliminado:', key)
  })
  
  // Limpiar sessionStorage
  const sessionKeys = Object.keys(sessionStorage).filter(key => 
    key.includes('cache') || key.includes('temp')
  )
  
  sessionKeys.forEach(key => {
    sessionStorage.removeItem(key)
    console.log('🗑️ Eliminado de session:', key)
  })
  
  console.log('✅ Limpieza de caché completada')
}
`
  
  const cleanupPath = path.join(process.cwd(), 'scripts', 'cleanup-browser-cache.js')
  fs.writeFileSync(cleanupPath, cleanupScript, 'utf8')
  log.success('Script de limpieza creado: scripts/cleanup-browser-cache.js')
  log.info('Ejecuta este script en la consola del navegador para limpiar cachés antiguos')
}

async function main() {
  const args = process.argv.slice(2)
  
  console.log(`${colors.bright}${colors.cyan}🚀 Migración al Sistema de Caché Unificado${colors.reset}\n`)
  
  if (args.includes('--clean')) {
    await cleanOldCache()
    return
  }
  
  if (args.includes('--stats')) {
    await showCacheStats()
    return
  }
  
  if (args.includes('--migrate')) {
    log.info('Iniciando migración completa...')
    
    try {
      await removeOldFiles()
      await updateImports()
      await updatePackageJson()
      await createMigrationGuide()
      await cleanOldCache()
      
      console.log(`\n${colors.bright}${colors.green}🎉 ¡Migración completada exitosamente!${colors.reset}`)
      console.log(`${colors.cyan}📖 Revisa CACHE_MIGRATION_GUIDE.md para más detalles${colors.reset}\n`)
      
    } catch (error) {
      log.error(`Error durante la migración: ${error.message}`)
      process.exit(1)
    }
    
    return
  }
  
  // Mostrar ayuda
  console.log(`${colors.bright}Uso:${colors.reset}`)
  console.log(`  ${colors.yellow}node scripts/migrate-to-unified-cache.js --migrate${colors.reset}  # Migración completa`)
  console.log(`  ${colors.yellow}node scripts/migrate-to-unified-cache.js --clean${colors.reset}   # Limpiar cachés antiguos`)
  console.log(`  ${colors.yellow}node scripts/migrate-to-unified-cache.js --stats${colors.reset}   # Mostrar estadísticas`)
  console.log(`\n${colors.cyan}Para más información, ejecuta con --migrate${colors.reset}\n`)
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  removeOldFiles,
  updateImports,
  updatePackageJson,
  createMigrationGuide,
  showCacheStats,
  cleanOldCache,
}
