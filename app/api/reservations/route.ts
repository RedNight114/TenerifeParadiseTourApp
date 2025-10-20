import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Forzar que esta ruta sea dinámica
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Crear cliente Supabase específico para esta API
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Obtener cookies de la request
    const accessToken = request.cookies.get('sb-access-token')?.value
    const refreshToken = request.cookies.get('sb-refresh-token')?.value
    
    console.log('Cookies found:', { 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken,
      accessTokenLength: accessToken?.length || 0
    })
    
    if (!accessToken) {
      console.error('No access token found in cookies')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Establecer la sesión manualmente
    const { data: { user }, error: authError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || ''
    })
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log('User authenticated:', user.email)

    // Obtener las reservas del usuario con información del servicio
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select(`
        id,
        service_id,
        reservation_date,
        reservation_time,
        guests,
        total_amount,
        status,
        created_at,
        services (
          title,
          images,
          location,
          duration
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reservations:', error)
      return NextResponse.json({ error: 'Error al obtener las reservas' }, { status: 500 })
    }

    console.log('Reservations found:', reservations?.length || 0)

    // Transformar los datos para que coincidan con la interfaz
    const formattedReservations = reservations?.map(reservation => ({
      id: reservation.id,
      service_id: reservation.service_id,
      service_name: reservation.services?.title || 'Servicio no disponible',
      service_image: reservation.services?.images?.[0] || '',
      date: reservation.reservation_date,
      time: reservation.reservation_time,
      participants: reservation.guests,
      total_price: reservation.total_amount ?? reservation.total_price,
      status: reservation.status,
      created_at: reservation.created_at,
      location: reservation.services?.location || 'Ubicación no disponible',
      duration: reservation.services?.duration ? `${reservation.services.duration} horas` : 'Duración no disponible'
    })) || []

    return NextResponse.json({ 
      reservations: formattedReservations 
    })

  } catch (error) {
    console.error('Error in reservations API:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}