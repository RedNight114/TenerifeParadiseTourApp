"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface AdminRedirectProps {
  children: React.ReactNode
}

export function AdminRedirect({ children }: AdminRedirectProps) {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user && profile) {
      if (profile.role === 'admin') {
        router.replace('/admin/dashboard')
      }
    }
  }, [user, profile, isLoading, router])

  // Mostrar loading si es admin o está cargando
  if (isLoading || (user && profile?.role === 'admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0061A8] mx-auto mb-4" />
          <p className="text-gray-600">Redirigiendo al panel de administración...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
