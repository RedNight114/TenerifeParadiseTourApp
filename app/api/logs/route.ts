import { NextRequest, NextResponse } from 'next/server'
import { log, AdvancedLogger } from '@/lib/advanced-logger'

// Marcar como dinámico para evitar errores de SSR
export const dynamic = 'force-dynamic'

async function handler(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level') || 'all'
    const endpoint = searchParams.get('endpoint') || 'all'
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Obtener métricas del logger
    const logger = new AdvancedLogger()
    const metrics = logger.getMetrics()

    // Log de la petición
    log.info('Logs endpoint accessed', {
      endpoint: '/api/logs',
      method: request.method,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || request.ip || undefined,
      query: { level, endpoint, limit, offset }
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      filters: { level, endpoint, limit, offset },
      metrics,
      note: 'Logs detallados están disponibles en la base de datos. Use el endpoint /api/logs/detailed para logs específicos.'
    })

  } catch (error) {
    log.error('Error in logs endpoint', {
      error: error instanceof Error ? error.message : String(error),
      endpoint: '/api/logs',
      method: request.method
    })

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export const GET = handler
