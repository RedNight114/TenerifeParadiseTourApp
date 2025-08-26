import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { withAuthRateLimit } from "@/lib/rate-limiting"
import { auditAuthEvent } from "@/lib/audit-middleware"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// GET - Callback de autenticación con rate limiting estricto
export const GET = withAuthRateLimit(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const next = searchParams.get("next") || "/"

    if (!code) {
return NextResponse.redirect(new URL("/login?error=missing_code", request.url))
    }
// Intercambiar código por sesión
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
// Registrar evento de auditoría para error de autenticación
      await auditAuthEvent(
        'auth_callback_failed',
        'unknown',
        'unknown',
        false,
        request,
        { error: error.message, code: 'session_error' },
        error.message
      )
      
      return NextResponse.redirect(new URL("/login?error=session_error", request.url))
    }

    if (!data.session) {
// Registrar evento de auditoría para sesión fallida
      await auditAuthEvent(
        'auth_callback_failed',
        'unknown',
        'unknown',
        false,
        request,
        { error: 'No session created', code: 'no_session' },
        'No se pudo crear sesión'
      )
      
      return NextResponse.redirect(new URL("/login?error=no_session", request.url))
    }
// Registrar evento de auditoría para login exitoso
    await auditAuthEvent(
      'auth_callback_success',
      data.user?.id || 'unknown',
      data.user?.email || 'unknown',
      true,
      request,
      { 
        user_id: data.user?.id,
        next_url: next,
        session_created: true
      }
    )

    // Redirigir al usuario a la página solicitada o dashboard
    return NextResponse.redirect(new URL(next, request.url))
  } catch (error) {
// Registrar evento de auditoría para error interno
    await auditAuthEvent(
      'auth_callback_error',
      'unknown',
      'unknown',
      false,
      request,
      { error: (error as Error).message, code: 'internal_error' },
      (error as Error).message
    )
    
    return NextResponse.redirect(new URL("/login?error=internal_error", request.url))
  }
}) 
