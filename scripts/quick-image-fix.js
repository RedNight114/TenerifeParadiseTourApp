#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 CORRECCIÓN RÁPIDA DE IMÁGENES');
console.log('================================\n');

const imagesDir = path.join(__dirname, '../public/images');

// Verificar si el directorio existe
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log('✅ Directorio de imágenes creado');
}

// Lista de imágenes que faltan según los errores
const missingImages = [
  'quad1.jpg', 'whales1.jpg', 'ocean_dinner1.jpg', 'food_tour1.jpg',
  'convertible1.jpg', 'traditional_restaurant.jpg', 'teide_crater.jpg',
  'quad2.jpg', 'teide_sunset.jpg', 'canarian_food.jpg', 'teide_cable.jpg',
  'quad_adventure.jpg', 'quad_group.jpg', 'sunset_dining.jpg',
  'bmw_interior.jpg', 'dolphins.jpg', 'boat_tour.jpg', 'convertible_coast.jpg',
  'ocean_dinner.jpg', 'whale_watching.jpg', 'volcanic_landscape.jpg'
];

// Crear imágenes de placeholder simples
let created = 0;
missingImages.forEach(filename => {
  const filepath = path.join(imagesDir, filename);
  
  if (!fs.existsSync(filepath)) {
    // Crear un SVG simple como placeholder
    const name = filename.replace('.jpg', '').replace(/_/g, ' ');
    const svg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f1f5f9"/>
      <text x="50%" y="50%" font-family="Arial" font-size="28" fill="#475569" text-anchor="middle">${name}</text>
    </svg>`;
    
    fs.writeFileSync(filepath, svg);
    console.log(`✅ Creado: ${filename}`);
    created++;
  }
});

console.log(`\n📊 RESUMEN:`);
console.log(`  ✅ Imágenes creadas: ${created}`);
console.log(`  📁 Total en directorio: ${fs.readdirSync(imagesDir).length}`);

if (created > 0) {
  console.log('\n🎉 ¡IMÁGENES CREADAS!');
  console.log('🔄 Recarga la página para ver los cambios');
} else {
  console.log('\nℹ️ Todas las imágenes ya existen');
}

console.log('\n🏁 Corrección completada'); 