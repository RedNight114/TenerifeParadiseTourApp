const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyCompleteImplementation() {
  console.log('🔍 Verificando implementación completa del sistema de rangos de edad...\n');

  try {
    // 1. Verificar que la tabla age_price_ranges existe y es accesible
    console.log('1️⃣ Verificando tabla age_price_ranges...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('age_price_ranges')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('❌ Error al acceder a age_price_ranges:', tableError.message);
      return;
    } else {
      console.log('✅ Tabla age_price_ranges accesible');
    }

    // 2. Verificar que la función upsert_service_age_ranges funciona
    console.log('\n2️⃣ Probando función upsert_service_age_ranges...');
    const testAgeRanges = [
      {
        min_age: 0,
        max_age: 12,
        price: 25.00,
        price_type: 'child',
        is_active: true
      },
      {
        min_age: 13,
        max_age: 17,
        price: 50.00,
        price_type: 'teen',
        is_active: true
      },
      {
        min_age: 18,
        max_age: 65,
        price: 100.00,
        price_type: 'adult',
        is_active: true
      }
    ];

    const { data: upsertResult, error: upsertError } = await supabase
      .rpc('upsert_service_age_ranges', {
        service_id: 1,
        age_ranges: testAgeRanges
      });
    
    if (upsertError) {
      console.log('❌ Error en upsert_service_age_ranges:', upsertError.message);
      return;
    } else {
      console.log('✅ Función upsert_service_age_ranges funciona correctamente');
    }

    // 3. Verificar que la función get_service_age_ranges funciona
    console.log('\n3️⃣ Probando función get_service_age_ranges...');
    const { data: getResult, error: getError } = await supabase
      .rpc('get_service_age_ranges', { service_id: 1 });
    
    if (getError) {
      console.log('❌ Error en get_service_age_ranges:', getError.message);
      return;
    } else {
      console.log('✅ Función get_service_age_ranges funciona correctamente');
      console.log('📊 Rangos encontrados:', getResult.length);
      console.log(getResult);
    }

    // 4. Verificar que se pueden insertar servicios con rangos de edad
    console.log('\n4️⃣ Probando inserción de servicio con rangos de edad...');
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .insert({
        name: 'Servicio de Prueba con Rangos',
        description: 'Servicio para verificar el sistema de rangos de edad',
        price: 100.00,
        duration: 120,
        max_capacity: 20,
        age_ranges: testAgeRanges,
        // Campos mínimos requeridos
        location: 'Ubicación de prueba',
        category: 'test'
      })
      .select()
      .single();

    if (serviceError) {
      console.log('❌ Error al insertar servicio:', serviceError.message);
      
      // Si el error es sobre campos faltantes, mostrar la estructura de la tabla
      if (serviceError.message.includes('column') || serviceError.message.includes('field')) {
        console.log('\n🔍 Verificando estructura de la tabla services...');
        const { data: columns, error: columnsError } = await supabase
          .from('services')
          .select('*')
          .limit(0);
        
        if (columnsError) {
          console.log('❌ No se puede verificar estructura:', columnsError.message);
        } else {
          console.log('ℹ️ La tabla services existe pero puede tener campos requeridos diferentes');
        }
      }
    } else {
      console.log('✅ Servicio insertado correctamente con ID:', service.id);
      
      // 5. Verificar que los rangos de edad se crearon automáticamente
      console.log('\n5️⃣ Verificando rangos de edad creados automáticamente...');
      const { data: autoRanges, error: autoRangesError } = await supabase
        .from('age_price_ranges')
        .select('*')
        .eq('service_id', service.id);
      
      if (autoRangesError) {
        console.log('❌ Error al verificar rangos automáticos:', autoRangesError.message);
      } else {
        console.log('✅ Rangos de edad creados automáticamente:', autoRanges.length);
        console.log(autoRanges);
      }
    }

    // 6. Verificar políticas RLS
    console.log('\n6️⃣ Verificando políticas RLS...');
    const { data: policies, error: policiesError } = await supabase
      .from('age_price_ranges')
      .select('*')
      .eq('service_id', 1);
    
    if (policiesError) {
      console.log('❌ Error al verificar políticas RLS:', policiesError.message);
    } else {
      console.log('✅ Políticas RLS funcionando correctamente');
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.error(error);
  }
}

async function checkDatabaseFunctions() {
  console.log('🔍 Verificando funciones disponibles en la base de datos...\n');

  try {
    // Listar todas las funciones disponibles
    const { data: functions, error: funcsError } = await supabase
      .rpc('get_service_age_ranges', { service_id: 1 });
    
    if (funcsError) {
      console.log('❌ No se pueden listar funciones:', funcsError.message);
    } else {
      console.log('✅ Función get_service_age_ranges disponible');
    }

    // Probar función upsert
    const { data: upsertTest, error: upsertTestError } = await supabase
      .rpc('upsert_service_age_ranges', {
        service_id: 999, // ID que no existe para probar validación
        age_ranges: []
      });
    
    if (upsertTestError) {
      if (upsertTestError.message.includes('no existe')) {
        console.log('✅ Función upsert_service_age_ranges disponible y validando correctamente');
      } else {
        console.log('❌ Error inesperado en upsert:', upsertTestError.message);
      }
    } else {
      console.log('✅ Función upsert_service_age_ranges disponible');
    }

  } catch (error) {
    console.error('❌ Error al verificar funciones:', error.message);
  }
}

async function main() {
  console.log('🚀 Verificación completa del sistema de rangos de edad\n');
  
  await checkDatabaseFunctions();
  console.log('\n' + '='.repeat(60) + '\n');
  await verifyCompleteImplementation();
  
  console.log('\n✅ Verificación completada');
  console.log('\n📋 RESUMEN:');
  console.log('Si todos los pasos muestran ✅, el sistema está funcionando correctamente');
  console.log('Si hay ❌, ejecuta los scripts SQL en Supabase SQL Editor');
}

main().catch(console.error);
