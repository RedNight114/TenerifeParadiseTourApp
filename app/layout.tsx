import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import "@/styles/z-index-management.css"
// Polyfills se manejan automáticamente por Next.js
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { UnifiedQueryProvider } from "@/components/providers/unified-query-provider"
import dynamic from 'next/dynamic'

// Cargar Toaster dinámicamente para evitar problemas de SSR
const Toaster = dynamic(() => import("sonner").then(mod => ({ default: mod.Toaster })), {
  ssr: false
})
import { CacheInitializer } from "@/components/cache-initializer"
import { ConditionalChatWidget } from "@/components/conditional-chat-widget"
import { ClientOnlyWrapper } from "@/components/client-only-wrapper"

// Lazy loading del chat widget para reducir bundle inicial
const UnifiedChatWidget = dynamic(
  () => import('@/components/chat/unified-chat-widget').then(mod => ({ default: mod.UnifiedChatWidget })),
  {
    ssr: false,
    loading: () => null // No mostrar loading para el chat widget
  }
)
import ErrorBoundary, { HydrationErrorFallback } from "@/components/error-boundary"
import { AuthErrorBoundary } from "@/components/auth-error-boundary"
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { I18nProvider } from '@/components/i18n-provider'
import { I18N_ENABLED, I18N_DEFAULT_LOCALE } from '@/app/config/i18n'

const geist = GeistSans
const geistMono = GeistMono

export const metadata: Metadata = {
  title: "Tenerife Paradise Tours & Excursions",
  description: "Descubre la isla de Tenerife con nuestras excursiones y tours únicos.",
  keywords: "Tenerife, tours, excursiones, turismo, Canarias, España",
  metadataBase: new URL('https://www.tenerifeparadisetoursexcursions.com'),
  
  // Metadatos de rendimiento
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
  
  // Metadatos de Open Graph
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://www.tenerifeparadisetoursexcursions.com',
    title: 'Tenerife Paradise Tours & Excursions',
    description: 'Descubre la isla de Tenerife con nuestras excursiones y tours únicos.',
    siteName: 'Tenerife Paradise Tours',
    images: [
      {
        url: '/images/hero-background.avif',
        width: 1200,
        height: 630,
        alt: 'Tenerife Paradise Tours',
      },
    ],
  },
  
  // Metadatos de Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Tenerife Paradise Tours & Excursions',
    description: 'Descubre la isla de Tenerife con nuestras excursiones y tours únicos.',
    images: ['/images/hero-background.avif'],
  },
  
  // Metadatos de rendimiento
  other: {
    'theme-color': '#0061A8',
    'color-scheme': 'light dark',
    'viewport-fit': 'cover',
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
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        
        {/* Preload de recursos críticos */}
        <link rel="preload" href="/images/hero-background.avif" as="image" />
        
        {/* DNS prefetch para dominios externos */}
        <link rel="dns-prefetch" href="//supabase.co" />
        <link rel="dns-prefetch" href="//vercel-storage.com" />
        
        {/* Preconnect para conexiones críticas */}
        <link rel="preconnect" href="https://supabase.co" />
        <link rel="preconnect" href="https://vercel-storage.com" />
        
        {/* Meta tags de rendimiento */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Tenerife Paradise Tours" />
        
        {/* Manifest para PWA */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Apple touch icons */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167x167.png" />
        
        {/* Favicon para diferentes dispositivos */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#0061A8" />
        
        {/* Structured data para SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TravelAgency",
              "name": "Tenerife Paradise Tours & Excursions",
              "description": "Descubre la isla de Tenerife con nuestras excursiones y tours únicos.",
              "url": "https://www.tenerifeparadisetoursexcursions.com",
              "logo": "https://www.tenerifeparadisetoursexcursions.com/images/logo.png",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Tenerife",
                "addressRegion": "Canarias",
                "addressCountry": "ES"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+34-XXX-XXX-XXX",
                "contactType": "customer service"
              },
              "sameAs": [
                "https://www.facebook.com/tenerifeparadisetours",
                "https://www.instagram.com/tenerifeparadisetours"
              ]
            })
          }}
        />
      </head>
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <ErrorBoundary fallback={HydrationErrorFallback}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <UnifiedQueryProvider>
              <ClientOnlyWrapper>
                <AuthErrorBoundary>
                  <AuthProvider>
                    <I18nProvider locale={I18N_DEFAULT_LOCALE}>
                      <CacheInitializer />
                      {children}
                      <ConditionalChatWidget />
                      <Toaster 
                        position="top-right"
                        richColors
                        closeButton
                        duration={5000}
                      />
                    </I18nProvider>
                  </AuthProvider>
                </AuthErrorBoundary>
              </ClientOnlyWrapper>
            </UnifiedQueryProvider>
          </ThemeProvider>
        </ErrorBoundary>
        
        {/* Vercel Analytics y Speed Insights */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
