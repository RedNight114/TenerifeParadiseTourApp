const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAvatarBucket() {
  console.log('🔍 Verificando bucket de avatares...')
  
  try {
    // Listar buckets existentes
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Error listando buckets:', listError)
      return
    }
    
    console.log('📦 Buckets existentes:')
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (${bucket.public ? 'Público' : 'Privado'})`)
    })
    
    // Verificar si existe el bucket de avatares
    const avatarBucket = buckets.find(bucket => bucket.name === 'avatars')
    
    if (avatarBucket) {
      console.log('✅ Bucket "avatars" encontrado')
      console.log(`   - Público: ${avatarBucket.public ? 'Sí' : 'No'}`)
      
      // Listar archivos en el bucket
      const { data: files, error: filesError } = await supabase.storage.from('avatars').list()
      
      if (filesError) {
        console.error('❌ Error listando archivos:', filesError)
      } else {
        console.log(`   - Archivos: ${files.length}`)
        if (files.length > 0) {
          console.log('   - Primeros archivos:')
          files.slice(0, 5).forEach(file => {
            console.log(`     * ${file.name}`)
          })
        }
      }
    } else {
      console.log('❌ Bucket "avatars" no encontrado')
      console.log('🔧 Creando bucket de avatares...')
      
      const { error: createError } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5242880 // 5MB
      })
      
      if (createError) {
        console.error('❌ Error creando bucket:', createError)
      } else {
        console.log('✅ Bucket "avatars" creado exitosamente')
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

checkAvatarBucket() 