const fs = require('fs')
const path = require('path')

// Archivos con errores de comillas escapadas
const filesToFix = [
  'app/(main)/about/page.tsx',
  'app/(main)/services/page.tsx',
  'app/admin/services/page.tsx',
  'app/auth/register/page.tsx',
  'app/chat/test/page.tsx',
  'components/services-grid.tsx',
  'components/ui/virtualized-list.tsx',
  'components/unified-pricing-participant-selector.tsx',
  'components/admin/service-form.tsx'
]

function fixQuotes(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    
    // Reemplazar comillas dobles problemáticas con entidades HTML
    content = content.replace(/"([^"]*)"/g, (match, text) => {
      // Solo reemplazar si está dentro de JSX
      if (match.includes('className') || match.includes('alt=') || match.includes('title=')) {
        return `&quot;${text}&quot;`
      }
      return match
    })
    
    fs.writeFileSync(filePath, content)
    console.log(`✅ Fixed quotes in: ${filePath}`)
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message)
  }
}

console.log('🔧 Fixing quote escaping issues...')

filesToFix.forEach(file => {
  const fullPath = path.resolve(__dirname, '..', file)
  if (fs.existsSync(fullPath)) {
    fixQuotes(fullPath)
  } else {
    console.log(`⚠️  File not found: ${file}`)
  }
})

console.log('✅ Quote fixing completed!')
