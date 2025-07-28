import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { CacheCleanup } from "@/components/cache-cleanup"
import { NavigationRecovery, ProblemDetector } from "@/components/navigation-recovery"
import { SuppressHydrationWarning } from "@/components/hydration-safe"

const geist = GeistSans
const geistMono = GeistMono

export const metadata: Metadata = {
  title: "Tenerife Paradise Tours & Excursions",
  description: "Descubre la isla de Tenerife con nuestras excursiones y tours únicos. Desde el corazón de la capital hasta los rincones más salvajes de la isla.",
  keywords: "Tenerife, tours, excursiones, turismo, Canarias, España",
  authors: [{ name: "Tenerife Paradise Tours" }],
  creator: "Tenerife Paradise Tours",
  publisher: "Tenerife Paradise Tours",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.tenerifeparadisetoursexcursions.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Tenerife Paradise Tours & Excursions",
    description: "Descubre la isla de Tenerife con nuestras excursiones y tours únicos.",
    url: 'https://www.tenerifeparadisetoursexcursions.com',
    siteName: 'Tenerife Paradise Tours',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Tenerife Paradise Tours',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Tenerife Paradise Tours & Excursions",
    description: "Descubre la isla de Tenerife con nuestras excursiones y tours únicos.",
    images: ['/images/twitter-image.jpg'],
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
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0061A8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Preconnect para mejorar rendimiento */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch para recursos externos */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Preload de recursos críticos */}
        <link rel="preload" href="/fonts/GeistVF.woff" as="font" type="font/woff" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/GeistMonoVF.woff" as="font" type="font/woff" crossOrigin="anonymous" />
      </head>
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <SuppressHydrationWarning>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              {/* Sistema de limpieza de caché */}
              <CacheCleanup />
              
              {/* Sistema de recuperación de navegación */}
              <NavigationRecovery 
                showOnError={true}
                autoHide={false}
                hideDelay={15000}
              />
              
              {/* Detector de problemas */}
              <ProblemDetector />
              
              {/* Contenido principal */}
              {children}
            </AuthProvider>
          </ThemeProvider>
        </SuppressHydrationWarning>
      </body>
    </html>
  )
}
