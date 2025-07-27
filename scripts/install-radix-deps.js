#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('📦 INSTALANDO TODAS LAS DEPENDENCIAS DE RADIX UI');
console.log('================================================\n');

const radixDependencies = [
  '@radix-ui/react-separator',
  '@radix-ui/react-popover',
  '@radix-ui/react-progress',
  '@radix-ui/react-switch',
  '@radix-ui/react-tabs',
  '@radix-ui/react-dialog',
  '@radix-ui/react-dropdown-menu',
  '@radix-ui/react-select',
  '@radix-ui/react-toast',
  '@radix-ui/react-tooltip',
  '@radix-ui/react-accordion',
  '@radix-ui/react-alert-dialog',
  '@radix-ui/react-aspect-ratio',
  '@radix-ui/react-avatar',
  '@radix-ui/react-checkbox',
  '@radix-ui/react-collapsible',
  '@radix-ui/react-context-menu',
  '@radix-ui/react-hover-card',
  '@radix-ui/react-label',
  '@radix-ui/react-menubar',
  '@radix-ui/react-navigation-menu',
  '@radix-ui/react-radio-group',
  '@radix-ui/react-scroll-area',
  '@radix-ui/react-slider',
  '@radix-ui/react-slot',
  '@radix-ui/react-toggle',
  '@radix-ui/react-toggle-group'
];

console.log('🔍 Verificando dependencias existentes...');
let installedCount = 0;

radixDependencies.forEach(dep => {
  try {
    console.log(`📦 Instalando ${dep}...`);
    execSync(`npm install ${dep}`, { stdio: 'inherit' });
    console.log(`✅ ${dep} instalado`);
    installedCount++;
  } catch (error) {
    console.log(`⚠️ Error al instalar ${dep}: ${error.message}`);
  }
});

console.log('\n📋 RESUMEN');
console.log('==========');
console.log(`✅ Dependencias instaladas: ${installedCount}/${radixDependencies.length}`);

if (installedCount === radixDependencies.length) {
  console.log('\n🎉 ¡TODAS LAS DEPENDENCIAS INSTALADAS!');
  console.log('El proyecto debería compilar correctamente ahora.');
} else {
  console.log('\n⚠️ Algunas dependencias no se pudieron instalar.');
  console.log('Verifica la conexión a internet y vuelve a intentar.');
}

console.log('\n🔧 Próximos pasos:');
console.log('1. npm run build (para verificar la compilación)');
console.log('2. npm run dev (para desarrollo)');

console.log('\n🏁 Instalación completada'); 