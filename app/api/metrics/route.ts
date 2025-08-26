import { NextRequest, NextResponse } from 'next/server'
import { metricsCollector } from '@/lib/api-metrics'
import { log } from '@/lib/advanced-logger'
import { withApiLogging } from '@/lib/api-logging-middleware'

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
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.ip
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics
    })

  } catch (error) {
    log.error('Error in metrics endpoint', error as Error, {
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

// Exportar con logging automático
export const GET = withApiLogging(handler, {
  logRequestBody: false,
  logResponseBody: false,
  logHeaders: false
})
