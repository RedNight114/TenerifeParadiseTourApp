/** @type {import('next').NextConfig} */
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
