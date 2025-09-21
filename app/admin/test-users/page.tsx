"use client"

import React, { useState, useEffect } from 'react'
import { AdminSidebarModern } from '@/components/admin/admin-sidebar-modern'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Users, 
  UserPlus, 
  Download, 
  Search, 
  Eye, 
  Shield, 
  User, 
  Crown,
  Mail,
  Calendar,
  MapPin,
  Phone,
  Activity,
  Loader2,
  CheckCircle,
  XCircle,
  Menu,
  Home
} from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase'
import { toast } from 'sonner'

// Interfaces
interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'staff' | 'customer'
  is_active: boolean
  created_at: string
  updated_at: string
  avatar_url?: string
  phone?: string
  address?: string
  last_login?: string
}

interface UserStats {
  total: number
  customers: number
  staff: number
  admins: number
  active: number
  inactive: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    customers: 0,
    staff: 0,
    admins: 0,
    active: 0,
    inactive: 0
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const supabase = await getSupabaseClient()
      
      // Obtener solo perfiles de la tabla profiles (más seguro y accesible)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) {
        toast.error('Error al cargar perfiles de usuarios')
        return
      }

      // Obtener información del usuario actual para verificar permisos
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        toast.error('No estás autenticado')
        return
      }

      // Verificar si el usuario actual es admin
      const currentUserProfile = profiles?.find(p => p.id === currentUser.id)
      if (currentUserProfile?.role !== 'admin') {
        toast.error('No tienes permisos para ver esta información')
        return
      }

      // Convertir perfiles a UserProfile (datos limitados pero funcionales)
      const combinedUsers: UserProfile[] = (profiles || []).map(profile => ({
        id: profile.id,
        email: profile.email || 'Email no disponible',
        full_name: profile.full_name,
        role: (profile.role as 'admin' | 'staff' | 'customer') || 'customer',
        is_active: profile.is_active ?? true, // Asumir activo si no está definido
        created_at: profile.created_at || new Date().toISOString(),
        updated_at: profile.updated_at || profile.created_at || new Date().toISOString(),
        avatar_url: profile.avatar_url,
        phone: profile.phone,
        address: profile.address,
        last_login: profile.last_login
      }))

      setUsers(combinedUsers)
      calculateStats(combinedUsers)
      
    } catch (error) {
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (usersData: UserProfile[]) => {
    const newStats: UserStats = {
      total: usersData.length,
      customers: usersData.filter(u => u.role === 'customer').length,
      staff: usersData.filter(u => u.role === 'staff').length,
      admins: usersData.filter(u => u.role === 'admin').length,
      active: usersData.filter(u => u.is_active).length,
      inactive: usersData.filter(u => !u.is_active).length
    }
    setStats(newStats)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.is_active) ||
                         (filterStatus === 'inactive' && !user.is_active)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'staff' | 'customer') => {
    try {
      const supabase = await getSupabaseClient()
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) {
        toast.error('Error al cambiar rol del usuario')
        return
      }

      // Actualizar estado local
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))
      
      toast.success('Rol actualizado correctamente')
      loadUsers() // Recargar para actualizar stats
    } catch (error) {
      toast.error('Error al cambiar rol del usuario')
    }
  }

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    try {
      const supabase = await getSupabaseClient()
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !isActive })
        .eq('id', userId)

      if (error) {
        toast.error('Error al cambiar estado del usuario')
        return
      }

      // Actualizar estado local
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_active: !isActive } : user
      ))
      
      toast.success(`Usuario ${isActive ? 'desactivado' : 'activado'} correctamente`)
      loadUsers() // Recargar para actualizar stats
    } catch (error) {
      toast.error('Error al cambiar estado del usuario')
    }
  }

  const handleExport = () => {
    const csvContent = [
      ['Email', 'Nombre', 'Rol', 'Estado', 'Fecha de Registro', 'Último Login'],
      ...filteredUsers.map(user => [
        user.email,
        user.full_name || '',
        user.role,
        user.is_active ? 'Activo' : 'Inactivo',
        new Date(user.created_at).toLocaleDateString('es-ES'),
        user.last_login ? new Date(user.last_login).toLocaleDateString('es-ES') : 'Nunca'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `usuarios-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    toast.success('Usuarios exportados correctamente')
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
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'staff': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'customer': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <AdminSidebarModern />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Loading State */}
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Cargando usuarios...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebarModern />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6">
        <div className="space-y-6">
      {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">👥 Gestión de Usuarios</h1>
              <p className="text-gray-600 mt-1">Administra usuarios, roles y permisos del sistema</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={handleExport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Nuevo Usuario
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
      </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Clientes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.customers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Staff</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.staff}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Crown className="w-5 h-5 text-purple-600" />
                  </div>
              <div>
                    <p className="text-sm font-medium text-gray-600">Admins</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                    <p className="text-sm font-medium text-gray-600">Activos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                    <p className="text-sm font-medium text-gray-600">Inactivos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                      placeholder="Buscar por email o nombre..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filtrar por rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los roles</SelectItem>
                    <SelectItem value="customer">Clientes</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Administradores</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
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

          {/* Users List */}
          <Card>
            <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Usuarios ({filteredUsers.length})</span>
                  </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>
                            {user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : user.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">
                              {user.full_name || 'Sin nombre'}
                            </h3>
                            <Badge className={getRoleColor(user.role)}>
                              {getRoleIcon(user.role)}
                              <span className="ml-1">
                                {user.role === 'customer' ? 'Cliente' : 
                                 user.role === 'staff' ? 'Staff' : 
                                 user.role === 'admin' ? 'Admin' : 
                                 user.role}
                              </span>
                            </Badge>
                            <Badge className={getStatusColor(user.is_active)}>
                              {user.is_active ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">
                            Registrado: {new Date(user.created_at).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                          <Button
                              variant="outline"
                            size="sm"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalles del Usuario</DialogTitle>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                  <Avatar className="w-20 h-20">
                                    <AvatarImage src={selectedUser.avatar_url} />
                                    <AvatarFallback className="text-lg">
                                      {selectedUser.full_name ? selectedUser.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : selectedUser.email[0].toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="text-xl font-bold">{selectedUser.full_name || 'Sin nombre'}</h3>
                                    <p className="text-gray-600">{selectedUser.email}</p>
                                    <div className="flex items-center space-x-2 mt-2">
                                      <Badge className={getRoleColor(selectedUser.role)}>
                                        {getRoleIcon(selectedUser.role)}
                                        <span className="ml-1">
                                          {selectedUser.role === 'customer' ? 'Cliente' : 
                                           selectedUser.role === 'staff' ? 'Staff' : 
                                           selectedUser.role === 'admin' ? 'Admin' : 
                                           selectedUser.role}
                                        </span>
                                      </Badge>
                                      <Badge className={getStatusColor(selectedUser.is_active)}>
                                        {selectedUser.is_active ? 'Activo' : 'Inactivo'}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900">Información Personal</h4>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex items-center space-x-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span>{selectedUser.email}</span>
                                      </div>
                                      {selectedUser.phone && (
                                        <div className="flex items-center space-x-2">
                                          <Phone className="w-4 h-4 text-gray-400" />
                                          <span>{selectedUser.phone}</span>
                                        </div>
                                      )}
                                      {selectedUser.address && (
                                        <div className="flex items-center space-x-2">
                                          <MapPin className="w-4 h-4 text-gray-400" />
                                          <span>{selectedUser.address}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900">Información de Cuenta</h4>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex items-center space-x-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>Registrado: {new Date(selectedUser.created_at).toLocaleDateString('es-ES')}</span>
                                      </div>
                                      {selectedUser.last_login && (
                                        <div className="flex items-center space-x-2">
                                          <Activity className="w-4 h-4 text-gray-400" />
                                          <span>Último login: {new Date(selectedUser.last_login).toLocaleDateString('es-ES')}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Select
                          value={user.role}
                          onValueChange={(value: 'admin' | 'staff' | 'customer') => handleRoleChange(user.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="customer">Cliente</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant={user.is_active ? "destructive" : "default"}
                              size="sm"
                            >
                              {user.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {user.is_active ? 'Desactivar Usuario' : 'Activar Usuario'}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {user.is_active 
                                  ? '¿Estás seguro de que quieres desactivar este usuario? No podrá acceder al sistema.'
                                  : '¿Estás seguro de que quieres activar este usuario? Podrá acceder al sistema nuevamente.'
                                }
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleToggleStatus(user.id, user.is_active)}
                              >
                                {user.is_active ? 'Desactivar' : 'Activar'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        </main>
      </div>
    </div>
  )
}