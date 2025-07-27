const fs = require('fs');
const path = require('path');

console.log('🚀 IMPLEMENTANDO MEJORAS DE PERFORMANCE');
console.log('========================================\n');

// Función para verificar si un archivo existe
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Función para leer archivo
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// Función para escribir archivo
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Archivo actualizado: ${filePath}`);
}

// Función para crear directorio si no existe
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Directorio creado: ${dirPath}`);
  }
}

// 1. Verificar y crear imagen placeholder
function createPlaceholderImage() {
  console.log('🖼️ Verificando imagen placeholder...');
  
  const placeholderPath = 'public/images/placeholder.jpg';
  const placeholderSvgPath = 'public/images/placeholder.svg';
  
  if (!fileExists(placeholderPath) && !fileExists(placeholderSvgPath)) {
    console.log('⚠️ No se encontró imagen placeholder, creando SVG...');
    
    const svgContent = `<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#F3F4F6"/>
  <rect x="50" y="50" width="300" height="200" fill="#E5E7EB" stroke="#D1D5DB" stroke-width="2"/>
  <circle cx="200" cy="120" r="30" fill="#D1D5DB"/>
  <path d="M150 180 L250 180" stroke="#D1D5DB" stroke-width="2"/>
  <path d="M170 200 L230 200" stroke="#D1D5DB" stroke-width="2"/>
  <text x="200" y="250" text-anchor="middle" fill="#9CA3AF" font-family="Arial, sans-serif" font-size="14">Imagen no disponible</text>
</svg>`;
    
    ensureDir('public/images');
    writeFile(placeholderSvgPath, svgContent);
  } else {
    console.log('✅ Imagen placeholder ya existe');
  }
}

// 2. Optimizar next.config.mjs para performance
function optimizeNextConfig() {
  console.log('⚙️ Optimizando next.config.mjs...');
  
  const configPath = 'next.config.mjs';
  if (!fileExists(configPath)) {
    console.log('❌ next.config.mjs no encontrado');
    return;
  }
  
  let config = readFile(configPath);
  
  // Añadir optimizaciones de performance si no existen
  if (!config.includes('experimental')) {
    const performanceOptimizations = `
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },`;
    
    // Insertar antes del último }
    const lastBraceIndex = config.lastIndexOf('}');
    config = config.slice(0, lastBraceIndex) + performanceOptimizations + '\n' + config.slice(lastBraceIndex);
    
    writeFile(configPath, config);
  } else {
    console.log('✅ next.config.mjs ya optimizado');
  }
}

// 3. Crear hook de performance
function createPerformanceHook() {
  console.log('🎣 Creando hook de performance...');
  
  const hookPath = 'hooks/use-performance.ts';
  if (fileExists(hookPath)) {
    console.log('✅ Hook de performance ya existe');
    return;
  }
  
  const hookContent = `import { useEffect, useRef } from 'react'

export function usePerformance() {
  const startTime = useRef<number>(Date.now())
  
  useEffect(() => {
    const endTime = Date.now()
    const loadTime = endTime - startTime.current
    
    // Log performance metrics
    console.log(\`⚡ Página cargada en \${loadTime}ms\`)
    
    // Send to analytics if needed
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_load_time', {
        value: loadTime,
        custom_parameter: 'load_time_ms'
      })
    }
  }, [])
  
  return {
    startTime: startTime.current,
    getLoadTime: () => Date.now() - startTime.current
  }
}

export function useLazyLoading<T>(items: T[], itemsPerPage: number = 10) {
  const [displayedItems, setDisplayedItems] = useState<T[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  
  useEffect(() => {
    const start = 0
    const end = page * itemsPerPage
    const newItems = items.slice(start, end)
    
    setDisplayedItems(newItems)
    setHasMore(end < items.length)
  }, [items, page, itemsPerPage])
  
  const loadMore = () => {
    if (hasMore) {
      setPage(prev => prev + 1)
    }
  }
  
  return {
    displayedItems,
    hasMore,
    loadMore
  }
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}`;
  
  ensureDir('hooks');
  writeFile(hookPath, hookContent);
}

