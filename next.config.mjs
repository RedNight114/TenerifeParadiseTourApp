/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Habilitado para mejor desarrollo
  swcMinify: true,
  
  // Configuración experimental optimizada
  experimental: {
    // Optimizaciones de rendimiento
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    turbo: {
      resolveAlias: {
        '@': '.',
        '@/components': './components',
        '@/lib': './lib',
        '@/hooks': './hooks',
        '@/app': './app',
      },
    },
    // Mejoras de rendimiento
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
    optimizeCss: true,
    scrollRestoration: true,
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
    unoptimized: false, // Habilitado para optimización
    formats: ['image/webp', 'image/avif'], // Formatos modernos
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 días
  },

  // Configuración de compilación
  eslint: {
    ignoreDuringBuilds: false, // Habilitado para mejor calidad
  },
  typescript: {
    ignoreBuildErrors: false, // Habilitado para mejor calidad
  },

  // Optimización de webpack
  webpack: (config, { dev, isServer }) => {
    // Configuración de alias
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '.',
      '@/components': './components',
      '@/lib': './lib',
      '@/hooks': './hooks',
      '@/app': './app',
    }

    // Optimizaciones de producción
    if (!dev && !isServer) {
      // Optimización de bundles
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      }
    }

    return config
  },

  // Configuración de headers para caché y seguridad
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
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600', // 5 min browser, 10 min CDN
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
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 año
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 año
          },
        ],
      },
    ]
  },

  // Configuración de redirecciones
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/tours',
        destination: '/services?category=tours',
        permanent: false,
      },
      {
        source: '/vehicles',
        destination: '/services?category=vehicles',
        permanent: false,
      },
      {
        source: '/gastronomy',
        destination: '/services?category=gastronomy',
        permanent: false,
      },
    ]
  },

  // Configuración adicional para estabilidad y rendimiento
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  
  // Configuración de PWA (opcional)
  // pwa: {
  //   dest: 'public',
  //   register: true,
  //   skipWaiting: true,
  // },

  // Configuración de análisis de bundle
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer')({
          enabled: true,
        }))()
      )
      return config
    },
  }),
}

export default nextConfig
