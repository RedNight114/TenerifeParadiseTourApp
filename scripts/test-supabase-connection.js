#!/usr/bin/env node

/**
 * 🧪 Prueba de Conexión a Supabase
 * 
 * Este script prueba la conexión a Supabase y verifica que los datos se cargan correctamente.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('🧪 PROBANDO CONEXIÓN A SUPABASE');
  console.log('===============================\n');

  // Verificar variables de entorno
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Variables de entorno faltantes');
    console.log('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseKey);
    return;
  }

  console.log('✅ Variables de entorno configuradas');

  try {
    // Crear cliente
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Cliente Supabase creado');

    // Probar conexión básica
    console.log('\n🔍 Probando conexión básica...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (testError) {
      console.log('❌ Error de conexión:', testError.message);
      return;
    }

    console.log('✅ Conexión básica exitosa');

    // Probar carga de servicios
    console.log('\n🔍 Probando carga de servicios...');
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id, title')
      .limit(5);

    if (servicesError) {
      console.log('❌ Error cargando servicios:', servicesError.message);
    } else {
      console.log('✅ Servicios cargados:', services?.length || 0, 'servicios');
    }

    // Probar carga de categorías
    console.log('\n🔍 Probando carga de categorías...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(5);

    if (categoriesError) {
      console.log('❌ Error cargando categorías:', categoriesError.message);
    } else {
      console.log('✅ Categorías cargadas:', categories?.length || 0, 'categorías');
    }

    // Probar autenticación anónima
    console.log('\n🔍 Probando autenticación anónima...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.log('❌ Error de autenticación:', authError.message);
    } else {
      console.log('✅ Autenticación funcionando');
      console.log('   Sesión activa:', !!session);
    }

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

testSupabaseConnection();
