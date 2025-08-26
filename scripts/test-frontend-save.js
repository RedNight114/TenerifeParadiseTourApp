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

async function testServiceSave() {
  console.log('🔍 Probando guardado de servicio con rangos de edad...\n');

  try {
    // 1. Verificar que la función existe
    console.log('1️⃣ Verificando que la función upsert_service_age_ranges existe...');
    const { data: functions, error: funcError } = await supabase
      .rpc('get_service_age_ranges', { service_id: 1 });
    
    if (funcError) {
      console.log('❌ Error al verificar función:', funcError.message);
    } else {
      console.log('✅ Función get_service_age_ranges funciona');
    }

    // 2. Simular datos de un servicio (como los envía el frontend)
    const serviceData = {
      name: 'Test Service with Age Ranges',
      description: 'Servicio de prueba con rangos de edad',
      price: 100.00,
      duration: 120,
      max_capacity: 20,
      age_ranges: [
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
      ]
    };

    console.log('\n2️⃣ Datos del servicio a guardar:');
    console.log(JSON.stringify(serviceData, null, 2));

    // 3. Intentar insertar el servicio (esto debería activar el trigger)
    console.log('\n3️⃣ Insertando servicio en la tabla services...');
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .insert({
        name: serviceData.name,
        description: serviceData.description,
        price: serviceData.price,
        duration: serviceData.duration,
        max_capacity: serviceData.max_capacity,
        // Otros campos requeridos
        category: 'test',
        location: 'Test Location',
        included_services: [],
        excluded_services: [],
        requirements: [],
        cancellation_policy: 'Test policy',
        itinerary: 'Test itinerary'
      })
      .select()
      .single();

    if (serviceError) {
      console.log('❌ Error al insertar servicio:', serviceError.message);
      
      // Si el error es sobre la función, probar directamente
      if (serviceError.message.includes('Función no disponible') || 
          serviceError.message.includes('function') ||
          serviceError.message.includes('upsert_service_age_ranges')) {
        
        console.log('\n4️⃣ Probando la función upsert_service_age_ranges directamente...');
        
        const { data: directResult, error: directError } = await supabase
          .rpc('upsert_service_age_ranges', {
            service_id: 1,
            age_ranges: serviceData.age_ranges
          });
        
        if (directError) {
          console.log('❌ Error directo en upsert_service_age_ranges:', directError.message);
        } else {
          console.log('✅ Función upsert_service_age_ranges funciona directamente');
        }
      }
    } else {
      console.log('✅ Servicio insertado correctamente');
      console.log('ID del servicio:', service.id);
      
      // 4. Verificar que los rangos de edad se crearon
      console.log('\n4️⃣ Verificando rangos de edad creados...');
      const { data: ranges, error: rangesError } = await supabase
        .from('age_price_ranges')
        .select('*')
        .eq('service_id', service.id);
      
      if (rangesError) {
        console.log('❌ Error al verificar rangos:', rangesError.message);
      } else {
        console.log('✅ Rangos de edad encontrados:', ranges.length);
        console.log(ranges);
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.error(error);
  }
}

async function checkDatabaseState() {
  console.log('🔍 Verificando estado de la base de datos...\n');

  try {
    // Verificar tabla age_price_ranges
    const { data: tableInfo, error: tableError } = await supabase
      .from('age_price_ranges')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('❌ Error al acceder a age_price_ranges:', tableError.message);
    } else {
      console.log('✅ Tabla age_price_ranges accesible');
    }

    // Verificar tabla services
    const { data: servicesInfo, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .limit(1);
    
    if (servicesError) {
      console.log('❌ Error al acceder a services:', servicesError.message);
    } else {
      console.log('✅ Tabla services accesible');
    }

    // Verificar funciones disponibles
    console.log('\n📋 Funciones disponibles en la base de datos:');
    const { data: functions, error: funcsError } = await supabase
      .rpc('get_service_age_ranges', { service_id: 1 });
    
    if (funcsError) {
      console.log('❌ No se pueden listar funciones:', funcsError.message);
    } else {
      console.log('✅ Función get_service_age_ranges disponible');
    }

  } catch (error) {
    console.error('❌ Error al verificar estado:', error.message);
  }
}

async function main() {
  console.log('🚀 Iniciando diagnóstico del error "Función no disponible en versión de debug"\n');
  
  await checkDatabaseState();
  console.log('\n' + '='.repeat(60) + '\n');
  await testServiceSave();
  
  console.log('\n✅ Diagnóstico completado');
}

main().catch(console.error);
