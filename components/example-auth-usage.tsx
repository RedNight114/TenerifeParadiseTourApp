"use client"

import React from 'react'
import { AuthGuardFixed } from '@/components/auth-guard-fixed'
import { useAuthFixed } from '@/hooks/use-auth-fixed'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw, User, Shield, LogOut } from 'lucide-react'

// Ejemplo de página protegida para usuarios normales
export function ExampleProtectedPage() {
  return (
    <AuthGuardFixed requireAuth={true}>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Página Protegida</h1>
        <UserProfile />
      </div>
    </AuthGuardFixed>
  )
}

// Ejemplo de página protegida para administradores
export function ExampleAdminPage() {
  return (
    <AuthGuardFixed requireAuth={true} requireAdmin={true}>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>
        <AdminPanel />
      </div>
    </AuthGuardFixed>
  )
}

// Ejemplo de página pública
export function ExamplePublicPage() {
  return (
    <AuthGuardFixed requireAuth={false}>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Página Pública</h1>
        <PublicContent />
      </div>
    </AuthGuardFixed>
  )
}

// Componente que usa el hook de autenticación
function UserProfile() {
  const { user, profile, loading, error, signOut, refreshAuth } = useAuthFixed()

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span>Cargando perfil...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert className="mb-4">
        <AlertDescription>
          Error: {error}
          <Button 
            onClick={refreshAuth} 
            variant="outline" 
            size="sm" 
            className="ml-2"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Reintentar
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Información del Usuario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Nombre:</span>
              <span>{profile?.full_name || 'No especificado'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Rol:</span>
              <span className="flex items-center">
                {profile?.role === 'admin' && <Shield className="w-4 h-4 mr-1" />}
                {profile?.role}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Teléfono:</span>
              <span>{profile?.phone || 'No especificado'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={refreshAuth} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar Perfil
        </Button>
        <Button onClick={signOut} variant="destructive">
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}

// Componente de panel de administración
function AdminPanel() {
  const { user, profile } = useAuthFixed()

  return (
    <div className="space-y-4">
      <Alert>
        <Shield className="w-4 h-4" />
        <AlertDescription>
          Bienvenido al panel de administración, {profile?.full_name}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Acciones de Administrador</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="w-full">
              Gestionar Usuarios
            </Button>
            <Button className="w-full">
              Ver Estadísticas
            </Button>
            <Button className="w-full">
              Configuración del Sistema
            </Button>
            <Button className="w-full">
              Logs de Actividad
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente de contenido público
function PublicContent() {
  const { user, isAuthenticated } = useAuthFixed()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Contenido Público</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Esta página es accesible para todos los usuarios.</p>
          {isAuthenticated && (
            <Alert className="mt-4">
              <User className="w-4 h-4" />
              <AlertDescription>
                Hola {user?.email}, estás autenticado pero esta página es pública.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Hook personalizado que combina autenticación con lógica de negocio
export function useUserPermissions() {
  const { user, profile, isAuthenticated, isAdmin } = useAuthFixed()

  const canAccessAdmin = isAuthenticated && isAdmin
  const canEditProfile = isAuthenticated && !!user
  const canViewReservations = isAuthenticated && !!user
  const canMakeBookings = isAuthenticated && !!user

  return {
    user,
    profile,
    isAuthenticated,
    isAdmin,
    permissions: {
      canAccessAdmin,
      canEditProfile,
      canViewReservations,
      canMakeBookings
    }
  }
}

// Componente que usa el hook de permisos
export function PermissionBasedContent() {
  const { permissions, user } = useUserPermissions()

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Contenido Basado en Permisos</h2>
      
      {permissions.canEditProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Editar Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Puedes editar tu perfil porque estás autenticado.</p>
          </CardContent>
        </Card>
      )}

      {permissions.canViewReservations && (
        <Card>
          <CardHeader>
            <CardTitle>Mis Reservas</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Puedes ver tus reservas porque estás autenticado.</p>
          </CardContent>
        </Card>
      )}

      {permissions.canAccessAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Panel de Administración</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Puedes acceder al panel de administración porque eres admin.</p>
          </CardContent>
        </Card>
      )}

      {!permissions.isAuthenticated && (
        <Alert>
          <AlertDescription>
            Inicia sesión para acceder a más funcionalidades.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
} 