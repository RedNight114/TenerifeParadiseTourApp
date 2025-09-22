"use client"

import React, { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { getSupabaseClient } from '@/lib/supabase-unified'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  Search, 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  User as UserIcon
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface User {
  id: string
  email: string
  full_name: string | null
  role: 'client' | 'admin' | 'guide' | 'staff' | 'manager'
  avatar_url: string | null
  created_at: string
  updated_at: string
  last_sign_in_at: string | null
  email_confirmed_at: string | null
  is_active: boolean
}

interface UserStats {
  total: number
  clients: number
  admins: number
  staff: number
  active: number
  inactive: number
  new_this_month: number
}

// Componente interno que solo se ejecuta en el cliente
function UsersManagementContent() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [stats, setStats] = useState<UserStats | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Cargar usuarios
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)


      const client = await getSupabaseClient()
      if (!client) {
        throw new Error("No se pudo obtener el cliente de Supabase")
      }

      // Obtener usuarios desde auth.users y profiles
      const { data: authUsers, error: authError } = await client.auth.admin.listUsers({
        page: 1,
        perPage: 1000
      })

      if (authError) throw authError

      // Obtener perfiles
      const { data: profiles, error: profilesError } = await client
        .from('profiles')
        .select('*')

      if (profilesError) throw profilesError

      // Combinar datos de auth.users y profiles
      const usersData: User[] = authUsers.users.map(authUser => {
        const profile = profiles?.find(p => p.id === authUser.id)
        
        return {
          id: authUser.id,
          email: authUser.email || '',
          full_name: profile?.full_name || authUser.user_metadata?.full_name || null,
          role: profile?.role || 'client',
          avatar_url: profile?.avatar_url || null,
          created_at: authUser.created_at,
          updated_at: profile?.updated_at || authUser.created_at,
          last_sign_in_at: authUser.last_sign_in_at || null,
          email_confirmed_at: authUser.email_confirmed_at || null,
          is_active: profile?.is_active ?? true
        }
      })

      setUsers(usersData)

      // Calcular estadísticas
      const userStats: UserStats = {
        total: usersData.length,
        clients: usersData.filter(u => u.role === 'client').length,
        admins: usersData.filter(u => u.role === 'admin').length,
        staff: usersData.filter(u => ['guide', 'staff', 'manager'].includes(u.role)).length,
        active: usersData.filter(u => u.is_active).length,
        inactive: usersData.filter(u => !u.is_active).length,
        new_this_month: usersData.filter(u => {
          const createdDate = new Date(u.created_at)
          const now = new Date()
          const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          return createdDate >= thisMonth
        }).length
      }

      setStats(userStats)

    } catch (err: unknown) {
      setError(`Error al cargar usuarios: ${err instanceof Error ? err.message : 'Error desconocido'}`)
    } finally {
      setLoading(false)
    }
  }, [])

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active)

    return matchesSearch && matchesRole && matchesStatus
  })

  // Actualizar rol de usuario
  const updateUserRole = async (userId: string, newRole: string) => {
    try {

      const client = await getSupabaseClient()
      if (!client) {
        throw new Error("No se pudo obtener el cliente de Supabase")
      }

      const { error } = await client
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) throw error

      // Actualizar estado local
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, role: newRole as User['role'], updated_at: new Date().toISOString() }
          : user
      ))

      toast.success('Rol actualizado correctamente')
    } catch (err: unknown) {
      toast.error(`Error al actualizar rol: ${err instanceof Error ? err.message : 'Error desconocido'}`)
    }
  }

  // Cambiar estado del usuario
  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {

      const client = await getSupabaseClient()
      if (!client) {
        throw new Error("No se pudo obtener el cliente de Supabase")
      }

      if (isActive) {
        // Activar usuario
        const { error } = await client.auth.admin.updateUserById(userId, {
          ban_duration: 'none'
        })
        if (error) throw error
      } else {
        // Desactivar usuario
        const { error } = await client.auth.admin.updateUserById(userId, {
          ban_duration: '876000h' // 100 años
        })
        if (error) throw error
      }

      // Actualizar estado local
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, is_active: isActive }
          : user
      ))

      toast.success(isActive ? 'Usuario activado' : 'Usuario desactivado')
    } catch (err: unknown) {
      toast.error(`Error al cambiar estado: ${err instanceof Error ? err.message : 'Error desconocido'}`)
    }
  }

  // Exportar usuarios
  const exportUsers = () => {
    const csvContent = [
      ['Email', 'Nombre', 'Rol', 'Estado', 'Fecha Registro', 'Último Acceso'],
      ...filteredUsers.map(user => [
        user.email,
        user.full_name || '',
        user.role,
        user.is_active ? 'Activo' : 'Inactivo',
        new Date(user.created_at).toLocaleDateString('es-ES'),
        user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('es-ES') : 'Nunca'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `usuarios-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar usuarios</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadUsers}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra usuarios, roles y permisos del sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportUsers}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={loadUsers} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Clientes</p>
                  <p className="text-2xl font-bold text-green-600">{stats.clients}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <UserIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Administradores</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Personal</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.staff}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <UserPlus className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="client">Clientes</SelectItem>
                <SelectItem value="admin">Administradores</SelectItem>
                <SelectItem value="guide">Guías</SelectItem>
                <SelectItem value="staff">Personal</SelectItem>
                <SelectItem value="manager">Gerentes</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Usuarios ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron usuarios</h3>
              <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar_url || ''} alt={user.full_name || user.email} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                          {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {user.full_name || 'Sin nombre'}
                          </h3>
                          <Badge 
                            variant={user.is_active ? "default" : "secondary"}
                            className={cn(
                              "text-xs",
                              user.is_active 
                                ? "bg-green-100 text-green-800 hover:bg-green-100" 
                                : "bg-red-100 text-red-800 hover:bg-red-100"
                            )}
                          >
                            {user.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                          <Badge 
                            variant="outline"
                            className={cn(
                              "text-xs",
                              user.role === 'admin' ? "border-purple-300 text-purple-700" :
                              user.role === 'client' ? "border-blue-300 text-blue-700" :
                              "border-orange-300 text-orange-700"
                            )}
                          >
                            {user.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{user.email}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Registrado: {new Date(user.created_at).toLocaleDateString('es-ES')}
                          </span>
                          {user.last_sign_in_at && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Último acceso: {new Date(user.last_sign_in_at).toLocaleDateString('es-ES')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Cambiar rol */}
                      <Select
                        value={user.role}
                        onValueChange={(newRole) => updateUserRole(user.id, newRole)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client">Cliente</SelectItem>
                          <SelectItem value="guide">Guía</SelectItem>
                          <SelectItem value="staff">Personal</SelectItem>
                          <SelectItem value="manager">Gerente</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Cambiar estado */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleUserStatus(user.id, !user.is_active)}
                        className={cn(
                          "w-20",
                          user.is_active 
                            ? "border-red-300 text-red-600 hover:bg-red-50" 
                            : "border-green-300 text-green-600 hover:bg-green-50"
                        )}
                      >
                        {user.is_active ? 'Desactivar' : 'Activar'}
                      </Button>

                      {/* Ver detalles */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalles del usuario */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Usuario</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar_url || ''} alt={selectedUser.full_name || selectedUser.email} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-lg">
                    {selectedUser.full_name ? selectedUser.full_name.charAt(0).toUpperCase() : selectedUser.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedUser.full_name || 'Sin nombre'}
                  </h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      variant={selectedUser.is_active ? "default" : "secondary"}
                      className={selectedUser.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                    >
                      {selectedUser.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                    <Badge variant="outline">{selectedUser.role}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Fecha de Registro</label>
                  <p className="text-sm text-gray-900">{new Date(selectedUser.created_at).toLocaleString('es-ES')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Última Actualización</label>
                  <p className="text-sm text-gray-900">{new Date(selectedUser.updated_at).toLocaleString('es-ES')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email Confirmado</label>
                  <p className="text-sm text-gray-900">
                    {selectedUser.email_confirmed_at ? 
                      new Date(selectedUser.email_confirmed_at).toLocaleString('es-ES') : 
                      'No confirmado'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Último Acceso</label>
                  <p className="text-sm text-gray-900">
                    {selectedUser.last_sign_in_at ? 
                      new Date(selectedUser.last_sign_in_at).toLocaleString('es-ES') : 
                      'Nunca'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Wrapper que se renderiza solo en el cliente
export function UsersManagement() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return <UsersManagementContent />
}
