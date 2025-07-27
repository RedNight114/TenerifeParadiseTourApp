// Configuración específica para Vercel
module.exports = {
  // Configuración de path mapping para Vercel
  experimental: {
    esmExternals: true,
  },
  webpack: (config, { isServer }) => {
    // Configurar alias para path mapping
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '.',
      '@/components': './components',
      '@/lib': './lib',
      '@/hooks': './hooks',
      '@/app': './app',
      '@/public': './public',
      '@/styles': './styles',
      '@/types': './types',
      '@/utils': './utils',
    }
    
    return config
  },
} 