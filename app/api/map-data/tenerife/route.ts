import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeHotels = searchParams.get('hotels') !== 'false'
    const includeServices = searchParams.get('services') !== 'false'

    const data: any = {
      hoteles: [],
      servicios: []
    }

    // Obtener hoteles si están habilitados
    if (includeHotels) {
      const { data: hoteles, error: hotelesError } = await supabase
        .from('hoteles')
        .select('*')
        .eq('visible_en_mapa', true)
        .order('nombre')

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
      }
    }

    // Obtener servicios si están habilitados
    if (includeServices) {
      const { data: servicios, error: serviciosError } = await supabase
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
        `)
        .eq('visible_en_mapa', true)
        .eq('available', true)
        .not('lat', 'is', null)
        .not('lng', 'is', null)
        .order('title')

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
      }
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in map-data API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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

    return NextResponse.json({
      success: true,
      data: data[0],
      message: `${type} actualizado correctamente`
    })

  } catch (error) {
    console.error('Error in map-data POST API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
