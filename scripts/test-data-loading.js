#!/usr/bin/env node

/**
 * 🧪 Prueba de Carga de Datos en el Navegador
 * 
 * Este script simula la carga de datos como lo haría el navegador
 * para identificar problemas específicos de inicialización.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testDataLoading() {
  console.log('🧪 PROBANDO CARGA DE DATOS EN EL NAVEGADOR');
  console.log('==========================================\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Variables de entorno faltantes');
    return;
  }

  try {
    // Simular cliente del navegador
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false, // No persistir en Node.js
        detectSessionInUrl: false
      }
    });

    console.log('✅ Cliente Supabase creado (simulando navegador)');

    // 1. Probar carga inicial de servicios (como useServices)
    console.log('\n🔍 1. Probando carga inicial de servicios...');
    
    const startTime = Date.now();
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select(`
        *,
        category:categories(name),
        subcategory:subcategories(name)
      `)
      .order('created_at', { ascending: false });

    const loadTime = Date.now() - startTime;

    if (servicesError) {
      console.log('❌ Error cargando servicios:', servicesError.message);
      console.log('   Código de error:', servicesError.code);
      console.log('   Detalles:', servicesError.details);
    } else {
      console.log('✅ Servicios cargados exitosamente');
      console.log(`   Tiempo de carga: ${loadTime}ms`);
      console.log(`   Cantidad: ${services?.length || 0} servicios`);
      
      if (services && services.length > 0) {
        console.log('   Primer servicio:', {
          id: services[0].id,
          title: services[0].title,
          category: services[0].category?.name || 'Sin categoría'
        });
      }
    }

    // 2. Probar carga de categorías
    console.log('\n🔍 2. Probando carga de categorías...');
    
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (categoriesError) {
      console.log('❌ Error cargando categorías:', categoriesError.message);
    } else {
      console.log('✅ Categorías cargadas exitosamente');
      console.log(`   Cantidad: ${categories?.length || 0} categorías`);
      
      if (categories && categories.length > 0) {
        console.log('   Categorías disponibles:', categories.map(c => c.name).join(', '));
      }
    }

    // 3. Probar carga de subcategorías
    console.log('\n🔍 3. Probando carga de subcategorías...');
    
    const { data: subcategories, error: subcategoriesError } = await supabase
      .from('subcategories')
      .select('*')
      .order('name');

    if (subcategoriesError) {
      console.log('❌ Error cargando subcategorías:', subcategoriesError.message);
    } else {
      console.log('✅ Subcategorías cargadas exitosamente');
      console.log(`   Cantidad: ${subcategories?.length || 0} subcategorías`);
    }

    // 4. Probar autenticación anónima
    console.log('\n🔍 4. Probando autenticación anónima...');
    
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.log('❌ Error de autenticación:', authError.message);
    } else {
      console.log('✅ Autenticación funcionando');
      console.log('   Sesión activa:', !!session);
      console.log('   Usuario autenticado:', !!session?.user);
    }

    // 5. Probar permisos RLS
    console.log('\n🔍 5. Probando permisos RLS...');
    
    // Intentar insertar un registro de prueba (debería fallar por RLS)
    const { error: insertError } = await supabase
      .from('services')
      .insert([{
        title: 'Test Service',
        description: 'Test Description',
        category_id: categories?.[0]?.id || '00000000-0000-0000-0000-000000000000',
        price: 100,
        price_type: 'per_person'
      }]);

    if (insertError) {
      console.log('✅ RLS funcionando correctamente (inserción bloqueada)');
      console.log('   Error esperado:', insertError.message);
    } else {
      console.log('⚠️ RLS no está bloqueando inserciones (posible problema)');
    }

    // 6. Resumen de la prueba
    console.log('\n📊 RESUMEN DE LA PRUEBA');
    console.log('========================');
    
    const tests = [
      { name: 'Conexión a Supabase', passed: true },
      { name: 'Carga de servicios', passed: !servicesError },
      { name: 'Carga de categorías', passed: !categoriesError },
      { name: 'Carga de subcategorías', passed: !subcategoriesError },
      { name: 'Autenticación anónima', passed: !authError },
      { name: 'Permisos RLS', passed: !!insertError }
    ];

    tests.forEach(test => {
      const status = test.passed ? '✅' : '❌';
      console.log(`${status} ${test.name}: ${test.passed ? 'PASÓ' : 'FALLÓ'}`);
    });

    const passedTests = tests.filter(t => t.passed).length;
    const totalTests = tests.length;
    
    console.log(`\n🎯 Resultado: ${passedTests}/${totalTests} pruebas pasaron`);
    
    if (passedTests === totalTests) {
      console.log('🎉 ¡Todas las pruebas pasaron! El problema puede estar en el frontend.');
    } else {
      console.log('⚠️ Algunas pruebas fallaron. Revisar configuración de Supabase.');
    }

  } catch (error) {
    console.log('❌ Error general en la prueba:', error.message);
    console.log('   Stack:', error.stack);
  }
}

testDataLoading(); 