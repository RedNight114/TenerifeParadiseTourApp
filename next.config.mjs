/** @type {import('next').NextConfig} */
import './lib/server-globals.mjs'

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
  
  // Configuración de TypeScript y ESLint
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Configuración de webpack optimizada
  webpack: (config, { dev, isServer }) => {
    // Configuración de fallback para módulos del navegador
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
    } else {
      // Configuración para el servidor
      config.resolve.fallback = {
        ...config.resolve.fallback,
        self: false,
      }
      
      // Los polyfills globales se manejan en lib/server-globals.js
    }

    // Optimización del caché de webpack
    if (dev) {
      // Configuración de caché optimizada para desarrollo rápido
      config.cache = {
        type: 'memory', // Usar caché en memoria para desarrollo
        maxGenerations: 1,
      }
      
      // Optimizaciones de compilación para desarrollo
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false, // Deshabilitar splitChunks en desarrollo para evitar problemas
      }
    } else {
      // Configuración de producción
      config.cache = {
        type: 'filesystem',
        compression: 'gzip',
        maxMemoryGenerations: 1,
      }
    }

    // Configuración simplificada de splitChunks para evitar errores de exports
    config.optimization = {
      ...config.optimization,
      splitChunks: false, // Deshabilitar splitChunks temporalmente para evitar problemas de exports
    }

    // Configuración para resolver problemas de módulos ES/CommonJS
    config.resolve = {
      ...config.resolve,
      extensionAlias: {
        '.js': ['.js', '.ts', '.tsx'],
        '.jsx': ['.jsx', '.tsx'],
      },
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