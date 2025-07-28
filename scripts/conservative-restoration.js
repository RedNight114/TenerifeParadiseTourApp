#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔄 RESTAURACIÓN CONSERVADORA')
console.log('================================')

// Función para verificar si un archivo existe
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath)
  } catch (error) {
    return false
  }
}

// Función para leer archivo
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch (error) {
    return null
  }
}

// Función para escribir archivo
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8')
    return true
  } catch (error) {
    console.error(`❌ Error escribiendo ${filePath}:`, error.message)
    return false
  }
}

// Función para crear backup
function createBackup(filePath, suffix = '.backup') {
  if (fileExists(filePath)) {
    const backupPath = filePath + suffix
    const content = readFile(filePath)
    if (content) {
      writeFile(backupPath, content)
      console.log(`✅ Backup creado: ${backupPath}`)
      return true
    }
  }
  return false
}

// Función para limpiar cache
function cleanCache() {
  console.log('🧹 Limpiando cache...')
  const dirsToClean = ['.next', 'node_modules/.cache', 'out', 'dist']
  
  dirsToClean.forEach(dir => {
    if (fileExists(dir)) {
      try {
        execSync(`rm -rf "${dir}"`, { stdio: 'inherit' })
        console.log(`✅ ${dir} eliminado`)
      } catch (error) {
        console.log(`⚠️  No se pudo eliminar ${dir}: ${error.message}`)
      }
    }
  })
}

// Configuración mínima pero funcional
function createMinimalConfig() {
  console.log('🔧 Creando configuración mínima pero funcional...')
  
  const minimalConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: false,
  experimental: {
    turbo: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kykyyqga68e5j72o.public.blob.vercel-storage.com',
        port: '',
        pathname: '/uploads/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { dev, isServer }) => {
    // Configuración mínima de webpack
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '.',
      '@/components': './components',
      '@/lib': './lib',
      '@/hooks': './hooks',
      '@/app': './app',
    }
    
    return config
  },
  async headers() {
    return []
  },
}

export default nextConfig
`
  
  createBackup('next.config.mjs', '.backup-full')
  return writeFile('next.config.mjs', minimalConfig)
}

// Layout mínimo pero funcional
function createMinimalLayout() {
  console.log('🔧 Creando layout mínimo pero funcional...')
  
  const minimalLayout = `import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"

const geist = GeistSans
const geistMono = GeistMono

export const metadata: Metadata = {
  title: "Tenerife Paradise Tours & Excursions",
  description: "Descubre la isla de Tenerife con nuestras excursiones y tours únicos.",
  keywords: "Tenerife, tours, excursiones, turismo, Canarias, España",
  metadataBase: new URL('https://www.tenerifeparadisetoursexcursions.com'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={\`\${geist.variable} \${geistMono.variable} antialiased\`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
`
  
  createBackup('app/layout.tsx', '.backup-full')
  return writeFile('app/layout.tsx', minimalLayout)
}

// Función para agregar componente gradualmente
function addComponentGradually(componentName, componentPath) {
  console.log(`🔧 Agregando ${componentName}...`)
  
  if (!fileExists(componentPath)) {
    console.log(`❌ ${componentPath} no existe`)
    return false
  }
  
  // Leer el layout actual
  const layoutPath = 'app/layout.tsx'
  let layoutContent = readFile(layoutPath)
  
  if (!layoutContent) {
    console.log('❌ No se pudo leer el layout')
    return false
  }
  
  // Agregar import
  const importStatement = `import { ${componentName} } from "${componentPath}"`
  
  if (!layoutContent.includes(importStatement)) {
    // Encontrar la línea después de los imports existentes
    const lines = layoutContent.split('\n')
    let insertIndex = 0
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import') || lines[i].includes('import')) {
        insertIndex = i + 1
      } else if (lines[i].trim() === '') {
        break
      }
    }
    
    lines.splice(insertIndex, 0, importStatement)
    layoutContent = lines.join('\n')
  }
  
  // Agregar componente en el body
  const componentJSX = `<${componentName} />`
  
  if (!layoutContent.includes(componentJSX)) {
    // Encontrar la posición después de <AuthProvider>
    const authProviderIndex = layoutContent.indexOf('<AuthProvider>')
    if (authProviderIndex !== -1) {
      const beforeAuthProvider = layoutContent.substring(0, authProviderIndex)
      const afterAuthProvider = layoutContent.substring(authProviderIndex)
      
      // Encontrar el cierre de AuthProvider
      const authProviderCloseIndex = afterAuthProvider.indexOf('</AuthProvider>')
      if (authProviderCloseIndex !== -1) {
        const beforeClose = afterAuthProvider.substring(0, authProviderCloseIndex)
        const afterClose = afterAuthProvider.substring(authProviderCloseIndex)
        
        layoutContent = beforeAuthProvider + beforeClose + '\n            ' + componentJSX + '\n          ' + afterClose
      }
    }
  }
  
  return writeFile(layoutPath, layoutContent)
}

// Función principal
function main() {
  console.log('🎯 RESTAURACIÓN CONSERVADORA INICIADA')
  console.log('=====================================')
  
  // Paso 1: Limpiar cache
  cleanCache()
  
  // Paso 2: Crear configuración mínima
  if (createMinimalConfig()) {
    console.log('✅ Configuración mínima creada')
  } else {
    console.log('❌ Error creando configuración mínima')
    return
  }
  
  // Paso 3: Crear layout mínimo
  if (createMinimalLayout()) {
    console.log('✅ Layout mínimo creado')
  } else {
    console.log('❌ Error creando layout mínimo')
    return
  }
  
  // Paso 4: Verificar componentes disponibles
  console.log('\n🔍 COMPONENTES DISPONIBLES:')
  console.log('============================')
  
  const components = [
    { name: 'CacheCleanup', path: '@/components/cache-cleanup' },
    { name: 'NavigationRecovery', path: '@/components/navigation-recovery' },
    { name: 'ProblemDetector', path: '@/components/navigation-recovery' },
    { name: 'SuppressHydrationWarning', path: '@/components/hydration-safe' }
  ]
  
  components.forEach(comp => {
    const filePath = comp.path.replace('@/', './')
    if (fileExists(filePath + '.tsx')) {
      console.log(`✅ ${comp.name}: ${filePath}.tsx`)
    } else {
      console.log(`❌ ${comp.name}: ${filePath}.tsx (no encontrado)`)
    }
  })
  
  console.log('\n💡 PRÓXIMOS PASOS:')
  console.log('==================')
  console.log('1. Reiniciar servidor: npm run dev')
  console.log('2. Verificar que no hay errores de webpack')
  console.log('3. Si funciona, agregar componentes gradualmente:')
  console.log('   • npm run add:cache-cleanup')
  console.log('   • npm run add:navigation-recovery')
  console.log('   • npm run add:hydration-safe')
  console.log('4. Si hay errores, mantener configuración mínima')
  
  console.log('\n✅ Restauración conservadora completada')
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main()
}

module.exports = { main, addComponentGradually } 