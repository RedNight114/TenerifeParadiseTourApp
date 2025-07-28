#!/usr/bin/env node

/**
 * 🔍 Diagnóstico de Carga de Datos - Tenerife Paradise Tours
 * 
 * Este script diagnostica problemas específicos de carga de datos:
 * - Inicialización de Supabase
 * - Variables de entorno
 * - Conexión a la base de datos
 * - Autenticación
 * - Permisos RLS
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO DE CARGA DE DATOS');
console.log('=================================\n');

// 1. Verificar variables de entorno
console.log('🔧 1. VERIFICANDO VARIABLES DE ENTORNO');
console.log('---------------------------------------');

const envFiles = ['.env.local', '.env', '.env.production'];
let envContent = '';

envFiles.forEach(envFile => {
  const envPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    console.log(`✅ ${envFile} encontrado`);
    envContent += fs.readFileSync(envPath, 'utf8') + '\n';
  } else {
    console.log(`❌ ${envFile} no encontrado`);
  }
});

// Verificar variables críticas
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

requiredVars.forEach(varName => {
  const hasVar = envContent.includes(varName);
  const status = hasVar ? '✅' : '❌';
  console.log(`${status} ${varName}: ${hasVar ? 'Configurado' : 'FALTANTE'}`);
});

// 2. Verificar configuración de Supabase
console.log('\n🔧 2. VERIFICANDO CONFIGURACIÓN DE SUPABASE');
console.log('--------------------------------------------');

const supabaseFiles = [
  'lib/supabase-optimized.ts',
  'lib/supabase.ts',
  'hooks/use-auth.ts',
  'hooks/use-services.ts'
];

supabaseFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`📄 ${file}:`);
    
    // Verificar importaciones
    const hasImport = /import.*supabase/.test(content);
    console.log(`   ${hasImport ? '✅' : '❌'} Importaciones: ${hasImport ? 'OK' : 'Problema'}`);
    
    // Verificar getSupabaseClient
    const hasGetClient = /getSupabaseClient/.test(content);
    console.log(`   ${hasGetClient ? '✅' : '❌'} getSupabaseClient: ${hasGetClient ? 'Usado' : 'No usado'}`);
    
    // Verificar manejo de errores
    const hasErrorHandling = /error.*catch|try.*catch/.test(content);
    console.log(`   ${hasErrorHandling ? '✅' : '⚠️'} Manejo de errores: ${hasErrorHandling ? 'Implementado' : 'Básico'}`);
    
  } else {
    console.log(`❌ ${file} no encontrado`);
  }
});

// 3. Verificar hooks críticos
console.log('\n🔧 3. VERIFICANDO HOOKS CRÍTICOS');
console.log('--------------------------------');

const hooksToCheck = [
  { path: 'hooks/use-auth.ts', name: 'useAuth' },
  { path: 'hooks/use-services.ts', name: 'useServices' },
  { path: 'hooks/use-reservations.ts', name: 'useReservations' }
];

hooksToCheck.forEach(hook => {
  const hookPath = path.join(process.cwd(), hook.path);
  if (fs.existsSync(hookPath)) {
    const content = fs.readFileSync(hookPath, 'utf8');
    
    console.log(`📄 ${hook.name}:`);
    
    // Verificar useEffect
    const hasUseEffect = /useEffect/.test(content);
    console.log(`   ${hasUseEffect ? '✅' : '❌'} useEffect: ${hasUseEffect ? 'Usado' : 'No usado'}`);
    
    // Verificar useState
    const hasUseState = /useState/.test(content);
    console.log(`   ${hasUseState ? '✅' : '❌'} useState: ${hasUseState ? 'Usado' : 'No usado'}`);
    
    // Verificar loading state
    const hasLoading = /loading.*state|setLoading/.test(content);
    console.log(`   ${hasLoading ? '✅' : '⚠️'} Loading state: ${hasLoading ? 'Implementado' : 'Faltante'}`);
    
    // Verificar error handling
    const hasErrorState = /error.*state|setError/.test(content);
    console.log(`   ${hasErrorState ? '✅' : '⚠️'} Error handling: ${hasErrorState ? 'Implementado' : 'Faltante'}`);
    
  } else {
    console.log(`❌ ${hook.path} no encontrado`);
  }
});

// 4. Verificar componentes de autenticación
console.log('\n🔧 4. VERIFICANDO COMPONENTES DE AUTENTICACIÓN');
console.log('------------------------------------------------');

const authComponents = [
  { path: 'components/auth-provider.tsx', name: 'AuthProvider' },
  { path: 'components/auth-guard.tsx', name: 'AuthGuard' }
];

authComponents.forEach(component => {
  const compPath = path.join(process.cwd(), component.path);
  if (fs.existsSync(compPath)) {
    const content = fs.readFileSync(compPath, 'utf8');
    
    console.log(`📄 ${component.name}:`);
    
    // Verificar useAuth
    const hasUseAuth = /useAuth/.test(content);
    console.log(`   ${hasUseAuth ? '✅' : '❌'} useAuth: ${hasUseAuth ? 'Usado' : 'No usado'}`);
    
    // Verificar loading handling
    const hasLoadingHandling = /loading.*loading|isLoading/.test(content);
    console.log(`   ${hasLoadingHandling ? '✅' : '⚠️'} Loading handling: ${hasLoadingHandling ? 'Implementado' : 'Faltante'}`);
    
    // Verificar error handling
    const hasErrorHandling = /error.*error|authError/.test(content);
    console.log(`   ${hasErrorHandling ? '✅' : '⚠️'} Error handling: ${hasErrorHandling ? 'Implementado' : 'Faltante'}`);
    
  } else {
    console.log(`❌ ${component.path} no encontrado`);
  }
});

// 5. Verificar layout principal
console.log('\n🔧 5. VERIFICANDO LAYOUT PRINCIPAL');
console.log('-----------------------------------');

const layoutPath = path.join(process.cwd(), 'app', 'layout.tsx');
if (fs.existsSync(layoutPath)) {
  const content = fs.readFileSync(layoutPath, 'utf8');
  
  console.log('📄 Root Layout:');
  
  // Verificar AuthProvider
  const hasAuthProvider = /AuthProvider/.test(content);
  console.log(`   ${hasAuthProvider ? '✅' : '❌'} AuthProvider: ${hasAuthProvider ? 'Incluido' : 'FALTANTE'}`);
  
  // Verificar ThemeProvider
  const hasThemeProvider = /ThemeProvider/.test(content);
  console.log(`   ${hasThemeProvider ? '✅' : '⚠️'} ThemeProvider: ${hasThemeProvider ? 'Incluido' : 'No incluido'}`);
  
  // Verificar metadata
  const hasMetadata = /export.*metadata/.test(content);
  console.log(`   ${hasMetadata ? '✅' : '⚠️'} Metadata: ${hasMetadata ? 'Configurado' : 'No configurado'}`);
  
} else {
  console.log('❌ app/layout.tsx no encontrado');
}

// 6. Crear script de prueba de conexión
console.log('\n🔧 6. CREANDO SCRIPT DE PRUEBA DE CONEXIÓN');
console.log('-------------------------------------------');

const testConnectionScript = `#!/usr/bin/env node

/**
 * 🧪 Prueba de Conexión a Supabase
 * 
 * Este script prueba la conexión a Supabase y verifica que los datos se cargan correctamente.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('🧪 PROBANDO CONEXIÓN A SUPABASE');
  console.log('===============================\n');

  // Verificar variables de entorno
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Variables de entorno faltantes');
    console.log('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseKey);
    return;
  }

  console.log('✅ Variables de entorno configuradas');

  try {
    // Crear cliente
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Cliente Supabase creado');

    // Probar conexión básica
    console.log('\n🔍 Probando conexión básica...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (testError) {
      console.log('❌ Error de conexión:', testError.message);
      return;
    }

    console.log('✅ Conexión básica exitosa');

    // Probar carga de servicios
    console.log('\n🔍 Probando carga de servicios...');
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id, title')
      .limit(5);

    if (servicesError) {
      console.log('❌ Error cargando servicios:', servicesError.message);
    } else {
      console.log('✅ Servicios cargados:', services?.length || 0, 'servicios');
    }

    // Probar carga de categorías
    console.log('\n🔍 Probando carga de categorías...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(5);

    if (categoriesError) {
      console.log('❌ Error cargando categorías:', categoriesError.message);
    } else {
      console.log('✅ Categorías cargadas:', categories?.length || 0, 'categorías');
    }

    // Probar autenticación anónima
    console.log('\n🔍 Probando autenticación anónima...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.log('❌ Error de autenticación:', authError.message);
    } else {
      console.log('✅ Autenticación funcionando');
      console.log('   Sesión activa:', !!session);
    }

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

testSupabaseConnection();
`;

fs.writeFileSync('scripts/test-supabase-connection.js', testConnectionScript);
console.log('✅ Script de prueba de conexión creado: scripts/test-supabase-connection.js');

// 7. Crear script de diagnóstico de hooks
console.log('\n🔧 7. CREANDO SCRIPT DE DIAGNÓSTICO DE HOOKS');
console.log('---------------------------------------------');

const hooksDiagnosticScript = `#!/usr/bin/env node

/**
 * 🔍 Diagnóstico de Hooks - Tenerife Paradise Tours
 * 
 * Este script diagnostica problemas específicos en los hooks de la aplicación.
 */

