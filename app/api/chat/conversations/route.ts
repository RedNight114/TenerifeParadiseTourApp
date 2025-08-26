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
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    // Validar y convertir valores según el tipo ChatFilters
    const validStatus = status && ['active', 'waiting', 'closed', 'archived'].includes(status) 
      ? status as 'active' | 'waiting' | 'closed' | 'archived' 
      : undefined
    
    const validPriority = priority && ['low', 'normal', 'high', 'urgent'].includes(priority) 
      ? priority as 'low' | 'normal' | 'high' | 'urgent' 
      : undefined

    const filters = {
      status: validStatus,
      priority: validPriority,
      search: search || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined
    }

    // Verificar si es admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    let conversations
    if (profile?.role === 'admin') {
      // Admins pueden ver todas las conversaciones
      conversations = await ChatService.getAllConversations(filters)
    } else {
      // Usuarios solo ven sus propias conversaciones
      conversations = await ChatService.getUserConversations(user.id)
    }

    return NextResponse.json({ conversations })
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
    const { title, priority, initial_message } = body

    if (!title) {
      return NextResponse.json(
        { error: 'El título es requerido' },
        { status: 400 }
      )
    }

    const conversation = await ChatService.createConversationWithRequest({
      title,
      priority,
      initial_message
    }, user.id)

    return NextResponse.json({ conversation }, { status: 201 })
  } catch (error) {
return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}


