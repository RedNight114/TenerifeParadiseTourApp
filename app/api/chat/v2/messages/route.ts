/**
 * API v2 para mensajes del chat con autenticación y seguridad mejoradas
 */

import { NextRequest, NextResponse } from 'next/server'
import { ChatAuthMiddleware } from '@/lib/middleware/chat-auth-middleware'
import { createChatService } from '@/lib/services/chat-service-factory'
import { SendMessageRequest } from '@/lib/types/chat'

// Configurar la ruta como dinámica para evitar errores de renderizado estático
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return ChatAuthMiddleware.withAuth(request, async (req, context) => {
    try {
      const { searchParams } = new URL(req.url)
      const conversationId = searchParams.get('conversation_id')
      const limit = parseInt(searchParams.get('limit') || '50')
      const offset = parseInt(searchParams.get('offset') || '0')

      if (!conversationId) {
        return NextResponse.json(
          { success: false, error: 'ID de conversación requerido' },
          { status: 400 }
        )
      }

      // Verificar acceso a la conversación
      const accessResult = await ChatAuthMiddleware.verifyConversationAccess(req, conversationId)
      if (!accessResult.success) {
        return NextResponse.json(
          { success: false, error: accessResult.error },
          { status: 403 }
        )
      }

      const chatService = createChatService()
      const response = await chatService.getConversationMessages(conversationId, limit, offset)
      
      if (response.success) {
        return NextResponse.json({
          success: true,
          data: response.data,
          meta: {
            conversation_id: conversationId,
            limit,
            offset,
            total: response.data.length
          }
        })
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

export async function POST(request: NextRequest) {
  return ChatAuthMiddleware.withAuth(request, async (req, context) => {
    try {
      // Verificar rate limiting
      const rateLimit = ChatAuthMiddleware.checkRateLimit(
        context.user.id,
        'send_message',
        30, // Máximo 30 mensajes por minuto
        60000 // 1 minuto
      )

      if (!rateLimit.allowed) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Demasiados mensajes enviados. Intenta de nuevo más tarde.',
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
      
      const sendRequest: SendMessageRequest = {
        conversation_id: sanitizedData.conversation_id,
        content: sanitizedData.content,
        message_type: sanitizedData.message_type || 'text',
        metadata: sanitizedData.metadata || {}
      }

      // Verificar acceso a la conversación
      const accessResult = await ChatAuthMiddleware.verifyConversationAccess(req, sendRequest.conversation_id)
      if (!accessResult.success) {
        return NextResponse.json(
          { success: false, error: accessResult.error },
          { status: 403 }
        )
      }

      const chatService = createChatService()
      const response = await chatService.sendMessage(sendRequest, context.user.id)
      
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
