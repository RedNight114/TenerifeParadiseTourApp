const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testCorrectServiceInsert() {
  console.log('🧪 Probando inserción de servicio con estructura correcta...\n');

  try {
    // 1. Verificar que las funciones SQL estén disponibles
    console.log('1️⃣ Verificando funciones SQL...');
    
    try {
      const { data: funcTest, error: funcError } = await supabase
        .rpc('get_service_age_ranges', { service_id: 1 });
      
      if (funcError) {
        console.log('❌ Función get_service_age_ranges no disponible:', funcError.message);
        console.log('💡 Necesitas ejecutar el script SQL primero');
        return;
      } else {
        console.log('✅ Función get_service_age_ranges disponible');
      }
    } catch (e) {
      console.log('❌ Error al verificar función:', e.message);
      return;
    }

    // 2. Crear un servicio de prueba con la estructura correcta
    console.log('\n2️⃣ Creando servicio de prueba...');
    
    const testService = {
      title: 'Servicio de Prueba - ' + Date.now(),
      description: 'Servicio temporal para pruebas del sistema de rangos de edad',
      category_id: 'actividades',
      subcategory_id: 'test',
      price: 50.00,
      duration: 120,
      capacity: 10,
      min_group_size: 1,
      max_group_size: 10,
      location: 'Ubicación de prueba',
      min_age: 18,
      available: true,
      featured: false,
      price_type: 'per_person',
      difficulty_level: 'facil',
      activity_type: 'Actividad de prueba',
      fitness_level_required: 'bajo',
      license_required: false,
      permit_required: false,
      insurance_included: false,
      fuel_included: false,
      deposit_required: false,
      deposit_amount: 0,
      transmission: 'manual',
      seats: 4,
      doors: 4,
      cancellation_policy: 'Política de cancelación de prueba',
      itinerary: 'Itinerario de prueba',
      // Arrays vacíos
      images: [],
      schedule: [],
      what_to_bring: [],
      included_services: [],
      not_included_services: [],
      pickup_locations: [],
      dietary_options: [],
      equipment_provided: [],
      guide_languages: [],
      // Rangos de edad
      age_ranges: [
        { min_age: 0, max_age: 2, price: 0, price_type: 'baby', is_active: true },
        { min_age: 3, max_age: 12, price: 25, price_type: 'child', is_active: true },
        { min_age: 13, max_age: 17, price: 40, price_type: 'teen', is_active: true },
        { min_age: 18, max_age: 65, price: 50, price_type: 'adult', is_active: true }
      ]
    };

    console.log('📝 Servicio de prueba a insertar:');
    console.log('   - Título:', testService.title);
    console.log('   - Precio:', testService.price);
    console.log('   - Rangos de edad:', testService.age_ranges.length);

    // 3. Insertar el servicio
    const { data: newService, error: insertError } = await supabase
      .from('services')
      .insert(testService)
      .select()
      .single();

    if (insertError) {
      console.log('❌ Error al insertar servicio:', insertError.message);
      
      if (insertError.message.includes('function') || insertError.message.includes('trigger')) {
        console.log('💡 El error sugiere un problema con las funciones SQL o triggers');
      }
      
      return;
    }

    console.log('✅ Servicio insertado correctamente');
    console.log('   - ID:', newService.id);
    console.log('   - Título:', newService.title);
    console.log('   - age_ranges:', newService.age_ranges ? '✅ Presente' : '❌ Ausente');

    // 4. Verificar que los rangos de edad se crearon en age_price_ranges
    console.log('\n3️⃣ Verificando rangos de edad creados...');
    
    const { data: ranges, error: rangesError } = await supabase
      .from('age_price_ranges')
      .select('*')
      .eq('service_id', newService.id);

    if (rangesError) {
      console.log('❌ Error al verificar rangos:', rangesError.message);
    } else if (ranges && ranges.length > 0) {
      console.log('✅ Rangos de edad creados correctamente:');
      ranges.forEach((range, index) => {
        console.log(`   ${index + 1}. ${range.min_age}-${range.max_age} años: €${range.price} (${range.price_type})`);
      });
    } else {
      console.log('❌ No se crearon rangos de edad');
    }

    // 5. Probar la función get_service_age_ranges
    console.log('\n4️⃣ Probando función get_service_age_ranges...');
    
    const { data: retrievedRanges, error: getError } = await supabase
      .rpc('get_service_age_ranges', { service_id: newService.id });

    if (getError) {
      console.log('❌ Error al obtener rangos:', getError.message);
    } else if (retrievedRanges && retrievedRanges.length > 0) {
      console.log('✅ Función get_service_age_ranges funcionando:');
      retrievedRanges.forEach((range, index) => {
        console.log(`   ${index + 1}. ${range.age_label}: €${range.price}`);
      });
    } else {
      console.log('❌ No se obtuvieron rangos con la función');
    }

    // 6. Limpiar el servicio de prueba
    console.log('\n5️⃣ Limpiando servicio de prueba...');
    
    // Primero eliminar rangos de edad
    await supabase.from('age_price_ranges').delete().eq('service_id', newService.id);
    console.log('   - Rangos de edad eliminados');
    
    // Luego eliminar el servicio
    await supabase.from('services').delete().eq('id', newService.id);
    console.log('   - Servicio eliminado');

    console.log('\n🎉 Prueba completada exitosamente');

  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
  }
}

testCorrectServiceInsert().catch(console.error);
