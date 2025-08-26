import { NextRequest, NextResponse } from 'next/server'
import { log } from '@/lib/advanced-logger'
import { metricsCollector } from '@/lib/api-metrics'
import { withApiLogging } from '@/lib/api-logging-middleware'

async function handler(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Verificar estado del sistema
    const systemStatus = await checkSystemHealth()
    
    const duration = Date.now() - startTime
    
    // Log del health check
    log.info('Health check performed', {
      endpoint: '/api/health',
      method: request.method,
      duration,
      status: systemStatus.overall
    })

    // Registrar métrica de health check
    if (systemStatus.overall === 'healthy') {
      log.info('System is healthy', {
        endpoint: '/api/health',
        method: request.method,
        memoryUsage: systemStatus.memory,
        uptime: systemStatus.uptime
      })
    } else {
      log.warn('System health issues detected', {
        endpoint: '/api/health',
        method: request.method,
        issues: systemStatus.issues
      })
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      status: systemStatus.overall,
      duration: `${duration}ms`,
      checks: systemStatus.checks,
      system: {
        uptime: systemStatus.uptime,
        memory: systemStatus.memory,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development'
      }
    })

  } catch (error) {
    log.error('Error in health check', error as Error, {
      endpoint: '/api/health',
      method: request.method
    })

    return NextResponse.json(
      { 
        success: false,
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

async function checkSystemHealth() {
  const checks: Record<string, { status: 'healthy' | 'warning' | 'critical'; message: string; value?: any }> = {}
  
  // Verificar memoria
  const memoryUsage = process.memoryUsage()
  const memoryMB = memoryUsage.heapUsed / 1024 / 1024
  const memoryLimit = 512 // 512MB límite
  
  if (memoryMB < memoryLimit * 0.7) {
    checks.memory = { status: 'healthy', message: 'Memory usage is normal', value: `${memoryMB.toFixed(2)}MB` }
  } else if (memoryMB < memoryLimit * 0.9) {
    checks.memory = { status: 'warning', message: 'Memory usage is high', value: `${memoryMB.toFixed(2)}MB` }
  } else {
    checks.memory = { status: 'critical', message: 'Memory usage is critical', value: `${memoryMB.toFixed(2)}MB` }
  }

  // Verificar uptime
  const uptime = process.uptime()
  const uptimeHours = uptime / 3600
  
  if (uptimeHours > 24) {
    checks.uptime = { status: 'healthy', message: 'System has been running for more than 24 hours', value: `${uptimeHours.toFixed(2)}h` }
  } else if (uptimeHours > 1) {
    checks.uptime = { status: 'warning', message: 'System has been running for less than 24 hours', value: `${uptimeHours.toFixed(2)}h` }
  } else {
    checks.uptime = { status: 'critical', message: 'System recently restarted', value: `${uptimeHours.toFixed(2)}h` }
  }

  // Verificar variables de entorno críticas
  const criticalEnvVars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
  for (const envVar of criticalEnvVars) {
    if (process.env[envVar]) {
      checks[`env_${envVar}`] = { status: 'healthy', message: `${envVar} is set` }
    } else {
      checks[`env_${envVar}`] = { status: 'critical', message: `${envVar} is not set` }
    }
  }

  // Verificar métricas del sistema
  try {
    const metrics = metricsCollector.getMetrics()
    if (metrics.requests.total > 0) {
      checks.metrics = { 
        status: 'healthy', 
        message: 'Metrics collection is working',
        value: `${metrics.requests.total} requests tracked`
      }
    } else {
      checks.metrics = { 
        status: 'warning', 
        message: 'No metrics collected yet',
        value: '0 requests'
      }
    }
  } catch (error) {
    checks.metrics = { 
      status: 'critical', 
      message: 'Metrics collection failed',
      value: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  // Determinar estado general
  const hasCritical = Object.values(checks).some(check => check.status === 'critical')
  const hasWarning = Object.values(checks).some(check => check.status === 'warning')
  
  let overall: 'healthy' | 'warning' | 'critical' = 'healthy'
  if (hasCritical) {
    overall = 'critical'
  } else if (hasWarning) {
    overall = 'warning'
  }

  // Obtener issues si los hay
  const issues = Object.entries(checks)
    .filter(([_, check]) => check.status !== 'healthy')
    .map(([name, check]) => ({ name, ...check }))

  return {
    overall,
    checks,
    issues,
    memory: `${memoryMB.toFixed(2)}MB`,
    uptime: `${uptimeHours.toFixed(2)}h`
  }
}

// Exportar con logging automático
export const GET = withApiLogging(handler, {
  logRequestBody: false,
  logResponseBody: false,
  logHeaders: false
})
