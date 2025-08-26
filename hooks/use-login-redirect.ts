import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

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
    
    toast.success(welcomeMessage, {
      description: `Rol: ${roleDescription}`,
      duration: 3000,
      icon: profile.role === 'admin' ? '🛡️' : '👤'
    })

    // Determinar ruta de redirección
    let targetPath = redirectPath
    if (!targetPath) {
      if (profile.role === 'admin') {
        targetPath = '/admin/dashboard'
        toast.success('Redirigiendo al panel de administración...', {
          description: 'Serás redirigido en 3 segundos',
          duration: 3000,
          icon: '🛡️'
        })
      } else {
        targetPath = '/profile'
        toast.success('Redirigiendo a tu perfil...', {
          description: 'Serás redirigido en 3 segundos',
          duration: 3000,
          icon: '👤'
        })
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
