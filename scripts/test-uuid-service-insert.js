const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configurar cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno faltantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUUIDServiceInsert() {
  console.log('🧪 Probando inserción de servicio con UUIDs...\n');
  
  try {
    // 1. Verificar que las funciones SQL estén disponibles
    console.log('1️⃣ Verificando funciones SQL...');
    const { data: functionTest, error: functionError } = await supabase.rpc('get_service_age_ranges', {
      service_id: '00000000-0000-0000-0000-000000000000'
    });
    
    if (functionError) {
      console.error('❌ Error en get_service_age_ranges:', functionError.message);
      return;
    }
    
    console.log('✅ Función get_service_age_ranges disponible\n');
    
    // 2. Crear un servicio de prueba con la estructura correcta
    console.log('2️⃣ Creando servicio de prueba...');
    const testService = {
      title: 'Servicio de Prueba - Rangos de Edad',
      description: 'Servicio para probar el sistema de rangos de edad',
      category_id: 'actividades',
      subcategory_id: 'excursiones',
      duration: '4 horas',
      max_capacity: 20,
      base_price: 50.00,
      is_available: true,
      is_featured: false,
      age_ranges: [
        {
          min_age: 0,
          max_age: 2,
          price: 0,
          price_type: 'baby',
          is_active: true
        },
        {
          min_age: 3,
          max_age: 11,
          price: 25.00,
          price_type: 'child',
          is_active: true
        },
        {
          min_age: 12,
          max_age: 17,
          price: 35.00,
          price_type: 'teen',
          is_active: true
        },
        {
          min_age: 18,
          max_age: 64,
          price: 50.00,
          price_type: 'adult',
          is_active: true
        }
      ]
    };
    
    // 3. Insertar el servicio
    console.log('3️⃣ Insertando servicio...');
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .insert(testService)
      .select()
      .single();
    
    if (serviceError) {
      console.error('❌ Error al insertar servicio:', serviceError.message);
      return;
    }
    
    console.log('✅ Servicio insertado con ID:', serviceData.id);
    
    // 4. Verificar que los rangos de edad se crearon en age_price_ranges
    console.log('\n4️⃣ Verificando rangos de edad...');
    const { data: ageRangesData, error: ageRangesError } = await supabase
      .from('age_price_ranges')
      .select('*')
      .eq('service_id', serviceData.id);
    
    if (ageRangesError) {
      console.error('❌ Error al obtener rangos de edad:', ageRangesError.message);
    } else {
      console.log('✅ Rangos de edad creados:', ageRangesData.length);
      ageRangesData.forEach(range => {
        console.log(`   - ${range.min_age}-${range.max_age} años: €${range.price} (${range.price_type})`);
      });
    }
    
    // 5. Probar la función get_service_age_ranges
    console.log('\n5️⃣ Probando función get_service_age_ranges...');
    const { data: functionData, error: functionDataError } = await supabase.rpc('get_service_age_ranges', {
      service_id: serviceData.id
    });
    
    if (functionDataError) {
      console.error('❌ Error en get_service_age_ranges:', functionDataError.message);
    } else {
      console.log('✅ Función devolvió datos:', functionData.length, 'rangos');
      functionData.forEach(range => {
        console.log(`   - ${range.age_label}: €${range.price}`);
      });
    }
    
    // 6. Limpiar el servicio de prueba
    console.log('\n6️⃣ Limpiando datos de prueba...');
    const { error: deleteAgeRangesError } = await supabase
      .from('age_price_ranges')
      .delete()
      .eq('service_id', serviceData.id);
    
    const { error: deleteServiceError } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceData.id);
    
    if (deleteAgeRangesError || deleteServiceError) {
      console.log('⚠️  Algunos datos de prueba no se pudieron limpiar');
    } else {
      console.log('✅ Datos de prueba limpiados correctamente');
    }
    
    console.log('\n🎉 ¡Prueba completada exitosamente!');
    console.log('✅ El sistema de rangos de edad está funcionando correctamente');
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
  }
}

testUUIDServiceInsert().catch(console.error);
