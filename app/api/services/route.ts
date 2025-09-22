import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Importar dinámicamente para evitar problemas de SSR
    const { getSupabaseClient } = await import("@/lib/supabase-unified")
    const supabase = await getSupabaseClient()
    
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ services: data || [] })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { getSupabaseClient } = await import("@/lib/supabase-unified")
    const supabase = await getSupabaseClient()
    
    // Usar la función create_service_simple que valida los datos
    const { data, error } = await supabase.rpc('create_service_simple', {
      service_data: body
    })

    if (error) {
      console.error('Error creando servicio:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data?.success) {
      return NextResponse.json({ error: data?.error || 'Error creando servicio' }, { status: 400 })
    }

    // Obtener el servicio creado para devolverlo
    const { data: service, error: fetchError } = await supabase
      .from('services')
      .select('*')
      .eq('id', data.service_id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    return NextResponse.json({ service, message: data.message })
  } catch (error) {
    console.error('Error interno:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}








