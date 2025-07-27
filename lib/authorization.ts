import { NextRequest, NextResponse } from "next/server"
import { getSupabaseClient } from "./supabase-optimized"

// Tipos para autorización
export type UserRole = 'client' | 'admin' | 'manager' | 'staff' | 'guide'

export interface Permission {
  name: string
  resource: string
  action: string
  description: string
}

export interface AuthorizationConfig {
  requiredRole?: UserRole
  requiredPermission?: string
  resource?: string
  action?: string
  allowOwnResource?: boolean
  resourceUserIdField?: string
}

// Cliente de Supabase para autorización
const supabase = getSupabaseClient()

// Función para obtener el perfil del usuario desde el token
async function getUserProfile(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return null
    }

    // Obtener el perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return null
    }

    return { user, profile }
  } catch (error) {
    console.error('Error obteniendo perfil de usuario:', error)
    return null
  }
}

// Función para verificar si el usuario tiene un rol específico
async function hasRole(userId: string, requiredRole: UserRole): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return false
    }

    // Jerarquía de roles (de menor a mayor privilegio)
    const roleHierarchy: Record<UserRole, number> = {
      'client': 1,
      'guide': 2,
      'staff': 3,
      'manager': 4,
      'admin': 5
    }

    const userRoleLevel = roleHierarchy[data.role as UserRole] || 0
    const requiredRoleLevel = roleHierarchy[requiredRole]

    return userRoleLevel >= requiredRoleLevel
  } catch (error) {
    console.error('Error verificando rol:', error)
    return false
  }
}

// Función para verificar si el usuario tiene un permiso específico
async function hasPermission(userId: string, permissionName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_permissions')
      .select('permission_name')
      .eq('user_id', userId)
      .eq('permission_name', permissionName)
      .single()

    return !error && !!data
  } catch (error) {
    console.error('Error verificando permiso:', error)
    return false
  }
}

// Función para verificar si el usuario puede acceder a un recurso específico
async function canAccessResource(userId: string, resource: string, action: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_permissions')
      .select('permission_name')
      .eq('user_id', userId)
      .eq('resource', resource)
      .eq('action', action)
      .single()

    return !error && !!data
  } catch (error) {
    console.error('Error verificando acceso a recurso:', error)
    return false
  }
}

// Función para verificar si el usuario puede acceder a sus propios recursos
async function canAccessOwnResource(
  userId: string, 
  resource: string, 
  action: string, 
  resourceUserId: string
): Promise<boolean> {
  // Si es su propio recurso
  if (userId === resourceUserId) {
    return await canAccessResource(userId, resource, `${action}.own`)
  }

  // Si puede acceder a todos los recursos
  return await canAccessResource(userId, resource, action)
}

