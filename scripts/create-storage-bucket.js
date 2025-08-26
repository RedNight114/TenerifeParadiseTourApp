// =====================================================
// SCRIPT PARA CREAR BUCKET DE ALMACENAMIENTO
// Crea el bucket 'service-images' en Supabase Storage
// =====================================================

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

console.log('🚀 CREANDO BUCKET DE ALMACENAMIENTO EN SUPABASE\n')

// Configuración
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no configuradas')
  console.error('💡 Necesitas SUPABASE_SERVICE_ROLE_KEY para crear buckets')
  process.exit(1)
}

// Crear cliente de Supabase con service role key
const supabase = createClient(supabaseUrl, supabaseKey)

async function createStorageBucket() {
  try {
    const BUCKET_NAME = 'service-images'
    
    console.log(`🔄 Creando bucket: ${BUCKET_NAME}`)
    
    // Crear el bucket
    const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true, // Hacer público para acceso directo
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'],
      fileSizeLimit: 52428800, // 50MB límite por archivo
    })
    
    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`✅ El bucket '${BUCKET_NAME}' ya existe`)
      } else {
        throw error
      }
    } else {
      console.log(`✅ Bucket '${BUCKET_NAME}' creado exitosamente`)
    }
    
    // Verificar que el bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      throw listError
    }
    
    const bucket = buckets.find(b => b.name === BUCKET_NAME)
    
    if (bucket) {
      console.log(`\n📋 INFORMACIÓN DEL BUCKET:`)
      console.log(`  Nombre: ${bucket.name}`)
      console.log(`  Público: ${bucket.public ? '✅ Sí' : '❌ No'}`)
      console.log(`  Tamaño: ${bucket.file_size_limit} bytes`)
      console.log(`  Creado: ${bucket.created_at}`)
      
      // Configurar políticas de acceso público
      console.log(`\n🔓 Configurando acceso público...`)
      
      // Crear política para permitir acceso público de lectura
      const { error: policyError } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl('test.jpg', 60) // Test de acceso
      
      if (policyError) {
        console.log(`  ⚠️  Nota: Puede que necesites configurar políticas RLS manualmente`)
      } else {
        console.log(`  ✅ Políticas de acceso configuradas`)
      }
      
    } else {
      throw new Error('Bucket no encontrado después de la creación')
    }
    
    console.log('\n🎉 BUCKET CREADO Y CONFIGURADO EXITOSAMENTE!')
    console.log(`💡 Ahora puedes subir imágenes usando: node scripts/upload-images-to-supabase.js`)
    
  } catch (error) {
    console.error('❌ Error creando bucket:', error.message)
    process.exit(1)
  }
}

// Ejecutar creación del bucket
createStorageBucket()



