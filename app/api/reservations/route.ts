import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { 
  createReservationSchema, 
  getReservationsQuerySchema,
  validateData
} from "@/lib/validation-schemas"
import { sanitizeObject } from "@/lib/api-validation"
import { createValidationErrorResponse } from "@/lib/api-validation"

// Forzar renderizado dinámico para evitar errores de build
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Cliente base de Supabase
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// Función para obtener el usuario autenticado
async function getAuthenticatedUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    console.error('Error obteniendo usuario autenticado:', error)
    return null
  }
}

// POST - Crear reserva (requiere autenticación)
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
    
    console.log("Datos recibidos en la API:", JSON.stringify(body, null, 2))
    
    const validation = validateData(createReservationSchema, body)

    if (!validation.success) {
      console.error("Error de validación en creación de reserva:", validation.errors)
      console.error("Datos que causaron el error:", JSON.stringify(body, null, 2))
      return createValidationErrorResponse(validation.errors)
    }

    const validatedData = validation.data

    // Asegurar que el usuario solo puede crear reservas para sí mismo
    if (validatedData.user_id !== user.id) {
      console.error("Usuario intentando crear reserva para otro usuario:", {
        userId: user.id,
        requestedUserId: validatedData.user_id
      })
      return NextResponse.json(
        { error: "No autorizado - Solo puede crear reservas para sí mismo" },
        { status: 403 }
      )
    }

    // Sanitizar los datos antes de procesarlos
    console.log("Datos antes de sanitizar:", JSON.stringify(validatedData, null, 2))
    const sanitizedData = sanitizeObject(validatedData)
    console.log("Datos después de sanitizar:", JSON.stringify(sanitizedData, null, 2))

    console.log("Creando reserva con datos validados:", {
      user_id: sanitizedData.user_id,
      service_id: sanitizedData.service_id,
      reservation_date: sanitizedData.reservation_date,
      guests: sanitizedData.guests,
      total_amount: sanitizedData.total_amount
    })

    // Crear un cliente de Supabase autenticado con el token del usuario
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.substring(7)
    
    const authenticatedSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )

    // Crear la reserva usando el cliente autenticado
    const { data, error } = await authenticatedSupabase
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
      .select()
      .single()

    if (error) {
      console.error("Error al crear la reserva en Supabase:", error)
      console.error("Código de error:", error.code)
      console.error("Mensaje de error:", error.message)
      console.error("Detalles de error:", error.details)
      return NextResponse.json({ error: "Error al crear la reserva" }, { status: 500 })
    }

    console.log("Reserva creada exitosamente:", data.id)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error interno en creación de reserva:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// GET - Obtener reservas (permite ver propias reservas)
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

    // Validar query parameters
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    // Si no se especifica userId, usar el del usuario autenticado
    const targetUserId = userId || user.id

    // Verificar si puede ver reservas de otros usuarios (solo admins)
    if (targetUserId !== user.id) {
      // Verificar si es admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        console.error("Usuario intentando ver reservas de otro usuario sin ser admin:", {
          userId: user.id,
          targetUserId,
          userRole: profile?.role
        })
        return NextResponse.json(
          { error: "No autorizado - No puede ver reservas de otros usuarios" },
          { status: 403 }
        )
      }
    }

    if (!targetUserId) {
      return NextResponse.json({ error: "User ID requerido" }, { status: 400 })
    }

    const queryValidation = validateData(getReservationsQuerySchema, { userId: targetUserId })
    
    if (!queryValidation.success) {
      console.error("Error de validación en consulta de reservas:", queryValidation.errors)
      return createValidationErrorResponse(queryValidation.errors)
    }

    const validatedQuery = queryValidation.data

    console.log("Consultando reservas para usuario:", {
      requestingUserId: user.id,
      targetUserId: validatedQuery.userId
    })

    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        service:services(
          title,
          category,
          description,
          price
        )
      `)
      .eq("user_id", validatedQuery.userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error al obtener las reservas de Supabase:", error)
      return NextResponse.json({ error: "Error al obtener las reservas" }, { status: 500 })
    }

    console.log(`Reservas obtenidas exitosamente: ${data?.length || 0} reservas`)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error interno en consulta de reservas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
