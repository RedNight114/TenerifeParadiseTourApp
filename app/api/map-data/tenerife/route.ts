import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { corsHeaders, handleOptions, isOriginAllowed } from '@/app/api/_utils/cors'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const maybePreflight = handleOptions(request)
  if (maybePreflight) return maybePreflight
  try {
    const { searchParams } = new URL(request.url)
    const includeHotels = searchParams.get('hotels') !== 'false'
    const includeServices = searchParams.get('services') !== 'false'
    const legacy = searchParams.get('legacy') === 'true'
    const parsedLimit = Number(searchParams.get('limit'))
    const parsedOffset = Number(searchParams.get('offset'))
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 100) : 50
    const offset = Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0

    const data: any = {
      hoteles: [],
      servicios: []
    }

    // Obtener hoteles si están habilitados
    let totalHoteles: number | null = null
    if (includeHotels) {
      const { data: hoteles, error: hotelesError, count } = await supabase
        .from('hoteles')
        .select('*', { count: 'exact' })
        .eq('visible_en_mapa', true)
        .order('nombre')
        .range(offset, offset + limit - 1)

      if (hotelesError) {
        console.error('Error fetching hoteles:', hotelesError)
      } else {
        // Validar y procesar coordenadas de hoteles
        const processedHotels = (hoteles || []).map(hotel => ({
          ...hotel,
          lat: typeof hotel.lat === 'string' ? parseFloat(hotel.lat) : hotel.lat,
          lng: typeof hotel.lng === 'string' ? parseFloat(hotel.lng) : hotel.lng
        })).filter(hotel => 
          !isNaN(hotel.lat) && !isNaN(hotel.lng) && 
          hotel.lat >= -90 && hotel.lat <= 90 && 
          hotel.lng >= -180 && hotel.lng <= 180
        )
        data.hoteles = processedHotels
        totalHoteles = typeof count === 'number' ? count : (processedHotels?.length || 0)
      }
    }

    // Obtener servicios si están habilitados
    let totalServicios: number | null = null
    if (includeServices) {
      const { data: servicios, error: serviciosError, count } = await supabase
        .from('services')
        .select(`
          id,
          title,
          description,
          price,
          lat,
          lng,
          visible_en_mapa,
          location,
          images,
          category_id,
          subcategory_id,
          available,
          featured,
          categories(name)
        `, { count: 'exact' })
        .eq('visible_en_mapa', true)
        .eq('available', true)
        .not('lat', 'is', null)
        .not('lng', 'is', null)
        .order('title')
        .range(offset, offset + limit - 1)

      if (serviciosError) {
        console.error('Error fetching servicios:', serviciosError)
      } else {
        // Procesar servicios para incluir la categoría y validar coordenadas
        const processedServices = (servicios || []).map(service => ({
          ...service,
          category: service.categories?.name || 'General',
          lat: typeof service.lat === 'string' ? parseFloat(service.lat) : service.lat,
          lng: typeof service.lng === 'string' ? parseFloat(service.lng) : service.lng
        })).filter(service => 
          !isNaN(service.lat) && !isNaN(service.lng) && 
          service.lat >= -90 && service.lat <= 90 && 
          service.lng >= -180 && service.lng <= 180
        )
        data.servicios = processedServices
        totalServicios = typeof count === 'number' ? count : (processedServices?.length || 0)
      }
    }

    if (legacy) {
    const origin = request.headers.get('origin')
    const res = NextResponse.json({
        success: true,
        data,
        timestamp: new Date().toISOString()
    })
    const headers = corsHeaders(origin)
    for (const [k, v] of Object.entries(headers)) res.headers.set(k, v)
    return res
    }

    return NextResponse.json({
      items: data,
      page: {
        limit,
        offset,
        total: {
          hoteles: totalHoteles ?? (Array.isArray(data.hoteles) ? data.hoteles.length : 0),
          servicios: totalServicios ?? (Array.isArray(data.servicios) ? data.servicios.length : 0)
        }
      },
      success: true,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in map-data API:', error)
    const res = NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
    const headers = corsHeaders(request.headers.get('origin'))
    for (const [k, v] of Object.entries(headers)) res.headers.set(k, v)
    return res
  }
}

export async function POST(request: NextRequest) {
  const maybePreflight = handleOptions(request)
  if (maybePreflight) return maybePreflight
  try {
    const origin = request.headers.get('origin')
    if (!isOriginAllowed(origin)) {
      const res = NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 })
      const headers = corsHeaders(origin)
      for (const [k, v] of Object.entries(headers)) res.headers.set(k, v)
      return res
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const res = NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
      const headers = corsHeaders(origin)
      for (const [k, v] of Object.entries(headers)) res.headers.set(k, v)
      return res
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    if (!profile || profile.role !== 'admin') {
      const res = NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
      const headers = corsHeaders(origin)
      for (const [k, v] of Object.entries(headers)) res.headers.set(k, v)
      return res
    }
    const body = await request.json()
    const { type, id, lat, lng, visible_en_mapa } = body

    if (!type || !id) {
      return NextResponse.json(
        { success: false, error: 'Tipo e ID son requeridos' },
        { status: 400 }
      )
    }

    let tableName = ''
    if (type === 'hotel') {
      tableName = 'hoteles'
    } else if (type === 'service') {
      tableName = 'services'
    } else {
      return NextResponse.json(
        { success: false, error: 'Tipo inválido' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (lat !== undefined) updateData.lat = lat
    if (lng !== undefined) updateData.lng = lng
    if (visible_en_mapa !== undefined) updateData.visible_en_mapa = visible_en_mapa

    const { data, error } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error(`Error updating ${type}:`, error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    const successRes = NextResponse.json({
      success: true,
      data: data[0],
      message: `${type} actualizado correctamente`
    })
    const headers = corsHeaders(origin)
    for (const [k, v] of Object.entries(headers)) successRes.headers.set(k, v)
    return successRes

  } catch (error) {
    console.error('Error in map-data POST API:', error)
    const res = NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
    const headers = corsHeaders(request.headers.get('origin'))
    for (const [k, v] of Object.entries(headers)) res.headers.set(k, v)
    return res
  }
}