// 4. Crear componente de loading optimizado
function createOptimizedLoading() {
  console.log('⏳ Creando componentes de loading optimizados...');
  
  const loadingPath = 'components/ui/optimized-loading.tsx';
  if (fileExists(loadingPath)) {
    console.log('✅ Componentes de loading ya existen');
    return;
  }
  
  const loadingContent = `'use client'

import { Suspense, lazy } from 'react'
import { Skeleton, ServiceCardSkeleton, ServicesGridSkeleton } from './skeleton'

// Lazy loading de componentes pesados
export const LazyServiceCard = lazy(() => import('../service-card').then(module => ({ default: module.ServiceCard })))
export const LazyAdminDashboard = lazy(() => import('../admin/dashboard').then(module => ({ default: module.default })))
export const LazyBookingForm = lazy(() => import('../booking-form').then(module => ({ default: module.default })))

// Componente de loading con skeleton
export function LoadingWithSkeleton({ 
  type = 'default',
  count = 1 
}: { 
  type?: 'default' | 'service-card' | 'services-grid' | 'admin-dashboard' | 'booking-form'
  count?: number 
}) {
  const renderSkeleton = () => {
    switch (type) {
      case 'service-card':
        return <ServiceCardSkeleton />
      case 'services-grid':
        return <ServicesGridSkeleton />
      case 'admin-dashboard':
        return <AdminDashboardSkeleton />
      case 'booking-form':
        return <BookingFormSkeleton />
      default:
        return <Skeleton className="h-4 w-full" />
    }
  }
  
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  )
}

// Suspense wrapper optimizado
export function OptimizedSuspense({ 
  children, 
  fallback = <LoadingWithSkeleton />,
  ...props 
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <Suspense fallback={fallback} {...props}>
      {children}
    </Suspense>
  )
}

// Hook para loading states
export function useLoadingState() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const withLoading = useCallback(async (asyncFn: () => Promise<any>) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await asyncFn()
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  return {
    isLoading,
    error,
    withLoading
  }
}`;
  
  ensureDir('components/ui');
  writeFile(loadingPath, loadingContent);
}

// 5. Crear script de optimización de imágenes
function createImageOptimizationScript() {
  console.log('🖼️ Creando script de optimización de imágenes...');
  
  const scriptPath = 'scripts/optimize-images.js';
  if (fileExists(scriptPath)) {
    console.log('✅ Script de optimización ya existe');
    return;
  }
  
  const scriptContent = `const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🖼️ OPTIMIZANDO IMÁGENES');
console.log('========================\\n');

// Verificar si sharp está instalado
function checkSharp() {
  try {
    require('sharp');
    return true;
  } catch {
    return false;
  }
}

// Instalar sharp si no está disponible
async function installSharp() {
  if (!checkSharp()) {
    console.log('📦 Instalando sharp para optimización de imágenes...');
    return new Promise((resolve, reject) => {
      exec('npm install sharp', (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Error instalando sharp:', error);
          reject(error);
        } else {
          console.log('✅ Sharp instalado correctamente');
          resolve(stdout);
        }
      });
    });
  }
}

// Optimizar imagen individual
async function optimizeImage(inputPath, outputPath, quality = 80) {
  const sharp = require('sharp');
  
  try {
    await sharp(inputPath)
      .jpeg({ quality })
      .webp({ quality })
      .toFile(outputPath);
    
    console.log(\`✅ Imagen optimizada: \${path.basename(inputPath)}\`);
  } catch (error) {
    console.error(\`❌ Error optimizando \${inputPath}:\`, error);
  }
}

// Optimizar todas las imágenes en un directorio
async function optimizeDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      await optimizeDirectory(filePath);
    } else if (/\\.(jpg|jpeg|png)$/i.test(file)) {
      const outputPath = filePath.replace(/\\.(jpg|jpeg|png)$/i, '.webp');
      await optimizeImage(filePath, outputPath);
    }
  }
}

// Función principal
async function main() {
  try {
    await installSharp();
    
    const imagesDir = 'public/images';
    if (fs.existsSync(imagesDir)) {
      console.log('🔄 Optimizando imágenes en:', imagesDir);
      await optimizeDirectory(imagesDir);
    } else {
      console.log('⚠️ Directorio de imágenes no encontrado');
    }
    
    console.log('✅ Optimización de imágenes completada');
  } catch (error) {
    console.error('❌ Error en la optimización:', error);
  }
}

if (require.main === module) {
  main();
}`;
  
  ensureDir('scripts');
  writeFile(scriptPath, scriptContent);
}

