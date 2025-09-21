"use client"

import { useState, useEffect } from "react"
import { useAuthContext } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Shield, LogOut } from "lucide-react"

export default function AdminDashboardTest() {
  const { user, profile, signOut, loading, isInitialized } = useAuthContext()
  const [testData, setTestData] = useState<any>(null)
  const [testLoading, setTestLoading] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      }
  }

  const testConnection = async () => {
    setTestLoading(true)
    try {
      // Test simple de conexión
      const response = await fetch('/api/test')
      const data = await response.json()
      setTestData(data)
    } catch (error) {
      setTestData({ error: 'Error de conexión' })
    } finally {
      setTestLoading(false)
    }
  }

  // Mostrar loading mientras se inicializa la autenticación
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">
            Inicializando autenticación...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Estado: {loading ? 'Cargando' : 'Inicializando'}
          </p>
        </div>
      </div>
    )
  }

  // Verificar si es admin
  if (!user || profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Acceso Denegado
          </h1>
          <p className="text-gray-600 mb-4">
            No tienes permisos de administrador
          </p>
          <Button onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Simple */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">
                Dashboard Test
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {profile?.full_name || user?.email}
              </span>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Información del Usuario */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Usuario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Nombre:</strong> {profile?.full_name || 'No especificado'}</p>
                <p><strong>Rol:</strong> {profile?.role || 'No especificado'}</p>
                <p><strong>ID:</strong> {user?.id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Test de Conexión */}
          <Card>
            <CardHeader>
              <CardTitle>Test de Conexión</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={testConnection} 
                  disabled={testLoading}
                  className="w-full"
                >
                  {testLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Probando conexión...
                    </>
                  ) : (
                    'Probar Conexión'
                  )}
                </Button>
                
                {testData && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                    <h3 className="font-medium mb-2">Resultado:</h3>
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(testData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Estado del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Estado del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Autenticación:</strong> ✅ Inicializada</p>
                <p><strong>Usuario:</strong> ✅ Autenticado</p>
                <p><strong>Rol:</strong> ✅ Administrador</p>
                <p><strong>Dashboard:</strong> ✅ Cargado</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
