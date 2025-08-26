import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Forzar renderizado dinámico para evitar errores de build
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
// Obtener el token de autorización del header
    const authHeader = request.headers.get('authorization')
    let accessToken = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7)
    }
if (!accessToken) {
      // Intentar obtener la sesión sin token
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
return NextResponse.json({ 
          error: 'Error al obtener sesión',
          details: error.message 
        }, { status: 401 })
      }
// Si hay sesión sin token, devolverla
      if (session?.access_token) {
        return NextResponse.json({ 
          session,
          method: 'server_session'
        })
      }
      
      return NextResponse.json({ 
        session: null,
        method: 'no_token'
      })
    }
    
    // Verificar el token
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (error) {
return NextResponse.json({ 
        error: 'Token inválido',
        details: error.message 
      }, { status: 401 })
    }
    
    if (!user) {
return NextResponse.json({ 
        error: 'Usuario no encontrado'
      }, { status: 401 })
    }
// Crear objeto de sesión con tiempo extendido
    const session = {
      user,
      access_token: accessToken,
      expires_at: Math.floor(Date.now() / 1000) + 28800 // 8 horas
    }
    
    return NextResponse.json({ 
      session,
      method: 'token_verification'
    })
    
  } catch (error) {
return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
} 
