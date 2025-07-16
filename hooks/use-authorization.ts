import { useEffect, useState, useCallback } from 'react'
import { useAuth } from './use-auth'
import { supabase } from '@/lib/supabase'

export type UserRole = 'client' | 'admin' | 'manager' | 'staff' | 'guide'

export interface Permission {
  permission_name: string
  resource: string
  action: string
  description: string
}

export interface AuthorizationState {
  isLoading: boolean
  userRole: UserRole | null
  permissions: Permission[]
  hasRole: (role: UserRole) => boolean
  hasPermission: (permission: string) => boolean
  canAccessResource: (resource: string, action: string) => boolean
  isAdmin: boolean
  isManagerOrAbove: boolean
  isStaffOrAbove: boolean
}

export function useAuthorization(): AuthorizationState {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])

  // Función para cargar el rol y permisos del usuario
  const loadUserAuthorization = useCallback(async () => {
    if (!user) {
      setUserRole(null)
      setPermissions([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)

      // Obtener el perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error obteniendo perfil para autorización:', profileError)
        setUserRole(null)
        setPermissions([])
        return
      }

      const role = profile.role as UserRole
      setUserRole(role)

      // Obtener los permisos del usuario
      const { data: userPermissions, error: permissionsError } = await supabase
        .from('user_permissions')
        .select(`
          permission_name,
          resource,
          action,
          description
        `)
        .eq('user_id', user.id)

      if (permissionsError) {
        console.error('Error obteniendo permisos:', permissionsError)
        setPermissions([])
      } else {
        setPermissions(userPermissions || [])
      }

      console.log('Autorización cargada:', {
        userId: user.id,
        role,
        permissionsCount: userPermissions?.length || 0
      })
    } catch (error) {
      console.error('Error cargando autorización:', error)
      setUserRole(null)
      setPermissions([])
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Cargar autorización cuando cambie el usuario
  useEffect(() => {
    loadUserAuthorization()
  }, [loadUserAuthorization])

  // Función para verificar si el usuario tiene un rol específico
  const hasRole = useCallback((role: UserRole): boolean => {
    if (!userRole) return false

    // Jerarquía de roles (de menor a mayor privilegio)
    const roleHierarchy: Record<UserRole, number> = {
      'client': 1,
      'guide': 2,
      'staff': 3,
      'manager': 4,
      'admin': 5
    }

    const userRoleLevel = roleHierarchy[userRole] || 0
    const requiredRoleLevel = roleHierarchy[role]

    return userRoleLevel >= requiredRoleLevel
  }, [userRole])

  // Función para verificar si el usuario tiene un permiso específico
  const hasPermission = useCallback((permissionName: string): boolean => {
    return permissions.some(permission => permission.permission_name === permissionName)
  }, [permissions])

  // Función para verificar si el usuario puede acceder a un recurso específico
  const canAccessResource = useCallback((resource: string, action: string): boolean => {
    return permissions.some(permission => 
      permission.resource === resource && permission.action === action
    )
  }, [permissions])

  // Computed properties para roles específicos
  const isAdmin = hasRole('admin')
  const isManagerOrAbove = hasRole('manager')
  const isStaffOrAbove = hasRole('staff')

  return {
    isLoading,
    userRole,
    permissions,
    hasRole,
    hasPermission,
    canAccessResource,
    isAdmin,
    isManagerOrAbove,
    isStaffOrAbove
  }
}

// Hook para verificar autorización en componentes
export function useRequireAuth(requiredRole?: UserRole, requiredPermission?: string) {
  const { user, loading: authLoading } = useAuth()
  const { 
    isLoading: authzLoading, 
    userRole, 
    hasRole, 
    hasPermission,
    isAdmin 
  } = useAuthorization()

  const isLoading = authLoading || authzLoading

  // Verificar si el usuario está autenticado
  if (!isLoading && !user) {
    return {
      authorized: false,
      isLoading,
      error: 'Usuario no autenticado'
    }
  }

  // Verificar rol requerido
  if (!isLoading && requiredRole && !hasRole(requiredRole)) {
    return {
      authorized: false,
      isLoading,
      error: `Rol insuficiente. Se requiere: ${requiredRole}`
    }
  }

  // Verificar permiso requerido
  if (!isLoading && requiredPermission && !hasPermission(requiredPermission)) {
    return {
      authorized: false,
      isLoading,
      error: `Permiso insuficiente. Se requiere: ${requiredPermission}`
    }
  }

  return {
    authorized: true,
    isLoading,
    userRole,
    isAdmin
  }
}

// Componente de protección de rutas
export function useProtectedRoute(requiredRole?: UserRole, requiredPermission?: string) {
  const authResult = useRequireAuth(requiredRole, requiredPermission)

  useEffect(() => {
    if (!authResult.isLoading && !authResult.authorized) {
      // Redirigir a login o mostrar error
      console.error('Acceso denegado:', authResult.error)
      // Aquí podrías redirigir a login o mostrar un modal de error
    }
  }, [authResult])

  return authResult
}

// Utilidades para verificación rápida
export function useIsAdmin() {
  const { hasRole } = useAuthorization()
  return hasRole('admin')
}

export function useIsManagerOrAbove() {
  const { hasRole } = useAuthorization()
  return hasRole('manager')
}

export function useIsStaffOrAbove() {
  const { hasRole } = useAuthorization()
  return hasRole('staff')
}

export function useCanManageUsers() {
  const { hasPermission } = useAuthorization()
  return hasPermission('users.manage')
}

export function useCanManageServices() {
  const { hasPermission } = useAuthorization()
  return hasPermission('services.manage')
}

export function useCanViewAllReservations() {
  const { hasPermission } = useAuthorization()
  return hasPermission('reservations.read.all')
}

export function useCanUpdateReservations() {
  const { hasPermission } = useAuthorization()
  return hasPermission('reservations.update.all')
} 