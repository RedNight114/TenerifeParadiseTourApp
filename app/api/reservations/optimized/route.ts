import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase-unified"
import { 
  createReservationSchema, 
  getReservationsQuerySchema,
  validateData
} from "@/lib/validation-schemas"
import { sanitizeObject } from "@/lib/api-validation"
import { createValidationErrorResponse } from "@/lib/api-validation"
import { unifiedCache } from "@/lib/unified-cache-system"

// Forzar renderizado dinámico para evitar errores de build
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Configuración de paginación
const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

// Función optimizada para obtener el usuario autenticado con caché
async function getAuthenticatedUser(request: NextRequest): Promise<any> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    
    // Intentar obtener del caché primero
    const cacheKey = `auth_user_${token.substring(0, 20)}`
    const cached = await unifiedCache.get(cacheKey)
    if (cached) {
      return cached
    }

    const supabase = await getSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return null
    }

    // Guardar en caché por 5 minutos
    await unifiedCache.set(cacheKey, user, { ttl: 5 * 60 * 1000 })

    return user
  } catch (error) {
    return null
  }
}

// POST - Crear reserva optimizado
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { error: "No autorizado - Usuario no autenticado" },
        { status: 401 }
      )
    }

    // Obtener y validar el body
    const body = await request.json().catch(() => ({}))
    
    const validation = validateData(createReservationSchema, body)

    if (!validation.success) {
      return createValidationErrorResponse(validation.errors)
    }

    const validatedData = validation.data

    // Asegurar que el usuario solo puede crear reservas para sí mismo
    if (validatedData.user_id !== user!.id) {
      return NextResponse.json(
        { error: "No autorizado - Solo puede crear reservas para sí mismo" },
        { status: 403 }
      )
    }

    // Sanitizar los datos antes de procesarlos
    const sanitizedData = sanitizeObject(validatedData)

    // Obtener cliente unificado
    const supabase = await getSupabaseClient()

    // Crear la reserva con transacción optimizada
    const { data, error } = await supabase
      .from("reservations")
      .insert([
        {
          user_id: sanitizedData.user_id,
          service_id: sanitizedData.service_id,
          reservation_date: sanitizedData.reservation_date,
          reservation_time: sanitizedData.reservation_time,
          guests: sanitizedData.guests,
          total_amount: sanitizedData.total_amount,
          status: sanitizedData.status,
          payment_status: sanitizedData.payment_status,
          special_requests: sanitizedData.special_requests,
          contact_name: sanitizedData.contact_name,
          contact_email: sanitizedData.contact_email,
          contact_phone: sanitizedData.contact_phone,
        },
      ])
      .select(`
        id,
        reservation_date,
        reservation_time,
        guests,
        total_amount,
        status,
        payment_status,
        created_at
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: "Error al crear la reserva" }, { status: 500 })
    }
    
    // Invalidar caché de reservas del usuario
    await unifiedCache.invalidateByPattern(new RegExp(`reservations_user_${user.id}_.*`))
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// GET - Obtener reservas optimizado con paginación
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { error: "No autorizado - Usuario no autenticado" },
        { status: 401 }
      )
    }

    // Obtener parámetros de paginación
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || DEFAULT_PAGE_SIZE.toString()), MAX_PAGE_SIZE)
    const status = searchParams.get("status")
    const dateFrom = searchParams.get("date_from")
    const dateTo = searchParams.get("date_to")

    // Si no se especifica userId, usar el del usuario autenticado
    const targetUserId = userId || user.id

    // Obtener cliente unificado
    const supabase = await getSupabaseClient()

    // Verificar si puede ver reservas de otros usuarios (solo admins)
    if (targetUserId !== user.id) {
      // Verificar si es admin con caché
      const adminCacheKey = `admin_check_${user.id}`
      let isAdmin = await unifiedCache.get(adminCacheKey)
      
      if (isAdmin === null) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        isAdmin = profile?.role === 'admin'
        await unifiedCache.set(adminCacheKey, isAdmin, { ttl: 10 * 60 * 1000 }) // 10 minutos
      }

      if (!isAdmin) {
        return NextResponse.json(
          { error: "No autorizado - No puede ver reservas de otros usuarios" },
          { status: 403 }
        )
      }
    }

    if (!targetUserId) {
      return NextResponse.json({ error: "User ID requerido" }, { status: 400 })
    }

    // Generar clave de caché
    const cacheKey = `reservations_user_${targetUserId}_page_${page}_limit_${limit}_status_${status || 'all'}_from_${dateFrom || 'all'}_to_${dateTo || 'all'}`
    
    // Intentar obtener del caché
    const cached = await unifiedCache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    const queryValidation = validateData(getReservationsQuerySchema, { userId: targetUserId })
    
    if (!queryValidation.success) {
      return createValidationErrorResponse(queryValidation.errors)
    }

    const validatedQuery = queryValidation.data

    // Calcular offset para paginación
    const offset = (page - 1) * limit

    // Construir query optimizada con proyección de campos
    let query = supabase
      .from("reservations")
      .select(`
        id,
        reservation_date,
        reservation_time,
        guests,
        total_amount,
        status,
        payment_status,
        special_requests,
        created_at,
        updated_at,
        service:services(
          id,
          title,
          price,
          category:categories(name)
        )
      `, { count: 'exact' })
      .eq("user_id", validatedQuery.userId)

    // Aplicar filtros opcionales
    if (status) {
      query = query.eq("status", status)
    }
    
    if (dateFrom) {
      query = query.gte("reservation_date", dateFrom)
    }
    
    if (dateTo) {
      query = query.lte("reservation_date", dateTo)
    }

    // Aplicar paginación y ordenamiento
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: "Error al obtener las reservas" }, { status: 500 })
    }

    // Calcular metadatos de paginación
    const totalPages = Math.ceil((count || 0) / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    const response = {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      }
    }

    // Guardar en caché por 5 minutos
    await unifiedCache.set(cacheKey, response, { ttl: 5 * 60 * 1000 })
    
    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
