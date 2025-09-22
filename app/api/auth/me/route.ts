import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-unified'
import { cookies } from 'next/headers'

// Forzar que esta ruta sea dinámica
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient()
    
    // Verificar cookies de sesión
    const cookieStore = cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'No hay token de acceso', authenticated: false },
        { status: 401 }
      )
    }

    // Verificar el usuario con el token
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token inválido', authenticated: false, details: authError?.message },
        { status: 401 }
      )
    }

    // Obtener el perfil del usuario
    let profile = null
    let profileError = null
    
    // Primero intentar con .maybeSingle()
    const { data: maybeProfile, error: maybeError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (maybeError) {
      // Si hay error con maybeSingle, intentar obtener todos los perfiles
      console.log('Error con maybeSingle, intentando obtener todos los perfiles:', maybeError.message)
      
      const { data: allProfiles, error: allError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .order('created_at', { ascending: false })

      if (allError) {
        profileError = allError
      } else if (allProfiles && allProfiles.length > 0) {
        profile = allProfiles[0] // Tomar el más reciente
        console.log('Seleccionado perfil más reciente:', profile.id)
      }
    } else {
      profile = maybeProfile
    }

    if (profileError) {
      return NextResponse.json(
        { 
          user: {
            id: user.id,
            email: user.email,
            created_at: user.created_at
          },
          profile: null,
          error: 'Error obteniendo perfil',
          details: profileError.message,
          authenticated: true
        },
        { status: 200 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      profile: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      },
      authenticated: true,
      isAdmin: profile.role === 'admin'
    })

  } catch (error) {
    console.error('Error en /api/auth/me:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
        authenticated: false
      },
      { status: 500 }
    )
  }
}
