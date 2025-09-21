import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Función helper para obtener el cliente de Supabase con autenticación
async function getAuthenticatedSupabase(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Obtener el token de autorización del header
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '')
    try {
      await supabase.auth.setSession({ access_token: token, refresh_token: '' })
    } catch (error) {
      throw new Error('Token inválido')
    }
  } else {
    throw new Error('Token de autorización requerido')
  }
  
  return supabase
}

// GET - Obtener notificaciones del usuario
export async function GET(request: NextRequest) {
  try {
    // Crear cliente de Supabase sin autenticación para pruebas
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const unreadOnly = searchParams.get('unread_only') === 'true'

    // Construir consulta - por ahora obtener todas las notificaciones
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filtrar solo no leídas si se solicita
    if (unreadOnly) {
      query = query.eq('read', false)
    }

    const { data: notifications, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Error obteniendo notificaciones' }, { status: 500 })
    }

    // Obtener contador de no leídas
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false)

    return NextResponse.json({
      notifications,
      unreadCount: unreadCount || 0,
      total: notifications?.length || 0
    })

  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Crear nueva notificación
export async function POST(request: NextRequest) {
  try {
    const supabase = await getAuthenticatedSupabase(request)
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { title, message, type = 'info', data = {}, user_id } = body

    // Validar campos requeridos
    if (!title || !message) {
      return NextResponse.json({ error: 'Título y mensaje son requeridos' }, { status: 400 })
    }

    // Validar tipo
    const validTypes = ['info', 'success', 'warning', 'error', 'reservation', 'payment', 'chat', 'system']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Tipo de notificación inválido' }, { status: 400 })
    }

    // Determinar el usuario destinatario - por ahora usar un ID fijo para pruebas
    const targetUserId = user_id || 'e6c33f40-1078-4e7d-9776-8d940b539eb0' // ID del admin

    // Crear notificación
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: targetUserId,
        title,
        message,
        type,
        data,
        read: false
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error creando notificación' }, { status: 500 })
    }

    return NextResponse.json({ notification }, { status: 201 })

  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT - Marcar notificación como leída
export async function PUT(request: NextRequest) {
  try {
    const supabase = await getAuthenticatedSupabase(request)
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { notification_id, mark_all = false } = body

    if (mark_all) {
      // Marcar todas como leídas
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false)

      if (error) {
        return NextResponse.json({ error: 'Error actualizando notificaciones' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    } else if (notification_id) {
      // Marcar una específica como leída
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification_id)

      if (error) {
        return NextResponse.json({ error: 'Error actualizando notificación' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'ID de notificación requerido' }, { status: 400 })
    }

  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar notificación
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getAuthenticatedSupabase(request)
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const notification_id = searchParams.get('id')

    if (!notification_id) {
      return NextResponse.json({ error: 'ID de notificación requerido' }, { status: 400 })
    }

    // Eliminar notificación
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notification_id)

    if (error) {
      return NextResponse.json({ error: 'Error eliminando notificación' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
