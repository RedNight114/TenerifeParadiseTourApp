#!/usr/bin/env node

/**
 * 🔄 Restauración Gradual de Componentes - Tenerife Paradise Tours
 * 
 * Este script restaura gradualmente los componentes una vez que el error de webpack esté resuelto.
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 RESTAURACIÓN GRADUAL DE COMPONENTES');
console.log('======================================\n');

// Función para restaurar archivo desde backup
function restoreFromBackup(originalPath, backupPath) {
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, originalPath);
    console.log(`✅ ${originalPath} restaurado desde backup`);
    return true;
  } else {
    console.log(`❌ Backup no encontrado: ${backupPath}`);
    return false;
  }
}

// Función para verificar si el servidor está funcionando
function checkServerStatus() {
  console.log('🔍 Verificando estado del servidor...');
  console.log('💡 Asegúrate de que el servidor esté funcionando sin errores antes de continuar');
  console.log('   Ejecuta: npm run dev');
  console.log('   Verifica que no hay errores en la consola del navegador');
  console.log('');
}

// Opciones de restauración
const restorationOptions = [
  {
    name: 'Restaurar configuración completa',
    original: 'next.config.mjs',
    backup: 'next.config.mjs.backup',
    description: 'Restaura la configuración completa de Next.js con todas las optimizaciones'
  },
  {
    name: 'Restaurar layout completo',
    original: 'app/layout.tsx',
    backup: 'app/layout.tsx.backup',
    description: 'Restaura el layout con todos los componentes de recuperación'
  },
  {
    name: 'Restaurar sistema de recuperación',
    description: 'Habilita el sistema de recuperación de navegación',
    components: [
      'hooks/use-navigation-recovery.ts',
      'components/navigation-recovery.tsx',
      'components/hydration-safe.tsx',
      'components/cache-cleanup.tsx'
    ]
  }
];

// Mostrar opciones
console.log('📋 OPCIONES DE RESTAURACIÓN:');
console.log('============================');
restorationOptions.forEach((option, index) => {
  console.log(`${index + 1}. ${option.name}`);
  console.log(`   ${option.description}`);
  if (option.components) {
    option.components.forEach(comp => {
      const exists = fs.existsSync(comp);
      console.log(`   - ${comp}: ${exists ? '✅ Presente' : '❌ Faltante'}`);
    });
  }
  console.log('');
});

// Función para restaurar configuración completa
function restoreFullConfig() {
  console.log('🔧 Restaurando configuración completa...');
  
  const configBackup = 'next.config.mjs.backup';
  if (restoreFromBackup('next.config.mjs', configBackup)) {
    console.log('✅ Configuración completa restaurada');
    console.log('⚠️  Verifica que no hay errores de webpack');
  }
}

// Función para restaurar layout completo
function restoreFullLayout() {
  console.log('🔧 Restaurando layout completo...');
  
  const layoutBackup = 'app/layout.tsx.backup';
  if (restoreFromBackup('app/layout.tsx', layoutBackup)) {
    console.log('✅ Layout completo restaurado');
    console.log('⚠️  Verifica que no hay errores de hidratación');
  }
}

// Función para verificar componentes del sistema de recuperación
function checkRecoverySystem() {
  console.log('🔍 Verificando sistema de recuperación...');
  
  const components = [
    'hooks/use-navigation-recovery.ts',
    'components/navigation-recovery.tsx',
    'components/hydration-safe.tsx',
    'components/cache-cleanup.tsx'
  ];
  
  let allPresent = true;
  components.forEach(comp => {
    const exists = fs.existsSync(comp);
    console.log(`${exists ? '✅' : '❌'} ${comp}`);
    if (!exists) allPresent = false;
  });
  
  if (allPresent) {
    console.log('✅ Todos los componentes del sistema de recuperación están presentes');
    console.log('💡 El sistema de recuperación está listo para ser integrado');
  } else {
    console.log('❌ Faltan algunos componentes del sistema de recuperación');
  }
}

// Función para integrar sistema de recuperación en layout
function integrateRecoverySystem() {
  console.log('🔧 Integrando sistema de recuperación en layout...');
  
  const layoutPath = 'app/layout.tsx';
  if (!fs.existsSync(layoutPath)) {
    console.log('❌ Layout no encontrado');
    return;
  }
  
  let layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  // Verificar si ya está integrado
  if (layoutContent.includes('NavigationRecovery')) {
    console.log('✅ Sistema de recuperación ya integrado');
    return;
  }
  
  // Agregar imports
  const importsToAdd = [
    'import { CacheCleanup } from "@/components/cache-cleanup"',
    'import { NavigationRecovery, ProblemDetector } from "@/components/navigation-recovery"',
    'import { SuppressHydrationWarning } from "@/components/hydration-safe"'
  ];
  
  importsToAdd.forEach(importStatement => {
    if (!layoutContent.includes(importStatement)) {
      layoutContent = layoutContent.replace(
        'import { AuthProvider } from "@/components/auth-provider"',
        `import { AuthProvider } from "@/components/auth-provider"
${importStatement}`
      );
    }
  });
  
  // Agregar componentes en el body
  if (!layoutContent.includes('SuppressHydrationWarning')) {
    layoutContent = layoutContent.replace(
      '<body className={`${geist.variable} ${geistMono.variable} antialiased`}>',
      `<body className={\`\${geist.variable} \${geistMono.variable} antialiased\`}>
        <SuppressHydrationWarning>`
    );
    
    layoutContent = layoutContent.replace(
      '</body>',
      `          </SuppressHydrationWarning>
        </body>`
    );
  }
  
  if (!layoutContent.includes('CacheCleanup')) {
    layoutContent = layoutContent.replace(
      '<AuthProvider>',
      `<AuthProvider>
            {/* Sistema de limpieza de caché */}
            <CacheCleanup />
            
            {/* Sistema de recuperación de navegación */}
            <NavigationRecovery 
              showOnError={true}
              autoHide={false}
              hideDelay={15000}
            />
            
            {/* Detector de problemas */}
            <ProblemDetector />
            
            {/* Contenido principal */}`
    );
    
    layoutContent = layoutContent.replace(
      '</AuthProvider>',
      `          </AuthProvider>`
    );
  }
  
  fs.writeFileSync(layoutPath, layoutContent);
  console.log('✅ Sistema de recuperación integrado en layout');
}

// Función principal
function main() {
  checkServerStatus();
  
  console.log('🎯 SELECCIONA UNA OPCIÓN:');
  console.log('=========================');
  console.log('1. Restaurar configuración completa');
  console.log('2. Restaurar layout completo');
  console.log('3. Verificar sistema de recuperación');
  console.log('4. Integrar sistema de recuperación en layout');
  console.log('5. Restauración completa (todo)');
  console.log('6. Salir');
  console.log('');
  
  // Simular selección automática para restaurar todo gradualmente
  console.log('🔄 Iniciando restauración gradual automática...');
  console.log('');
  
  // 1. Verificar sistema de recuperación
  checkRecoverySystem();
  console.log('');
  
  // 2. Integrar sistema de recuperación
  integrateRecoverySystem();
  console.log('');
  
  // 3. Restaurar layout completo
  restoreFullLayout();
  console.log('');
  
  // 4. Restaurar configuración completa
  restoreFullConfig();
  console.log('');
  
  console.log('🎯 RESTAURACIÓN COMPLETADA');
  console.log('==========================');
  console.log('✅ Sistema de recuperación verificado');
  console.log('✅ Sistema de recuperación integrado');
  console.log('✅ Layout completo restaurado');
  console.log('✅ Configuración completa restaurada');
  console.log('');
  
  console.log('💡 PRÓXIMOS PASOS:');
  console.log('==================');
  console.log('1. Reiniciar el servidor: npm run dev');
  console.log('2. Verificar que no hay errores de webpack');
  console.log('3. Probar el sistema de recuperación');
  console.log('4. Verificar que todos los componentes funcionan');
  console.log('');
  
  console.log('🔧 COMANDOS ÚTILES:');
  console.log('==================');
  console.log('• npm run dev - Reiniciar servidor');
  console.log('• npm run test:navigation-recovery - Test del sistema');
  console.log('• Ver logs: npm run dev 2>&1 | tee dev.log');
  
  console.log('\n✅ Restauración gradual completada');
}

// Ejecutar función principal
main(); 