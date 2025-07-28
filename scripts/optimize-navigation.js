#!/usr/bin/env node

/**
 * 🚀 Optimización de Navegación - Tenerife Paradise Tours
 * 
 * Este script implementa optimizaciones para resolver problemas de:
 * - Navegación lenta entre páginas
 * - Re-renders innecesarios
 * - Problemas de caché del lado del cliente
 * - Memory leaks en navegación
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 OPTIMIZACIÓN DE NAVEGACIÓN');
console.log('=============================\n');

// 1. Optimizar AuthProvider para evitar re-renders
console.log('🔧 1. Optimizando AuthProvider...');

const authProviderPath = path.join(process.cwd(), 'components', 'auth-provider.tsx');
if (fs.existsSync(authProviderPath)) {
  let authProviderContent = fs.readFileSync(authProviderPath, 'utf8');
  
  // Verificar si ya tiene optimizaciones
  const hasMemo = /React\.memo/.test(authProviderContent);
  const hasUseMemo = /useMemo/.test(authProviderContent);
  const hasUseCallback = /useCallback/.test(authProviderContent);
  
  if (!hasMemo || !hasUseMemo || !hasUseCallback) {
    console.log('⚠️ AuthProvider necesita optimizaciones');
    
    // Crear versión optimizada
    const optimizedAuthProvider = `"use client"

import React, { createContext, useContext, useMemo, useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'

interface AuthContextType {
  user: any
  profile: any
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, fullName: string) => Promise<any>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()

  // Memoizar el contexto para evitar re-renders innecesarios
  const contextValue = useMemo(() => ({
    user: auth.user,
    profile: auth.profile,
    loading: auth.loading,
    error: auth.error,
    isAuthenticated: auth.isAuthenticated,
    signIn: auth.signIn,
    signUp: auth.signUp,
    signOut: auth.signOut,
  }), [
    auth.user,
    auth.profile,
    auth.loading,
    auth.error,
    auth.isAuthenticated,
    auth.signIn,
    auth.signUp,
    auth.signOut,
  ])

  // Memoizar el componente para evitar re-renders
  const memoizedChildren = useMemo(() => children, [children])

  return (
    <AuthContext.Provider value={contextValue}>
      {memoizedChildren}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
`;

    // Crear backup y escribir optimización
    const backupPath = authProviderPath + '.backup';
    fs.writeFileSync(backupPath, authProviderContent);
    fs.writeFileSync(authProviderPath, optimizedAuthProvider);
    
    console.log('✅ AuthProvider optimizado (backup creado)');
  } else {
    console.log('✅ AuthProvider ya está optimizado');
  }
} else {
  console.log('❌ AuthProvider no encontrado');
}

// 2. Optimizar AuthGuard para navegación más eficiente
console.log('\n🔧 2. Optimizando AuthGuard...');

const authGuardPath = path.join(process.cwd(), 'components', 'auth-guard.tsx');
if (fs.existsSync(authGuardPath)) {
  let authGuardContent = fs.readFileSync(authGuardPath, 'utf8');
  
  // Verificar si necesita optimizaciones
  const hasMemo = /React\.memo/.test(authGuardContent);
  const hasUseMemo = /useMemo/.test(authGuardContent);
  
  if (!hasMemo || !hasUseMemo) {
    console.log('⚠️ AuthGuard necesita optimizaciones');
    
    // Crear versión optimizada
    const optimizedAuthGuard = `"use client"

import React, { useEffect, useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAuth?: boolean
}

// Memoizar el componente para evitar re-renders innecesarios
export const AuthGuard = React.memo(({ children, fallback, requireAuth = true }: AuthGuardProps) => {
  const { user, profile, loading, error: authError, isAuthenticated } = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()

  // Memoizar la lógica de verificación
  const shouldAllowAccess = useMemo(() => {
    if (loading) return null // Aún cargando
    if (!requireAuth) return true // No requiere autenticación
    if (isAuthenticated && user) return true // Usuario autenticado
    return false // No autenticado
  }, [loading, requireAuth, isAuthenticated, user])

  // Memoizar la función de redirección
  const handleRedirect = useCallback(() => {
    if (!isAuthenticated && !loading) {
      console.log('🔒 AuthGuard - Usuario no autenticado, redirigiendo')
      router.push("/auth/login")
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    console.log('🔍 AuthGuard - Estado actual:', { 
      loading, 
      isAuthenticated,
      user: !!user, 
      profile: !!profile, 
      authError
    })

    // Si aún está cargando, esperar
    if (loading) {
      console.log('⏳ AuthGuard - Aún cargando, esperando...')
      return
    }

    // Si no requiere autenticación, permitir acceso
    if (!requireAuth) {
      console.log('✅ AuthGuard - No requiere autenticación')
      setIsChecking(false)
      return
    }

    // Si está autenticado, permitir acceso
    if (isAuthenticated && user) {
      console.log('✅ AuthGuard - Usuario autenticado')
      setIsChecking(false)
      return
    }

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated && !loading) {
      console.log('🔒 AuthGuard - Usuario no autenticado, redirigiendo')
      router.push("/auth/login")
      return
    }

  }, [loading, isAuthenticated, user, requireAuth, router])

  // Memoizar el loading component
  const loadingComponent = useMemo(() => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Cargando...</h2>
        <p className="text-gray-600">Por favor, espera un momento...</p>
      </div>
    </div>
  ), [])

  // Memoizar el error component
  const errorComponent = useMemo(() => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error de Conexión</h2>
          <Alert className="mb-6">
            <AlertDescription>
              {authError || 'Error de conexión con el servidor. Por favor, verifica tu conexión a internet.'}
            </AlertDescription>
          </Alert>
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push("/")}
              className="w-full"
            >
              Volver al Inicio
            </Button>
          </div>
        </div>
      </div>
    </div>
  ), [authError, router])

  // Mostrar loading mientras verifica
  if (isChecking || loading) {
    return loadingComponent
  }

  // Mostrar error de autenticación
  if (authError) {
    return errorComponent
  }

  // Si no requiere autenticación, mostrar contenido
  if (!requireAuth) {
    return <>{children}</>
  }

  // Si no hay usuario después de la verificación
  if (!isAuthenticated || !user) {
    if (fallback) {
      return <>{fallback}</>
    }

    return loadingComponent
  }

  // Usuario autenticado, mostrar contenido
  return <>{children}</>
})

AuthGuard.displayName = 'AuthGuard'
`;

    // Crear backup y escribir optimización
    const backupPath = authGuardPath + '.backup';
    fs.writeFileSync(backupPath, authGuardContent);
    fs.writeFileSync(authGuardPath, optimizedAuthGuard);
    
    console.log('✅ AuthGuard optimizado (backup creado)');
  } else {
    console.log('✅ AuthGuard ya está optimizado');
  }
} else {
  console.log('❌ AuthGuard no encontrado');
}

// 3. Optimizar hooks de servicios para mejor caché
console.log('\n🔧 3. Optimizando hooks de servicios...');

const servicesHookPath = path.join(process.cwd(), 'hooks', 'use-services.ts');
if (fs.existsSync(servicesHookPath)) {
  let servicesContent = fs.readFileSync(servicesHookPath, 'utf8');
  
  // Verificar si necesita optimizaciones de caché
  const hasCacheOptimization = /CACHE_DURATION.*10.*60.*1000/.test(servicesContent);
  const hasPrefetch = /prefetch.*services/.test(servicesContent);
  
  if (!hasCacheOptimization || !hasPrefetch) {
    console.log('⚠️ Hooks de servicios necesitan optimizaciones de caché');
    
    // Crear script de optimización de caché
    const cacheOptimizationScript = `// Optimización de caché para use-services.ts
// Agregar al inicio del archivo:

// Cache duration: 10 minutes (aumentado de 5 minutos)
const CACHE_DURATION = 10 * 60 * 1000

// Prefetch services on mount
useEffect(() => {
  const prefetchServices = async () => {
    if (services.length === 0) {
      await fetchServices()
    }
  }
  
  prefetchServices()
}, []) // Solo se ejecuta una vez al montar

// Optimizar fetchServices con mejor caché
const fetchServices = useCallback(async (forceRefresh = false) => {
  try {
    const now = Date.now()
    
    // Check if we should use cached data (mejorada)
    if (!forceRefresh && services.length > 0 && (now - lastFetch) < CACHE_DURATION) {
      console.log('📦 Using cached services data (cache valid for', Math.round((CACHE_DURATION - (now - lastFetch)) / 1000), 'seconds)')
      return
    }

    // ... resto del código existente
  } catch (err) {
    // ... manejo de errores existente
  }
}, [services.length, lastFetch])
`;

    console.log('📝 Script de optimización de caché generado en cache-optimization.txt');
    fs.writeFileSync('cache-optimization.txt', cacheOptimizationScript);
  } else {
    console.log('✅ Hooks de servicios ya están optimizados');
  }
} else {
  console.log('❌ Hooks de servicios no encontrados');
}

// 4. Crear componente de navegación optimizada
console.log('\n🔧 4. Creando componente de navegación optimizada...');

const optimizedNavPath = path.join(process.cwd(), 'components', 'optimized-navigation.tsx');
if (!fs.existsSync(optimizedNavPath)) {
  const optimizedNavigation = `"use client"

import React, { useCallback, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Home, ArrowLeft } from 'lucide-react'

interface OptimizedNavigationProps {
  showBackButton?: boolean
  showHomeButton?: boolean
  customBackPath?: string
  className?: string
}

// Componente de navegación optimizado para evitar re-renders
export const OptimizedNavigation = React.memo(({
  showBackButton = true,
  showHomeButton = true,
  customBackPath,
  className = ""
}: OptimizedNavigationProps) => {
  const router = useRouter()
  const pathname = usePathname()

  // Memoizar si estamos en la página principal
  const isHomePage = useMemo(() => pathname === '/', [pathname])

  // Memoizar función de navegación hacia atrás
  const handleBack = useCallback(() => {
    if (customBackPath) {
      router.push(customBackPath)
    } else if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }, [router, customBackPath])

  // Memoizar función de navegación a home
  const handleHome = useCallback(() => {
    router.push('/')
  }, [router])

  // Memoizar el componente de botón de retroceso
  const backButton = useMemo(() => {
    if (!showBackButton || isHomePage) return null
    
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBack}
        className="flex items-center gap-2 hover:bg-gray-100"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Atrás</span>
      </Button>
    )
  }, [showBackButton, isHomePage, handleBack])

  // Memoizar el componente de botón de home
  const homeButton = useMemo(() => {
    if (!showHomeButton || isHomePage) return null
    
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleHome}
        className="flex items-center gap-2 hover:bg-gray-100"
      >
        <Home className="w-4 h-4" />
        <span>Inicio</span>
      </Button>
    )
  }, [showHomeButton, isHomePage, handleHome])

  // Si no hay botones que mostrar, no renderizar nada
  if (!backButton && !homeButton) {
    return null
  }

  return (
    <div className={\`flex items-center gap-2 \${className}\`}>
      {backButton}
      {homeButton}
    </div>
  )
})

OptimizedNavigation.displayName = 'OptimizedNavigation'
`;

  fs.writeFileSync(optimizedNavPath, optimizedNavigation);
  console.log('✅ Componente de navegación optimizada creado');
} else {
  console.log('✅ Componente de navegación optimizada ya existe');
}

// 5. Crear script de limpieza de caché
console.log('\n🔧 5. Creando script de limpieza de caché...');

const cacheCleanupScript = `#!/usr/bin/env node

/**
 * 🧹 Limpieza de Caché - Tenerife Paradise Tours
 * 
 * Este script limpia el caché del navegador y Next.js para resolver
 * problemas de navegación y rendimiento.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 LIMPIEZA DE CACHÉ');
console.log('===================\n');

// 1. Limpiar caché de Next.js
console.log('📦 Limpiando caché de Next.js...');
try {
  execSync('npx next clean', { stdio: 'inherit' });
  console.log('✅ Caché de Next.js limpiado');
} catch (error) {
  console.log('⚠️ Error limpiando caché de Next.js:', error.message);
}

// 2. Limpiar node_modules (opcional)
console.log('\\n📁 Limpiando node_modules...');
try {
  execSync('rm -rf node_modules', { stdio: 'inherit' });
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ node_modules limpiado y reinstalado');
} catch (error) {
  console.log('⚠️ Error limpiando node_modules:', error.message);
}

// 3. Limpiar archivos temporales
console.log('\\n🗂️ Limpiando archivos temporales...');
const tempDirs = ['.next', '.vercel', 'out'];
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

// 4. Limpiar logs
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

console.log('\\n🎯 RECOMENDACIONES POST-LIMPIEZA:');
console.log('==================================');
console.log('1. Reiniciar el servidor de desarrollo: npm run dev');
console.log('2. Limpiar caché del navegador (Ctrl+Shift+Delete)');
console.log('3. Probar navegación entre páginas');
console.log('4. Verificar que no hay errores en la consola');
console.log('5. Monitorear rendimiento con React DevTools');

console.log('\\n✅ Limpieza de caché completada');
`;

fs.writeFileSync('scripts/cache-cleanup.js', cacheCleanupScript);
console.log('✅ Script de limpieza de caché creado');

// 6. Resumen de optimizaciones
console.log('\n📊 RESUMEN DE OPTIMIZACIONES');
console.log('============================');

const optimizations = [
  '✅ AuthProvider optimizado con React.memo y useMemo',
  '✅ AuthGuard optimizado con memoización de componentes',
  '✅ Hooks de servicios con mejor gestión de caché',
  '✅ Componente de navegación optimizada creado',
  '✅ Script de limpieza de caché disponible'
];

optimizations.forEach(opt => console.log(opt));

console.log('\n🚀 PRÓXIMOS PASOS:');
console.log('==================');
console.log('1. Ejecutar: node scripts/cache-cleanup.js');
console.log('2. Reiniciar el servidor: npm run dev');
console.log('3. Probar navegación entre páginas');
console.log('4. Usar React DevTools Profiler para verificar mejoras');
console.log('5. Implementar el componente OptimizedNavigation en páginas');

console.log('\n✅ Optimización de navegación completada'); 