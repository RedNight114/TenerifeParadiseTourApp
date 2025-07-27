#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('📦 INSTALANDO TODAS LAS DEPENDENCIAS FALTANTES');
console.log('==============================================\n');

const allDependencies = [
  // Radix UI
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
  '@radix-ui/react-toggle-group',
  
  // Carousel
  'embla-carousel-react',
  
  // Otras dependencias comunes
  'class-variance-authority',
  'clsx',
  'tailwind-merge',
  'lucide-react',
  '@hookform/resolvers',
  'react-hook-form',
  'zod',
  'date-fns',
  'react-day-picker',
  'sonner',
  'vaul',
  'cmdk',
  'framer-motion',
  'react-resizable-panels',
  'recharts',
  'react-dropzone',
  'react-hot-toast',
  'react-intersection-observer',
  'react-use',
  'usehooks-ts'
];

console.log('🔍 Instalando todas las dependencias...');
let installedCount = 0;

allDependencies.forEach(dep => {
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
console.log(`✅ Dependencias instaladas: ${installedCount}/${allDependencies.length}`);

if (installedCount === allDependencies.length) {
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