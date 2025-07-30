import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProviderUltraSimple } from "@/components/auth-provider-ultra-simple"
import { SuppressHydrationWarning } from "@/components/hydration-safe"

const geist = GeistSans
const geistMono = GeistMono

export const metadata: Metadata = {
  title: "Tenerife Paradise Tours & Excursions",
  description: "Descubre la isla de Tenerife con nuestras excursiones y tours únicos.",
  keywords: "Tenerife, tours, excursiones, turismo, Canarias, España",
  metadataBase: new URL('https://www.tenerifeparadisetoursexcursions.com'),
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <SuppressHydrationWarning>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProviderUltraSimple>
              {/* Contenido principal */}
              {children}
            </AuthProviderUltraSimple>
          </ThemeProvider>
        </SuppressHydrationWarning>
      </body>
    </html>
  )
}
