/**
 * Script para debuggear problemas en la página de servicios
 * Este script verifica posibles problemas comunes
 */

const { createClient } = require('@supabase/supabase-js')

async function debugServicesPage() {
  console.log('🔍 Iniciando debug de página de servicios...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables de entorno de Supabase no encontradas')
    console.log('Verifica que NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY estén configuradas')
    return
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // 1. Verificar conexión a Supabase
    console.log('1️⃣ Verificando conexión a Supabase...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('services')
      .select('id')
      .limit(1)
    
    if (connectionError) {
      console.error('❌ Error de conexión a Supabase:', connectionError.message)
      return
    }
    console.log('✅ Conexión a Supabase exitosa')
    
    // 2. Verificar tabla services
    console.log('2️⃣ Verificando tabla services...')
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id, title, available, featured')
      .limit(5)
    
    if (servicesError) {
      console.error('❌ Error al consultar servicios:', servicesError.message)
      return
    }
    console.log(`✅ Servicios encontrados: ${services.length}`)
    console.log('📋 Primeros servicios:', services)
    
    // 3. Verificar servicios disponibles
    console.log('3️⃣ Verificando servicios disponibles...')
    const { data: availableServices, error: availableError } = await supabase
      .from('services')
      .select('id, title, available')
      .eq('available', true)
    
    if (availableError) {
      console.error('❌ Error al consultar servicios disponibles:', availableError.message)
      return
    }
    console.log(`✅ Servicios disponibles: ${availableServices.length}`)
    
    // 4. Verificar tabla categories
    console.log('4️⃣ Verificando tabla categories...')
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
    
    if (categoriesError) {
      console.error('❌ Error al consultar categorías:', categoriesError.message)
      return
    }
    console.log(`✅ Categorías encontradas: ${categories.length}`)
    console.log('📋 Categorías:', categories)
    
    // 5. Verificar tabla subcategories
    console.log('5️⃣ Verificando tabla subcategories...')
    const { data: subcategories, error: subcategoriesError } = await supabase
      .from('subcategories')
      .select('id, name, category_id')
    
    if (subcategoriesError) {
      console.error('❌ Error al consultar subcategorías:', subcategoriesError.message)
      return
    }
    console.log(`✅ Subcategorías encontradas: ${subcategories.length}`)
    
    // 6. Verificar servicios con categorías
    console.log('6️⃣ Verificando servicios con categorías...')
    const { data: servicesWithCategories, error: servicesWithCategoriesError } = await supabase
      .from('services')
      .select(`
        id,
        title,
        category_id,
        subcategory_id,
        category:categories(id, name),
        subcategory:subcategories(id, name)
      `)
      .limit(3)
    
    if (servicesWithCategoriesError) {
      console.error('❌ Error al consultar servicios con categorías:', servicesWithCategoriesError.message)
      return
    }
    console.log('✅ Servicios con categorías:', servicesWithCategories)
    
    // 7. Verificar bucket de imágenes
    console.log('7️⃣ Verificando bucket de imágenes...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Error al consultar buckets:', bucketsError.message)
      return
    }
    
    const serviceImagesBucket = buckets.find(bucket => bucket.name === 'service-images')
    if (serviceImagesBucket) {
      console.log('✅ Bucket service-images encontrado')
      
      // Verificar archivos en el bucket
      const { data: files, error: filesError } = await supabase.storage
        .from('service-images')
        .list('', { limit: 5 })
      
      if (filesError) {
        console.error('❌ Error al consultar archivos del bucket:', filesError.message)
      } else {
        console.log(`✅ Archivos en bucket: ${files.length}`)
      }
    } else {
      console.log('⚠️ Bucket service-images no encontrado')
    }
    
    // 8. Verificar servicios con imágenes
    console.log('8️⃣ Verificando servicios con imágenes...')
    const { data: servicesWithImages, error: servicesWithImagesError } = await supabase
      .from('services')
      .select('id, title, images')
      .not('images', 'is', null)
      .not('images', 'eq', '{}')
      .limit(3)
    
    if (servicesWithImagesError) {
      console.error('❌ Error al consultar servicios con imágenes:', servicesWithImagesError.message)
      return
    }
    console.log(`✅ Servicios con imágenes: ${servicesWithImages.length}`)
    console.log('📋 Servicios con imágenes:', servicesWithImages)
    
    console.log('\n🎉 Debug completado exitosamente!')
    console.log('\n📝 Resumen:')
    console.log(`- Servicios totales: ${services.length}`)
    console.log(`- Servicios disponibles: ${availableServices.length}`)
    console.log(`- Categorías: ${categories.length}`)
    console.log(`- Subcategorías: ${subcategories.length}`)
    console.log(`- Servicios con imágenes: ${servicesWithImages.length}`)
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  debugServicesPage()
}

module.exports = { debugServicesPage }
