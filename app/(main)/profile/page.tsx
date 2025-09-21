"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar, Shield, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase-unified"
import { AvatarUpload } from "@/components/avatar-upload"
import { Profile } from "@/lib/supabase"

export default function ProfilePage() {
  const { user, isLoading: loading } = useAuth()
  const isAuthenticated = !!user
  const [profile, setProfile] = useState<Profile | null>(null)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
window.location.href = '/auth/login'
    }
  }, [loading, isAuthenticated])

  // Cargar perfil cuando el usuario esté disponible
  useEffect(() => {
    if (user?.id) {
      loadProfile()
    }
  }, [user?.id])

  const loadProfile = async () => {
    if (!user?.id) return

    try {
      const client = await getSupabaseClient()
      
      if (!client) {
        return
      }
      
      const { data, error } = await client
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()

      if (error) {
        return
      }

      if (data) {
        const profileData = data as unknown as Profile
        setProfile(profileData)
        setFormData({
          full_name: profileData.full_name || "",
          email: profileData.email || "",
        })
      }
    } catch (error) {
      // Error handled
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setUpdateStatus("idle")
  }

  const handleAvatarChange = (url: string) => {
    setUpdateStatus("success")
    setTimeout(() => setUpdateStatus("idle"), 3000)
    // Recargar perfil para obtener la nueva URL del avatar
    loadProfile()
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) return

    setIsUpdating(true)
    setUpdateStatus("idle")
    setErrorMessage("")

    try {
      const updateData = {
        full_name: formData.full_name,
        email: formData.email,
      }

      const client = await getSupabaseClient()
      
      if (!client) {
        throw new Error("No se pudo obtener el cliente de Supabase")
      }
      
      const { error: profileError } = await client.from("profiles").update(updateData).eq("id", user.id)

      if (profileError) throw profileError

      setUpdateStatus("success")
      setTimeout(() => setUpdateStatus("idle"), 3000)
      
      // Recargar perfil
      await loadProfile()
    } catch (error) {
      setUpdateStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Error al actualizar el perfil")
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Fecha no disponible"
    }
  }

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verificando autenticación</h2>
          <p className="text-gray-600">Por favor, espera un momento...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, no mostrar nada (ya se redirigió)
  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/hero-profile.jpg')",
          }}
        ></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Mi Perfil</h1>
            <p className="text-xl md:text-2xl">Gestiona tu información personal</p>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="relative">
                  <AvatarUpload
                    currentAvatarUrl={profile?.avatar_url}
                    userId={user.id}
                    fallbackText={profile?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                    onAvatarChange={handleAvatarChange}
                    size="lg"
                  />
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {profile?.full_name || "Usuario"}
                  </h2>
                  <p className="text-gray-600 mb-2">{profile?.email || user.email}</p>
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <Badge variant={profile?.role === "admin" ? "destructive" : "secondary"}>
                      {profile?.role === "admin" ? "Administrador" : "Cliente"}
                    </Badge>
                    <Badge variant="outline">
                      Miembro desde {formatDate(user.created_at)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Información Personal</span>
                </CardTitle>
                <CardDescription>
                  Actualiza tu información personal y de contacto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nombre Completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="full_name"
                          type="text"
                          value={formData.full_name}
                          onChange={(e) => handleInputChange("full_name", e.target.value)}
                          className="pl-10"
                          placeholder="Tu nombre completo"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="pl-10"
                          placeholder="tu@email.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status Messages */}
                  {updateStatus === "success" && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Perfil actualizado exitosamente
                      </AlertDescription>
                    </Alert>
                  )}

                  {updateStatus === "error" && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {errorMessage}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isUpdating}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Actualizando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Guardar Cambios
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Información de la Cuenta</span>
                </CardTitle>
                <CardDescription>
                  Detalles de tu cuenta y configuración
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">ID de Usuario</span>
                    </div>
                    <span className="text-sm text-gray-600 font-mono">
                      {user.id.substring(0, 8)}...
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Email Verificado</span>
                    </div>
                    <Badge variant={user.email_confirmed_at ? "default" : "secondary"}>
                      {user.email_confirmed_at ? "Sí" : "No"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Fecha de Registro</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {formatDate(user.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Rol</span>
                    </div>
                    <Badge variant={profile?.role === "admin" ? "destructive" : "secondary"}>
                      {profile?.role === "admin" ? "Administrador" : "Cliente"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}