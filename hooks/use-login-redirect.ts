import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
// Importación dinámica de sonner para evitar problemas de SSR
let toast: any = null
if (typeof window !== 'undefined') {
  import('sonner').then(({ toast: toastImport }) => {
    toast = toastImport
  })
}

// Función helper para manejar toasts de manera segura
const showToast = (type: 'success' | 'error' | 'info', message: string) => {
  if (typeof window !== 'undefined' && toast) {
    toast[type](message)
  } else {
    // Fallback para SSR - solo log en consola
    }: ${message}`)
  }
}

interface UseLoginRedirectProps {
  user: any
  profile: any
  redirectPath?: string
}

export function useLoginRedirect({ user, profile, redirectPath }: UseLoginRedirectProps) {
  const router = useRouter()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    if (!user || !profile) return

    // Mostrar toast de bienvenida
    const welcomeMessage = `¡Bienvenido ${profile.full_name || user.email}!`
    const roleDescription = profile.role === 'admin' ? 'Administrador' : 'Usuario'
    
    showToast('success', welcomeMessage)

    // Determinar ruta de redirección
    let targetPath = redirectPath
    if (!targetPath) {
      if (profile.role === 'admin') {
        targetPath = '/admin/dashboard'
        showToast('success', 'Redirigiendo al panel de administración...')
      } else {
        targetPath = '/profile'
        showToast('success', 'Redirigiendo a tu perfil...')
      }
    }

    // Iniciar redirección después de 3 segundos
    const timer = setTimeout(() => {
      setShouldRedirect(true)
      router.push(targetPath)
    }, 3000)

    return () => clearTimeout(timer)
  }, [user, profile, redirectPath, router])

  return { shouldRedirect }
}
