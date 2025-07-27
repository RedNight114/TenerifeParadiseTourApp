"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAuth, setIsAuth] = useState(false)
  const [isServiceDetails, setIsServiceDetails] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setIsAdmin(pathname?.startsWith('/admin') || false)
    setIsAuth(pathname?.startsWith('/auth') || false)
    setIsServiceDetails(pathname?.startsWith('/services/') && pathname.split('/').length > 2 || false)
  }, [pathname])

  // Para páginas de autenticación y detalles de servicios, renderizar solo el contenido sin navbar/footer
  if (isAuth || isServiceDetails) {
    return <>{children}</>
  }

  // Para páginas normales, usar el layout completo
  return (
    <div className="flex flex-col min-h-screen">
      {isMounted && !isAdmin && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      {isMounted && !isAdmin && <Footer />}
    </div>
  )
} 