// Middleware de autorización principal
export function withAuthorization(config: AuthorizationConfig) {
  return function(handler: (req: NextRequest, userData: any) => Promise<NextResponse>) {
    return async function(request: NextRequest): Promise<NextResponse> {
      try {
        // Obtener perfil del usuario
        const userData = await getUserProfile(request)
        
        if (!userData) {
          console.error('Usuario no autenticado')
          return NextResponse.json(
            { error: "No autorizado - Usuario no autenticado" },
            { status: 401 }
          )
        }

        const { user, profile } = userData
        const userId = user.id

        console.log('Verificando autorización para usuario:', {
          userId,
          role: profile.role,
          requiredRole: config.requiredRole,
          requiredPermission: config.requiredPermission,
          resource: config.resource,
          action: config.action
        })

        // Verificar rol requerido
        if (config.requiredRole) {
          const hasRequiredRole = await hasRole(userId, config.requiredRole)
          if (!hasRequiredRole) {
            console.error('Usuario no tiene el rol requerido:', {
              userId,
              userRole: profile.role,
              requiredRole: config.requiredRole
            })
            return NextResponse.json(
              { error: "No autorizado - Rol insuficiente" },
              { status: 403 }
            )
          }
        }

        // Verificar permiso específico
        if (config.requiredPermission) {
          const hasRequiredPermission = await hasPermission(userId, config.requiredPermission)
          if (!hasRequiredPermission) {
            console.error('Usuario no tiene el permiso requerido:', {
              userId,
              userRole: profile.role,
              requiredPermission: config.requiredPermission
            })
            return NextResponse.json(
              { error: "No autorizado - Permiso insuficiente" },
              { status: 403 }
            )
          }
        }

        // Verificar acceso a recurso específico
        if (config.resource && config.action) {
          let canAccess = false

          if (config.allowOwnResource && config.resourceUserIdField) {
            // Obtener el ID del usuario del recurso desde el body o params
            const body = await request.json().catch(() => ({}))
            const resourceUserId = body[config.resourceUserIdField]
            
            if (resourceUserId) {
              canAccess = await canAccessOwnResource(userId, config.resource, config.action, resourceUserId)
            } else {
              canAccess = await canAccessResource(userId, config.resource, config.action)
            }
          } else {
            canAccess = await canAccessResource(userId, config.resource, config.action)
          }

          if (!canAccess) {
            console.error('Usuario no puede acceder al recurso:', {
              userId,
              userRole: profile.role,
              resource: config.resource,
              action: config.action
            })
            return NextResponse.json(
              { error: "No autorizado - Acceso denegado al recurso" },
              { status: 403 }
            )
          }
        }

        console.log('Autorización exitosa para usuario:', userId)

        // Llamar al handler con los datos del usuario
        return await handler(request, userData)
      } catch (error) {
        console.error('Error en autorización:', error)
        return NextResponse.json(
          { error: "Error interno del servidor" },
          { status: 500 }
        )
      }
    }
  }
}

// Funciones de conveniencia para roles específicos
export function requireAdmin() {
  return withAuthorization({ requiredRole: 'admin' })
}

export function requireManager() {
  return withAuthorization({ requiredRole: 'manager' })
}

export function requireStaff() {
  return withAuthorization({ requiredRole: 'staff' })
}

export function requireGuide() {
  return withAuthorization({ requiredRole: 'guide' })
}

// Funciones de conveniencia para permisos específicos
export function requirePermission(permission: string) {
  return withAuthorization({ requiredPermission: permission })
}

export function requireResourceAccess(resource: string, action: string) {
  return withAuthorization({ resource, action })
}

export function requireOwnResourceAccess(resource: string, action: string, userIdField: string) {
  return withAuthorization({ 
    resource, 
    action, 
    allowOwnResource: true, 
    resourceUserIdField: userIdField 
  })
}

// Función para crear respuesta de error de autorización
export function createAuthorizationErrorResponse(message: string = "No autorizado") {
  return NextResponse.json({ error: message }, { status: 403 })
}

// Función para verificar autorización sin middleware (para uso interno)
export async function checkAuthorization(
  request: NextRequest, 
  config: AuthorizationConfig
): Promise<{ authorized: boolean; userData?: any; error?: string }> {
  try {
    const userData = await getUserProfile(request)
    
    if (!userData) {
      return { authorized: false, error: "Usuario no autenticado" }
    }

    const { user, profile } = userData
    const userId = user.id

    // Verificar rol requerido
    if (config.requiredRole) {
      const hasRequiredRole = await hasRole(userId, config.requiredRole)
      if (!hasRequiredRole) {
        return { authorized: false, error: "Rol insuficiente" }
      }
    }

    // Verificar permiso específico
    if (config.requiredPermission) {
      const hasRequiredPermission = await hasPermission(userId, config.requiredPermission)
      if (!hasRequiredPermission) {
        return { authorized: false, error: "Permiso insuficiente" }
      }
    }

    // Verificar acceso a recurso específico
    if (config.resource && config.action) {
      const canAccess = await canAccessResource(userId, config.resource, config.action)
      if (!canAccess) {
        return { authorized: false, error: "Acceso denegado al recurso" }
      }
    }

    return { authorized: true, userData }
  } catch (error) {
    console.error('Error verificando autorización:', error)
    return { authorized: false, error: "Error interno" }
  }
} 