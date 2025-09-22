/** @type {import('next').NextConfig} */
// Importar polyfills SSR robustos antes que cualquier otra cosa
import './lib/ssr-polyfills.mjs'

const nextConfig = {
  // Configuración básica
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  trailingSlash: false,
  
  // Configuración experimental para mejor rendimiento
  experimental: {
    // Optimizaciones de compilación (solo las estables)
    optimizePackageImports: ['@tanstack/react-query', '@supabase/supabase-js'],
  },

  // Configuración de ESLint para producción
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['app', 'components', 'lib', 'hooks'],
  },

  // Configuración de TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Configuración de imágenes optimizada
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 año
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    // Dominios permitidos para imágenes
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
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
    
    // Configuración de tamaños responsivos
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Configuración de headers de caché optimizados
  async headers() {
    return [
      // APIs - No cache para datos dinámicos
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      
      // Imágenes - Cache muy largo con validación
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Vary',
            value: 'Accept',
          },
        ],
      },
      
      // Assets estáticos - Cache permanente
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Configuración de compresión
  compress: true,
  
  // Configuración de webpack simplificada
  webpack: (config, { dev, isServer }) => {
    // Configuración básica de fallback para módulos del navegador
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        assert: false,
        http: false,
        https: false,
        os: false,
        buffer: false,
      }
    }

    return config
  },

  // Configuración de modularizeImports para mejor tree-shaking
  modularizeImports: {
    '@tanstack/react-query': {
      transform: '@tanstack/react-query/{{member}}',
    },
    '@supabase/supabase-js': {
      transform: '@supabase/supabase-js/{{member}}',
    },
  },

  // Configuración de variables de entorno
  env: {
    CACHE_VERSION: '2.0.0',
    CACHE_TTL_DEFAULT: '900000', // 15 minutos
    CACHE_TTL_SERVICES: '900000', // 15 minutos
    CACHE_TTL_CATEGORIES: '3600000', // 1 hora
    CACHE_TTL_USERS: '300000', // 5 minutos
  },

  // Configuración de output
  output: 'standalone',
}

export default nextConfig
