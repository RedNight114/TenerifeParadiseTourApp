/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración mínima para evitar errores de webpack
  reactStrictMode: false,
  swcMinify: false,
  experimental: {
    // Deshabilitar características experimentales
    turbo: false,
    optimizePackageImports: [],
  },
  // Configuración básica de imágenes
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
  },
  // Deshabilitar optimizaciones problemáticas
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configuración mínima de webpack
  webpack: (config, { dev, isServer }) => {
    // Configuración básica de alias
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '.',
      '@/components': './components',
      '@/lib': './lib',
      '@/hooks': './hooks',
      '@/app': './app',
    }
    
    // Deshabilitar optimizaciones problemáticas
    config.optimization = {
      ...config.optimization,
      splitChunks: false,
      minimize: false,
    }
    
    // Configuración para evitar errores de react-server-dom
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    
    return config
  },
  // Headers mínimos
  async headers() {
    return []
  },
}

export default nextConfig