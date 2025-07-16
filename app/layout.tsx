import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { SupabaseDebug } from "@/components/supabase-debug"
import { ConnectionError } from "@/components/connection-error"
import { DetailedDebug } from "@/components/detailed-debug"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://tenerifeparadisetoursexcursions.com'),
  title: {
    default: "Tenerife Paradise Tours & Excursions - Descubre el Paraíso de Tenerife",
    template: "%s | Tenerife Paradise Tours"
  },
  description: "Vive experiencias únicas en Tenerife. Tours, excursiones, alquiler de vehículos y gastronomía local. Reserva tu aventura perfecta con los mejores precios y garantía.",
  keywords: [
    "Tenerife", "tours", "excursiones", "actividades", "alquiler coches", 
    "gastronomía", "Canarias", "Teide", "ballenas", "quad", "descapotable",
    "turismo", "viajes", "experiencias", "aventura", "playas", "volcán"
  ],
  authors: [{ name: "Tenerife Paradise Tours & Excursions" }],
  creator: "Tenerife Paradise Tours & Excursions",
  publisher: "Tenerife Paradise Tours & Excursions",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://tenerifeparadisetoursexcursions.com",
    title: "Tenerife Paradise Tours & Excursions - Descubre el Paraíso de Tenerife",
    description: "Vive experiencias únicas en Tenerife. Tours, excursiones, alquiler de vehículos y gastronomía local. ¡Reserva tu aventura perfecta!",
    siteName: "Tenerife Paradise Tours & Excursions",
    images: [
      {
        url: "/images/hero-background.avif",
        width: 1200,
        height: 630,
        alt: "Tenerife Paradise Tours - Paisajes espectaculares de Tenerife",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tenerife Paradise Tours & Excursions",
    description: "Descubre el paraíso de Tenerife con nuestras experiencias únicas",
    images: ["/images/hero-background.avif"],
    creator: "@tenerifeparadise",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "tu-codigo-verificacion-google",
    yandex: "tu-codigo-verificacion-yandex",
    yahoo: "tu-codigo-verificacion-yahoo",
  },
  alternates: {
    canonical: "https://tenerifeparadisetoursexcursions.com",
    languages: {
      "es-ES": "https://tenerifeparadisetoursexcursions.com",
      "en-US": "https://tenerifeparadisetoursexcursions.com/en",
    },
  },
  category: "travel",
  classification: "tourism",
  other: {
    "theme-color": "#0061A8",
    "color-scheme": "light",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Tenerife Paradise",
    "application-name": "Tenerife Paradise Tours",
    "msapplication-TileColor": "#0061A8",
    "msapplication-config": "/browserconfig.xml",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#0061A8" />
        
        {/* Preconnect para optimización */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://supabase.co" />
        <link rel="dns-prefetch" href="https://supabase.co" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TravelAgency",
              "name": "Tenerife Paradise Tours & Excursions",
              "description": "Agencia de viajes especializada en tours y excursiones en Tenerife",
              "url": "https://tenerifeparadisetoursexcursions.com",
              "logo": "https://tenerifeparadisetoursexcursions.com/images/logo-tenerife.png",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Tenerife",
                "addressRegion": "Canarias",
                "addressCountry": "ES"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+34-617-30-39-29",
                "contactType": "customer service",
                "availableLanguage": ["Spanish", "English"]
              },
              "sameAs": [
                "https://www.facebook.com/tenerifeparadise",
                "https://www.instagram.com/tenerifeparadise",
                "https://twitter.com/tenerifeparadise"
              ]
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ConnectionError />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Toaster />
        {process.env.NODE_ENV === 'development' && (
          <>
            <SupabaseDebug />
            <DetailedDebug />
          </>
        )}
      </body>
    </html>
  )
}
