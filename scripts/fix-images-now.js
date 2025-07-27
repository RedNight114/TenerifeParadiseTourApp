#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚨 CORRECCIÓN INMEDIATA DE IMÁGENES');
console.log('==================================\n');

const imagesDir = path.join(__dirname, '../public/images');

// Verificar si el directorio existe
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log('✅ Directorio de imágenes creado');
}

// Lista de imágenes que faltan según los errores 404
const missingImages = [
  'quad1.jpg', 'whales1.jpg', 'ocean_dinner1.jpg', 'food_tour1.jpg',
  'convertible1.jpg', 'traditional_restaurant.jpg', 'teide_crater.jpg',
  'quad2.jpg', 'teide_sunset.jpg', 'canarian_food.jpg', 'teide_cable.jpg',
  'quad_adventure.jpg', 'quad_group.jpg', 'sunset_dining.jpg',
  'bmw_interior.jpg', 'dolphins.jpg', 'boat_tour.jpg', 'convertible_coast.jpg',
  'ocean_dinner.jpg', 'whale_watching.jpg', 'volcanic_landscape.jpg',
  'food_tour_market.jpg', 'whales2.jpg', 'local_tapas.jpg'
];

console.log('📋 Verificando imágenes existentes...');
const existingImages = fs.readdirSync(imagesDir);
console.log(`📁 Imágenes existentes: ${existingImages.length}`);

console.log('\n🎨 Creando imágenes faltantes...');

let created = 0;
missingImages.forEach(filename => {
  const filepath = path.join(imagesDir, filename);
  
  // Forzar creación (sobrescribir si existe)
  const name = filename.replace('.jpg', '').replace(/_/g, ' ');
  const displayName = name.replace(/\b\w/g, l => l.toUpperCase());
  
  // Crear un SVG simple y efectivo
  const svg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f1f5f9"/>
    <rect x="10" y="10" width="780" height="580" rx="8" fill="white" stroke="#e2e8f0" stroke-width="2"/>
    <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#334155" text-anchor="middle">${displayName}</text>
    <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="16" fill="#64748b" text-anchor="middle">Servicio de Tenerife</text>
    <text x="50%" y="75%" font-family="Arial, sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle">Placeholder</text>
  </svg>`;
  
  try {
    fs.writeFileSync(filepath, svg);
    console.log(`✅ ${filename}`);
    created++;
  } catch (error) {
    console.log(`❌ Error creando ${filename}: ${error.message}`);
  }
});

console.log(`\n📊 RESUMEN:`);
console.log(`  ✅ Imágenes creadas: ${created}`);
console.log(`  📁 Total en directorio: ${fs.readdirSync(imagesDir).length}`);

// Verificar que las imágenes se crearon correctamente
console.log('\n🔍 Verificando archivos creados...');
missingImages.forEach(filename => {
  const filepath = path.join(imagesDir, filename);
  if (fs.existsSync(filepath)) {
    const stats = fs.statSync(filepath);
    console.log(`✅ ${filename} (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${filename} - NO CREADO`);
  }
});

console.log('\n🔄 INSTRUCCIONES:');
console.log('1. Las imágenes han sido creadas');
console.log('2. Recarga la página (Ctrl+F5)');
console.log('3. Si persisten los errores 404, reinicia el servidor:');
console.log('   - Detén el servidor (Ctrl+C)');
console.log('   - Ejecuta: npm run dev');

console.log('\n🏁 Corrección completada'); 