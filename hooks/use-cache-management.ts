"use client"

import { useState, useEffect, useCallback } from 'react'

interface CacheStatus {
  localStorage: boolean
  sessionStorage: boolean
  cookies: boolean
  serviceWorker: boolean
  lastCheck: Date
}

export function useCacheManagement() {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>({
    localStorage: false,
    sessionStorage: false,
    cookies: false,
    serviceWorker: false,
    lastCheck: new Date()
  })

  const [isChecking, setIsChecking] = useState(false)

  const checkCacheStatus = useCallback(async () => {
    if (typeof window === 'undefined') return

    setIsChecking(true)
    
    try {
      const status: CacheStatus = {
        localStorage: false,
        sessionStorage: false,
        cookies: false,
        serviceWorker: false,
        lastCheck: new Date()
      }

      // Verificar localStorage
      try {
        const testKey = '__cache_test__'
        localStorage.setItem(testKey, 'test')
        localStorage.removeItem(testKey)
        status.localStorage = true
      } catch (error) {
        console.warn('localStorage no disponible:', error)
      }

      // Verificar sessionStorage
      try {
        const testKey = '__cache_test__'
        sessionStorage.setItem(testKey, 'test')
        sessionStorage.removeItem(testKey)
        status.sessionStorage = true
      } catch (error) {
        console.warn('sessionStorage no disponible:', error)
      }

      // Verificar cookies
      try {
        document.cookie = '__cache_test__=test; path=/'
        const hasCookie = document.cookie.includes('__cache_test__')
        document.cookie = '__cache_test__=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
        status.cookies = hasCookie
      } catch (error) {
        console.warn('Cookies no disponibles:', error)
      }

      // Verificar Service Worker
      try {
        status.serviceWorker = 'serviceWorker' in navigator
      } catch (error) {
        console.warn('Service Worker no disponible:', error)
      }

      setCacheStatus(status)
    } catch (error) {
      console.error('Error verificando estado del caché:', error)
    } finally {
      setIsChecking(false)
    }
  }, [])

  const clearCache = useCallback(async () => {
    if (typeof window === 'undefined') return

    try {
      console.log('🧹 Limpiando caché...')

      // Limpiar localStorage (mantener solo autenticación)
      const keysToKeep = ['supabase.auth.token', 'supabase.auth.expires_at']
      const keysToRemove = []
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && !keysToKeep.includes(key)) {
          keysToRemove.push(key)
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key))

      // Limpiar sessionStorage
      sessionStorage.clear()

      // Limpiar cookies de caché
      const cacheCookies = [
        'sb-', 'supabase.', 'next-auth.', 'vercel-', '__nextjs_', '_next_'
      ]
      
      cacheCookies.forEach(prefix => {
        document.cookie.split(";").forEach(cookie => {
          const eqPos = cookie.indexOf("=")
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
          if (name.startsWith(prefix)) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
          }
        })
      })

      // Limpiar caché de Service Worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(
          registrations.map(registration => registration.unregister())
        )
      }

      // Limpiar caché de imágenes
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        )
      }

      console.log('✅ Caché limpiado exitosamente')
      
      // Recargar estado
      await checkCacheStatus()
      
    } catch (error) {
      console.error('❌ Error limpiando caché:', error)
    }
  }, [checkCacheStatus])

  useEffect(() => {
    checkCacheStatus()
  }, [checkCacheStatus])

  return {
    cacheStatus,
    isChecking,
    checkCacheStatus,
    clearCache
  }
}
