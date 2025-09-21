"use client"

import { useAuth } from "@/hooks/use-auth"
import AuthGuard from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { user, profile, logout } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await logout()
    router.push("/")
  }

  return (
    <AuthGuard requireAuth={true} redirectTo="/auth/login">
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Bienvenido a tu panel de control</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del Usuario</CardTitle>
                <CardDescription>Datos de tu cuenta</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Nombre:</strong> {profile?.full_name || 'No especificado'}</p>
                  <p><strong>Rol:</strong> {profile?.role || 'Usuario'}</p>
                  <p><strong>ID:</strong> {user?.id}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
                <CardDescription>Gestiona tu cuenta</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    onClick={() => router.push("/")}
                    className="w-full"
                  >
                    Ir al Inicio
                  </Button>
                  <Button 
                    onClick={handleSignOut}
                    variant="outline"
                    className="w-full"
                  >
                    Cerrar Sesión
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
} 