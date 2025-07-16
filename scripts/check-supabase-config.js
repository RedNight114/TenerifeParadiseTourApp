const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de Supabase...\n');

// Verificar archivos de variables de entorno
const envFiles = [
  '.env.local',
  '.env',
  '.env.development',
  '.env.production'
];

let envFileFound = false;
let supabaseUrl = null;
let supabaseKey = null;

for (const envFile of envFiles) {
  const envPath = path.join(__dirname, '..', envFile);
  if (fs.existsSync(envPath)) {
    console.log(`✅ Archivo ${envFile} encontrado`);
    envFileFound = true;
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        supabaseUrl = line.split('=')[1]?.trim();
      }
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
        supabaseKey = line.split('=')[1]?.trim();
      }
    }
    break;
  }
}

if (!envFileFound) {
  console.log('❌ No se encontró ningún archivo de variables de entorno');
  console.log('📝 Crea un archivo .env.local con las siguientes variables:');
  console.log('');
  console.log('NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase');
  console.log('');
  process.exit(1);
}

console.log('\n📋 Variables de entorno encontradas:');
console.log(`URL de Supabase: ${supabaseUrl ? '✅ Configurada' : '❌ No configurada'}`);
console.log(`Clave anónima: ${supabaseKey ? '✅ Configurada' : '❌ No configurada'}`);

if (!supabaseUrl || !supabaseKey) {
  console.log('\n❌ Faltan variables de entorno requeridas');
  console.log('📝 Asegúrate de que NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY estén configuradas');
  process.exit(1);
}

// Verificar formato de URL
if (!supabaseUrl.startsWith('https://')) {
  console.log('\n⚠️  La URL de Supabase debe comenzar con https://');
}

// Verificar formato de clave
if (supabaseKey.length < 50) {
  console.log('\n⚠️  La clave anónima parece ser muy corta');
}

console.log('\n✅ Configuración de Supabase verificada correctamente');
console.log('🚀 Puedes ejecutar tu aplicación ahora'); 