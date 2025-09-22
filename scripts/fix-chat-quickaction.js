const fs = require('fs')
const path = require('path')

const filePath = path.resolve(__dirname, '..', 'app/chat/page.tsx')

console.log('🔧 Fixing useQuickAction in chat page...')

try {
  let content = fs.readFileSync(filePath, 'utf8')
  
  // Reemplazar el patrón problemático
  const oldPattern = /onClick={() => {\s*const quickAction = useQuickAction\(\)\s*quickAction\(action\.message\)\s*}}/g
  const newPattern = 'onClick={() => useQuickAction(action.message)}'
  
  content = content.replace(oldPattern, newPattern)
  
  fs.writeFileSync(filePath, content)
  console.log('✅ Fixed useQuickAction in chat page')
} catch (error) {
  console.error('❌ Error fixing chat page:', error.message)
}
