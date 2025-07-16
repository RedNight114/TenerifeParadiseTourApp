import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { withAuthorization, requireAdmin } from "@/lib/authorization"
import { z } from "zod"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Esquemas de validación para gestión de usuarios
const updateUserRoleSchema = z.object({
  userId: z.string().uuid("ID de usuario debe ser un UUID válido"),
  role: z.enum(['client', 'admin', 'manager', 'staff', 'guide'], {
    errorMap: () => ({ message: "Rol debe ser client, admin, manager, staff o guide" })
  })
})

const getUserPermissionsSchema = z.object({
  userId: z.string().uuid("ID de usuario debe ser un UUID válido")
})

// GET - Obtener todos los usuarios (solo admin)
export const GET = requireAdmin()(async (request: NextRequest, userData: any) => {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    console.log("Obteniendo usuarios:", {
      adminUserId: userData.user.id,
      role,
      limit,
      offset
    })

    let query = supabase
      .from("profiles")
      .select(`
        id,
        email,
        full_name,
        role,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (role) {
      query = query.eq("role", role)
    }

    const { data: users, error, count } = await query

    if (error) {
      console.error("Error obteniendo usuarios:", error)
      return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 })
    }

    console.log(`Usuarios obtenidos exitosamente: ${users?.length || 0} usuarios`)
    return NextResponse.json({
      users,
      pagination: {
        limit,
        offset,
        total: count || 0
      }
    })
  } catch (error) {
    console.error("Error interno obteniendo usuarios:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})

// POST - Actualizar rol de usuario (solo admin)
export const POST = requireAdmin()(async (request: NextRequest, userData: any) => {
  try {
    const body = await request.json()
    
    // Validar datos de entrada
    const validation = updateUserRoleSchema.safeParse(body)
    if (!validation.success) {
      console.error("Error de validación en actualización de rol:", validation.error.errors)
      return NextResponse.json({
        error: "Datos de entrada inválidos",
        details: validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }, { status: 400 })
    }

    const { userId, role } = validation.data
    const adminUserId = userData.user.id

    // Prevenir que un admin se quite sus propios privilegios
    if (userId === adminUserId && role !== 'admin') {
      console.error("Admin intentando quitarse sus propios privilegios:", {
        adminUserId,
        targetUserId: userId,
        requestedRole: role
      })
      return NextResponse.json({
        error: "No puede cambiar su propio rol de administrador"
      }, { status: 403 })
    }

    console.log("Actualizando rol de usuario:", {
      adminUserId,
      targetUserId: userId,
      newRole: role
    })

    // Actualizar el rol del usuario
    const { data, error } = await supabase
      .from("profiles")
      .update({ 
        role,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error actualizando rol de usuario:", error)
      return NextResponse.json({ error: "Error al actualizar rol de usuario" }, { status: 500 })
    }

    console.log("Rol de usuario actualizado exitosamente:", {
      userId,
      newRole: role,
      updatedAt: data.updated_at
    })

    return NextResponse.json({
      message: "Rol de usuario actualizado exitosamente",
      user: data
    })
  } catch (error) {
    console.error("Error interno actualizando rol de usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})

// PUT - Obtener permisos de un usuario específico (solo admin)
export const PUT = requireAdmin()(async (request: NextRequest, userData: any) => {
  try {
    const body = await request.json()
    
    // Validar datos de entrada
    const validation = getUserPermissionsSchema.safeParse(body)
    if (!validation.success) {
      console.error("Error de validación en consulta de permisos:", validation.error.errors)
      return NextResponse.json({
        error: "Datos de entrada inválidos",
        details: validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }, { status: 400 })
    }

    const { userId } = validation.data
    const adminUserId = userData.user.id

    console.log("Consultando permisos de usuario:", {
      adminUserId,
      targetUserId: userId
    })

    // Obtener el perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("id", userId)
      .single()

    if (profileError || !profile) {
      console.error("Usuario no encontrado:", userId)
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Obtener los permisos del usuario
    const { data: permissions, error: permissionsError } = await supabase
      .from("user_permissions")
      .select(`
        permission_name,
        resource,
        action,
        description
      `)
      .eq("user_id", userId)

    if (permissionsError) {
      console.error("Error obteniendo permisos:", permissionsError)
      return NextResponse.json({ error: "Error al obtener permisos" }, { status: 500 })
    }

    console.log("Permisos obtenidos exitosamente:", {
      userId,
      role: profile.role,
      permissionsCount: permissions?.length || 0
    })

    return NextResponse.json({
      user: profile,
      permissions: permissions || []
    })
  } catch (error) {
    console.error("Error interno consultando permisos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}) 