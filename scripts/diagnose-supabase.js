#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO COMPLETO DE SUPABASE');
console.log('===================================\n');

// 1. Verificar variables de entorno
console.log('📋 1. VERIFICANDO VARIABLES DE ENTORNO');
console.log('=====================================');

const envFiles = ['.env.local', '.env', '.env.production'];
let envFound = false;

envFiles.forEach(envFile => {
  const envPath = path.join(__dirname, '..', envFile);
  if (fs.existsSync(envPath)) {
    console.log(`✅ ${envFile} encontrado`);
    envFound = true;
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL');
    const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    
    console.log(`  ${hasSupabaseUrl ? '✅' : '❌'} NEXT_PUBLIC_SUPABASE_URL`);
    console.log(`  ${hasSupabaseKey ? '✅' : '❌'} NEXT_PUBLIC_SUPABASE_ANON_KEY`);
    
    if (!hasSupabaseUrl || !hasSupabaseKey) {
      console.log('⚠️ Variables de Supabase faltantes');
    }
  } else {
    console.log(`❌ ${envFile} no encontrado`);
  }
});

if (!envFound) {
  console.log('❌ No se encontró ningún archivo .env');
  console.log('📝 Creando .env.local con variables de ejemplo...');
  
  const envExample = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Other configurations
NEXT_PUBLIC_SITE_URL=http://localhost:3000
`;
  
  fs.writeFileSync(path.join(__dirname, '..', '.env.local'), envExample);
  console.log('✅ .env.local creado con variables de ejemplo');
}

// 2. Verificar imágenes faltantes
console.log('\n🖼️ 2. VERIFICANDO IMÁGENES FALTANTES');
console.log('===================================');

const imagesDir = path.join(__dirname, '../public/images');
const missingImages = [
  'quad1.jpg', 'whales1.jpg', 'ocean_dinner1.jpg', 'food_tour1.jpg',
  'convertible1.jpg', 'traditional_restaurant.jpg', 'teide_crater.jpg',
  'quad2.jpg', 'teide_sunset.jpg', 'canarian_food.jpg', 'teide_cable.jpg',
  'quad_adventure.jpg', 'quad_group.jpg', 'sunset_dining.jpg',
  'bmw_interior.jpg', 'dolphins.jpg', 'boat_tour.jpg', 'convertible_coast.jpg',
  'ocean_dinner.jpg', 'whale_watching.jpg', 'volcanic_landscape.jpg',
  'food_tour_market.jpg', 'whales2.jpg', 'local_tapas.jpg'
];

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log('✅ Directorio de imágenes creado');
}

const existingImages = fs.readdirSync(imagesDir);
console.log(`📁 Imágenes existentes: ${existingImages.length}`);

let missingCount = 0;
missingImages.forEach(filename => {
  const filepath = path.join(imagesDir, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`❌ Faltante: ${filename}`);
    missingCount++;
    
    // Crear placeholder
    const name = filename.replace('.jpg', '').replace(/_/g, ' ');
    const svg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f8fafc"/>
      <text x="50%" y="50%" font-family="Arial" font-size="32" fill="#64748b" text-anchor="middle">${name}</text>
      <text x="50%" y="70%" font-family="Arial" font-size="16" fill="#94a3b8" text-anchor="middle">Placeholder</text>
    </svg>`;
    
    fs.writeFileSync(filepath, svg);
    console.log(`  ✅ Creado placeholder: ${filename}`);
  }
});

console.log(`📊 Imágenes faltantes: ${missingCount}`);

// 3. Verificar archivos críticos
console.log('\n📁 3. VERIFICANDO ARCHIVOS CRÍTICOS');
console.log('==================================');

const criticalFiles = [
  'lib/supabase-optimized.ts',
  'hooks/use-auth.ts',
  'components/auth-guard.tsx',
  'middleware.ts'
];

criticalFiles.forEach(file => {
  const filepath = path.join(__dirname, '..', file);
  if (fs.existsSync(filepath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - NO ENCONTRADO`);
  }
});

// 4. Verificar dependencias
console.log('\n📦 4. VERIFICANDO DEPENDENCIAS');
console.log('=============================');

const packageJsonPath = path.join(__dirname, '../package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = [
    '@supabase/supabase-js',
    '@radix-ui/react-popover',
    '@radix-ui/react-progress',
    '@radix-ui/react-switch',
    '@radix-ui/react-tabs'
  ];
  
  requiredDeps.forEach(dep => {
    if (dependencies[dep]) {
      console.log(`✅ ${dep}`);
    } else {
      console.log(`❌ ${dep} - FALTANTE`);
    }
  });
}

// 5. Generar script de limpieza
console.log('\n🧹 5. SCRIPT DE LIMPIEZA PARA EL NAVEGADOR');
console.log('==========================================');

const browserScript = `
// Script para limpiar completamente el estado de autenticación
console.log('🧹 Limpiando estado de autenticación...');

// Limpiar localStorage
localStorage.clear();
console.log('✅ localStorage limpiado');

// Limpiar sessionStorage
sessionStorage.clear();
console.log('✅ sessionStorage limpiado');

// Limpiar cookies
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log('✅ cookies limpiadas');

// Limpiar datos específicos de Supabase
const supabaseKeys = Object.keys(localStorage).filter(key => key.includes('supabase') || key.includes('sb-'));
supabaseKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log('🗑️ Removido:', key);
});

// Recargar página
console.log('🔄 Recargando página...');
window.location.reload();
`;

console.log('📋 Ejecuta este script en la consola del navegador:');
console.log(browserScript);

// 6. Resumen y recomendaciones
console.log('\n📊 RESUMEN Y RECOMENDACIONES');
console.log('============================');

console.log('\n🔧 ACCIONES REQUERIDAS:');
console.log('1. Configura las variables de Supabase en .env.local');
console.log('2. Ejecuta el script de limpieza en el navegador');
console.log('3. Reinicia el servidor: npm run dev');
console.log('4. Verifica la conexión a Supabase');

console.log('\n💡 CONSEJOS:');
console.log('- Asegúrate de que Supabase esté funcionando');
console.log('- Verifica que las credenciales sean correctas');
console.log('- Limpia el cache del navegador si persisten los problemas');

console.log('\n🏁 Diagnóstico completado'); 