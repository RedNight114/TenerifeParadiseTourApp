#!/usr/bin/env node

/**
 * Script para optimizar el rendimiento de Next.js
 * Ejecutar con: node scripts/optimize-performance.js
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔧 Optimizando rendimiento de Next.js...\n')

// Función para verificar si existe un archivo
function fileExists(filePath) {
  return fs.existsSync(filePath)
}

// Función para leer archivo JSON
function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (error) {
    return null
  }
}

// Función para escribir archivo JSON
function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

// 1. Optimizar next.config.mjs
console.log('📝 Optimizando next.config.mjs...')

const nextConfigPath = path.join(process.cwd(), 'next.config.mjs')
let nextConfig = ''

if (fileExists(nextConfigPath)) {
  nextConfig = fs.readFileSync(nextConfigPath, 'utf8')
  
  // Añadir optimizaciones si no existen
  if (!nextConfig.includes('experimental: {')) {
    const optimizations = `
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  webpack: (config, { dev, isServer }) => {
    // Optimizaciones de webpack
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\\\/]node_modules[\\\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      }
    }
    
    // Reducir el tamaño del bundle
    config.optimization.minimize = !dev
    
    return config
  },
  // Optimizaciones de rendimiento
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Configuración de caché
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Configuración de imágenes
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
`

    // Insertar optimizaciones antes del último }
    const lastBraceIndex = nextConfig.lastIndexOf('}')
    if (lastBraceIndex !== -1) {
      nextConfig = nextConfig.slice(0, lastBraceIndex) + optimizations + '\n}'
      fs.writeFileSync(nextConfigPath, nextConfig)
      console.log('✅ next.config.mjs optimizado')
    }
  } else {
    console.log('ℹ️ next.config.mjs ya tiene optimizaciones')
  }
}

// 2. Optimizar package.json
console.log('\n📝 Optimizando package.json...')

const packageJsonPath = path.join(process.cwd(), 'package.json')
const packageJson = readJsonFile(packageJsonPath)

if (packageJson) {
  // Añadir scripts de optimización
  if (!packageJson.scripts['dev:optimized']) {
    packageJson.scripts['dev:optimized'] = 'NODE_OPTIONS="--max-old-space-size=4096" next dev'
  }
  
  if (!packageJson.scripts['build:optimized']) {
    packageJson.scripts['build:optimized'] = 'NODE_OPTIONS="--max-old-space-size=4096" next build'
  }
  
  if (!packageJson.scripts['clean']) {
    packageJson.scripts['clean'] = 'rimraf .next && rimraf node_modules/.cache'
  }
  
  if (!packageJson.scripts['start:fresh']) {
    packageJson.scripts['start:fresh'] = 'npm run clean && npm run dev:optimized'
  }
  
  writeJsonFile(packageJsonPath, packageJson)
  console.log('✅ package.json optimizado')
}

// 3. Crear archivo .env.local con optimizaciones
console.log('\n📝 Configurando variables de entorno para optimización...')

const envLocalPath = path.join(process.cwd(), '.env.local')
let envContent = ''

if (fileExists(envLocalPath)) {
  envContent = fs.readFileSync(envLocalPath, 'utf8')
}

// Añadir optimizaciones si no existen
const optimizations = `
# Optimizaciones de rendimiento
NEXT_TELEMETRY_DISABLED=1
NODE_ENV=development
NEXT_SHARP_PATH=./node_modules/sharp

# Configuración de memoria
NODE_OPTIONS=--max-old-space-size=4096

# Configuración de caché
NEXT_CACHE_DIR=.next/cache
`

if (!envContent.includes('NEXT_TELEMETRY_DISABLED')) {
  fs.appendFileSync(envLocalPath, optimizations)
  console.log('✅ Variables de entorno optimizadas')
}

// 4. Crear script de limpieza
console.log('\n📝 Creando script de limpieza...')

const cleanupScript = `#!/usr/bin/env node

/**
 * Script de limpieza para Next.js
 * Ejecutar con: node scripts/cleanup.js
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🧹 Limpiando archivos temporales...')

// Directorios a limpiar
const dirsToClean = [
  '.next',
  'node_modules/.cache',
  '.turbo',
  'dist',
  'build'
]

dirsToClean.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir)
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true })
      console.log(\`✅ Limpiado: \${dir}\`)
    } catch (error) {
      console.log(\`⚠️ Error limpiando \${dir}: \${error.message}\`)
    }
  }
})

// Limpiar caché de npm
try {
  execSync('npm cache clean --force', { stdio: 'inherit' })
  console.log('✅ Caché de npm limpiado')
} catch (error) {
  console.log('⚠️ Error limpiando caché de npm')
}

console.log('🎉 Limpieza completada')
`

const cleanupScriptPath = path.join(process.cwd(), 'scripts', 'cleanup.js')
fs.writeFileSync(cleanupScriptPath, cleanupScript)
console.log('✅ Script de limpieza creado')

// 5. Crear archivo .gitignore optimizado
console.log('\n📝 Optimizando .gitignore...')

const gitignorePath = path.join(process.cwd(), '.gitignore')
let gitignoreContent = ''

if (fileExists(gitignorePath)) {
  gitignoreContent = fs.readFileSync(gitignorePath, 'utf8')
}

const gitignoreAdditions = `
# Optimizaciones de rendimiento
.next/cache/
.turbo/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Archivos temporales
.tmp/
.temp/
*.tmp
*.temp

# Caché de desarrollo
.cache/
.parcel-cache/

# Archivos de sistema
.DS_Store
Thumbs.db

# Archivos de IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Archivos de build
dist/
build/
out/
`

if (!gitignoreContent.includes('.next/cache/')) {
  fs.appendFileSync(gitignorePath, gitignoreAdditions)
  console.log('✅ .gitignore optimizado')
}

console.log('\n🎉 Optimización completada')
console.log('\n📋 Comandos disponibles:')
console.log('  npm run dev:optimized    - Desarrollo con optimizaciones')
console.log('  npm run build:optimized  - Build con optimizaciones')
console.log('  npm run clean           - Limpiar archivos temporales')
console.log('  npm run start:fresh     - Inicio limpio con optimizaciones')
console.log('  node scripts/cleanup.js - Limpieza manual')

console.log('\n💡 Recomendaciones:')
console.log('  1. Usa "npm run start:fresh" para desarrollo')
console.log('  2. Ejecuta "npm run clean" si hay problemas')
console.log('  3. Monitorea el uso de memoria con Task Manager')
console.log('  4. Reinicia el servidor cada 2-3 horas de desarrollo') 