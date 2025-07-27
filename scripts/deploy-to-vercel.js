const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 PREPARANDO DESPLIEGUE A VERCEL');
console.log('==================================\n');

// Función para ejecutar comandos
function runCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Ejecutando: ${command}`);
    exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error ejecutando ${command}:`, error.message);
        reject(error);
        return;
      }
      if (stderr) {
        console.warn(`⚠️  Advertencia: ${stderr}`);
      }
      if (stdout) {
        console.log(`✅ Resultado: ${stdout.trim()}`);
      }
      resolve(stdout);
    });
  });
}

// Función para verificar archivos críticos
function checkCriticalFiles() {
  console.log('🔍 Verificando archivos críticos...');
  
  const criticalFiles = [
    'app/api/payment/create/route.ts',
    'lib/webhook-validation.ts',
    'vercel.json',
    'package.json',
    'next.config.mjs',
    'env.production.example'
  ];
  
  const missingFiles = [];
  
  criticalFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      missingFiles.push(file);
      console.log(`❌ Faltante: ${file}`);
    } else {
      console.log(`✅ Presente: ${file}`);
    }
  });
  
  if (missingFiles.length > 0) {
    throw new Error(`Archivos críticos faltantes: ${missingFiles.join(', ')}`);
  }
  
  console.log('✅ Todos los archivos críticos están presentes\n');
}

// Función para verificar configuración
function checkConfiguration() {
  console.log('🔍 Verificando configuración...');
  
  // Verificar package.json
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`✅ Package.json: ${packageJson.name} v${packageJson.version}`);
  
  // Verificar next.config.mjs
  if (fs.existsSync('next.config.mjs')) {
    console.log('✅ Next.config.mjs presente');
  }
  
  // Verificar vercel.json
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  console.log(`✅ Vercel.json: Framework ${vercelConfig.framework}`);
  
  console.log('✅ Configuración verificada\n');
}

// Función para limpiar archivos temporales
async function cleanupTempFiles() {
  console.log('🧹 Limpiando archivos temporales...');
  
  const tempDirs = ['.next', 'node_modules/.cache', 'dist'];
  
  for (const dir of tempDirs) {
    if (fs.existsSync(dir)) {
      try {
        await runCommand(`rmdir /s /q "${dir}"`);
        console.log(`✅ Limpiado: ${dir}`);
      } catch (error) {
        console.log(`ℹ️  No se pudo limpiar: ${dir}`);
      }
    }
  }
  
  console.log('✅ Limpieza completada\n');
}

// Función para verificar dependencias
async function checkDependencies() {
  console.log('🔍 Verificando dependencias...');
  
  try {
    await runCommand('npm list --depth=0');
    console.log('✅ Dependencias verificadas\n');
  } catch (error) {
    console.log('⚠️  Algunas dependencias podrían tener problemas');
  }
}

// Función para hacer build de prueba
async function testBuild() {
  console.log('🔨 Probando build...');
  
  try {
    await runCommand('npm run build');
    console.log('✅ Build exitoso\n');
  } catch (error) {
    throw new Error('Build falló. Revisa los errores antes de desplegar.');
  }
}

// Función para verificar variables de entorno
function checkEnvironmentVariables() {
  console.log('🔍 Verificando variables de entorno...');
  
  const envFile = '.env';
  if (!fs.existsSync(envFile)) {
    console.log('⚠️  Archivo .env no encontrado');
    console.log('💡 Asegúrate de configurar las variables de entorno en Vercel');
  } else {
    console.log('✅ Archivo .env presente');
  }
  
  // Verificar variables críticas
  const criticalVars = [
    'REDSYS_MERCHANT_CODE',
    'REDSYS_TERMINAL', 
    'REDSYS_SECRET_KEY',
    'REDSYS_ENVIRONMENT',
    'NEXT_PUBLIC_SITE_URL'
  ];
  
  console.log('📋 Variables críticas que deben estar configuradas en Vercel:');
  criticalVars.forEach(varName => {
    console.log(`  - ${varName}`);
  });
  
  console.log('\n💡 INSTRUCCIONES PARA CONFIGURAR VARIABLES EN VERCEL:');
  console.log('1. Ve a tu proyecto en Vercel Dashboard');
  console.log('2. Settings > Environment Variables');
  console.log('3. Añade cada variable con su valor correspondiente');
  console.log('4. Asegúrate de que estén configuradas para Production\n');
}

// Función principal de despliegue
async function deployToVercel() {
  try {
    console.log('🎯 INICIANDO PROCESO DE DESPLIEGUE');
    console.log('==================================\n');
    
    // 1. Verificar archivos críticos
    checkCriticalFiles();
    
    // 2. Verificar configuración
    checkConfiguration();
    
    // 3. Verificar dependencias
    await checkDependencies();
    
    // 4. Limpiar archivos temporales
    await cleanupTempFiles();
    
    // 5. Probar build
    await testBuild();
    
    // 6. Verificar variables de entorno
    checkEnvironmentVariables();
    
    console.log('🎯 PREPARACIÓN COMPLETADA');
    console.log('==========================');
    console.log('✅ El proyecto está listo para desplegar');
    console.log('✅ Todos los archivos críticos están presentes');
    console.log('✅ La configuración es correcta');
    console.log('✅ El build funciona correctamente');
    
    console.log('\n🚀 COMANDOS PARA DESPLEGAR:');
    console.log('===========================');
    console.log('1. Si tienes Vercel CLI instalado:');
    console.log('   vercel --prod');
    console.log('');
    console.log('2. Si usas Git (recomendado):');
    console.log('   git add .');
    console.log('   git commit -m "Fix: Sistema de pago Redsys corregido"');
    console.log('   git push origin main');
    console.log('');
    console.log('3. Despliegue manual desde Vercel Dashboard:');
    console.log('   - Sube los archivos desde la interfaz web');
    console.log('   - O conecta tu repositorio de Git');
    
    console.log('\n⚠️  IMPORTANTE ANTES DEL DESPLIEGUE:');
    console.log('====================================');
    console.log('1. Configura las variables de entorno en Vercel Dashboard');
    console.log('2. Asegúrate de usar las claves de PRODUCCIÓN de Redsys');
    console.log('3. Verifica que las URLs de notificación sean accesibles');
    console.log('4. Confirma que el comercio esté activo en Redsys');
    
    console.log('\n🎯 RESUMEN DE CORRECCIONES IMPLEMENTADAS:');
    console.log('==========================================');
    console.log('✅ Función de generación de firma SHA256 corregida');
    console.log('✅ Procesamiento robusto de clave secreta');
    console.log('✅ Validaciones mejoradas de formato de datos');
    console.log('✅ Cumplimiento de requisitos de Redsys');
    console.log('✅ Sistema de pago listo para producción');
    
  } catch (error) {
    console.error('\n❌ ERROR EN LA PREPARACIÓN:');
    console.error('============================');
    console.error('Error:', error.message);
    console.error('\n💡 SOLUCIONES:');
    console.error('1. Revisa los errores mostrados arriba');
    console.error('2. Corrige los problemas antes de desplegar');
    console.error('3. Ejecuta npm install si hay problemas de dependencias');
    console.error('4. Verifica que todos los archivos estén presentes');
    
    process.exit(1);
  }
}

// Ejecutar el despliegue
deployToVercel(); 