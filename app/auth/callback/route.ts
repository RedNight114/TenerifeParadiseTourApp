import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-optimized'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/profile'

  if (code) {
    const supabase = getSupabaseClient()
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error en callback de auth:', error)
        return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error.message)}`)
      }

      if (data.user) {
        // Verificar si el usuario ya tiene un perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (!profile) {
          // Crear perfil automáticamente para usuarios sociales
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || 'Usuario',
                email: data.user.email,
                avatar_url: data.user.user_metadata?.avatar_url,
                role: 'user'
              }
            ])

          if (profileError) {
            console.error('Error creando perfil:', profileError)
          }
        }

        // Redirigir según el rol
        const redirectUrl = data.user.user_metadata?.role === 'admin' 
          ? '/admin/dashboard' 
          : next

        return NextResponse.redirect(`${origin}${redirectUrl}`)
      }
    } catch (error) {
      console.error('Error procesando callback:', error)
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Error procesando autenticación')}`)
    }
  }

  // Si no hay código, redirigir al login
  return NextResponse.redirect(`${origin}/auth/login`)
}
