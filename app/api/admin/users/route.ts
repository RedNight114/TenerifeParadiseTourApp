import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase-unified"
import { withAuthorization, requireAdmin } from "@/lib/authorization"
import { z } from "zod"

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
export const GET = requireAdmin()(async (request: NextRequest, userData: unknown) => {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    // Obtener cliente unificado
    const supabase = await getSupabaseClient()

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
      return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 })
    }
    
    return NextResponse.json({
      users,
      pagination: {
        limit,
        offset,
        total: count || 0
      }
    })
  } catch (error) {
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
      return NextResponse.json({
        error: "Datos de entrada inválidos",
        details: validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }, { status: 400 })
    }

    const { userId, role } = validation.data
    const adminUserId = userData.user.id

    // Prevenir que un admin se quite sus propios privilegios
    if (userId === adminUserId && role !== 'admin') {
      return NextResponse.json({
        error: "No puede cambiar su propio rol de administrador"
      }, { status: 403 })
    }

    // Obtener cliente unificado
    const supabase = await getSupabaseClient()

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
      return NextResponse.json({ error: "Error al actualizar rol de usuario" }, { status: 500 })
    }
    
    return NextResponse.json({
      message: "Rol de usuario actualizado exitosamente",
      user: data
    })
  } catch (error) {
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
      return NextResponse.json({
        error: "Datos de entrada inválidos",
        details: validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }, { status: 400 })
    }

    const { userId } = validation.data
    const adminUserId = userData.user.id

    // Obtener cliente unificado
    const supabase = await getSupabaseClient()

    // Obtener el perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("id", userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Obtener los permisos del usuario usando la función segura
    const { data: permissions, error: permissionsError } = await supabase
      .rpc('get_user_permissions', { user_id_param: userId })

    if (permissionsError) {
      return NextResponse.json({ error: "Error al obtener permisos" }, { status: 500 })
    }
    
    return NextResponse.json({
      user: profile,
      permissions: permissions || []
    })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}) 

