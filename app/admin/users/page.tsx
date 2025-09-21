"use client"

import React, { useState, useEffect } from 'react'
import { AdminLayoutModern } from '@/components/admin/admin-layout-modern'
import { AdminGuard } from '@/components/admin/admin-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  UserPlus, 
  Download, 
  Search, 
  Eye, 
  Shield, 
  User, 
  Crown, 
  Loader2, 
  CheckCircle, 
  XCircle,
  Edit,
  Filter,
  RefreshCw,
  Ban,
  Unlock,
  Calendar,
  Euro
} from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase'
import { toast } from 'sonner'

interface Reservation {
  id: string
  total_amount: number
  created_at: string
  status: string
}

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'staff' | 'client' | 'manager' | 'guide'
  is_active: boolean
  created_at: string
  updated_at?: string
  phone?: string
  address?: string
  reservations?: Reservation[]
  // Campos calculados
  total_reservations?: number
  total_spent?: number
  last_reservation_date?: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter, statusFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const supabase = await getSupabaseClient()
      
      // Cargar usuarios con estadísticas de reservas
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          reservations!user_id (
            id,
            total_amount,
            created_at,
            status
          )
        `)
        .order('created_at', { ascending: false })

      if (profilesError) {
        toast.error('Error al cargar usuarios')
        return
      }

      const userProfiles: UserProfile[] = (profiles || []).map(profile => {
        const reservations: Reservation[] = profile.reservations || []
        const totalReservations = reservations.length
        const totalSpent = reservations
          .filter((r: Reservation) => r.status === 'confirmed')
          .reduce((sum: number, r: Reservation) => sum + (r.total_amount || 0), 0)
        const lastReservation = reservations
          .sort((a: Reservation, b: Reservation) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

        return {
          id: profile.id,
          email: profile.email || 'Email no disponible',
          full_name: profile.full_name,
          role: (profile.role as 'admin' | 'staff' | 'client' | 'manager' | 'guide') || 'client',
          is_active: profile.is_active ?? true,
          created_at: profile.created_at || new Date().toISOString(),
          updated_at: profile.updated_at,
          phone: profile.phone,
          address: profile.address,
          total_reservations: totalReservations,
          total_spent: Math.round(totalSpent),
          last_reservation_date: lastReservation?.created_at
        }
      })

      setUsers(userProfiles)
      
    } catch (error) {
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por rol
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.is_active : !user.is_active
      )
    }

    setFilteredUsers(filtered)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4" />
      case 'staff': return <Shield className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'manager': return 'bg-indigo-100 text-indigo-800'
      case 'staff': return 'bg-blue-100 text-blue-800'
      case 'guide': return 'bg-teal-100 text-teal-800'
      case 'client': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const supabase = await getSupabaseClient()
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        throw new Error(`Error actualizando rol: ${error.message}`)
      }

      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, role: newRole as 'admin' | 'staff' | 'client' | 'manager' | 'guide' }
          : user
      ))
      
      toast.success('Rol actualizado correctamente')
    } catch (error) {
      toast.error('Error actualizando rol del usuario')
    }
  }

  const handleToggleStatus = async (userId: string) => {
    try {
      const supabase = await getSupabaseClient()
      const user = users.find(u => u.id === userId)
      
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_active: !user.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        throw new Error(`Error actualizando estado: ${error.message}`)
      }

      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, is_active: !u.is_active }
          : u
      ))
      
      toast.success(`Usuario ${!user.is_active ? 'activado' : 'desactivado'} correctamente`)
    } catch (error) {
      toast.error('Error actualizando estado del usuario')
    }
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => {
      const newSelected = new Set(prev)
      if (newSelected.has(userId)) {
        newSelected.delete(userId)
      } else {
        newSelected.add(userId)
      }
      return newSelected
    })
  }

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)))
    }
  }

  const handleBulkRoleChange = async (newRole: string) => {
    try {
      const supabase = await getSupabaseClient()
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .in('id', Array.from(selectedUsers))

      if (error) {
        throw new Error(`Error actualizando roles: ${error.message}`)
      }

      setUsers(prev => prev.map(user => 
        selectedUsers.has(user.id)
          ? { ...user, role: newRole as 'admin' | 'staff' | 'client' | 'manager' | 'guide' }
          : user
      ))
      
      setSelectedUsers(new Set())
      toast.success(`${selectedUsers.size} usuarios actualizados correctamente`)
    } catch (error) {
      toast.error('Error actualizando roles de usuarios')
    }
  }

  const handleBulkStatusChange = async (isActive: boolean) => {
    try {
      const supabase = await getSupabaseClient()
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .in('id', Array.from(selectedUsers))

      if (error) {
        throw new Error(`Error actualizando estados: ${error.message}`)
      }

      setUsers(prev => prev.map(user => 
        selectedUsers.has(user.id)
          ? { ...user, is_active: isActive }
          : user
      ))
      
      setSelectedUsers(new Set())
      toast.success(`${selectedUsers.size} usuarios ${isActive ? 'activados' : 'desactivados'} correctamente`)
    } catch (error) {
      toast.error('Error actualizando estados de usuarios')
    }
  }

  const handleViewDetails = (user: UserProfile) => {
    setSelectedUser(user)
    setIsDetailsModalOpen(true)
  }

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const exportUsers = () => {
    const csvContent = [
      ['ID', 'Nombre', 'Email', 'Rol', 'Estado', 'Reservas', 'Total Gastado', 'Fecha Registro'],
      ...filteredUsers.map(user => [
        user.id,
        user.full_name || 'Sin nombre',
        user.email,
        user.role,
        user.is_active ? 'Activo' : 'Inactivo',
        user.total_reservations || 0,
        user.total_spent || 0,
        new Date(user.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Usuarios exportados correctamente')
  }

  if (loading) {
    return (
      <AdminGuard>
        <AdminLayoutModern>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Cargando usuarios...</p>
            </div>
          </div>
        </AdminLayoutModern>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <AdminLayoutModern>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-7 h-7" />
                Gestión de Usuarios
              </h1>
              <p className="text-gray-600">Administra usuarios, roles y permisos del sistema</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={exportUsers}>
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
              <Button variant="outline" onClick={loadUsers}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Nuevo Usuario
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                  </DialogHeader>
                  <NewUserForm onSuccess={loadUsers} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="border-0 shadow-md bg-white border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                    <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                    <p className="text-xs text-gray-500">{filteredUsers.length} mostrados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-white border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Clientes</p>
                    <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'client').length}</p>
                    <p className="text-xs text-gray-500">{Math.round((users.filter(u => u.role === 'client').length / users.length) * 100) || 0}% del total</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-white border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Staff</p>
                    <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'staff').length}</p>
                    <p className="text-xs text-gray-500">{Math.round((users.filter(u => u.role === 'staff').length / users.length) * 100) || 0}% del total</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-white border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Crown className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Admins</p>
                    <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'admin').length}</p>
                    <p className="text-xs text-gray-500">{Math.round((users.filter(u => u.role === 'admin').length / users.length) * 100) || 0}% del total</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-white border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Activos</p>
                    <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.is_active).length}</p>
                    <p className="text-xs text-gray-500">{Math.round((users.filter(u => u.is_active).length / users.length) * 100) || 0}% activos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card className="border-0 shadow-md bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="w-5 h-5 mr-2 text-blue-500" />
                Filtros y Búsqueda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Nombre o email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="role">Rol</Label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los roles</SelectItem>
                      <SelectItem value="client">Clientes</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Activos</SelectItem>
                      <SelectItem value="inactive">Inactivos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={handleSelectAll}
                    className="w-full"
                  >
                    {selectedUsers.size === filteredUsers.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acciones masivas */}
          {selectedUsers.size > 0 && (
            <Card className="border-0 shadow-md bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-blue-800 font-medium">
                      {selectedUsers.size} usuario(s) seleccionado(s)
                    </span>
                    <Button 
                      onClick={() => setSelectedUsers(new Set())} 
                      variant="ghost" 
                      size="sm"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Cancelar selección
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select onValueChange={handleBulkRoleChange}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Cambiar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">Cliente</SelectItem>
                        <SelectItem value="guide">Guía</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={() => handleBulkStatusChange(true)}
                      variant="outline"
                      size="sm"
                    >
                      <Unlock className="w-4 h-4 mr-2" />
                      Activar
                    </Button>
                    <Button 
                      onClick={() => handleBulkStatusChange(false)}
                      variant="outline"
                      size="sm"
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Desactivar
                    </Button>
                </div>
              </div>
              </CardContent>
            </Card>
          )}

          {/* Users List */}
          <Card className="border-0 shadow-md bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Usuarios ({filteredUsers.length} de {users.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredUsers.length > 0 ? (
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                      selectedUsers.has(user.id) ? 'bg-blue-50 border-blue-200' : ''
                    }`}>
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-semibold text-gray-700">
                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {user.full_name || 'Sin nombre'}
                            </h3>
                            <Badge className={`${getRoleColor(user.role)} flex items-center gap-1`}>
                              {getRoleIcon(user.role)}
                              {user.role === 'client' ? 'Cliente' : 
                               user.role === 'staff' ? 'Staff' : 
                               user.role === 'manager' ? 'Manager' : 
                               user.role === 'guide' ? 'Guía' : 
                               user.role === 'admin' ? 'Admin' : 
                               user.role}
                            </Badge>
                            <Badge className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {user.is_active ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <p className="text-xs text-gray-500">
                              Registrado: {new Date(user.created_at).toLocaleDateString('es-ES')}
                            </p>
                            {user.total_reservations && user.total_reservations > 0 && (
                              <>
                                <span className="text-xs text-gray-400">•</span>
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  <Calendar className="w-3 h-3" />
                                  <span>{user.total_reservations} reservas</span>
                                </div>
                                {user.total_spent && user.total_spent > 0 && (
                                  <>
                                    <span className="text-xs text-gray-400">•</span>
                                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                                      <Euro className="w-3 h-3" />
                                      <span>€{user.total_spent.toLocaleString()}</span>
                                    </div>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(user)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Select onValueChange={(value) => handleRoleChange(user.id, value)} value={user.role}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="client">Cliente</SelectItem>
                            <SelectItem value="guide">Guía</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleToggleStatus(user.id)}
                          className={user.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                        >
                          {user.is_active ? <Ban className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No se encontraron usuarios</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? 'Intenta ajustar los filtros' : 'No hay usuarios registrados'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modal de detalles de usuario */}
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles del Usuario</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <UserDetailsModal user={selectedUser} />
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de edición de usuario */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <EditUserForm user={selectedUser} onSuccess={() => {
                loadUsers()
                setIsEditModalOpen(false)
              }} />
            )}
          </DialogContent>
        </Dialog>
      </AdminLayoutModern>
    </AdminGuard>
  )
}

// Componente para crear nuevo usuario
function NewUserForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'client',
    phone: '',
    address: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      const supabase = await getSupabaseClient()

      // Crear usuario en auth.users primero
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: 'TempPassword123!', // Contraseña temporal
        email_confirm: true
      })

      if (authError) {
        throw new Error(`Error creando usuario: ${authError.message}`)
      }

      // Crear perfil en profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.full_name,
          role: formData.role,
          phone: formData.phone || null,
          address: formData.address || null,
          is_active: true
        })

      if (profileError) {
        throw new Error(`Error creando perfil: ${profileError.message}`)
      }

      toast.success('Usuario creado correctamente')
      onSuccess()
      setFormData({
        email: '',
        full_name: '',
        role: 'client',
        phone: '',
        address: ''
      })
    } catch (error) {
      toast.error('Error creando usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="full_name">Nombre Completo</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="role">Rol</Label>
        <Select value={formData.role} onValueChange={(value: 'admin' | 'staff' | 'client' | 'manager' | 'guide') => setFormData({...formData, role: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="client">Cliente</SelectItem>
            <SelectItem value="guide">Guía</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="phone">Teléfono (opcional)</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
        />
      </div>
      
      <div>
        <Label htmlFor="address">Dirección (opcional)</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creando...' : 'Crear Usuario'}
        </Button>
      </div>
    </form>
  )
}

// Componente para editar usuario
function EditUserForm({ user, onSuccess }: { user: UserProfile, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    role: user.role,
    phone: user.phone || '',
    address: user.address || ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      const supabase = await getSupabaseClient()

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          role: formData.role,
          phone: formData.phone || null,
          address: formData.address || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        throw new Error(`Error actualizando usuario: ${error.message}`)
      }

      toast.success('Usuario actualizado correctamente')
      onSuccess()
    } catch (error) {
      toast.error('Error actualizando usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={user.email}
          disabled
          className="bg-gray-50"
        />
        <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
      </div>
      
      <div>
        <Label htmlFor="full_name">Nombre Completo</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="role">Rol</Label>
        <Select value={formData.role} onValueChange={(value: 'admin' | 'staff' | 'client' | 'manager' | 'guide') => setFormData({...formData, role: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="client">Cliente</SelectItem>
            <SelectItem value="guide">Guía</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
        />
      </div>
      
      <div>
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Actualizando...' : 'Actualizar Usuario'}
        </Button>
      </div>
    </form>
  )
}

// Componente para mostrar detalles del usuario
function UserDetailsModal({ user }: { user: UserProfile }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Información Personal</h3>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-600">Nombre:</span>
              <p className="text-sm text-gray-900">{user.full_name || 'Sin nombre'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Email:</span>
              <p className="text-sm text-gray-900">{user.email}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Teléfono:</span>
              <p className="text-sm text-gray-900">{user.phone || 'No proporcionado'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Dirección:</span>
              <p className="text-sm text-gray-900">{user.address || 'No proporcionada'}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Información de Cuenta</h3>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-600">Rol:</span>
              <p className="text-sm text-gray-900 capitalize">{user.role}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Estado:</span>
              <p className="text-sm text-gray-900">{user.is_active ? 'Activo' : 'Inactivo'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Fecha de Registro:</span>
              <p className="text-sm text-gray-900">{new Date(user.created_at).toLocaleDateString('es-ES')}</p>
            </div>
          </div>
        </div>
      </div>
      
      {(user.total_reservations && user.total_reservations > 0) && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Estadísticas de Reservas</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{user.total_reservations}</div>
              <div className="text-sm text-blue-800">Total Reservas</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">€{user.total_spent?.toLocaleString() || 0}</div>
              <div className="text-sm text-green-800">Total Gastado</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                €{user.total_reservations > 0 ? Math.round((user.total_spent || 0) / user.total_reservations) : 0}
              </div>
              <div className="text-sm text-purple-800">Promedio por Reserva</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
