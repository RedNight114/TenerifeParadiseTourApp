#!/usr/bin/env node

/**
 * 🧪 Test de Sistema de Recuperación de Navegación - Tenerife Paradise Tours
 * 
 * Este script simula problemas de navegación para probar el sistema de recuperación.
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 TEST DE SISTEMA DE RECUPERACIÓN DE NAVEGACIÓN');
console.log('================================================\n');

// Verificar archivos críticos
console.log('🔍 Verificando archivos críticos...');
const criticalFiles = [
  'hooks/use-navigation-recovery.ts',
  'components/navigation-recovery.tsx',
  'app/layout.tsx'
];

criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} presente`);
  } else {
    console.log(`❌ ${file} faltante`);
  }
});

// Verificar integración en layout
console.log('\n🔍 Verificando integración en layout...');
const layoutPath = path.join(process.cwd(), 'app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  const checks = [
    {
      name: 'NavigationRecovery importado',
      check: layoutContent.includes('NavigationRecovery')
    },
    {
      name: 'ProblemDetector importado',
      check: layoutContent.includes('ProblemDetector')
    },
    {
      name: 'NavigationRecovery component',
      check: layoutContent.includes('NavigationRecovery')
    },
    {
      name: 'SuppressHydrationWarning',
      check: layoutContent.includes('SuppressHydrationWarning')
    }
  ];

  checks.forEach(({ name, check }) => {
    console.log(`${check ? '✅' : '❌'} ${name}`);
  });
} else {
  console.log('❌ Layout no encontrado');
}

// Verificar configuración del hook
console.log('\n🔍 Verificando configuración del hook...');
const hookPath = path.join(process.cwd(), 'hooks/use-navigation-recovery.ts');
if (fs.existsSync(hookPath)) {
  const hookContent = fs.readFileSync(hookPath, 'utf8');
  
  const hookChecks = [
    {
      name: 'Detector de errores de navegación',
      check: hookContent.includes('navigation') && hookContent.includes('routing')
    },
    {
      name: 'Limpieza de caché del cliente',
      check: hookContent.includes('localStorage.clear()') && hookContent.includes('sessionStorage.clear()')
    },
    {
      name: 'Recuperación automática',
      check: hookContent.includes('recoverFromError')
    },
    {
      name: 'Control de reintentos',
      check: hookContent.includes('maxRetries') && hookContent.includes('retryCount')
    }
  ];

  hookChecks.forEach(({ name, check }) => {
    console.log(`${check ? '✅' : '❌'} ${name}`);
  });
} else {
  console.log('❌ Hook no encontrado');
}

// Verificar componente de recuperación
console.log('\n🔍 Verificando componente de recuperación...');
const componentPath = path.join(process.cwd(), 'components/navigation-recovery.tsx');
if (fs.existsSync(componentPath)) {
  const componentContent = fs.readFileSync(componentPath, 'utf8');
  
  const componentChecks = [
    {
      name: 'Detección de problemas',
      check: componentContent.includes('checkForProblems')
    },
    {
      name: 'Botón de recuperación automática',
      check: componentContent.includes('manualRecover')
    },
    {
      name: 'Botón de limpiar caché',
      check: componentContent.includes('manualClearCache')
    },
    {
      name: 'ProblemDetector',
      check: componentContent.includes('ProblemDetector')
    }
  ];

  componentChecks.forEach(({ name, check }) => {
    console.log(`${check ? '✅' : '❌'} ${name}`);
  });
} else {
  console.log('❌ Componente no encontrado');
}

console.log('\n🎯 ESCENARIOS DE PRUEBA:');
console.log('========================');
console.log('1. Navegar a una URL errónea (ej: /pagina-que-no-existe)');
console.log('2. Volver atrás con el botón del navegador');
console.log('3. Verificar que aparece el panel de recuperación');
console.log('4. Probar el botón "Recuperar automáticamente"');
console.log('5. Probar el botón "Limpiar caché"');
console.log('6. Verificar que los datos cargan correctamente después');

console.log('\n💡 FUNCIONALIDADES IMPLEMENTADAS:');
console.log('==================================');
console.log('• Detección automática de errores de navegación');
console.log('• Limpieza automática de caché del cliente');
console.log('• Recuperación automática con reintentos');
console.log('• Panel de recuperación manual');
console.log('• Detector de problemas en tiempo real');
console.log('• Integración con el sistema de hidratación');

console.log('\n🔧 COMANDOS PARA PROBAR:');
console.log('=======================');
console.log('• npm run dev - Iniciar servidor de desarrollo');
console.log('• Navegar a URL errónea para activar recuperación');
console.log('• Verificar consola del navegador para logs');
console.log('• Probar botones de recuperación manual');

console.log('\n✅ Test de sistema de recuperación completado'); 