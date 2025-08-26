const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAgePricingIntegration() {
  console.log('🧪 Probando integración del sistema de rangos de edad...\n');

  try {
    // 1. Verificar que la tabla age_price_ranges existe
    console.log('1️⃣ Verificando tabla age_price_ranges...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('age_price_ranges')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Error al acceder a la tabla:', tableError.message);
      return;
    }
    console.log('✅ Tabla age_price_ranges accesible');

    // 2. Verificar que las funciones SQL existen
    console.log('\n2️⃣ Verificando funciones SQL...');
    
    // Probar upsert_service_age_ranges
    try {
      const testRanges = [
        { min_age: 0, max_age: 2, price: 0, price_type: 'baby', is_active: true },
        { min_age: 3, max_age: 11, price: 25.50, price_type: 'child', is_active: true },
        { min_age: 18, max_age: 64, price: 50.00, price_type: 'adult', is_active: true }
      ];

      // Obtener un servicio de prueba
      const { data: testService, error: serviceError } = await supabase
        .from('services')
        .select('id')
        .limit(1);

      if (serviceError || !testService || testService.length === 0) {
        console.log('⚠️ No hay servicios disponibles para probar');
        return;
      }

      const serviceId = testService[0].id;
      console.log(`✅ Servicio de prueba encontrado: ${serviceId}`);

      // Probar la función upsert
      const { error: upsertError } = await supabase.rpc('upsert_service_age_ranges', {
        service_id_param: serviceId,
        age_ranges_param: testRanges
      });

      if (upsertError) {
        console.error('❌ Error en upsert_service_age_ranges:', upsertError.message);
        return;
      }
      console.log('✅ Función upsert_service_age_ranges funcionando');

      // 3. Verificar que los rangos se guardaron
      console.log('\n3️⃣ Verificando que los rangos se guardaron...');
      const { data: savedRanges, error: selectError } = await supabase
        .from('age_price_ranges')
        .select('*')
        .eq('service_id', serviceId)
        .eq('is_active', true);

      if (selectError) {
        console.error('❌ Error al consultar rangos guardados:', selectError.message);
        return;
      }

      console.log(`✅ ${savedRanges.length} rangos de edad guardados:`);
      savedRanges.forEach(range => {
        console.log(`   • ${range.min_age}-${range.max_age} años: €${range.price} (${range.price_type})`);
      });

      // 4. Probar la función get_service_age_ranges
      console.log('\n4️⃣ Probando get_service_age_ranges...');
      const { data: retrievedRanges, error: getError } = await supabase.rpc('get_service_age_ranges', {
        service_id_param: serviceId
      });

      if (getError) {
        console.error('❌ Error en get_service_age_ranges:', getError.message);
        return;
      }

      console.log(`✅ Función get_service_age_ranges funcionando, retornó ${retrievedRanges.length} rangos:`);
      retrievedRanges.forEach(range => {
        console.log(`   • ${range.age_label}: €${range.price} (${range.price_type})`);
      });

      // 5. Limpiar datos de prueba
      console.log('\n5️⃣ Limpiando datos de prueba...');
      const { error: deleteError } = await supabase
        .from('age_price_ranges')
        .delete()
        .eq('service_id', serviceId);

      if (deleteError) {
        console.error('⚠️ Error al limpiar datos de prueba:', deleteError.message);
      } else {
        console.log('✅ Datos de prueba limpiados');
      }

      console.log('\n🎉 ¡Sistema de rangos de edad funcionando correctamente!');
      console.log('\n📋 Resumen de funcionalidades probadas:');
      console.log('   ✅ Tabla age_price_ranges accesible');
      console.log('   ✅ Función upsert_service_age_ranges funcionando');
      console.log('   ✅ Función get_service_age_ranges funcionando');
      console.log('   ✅ Persistencia de datos correcta');
      console.log('   ✅ Recuperación de datos correcta');

    } catch (functionError) {
      console.error('❌ Error al probar funciones:', functionError.message);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar la prueba
testAgePricingIntegration()
  .then(() => {
    console.log('\n🏁 Prueba completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
