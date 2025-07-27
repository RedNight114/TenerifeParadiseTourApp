#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

console.log('🖼️ VERIFICANDO IMÁGENES DE SERVICIOS');
console.log('=====================================\n');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Variables de entorno de Supabase no configuradas');
  console.log('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkImages() {
  try {
    console.log('📡 Conectando a Supabase...');
    
    // Obtener todos los servicios con imágenes
    const { data: services, error } = await supabase
      .from('services')
      .select('id, title, images')
      .not('images', 'is', null);

    if (error) {
      console.log('❌ Error al obtener servicios:', error.message);
      return;
    }

    console.log(`✅ Se encontraron ${services.length} servicios con imágenes\n`);

    // Verificar carpeta de imágenes
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    if (!fs.existsSync(imagesDir)) {
      console.log('❌ La carpeta public/images no existe');
      console.log('Creando carpeta...');
      fs.mkdirSync(imagesDir, { recursive: true });
      console.log('✅ Carpeta public/images creada');
    }

    // Obtener lista de archivos en la carpeta images
    const existingImages = fs.readdirSync(imagesDir);
    console.log(`📁 Imágenes existentes en public/images: ${existingImages.length}\n`);

    let totalImages = 0;
    let missingImages = 0;
    let foundImages = 0;

    // Verificar cada servicio
    for (const service of services) {
      if (!service.images || !Array.isArray(service.images)) {
        console.log(`⚠️ Servicio ${service.title} no tiene imágenes válidas`);
        continue;
      }

      console.log(`🔍 Verificando servicio: ${service.title}`);
      
      for (const image of service.images) {
        totalImages++;
        
        if (existingImages.includes(image)) {
          foundImages++;
          console.log(`  ✅ ${image}`);
        } else {
          missingImages++;
          console.log(`  ❌ ${image} - FALTANTE`);
        }
      }
      console.log('');
    }

    // Resumen
    console.log('📋 RESUMEN DE VERIFICACIÓN');
    console.log('==========================');
    console.log(`📊 Total de imágenes referenciadas: ${totalImages}`);
    console.log(`✅ Imágenes encontradas: ${foundImages}`);
    console.log(`❌ Imágenes faltantes: ${missingImages}`);
    console.log(`📈 Porcentaje de cobertura: ${totalImages > 0 ? Math.round((foundImages / totalImages) * 100) : 0}%`);

    if (missingImages > 0) {
      console.log('\n🚨 ACCIONES RECOMENDADAS:');
      console.log('1. Añade las imágenes faltantes a la carpeta public/images/');
      console.log('2. Asegúrate de que los nombres coincidan exactamente');
      console.log('3. Verifica que las imágenes estén en formato JPG, PNG o WebP');
      console.log('4. Ejecuta este script nuevamente para verificar');
    } else {
      console.log('\n🎉 ¡TODAS LAS IMÁGENES ESTÁN PRESENTES!');
      console.log('El proyecto debería funcionar correctamente.');
    }

    // Mostrar imágenes faltantes específicas
    if (missingImages > 0) {
      console.log('\n📝 IMÁGENES FALTANTES:');
      console.log('=====================');
      
      for (const service of services) {
        if (!service.images || !Array.isArray(service.images)) continue;
        
        for (const image of service.images) {
          if (!existingImages.includes(image)) {
            console.log(`- ${image} (Servicio: ${service.title})`);
          }
        }
      }
    }

  } catch (error) {
    console.log('❌ Error durante la verificación:', error.message);
  }
}

// Ejecutar verificación
checkImages(); 