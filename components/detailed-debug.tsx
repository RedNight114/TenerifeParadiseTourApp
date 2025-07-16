"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { RefreshCw, Eye, EyeOff, Database, User, Settings } from "lucide-react"

interface DebugData {
  supabase: any
  auth: any
  user: any
  profile: any
  services: any
  reservations: any
  categories: any
}

export function DetailedDebug() {
  const [debugData, setDebugData] = useState<DebugData | null>(null)
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)

  const fetchDebugData = async () => {
    setLoading(true)
    try {
      // Obtener datos de Supabase
      const { data: { user } } = await supabase.auth.getUser()
      
      // Obtener perfil del usuario
      let profile = null
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        profile = profileData
      }

      // Obtener servicios
      const { data: services } = await supabase
        .from("services")
        .select("*")
        .limit(5)

      // Obtener reservas
      const { data: reservations } = await supabase
        .from("reservations")
        .select("*")
        .limit(5)

      // Obtener categorías
      const { data: categories } = await supabase
        .from("categories")
        .select("*")

      setDebugData({
        supabase: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        },
        auth: {
          user: user ? {
            id: user.id,
            email: user.email,
            email_confirmed_at: user.email_confirmed_at,
            created_at: user.created_at,
          } : null,
        },
        user: user,
        profile: profile,
        services: services,
        reservations: reservations,
        categories: categories,
      })
    } catch (error) {
      console.error("Error obteniendo datos de debug:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDebugData()
  }, [])

  if (!debugData) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setVisible(!visible)}
        variant="outline"
        size="sm"
        className="bg-white/90 backdrop-blur-sm"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        Debug
      </Button>

      {visible && (
        <Card className="w-96 max-h-96 overflow-y-auto mt-2 bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Debug Info</CardTitle>
              <Button
                onClick={fetchDebugData}
                size="sm"
                variant="ghost"
                disabled={loading}
              >
                <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {/* Supabase Config */}
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Database className="h-3 w-3" />
                <span className="font-medium">Supabase</span>
              </div>
              <div className="space-y-1">
                <div>URL: {debugData.supabase.url ? "✅" : "❌"}</div>
                <div>Anon Key: {debugData.supabase.hasAnonKey ? "✅" : "❌"}</div>
                <div>Service Key: {debugData.supabase.hasServiceKey ? "✅" : "❌"}</div>
              </div>
            </div>

            {/* Auth Status */}
            <div>
              <div className="flex items-center gap-1 mb-1">
                <User className="h-3 w-3" />
                <span className="font-medium">Auth</span>
              </div>
              <div className="space-y-1">
                <div>
                  User: {debugData.auth.user ? "✅" : "❌"}
                  {debugData.auth.user && (
                    <span className="ml-1 text-gray-500">
                      ({debugData.auth.user.email})
                    </span>
                  )}
                </div>
                <div>
                  Profile: {debugData.profile ? "✅" : "❌"}
                  {debugData.profile && (
                    <span className="ml-1 text-gray-500">
                      ({debugData.profile.role})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Data Counts */}
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Settings className="h-3 w-3" />
                <span className="font-medium">Data</span>
              </div>
              <div className="space-y-1">
                <div>Services: {debugData.services?.length || 0}</div>
                <div>Reservations: {debugData.reservations?.length || 0}</div>
                <div>Categories: {debugData.categories?.length || 0}</div>
              </div>
            </div>

            {/* Environment */}
            <div>
              <div className="font-medium mb-1">Environment</div>
              <div className="space-y-1">
                <div>NODE_ENV: {process.env.NODE_ENV}</div>
                <div>Site URL: {process.env.NEXT_PUBLIC_SITE_URL || "Not set"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 