import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { log } from '@/lib/advanced-logger'
import { recordMetric } from '@/lib/api-metrics'
import '@/lib/middleware-polyfills'

export async function middleware(req: NextRequest) {
  // Middleware simplificado para mejor rendimiento
  const response = NextResponse.next()
  
  // Solo aplicar headers de seguridad para rutas importantes
  if (req.nextUrl.pathname.startsWith('/api/') || 
      req.nextUrl.pathname.startsWith('/admin')) {
    
    // Security headers básicos
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    
    // CORS para APIs
    if (req.nextUrl.pathname.startsWith('/api/')) {
      response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_SITE_URL || '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    }
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 