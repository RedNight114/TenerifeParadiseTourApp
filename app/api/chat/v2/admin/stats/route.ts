/**
 * API v2 para estadísticas del chat (solo administradores)
 */

import { NextRequest, NextResponse } from 'next/server'
import { ChatAuthMiddleware } from '@/lib/middleware/chat-auth-middleware'
import { createChatService } from '@/lib/services/chat-service-factory'

// Configurar la ruta como dinámica para evitar errores de renderizado estático
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return ChatAuthMiddleware.withAdminAuth(request, async (req, context) => {
    try {
      const chatService = createChatService()
      const response = await chatService.getChatStats()
      
      if (response.success) {
        return NextResponse.json({
          success: true,
          data: response.data,
          meta: {
            requested_by: context.user.id,
            requested_at: new Date().toISOString()
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