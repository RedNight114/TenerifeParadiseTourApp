"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"

/**
 * Layout exclusivo para la sección de administración.
 * Oculta completamente el navbar y footer de la aplicación principal.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Ocultar el navbar y footer del layout principal
    const navbar = document.querySelector('nav[data-navbar="main"]')
    const footer = document.querySelector('footer[data-footer="main"]')

    if (navbar) {
      (navbar as HTMLElement).style.display = "none"
    }
    if (footer) {
      (footer as HTMLElement).style.display = "none"
    }

    // También ocultar por clase si existe
    const navbarByClass = document.querySelector(".navbar")
    const footerByClass = document.querySelector(".footer")

    if (navbarByClass) {
      (navbarByClass as HTMLElement).style.display = "none"
    }
    if (footerByClass) {
      (footerByClass as HTMLElement).style.display = "none"
    }

    // Cleanup function para restaurar cuando se salga del admin
    return () => {
      if (navbar) {
        (navbar as HTMLElement).style.display = ""
      }
      if (footer) {
        (footer as HTMLElement).style.display = ""
      }
      if (navbarByClass) {
        (navbarByClass as HTMLElement).style.display = ""
      }
      if (footerByClass) {
        (footerByClass as HTMLElement).style.display = ""
      }
    }
  }, [])

  return (
    <div className="admin-layout">
      <style jsx global>{`
        /* Ocultar navbar y footer globalmente en admin */
        .admin-layout ~ * nav,
        .admin-layout ~ * header,
        .admin-layout ~ * footer {
          display: none !important;
        }
        
        /* Asegurar que el admin layout ocupe toda la pantalla */
        .admin-layout {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          background: white;
          overflow-y: auto;
        }
        
        /* Ocultar cualquier navbar que pueda existir */
        body:has(.admin-layout) nav,
        body:has(.admin-layout) header:not(.admin-header),
        body:has(.admin-layout) footer {
          display: none !important;
        }
      `}</style>
      {children}
    </div>
  )
}
