const fs = require('fs')
const path = require('path')

console.log('🧪 Probando carga directa de imágenes...')

// Lista de imágenes que sabemos que existen
const existingImages = [
  'quad1.jpg',
  'whales1.jpg',
  'ocean_dinner.jpg',
  'convertible_coast.jpg',
  'teide_sunset.jpg',
  'food_tour_market.jpg',
  'quad_adventure.jpg'
]

const imagesDir = path.join(__dirname, '..', 'public', 'images')

console.log('\n📁 Verificando archivos existentes:')
existingImages.forEach(img => {
  const filePath = path.join(imagesDir, img)
  const exists = fs.existsSync(filePath)
  const stats = exists ? fs.statSync(filePath) : null
  
  console.log(`${exists ? '✅' : '❌'} ${img}: ${exists ? `${stats.size} bytes` : 'No existe'}`)
})

console.log('\n🔗 URLs que deberían funcionar:')
existingImages.forEach(img => {
  console.log(`  /images/${img}`)
})

console.log('\n💡 Sugerencias:')
console.log('1. Verifica que las imágenes estén en public/images/')
console.log('2. Asegúrate de que los nombres coincidan exactamente')
console.log('3. Prueba acceder directamente a /images/nombre-imagen.jpg')
console.log('4. Verifica la consola del navegador para errores') 