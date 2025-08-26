import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "sonner"
import { ChatWidgetFloating } from "@/components/chat/chat-widget-floating"
import "@/lib/disable-image-logs" // Bloquear logs de imágenes automáticamente
import "@/lib/performance-optimizer" // Inicializar optimizador de rendimiento

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
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <ChatWidgetFloating />
            <Toaster 
              position="top-right"
              richColors
              closeButton
              duration={5000}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
