"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, CheckCircle, AlertCircle, Database } from "lucide-react"
import { getSimpleSupabaseClient } from "@/lib/supabase-simple"

export default function DashboardMinimal() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown')

  const testSupabaseConnection = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const supabase = getSimpleSupabaseClient()
      
      // Probar conexión básica
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      if (profilesError) {
        throw new Error(`Error en profiles: ${profilesError.message}`)
      }
      
      // Probar servicios
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id, title, available')
        .limit(5)
      
      if (servicesError) {
        throw new Error(`Error en services: ${servicesError.message}`)
      }
      
      // Probar reservas
      const { data: reservations, error: reservationsError } = await supabase
        .from('reservations')
        .select('id, status, total_amount')
        .limit(5)
      
      if (reservationsError) {
        throw new Error(`Error en reservations: ${reservationsError.message}`)
      }
      
      setData({
        profiles: profiles?.length || 0,
        services: services?.length || 0,
        reservations: reservations?.length || 0,
        servicesData: services || [],
        reservationsData: reservations || [],
        message: "Conexión a Supabase exitosa"
      })
      
      setConnectionStatus('connected')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setConnectionStatus('error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testSupabaseConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Dashboard Minimal</h1>
          <p className="text-gray-600 mb-8">Prueba de conexión directa a Supabase sin autenticación</p>
        </div>

        {/* Estado de Conexión */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Estado de Supabase
              </span>
              <Button onClick={testSupabaseConnection} disabled={loading} size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Probar Conexión
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-4">
              {connectionStatus === 'connected' && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-6 w-6 mr-2" />
                  <span className="font-medium">Conectado</span>
                </div>
              )}
              {connectionStatus === 'error' && (
                <div className="flex items-center text-red-600">
                  <AlertCircle className="h-6 w-6 mr-2" />
                  <span className="font-medium">Error de Conexión</span>
                </div>
              )}
              {connectionStatus === 'unknown' && (
                <div className="flex items-center text-yellow-600">
                  <AlertCircle className="h-6 w-6 mr-2" />
                  <span className="font-medium">Desconocido</span>
                </div>
              )}
            </div>

            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p>Probando conexión a Supabase...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-4">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600">Error: {error}</p>
              </div>
            )}

            {data && (
              <div className="space-y-4">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-green-600 font-medium">{data.message}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{data.profiles}</div>
                    <div className="text-sm text-gray-600">Perfiles</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{data.services}</div>
                    <div className="text-sm text-gray-600">Servicios</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{data.reservations}</div>
                    <div className="text-sm text-gray-600">Reservas</div>
                  </div>
                </div>

                {/* Datos de servicios */}
                {data.servicesData.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Servicios Disponibles</h3>
                    <div className="space-y-2">
                      {data.servicesData.map((service: any) => (
                        <div key={service.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <span className="font-medium">{service.title}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            service.available 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {service.available ? 'Disponible' : 'No disponible'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Datos de reservas */}
                {data.reservationsData.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Reservas Recientes</h3>
                    <div className="space-y-2">
                      {data.reservationsData.map((reservation: any) => (
                        <div key={reservation.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <span className="font-medium">Reserva #{reservation.id.slice(0, 8)}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">€{reservation.total_amount}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              reservation.status === 'confirmado' 
                                ? 'bg-green-100 text-green-800'
                                : reservation.status === 'pendiente'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {reservation.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información de Debug */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
              <p><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
              <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurado' : 'No configurado'}</p>
              <p><strong>Supabase Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurado' : 'No configurado'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
