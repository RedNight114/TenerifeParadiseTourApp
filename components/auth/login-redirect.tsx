'use client'

import { useEffect, useState } from 'react'
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
    console.log(`[${type.toUpperCase()}]: ${message}`)
  }
}
import { CheckCircle, User, Shield, Loader2 } from 'lucide-react'

interface LoginRedirectProps {
  user: any
  profile: any
  redirectPath?: string
}

export function LoginRedirect({ user, profile, redirectPath }: LoginRedirectProps) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(3)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (!user || !profile) return

    // Determinar la ruta de redirección basada en el rol
    let targetPath = redirectPath
    if (!targetPath) {
      if (profile.role === 'admin') {
        targetPath = '/admin/dashboard'
        showToast('success', '¡Bienvenido Administrador!')
      } else {
        // Para usuarios normales (user o client), ir al perfil
        targetPath = '/profile'
        showToast('success', '¡Bienvenido!')
      }
    }

    // Redirección inmediata sin countdown para evitar bucles
    setTimeout(() => {
      router.push(targetPath)
    }, 100)
  }, [user, profile, redirectPath, router])

  if (!user || !profile) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        {/* Icono de éxito */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Inicio de sesión exitoso!
          </h2>
          <p className="text-gray-600">
            Bienvenido, {profile.full_name || user.email}
          </p>
        </div>

        {/* Información del usuario */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            {profile.role === 'admin' ? (
              <Shield className="w-5 h-5 text-blue-600" />
            ) : (
              <User className="w-5 h-5 text-green-600" />
            )}
            <span className="font-semibold text-gray-900">
              {profile.role === 'admin' ? 'Administrador' : 'Usuario'}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Redirigiendo en {countdown} segundo{countdown !== 1 ? 's' : ''}...
          </p>
        </div>

        {/* Indicador de redirección */}
        {isRedirecting && (
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Redirigiendo...</span>
          </div>
        )}

        {/* Botón de cancelar */}
        <button
          onClick={() => {
            if (profile.role === 'admin') {
              router.push('/admin/dashboard')
            } else {
              router.push('/profile')
            }
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Continuar ahora
        </button>
      </div>
    </div>
  )
}
