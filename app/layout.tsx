import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import { CookieBanner } from "@/components/cookie-banner"
import { CacheCleanup } from "@/components/cache-cleanup"

export const metadata: Metadata = {
  title: {
    default: "Tenerife Paradise Tours & Excursions",
    template: "%s | Tenerife Paradise Tours & Excursions"
  },
  description: "Descubre las mejores experiencias en Tenerife. Tours, actividades, alquiler de vehículos y experiencias gastronómicas únicas en la isla.",
  keywords: ["Tenerife", "tours", "excursiones", "actividades", "alquiler", "gastronomía", "turismo", "Canarias"],
  authors: [{ name: "Tenerife Paradise Tours" }],
  creator: "Tenerife Paradise Tours",
  publisher: "Tenerife Paradise Tours",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://tenerife-paradise-tours.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://tenerife-paradise-tours.vercel.app',
    title: 'Tenerife Paradise Tours & Excursions',
    description: 'Descubre las mejores experiencias en Tenerife. Tours, actividades, alquiler de vehículos y experiencias gastronómicas únicas.',
    siteName: 'Tenerife Paradise Tours',
    images: [
      {
        url: '/images/hero-tenerife-sunset.jpg',
        width: 1200,
        height: 630,
        alt: 'Tenerife Paradise Tours',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tenerife Paradise Tours & Excursions',
    description: 'Descubre las mejores experiencias en Tenerife',
    images: ['/images/hero-tenerife-sunset.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/images/hero-tenerife-sunset.jpg" as="image" />
        
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//kykyyqga68e5j72o.public.blob.vercel-storage.com" />
        <link rel="dns-prefetch" href="//supabase.co" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://kykyyqga68e5j72o.public.blob.vercel-storage.com" />
        <link rel="preconnect" href="https://supabase.co" />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
            <CookieBanner />
            <CacheCleanup showButton={true} autoCleanup={false} />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
