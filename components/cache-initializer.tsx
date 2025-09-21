'use client'

import { useEffect } from 'react'
import { initializeCache } from '@/lib/unified-cache-system'

export function CacheInitializer() {
  useEffect(() => {
    // Inicializar el sistema de caché cuando el componente se monta
    initializeCache()
  }, [])

  return null // Este componente no renderiza nada
}
