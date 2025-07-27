#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚨 CORRECCIÓN DE EMERGENCIA');
console.log('===========================\n');

// 1. Crear .env.local si no existe
console.log('📋 1. Configurando variables de entorno...');

const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Payment Configuration (if needed)
REDSYS_MERCHANT_CODE=your_merchant_code
REDSYS_SECRET_KEY=your_secret_key
REDSYS_TERMINAL=001
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local creado');
  console.log('⚠️ IMPORTANTE: Configura las credenciales de Supabase en .env.local');
} else {
  console.log('✅ .env.local ya existe');
}

// 2. Crear imágenes faltantes
console.log('\n🖼️ 2. Creando imágenes faltantes...');

const imagesDir = path.join(__dirname, '../public/images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const missingImages = [
  'quad1.jpg', 'whales1.jpg', 'ocean_dinner1.jpg', 'food_tour1.jpg',
  'convertible1.jpg', 'traditional_restaurant.jpg', 'teide_crater.jpg',
  'quad2.jpg', 'teide_sunset.jpg', 'canarian_food.jpg', 'teide_cable.jpg',
  'quad_adventure.jpg', 'quad_group.jpg', 'sunset_dining.jpg',
  'bmw_interior.jpg', 'dolphins.jpg', 'boat_tour.jpg', 'convertible_coast.jpg',
  'ocean_dinner.jpg', 'whale_watching.jpg', 'volcanic_landscape.jpg',
  'food_tour_market.jpg', 'whales2.jpg', 'local_tapas.jpg'
];

let created = 0;
missingImages.forEach(filename => {
  const filepath = path.join(imagesDir, filename);
  if (!fs.existsSync(filepath)) {
    const name = filename.replace('.jpg', '').replace(/_/g, ' ');
    const svg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f8fafc"/>
      <text x="50%" y="50%" font-family="Arial" font-size="32" fill="#64748b" text-anchor="middle">${name}</text>
      <text x="50%" y="70%" font-family="Arial" font-size="16" fill="#94a3b8" text-anchor="middle">Placeholder</text>
    </svg>`;
    
    fs.writeFileSync(filepath, svg);
    created++;
  }
});

console.log(`✅ ${created} imágenes de placeholder creadas`);

// 3. Limpiar cache
console.log('\n🧹 3. Limpiando cache...');

const nextDir = path.join(__dirname, '..', '.next');
if (fs.existsSync(nextDir)) {
  try {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('✅ Cache .next eliminado');
  } catch (error) {
    console.log('⚠️ Error eliminando cache:', error.message);
  }
}

// 4. Script para el navegador
console.log('\n🌐 4. SCRIPT PARA EL NAVEGADOR');
console.log('=============================');

const browserScript = `
// EJECUTA ESTO EN LA CONSOLA DEL NAVEGADOR (F12)

console.log('🧹 Limpiando estado de autenticación...');

// Limpiar todo el almacenamiento
localStorage.clear();
sessionStorage.clear();

// Limpiar cookies
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

// Limpiar datos específicos de Supabase
const supabaseKeys = Object.keys(localStorage).filter(key => 
  key.includes('supabase') || key.includes('sb-') || key.includes('auth')
);
supabaseKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log('🗑️ Removido:', key);
});

console.log('✅ Limpieza completada');
console.log('🔄 Recargando página...');
window.location.reload();
`;

console.log('📋 Copia y pega este script en la consola del navegador:');
console.log(browserScript);

// 5. Instrucciones finales
console.log('\n📋 INSTRUCCIONES FINALES');
console.log('========================');

console.log('\n🔧 PASOS A SEGUIR:');
console.log('1. Configura las credenciales de Supabase en .env.local');
console.log('2. Ejecuta el script de limpieza en el navegador');
console.log('3. Reinicia el servidor: npm run dev');
console.log('4. Verifica que las imágenes se muestren correctamente');

console.log('\n💡 CONSEJOS:');
console.log('- Las credenciales de Supabase deben ser reales');
console.log('- Verifica que Supabase esté funcionando');
console.log('- Si persisten problemas, limpia el cache del navegador');

console.log('\n🏁 Corrección de emergencia completada'); 