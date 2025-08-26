import { getSupabaseClient } from './supabase-optimized'
import { NextRequest } from 'next/server'

export interface AuditLogEntry {
  action: string
  category: 'authentication' | 'admin_action' | 'data_access' | 'data_modification' | 'payment' | 'system'
  level: 'info' | 'warning' | 'error' | 'critical'
  details?: Record<string, any>
  user_id?: string
  ip_address?: string
  user_agent?: string
}

export class AuditLogger {
  private static async getClientInfo() {
    try {
      const supabaseClient = getSupabaseClient()
      const client = await supabaseClient.getClient()
      
      if (!client) {
        return { ip_address: 'unknown', user_agent: 'unknown' }
      }

      // Intentar obtener información del cliente
      const { data: { session } } = await client.auth.getSession()
      
      return {
        ip_address: session?.user?.user_metadata?.ip_address || 'unknown',
        user_agent: session?.user?.user_metadata?.user_agent || 'unknown'
      }
    } catch (error) {
return { ip_address: 'unknown', user_agent: 'unknown' }
    }
  }

  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      const supabaseClient = getSupabaseClient()
      const client = await supabaseClient.getClient()
      
      if (!client) {
return
      }
      
      const { data: { session } } = await client.auth.getSession()
      const clientInfo = await this.getClientInfo()

      const logData = {
        action: entry.action,
        category: entry.category,
        level: entry.level,
        details: entry.details || {},
        user_id: entry.user_id || session?.user?.id || null,
        ip_address: entry.ip_address || clientInfo.ip_address,
        user_agent: entry.user_agent || clientInfo.user_agent,
        created_at: new Date().toISOString()
      }

      const { error } = await client
        .from('audit_logs')
        .insert(logData)

      if (error) {
// No lanzar error para no interrumpir el flujo principal
      } else {
}
    } catch (error) {
// No lanzar error para no interrumpir el flujo principal
    }
  }

  // Métodos de conveniencia para acciones comunes
  static async logLogin(userId: string, success: boolean, details?: Record<string, any>) {
    await this.log({
      action: 'login',
      category: 'authentication',
      level: success ? 'info' : 'warning',
      user_id: userId,
      details: {
        success,
        ...details
      }
    })
  }

  static async logLogout(userId: string) {
    await this.log({
      action: 'logout',
      category: 'authentication',
      level: 'info',
      user_id: userId
    })
  }

  static async logAdminAction(action: string, details?: Record<string, any>, userId?: string) {
    await this.log({
      action,
      category: 'admin_action',
      level: 'info',
      user_id: userId,
      details
    })
  }

  static async logDataAccess(table: string, operation: 'read' | 'write' | 'delete', details?: Record<string, any>, userId?: string) {
    await this.log({
      action: `${operation}_${table}`,
      category: 'data_access',
      level: 'info',
      user_id: userId,
      details: {
        table,
        operation,
        ...details
      }
    })
  }

  static async logDataModification(table: string, operation: 'create' | 'update' | 'delete', recordId: string, details?: Record<string, any>, userId?: string) {
    await this.log({
      action: `${operation}_${table}`,
      category: 'data_modification',
      level: 'info',
      user_id: userId,
      details: {
        table,
        operation,
        record_id: recordId,
        ...details
      }
    })
  }

  static async logPaymentAction(action: string, success: boolean, amount?: number, details?: Record<string, any>, userId?: string) {
    await this.log({
      action,
      category: 'payment',
      level: success ? 'info' : 'error',
      user_id: userId,
      details: {
        success,
        amount,
        ...details
      }
    })
  }

  static async logSystemEvent(event: string, level: 'info' | 'warning' | 'error' | 'critical' = 'info', details?: Record<string, any>) {
    await this.log({
      action: event,
      category: 'system',
      level,
      details
    })
  }

  static async logError(error: Error, context?: Record<string, any>, userId?: string) {
    try {
      const supabaseClient = getSupabaseClient()
      const client = await supabaseClient.getClient()
      
      if (!client) {
return
      }

      const logData = {
        action: 'error_logged',
        category: 'system',
        level: 'error',
        user_id: userId,
        details: {
          error_message: error.message,
          error_stack: error.stack,
          context: context || {},
          timestamp: new Date().toISOString()
        },
        created_at: new Date().toISOString()
      }

      const { error: insertError } = await client
        .from('audit_logs')
        .insert(logData)

      if (insertError) {
} else {
}
    } catch (logError) {
}
  }
}

// Función de utilidad para obtener estadísticas de auditoría
export async function getAuditStats(days: number = 30) {
  try {
    const supabaseClient = getSupabaseClient()
    const client = await supabaseClient.getClient()
    
    if (!client) {
return null
    }
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data: logs, error } = await client
      .from('audit_logs')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
return null
    }

    // Calcular estadísticas
    const stats = {
      total: logs?.length || 0,
      byAction: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      byLevel: {} as Record<string, number>,
      byUser: {} as Record<string, number>,
      timeline: [] as Array<{ date: string; count: number }>
    }

    logs?.forEach((log: any) => {
      const action = String(log.action || 'unknown')
      const category = String(log.category || 'unknown')
      const level = String(log.level || 'info')
      const userId = log.user_id ? String(log.user_id) : 'system'
      
      stats.byAction[action] = (stats.byAction[action] || 0) + 1
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1
      stats.byLevel[level] = (stats.byLevel[level] || 0) + 1
      stats.byUser[userId] = (stats.byUser[userId] || 0) + 1
    })

    // Crear timeline por día
    const timelineMap = new Map<string, number>()
    logs?.forEach((log: any) => {
      const date = new Date(String(log.created_at)).toISOString().split('T')[0]
      timelineMap.set(date, (timelineMap.get(date) || 0) + 1)
    })

    stats.timeline = Array.from(timelineMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return stats
  } catch (error) {
return null
  }
}

// Función para obtener información del request
export function getRequestInfo(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const userAgent = request.headers.get('user-agent')

  return {
    ip_address: forwarded?.split(',')[0] || realIp || 'unknown',
    user_agent: userAgent || 'unknown'
  }
}

// Función para sanitizar datos sensibles
export function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data
  }

  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization', 'cookie']
  const sanitized = { ...data }

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]'
    }
  }

  // Recursivamente sanitizar objetos anidados
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeData(sanitized[key])
    }
  }

  return sanitized
}

// Instancia del logger para exportar
export const auditLogger = AuditLogger

export async function cleanupOldLogs(daysToKeep: number = 90) {
  try {
    const supabaseClient = getSupabaseClient()
    const client = await supabaseClient.getClient()
    
    if (!client) {
return { success: false, error: 'No se pudo obtener el cliente de Supabase' }
    }
    
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const { data, error } = await client
      .from('audit_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString())

    if (error) {
return { success: false, error: error.message }
    }

    return { success: true, deletedCount: 0 }
  } catch (error) {
return { success: false, error: 'Error desconocido' }
  }
} 
