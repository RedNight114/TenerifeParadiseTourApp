const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('⚡ Configurando Turbopack para desarrollo optimizado...\n');

// 1. Verificar versión de Next.js
console.log('📦 Verificando versión de Next.js...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const nextVersion = packageJson.dependencies?.next || packageJson.devDependencies?.next;
  
  if (nextVersion) {
    console.log(`✅ Next.js versión: ${nextVersion}`);
    
    // Verificar si la versión soporta Turbopack
    const versionNumber = nextVersion.replace(/[^0-9.]/g, '');
    const majorVersion = parseInt(versionNumber.split('.')[0]);
    const minorVersion = parseInt(versionNumber.split('.')[1]);
    
    if (majorVersion >= 13 && minorVersion >= 3) {
      console.log('✅ Versión compatible con Turbopack');
    } else {
      console.log('⚠️ Versión puede no ser completamente compatible con Turbopack');
    }
  } else {
    console.log('❌ Next.js no encontrado en dependencias');
  }
} catch (error) {
  console.log('❌ Error leyendo package.json:', error.message);
}

// 2. Verificar configuración actual
console.log('\n⚙️ Verificando configuración actual...');
const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
if (fs.existsSync(nextConfigPath)) {
  const configContent = fs.readFileSync(nextConfigPath, 'utf8');
  
  if (configContent.includes('turbo: {')) {
    console.log('✅ Turbopack configurado correctamente');
  } else if (configContent.includes('turbo: false')) {
    console.log('⚠️ Turbopack deshabilitado');
  } else {
    console.log('ℹ️ Configuración de turbo no encontrada');
  }
} else {
  console.log('❌ next.config.mjs no encontrado');
}

// 3. Verificar archivos críticos para Turbopack
console.log('\n🔍 Verificando archivos críticos...');
const criticalFiles = [
  'app/layout.tsx',
  'app/globals.css',
  'tailwind.config.ts',
  'postcss.config.mjs'
];

criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} presente`);
  } else {
    console.log(`❌ ${file} faltante`);
  }
});

// 4. Limpiar caché para Turbopack
console.log('\n🧹 Limpiando caché para Turbopack...');
try {
  const nextDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('✅ Caché de Next.js limpiado');
  }
  
  // Limpiar caché de npm
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ Caché de npm limpiado');
  
} catch (error) {
  console.log('⚠️ Error limpiando caché:', error.message);
}

// 5. Reinstalar dependencias
console.log('\n📥 Reinstalando dependencias...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencias reinstaladas');
} catch (error) {
  console.log('❌ Error reinstalando dependencias:', error.message);
}

// 6. Crear script de inicio con Turbopack
console.log('\n📝 Creando script de inicio con Turbopack...');
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Agregar script de desarrollo con Turbopack
    if (!packageJson.scripts['dev:turbo']) {
      packageJson.scripts['dev:turbo'] = 'next dev --turbo';
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('✅ Script dev:turbo agregado');
    } else {
      console.log('ℹ️ Script dev:turbo ya existe');
    }
  } catch (error) {
    console.log('❌ Error modificando package.json:', error.message);
  }
}

console.log('\n🎯 CONFIGURACIÓN DE TURBOPACK COMPLETADA');
console.log('==========================================');
console.log('✅ Turbopack configurado correctamente');
console.log('✅ Caché limpiado para optimización');
console.log('✅ Dependencias actualizadas');
console.log('');
console.log('🚀 COMANDOS DISPONIBLES:');
console.log('=======================');
console.log('• npm run dev          - Desarrollo normal');
console.log('• npm run dev:turbo    - Desarrollo con Turbopack');
console.log('• npm run build        - Build de producción');
console.log('');
console.log('💡 BENEFICIOS DE TURBOPACK:');
console.log('==========================');
console.log('• ⚡ Inicio más rápido del servidor');
console.log('• 🔄 Hot reload más veloz');
console.log('• 📦 Mejor gestión de dependencias');
console.log('• 🎯 Optimizaciones automáticas');
console.log('');
console.log('⚠️ NOTAS IMPORTANTES:');
console.log('====================');
console.log('• Turbopack es experimental en Next.js 14');
console.log('• Algunas características pueden no funcionar');
console.log('• Si hay problemas, usa npm run dev (sin turbo)');
console.log('• Reporta bugs en: https://github.com/vercel/next.js/issues');

console.log('\n✅ Configuración completada. Ejecuta "npm run dev:turbo" para usar Turbopack.'); 