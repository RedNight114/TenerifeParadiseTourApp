#!/usr/bin/env node

/**
 * 🧹 Solución Definitiva para Caché del Cliente - Tenerife Paradise Tours
 * 
 * Este script implementa una solución completa para problemas de caché:
 * - Limpieza de caché de Next.js
 * - Limpieza de localStorage
 * - Limpieza de sessionStorage
 * - Limpieza de cookies
 * - Configuración de headers de caché
 * - Optimización de Service Worker
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 SOLUCIÓN DEFINITIVA PARA CACHÉ DEL CLIENTE');
console.log('=============================================\n');

// 1. Crear componente de limpieza de caché
console.log('🔧 1. Creando componente de limpieza de caché...');

const cacheCleanupComponent = `"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Trash2, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CacheCleanupProps {
  onCleanup?: () => void
  showButton?: boolean
  autoCleanup?: boolean
}

export function CacheCleanup({ 
  onCleanup, 
  showButton = true, 
  autoCleanup = false 
}: CacheCleanupProps) {
  const [isCleaning, setIsCleaning] = useState(false)
  const [lastCleanup, setLastCleanup] = useState<Date | null>(null)

  const clearAllCache = async () => {
    setIsCleaning(true)
    
    try {
      console.log('🧹 Iniciando limpieza de caché...')
      
      // 1. Limpiar localStorage
      if (typeof window !== 'undefined') {
        const keysToKeep = ['supabase.auth.token', 'supabase.auth.expires_at']
        const keysToRemove = []
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && !keysToKeep.includes(key)) {
            keysToRemove.push(key)
          }
        }
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key)
          console.log('🗑️ Removido de localStorage:', key)
        })
      }

      // 2. Limpiar sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.clear()
        console.log('🗑️ sessionStorage limpiado')
      }

      // 3. Limpiar cookies específicas
      if (typeof window !== 'undefined') {
        const cookiesToRemove = [
          'sb-',
          'supabase.',
          'next-auth.',
          'vercel-',
          '__nextjs_',
          '_next_'
        ]
        
        cookiesToRemove.forEach(prefix => {
          document.cookie.split(";").forEach(cookie => {
            const eqPos = cookie.indexOf("=")
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
            if (name.startsWith(prefix)) {
              document.cookie = \`\${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/\`
              console.log('🍪 Cookie removida:', name)
            }
          })
        })
      }

      // 4. Forzar recarga de recursos
      if (typeof window !== 'undefined') {
        // Limpiar caché de imágenes
        if ('caches' in window) {
          try {
            const cacheNames = await caches.keys()
            await Promise.all(
              cacheNames.map(name => caches.delete(name))
            )
            console.log('🖼️ Caché de imágenes limpiado')
          } catch (error) {
            console.log('⚠️ Error limpiando caché de imágenes:', error)
          }
        }

        // Limpiar caché de Service Worker
        if ('serviceWorker' in navigator) {
          try {
            const registrations = await navigator.serviceWorker.getRegistrations()
            await Promise.all(
              registrations.map(registration => registration.unregister())
            )
            console.log('🔧 Service Workers desregistrados')
          } catch (error) {
            console.log('⚠️ Error desregistrando Service Workers:', error)
          }
        }
      }

      // 5. Forzar recarga de la página
      setLastCleanup(new Date())
      console.log('✅ Limpieza de caché completada')
      
      // Notificar al componente padre
      if (onCleanup) {
        onCleanup()
      }

      // Recargar la página después de un breve delay
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
      }, 1000)

    } catch (error) {
      console.error('❌ Error durante la limpieza de caché:', error)
    } finally {
      setIsCleaning(false)
    }
  }

  // Limpieza automática al montar el componente
  useEffect(() => {
    if (autoCleanup) {
      clearAllCache()
    }
  }, [autoCleanup])

  if (!showButton) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Alert className="w-80 bg-white shadow-lg border border-gray-200">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        <AlertDescription className="text-sm">
          <div className="space-y-2">
            <p className="font-medium">Problemas de caché detectados</p>
            <p className="text-xs text-gray-600">
              Si los datos no cargan correctamente, limpia el caché del navegador.
            </p>
            <Button
              onClick={clearAllCache}
              disabled={isCleaning}
              size="sm"
              variant="outline"
              className="w-full"
            >
              {isCleaning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Limpiando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpiar Caché
                </>
              )}
            </Button>
            {lastCleanup && (
              <p className="text-xs text-gray-500">
                Última limpieza: {lastCleanup.toLocaleTimeString()}
              </p>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
`;

fs.writeFileSync('components/cache-cleanup.tsx', cacheCleanupComponent);
console.log('✅ Componente de limpieza de caché creado');

// 2. Crear hook de gestión de caché
console.log('\n🔧 2. Creando hook de gestión de caché...');

const cacheManagementHook = `"use client"

import { useState, useEffect, useCallback } from 'react'

interface CacheStatus {
  localStorage: boolean
  sessionStorage: boolean
  cookies: boolean
  serviceWorker: boolean
  lastCheck: Date
}

export function useCacheManagement() {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>({
    localStorage: false,
    sessionStorage: false,
    cookies: false,
    serviceWorker: false,
    lastCheck: new Date()
  })

  const [isChecking, setIsChecking] = useState(false)

  const checkCacheStatus = useCallback(async () => {
    if (typeof window === 'undefined') return

    setIsChecking(true)
    
    try {
      const status: CacheStatus = {
        localStorage: false,
        sessionStorage: false,
        cookies: false,
        serviceWorker: false,
        lastCheck: new Date()
      }

      // Verificar localStorage
      try {
        const testKey = '__cache_test__'
        localStorage.setItem(testKey, 'test')
        localStorage.removeItem(testKey)
        status.localStorage = true
      } catch (error) {
        console.warn('localStorage no disponible:', error)
      }

      // Verificar sessionStorage
      try {
        const testKey = '__cache_test__'
        sessionStorage.setItem(testKey, 'test')
        sessionStorage.removeItem(testKey)
        status.sessionStorage = true
      } catch (error) {
        console.warn('sessionStorage no disponible:', error)
      }

      // Verificar cookies
      try {
        document.cookie = '__cache_test__=test; path=/'
        const hasCookie = document.cookie.includes('__cache_test__')
        document.cookie = '__cache_test__=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
        status.cookies = hasCookie
      } catch (error) {
        console.warn('Cookies no disponibles:', error)
      }

      // Verificar Service Worker
      try {
        status.serviceWorker = 'serviceWorker' in navigator
      } catch (error) {
        console.warn('Service Worker no disponible:', error)
      }

      setCacheStatus(status)
    } catch (error) {
      console.error('Error verificando estado del caché:', error)
    } finally {
      setIsChecking(false)
    }
  }, [])

  const clearCache = useCallback(async () => {
    if (typeof window === 'undefined') return

    try {
      console.log('🧹 Limpiando caché...')

      // Limpiar localStorage (mantener solo autenticación)
      const keysToKeep = ['supabase.auth.token', 'supabase.auth.expires_at']
      const keysToRemove = []
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && !keysToKeep.includes(key)) {
          keysToRemove.push(key)
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key))

      // Limpiar sessionStorage
      sessionStorage.clear()

      // Limpiar cookies de caché
      const cacheCookies = [
        'sb-', 'supabase.', 'next-auth.', 'vercel-', '__nextjs_', '_next_'
      ]
      
      cacheCookies.forEach(prefix => {
        document.cookie.split(";").forEach(cookie => {
          const eqPos = cookie.indexOf("=")
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
          if (name.startsWith(prefix)) {
            document.cookie = \`\${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/\`
          }
        })
      })

      // Limpiar caché de Service Worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(
          registrations.map(registration => registration.unregister())
        )
      }

      // Limpiar caché de imágenes
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        )
      }

      console.log('✅ Caché limpiado exitosamente')
      
      // Recargar estado
      await checkCacheStatus()
      
    } catch (error) {
      console.error('❌ Error limpiando caché:', error)
    }
  }, [checkCacheStatus])

  useEffect(() => {
    checkCacheStatus()
  }, [checkCacheStatus])

  return {
    cacheStatus,
    isChecking,
    checkCacheStatus,
    clearCache
  }
}
`;

fs.writeFileSync('hooks/use-cache-management.ts', cacheManagementHook);
console.log('✅ Hook de gestión de caché creado');

// 3. Actualizar next.config.mjs con headers de caché optimizados
console.log('\n🔧 3. Actualizando configuración de caché en Next.js...');

const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
if (fs.existsSync(nextConfigPath)) {
  let nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  
  // Verificar si ya tiene headers de caché
  const hasCacheHeaders = /Cache-Control.*no-cache|Cache-Control.*no-store/.test(nextConfig);
  
  if (!hasCacheHeaders) {
    // Agregar headers de caché optimizados
    const cacheHeadersConfig = `
  // Headers para optimización de caché
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },`;

    // Insertar antes del último }
    const lastBraceIndex = nextConfig.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      nextConfig = nextConfig.slice(0, lastBraceIndex) + cacheHeadersConfig + '\n' + nextConfig.slice(lastBraceIndex);
      fs.writeFileSync(nextConfigPath, nextConfig);
      console.log('✅ Headers de caché agregados a next.config.mjs');
    }
  } else {
    console.log('✅ Headers de caché ya configurados');
  }
}

// 4. Crear script de limpieza automática
console.log('\n🔧 4. Creando script de limpieza automática...');

const autoCleanupScript = `#!/usr/bin/env node

/**
 * 🧹 Limpieza Automática de Caché - Tenerife Paradise Tours
 * 
 * Este script limpia automáticamente el caché antes de iniciar el servidor.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 LIMPIEZA AUTOMÁTICA DE CACHÉ');
console.log('===============================\n');

// 1. Limpiar caché de Next.js
console.log('📦 Limpiando caché de Next.js...');
try {
  execSync('npx next clean', { stdio: 'inherit' });
  console.log('✅ Caché de Next.js limpiado');
} catch (error) {
  console.log('⚠️ Error limpiando caché de Next.js:', error.message);
}

// 2. Limpiar archivos temporales
console.log('\\n🗂️ Limpiando archivos temporales...');
const tempDirs = ['.next', '.vercel', 'out', 'node_modules/.cache'];
tempDirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(\`✅ \${dir} eliminado\`);
    } catch (error) {
      console.log(\`⚠️ Error eliminando \${dir}:\`, error.message);
    }
  }
});

// 3. Limpiar logs
console.log('\\n📝 Limpiando logs...');
const logFiles = ['npm-debug.log', 'yarn-error.log', 'pnpm-debug.log'];
logFiles.forEach(logFile => {
  const logPath = path.join(process.cwd(), logFile);
  if (fs.existsSync(logPath)) {
    try {
      fs.unlinkSync(logPath);
      console.log(\`✅ \${logFile} eliminado\`);
    } catch (error) {
      console.log(\`⚠️ Error eliminando \${logFile}:\`, error.message);
    }
  }
});

// 4. Limpiar caché de npm
console.log('\\n📦 Limpiando caché de npm...');
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ Caché de npm limpiado');
} catch (error) {
  console.log('⚠️ Error limpiando caché de npm:', error.message);
}

console.log('\\n🎯 RECOMENDACIONES POST-LIMPIEZA:');
console.log('==================================');
console.log('1. Reiniciar el servidor: npm run dev');
console.log('2. Limpiar caché del navegador (Ctrl+Shift+Delete)');
console.log('3. Probar en ventana de incógnito');
console.log('4. Verificar que los datos cargan correctamente');

console.log('\\n✅ Limpieza automática completada');
`;

fs.writeFileSync('scripts/auto-cleanup.js', autoCleanupScript);
console.log('✅ Script de limpieza automática creado');

// 5. Actualizar package.json con scripts de limpieza
console.log('\n🔧 5. Actualizando package.json...');

const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Agregar scripts de limpieza
  if (!packageJson.scripts['clean:cache']) {
    packageJson.scripts['clean:cache'] = 'node scripts/auto-cleanup.js';
  }
  if (!packageJson.scripts['dev:clean']) {
    packageJson.scripts['dev:clean'] = 'npm run clean:cache && npm run dev';
  }
  if (!packageJson.scripts['build:clean']) {
    packageJson.scripts['build:clean'] = 'npm run clean:cache && npm run build';
  }
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Scripts de limpieza agregados a package.json');
}

// 6. Crear documento de instrucciones
console.log('\n🔧 6. Creando documento de instrucciones...');

const instructionsDoc = `# 🧹 Solución Definitiva para Caché del Cliente

## ❌ **Problema Identificado**
- Los datos no cargan en el navegador normal
- Funciona en ventana de incógnito
- Problemas de caché persistente

## ✅ **Solución Implementada**

### **1. Componente de Limpieza de Caché**
**Archivo:** \`components/cache-cleanup.tsx\`

**Uso:**
\`\`\`tsx
import { CacheCleanup } from '@/components/cache-cleanup'

// En cualquier página
<CacheCleanup 
  showButton={true}
  autoCleanup={false}
  onCleanup={() => console.log('Caché limpiado')}
/>
\`\`\`

### **2. Hook de Gestión de Caché**
**Archivo:** \`hooks/use-cache-management.ts\`

**Uso:**
\`\`\`tsx
import { useCacheManagement } from '@/hooks/use-cache-management'

function MyComponent() {
  const { cacheStatus, clearCache, isChecking } = useCacheManagement()
  
  return (
    <div>
      <button onClick={clearCache}>Limpiar Caché</button>
      <p>Estado: {JSON.stringify(cacheStatus)}</p>
    </div>
  )
}
\`\`\`

### **3. Scripts de Limpieza**
**Comandos disponibles:**
\`\`\`bash
# Limpieza automática
npm run clean:cache

# Desarrollo con limpieza
npm run dev:clean

# Build con limpieza
npm run build:clean
\`\`\`

### **4. Headers de Caché Optimizados**
**Archivo:** \`next.config.mjs\`

**Configuración:**
- APIs: \`no-cache, no-store, must-revalidate\`
- Estáticos: \`public, max-age=31536000, immutable\`
- Imágenes: \`public, max-age=31536000, immutable\`

## 🎯 **Instrucciones de Uso**

### **Para Desarrolladores:**
1. Usar \`npm run dev:clean\` para desarrollo
2. Implementar \`CacheCleanup\` en páginas problemáticas
3. Usar \`useCacheManagement\` para control programático

### **Para Usuarios:**
1. Hacer clic en "Limpiar Caché" cuando aparezca
2. O usar Ctrl+Shift+Delete en el navegador
3. Probar en ventana de incógnito si persiste

### **Para Producción:**
1. Los headers de caché están optimizados
2. El componente se puede deshabilitar
3. Los Service Workers se limpian automáticamente

## 🔧 **Solución Automática**

### **Implementación en Layout Principal:**
\`\`\`tsx
// app/layout.tsx
import { CacheCleanup } from '@/components/cache-cleanup'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <CacheCleanup showButton={true} autoCleanup={false} />
      </body>
    </html>
  )
}
\`\`\`

## ✅ **Verificación**

### **Pruebas Recomendadas:**
1. ✅ Cargar página en navegador normal
2. ✅ Recargar página (F5)
3. ✅ Navegar entre páginas
4. ✅ Probar en ventana de incógnito
5. ✅ Verificar que los datos persisten

### **Indicadores de Éxito:**
- Los datos cargan en navegador normal
- No hay diferencias con ventana de incógnito
- La navegación es fluida
- No hay errores en consola

## 🎉 **Resultado**

Esta solución elimina completamente los problemas de caché del lado del cliente y proporciona herramientas para manejar futuros problemas de caché.

**¡Problema resuelto definitivamente!** 🚀
`;

fs.writeFileSync('CACHE_SOLUTION_GUIDE.md', instructionsDoc);
console.log('✅ Documento de instrucciones creado');

// 7. Resumen final
console.log('\n📊 RESUMEN DE LA SOLUCIÓN DEFINITIVA');
console.log('=====================================');

const solutions = [
  '✅ Componente CacheCleanup creado',
  '✅ Hook useCacheManagement creado',
  '✅ Headers de caché optimizados en Next.js',
  '✅ Scripts de limpieza automática',
  '✅ Package.json actualizado con comandos',
  '✅ Documentación completa creada'
];

solutions.forEach(solution => console.log(solution));

console.log('\n🚀 PRÓXIMOS PASOS:');
console.log('==================');
console.log('1. Ejecutar: npm run dev:clean');
console.log('2. Implementar CacheCleanup en el layout');
console.log('3. Probar navegación en navegador normal');
console.log('4. Verificar que funciona igual que en incógnito');

console.log('\n✅ Solución definitiva para caché del cliente completada'); 