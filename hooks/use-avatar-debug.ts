import { useState, useEffect } from 'react'

interface AvatarDebugInfo {
  url: string | null
  isLoaded: boolean
  hasError: boolean
  errorMessage?: string
  fallbackUsed: boolean
}

export function useAvatarDebug(avatarUrl: string | null | undefined) {
  const [debugInfo, setDebugInfo] = useState<AvatarDebugInfo>({
    url: avatarUrl || null,
    isLoaded: false,
    hasError: false,
    fallbackUsed: false
  })

  useEffect(() => {
    if (!avatarUrl) {
      setDebugInfo(prev => ({
        ...prev,
        url: null,
        isLoaded: false,
        hasError: false,
        fallbackUsed: true
      }))
      return
    }

    setDebugInfo(prev => ({
      ...prev,
      url: avatarUrl,
      isLoaded: false,
      hasError: false,
      fallbackUsed: false
    }))

    // Crear una imagen para verificar si se carga correctamente
    const img = new Image()
    
    img.onload = () => {
      setDebugInfo(prev => ({
        ...prev,
        isLoaded: true,
        hasError: false
      }))
    }

    img.onerror = () => {
      setDebugInfo(prev => ({
        ...prev,
        isLoaded: false,
        hasError: true,
        errorMessage: 'Error al cargar la imagen',
        fallbackUsed: true
      }))
    }

    img.src = avatarUrl

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [avatarUrl])

  return debugInfo
}
