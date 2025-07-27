#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎨 CREANDO IMÁGENES FALTANTES');
console.log('=============================\n');

const imagesDir = path.join(__dirname, '../public/images');

// Asegurar que el directorio existe
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

console.log(`📋 Creando ${missingImages.length} imágenes de placeholder...`);

let created = 0;
missingImages.forEach(filename => {
  const filepath = path.join(imagesDir, filename);
  
  // Crear SVG placeholder con diseño mejorado
  const name = filename.replace('.jpg', '').replace(/_/g, ' ');
  const displayName = name.replace(/\b\w/g, l => l.toUpperCase());
  
  const svg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#e2e8f0;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#cbd5e1;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#gradient)"/>
    <rect x="20" y="20" width="760" height="560" rx="10" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
    <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#475569" text-anchor="middle">${displayName}</text>
    <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="18" fill="#64748b" text-anchor="middle">Imagen de Servicio</text>
    <text x="50%" y="70%" font-family="Arial, sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle">Placeholder - Reemplazar con imagen real</text>
    <circle cx="50%" cy="85%" r="3" fill="#64748b"/>
  </svg>`;
  
  fs.writeFileSync(filepath, svg);
  console.log(`✅ ${filename}`);
  created++;
});

console.log(`\n🎉 ¡${created} imágenes creadas exitosamente!`);
console.log('🔄 Recarga la página para ver los cambios');
console.log('\n💡 Las imágenes ahora deberían cargarse correctamente');
console.log('📋 Puedes reemplazar estas imágenes de placeholder con imágenes reales más tarde'); 