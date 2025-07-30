const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function configureRedsysTest() {
  console.log('🔧 CONFIGURACIÓN REDSYS PARA PRUEBAS');
  console.log('=====================================');
  
  // 🔥 CONFIGURACIÓN CORRECTA PARA PRUEBAS REDSYS
  const TEST_CONFIG = {
    // Entorno de pruebas
    REDSYS_ENVIRONMENT: 'https://sis-t.redsys.es:25443/sis/realizarPago',
    
    // Datos de prueba oficiales de Redsys
    REDSYS_MERCHANT_CODE: '999008881', // Código de comercio de pruebas
    REDSYS_TERMINAL: '001', // Terminal de pruebas
    REDSYS_SECRET_KEY: 'sq7HjrUOBfKmC576ILgskD5srU870gJ7', // Clave de pruebas
    
    // URLs de prueba
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000'
  };
  
  console.log('📋 Configuración de pruebas Redsys:');
  console.log('- Entorno:', TEST_CONFIG.REDSYS_ENVIRONMENT);
  console.log('- Código de comercio:', TEST_CONFIG.REDSYS_MERCHANT_CODE);
  console.log('- Terminal:', TEST_CONFIG.REDSYS_TERMINAL);
  console.log('- Clave secreta:', TEST_CONFIG.REDSYS_SECRET_KEY);
  console.log('- URL del sitio:', TEST_CONFIG.NEXT_PUBLIC_SITE_URL);
  
  console.log('\n⚠️ PROBLEMA IDENTIFICADO:');
  console.log('Estás usando el entorno de PRUEBAS pero con datos de PRODUCCIÓN');
  console.log('- Entorno actual: sis-t.redsys.es (PRUEBAS)');
  console.log('- Código de comercio actual: 367529286 (PRODUCCIÓN)');
  console.log('- Esto causa el error SIS0042');
  
  console.log('\n🔧 SOLUCIÓN:');
  console.log('Para pruebas, usa estos datos:');
  console.log('- Código de comercio: 999008881');
  console.log('- Terminal: 001');
  console.log('- Clave secreta: sq7HjrUOBfKmC576ILgskD5srU870gJ7');
  
  console.log('\n📝 Variables de entorno para .env.local:');
  console.log('=====================================');
  console.log(`REDSYS_ENVIRONMENT=${TEST_CONFIG.REDSYS_ENVIRONMENT}`);
  console.log(`REDSYS_MERCHANT_CODE=${TEST_CONFIG.REDSYS_MERCHANT_CODE}`);
  console.log(`REDSYS_TERMINAL=${TEST_CONFIG.REDSYS_TERMINAL}`);
  console.log(`REDSYS_SECRET_KEY=${TEST_CONFIG.REDSYS_SECRET_KEY}`);
  console.log(`NEXT_PUBLIC_SITE_URL=${TEST_CONFIG.NEXT_PUBLIC_SITE_URL}`);
  console.log('=====================================');
  
  console.log('\n🎯 PASOS PARA CORREGIR:');
  console.log('1. Actualiza las variables de entorno en .env.local');
  console.log('2. Reinicia el servidor de desarrollo');
  console.log('3. Prueba un pago con tarjeta de prueba: 4548812049400004');
  console.log('4. El error SIS0042 debería desaparecer');
  
  // Verificar configuración actual
  console.log('\n🔍 CONFIGURACIÓN ACTUAL:');
  console.log('- REDSYS_ENVIRONMENT:', process.env.REDSYS_ENVIRONMENT);
  console.log('- REDSYS_MERCHANT_CODE:', process.env.REDSYS_MERCHANT_CODE);
  console.log('- REDSYS_TERMINAL:', process.env.REDSYS_TERMINAL);
  console.log('- REDSYS_SECRET_KEY:', process.env.REDSYS_SECRET_KEY ? 'Configurada' : 'No configurada');
  console.log('- NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL);
}

// Ejecutar la configuración
configureRedsysTest().catch(console.error); 