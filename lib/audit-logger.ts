import { createClient } from "@supabase/supabase-js"

// Tipos para el sistema de auditoría
export interface AuditLogEntry {
  id?: string
  user_id?: string
  user_email?: string
  action: string
  category: AuditCategory
  level: AuditLevel
  details: Record<string, any>
  ip_address?: string
  user_agent?: string
  resource_type?: string
  resource_id?: string
  success: boolean
  error_message?: string
  metadata?: Record<string, any>
  created_at?: string
}

export type AuditCategory = 
  | 'authentication'
  | 'authorization'
  | 'data_access'
  | 'data_modification'
  | 'payment'
  | 'reservation'
  | 'admin_action'
  | 'security'
  | 'system'
  | 'api'

export type AuditLevel = 'info' | 'warning' | 'error' | 'critical'

// Configuración del logger
interface LoggerConfig {
  enableConsole: boolean
  enableDatabase: boolean
  enableFile: boolean
  logLevel: AuditLevel
  maxRetries: number
  batchSize: number
  flushInterval: number
}

// Clase principal del sistema de auditoría
export class AuditLogger {
  private supabase: any
  private config: LoggerConfig
  private logQueue: AuditLogEntry[] = []
  private flushTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      enableConsole: true,
      enableDatabase: true,
      enableFile: false,
      logLevel: 'info',
      maxRetries: 3,
      batchSize: 10,
      flushInterval: 5000, // 5 segundos
      ...config
    }

    if (this.config.enableDatabase) {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
    }

    // Iniciar timer para flush automático
    this.startFlushTimer()
  }

  // Método principal para registrar eventos
  async log(entry: Omit<AuditLogEntry, 'created_at'>): Promise<void> {
    const fullEntry: AuditLogEntry = {
      ...entry,
      created_at: new Date().toISOString()
    }

    // Verificar nivel de log
    if (!this.shouldLog(fullEntry.level)) {
      return
    }

    // Agregar a la cola
    this.logQueue.push(fullEntry)

    // Log inmediato para errores críticos
    if (fullEntry.level === 'critical') {
      await this.flush()
    }

    // Flush si la cola está llena
    if (this.logQueue.length >= this.config.batchSize) {
      await this.flush()
    }
  }

  // Métodos específicos para diferentes tipos de eventos
  async logAuthentication(
    action: string,
    user_id: string,
    user_email: string,
    success: boolean,
    details: Record<string, any> = {},
    error_message?: string
  ): Promise<void> {
    await this.log({
      action,
      category: 'authentication',
      level: success ? 'info' : 'warning',
      user_id,
      user_email,
      details,
      success,
      error_message,
      resource_type: 'user',
      resource_id: user_id
    })
  }

  async logAuthorization(
    action: string,
    user_id: string,
    user_email: string,
    resource_type: string,
    resource_id: string,
    success: boolean,
    details: Record<string, any> = {}
  ): Promise<void> {
    await this.log({
      action,
      category: 'authorization',
      level: success ? 'info' : 'warning',
      user_id,
      user_email,
      details,
      success,
      resource_type,
      resource_id
    })
  }

  async logDataAccess(
    action: string,
    user_id: string,
    user_email: string,
    resource_type: string,
    resource_id: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    await this.log({
      action,
      category: 'data_access',
      level: 'info',
      user_id,
      user_email,
      details,
      success: true,
      resource_type,
      resource_id
    })
  }

  async logDataModification(
    action: string,
    user_id: string,
    user_email: string,
    resource_type: string,
    resource_id: string,
    old_data?: any,
    new_data?: any,
    success: boolean = true
  ): Promise<void> {
    await this.log({
      action,
      category: 'data_modification',
      level: success ? 'info' : 'error',
      user_id,
      user_email,
      details: {
        old_data,
        new_data,
        changes: this.getChanges(old_data, new_data)
      },
      success,
      resource_type,
      resource_id
    })
  }

  async logPayment(
    action: string,
    user_id: string,
    user_email: string,
    payment_id: string,
    amount: number,
    success: boolean,
    details: Record<string, any> = {},
    error_message?: string
  ): Promise<void> {
    await this.log({
      action,
      category: 'payment',
      level: success ? 'info' : 'error',
      user_id,
      user_email,
      details: {
        payment_id,
        amount,
        ...details
      },
      success,
      error_message,
      resource_type: 'payment',
      resource_id: payment_id
    })
  }

  async logSecurityEvent(
    action: string,
    level: AuditLevel,
    details: Record<string, any> = {},
    user_id?: string,
    user_email?: string
  ): Promise<void> {
    await this.log({
      action,
      category: 'security',
      level,
      user_id,
      user_email,
      details,
      success: level === 'info'
    })
  }

  async logAdminAction(
    action: string,
    admin_id: string,
    admin_email: string,
    target_type: string,
    target_id: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    await this.log({
      action,
      category: 'admin_action',
      level: 'info',
      user_id: admin_id,
      user_email: admin_email,
      details,
      success: true,
      resource_type: target_type,
      resource_id: target_id
    })
  }

  // Métodos de utilidad
  private shouldLog(level: AuditLevel): boolean {
    const levels: AuditLevel[] = ['info', 'warning', 'error', 'critical']
    const configLevelIndex = levels.indexOf(this.config.logLevel)
    const entryLevelIndex = levels.indexOf(level)
    return entryLevelIndex >= configLevelIndex
  }

  private getChanges(oldData: any, newData: any): Record<string, any> {
    if (!oldData || !newData) return {}
    
    const changes: Record<string, any> = {}
    
    for (const key in newData) {
      if (oldData[key] !== newData[key]) {
        changes[key] = {
          from: oldData[key],
          to: newData[key]
        }
      }
    }
    
    return changes
  }

  // Métodos de flush y limpieza
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    
    this.flushTimer = setInterval(async () => {
      await this.flush()
    }, this.config.flushInterval)
  }

  async flush(): Promise<void> {
    if (this.logQueue.length === 0) return

    const logsToFlush = [...this.logQueue]
    this.logQueue = []

    try {
      // Log a consola
      if (this.config.enableConsole) {
        this.logToConsole(logsToFlush)
      }

      // Log a base de datos
      if (this.config.enableDatabase) {
        await this.logToDatabase(logsToFlush)
      }

      // Log a archivo (si está habilitado)
      if (this.config.enableFile) {
        await this.logToFile(logsToFlush)
      }
    } catch (error) {
      console.error('Error flushing audit logs:', error)
      
      // Reintentar logs fallidos
      this.logQueue.unshift(...logsToFlush)
    }
  }

  private logToConsole(logs: AuditLogEntry[]): void {
    logs.forEach(log => {
      const timestamp = new Date(log.created_at!).toISOString()
      const level = log.level.toUpperCase()
      const category = log.category.toUpperCase()
      
      const message = `[${timestamp}] ${level} [${category}] ${log.action} - User: ${log.user_email || 'anonymous'} - Success: ${log.success}`
      
      switch (log.level) {
        case 'critical':
        case 'error':
          console.error(message, log.details)
          break
        case 'warning':
          console.warn(message, log.details)
          break
        default:
          console.log(message, log.details)
      }
    })
  }

  private async logToDatabase(logs: AuditLogEntry[]): Promise<void> {
    if (!this.supabase) return

    const { error } = await this.supabase
      .from('audit_logs')
      .insert(logs)

    if (error) {
      throw new Error(`Database logging failed: ${error.message}`)
    }
  }

  private async logToFile(logs: AuditLogEntry[]): Promise<void> {
    // Implementación para logging a archivo (opcional)
    // Por ahora solo simulamos
    console.log('File logging not implemented yet')
  }

  // Métodos de consulta y exportación
  async getLogs(filters: {
    user_id?: string
    category?: AuditCategory
    level?: AuditLevel
    start_date?: string
    end_date?: string
    limit?: number
    offset?: number
  } = {}): Promise<AuditLogEntry[]> {
    if (!this.supabase) return []

    let query = this.supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id)
    }
    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.level) {
      query = query.eq('level', filters.level)
    }
    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date)
    }
    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date)
    }
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch logs: ${error.message}`)
    }

    return data || []
  }

  async exportLogs(format: 'json' | 'csv' = 'json', filters: any = {}): Promise<string> {
    const logs = await this.getLogs(filters)
    
    if (format === 'csv') {
      return this.convertToCSV(logs)
    }
    
    return JSON.stringify(logs, null, 2)
  }

  private convertToCSV(logs: AuditLogEntry[]): string {
    if (logs.length === 0) return ''
    
    const headers = Object.keys(logs[0]).join(',')
    const rows = logs.map(log => 
      Object.values(log).map(value => 
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      ).join(',')
    )
    
    return [headers, ...rows].join('\n')
  }

  // Métodos de limpieza
  async cleanupOldLogs(daysToKeep: number = 90): Promise<void> {
    if (!this.supabase) return

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const { error } = await this.supabase
      .from('audit_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString())

    if (error) {
      throw new Error(`Failed to cleanup old logs: ${error.message}`)
    }
  }

  // Método para obtener estadísticas
  async getStats(days: number = 30): Promise<{
    total: number
    byCategory: Record<AuditCategory, number>
    byLevel: Record<AuditLevel, number>
    bySuccess: { success: number; failed: number }
  }> {
    const logs = await this.getLogs({
      start_date: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    })

    const stats = {
      total: logs.length,
      byCategory: {} as Record<AuditCategory, number>,
      byLevel: {} as Record<AuditLevel, number>,
      bySuccess: { success: 0, failed: 0 }
    }

    logs.forEach(log => {
      // Contar por categoría
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1
      
      // Contar por nivel
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1
      
      // Contar por éxito
      if (log.success) {
        stats.bySuccess.success++
      } else {
        stats.bySuccess.failed++
      }
    })

    return stats
  }

  // Método para limpiar recursos
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
  }
}

// Instancia global del logger
export const auditLogger = new AuditLogger()

// Función helper para obtener información del request
export function getRequestInfo(request: Request): {
  ip_address?: string
  user_agent?: string
} {
  const headers = request.headers
  
  return {
    ip_address: headers.get('x-forwarded-for') || 
                headers.get('x-real-ip') || 
                'unknown',
    user_agent: headers.get('user-agent') || 'unknown'
  }
}

// Función helper para sanitizar datos sensibles
export function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') return data
  
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization']
  const sanitized = { ...data }
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]'
    }
  }
  
  return sanitized
} 