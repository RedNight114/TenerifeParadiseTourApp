import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-unified'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseClient()
    
    // Obtener el usuario autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const reservationId = params.id

    // Verificar que la reserva pertenece al usuario
    const { data: reservation, error: fetchError } = await supabase
      .from('reservations')
      .select('id, user_id, status')
      .eq('id', reservationId)
      .single()

    if (fetchError || !reservation) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
    }

    if (reservation.user_id !== user.id) {
      return NextResponse.json({ error: 'No tienes permisos para cancelar esta reserva' }, { status: 403 })
    }

    // Solo permitir cancelar reservas confirmadas o pendientes
    if (reservation.status !== 'confirmed' && reservation.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Solo se pueden cancelar reservas confirmadas o pendientes' 
      }, { status: 400 })
    }

    // Actualizar el estado de la reserva a cancelada
    const { error: updateError } = await supabase
      .from('reservations')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', reservationId)

    if (updateError) {
      console.error('Error cancelling reservation:', updateError)
      return NextResponse.json({ error: 'Error al cancelar la reserva' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Reserva cancelada exitosamente',
      reservation_id: reservationId
    })

  } catch (error) {
    console.error('Error in cancel reservation API:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
