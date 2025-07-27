const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkCategories() {
  console.log('🔍 Verificando categorías en la base de datos...')
  
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('❌ Error al obtener categorías:', error)
      return
    }
    
    console.log('✅ Categorías encontradas:')
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ID: "${category.id}" | Nombre: "${category.name}"`)
    })
    
    console.log('\n📋 Nombres exactos para usar en el código:')
    categories.forEach((category) => {
      console.log(`case "${category.name}":`)
    })
    
    console.log('\n🔧 Verificando subcategorías...')
    const { data: subcategories, error: subError } = await supabase
      .from('subcategories')
      .select('*, categories(name)')
      .order('name')
    
    if (subError) {
      console.error('❌ Error al obtener subcategorías:', subError)
      return
    }
    
    console.log('✅ Subcategorías encontradas:')
    subcategories.forEach((subcategory, index) => {
      console.log(`${index + 1}. ID: "${subcategory.id}" | Nombre: "${subcategory.name}" | Categoría: "${subcategory.categories.name}"`)
    })
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

checkCategories() 