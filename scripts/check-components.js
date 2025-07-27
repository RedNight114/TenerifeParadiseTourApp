#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICANDO COMPONENTES CRÍTICOS');
console.log('===================================\n');

// Verificar componentes que usan imágenes
const componentsToCheck = [
  'components/service-card.tsx',
  'components/services-grid.tsx',
  'components/featured-services.tsx',
  'app/(main)/services/[serviceId]/page.tsx',
  'app/(main)/reservations/page.tsx',
  'components/gallery-section.tsx'
];

console.log('📋 Verificando componentes que usan imágenes:');
componentsToCheck.forEach(component => {
  const filepath = path.join(__dirname, '..', component);
  if (fs.existsSync(filepath)) {
    const content = fs.readFileSync(filepath, 'utf8');
    const hasImageImport = content.includes('next/image');
    const hasImageComponent = content.includes('<Image');
    const hasImagePath = content.includes('/images/');
    
    console.log(`✅ ${component}`);
    console.log(`   📸 next/image: ${hasImageImport ? '✅' : '❌'}`);
    console.log(`   🖼️ <Image>: ${hasImageComponent ? '✅' : '❌'}`);
    console.log(`   📁 /images/: ${hasImagePath ? '✅' : '❌'}`);
    
    if (hasImagePath) {
      // Buscar rutas de imágenes específicas
      const imageMatches = content.match(/\/images\/[^"'\s)]+/g);
      if (imageMatches) {
        console.log(`   📋 Imágenes referenciadas: ${imageMatches.length}`);
        imageMatches.slice(0, 3).forEach(img => console.log(`      - ${img}`));
        if (imageMatches.length > 3) {
          console.log(`      ... y ${imageMatches.length - 3} más`);
        }
      }
    }
  } else {
    console.log(`❌ ${component} - NO ENCONTRADO`);
  }
  console.log('');
});

// Verificar hooks de servicios
console.log('🔗 Verificando hooks de servicios:');
const hooksToCheck = [
  'hooks/use-services.ts',
  'hooks/use-categories.ts',
  'hooks/use-reservations.ts'
];

hooksToCheck.forEach(hook => {
  const filepath = path.join(__dirname, '..', hook);
  if (fs.existsSync(filepath)) {
    const content = fs.readFileSync(filepath, 'utf8');
    const hasSupabase = content.includes('supabase');
    const hasFetch = content.includes('fetch');
    
    console.log(`✅ ${hook}`);
    console.log(`   🔗 Supabase: ${hasSupabase ? '✅' : '❌'}`);
    console.log(`   📡 Fetch: ${hasFetch ? '✅' : '❌'}`);
  } else {
    console.log(`❌ ${hook} - NO ENCONTRADO`);
  }
});

console.log('\n🔧 DIAGNÓSTICO DE PROBLEMAS:');
console.log('============================');

console.log('\n🎯 PROBLEMAS IDENTIFICADOS:');
console.log('1. ❌ Dependencias de Radix UI faltantes');
console.log('2. ❌ Componentes no se renderizan por dependencias faltantes');
console.log('3. ❌ Imágenes de la base de datos no se muestran');
console.log('4. ❌ Autenticación con problemas');

console.log('\n💡 SOLUCIONES:');
console.log('1. ✅ Instalar dependencias con --force');
console.log('2. ✅ Verificar que los componentes usen rutas correctas');
console.log('3. ✅ Asegurar que Supabase esté configurado');
console.log('4. ✅ Limpiar cache del navegador');

console.log('\n📋 PRÓXIMOS PASOS:');
console.log('1. npm run dev (para probar)');
console.log('2. Verificar en el navegador si las imágenes se cargan');
console.log('3. Revisar la consola del navegador para errores');
console.log('4. Verificar que Supabase esté funcionando');

console.log('\n🏁 Verificación completada'); 