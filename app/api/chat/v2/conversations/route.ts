/**
 * API v2 para conversaciones del chat con autenticación y seguridad mejoradas
 */

import { NextRequest, NextResponse } from 'next/server'
import { ChatAuthMiddleware } from '@/lib/middleware/chat-auth-middleware'
import { createChatService } from '@/lib/services/chat-service-factory'
import { CreateConversationRequest, ChatFilters } from '@/lib/types/chat'

// Configurar la ruta como dinámica para evitar errores de renderizado estático
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return ChatAuthMiddleware.withAuth(request, async (req, context) => {
    try {
      const { searchParams } = new URL(req.url)
      const statusParam = searchParams.get('status')
      const priorityParam = searchParams.get('priority')
      const categoryParam = searchParams.get('category')
      
      const filters: ChatFilters = {
        status: statusParam && ['active', 'waiting', 'closed', 'archived'].includes(statusParam) 
          ? statusParam as 'active' | 'waiting' | 'closed' | 'archived' 
          : undefined,
        priority: priorityParam && ['low', 'normal', 'high', 'urgent'].includes(priorityParam)
          ? priorityParam as 'low' | 'normal' | 'high' | 'urgent'
          : undefined,
        category_id: categoryParam || undefined
      }

      const chatService = createChatService()
      
      // Si es admin, puede ver todas las conversaciones
      if (context.isAdmin) {
        const response = await chatService.getAllConversations(filters)
        
        if (response.success) {
          return NextResponse.json({
            success: true,
            data: response.data,
            meta: {
              total: response.data.length,
              filters
            }
          })
        } else {
          return NextResponse.json(
            { success: false, error: response.error },
            { status: 500 }
          )
        }
      } else {
        // Usuario normal solo ve sus conversaciones
        const response = await chatService.getUserConversations(context.user.id)
        
        if (response.success) {
          return NextResponse.json({
            success: true,
            data: response.data,
            meta: {
              total: response.data.length,
              user_id: context.user.id
            }
          })
        } else {
          return NextResponse.json(
            { success: false, error: response.error },
            { status: 500 }
          )
        }
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Error interno del servidor' },
        { status: 500 }
      )
    }
  })
}

export async function POST(request: NextRequest) {
  return ChatAuthMiddleware.withAuth(request, async (req, context) => {
    try {
      // Verificar rate limiting
      const rateLimit = ChatAuthMiddleware.checkRateLimit(
        context.user.id,
        'create_conversation',
        5, // Máximo 5 conversaciones por minuto
        60000 // 1 minuto
      )

      if (!rateLimit.allowed) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Demasiadas conversaciones creadas. Intenta de nuevo más tarde.',
            rateLimit: {
              remaining: rateLimit.remaining,
              resetTime: rateLimit.resetTime
            }
          },
          { status: 429 }
        )
      }

      const body = await req.json()
      
      // Validar entrada
      const validation = ChatAuthMiddleware.validateChatInput(body)
      if (!validation.isValid) {
        return NextResponse.json(
          { success: false, error: 'Datos inválidos', details: validation.errors },
          { status: 400 }
        )
      }

      // Sanitizar entrada
      const sanitizedData = ChatAuthMiddleware.sanitizeChatInput(body)
      
      const createRequest: CreateConversationRequest = {
        title: sanitizedData.title || 'Nueva consulta',
        description: sanitizedData.description || sanitizedData.initial_message || 'Nueva consulta iniciada',
        priority: sanitizedData.priority || 'normal',
        category_id: sanitizedData.category_id,
        tags: sanitizedData.tags,
        initial_message: sanitizedData.initial_message
      }

      const chatService = createChatService()
      const response = await chatService.createConversation(createRequest, context.user.id)
      
      if (response.success) {
        return NextResponse.json({
          success: true,
          data: response.data,
          rateLimit: {
            remaining: rateLimit.remaining,
            resetTime: rateLimit.resetTime
          }
        }, { status: 201 })
      } else {
        return NextResponse.json(
          { success: false, error: response.error },
          { status: 500 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Error interno del servidor' },
        { status: 500 }
      )
    }
  })
}
