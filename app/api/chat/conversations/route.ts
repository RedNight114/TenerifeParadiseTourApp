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
      conversations = await ChatServiceRefactored.getInstance().getAllConversations(filters)
    } else {
      // Usuarios solo ven sus propias conversaciones
      conversations = await ChatServiceRefactored.getInstance().getUserConversations(user.id)
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
    const supabase = await getSupabaseClient()
    
    // Verificar autenticación
    const { user, error: authError } = await getAuthenticatedUser(request)
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

    const conversation = await ChatServiceRefactored.getInstance().createConversation({
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


