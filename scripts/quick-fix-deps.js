#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('⚡ INSTALACIÓN RÁPIDA DE DEPENDENCIAS ESENCIALES');
console.log('================================================\n');

const essentialDeps = [
  '@radix-ui/react-popover',
  '@radix-ui/react-progress', 
  '@radix-ui/react-switch',
  '@radix-ui/react-tabs',
  '@radix-ui/react-accordion',
  '@radix-ui/react-aspect-ratio',
  'cmdk',
  'embla-carousel-react'
];

console.log('📦 Instalando dependencias esenciales...');

try {
  const depsString = essentialDeps.join(' ');
  console.log(`Ejecutando: npm install --legacy-peer-deps ${depsString}`);
  
  execSync(`npm install --legacy-peer-deps ${depsString}`, { 
    stdio: 'inherit',
    timeout: 60000 // 60 segundos
  });
  
  console.log('\n✅ ¡DEPENDENCIAS INSTALADAS EXITOSAMENTE!');
  console.log('\n🔧 Próximos pasos:');
  console.log('1. npm run build (para verificar)');
  console.log('2. npm run dev (para desarrollo)');
  
} catch (error) {
  console.log('\n❌ Error durante la instalación:', error.message);
  console.log('\n🔧 Alternativa:');
  console.log('1. npm install --force');
  console.log('2. npm run build');
}

console.log('\n🏁 Instalación completada'); 