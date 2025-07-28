const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Reiniciando servidor completamente...\n');

try {
  // 1. Detener cualquier proceso de Node.js
  console.log('🛑 Deteniendo procesos de Node.js...');
  try {
    execSync('taskkill /f /im node.exe', { stdio: 'ignore' });
    console.log('✅ Procesos detenidos');
  } catch (error) {
    console.log('ℹ️ No había procesos ejecutándose');
  }

  // 2. Limpiar directorio .next
  console.log('🧹 Limpiando directorio .next...');
  const nextDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextDir)) {
    try {
      fs.rmSync(nextDir, { recursive: true, force: true });
      console.log('✅ Directorio .next eliminado');
    } catch (error) {
      console.log('⚠️ Error eliminando .next:', error.message);
    }
  }

  // 3. Limpiar caché de npm
  console.log('📦 Limpiando caché de npm...');
  try {
    execSync('npm cache clean --force', { stdio: 'inherit' });
    console.log('✅ Caché de npm limpiado');
  } catch (error) {
    console.log('⚠️ Error limpiando caché de npm:', error.message);
  }

  // 4. Reinstalar dependencias
  console.log('📥 Reinstalando dependencias...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencias reinstaladas');

  // 5. Verificar archivos críticos
  console.log('🔍 Verificando archivos críticos...');
  const criticalFiles = [
    'app/globals.css',
    'tailwind.config.ts',
    'postcss.config.mjs',
    'app/layout.tsx',
    'next.config.mjs'
  ];

  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} presente`);
    } else {
      console.log(`❌ ${file} faltante`);
    }
  });

  console.log('\n🎯 INICIANDO SERVIDOR...');
  console.log('========================');
  console.log('El servidor se iniciará en unos segundos...');
  console.log('Abre http://localhost:3000 en tu navegador');
  console.log('Si los estilos no cargan, limpia el caché del navegador (Ctrl+Shift+Delete)');

  // 6. Iniciar servidor
  setTimeout(() => {
    console.log('\n🚀 Iniciando servidor de desarrollo...');
    execSync('npm run dev', { stdio: 'inherit' });
  }, 2000);

} catch (error) {
  console.error('❌ Error durante el reinicio:', error.message);
  console.log('\n🔧 Instrucciones manuales:');
  console.log('1. Cierra todos los navegadores y terminales');
  console.log('2. Elimina manualmente la carpeta .next');
  console.log('3. Ejecuta: npm install');
  console.log('4. Ejecuta: npm run dev');
  console.log('5. Abre un navegador en modo incógnito');
} 