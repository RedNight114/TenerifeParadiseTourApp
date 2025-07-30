"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider-ultra-simple"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, UserCheck, Mail, Shield, Users, CheckCircle, AlertCircle } from "lucide-react"

interface User {
  id: string
  email: string
  email_confirmed_at: string | null
  confirmed_at: string | null
  created_at: string
  role?: string
}

export default function TestUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [testEmail, setTestEmail] = useState("")
  const [testPassword, setTestPassword] = useState("test123456")
  const [testName, setTestName] = useState("Usuario de Prueba")

  const { user, profile } = useAuth()

  // Verificar que es admin
  if (!user || profile?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600">Solo administradores pueden acceder a esta página</p>
        </div>
      </div>
    )
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError("")

      // Obtener usuarios de auth.users (requiere RLS policy especial)
      const { data: authUsers, error: authError } = await supabase
        .from("auth.users")
        .select("id, email, email_confirmed_at, confirmed_at, created_at")
        .order("created_at", { ascending: false })

      if (authError) {
        // Si no podemos acceder a auth.users, usar profiles
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, email, role, created_at")
          .order("created_at", { ascending: false })

        if (profilesError) throw profilesError

        setUsers(
          profiles.map((p: any) => ({
            id: String(p.id),
            email: String(p.email),
            email_confirmed_at: null,
            confirmed_at: null,
            created_at: String(p.created_at),
            role: p.role ? String(p.role) : undefined,
          })),
        )
      } else {
        setUsers(
          (authUsers || []).map((u: any) => ({
            id: String(u.id),
            email: String(u.email),
            email_confirmed_at: u.email_confirmed_at ? String(u.email_confirmed_at) : null,
            confirmed_at: u.confirmed_at ? String(u.confirmed_at) : null,
            created_at: String(u.created_at),
          }))
        )
      }
    } catch (err) {
      setError("Error al cargar usuarios")
    } finally {
      setLoading(false)
    }
  }

  const createTestUser = async () => {
    if (!testEmail || !testPassword || !testName) {
      setError("Todos los campos son requeridos")
      return
    }

    try {
      setLoading(true)
      setError("")
      setSuccess("")

      // Crear usuario de prueba
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: testName,
          },
        },
      })

      if (signUpError) throw signUpError

      if (data.user) {
        // Confirmar automáticamente en desarrollo
        await confirmUser(data.user.id, testEmail)
        setSuccess(`Usuario de prueba ${testEmail} creado y confirmado`)
        setTestEmail("")
        setTestName("Usuario de Prueba")
        loadUsers()
      }
    } catch (err: any) {
      setError(err.message || "Error al crear usuario de prueba")
    } finally {
      setLoading(false)
    }
  }

  const confirmUser = async (userId: string, email: string) => {
    try {
      setConfirmLoading(userId)
      setError("")

      // Llamar a la función SQL para confirmar usuario
      const { error } = await supabase.rpc("confirm_test_user", {
        user_email: email,
      })

      if (error) throw error

      setSuccess(`Usuario ${email} confirmado exitosamente`)
      loadUsers()
    } catch (err: any) {
      setError(err.message || "Error al confirmar usuario")
    } finally {
      setConfirmLoading(null)
    }
  }

  const getUserStatusBadge = (user: User) => {
    if (user.email_confirmed_at) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Confirmado
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        Pendiente
      </Badge>
    )
  }

  const getRoleBadge = (role?: string) => {
    if (role === "admin") {
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800">
          Admin
        </Badge>
      )
    }
    return <Badge variant="outline">Cliente</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios de Prueba</h1>
              <p className="text-sm text-gray-600">Crear y confirmar usuarios para testing</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensajes */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Crear usuario de prueba */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5" />
                <span>Crear Usuario de Prueba</span>
              </CardTitle>
              <CardDescription>Crea un usuario de prueba que será confirmado automáticamente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="testEmail">Email</Label>
                <Input
                  id="testEmail"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <div>
                <Label htmlFor="testName">Nombre Completo</Label>
                <Input
                  id="testName"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="Usuario de Prueba"
                />
              </div>
              <div>
                <Label htmlFor="testPassword">Contraseña</Label>
                <Input
                  id="testPassword"
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <Button onClick={createTestUser} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creando...
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Crear Usuario de Prueba
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Usuarios existentes */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Usuarios Registrados</span>
                  </CardTitle>
                  <CardDescription>Lista de usuarios y su estado de confirmación</CardDescription>
                </div>
                <Button onClick={loadUsers} variant="outline" size="sm">
                  Actualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Cargando usuarios...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay usuarios registrados</p>
                  <Button onClick={loadUsers} variant="outline" className="mt-4 bg-transparent">
                    Cargar Usuarios
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{user.email}</span>
                          </div>
                          <div className="flex space-x-2 mb-2">
                            {getUserStatusBadge(user)}
                            {user.role && getRoleBadge(user.role)}
                          </div>
                          <p className="text-sm text-gray-500">
                            Creado: {new Date(user.created_at).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                        {!user.email_confirmed_at && (
                          <Button
                            size="sm"
                            onClick={() => confirmUser(user.id, user.email)}
                            disabled={confirmLoading === user.id}
                          >
                            {confirmLoading === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirmar
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instrucciones */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Instrucciones para Testing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Opción 1: Crear Usuario de Prueba</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Completa el formulario de arriba</li>
                  <li>El usuario será creado y confirmado automáticamente</li>
                  <li>Podrás iniciar sesión inmediatamente</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Opción 2: Confirmar Usuario Existente</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Registra un usuario normalmente</li>
                  <li>Haz clic en "Actualizar" para ver usuarios</li>
                  <li>Haz clic en "Confirmar" para activar el usuario</li>
                </ol>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Usuarios Admin Predefinidos:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• admin@tenerifeparadise.com</li>
                <li>• samuel@tenerifeparadise.com</li>
                <li>• tecnicos@tenerifeparadise.com</li>
              </ul>
              <p className="text-xs text-blue-700 mt-2">Estos usuarios tendrán rol de admin una vez confirmados</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
