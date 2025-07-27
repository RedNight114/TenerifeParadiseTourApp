#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎨 FORZANDO CREACIÓN DE IMÁGENES');
console.log('================================\n');

const imagesDir = path.join(__dirname, '../public/images');

// Asegurar que el directorio existe
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log('✅ Directorio de imágenes creado');
}

// Lista completa de imágenes que faltan
const allImages = [
  'quad1.jpg', 'whales1.jpg', 'ocean_dinner1.jpg', 'food_tour1.jpg',
  'convertible1.jpg', 'traditional_restaurant.jpg', 'teide_crater.jpg',
  'quad2.jpg', 'teide_sunset.jpg', 'canarian_food.jpg', 'teide_cable.jpg',
  'quad_adventure.jpg', 'quad_group.jpg', 'sunset_dining.jpg',
  'bmw_interior.jpg', 'dolphins.jpg', 'boat_tour.jpg', 'convertible_coast.jpg',
  'ocean_dinner.jpg', 'whale_watching.jpg', 'volcanic_landscape.jpg',
  'food_tour_market.jpg', 'whales2.jpg', 'local_tapas.jpg'
];

console.log(`📋 Creando ${allImages.length} imágenes...`);

let created = 0;
allImages.forEach(filename => {
  const filepath = path.join(imagesDir, filename);
  
  // Forzar creación (sobrescribir si existe)
  const name = filename.replace('.jpg', '').replace(/_/g, ' ');
  const svg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f8fafc"/>
    <text x="50%" y="50%" font-family="Arial" font-size="32" fill="#64748b" text-anchor="middle">${name}</text>
    <text x="50%" y="70%" font-family="Arial" font-size="16" fill="#94a3b8" text-anchor="middle">Placeholder</text>
  </svg>`;
  
  fs.writeFileSync(filepath, svg);
  console.log(`✅ ${filename}`);
  created++;
});

console.log(`\n🎉 ¡${created} imágenes creadas exitosamente!`);
console.log('🔄 Recarga la página para ver los cambios'); 