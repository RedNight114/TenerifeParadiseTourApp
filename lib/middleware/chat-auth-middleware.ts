/**
 * Middleware de autenticación para el sistema de chat
 * Verifica que solo usuarios autenticados puedan acceder al chat
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export interface ChatAuthContext {
  user: {
    id: string
    email: string
    role?: string
  }
  isAuthenticated: boolean
  isAdmin: boolean
}

export class ChatAuthMiddleware {
  /**
   * Verificar autenticación del usuario
   */
  static async verifyAuth(request: NextRequest): Promise<{
    success: boolean
    user?: ChatAuthContext['user']
    error?: string
  }> {
    try {
      const supabase = createRouteHandlerClient({ cookies })
      
      // Verificar sesión del usuario
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        }
      }

      // Obtener información del perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single()

      if (profileError) {
        }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email || '',
          role: profile?.role || 'user'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error interno del servidor'
      }
    }
  }

  /**
   * Verificar si el usuario es administrador
   */
  static async verifyAdmin(request: NextRequest): Promise<{
    success: boolean
    user?: ChatAuthContext['user']
    error?: string
  }> {
    const authResult = await this.verifyAuth(request)
    
    if (!authResult.success) {
      return authResult
    }

    if (authResult.user?.role !== 'admin') {
      return {
        success: false,
        error: 'Acceso denegado: se requieren permisos de administrador'
      }
    }

    return authResult
  }

  /**
   * Verificar acceso a una conversación específica
   */
  static async verifyConversationAccess(
    request: NextRequest,
    conversationId: string
  ): Promise<{
    success: boolean
    user?: ChatAuthContext['user']
    error?: string
  }> {
    const authResult = await this.verifyAuth(request)
    
    if (!authResult.success) {
      return authResult
    }

    try {
      const supabase = createRouteHandlerClient({ cookies })
      
      // Verificar si el usuario tiene acceso a la conversación
      const { data: participant, error } = await supabase
        .from('conversation_participants')
        .select('user_id, role')
        .eq('conversation_id', conversationId)
        .eq('user_id', authResult.user!.id)
        .single()

      if (error || !participant) {
        // Si no es participante, verificar si es admin
        if (authResult.user!.role === 'admin') {
          return authResult
        }
        
        return {
          success: false,
          error: 'Acceso denegado a esta conversación'
        }
      }

      return authResult
    } catch (error) {
      return {
        success: false,
        error: 'Error interno del servidor'
      }
    }
  }

  /**
   * Middleware para rutas de chat que requieren autenticación
   */
  static async withAuth(
    request: NextRequest,
    handler: (request: NextRequest, context: ChatAuthContext) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const authResult = await this.verifyAuth(request)
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      )
    }

    const context: ChatAuthContext = {
      user: authResult.user!,
      isAuthenticated: true,
      isAdmin: authResult.user!.role === 'admin'
    }

    return handler(request, context)
  }

  /**
   * Middleware para rutas de administración
   */
  static async withAdminAuth(
    request: NextRequest,
    handler: (request: NextRequest, context: ChatAuthContext) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const authResult = await this.verifyAdmin(request)
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 403 }
      )
    }

    const context: ChatAuthContext = {
      user: authResult.user!,
      isAuthenticated: true,
      isAdmin: true
    }

    return handler(request, context)
  }

  /**
   * Middleware para verificar acceso a conversación específica
   */
  static async withConversationAccess(
    request: NextRequest,
    conversationId: string,
    handler: (request: NextRequest, context: ChatAuthContext) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const authResult = await this.verifyConversationAccess(request, conversationId)
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 403 }
      )
    }

    const context: ChatAuthContext = {
      user: authResult.user!,
      isAuthenticated: true,
      isAdmin: authResult.user!.role === 'admin'
    }

    return handler(request, context)
  }

  /**
   * Validar entrada de datos del chat
   */
  static validateChatInput(data: any): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Validar contenido de mensaje
    if (data.content !== undefined) {
      if (typeof data.content !== 'string') {
        errors.push('El contenido del mensaje debe ser una cadena de texto')
      } else if (data.content.trim().length === 0) {
        errors.push('El contenido del mensaje no puede estar vacío')
      } else if (data.content.length > 4000) {
        errors.push('El contenido del mensaje no puede exceder 4000 caracteres')
      }
    }

    // Validar ID de conversación
    if (data.conversation_id !== undefined) {
      if (typeof data.conversation_id !== 'string') {
        errors.push('El ID de conversación debe ser una cadena de texto')
      } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.conversation_id)) {
        errors.push('El ID de conversación debe ser un UUID válido')
      }
    }

    // Validar tipo de mensaje
    if (data.message_type !== undefined) {
      const validTypes = ['text', 'image', 'file', 'system', 'notification']
      if (!validTypes.includes(data.message_type)) {
        errors.push(`El tipo de mensaje debe ser uno de: ${validTypes.join(', ')}`)
      }
    }

    // Validar prioridad
    if (data.priority !== undefined) {
      const validPriorities = ['low', 'normal', 'high', 'urgent']
      if (!validPriorities.includes(data.priority)) {
        errors.push(`La prioridad debe ser una de: ${validPriorities.join(', ')}`)
      }
    }

    // Validar estado
    if (data.status !== undefined) {
      const validStatuses = ['active', 'waiting', 'closed', 'archived']
      if (!validStatuses.includes(data.status)) {
        errors.push(`El estado debe ser uno de: ${validStatuses.join(', ')}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Sanitizar entrada de datos
   */
  static sanitizeChatInput(data: any): any {
    const sanitized = { ...data }

    // Sanitizar contenido de mensaje
    if (sanitized.content) {
      sanitized.content = sanitized.content.trim()
      // Remover caracteres potencialmente peligrosos
      sanitized.content = sanitized.content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    }

    // Sanitizar título
    if (sanitized.title) {
      sanitized.title = sanitized.title.trim()
    }

    // Sanitizar descripción
    if (sanitized.description) {
      sanitized.description = sanitized.description.trim()
    }

    return sanitized
  }

  /**
   * Rate limiting básico
   */
  private static rateLimitMap = new Map<string, { count: number; resetTime: number }>()

  static checkRateLimit(
    userId: string,
    action: 'send_message' | 'create_conversation',
    limit: number = 10,
    windowMs: number = 60000 // 1 minuto
  ): {
    allowed: boolean
    remaining: number
    resetTime: number
  } {
    const key = `${userId}:${action}`
    const now = Date.now()
    const userLimit = this.rateLimitMap.get(key)

    if (!userLimit || now > userLimit.resetTime) {
      // Reset o primera vez
      this.rateLimitMap.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: now + windowMs
      }
    }

    if (userLimit.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: userLimit.resetTime
      }
    }

    userLimit.count++
    return {
      allowed: true,
      remaining: limit - userLimit.count,
      resetTime: userLimit.resetTime
    }
  }
}