// 6. Crear archivo de configuración de performance
function createPerformanceConfig() {
  console.log('📊 Creando configuración de performance...');
  
  const configPath = 'lib/performance-config.ts';
  if (fileExists(configPath)) {
    console.log('✅ Configuración de performance ya existe');
    return;
  }
  
  const configContent = `// Configuración de performance para la aplicación

export const PERFORMANCE_CONFIG = {
  // Configuración de imágenes
  images: {
    quality: 75,
    formats: ['webp', 'jpeg'],
    sizes: {
      thumbnail: 150,
      small: 300,
      medium: 600,
      large: 1200,
    },
    lazyLoading: true,
    placeholder: '/images/placeholder.svg',
  },
  
  // Configuración de caching
  caching: {
    maxAge: 60 * 60 * 24 * 7, // 7 días
    staleWhileRevalidate: 60 * 60 * 24, // 1 día
  },
  
  // Configuración de lazy loading
  lazyLoading: {
    threshold: 0.1,
    rootMargin: '50px',
    itemsPerPage: 10,
  },
  
  // Configuración de debounce
  debounce: {
    search: 300,
    resize: 250,
    scroll: 100,
  },
  
  // Configuración de analytics
  analytics: {
    enabled: process.env.NODE_ENV === 'production',
    sampleRate: 0.1, // 10% de las sesiones
  },
  
  // Configuración de error tracking
  errorTracking: {
    enabled: process.env.NODE_ENV === 'production',
    maxErrorsPerMinute: 10,
  },
} as const

// Función para obtener configuración específica
export function getPerformanceConfig<T extends keyof typeof PERFORMANCE_CONFIG>(
  key: T
): typeof PERFORMANCE_CONFIG[T] {
  return PERFORMANCE_CONFIG[key]
}

// Función para verificar si una optimización está habilitada
export function isOptimizationEnabled(optimization: string): boolean {
  const enabledOptimizations = [
    'image-optimization',
    'lazy-loading',
    'caching',
    'analytics',
    'error-tracking',
  ]
  
  return enabledOptimizations.includes(optimization)
}`;
  
  ensureDir('lib');
  writeFile(configPath, configContent);
}

// Función principal
function main() {
  console.log('🎯 INICIANDO IMPLEMENTACIÓN DE MEJORAS');
  console.log('======================================\n');
  
  try {
    // 1. Crear imagen placeholder
    createPlaceholderImage();
    
    // 2. Optimizar next.config.mjs
    optimizeNextConfig();
    
    // 3. Crear hook de performance
    createPerformanceHook();
    
    // 4. Crear componentes de loading optimizados
    createOptimizedLoading();
    
    // 5. Crear script de optimización de imágenes
    createImageOptimizationScript();
    
    // 6. Crear configuración de performance
    createPerformanceConfig();
    
    console.log('\n🎉 MEJORAS IMPLEMENTADAS EXITOSAMENTE');
    console.log('=====================================');
    console.log('✅ Imagen placeholder creada');
    console.log('✅ Next.js config optimizado');
    console.log('✅ Hook de performance creado');
    console.log('✅ Componentes de loading optimizados');
    console.log('✅ Script de optimización de imágenes');
    console.log('✅ Configuración de performance');
    
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('==================');
    console.log('1. Ejecutar: npm run build (para verificar que todo funciona)');
    console.log('2. Ejecutar: node scripts/optimize-images.js (para optimizar imágenes)');
    console.log('3. Probar la aplicación para verificar las mejoras');
    console.log('4. Monitorear performance en producción');
    
  } catch (error) {
    console.error('\n❌ ERROR EN LA IMPLEMENTACIÓN:');
    console.error('==============================');
    console.error('Error:', error.message);
    console.error('\n💡 SOLUCIONES:');
    console.error('1. Verificar permisos de escritura');
    console.error('2. Asegurar que el directorio existe');
    console.error('3. Revisar el error específico mostrado arriba');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  createPlaceholderImage,
  optimizeNextConfig,
  createPerformanceHook,
  createOptimizedLoading,
  createImageOptimizationScript,
  createPerformanceConfig,
  main
}`;
  
  ensureDir('scripts');
  writeFile('scripts/implement-performance-improvements.js', scriptContent);
}

// Ejecutar el script
main(); 