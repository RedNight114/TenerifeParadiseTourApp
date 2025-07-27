/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Configuración correcta para turbo
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    // Optimizaciones de rendimiento
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Optimización de imágenes (temporalmente deshabilitada)
    // optimizeCss: true,
  },
  // Configuración de imágenes para Vercel Blob Storage
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
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
        pathname: '/uploads/**',
      },
    ],
    // Optimizaciones de imagen
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 días
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Optimización adicional
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Configuración básica
  reactStrictMode: true,
  swcMinify: true,
  // Optimizaciones de compilación
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Deshabilitar ESLint temporalmente para Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Deshabilitar TypeScript temporalmente para Vercel
  typescript: {
    ignoreBuildErrors: true,
  },
  // Optimizaciones de webpack
  webpack: (config, { dev, isServer }) => {
    // Optimizaciones solo para producción
    if (!dev && !isServer) {
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
      
      // Optimización de CSS
      config.optimization.minimize = true
    }
    
    // Optimización de assets
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg)$/i,
      use: [
        {
          loader: 'image-webpack-loader',
          options: {
            mozjpeg: { progressive: true },
            optipng: { enabled: false },
            pngquant: { quality: [0.65, 0.90], speed: 4 },
            gifsicle: { interlaced: false },
            webp: { quality: 75 }
          }
        }
      ]
    })
    
    return config
  },
  // Headers para optimización
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ]
  },
  // Configuración de PWA
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
    ]
  },
}

export default nextConfig