#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixMissingImages() {
  console.log('🔧 Solucionando imágenes faltantes...')
  
  try {
    // 1. Obtener todos los servicios
    console.log('1. Obteniendo servicios...')
    const { data: services, error } = await supabase
      .from('services')
      .select('id, title, images')
    
    if (error) {
      console.error('❌ Error al obtener servicios:', error)
      return
    }
    
    // 2. Extraer todos los nombres de archivo únicos
    const allImageNames = new Set()
    services.forEach(service => {
      if (service.images && Array.isArray(service.images)) {
        service.images.forEach(img => {
          // Solo procesar nombres de archivo locales (no URLs completas)
          if (img && !img.startsWith('http') && !img.startsWith('https')) {
            allImageNames.add(img)
          }
        })
      }
    })
    
    console.log(`📋 Total de nombres de archivo únicos: ${allImageNames.size}`)
    
    // 3. Verificar qué archivos existen en public/images
    const imagesDir = path.join(__dirname, '..', 'public', 'images')
    const existingFiles = fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir) : []
    console.log(`📁 Archivos existentes en public/images: ${existingFiles.length}`)
    
    // 4. Identificar archivos faltantes
    const missingFiles = Array.from(allImageNames).filter(filename => !existingFiles.includes(filename))
    console.log(`❌ Archivos faltantes: ${missingFiles.length}`)
    
    if (missingFiles.length > 0) {
      console.log('\n📋 Lista de archivos faltantes:')
      missingFiles.forEach(file => console.log(`  - ${file}`))
      
      // 5. Crear archivos faltantes usando placeholders
      console.log('\n🛠️ Creando archivos faltantes...')
      
      // Asegurar que el directorio existe
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true })
      }
      
      let createdCount = 0
      for (const filename of missingFiles) {
        const filePath = path.join(imagesDir, filename)
        
        // Crear un placeholder SVG simple
        const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#f3f4f6"/>
  <text x="200" y="150" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle">
    ${filename.replace(/\.[^/.]+$/, '')}
  </text>
  <text x="200" y="170" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af" text-anchor="middle">
    Placeholder
  </text>
</svg>`
        
        // Determinar la extensión y crear el archivo apropiado
        const ext = path.extname(filename).toLowerCase()
        
        if (ext === '.svg') {
          fs.writeFileSync(filePath, svgContent)
        } else {
          // Para otros formatos, crear un SVG con el nombre del archivo
          const svgFilename = filename.replace(ext, '.svg')
          const svgPath = path.join(imagesDir, svgFilename)
          fs.writeFileSync(svgPath, svgContent)
          
          // También crear un archivo de texto con información
          const infoPath = path.join(imagesDir, filename.replace(ext, '.txt'))
          fs.writeFileSync(infoPath, `Placeholder para: ${filename}\nCreado automáticamente el: ${new Date().toISOString()}`)
        }
        
        createdCount++
        console.log(`  ✅ Creado: ${filename}`)
      }
      
      console.log(`\n🎉 Se crearon ${createdCount} archivos placeholder`)
    } else {
      console.log('✅ No faltan archivos de imagen')
    }
    
    // 6. Verificar servicios que usan URLs de Vercel Blob
    console.log('\n6. Verificando servicios con URLs de Vercel Blob...')
    const servicesWithBlobUrls = services.filter(service => 
      service.images && Array.isArray(service.images) && 
      service.images.some(img => img && (img.startsWith('http') || img.startsWith('https')))
    )
    
    console.log(`📊 Servicios con URLs de Vercel Blob: ${servicesWithBlobUrls.length}`)
    servicesWithBlobUrls.forEach(service => {
      console.log(`  - ${service.title}: ${service.images.filter(img => img && (img.startsWith('http') || img.startsWith('https'))).length} URLs`)
    })
    
    // 7. Estadísticas finales
    console.log('\n📊 Estadísticas finales:')
    console.log(`Total de servicios: ${services.length}`)
    console.log(`Servicios con imágenes: ${services.filter(s => s.images && s.images.length > 0).length}`)
    console.log(`Servicios sin imágenes: ${services.filter(s => !s.images || s.images.length === 0).length}`)
    console.log(`Archivos en public/images: ${fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir).length : 0}`)
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar la solución
fixMissingImages() 