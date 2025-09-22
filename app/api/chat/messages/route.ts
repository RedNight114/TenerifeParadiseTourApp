import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-unified'
import { createClient } from '@supabase/supabase-js'

// Forzar que esta ruta sea dinámica
export const dynamic = 'force-dynamic'
import { ChatServiceRefactored } from '@/lib/services/chat-service-refactored'

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


export async function GET(request: NextRequest) {
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

    const messages = await ChatServiceRefactored.getInstance().getConversationMessages(
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
    const supabase = await getSupabaseClient()
    
    // Verificar autenticación
    const { user, error: authError } = await getAuthenticatedUser(request)
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

    const message = await ChatServiceRefactored.getInstance().sendMessage({
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


