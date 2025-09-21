/**
 * Manejador de errores de autenticación para limpiar tokens inválidos
 */

import { logAuth, logError } from './logger'

export interface AuthError {
  message: string
  code?: string
  status?: number
}

/**
 * Verifica si un error es relacionado con tokens inválidos
 */
export function isInvalidTokenError(error: AuthError): boolean {
  const invalidTokenMessages = [
    'Invalid Refresh Token',
    'Refresh Token Not Found',
    'Invalid access token',
    'Access token expired',
    'Token has expired',
    'JWT expired',
    'Invalid JWT'
  ]
  
  return invalidTokenMessages.some(message => 
    error.message.toLowerCase().includes(message.toLowerCase())
  )
}

/**
 * Maneja errores de autenticación limpiando tokens inválidos
 */
export async function handleAuthError(error: AuthError, supabase: any): Promise<void> {
  if (isInvalidTokenError(error)) {
    logAuth('Token inválido detectado, limpiando sesión', { 
      error: error.message,
      code: error.code 
    })
    
    try {
      // Limpiar sesión local
      await supabase.auth.signOut()
      
      // Limpiar localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID + '-auth-token')
        localStorage.removeItem('supabase.auth.token')
      }
      
      logAuth('Sesión limpiada exitosamente')
    } catch (cleanupError) {
      logError('Error limpiando sesión', cleanupError)
    }
  }
}

/**
 * Wrapper para operaciones de autenticación que maneja errores automáticamente
 */
export async function withAuthErrorHandling<T>(
  operation: () => Promise<T>,
  supabase: any,
  fallbackValue: T
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    const authError: AuthError = {
      message: error instanceof Error ? error.message : 'Error desconocido',
      code: (error as any)?.code,
      status: (error as any)?.status
    }
    
    logError('Error en operación de autenticación', authError)
    
    // Manejar error de token inválido
    await handleAuthError(authError, supabase)
    
    return fallbackValue
  }
}