const fs = require('fs');
const path = require('path');

function analyzeHook(hookPath, hookName) {
  console.log(\`\n📄 Analizando \${hookName}...\`);
  
  if (!fs.existsSync(hookPath)) {
    console.log(\`❌ \${hookPath} no encontrado\`);
    return;
  }

  const content = fs.readFileSync(hookPath, 'utf8');
  
  // Verificar problemas comunes
  const issues = [];
  
  // 1. Verificar dependencias de useEffect
  const useEffectMatches = content.match(/useEffect\([^)]*\)/g);
  if (useEffectMatches) {
    useEffectMatches.forEach((match, index) => {
      if (match.includes('[]') && !match.includes('// eslint-disable-next-line')) {
        issues.push(\`useEffect \${index + 1}: Dependencias vacías sin comentario\`);
      }
    });
  }
  
  // 2. Verificar múltiples setState en useEffect
  const setStateMatches = content.match(/set[A-Z][a-zA-Z]*\(/g);
  if (setStateMatches && setStateMatches.length > 3) {
    issues.push(\`Múltiples setState (${setStateMatches.length} encontrados)\`);
  }
  
  // 3. Verificar falta de cleanup en useEffect
  const useEffectWithCleanup = content.match(/useEffect\([^)]*\{[^}]*return[^}]*\}/g);
  if (useEffectMatches && !useEffectWithCleanup) {
    issues.push('useEffect sin cleanup function');
  }
  
  // 4. Verificar async en useEffect
  const asyncUseEffect = content.match(/useEffect\(async/g);
  if (asyncUseEffect) {
    issues.push('useEffect con async (puede causar problemas)');
  }
  
  if (issues.length === 0) {
    console.log('✅ Sin problemas detectados');
  } else {
    console.log('⚠️ Problemas detectados:');
    issues.forEach(issue => console.log(\`   • \${issue}\`));
  }
}

console.log('🔍 DIAGNÓSTICO DE HOOKS');
console.log('=======================\n');

const hooks = [
  { path: 'hooks/use-auth.ts', name: 'useAuth' },
  { path: 'hooks/use-services.ts', name: 'useServices' },
  { path: 'hooks/use-reservations.ts', name: 'useReservations' }
];

hooks.forEach(hook => {
  analyzeHook(hook.path, hook.name);
});

console.log('\n✅ Diagnóstico de hooks completado');
`;

fs.writeFileSync('scripts/diagnose-hooks.js', hooksDiagnosticScript);
console.log('✅ Script de diagnóstico de hooks creado: scripts/diagnose-hooks.js');

// 8. Recomendaciones
console.log('\n💡 8. RECOMENDACIONES PARA SOLUCIONAR EL PROBLEMA');
console.log('================================================');

const recommendations = [
  {
    category: '🚨 Problemas Críticos',
    items: [
      'Verificar que las variables de entorno estén configuradas correctamente',
      'Asegurar que NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY estén en .env.local',
      'Verificar que el proyecto de Supabase esté activo y accesible',
      'Comprobar que las tablas existan en Supabase'
    ]
  },
  {
    category: '🔧 Problemas de Código',
    items: [
      'Verificar que AuthProvider esté incluido en el layout principal',
      'Asegurar que los hooks tengan manejo de errores apropiado',
      'Verificar que no haya múltiples instancias de Supabase',
      'Comprobar que los useEffect tengan dependencias correctas'
    ]
  },
  {
    category: '📱 Problemas de Navegación',
    items: [
      'Verificar que el router esté configurado correctamente',
      'Asegurar que las páginas tengan loading states apropiados',
      'Verificar que no haya bucles infinitos en useEffect',
      'Comprobar que los componentes se monten correctamente'
    ]
  }
];

recommendations.forEach(rec => {
  console.log(`\n${rec.category}:`);
  rec.items.forEach(item => {
    console.log(`  • ${item}`);
  });
});

console.log('\n🎯 PRÓXIMOS PASOS:');
console.log('==================');
console.log('1. Ejecutar: node scripts/test-supabase-connection.js');
console.log('2. Ejecutar: node scripts/diagnose-hooks.js');
console.log('3. Verificar variables de entorno en .env.local');
console.log('4. Probar conexión manual a Supabase');
console.log('5. Revisar logs del navegador para errores específicos');

console.log('\n✅ Diagnóstico de carga de datos completado'); 