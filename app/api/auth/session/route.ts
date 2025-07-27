import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('🔐 SESSION API - Verificando sesión...')
    
    // Obtener el token de autorización del header
    const authHeader = request.headers.get('authorization')
    let accessToken = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7)
    }
    
    console.log('🔐 SESSION API - Token encontrado:', !!accessToken)
    
    if (!accessToken) {
      // Intentar obtener la sesión sin token
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('❌ SESSION API - Error al obtener sesión:', error)
        return NextResponse.json({ 
          error: 'Error al obtener sesión',
          details: error.message 
        }, { status: 401 })
      }
      
      console.log('🔐 SESSION API - Sesión obtenida sin token:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id
      })
      
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
      console.error('❌ SESSION API - Error al verificar token:', error)
      return NextResponse.json({ 
        error: 'Token inválido',
        details: error.message 
      }, { status: 401 })
    }
    
    if (!user) {
      console.log('❌ SESSION API - No hay usuario para el token')
      return NextResponse.json({ 
        error: 'Usuario no encontrado'
      }, { status: 401 })
    }
    
    console.log('✅ SESSION API - Usuario verificado:', {
      userId: user.id,
      email: user.email
    })
    
    // Crear objeto de sesión
    const session = {
      user,
      access_token: accessToken,
      expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hora
    }
    
    return NextResponse.json({ 
      session,
      method: 'token_verification'
    })
    
  } catch (error) {
    console.error('❌ SESSION API - Error inesperado:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
} 