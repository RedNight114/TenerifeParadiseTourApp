import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    const { getSupabaseClient } = await import("@/lib/supabase-unified")
    const supabase = await getSupabaseClient()
    
    // Usar la función update_service_simple que valida los datos
    const { data, error } = await supabase.rpc('update_service_simple', {
      service_id: id,
      service_data: body
    })

    if (error) {
      console.error('Error actualizando servicio:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data?.success) {
      return NextResponse.json({ error: data?.error || 'Error actualizando servicio' }, { status: 400 })
    }

    // Obtener el servicio actualizado para devolverlo
    const { data: service, error: fetchError } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const { getSupabaseClient } = await import("@/lib/supabase-unified")
    const supabase = await getSupabaseClient()
    
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}








