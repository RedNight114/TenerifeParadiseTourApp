import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-unified'
import { createClient } from '@supabase/supabase-js'
import { chatService } from '@/lib/services/chat-service-unified'

// Helper para obtener usuario autenticado desde cookies
async function getAuthenticatedUser(request) {
  try {
    const token = request.cookies.get('sb-access-token')?.value
    if (!token) {
      return { user: null, error: 'No hay token de acceso' }
    }

    const supabase = await getSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return { user: null, error: 'Token inválido' }
    }

    return { user, error: null }
  } catch (error) {
    return { user: null, error: 'Error de autenticación' }
  }
}


// Función optimizada para obtener mensajes
async function getMessages(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient()
    
    // Verificar autenticación
    const { user, error: authError } = await getAuthenticatedUser(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversation_id')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100) // Máximo 100 mensajes
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'ID de conversación requerido' },
        { status: 400 }
      )
    }

    // Verificar que el usuario tenga acceso a esta conversación
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (!participant) {
      return NextResponse.json(
        { error: 'Acceso denegado a esta conversación' },
        { status: 403 }
      )
    }

    const response = await chatService.getConversationMessages(
      conversationId,
      limit,
      offset
    )

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Error interno del servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      messages: response.data,
      total: response.data?.length || 0,
      limit,
      offset,
      hasMore: (response.data?.length || 0) === limit
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función optimizada para enviar mensaje
async function sendMessage(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient()
    
    // Verificar autenticación
    const { user, error: authError } = await getAuthenticatedUser(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      conversation_id, 
      content, 
      message_type = 'text',
      file_url,
      file_name,
      file_size,
      file_type,
      reply_to_id,
      metadata
    } = body

    if (!conversation_id || !content?.trim()) {
      return NextResponse.json(
        { error: 'ID de conversación y contenido son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el usuario tenga acceso a esta conversación
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversation_id)
      .eq('user_id', user.id)
      .single()

    if (!participant) {
      return NextResponse.json(
        { error: 'Acceso denegado a esta conversación' },
        { status: 403 }
      )
    }

    const response = await chatService.sendMessage({
      conversation_id,
      content: content.trim(),
      message_type,
      file_url,
      file_name,
      file_size,
      file_type,
      reply_to_id,
      metadata
    }, user.id)

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Error interno del servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: response.data,
      success: true
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Exportar funciones directamente
export { getMessages as GET, sendMessage as POST }
