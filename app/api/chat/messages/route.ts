import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ChatService } from '@/lib/chat-service'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversation_id')
    const limit = parseInt(searchParams.get('limit') || '50')
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

    const messages = await ChatService.getConversationMessages(
      conversationId,
      limit,
      offset
    )

    return NextResponse.json({ messages })
  } catch (error) {
return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { conversation_id, content, message_type, file_url, file_name, file_size } = body

    if (!conversation_id || !content) {
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

    const message = await ChatService.sendMessage({
      conversation_id,
      content,
      message_type,
      file_url,
      file_name,
      file_size
    }, user.id)

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}


