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

// GET - Obtener configuraciones
export async function GET(request: NextRequest) {
  try {
    // Crear cliente de Supabase sin autenticación para pruebas
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Por ahora, asumir que es admin para pruebas
    const isAdmin = true

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const public_only = searchParams.get('public_only') === 'true'

    // Construir consulta
    let query = supabase
      .from('system_settings')
      .select('*')
      .order('category', { ascending: true })
      .order('key', { ascending: true })

    // Si no es admin, solo mostrar configuraciones públicas
    if (!isAdmin || public_only) {
      query = query.eq('is_public', true)
    }

    // Filtrar por categoría si se especifica
    if (category) {
      query = query.eq('category', category)
    }

    const { data: settings, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Error obteniendo configuraciones' }, { status: 500 })
    }

    // Convertir las configuraciones a un objeto más fácil de usar
    const settingsObject = settings?.reduce((acc, setting) => {
      let value = setting.value
      
      // Convertir tipos
      if (setting.type === 'number') {
        value = parseFloat(setting.value || '0')
      } else if (setting.type === 'boolean') {
        value = setting.value === 'true'
      } else if (setting.type === 'json') {
        try {
          value = JSON.parse(setting.value || '{}')
        } catch {
          value = setting.value
        }
      }

      acc[setting.key] = {
        value,
        type: setting.type,
        category: setting.category,
        description: setting.description,
        is_public: setting.is_public
      }
      
      return acc
    }, {} as Record<string, any>) || {}

    return NextResponse.json({ settings: settingsObject })

  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Crear nueva configuración
export async function POST(request: NextRequest) {
  try {
    const supabase = await getAuthenticatedSupabase(request)
    
    // Verificar autenticación y permisos de admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que el usuario es admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'staff') {
      return NextResponse.json({ error: 'Sin permisos para crear configuraciones' }, { status: 403 })
    }

    const body = await request.json()
    const { key, value, type = 'string', category = 'general', description, is_public = false } = body

    // Validar campos requeridos
    if (!key) {
      return NextResponse.json({ error: 'Clave es requerida' }, { status: 400 })
    }

    // Validar tipo
    const validTypes = ['string', 'number', 'boolean', 'json']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Tipo de configuración inválido' }, { status: 400 })
    }

    // Convertir valor a string para almacenar
    let stringValue = value
    if (type === 'json') {
      stringValue = JSON.stringify(value)
    } else {
      stringValue = String(value)
    }

    // Crear configuración
    const { data: setting, error } = await supabase
      .from('system_settings')
      .insert({
        key,
        value: stringValue,
        type,
        category,
        description,
        is_public
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error creando configuración' }, { status: 500 })
    }

    return NextResponse.json({ setting }, { status: 201 })

  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT - Actualizar configuración
export async function PUT(request: NextRequest) {
  try {
    const supabase = await getAuthenticatedSupabase(request)
    
    // Verificar autenticación y permisos de admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que el usuario es admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'staff') {
      return NextResponse.json({ error: 'Sin permisos para actualizar configuraciones' }, { status: 403 })
    }

    const body = await request.json()
    const { key, value, type, category, description, is_public } = body

    if (!key) {
      return NextResponse.json({ error: 'Clave es requerida' }, { status: 400 })
    }

    // Convertir valor a string para almacenar
    let stringValue = value
    if (type === 'json') {
      stringValue = JSON.stringify(value)
    } else {
      stringValue = String(value)
    }

    // Actualizar configuración
    const { data: setting, error } = await supabase
      .from('system_settings')
      .update({
        value: stringValue,
        ...(type && { type }),
        ...(category && { category }),
        ...(description && { description }),
        ...(is_public !== undefined && { is_public })
      })
      .eq('key', key)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error actualizando configuración' }, { status: 500 })
    }

    return NextResponse.json({ setting })

  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar configuración
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getAuthenticatedSupabase(request)
    
    // Verificar autenticación y permisos de admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que el usuario es admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'staff') {
      return NextResponse.json({ error: 'Sin permisos para eliminar configuraciones' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json({ error: 'Clave es requerida' }, { status: 400 })
    }

    // Eliminar configuración
    const { error } = await supabase
      .from('system_settings')
      .delete()
      .eq('key', key)

    if (error) {
      return NextResponse.json({ error: 'Error eliminando configuración' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
