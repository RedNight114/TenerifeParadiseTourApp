// =====================================================
// SCRIPT PARA LISTAR IMÁGENES REALES EN VERCEL BLOB STORAGE
// Conecta con Vercel Blob y lista todas las imágenes disponibles
// =====================================================

require('dotenv').config()
const { list } = require('@vercel/blob')

console.log('🔍 LISTANDO IMÁGENES REALES EN VERCEL BLOB STORAGE\n')

// Configuración
const vercelBlobToken = process.env.BLOB_READ_WRITE_TOKEN

if (!vercelBlobToken) {
  console.error('❌ Variable de entorno BLOB_READ_WRITE_TOKEN no configurada')
  console.error('💡 Necesitas configurar esta variable con el token de Vercel Blob')
  console.error('🔑 Token encontrado en el dashboard: vercel_blob_rw_KyKyyQGa68E5J720_JZ8LExAsVgDMCcTkXghvCqrX1yI4p5')
  process.exit(1)
}

async function listVercelBlobImages() {
  try {
    console.log('🔄 Conectando con Vercel Blob Storage...')
    
    // Listar todas las imágenes en el bucket
    const { blobs } = await list({
      token: vercelBlobToken,
      limit: 1000 // Obtener hasta 1000 imágenes
    })
    
    console.log(`✅ ${blobs.length} imágenes encontradas en Vercel Blob\n`)
    
    if (blobs.length === 0) {
      console.log('❌ No hay imágenes en Vercel Blob Storage')
      return
    }
    
    // Agrupar imágenes por directorio
    const imagesByDirectory = {}
    
    blobs.forEach((blob, index) => {
      const path = blob.pathname
      const directory = path.split('/')[0] || 'root'
      
      if (!imagesByDirectory[directory]) {
        imagesByDirectory[directory] = []
      }
      
      imagesByDirectory[directory].push({
        path: path,
        url: blob.url,
        size: blob.size,
        uploadedAt: blob.uploadedAt
      })
    })
    
    // Mostrar imágenes organizadas por directorio
    Object.entries(imagesByDirectory).forEach(([directory, images]) => {
      console.log(`📁 ${directory.toUpperCase()} (${images.length} imágenes):`)
      
      images.forEach((image, index) => {
        const sizeKB = (image.size / 1024).toFixed(1)
        const date = new Date(image.uploadedAt).toLocaleDateString('es-ES')
        
        console.log(`  ${index + 1}. ${image.path}`)
        console.log(`     📏 Tamaño: ${sizeKB} KB`)
        console.log(`     📅 Subida: ${date}`)
        console.log(`     🔗 URL: ${image.url}`)
        console.log('')
      })
    })
    
    // Resumen estadístico
    console.log('📊 RESUMEN ESTADÍSTICO:')
    console.log(`  Total de imágenes: ${blobs.length}`)
    console.log(`  Directorios: ${Object.keys(imagesByDirectory).length}`)
    
    // Mostrar directorios con más imágenes
    const sortedDirectories = Object.entries(imagesByDirectory)
      .sort(([,a], [,b]) => b.length - a.length)
    
    console.log('\n📁 DIRECTORIOS POR CANTIDAD DE IMÁGENES:')
    sortedDirectories.forEach(([directory, images]) => {
      console.log(`  ${directory}: ${images.length} imágenes`)
    })
    
    // Recomendaciones
    console.log('\n💡 RECOMENDACIONES:')
    console.log('  🔴 Estas son las imágenes REALES que necesitas migrar')
    console.log('  💡 Ejecuta: node scripts/migrate-vercel-to-supabase.js')
    console.log('  ⚠️  Asegúrate de que el token tenga permisos de lectura')
    
  } catch (error) {
    console.error('❌ Error conectando con Vercel Blob:', error.message)
    
    if (error.message.includes('401') || error.message.includes('403')) {
      console.error('💡 El token no tiene permisos o ha expirado')
      console.error('🔑 Verifica el token en el dashboard de Vercel')
    }
    
    process.exit(1)
  }
}

// Ejecutar listado
listVercelBlobImages()
