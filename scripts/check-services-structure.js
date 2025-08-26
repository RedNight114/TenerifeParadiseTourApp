const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkServicesStructure() {
  console.log('🔍 Verificando estructura real de la tabla services...\n');

  try {
    // 1. Obtener todas las columnas de la tabla services
    console.log('1️⃣ Estructura de la tabla services:');
    
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'services' });
    
    if (columnsError) {
      console.log('❌ No se puede obtener estructura con RPC, intentando método alternativo...');
      
      // Método alternativo: intentar seleccionar todas las columnas
      const { data: sampleData, error: sampleError } = await supabase
        .from('services')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.log('❌ Error al acceder a services:', sampleError.message);
        return;
      }
      
      if (sampleData && sampleData.length > 0) {
        const service = sampleData[0];
        console.log('✅ Columnas disponibles en services:');
        Object.keys(service).forEach(key => {
          console.log(`   - ${key}: ${typeof service[key]} (${service[key]})`);
        });
      }
    } else {
      console.log('✅ Estructura de la tabla:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    }

    // 2. Verificar si existe la columna age_ranges
    console.log('\n2️⃣ Verificando columna age_ranges:');
    
    const { data: ageRangesCheck, error: ageRangesError } = await supabase
      .from('services')
      .select('age_ranges')
      .limit(1);
    
    if (ageRangesError) {
      console.log('❌ Columna age_ranges no existe:', ageRangesError.message);
    } else {
      console.log('✅ Columna age_ranges existe');
    }

    // 3. Verificar funciones SQL disponibles
    console.log('\n3️⃣ Verificando funciones SQL:');
    
    try {
      const { data: funcTest, error: funcError } = await supabase
        .rpc('test_simple_function');
      
      if (funcError) {
        console.log('❌ Función de prueba no disponible:', funcError.message);
      } else {
        console.log('✅ Función de prueba disponible:', funcTest);
      }
    } catch (e) {
      console.log('❌ No se pueden listar funciones RPC');
    }

    // 4. Intentar obtener un servicio real
    console.log('\n4️⃣ Datos de ejemplo en services:');
    
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .limit(3);
    
    if (servicesError) {
      console.log('❌ Error al obtener servicios:', servicesError.message);
    } else if (services && services.length > 0) {
      console.log('✅ Servicios encontrados:');
      services.forEach((service, index) => {
        console.log(`   Servicio ${index + 1}:`);
        Object.keys(service).forEach(key => {
          const value = service[key];
          const displayValue = typeof value === 'object' ? JSON.stringify(value) : value;
          console.log(`     - ${key}: ${displayValue}`);
        });
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
  }
}

checkServicesStructure().catch(console.error);
