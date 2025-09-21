import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase-unified"
import { unifiedCache } from "@/lib/unified-cache-system"

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Configuración de paginación
const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

// GET - Obtener servicios optimizado con caché inteligente
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parámetros de consulta
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || DEFAULT_PAGE_SIZE.toString()), MAX_PAGE_SIZE)
    const categoryId = searchParams.get("category_id")
    const subcategoryId = searchParams.get("subcategory_id")
    const featured = searchParams.get("featured")
    const search = searchParams.get("search")
    const priceMin = searchParams.get("price_min")
    const priceMax = searchParams.get("price_max")
    const sortBy = searchParams.get("sort_by") || "created_at"
    const sortOrder = searchParams.get("sort_order") || "desc"

    // Generar clave de caché única
    const cacheKey = `services_page_${page}_limit_${limit}_cat_${categoryId || 'all'}_subcat_${subcategoryId || 'all'}_featured_${featured || 'all'}_search_${search || 'none'}_price_${priceMin || 'min'}_${priceMax || 'max'}_sort_${sortBy}_${sortOrder}`
    
    // Intentar obtener del caché
    const cached = await unifiedCache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    const supabase = await getSupabaseClient()

    // Calcular offset para paginación
    const offset = (page - 1) * limit

    // Construir query optimizada con proyección de campos específicos
    let query = supabase
      .from("services")
      .select(`
        id,
        title,
        description,
        price,
        duration,
        max_participants,
        featured,
        available,
        image_url,
        created_at,
        updated_at,
        category:categories(
          id,
          name,
          description
        ),
        subcategory:subcategories(
          id,
          name,
          description
        )
      `, { count: 'exact' })
      .eq("available", true) // Solo servicios disponibles

    // Aplicar filtros
    if (categoryId) {
      query = query.eq("category_id", categoryId)
    }

    if (subcategoryId) {
      query = query.eq("subcategory_id", subcategoryId)
    }

    if (featured === "true") {
      query = query.eq("featured", true)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (priceMin) {
      query = query.gte("price", parseFloat(priceMin))
    }

    if (priceMax) {
      query = query.lte("price", parseFloat(priceMax))
    }

    // Aplicar ordenamiento
    const ascending = sortOrder === "asc"
    query = query.order(sortBy, { ascending })

    // Aplicar paginación
    const { data, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: "Error al obtener los servicios" }, { status: 500 })
    }

    // Procesar datos para optimizar payload
    const processedServices = (data || []).map((service: any) => ({
      id: service.id,
      title: service.title,
      description: service.description?.substring(0, 200) + (service.description?.length > 200 ? "..." : ""), // Truncar descripción
      price: service.price,
      duration: service.duration,
      maxParticipants: service.max_participants,
      featured: service.featured,
      imageUrl: service.image_url,
      createdAt: service.created_at,
      category: {
        id: Array.isArray(service.category) ? service.category[0]?.id : service.category?.id,
        name: Array.isArray(service.category) ? service.category[0]?.name : service.category?.name
      },
      subcategory: {
        id: Array.isArray(service.subcategory) ? service.subcategory[0]?.id : service.subcategory?.id,
        name: Array.isArray(service.subcategory) ? service.subcategory[0]?.name : service.subcategory?.name
      }
    }))

    // Calcular metadatos de paginación
    const totalPages = Math.ceil((count || 0) / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    const response = {
      data: processedServices,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      },
      filters: {
        categoryId: categoryId || null,
        subcategoryId: subcategoryId || null,
        featured: featured === "true" || null,
        search: search || null,
        priceRange: {
          min: priceMin ? parseFloat(priceMin) : null,
          max: priceMax ? parseFloat(priceMax) : null
        },
        sortBy,
        sortOrder
      }
    }

    // Determinar TTL basado en el tipo de consulta
    let ttl = 15 * 60 * 1000 // 15 minutos por defecto
    
    if (featured === "true") {
      ttl = 30 * 60 * 1000 // 30 minutos para servicios destacados
    } else if (search || categoryId || subcategoryId) {
      ttl = 10 * 60 * 1000 // 10 minutos para búsquedas filtradas
    }

    // Guardar en caché
    await unifiedCache.set(cacheKey, response, { ttl })
    
    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// GET - Obtener servicio individual optimizado
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { serviceId } = body

    if (!serviceId) {
      return NextResponse.json({ error: "Service ID requerido" }, { status: 400 })
    }

    // Generar clave de caché
    const cacheKey = `service_detail_${serviceId}`
    
    // Intentar obtener del caché
    const cached = await unifiedCache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    const supabase = await getSupabaseClient()

    // Obtener servicio completo con datos relacionados
    const { data, error } = await supabase
      .from("services")
      .select(`
        *,
        category:categories(
          id,
          name,
          description,
          icon_url
        ),
        subcategory:subcategories(
          id,
          name,
          description
        ),
        images:service_images(
          id,
          url,
          alt_text,
          order_index
        )
      `)
      .eq("id", serviceId)
      .eq("available", true)
      .single()

    if (error) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
    }

    // Procesar datos para optimizar payload
    const processedService = {
      id: data.id,
      title: data.title,
      description: data.description,
      price: data.price,
      duration: data.duration,
      maxParticipants: data.max_participants,
      featured: data.featured,
      available: data.available,
      imageUrl: data.image_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      category: {
        id: data.category?.id,
        name: data.category?.name,
        description: data.category?.description,
        iconUrl: data.category?.icon_url
      },
      subcategory: {
        id: data.subcategory?.id,
        name: data.subcategory?.name,
        description: data.subcategory?.description
      },
      images: (data.images || []).map((img: any) => ({
        id: img.id,
        url: img.url,
        altText: img.alt_text,
        orderIndex: img.order_index
      }))
    }

    // Guardar en caché por 1 hora (datos más estables)
    await unifiedCache.set(cacheKey, processedService, { ttl: 60 * 60 * 1000 })
    
    return NextResponse.json(processedService)
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
