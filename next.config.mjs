/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Configuración experimental simplificada para estabilidad
  experimental: {
    // Solo mantener optimizaciones esenciales
    optimizePackageImports: ['lucide-react'],
    // Deshabilitar configuraciones que pueden causar problemas
    // turbo: false, // Comentado para evitar conflictos
    // optimizeCss: false, // Comentado para evitar problemas de CSS
    // scrollRestoration: false, // Comentado para estabilidad
  },

  // Optimización de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kykyyqga68e5j72o.public.blob.vercel-storage.com',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 días
  },

  // Configuración de compilación más estricta
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },

  // Configuración de webpack simplificada
  webpack: (config, { dev, isServer }) => {
    // Configuración de alias básica
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '.',
      '@/components': './components',
      '@/lib': './lib',
      '@/hooks': './hooks',
      '@/app': './app',
    }

    // Optimizaciones de producción más conservadoras
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      }
    }

    return config
  },

  // Headers para caché y seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 año para archivos estáticos
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 año
          },
        ],
      },
    ]
  },

  // Configuración básica para estabilidad
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  
  // Configuración de output para mejor estabilidad
  output: 'standalone',
  
  // Configuración de trailing slash para consistencia
  trailingSlash: false,
}

export default nextConfig
