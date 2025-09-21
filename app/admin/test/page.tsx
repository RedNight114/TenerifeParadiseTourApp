"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react"

export default function TestPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Simular una conexión
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setData({
        message: "Conexión exitosa",
        timestamp: new Date().toISOString(),
        status: "OK"
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Página de Prueba</h1>
          <p className="text-gray-600 mb-8">Esta página no requiere autenticación para probar la carga básica</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Estado de la Conexión</span>
              <Button onClick={testConnection} disabled={loading} size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Probar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Probando conexión...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">Error: {error}</p>
              </div>
            )}

            {data && (
              <div className="text-center py-8">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-4" />
                <p className="text-green-600 mb-2">{data.message}</p>
                <p className="text-sm text-gray-600">Estado: {data.status}</p>
                <p className="text-sm text-gray-600">Hora: {new Date(data.timestamp).toLocaleString()}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Página cargada:</strong> {new Date().toLocaleString()}</p>
              <p><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
              <p><strong>Navegador:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent.split(' ')[0] : 'N/A'}</p>
              <p><strong>Resolución:</strong> {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-gray-600">
            Si esta página carga correctamente, el problema está en la autenticación o en el dashboard específico.
          </p>
        </div>
      </div>
    </div>
  )
}
