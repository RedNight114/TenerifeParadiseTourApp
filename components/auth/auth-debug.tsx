"use client"

import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, User, Shield, AlertCircle, CheckCircle } from 'lucide-react'
import { useState } from 'react'

export function AuthDebug() {
  const auth = useAuth()
  const [refreshCount, setRefreshCount] = useState(0)

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1)
    // Forzar re-render
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Debug de Autenticación
        </CardTitle>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado general */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              {auth.isInitialized ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-600" />
              )}
              Estado de Inicialización
            </h4>
            <Badge variant={auth.isInitialized ? "default" : "secondary"}>
              {auth.isInitialized ? "Inicializado" : "Inicializando..."}
            </Badge>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              {auth.user ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              Usuario Autenticado
            </h4>
            <Badge variant={auth.user ? "default" : "destructive"}>
              {auth.user ? "Sí" : "No"}
            </Badge>
          </div>
        </div>

        {/* Información del usuario */}
        {auth.user && (
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              Información del Usuario
            </h4>
            <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
              <div><strong>ID:</strong> {auth.user.id}</div>
              <div><strong>Email:</strong> {auth.user.email}</div>
              <div><strong>Creado:</strong> {new Date(auth.user.created_at).toLocaleString()}</div>
              <div><strong>Último acceso:</strong> {new Date(auth.user.last_sign_in_at || auth.user.created_at).toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Información del perfil */}
        {auth.profile && (
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              Información del Perfil
            </h4>
            <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
              <div><strong>Nombre:</strong> {auth.profile.full_name || "No especificado"}</div>
              <div><strong>Rol:</strong> 
                <Badge variant={auth.profile.role === 'admin' ? "default" : "secondary"} className="ml-2">
                  {auth.profile.role === 'admin' ? "Administrador" : "Usuario"}
                </Badge>
              </div>
              <div><strong>Teléfono:</strong> {auth.profile.phone || "No especificado"}</div>
              <div><strong>Avatar:</strong> {auth.profile.avatar_url ? "Sí" : "No"}</div>
            </div>
          </div>
        )}

        {/* Estado de la sesión */}
        <div className="space-y-2">
          <h4 className="font-semibold">Estado de la Sesión</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium">Sesión Válida</div>
              <Badge variant={auth.isSessionValid() ? "default" : "destructive"}>
                {auth.isSessionValid() ? "Sí" : "No"}
              </Badge>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium">Cargando</div>
              <Badge variant={auth.isLoading ? "secondary" : "outline"}>
                {auth.isLoading ? "Sí" : "No"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Información de la sesión */}
        {auth.user && (
          <div className="space-y-2">
            <h4 className="font-semibold">Información de la Sesión</h4>
            <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
              <div><strong>Autenticado:</strong> {auth.getSessionInfo().isAuthenticated ? "Sí" : "No"}</div>
              <div><strong>Es Admin:</strong> {auth.getSessionInfo().isAdmin ? "Sí" : "No"}</div>
              <div><strong>Edad de la sesión:</strong> {auth.getSessionInfo().sessionAge > 0 ? `${Math.round(auth.getSessionInfo().sessionAge / 1000 / 60)} minutos` : "N/A"}</div>
            </div>
          </div>
        )}

        {/* Errores */}
        {auth.error && (
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              Error
            </h4>
            <div className="bg-red-50 p-3 rounded-lg text-sm text-red-800">
              {auth.error}
            </div>
          </div>
        )}

        {/* Refresh count */}
        <div className="text-xs text-gray-500 text-center">
          Actualizaciones: {refreshCount}
        </div>
      </CardContent>
    </Card>
  )
}
