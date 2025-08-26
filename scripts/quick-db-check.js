const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function quickCheck() {
  console.log('🔍 Verificación rápida de la base de datos...\n');

  try {
    // 1. Verificar si las funciones existen
    console.log('1️⃣ Verificando funciones SQL...');
    
    const { data: functions, error: funcError } = await supabase
      .rpc('get_service_age_ranges', { service_id: 1 });
    
    if (funcError) {
      console.log('❌ Función get_service_age_ranges no disponible:', funcError.message);
    } else {
      console.log('✅ Función get_service_age_ranges disponible');
    }

    // 2. Verificar estructura de la tabla services
    console.log('\n2️⃣ Verificando estructura de la tabla services...');
    
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id, name, price, age_ranges')
      .limit(1);
    
    if (servicesError) {
      console.log('❌ Error al acceder a services:', servicesError.message);
    } else {
      console.log('✅ Tabla services accesible');
      if (services && services.length > 0) {
        const service = services[0];
        console.log(`   - ID: ${service.id}`);
        console.log(`   - Nombre: ${service.name}`);
        console.log(`   - Precio: ${service.price}`);
        console.log(`   - age_ranges: ${service.age_ranges ? '✅ Presente' : '❌ Ausente'}`);
      }
    }

    // 3. Verificar tabla age_price_ranges
    console.log('\n3️⃣ Verificando tabla age_price_ranges...');
    
    const { data: ranges, error: rangesError } = await supabase
      .from('age_price_ranges')
      .select('id, service_id, min_age, max_age, price')
      .limit(3);
    
    if (rangesError) {
      console.log('❌ Error al acceder a age_price_ranges:', rangesError.message);
    } else {
      console.log('✅ Tabla age_price_ranges accesible');
      if (ranges && ranges.length > 0) {
        console.log(`   - Rangos encontrados: ${ranges.length}`);
        ranges.forEach((range, index) => {
          console.log(`     ${index + 1}. Servicio ${range.service_id}: ${range.min_age}-${range.max_age} años = €${range.price}`);
        });
      }
    }

    // 4. Intentar crear un servicio de prueba
    console.log('\n4️⃣ Probando inserción de servicio...');
    
    const testService = {
      name: 'Servicio de Prueba - ' + Date.now(),
      description: 'Servicio temporal para pruebas',
      price: 50.00,
      duration: 120,
      max_capacity: 10,
      category: 'test',
      location: 'test',
      age_ranges: [
        { min_age: 0, max_age: 2, price: 0, price_type: 'baby', is_active: true },
        { min_age: 3, max_age: 12, price: 25, price_type: 'child', is_active: true },
        { min_age: 13, max_age: 17, price: 40, price_type: 'teen', is_active: true },
        { min_age: 18, max_age: 65, price: 50, price_type: 'adult', is_active: true }
      ]
    };

    const { data: newService, error: insertError } = await supabase
      .from('services')
      .insert(testService)
      .select()
      .single();

    if (insertError) {
      console.log('❌ Error al insertar servicio:', insertError.message);
      
      // Verificar si es por falta de columnas
      if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
        console.log('💡 Parece que faltan columnas en la tabla services');
      }
    } else {
      console.log('✅ Servicio insertado correctamente');
      console.log(`   - ID: ${newService.id}`);
      console.log(`   - age_ranges: ${newService.age_ranges ? '✅ Presente' : '❌ Ausente'}`);
      
      // Limpiar el servicio de prueba
      await supabase.from('services').delete().eq('id', newService.id);
      console.log('   - Servicio de prueba eliminado');
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
  }
}

quickCheck().catch(console.error);
