#!/usr/bin/env node

/**
 * 🔍 Diagnóstico de Rendimiento - Tenerife Paradise Tours
 * 
 * Este script analiza los problemas de rendimiento comunes:
 * - Caché del lado del cliente
 * - Re-renders innecesarios
 * - Problemas de navegación
 * - Memory leaks
 * - Optimizaciones de Next.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO DE RENDIMIENTO');
console.log('==============================\n');

// 1. Verificar configuración de Next.js
console.log('📋 1. CONFIGURACIÓN DE NEXT.JS');
console.log('--------------------------------');

const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
if (fs.existsSync(nextConfigPath)) {
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  
  // Verificar optimizaciones críticas
  const checks = [
    { name: 'SWC Minify', pattern: /swcMinify:\s*true/, critical: true },
    { name: 'React Strict Mode', pattern: /reactStrictMode:\s*true/, critical: true },
    { name: 'Image Optimization', pattern: /formats:\s*\[.*webp.*avif.*\]/, critical: false },
    { name: 'Webpack Optimizations', pattern: /splitChunks/, critical: false },
    { name: 'Console Removal', pattern: /removeConsole.*production/, critical: false },
  ];

  checks.forEach(check => {
    const found = check.pattern.test(nextConfig);
    const status = found ? '✅' : check.critical ? '❌' : '⚠️';
    console.log(`${status} ${check.name}: ${found ? 'Configurado' : 'No configurado'}`);
  });
} else {
  console.log('❌ next.config.mjs no encontrado');
}

// 2. Verificar hooks de autenticación
console.log('\n🔐 2. HOOKS DE AUTENTICACIÓN');
console.log('-----------------------------');

const authHookPath = path.join(process.cwd(), 'hooks', 'use-auth.ts');
if (fs.existsSync(authHookPath)) {
  const authHook = fs.readFileSync(authHookPath, 'utf8');
  
  // Verificar problemas comunes
  const authChecks = [
    { name: 'useEffect Dependencies', pattern: /useEffect.*\[\]/, issue: 'Dependencias vacías pueden causar re-renders' },
    { name: 'Multiple State Updates', pattern: /setUser.*setProfile.*setLoading/, issue: 'Múltiples actualizaciones de estado' },
    { name: 'Auth Listener', pattern: /onAuthStateChange/, issue: 'Listener puede causar re-renders' },
  ];

  authChecks.forEach(check => {
    const found = check.pattern.test(authHook);
    const status = found ? '⚠️' : '✅';
    console.log(`${status} ${check.name}: ${found ? check.issue : 'OK'}`);
  });
} else {
  console.log('❌ hooks/use-auth.ts no encontrado');
}

// 3. Verificar hooks de servicios
console.log('\n📦 3. HOOKS DE SERVICIOS');
console.log('-------------------------');

const servicesHookPath = path.join(process.cwd(), 'hooks', 'use-services.ts');
if (fs.existsSync(servicesHookPath)) {
  const servicesHook = fs.readFileSync(servicesHookPath, 'utf8');
  
  const serviceChecks = [
    { name: 'Cache Implementation', pattern: /CACHE_DURATION/, issue: 'Cache implementado' },
    { name: 'useCallback Usage', pattern: /useCallback/, issue: 'Funciones memoizadas' },
    { name: 'useMemo Usage', pattern: /useMemo/, issue: 'Valores memoizados' },
    { name: 'Force Refresh', pattern: /forceRefresh/, issue: 'Mecanismo de refresh' },
  ];

  serviceChecks.forEach(check => {
    const found = check.pattern.test(servicesHook);
    const status = found ? '✅' : '⚠️';
    console.log(`${status} ${check.name}: ${found ? 'Implementado' : 'No implementado'}`);
  });
} else {
  console.log('❌ hooks/use-services.ts no encontrado');
}

// 4. Verificar componentes críticos
console.log('\n🧩 4. COMPONENTES CRÍTICOS');
console.log('---------------------------');

const componentsToCheck = [
  { path: 'components/auth-guard.tsx', name: 'AuthGuard' },
  { path: 'components/auth-provider.tsx', name: 'AuthProvider' },
  { path: 'components/layout-wrapper.tsx', name: 'LayoutWrapper' },
];

componentsToCheck.forEach(component => {
  const fullPath = path.join(process.cwd(), component.path);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Verificar problemas de rendimiento
    const hasUseEffect = /useEffect/.test(content);
    const hasUseState = /useState/.test(content);
    const hasRouter = /useRouter/.test(content);
    
    console.log(`📄 ${component.name}:`);
    console.log(`   ${hasUseEffect ? '✅' : '❌'} useEffect: ${hasUseEffect ? 'Usado' : 'No usado'}`);
    console.log(`   ${hasUseState ? '✅' : '❌'} useState: ${hasUseState ? 'Usado' : 'No usado'}`);
    console.log(`   ${hasRouter ? '⚠️' : '✅'} useRouter: ${hasRouter ? 'Usado (puede causar re-renders)' : 'No usado'}`);
  } else {
    console.log(`❌ ${component.path} no encontrado`);
  }
});

// 5. Verificar middleware
console.log('\n🛡️ 5. MIDDLEWARE');
console.log('----------------');

const middlewarePath = path.join(process.cwd(), 'middleware.ts');
if (fs.existsSync(middlewarePath)) {
  const middleware = fs.readFileSync(middlewarePath, 'utf8');
  
  const middlewareChecks = [
    { name: 'Security Headers', pattern: /X-Content-Type-Options/, issue: 'Headers de seguridad' },
    { name: 'Rate Limiting', pattern: /rate.*limit/i, issue: 'Rate limiting básico' },
    { name: 'CORS Headers', pattern: /Access-Control-Allow-Origin/, issue: 'Headers CORS' },
  ];

  middlewareChecks.forEach(check => {
    const found = check.pattern.test(middleware);
    const status = found ? '✅' : '⚠️';
    console.log(`${status} ${check.name}: ${found ? 'Configurado' : 'No configurado'}`);
  });
} else {
  console.log('❌ middleware.ts no encontrado');
}

// 6. Recomendaciones
console.log('\n💡 6. RECOMENDACIONES DE OPTIMIZACIÓN');
console.log('=====================================');

const recommendations = [
  {
    category: '🚀 Optimizaciones Inmediatas',
    items: [
      'Implementar React.memo() en componentes que no cambian frecuentemente',
      'Usar useMemo() para cálculos costosos',
      'Optimizar useCallback() para funciones que se pasan como props',
      'Implementar lazy loading para componentes pesados'
    ]
  },
  {
    category: '🔧 Configuración de Next.js',
    items: [
      'Habilitar experimental.optimizeCss',
      'Configurar experimental.turbo para builds más rápidos',
      'Optimizar configuración de imágenes',
      'Implementar ISR (Incremental Static Regeneration)'
    ]
  },
  {
    category: '📱 Navegación y Caché',
    items: [
      'Implementar prefetching inteligente',
      'Optimizar el router de Next.js',
      'Implementar cache headers apropiados',
      'Usar Suspense para loading states'
    ]
  },
  {
    category: '🧠 Memory Management',
    items: [
      'Limpiar event listeners en useEffect cleanup',
      'Evitar closures innecesarios',
      'Optimizar re-renders con React DevTools Profiler',
      'Implementar virtualización para listas largas'
    ]
  }
];

recommendations.forEach(rec => {
  console.log(`\n${rec.category}:`);
  rec.items.forEach(item => {
    console.log(`  • ${item}`);
  });
});

// 7. Scripts de optimización sugeridos
console.log('\n🛠️ 7. SCRIPTS DE OPTIMIZACIÓN SUGERIDOS');
console.log('========================================');

const optimizationScripts = [
  'scripts/optimize-components.js',
  'scripts/analyze-bundle.js',
  'scripts/performance-monitor.js',
  'scripts/cache-optimization.js'
];

optimizationScripts.forEach(script => {
  const scriptPath = path.join(process.cwd(), script);
  const exists = fs.existsSync(scriptPath);
  console.log(`${exists ? '✅' : '❌'} ${script}: ${exists ? 'Disponible' : 'No creado'}`);
});

console.log('\n🎯 PRÓXIMOS PASOS:');
console.log('==================');
console.log('1. Ejecutar: npm run build -- --debug');
console.log('2. Usar React DevTools Profiler para identificar re-renders');
console.log('3. Implementar las optimizaciones sugeridas');
console.log('4. Monitorear métricas de rendimiento en producción');
console.log('5. Considerar implementar Service Worker para caché offline');

console.log('\n✅ Diagnóstico completado'); 