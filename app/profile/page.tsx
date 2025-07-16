"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AvatarUpload } from "@/components/avatar-upload"
import { User, Mail, Calendar, Shield, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function ProfilePage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [pageLoading, setPageLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!authLoading) {
        if (!user) {
          router.push("/login")
        } else {
          setPageLoading(false)
        }
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [user, authLoading, router])

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        email: profile.email || "",
      })
    }
  }, [profile])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setUpdateStatus("idle")
  }

  const handleAvatarChange = (url: string) => {
    // El avatar se actualiza directamente en el componente AvatarUpload
    // Aquí podríamos refrescar el perfil si fuera necesario
    setUpdateStatus("success")
    setTimeout(() => setUpdateStatus("idle"), 3000)
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

      const { error: profileError } = await supabase.from("profiles").update(updateData).eq("id", user.id)

      if (profileError) throw profileError

      setUpdateStatus("success")
      setTimeout(() => setUpdateStatus("idle"), 3000)
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

  // Loading state
  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0061A8] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso Requerido</h1>
          <p className="text-gray-600 mb-6">Necesitas iniciar sesión para ver tu perfil</p>
          <Button onClick={() => router.push("/login")} className="bg-[#0061A8] hover:bg-[#0061A8]/90">
            Iniciar Sesión
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/hero-profile.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0061A8]/80 via-[#0061A8]/60 to-[#F4C762]/40" />
        <div className="relative container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">Mi Perfil</h1>
            <p className="text-xl md:text-2xl text-white/95 leading-relaxed drop-shadow-md">
              Personaliza tu información y conquista nuevas cumbres desde tu espacio personal
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Summary Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <AvatarUpload
                      currentAvatarUrl={profile?.avatar_url}
                      userId={user.id}
                      fallbackText={profile?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                      onAvatarChange={handleAvatarChange}
                      size="lg"
                    />
                  </div>
                  <CardTitle className="text-xl">{profile?.full_name || "Usuario"}</CardTitle>
                  <CardDescription className="space-y-1">
                    <div>{profile?.email || user.email}</div>
                  </CardDescription>
                  <div className="flex justify-center mt-4">
                    <Badge
                      variant={profile?.role === "admin" ? "default" : "secondary"}
                      className="flex items-center gap-1"
                    >
                      <Shield className="h-3 w-3" />
                      {profile?.role === "admin" ? "Administrador" : "Usuario"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      Miembro desde {formatDate(profile?.created_at || "")}
                    </div>
                    {profile?.updated_at && profile.updated_at !== profile.created_at && (
                      <div className="flex items-center justify-center text-sm text-muted-foreground">
                        <User className="h-4 w-4 mr-2" />
                        Última actualización {formatDate(profile.updated_at)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Edit Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información Personal
                  </CardTitle>
                  <CardDescription>
                    Actualiza tu información personal y de contacto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    {/* Status Messages */}
                    {updateStatus === "success" && (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Perfil actualizado correctamente
                        </AlertDescription>
                      </Alert>
                    )}

                    {updateStatus === "error" && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errorMessage}</AlertDescription>
                      </Alert>
                    )}

                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="text-sm font-medium">
                        Nombre Completo
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Correo Electrónico
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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

                    <Separator />

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isUpdating}
                        className="bg-[#0061A8] hover:bg-[#0061A8]/90"
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Actualizando...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar Cambios
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
