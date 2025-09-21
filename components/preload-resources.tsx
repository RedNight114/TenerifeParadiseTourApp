"use client"

import { useEffect } from 'react'

interface PreloadResourcesProps {
  resources?: Array<{
    href: string
    as: 'image' | 'script' | 'style' | 'font' | 'fetch'
    type?: string
    crossorigin?: 'anonymous' | 'use-credentials'
  }>
  fonts?: string[]
  images?: string[]
  scripts?: string[]
}

export function PreloadResources({ 
  resources = [], 
  fonts = [], 
  images = [], 
  scripts = [] 
}: PreloadResourcesProps) {
  useEffect(() => {
    if (typeof document === 'undefined') return
    
    // Preload recursos críticos
    const preloadResource = (href: string, as: string, type?: string, crossorigin?: string) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = href
      link.as = as
      
      if (type) link.type = type
      if (crossorigin) link.crossOrigin = crossorigin
      
      document.head.appendChild(link)
    }

    // Preload fuentes críticas
    fonts.forEach(font => {
      preloadResource(font, 'font', 'font/woff2', 'anonymous')
    })

    // Preload imágenes críticas
    images.forEach(image => {
      preloadResource(image, 'image')
    })

    // Preload scripts críticos
    scripts.forEach(script => {
      preloadResource(script, 'script')
    })

    // Preload recursos personalizados
    resources.forEach(resource => {
      preloadResource(resource.href, resource.as, resource.type, resource.crossorigin)
    })

    // Cleanup function
    return () => {
      // Los elementos de preload se pueden dejar ya que son beneficiosos
    }
  }, [resources, fonts, images, scripts])

  return null
}

// Componente para preload de fuentes críticas
export function PreloadFonts() {
  const criticalFonts = [
    '/fonts/geist-sans.woff2',
    '/fonts/geist-mono.woff2',
  ]

  return <PreloadResources fonts={criticalFonts} />
}

// Componente para preload de imágenes críticas
export function PreloadCriticalImages() {
  const criticalImages = [
    '/images/hero-background.avif',
    '/images/company-logo.png',
    '/favicon.ico',
  ]

  return <PreloadResources images={criticalImages} />
}

// Componente para preload de scripts críticos
export function PreloadCriticalScripts() {
  const criticalScripts = [
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  ]

  return <PreloadResources scripts={criticalScripts} />
}

// Hook para preload dinámico
export function usePreloadResource() {
  const preload = (href: string, as: string, type?: string) => {
    if (typeof document === 'undefined') return
    
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    if (type) link.type = type
    
    document.head.appendChild(link)
  }

  const preloadImage = (src: string) => {
    if (typeof window === 'undefined') return
    
    const img = new Image()
    img.src = src
  }

  const preloadScript = (src: string) => {
    if (typeof document === 'undefined') return
    
    const script = document.createElement('script')
    script.src = src
    script.async = true
    document.head.appendChild(script)
  }

  return { preload, preloadImage, preloadScript }
}

// Componente para preload de rutas (prefetch)
export function PreloadRoutes() {
  useEffect(() => {
    if (typeof document === 'undefined') return
    
    // Prefetch rutas críticas cuando el usuario esté inactivo
    const prefetchRoutes = [
      '/services',
      '/admin',
      '/contact',
    ]

    const prefetchRoute = (route: string) => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = route
      document.head.appendChild(link)
    }

    // Prefetch después de 2 segundos de inactividad
    const timer = setTimeout(() => {
      prefetchRoutes.forEach(prefetchRoute)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return null
}

// Componente principal que combina todos los preloads
export function CriticalResourcePreloader() {
  return (
    <>
      <PreloadFonts />
      <PreloadCriticalImages />
      <PreloadCriticalScripts />
      <PreloadRoutes />
    </>
  )
}

export default CriticalResourcePreloader
