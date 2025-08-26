// =====================================================
// SCRIPT DE PRUEBA CON VARIABLES DE ENTORNO CARGADAS
// =====================================================

// Cargar variables de entorno desde .env
require('dotenv').config()

const { createClient } = require('@supabase/supabase-js')

console.log('🔍 DIAGNÓSTICO CON VARIABLES DE ENTORNO CARGADAS\n')

// Verificar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('📋 VARIABLES DE ENTORNO:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Configurado' : '❌ NO configurado')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Configurado' : '❌ NO configurado')

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ ERROR: Las variables de Supabase no están configuradas')
  console.error('💡 Verifica que tu archivo .env tenga:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui')
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_aqui')
  process.exit(1)
}

if (supabaseUrl === 'your_supabase_url_here' || supabaseKey === 'your_supabase_anon_key_here') {
  console.error('\n❌ ERROR: Las variables de Supabase tienen valores de placeholder')
  console.error('💡 Reemplaza los valores de placeholder con tus credenciales reales')
  process.exit(1)
}

console.log('\n✅ Variables de entorno configuradas correctamente')
console.log('📍 URL:', supabaseUrl)
console.log('🔑 Key (primeros 10 caracteres):', supabaseKey.substring(0, 10) + '...')

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('\n🔄 Probando conexión con Supabase...')
    
    // Prueba 1: Health check básico
    const { data, error } = await supabase
      .from('services')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('❌ Error en health check:', error)
      return false
    }
    
    console.log('✅ Conexión exitosa con Supabase')
    
    // Prueba 2: Contar servicios
    console.log('\n🔄 Contando servicios...')
    const { count, error: countError } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ Error contando servicios:', countError)
      return false
    }
    
    console.log(`✅ Total de servicios en la base de datos: ${count}`)
    
    if (count === 0) {
      console.log('⚠️ ADVERTENCIA: No hay servicios en la base de datos')
      console.log('💡 Esto explica por qué no se muestran en el frontend')
      return false
    }
    
    // Prueba 3: Obtener servicios destacados
    console.log('\n🔄 Obteniendo servicios destacados...')
    const { data: featuredData, error: featuredError } = await supabase
      .from('services')
      .select(`
        id,
        title,
        description,
        price,
        available,
        featured,
        images
      `)
      .eq('featured', true)
      .eq('available', true)
      .limit(6)
    
    if (featuredError) {
      console.error('❌ Error obteniendo servicios destacados:', featuredError)
      return false
    }
    
    console.log(`✅ Servicios destacados encontrados: ${featuredData.length}`)
    
    if (featuredData.length > 0) {
      console.log('📋 Primeros servicios destacados:')
      featuredData.forEach((service, index) => {
        console.log(`   ${index + 1}. ${service.title} - €${service.price || 'N/A'}`)
      })
    } else {
      console.log('⚠️ No hay servicios destacados disponibles')
    }
    
    // Prueba 4: Verificar estructura de datos
    console.log('\n🔄 Verificando estructura de datos...')
    const { data: sampleData, error: sampleError } = await supabase
      .from('services')
      .select('*')
      .limit(1)
    
    if (sampleError) {
      console.error('❌ Error obteniendo muestra de datos:', sampleError)
      return false
    }
    
    if (sampleData && sampleData.length > 0) {
      const service = sampleData[0]
      console.log('📋 Estructura del primer servicio:')
      console.log('   - ID:', service.id)
      console.log('   - Título:', service.title)
      console.log('   - Descripción:', service.description ? '✅ Presente' : '❌ Ausente')
      console.log('   - Precio:', service.price ? `€${service.price}` : '❌ Ausente')
      console.log('   - Disponible:', service.available ? '✅ Sí' : '❌ No')
      console.log('   - Destacado:', service.featured ? '✅ Sí' : '❌ No')
      console.log('   - Imágenes:', service.images ? '✅ Presentes' : '❌ Ausentes')
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Error inesperado:', error)
    return false
  }
}

async function main() {
  console.log('🚀 INICIANDO PRUEBAS DE CONEXIÓN\n')
  
  try {
    const success = await testConnection()
    
    if (success) {
      console.log('\n🎯 DIAGNÓSTICO COMPLETADO EXITOSAMENTE!')
      console.log('✅ La conexión con Supabase está funcionando')
      console.log('✅ Los servicios están disponibles en la base de datos')
      console.log('💡 El problema puede estar en:')
      console.log('   1. La inicialización del cliente en el frontend')
      console.log('   2. Los permisos RLS (Row Level Security)')
      console.log('   3. El hook useServicesSimple')
      console.log('   4. La renderización de los componentes')
    } else {
      console.log('\n❌ DIAGNÓSTICO FALLÓ')
      console.log('💡 Verifica:')
      console.log('   1. Que la base de datos tenga servicios')
      console.log('   2. Que los servicios estén marcados como disponibles')
      console.log('   3. Que haya servicios destacados')
    }
    
  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error)
    process.exit(1)
  }
}

// Ejecutar pruebas
main()




