import { NextRequest, NextResponse } from 'next/server'
import { metricsCollector } from '@/lib/api-metrics'
import { log } from '@/lib/advanced-logger'

// Marcar como dinámico para evitar errores de SSR
export const dynamic = 'force-dynamic'

async function handler(request: NextRequest) {
  try {
    // Verificar autenticación si es necesario
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Aquí puedes verificar el token si es necesario
    // Por ahora solo verificamos que exista
    if (!token) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Obtener métricas
    const metrics = metricsCollector.getMetrics()
    
    // Log de la petición
    log.info('Metrics endpoint accessed', {
      endpoint: '/api/metrics',
      method: request.method,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || request.ip || undefined
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics
    })

  } catch (error) {
    log.error('Error in metrics endpoint', {
      error: error instanceof Error ? error.message : String(error),
      endpoint: '/api/metrics',
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
