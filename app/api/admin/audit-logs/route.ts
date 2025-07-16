import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { withAuthorization } from "@/lib/authorization"

// GET - Obtener logs de auditoría con filtros
export const GET = withAuthorization({ requiredRole: "admin" })(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const action = searchParams.get("action")
    const userId = searchParams.get("userId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const severity = searchParams.get("severity")

    console.log("Obteniendo logs de auditoría con filtros:", {
      page,
      limit,
      action,
      userId,
      startDate,
      endDate,
      severity,
    })

    // Construir query base
    let query = supabase
      .from("audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })

    // Aplicar filtros
    if (action) {
      query = query.eq("action", action)
    }

    if (userId) {
      query = query.eq("user_id", userId)
    }

    if (severity) {
      query = query.eq("severity", severity)
    }

    if (startDate) {
      query = query.gte("created_at", startDate)
    }

    if (endDate) {
      query = query.lte("created_at", endDate)
    }

    // Aplicar paginación
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: logs, error, count } = await query

    if (error) {
      console.error("Error obteniendo logs de auditoría:", error)
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      )
    }

    // Procesar logs para incluir información adicional
    const processedLogs = await Promise.all(
      logs?.map(async (log) => {
        let userInfo = null
        let serviceInfo = null
        let reservationInfo = null

        // Obtener información del usuario si existe
        if (log.user_id) {
          const { data: userData } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", log.user_id)
            .single()
          userInfo = userData
        }

        // Obtener información del servicio si existe
        if (log.service_id) {
          const { data: serviceData } = await supabase
            .from("services")
            .select("title")
            .eq("id", log.service_id)
            .single()
          serviceInfo = serviceData
        }

        // Obtener información de la reserva si existe
        if (log.reservation_id) {
          const { data: reservationData } = await supabase
            .from("reservations")
            .select("id, reservation_date, guests")
            .eq("id", log.reservation_id)
            .single()
          reservationInfo = reservationData
        }

        return {
          ...log,
          user_info: userInfo,
          service_info: serviceInfo,
          reservation_info: reservationInfo,
        }
      }) || []
    )

    console.log(`Logs obtenidos: ${processedLogs.length} de ${count} total`)

    return NextResponse.json({
      logs: processedLogs,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("Error inesperado en audit-logs:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
})

// POST - Crear nuevo log de auditoría
export const POST = withAuthorization({ requiredRole: "admin" })(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { action, details, severity = "info", user_id, service_id, reservation_id } = body

    console.log("Creando log de auditoría:", {
      action,
      severity,
      user_id,
      service_id,
      reservation_id,
    })

    const { data, error } = await supabase.from("audit_logs").insert({
      action,
      details,
      severity,
      user_id,
      service_id,
      reservation_id,
    })

    if (error) {
      console.error("Error creando log de auditoría:", error)
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      )
    }

    console.log("Log de auditoría creado exitosamente:", data)

    return NextResponse.json({ success: true, log: data })
  } catch (error) {
    console.error("Error inesperado creando log:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}) 