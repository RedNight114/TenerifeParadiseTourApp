import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-unified'
import { calculateTotalAmountFromParticipants } from '@/lib/reservations/calc-total'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      serviceId, 
      userId, 
      reservationDate, 
      participants, 
      totalPrice,
      specialRequests 
    } = body

    // Validar datos requeridos
    if (!serviceId || !userId || !reservationDate || !participants || participants.length === 0) {
      return NextResponse.json(
        { error: 'Datos incompletos para la reserva' },
        { status: 400 }
      )
    }

    // Obtener cliente unificado
    const supabase = await getSupabaseClient()

    // Verificar que el servicio existe y está disponible
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, name, available, price')
      .eq('id', serviceId)
      .eq('available', true)
      .single()

    if (serviceError || !service) {
      return NextResponse.json(
        { error: 'Servicio no disponible o no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el usuario existe
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Calcular y validar total
    const serverCalculatedTotal = calculateTotalAmountFromParticipants(participants || [])
    const finalTotal = Number.isFinite(totalPrice) && Math.abs(Number(totalPrice) - serverCalculatedTotal) < 0.01
      ? Number(totalPrice)
      : serverCalculatedTotal

    // Crear la reserva principal
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert({
        user_id: userId,
        service_id: serviceId,
        reservation_date: reservationDate,
        status: 'pending',
        total_amount: finalTotal,
        total_price: finalTotal,
        special_requests: specialRequests || null,
        adult_count: participants.filter((p: any) => p.participant_type === 'adult').length,
        child_count: participants.filter((p: any) => p.participant_type === 'child').length,
        senior_count: participants.filter((p: any) => p.participant_type === 'senior').length,
        baby_count: participants.filter((p: any) => p.participant_type === 'baby').length
      })
      .select()
      .single()

    if (reservationError) {
      return NextResponse.json(
        { error: 'Error al crear la reserva' },
        { status: 500 }
      )
    }

    // Crear participantes individuales
    const participantData = participants.map((participant: any) => ({
      reservation_id: reservation.id,
      participant_type: participant.participant_type,
      age: participant.age,
      price: participant.price,
      age_range: participant.age_range
    }))

    const { error: participantsError } = await supabase
      .from('reservation_participants')
      .insert(participantData)

    if (participantsError) {
      // Intentar eliminar la reserva si falla la creación de participantes
      await supabase
        .from('reservations')
        .delete()
        .eq('id', reservation.id)
      
      return NextResponse.json(
        { error: 'Error al crear los participantes de la reserva' },
        { status: 500 }
      )
    }

    // Obtener la reserva completa con participantes (preferencia por total_amount)
    const { data: completeReservation, error: fetchError } = await supabase
      .from('reservations')
      .select(`
        *,
        service:services(name, description, price),
        participants:reservation_participants(*)
      `)
      .eq('id', reservation.id)
      .single()

    if (fetchError) {
      // Continuar sin la reserva completa
    }

    // Enviar email de confirmación (opcional)
    // await sendReservationConfirmationEmail(user.email, completeReservation)

    return NextResponse.json({
      success: true,
      message: 'Reserva creada exitosamente',
      reservation: completeReservation || reservation,
      reservationId: reservation.id
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reservationId = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (!reservationId && !userId) {
      return NextResponse.json(
        { error: 'Se requiere ID de reserva o ID de usuario' },
        { status: 400 }
      )
    }

    // Obtener cliente unificado
    const supabase = await getSupabaseClient()

    let query = supabase
      .from('reservations')
      .select(`
        *,
        service:services(id, name, description, price, image_url),
        participants:reservation_participants(*)
      `)

    if (reservationId) {
      query = query.eq('id', reservationId)
    } else if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: reservations, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Error al obtener las reservas' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      reservations: reservations || []
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { reservationId, participants, totalPrice, specialRequests } = body

    if (!reservationId) {
      return NextResponse.json(
        { error: 'ID de reserva requerido' },
        { status: 400 }
      )
    }

    // Obtener cliente unificado
    const supabase = await getSupabaseClient()

    // Verificar que la reserva existe
    const { data: existingReservation, error: fetchError } = await supabase
      .from('reservations')
      .select('id, status')
      .eq('id', reservationId)
      .single()

    if (fetchError || !existingReservation) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    // Solo permitir modificar reservas pendientes
    if (existingReservation.status !== 'pending') {
      return NextResponse.json(
        { error: 'No se puede modificar una reserva confirmada o cancelada' },
        { status: 400 }
      )
    }

    // Calcular y validar total
    const serverCalculatedTotal = calculateTotalAmountFromParticipants(participants || [])
    const finalTotal = Number.isFinite(totalPrice) && Math.abs(Number(totalPrice) - serverCalculatedTotal) < 0.01
      ? Number(totalPrice)
      : serverCalculatedTotal

    // Actualizar la reserva principal
    const { error: updateError } = await supabase
      .from('reservations')
      .update({
        total_amount: finalTotal,
        total_price: finalTotal,
        special_requests: specialRequests,
        adult_count: participants.filter((p: any) => p.participant_type === 'adult').length,
        child_count: participants.filter((p: any) => p.participant_type === 'child').length,
        senior_count: participants.filter((p: any) => p.participant_type === 'senior').length,
        baby_count: participants.filter((p: any) => p.participant_type === 'baby').length,
        updated_at: new Date().toISOString()
      })
      .eq('id', reservationId)

    if (updateError) {
      return NextResponse.json(
        { error: 'Error al actualizar la reserva' },
        { status: 500 }
      )
    }

    // Eliminar participantes existentes
    const { error: deleteError } = await supabase
      .from('reservation_participants')
      .delete()
      .eq('reservation_id', reservationId)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Error al actualizar los participantes' },
        { status: 500 }
      )
    }

    // Crear nuevos participantes
    if (participants && participants.length > 0) {
      const participantData = participants.map((participant: any) => ({
        reservation_id: reservationId,
        participant_type: participant.participant_type,
        age: participant.age,
        price: participant.price,
        age_range: participant.age_range
      }))

      const { error: participantsError } = await supabase
        .from('reservation_participants')
        .insert(participantData)

      if (participantsError) {
        return NextResponse.json(
          { error: 'Error al actualizar los participantes' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Reserva actualizada exitosamente',
      reservationId
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reservationId = searchParams.get('id')

    if (!reservationId) {
      return NextResponse.json(
        { error: 'ID de reserva requerido' },
        { status: 400 }
      )
    }

    // Obtener cliente unificado
    const supabase = await getSupabaseClient()

    // Verificar que la reserva existe
    const { data: existingReservation, error: fetchError } = await supabase
      .from('reservations')
      .select('id, status')
      .eq('id', reservationId)
      .single()

    if (fetchError || !existingReservation) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    // Solo permitir cancelar reservas pendientes
    if (existingReservation.status !== 'pending') {
      return NextResponse.json(
        { error: 'No se puede cancelar una reserva confirmada' },
        { status: 400 }
      )
    }

    // Eliminar la reserva (los participantes se eliminan automáticamente por CASCADE)
    const { error: deleteError } = await supabase
      .from('reservations')
      .delete()
      .eq('id', reservationId)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Error al cancelar la reserva' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Reserva cancelada exitosamente'
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}


