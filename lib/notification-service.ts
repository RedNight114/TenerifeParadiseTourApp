import { getSupabaseClient } from './supabase'

interface NotificationData {
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'reservation' | 'payment' | 'chat' | 'system'
  data?: any
  user_id?: string
}

class NotificationService {
  private static instance: NotificationService
  private supabase: any = null

  private constructor() {
    this.initializeSupabase()
  }

  private async initializeSupabase() {
    try {
      this.supabase = await getSupabaseClient()
    } catch (error) {
      }
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  // Crear notificación
  async createNotification(data: NotificationData): Promise<boolean> {
    try {
      if (!this.supabase) {
        await this.initializeSupabase()
      }

      if (!this.supabase) {
        return false
      }

      const { error } = await this.supabase
        .from('notifications')
        .insert({
          user_id: data.user_id || null, // Si no se especifica, será para todos los admins
          title: data.title,
          message: data.message,
          type: data.type,
          data: data.data || {},
          read: false
        })

      if (error) {
        return false
      }

      return true
    } catch (error) {
      return false
    }
  }

  // Notificaciones específicas para eventos del sistema

  async notifyNewReservation(reservationData: any): Promise<boolean> {
    // Obtener todos los usuarios admin
    const adminUsers = await this.getAdminUsers()
    
    const notifications = adminUsers.map(adminId => ({
      user_id: adminId,
      title: 'Nueva Reserva',
      message: `Nueva reserva: ${reservationData.service_title || 'Servicio'} para ${reservationData.guests || 1} personas`,
      type: 'reservation' as const,
      data: reservationData
    }))

    // Crear notificaciones para todos los admins
    const results = await Promise.all(
      notifications.map(notification => this.createNotification(notification))
    )

    return results.every(result => result)
  }

  async notifyPaymentConfirmed(paymentData: any): Promise<boolean> {
    const adminUsers = await this.getAdminUsers()
    
    const notifications = adminUsers.map(adminId => ({
      user_id: adminId,
      title: 'Pago Confirmado',
      message: `Pago de €${paymentData.amount || '0'} confirmado para reserva #${paymentData.reservation_id || 'N/A'}`,
      type: 'payment' as const,
      data: paymentData
    }))

    const results = await Promise.all(
      notifications.map(notification => this.createNotification(notification))
    )

    return results.every(result => result)
  }

  async notifyChatMessage(chatData: any): Promise<boolean> {
    const adminUsers = await this.getAdminUsers()
    
    const notifications = adminUsers.map(adminId => ({
      user_id: adminId,
      title: 'Nuevo Mensaje de Chat',
      message: `Nuevo mensaje de ${chatData.user_name || 'Usuario'}: ${chatData.message?.substring(0, 50) || ''}...`,
      type: 'chat' as const,
      data: chatData
    }))

    const results = await Promise.all(
      notifications.map(notification => this.createNotification(notification))
    )

    return results.every(result => result)
  }

  async notifySystemEvent(eventData: any): Promise<boolean> {
    const adminUsers = await this.getAdminUsers()
    
    const notifications = adminUsers.map(adminId => ({
      user_id: adminId,
      title: eventData.title || 'Evento del Sistema',
      message: eventData.message || 'Se ha producido un evento en el sistema',
      type: 'system' as const,
      data: eventData
    }))

    const results = await Promise.all(
      notifications.map(notification => this.createNotification(notification))
    )

    return results.every(result => result)
  }

  async notifyError(errorData: any): Promise<boolean> {
    const adminUsers = await this.getAdminUsers()
    
    const notifications = adminUsers.map(adminId => ({
      user_id: adminId,
      title: 'Error del Sistema',
      message: errorData.message || 'Se ha producido un error en el sistema',
      type: 'error' as const,
      data: errorData
    }))

    const results = await Promise.all(
      notifications.map(notification => this.createNotification(notification))
    )

    return results.every(result => result)
  }

  async notifySuccess(successData: any): Promise<boolean> {
    const adminUsers = await this.getAdminUsers()
    
    const notifications = adminUsers.map(adminId => ({
      user_id: adminId,
      title: successData.title || 'Operación Exitosa',
      message: successData.message || 'La operación se completó correctamente',
      type: 'success' as const,
      data: successData
    }))

    const results = await Promise.all(
      notifications.map(notification => this.createNotification(notification))
    )

    return results.every(result => result)
  }

  // Obtener usuarios administradores
  private async getAdminUsers(): Promise<string[]> {
    try {
      if (!this.supabase) {
        await this.initializeSupabase()
      }

      if (!this.supabase) {
        return []
      }

      const { data: profiles, error } = await this.supabase
        .from('profiles')
        .select('id')
        .in('role', ['admin', 'staff'])

      if (error) {
        return []
      }

      return profiles?.map((profile: any) => profile.id) || []
    } catch (error) {
      return []
    }
  }

  // Limpiar notificaciones antiguas
  async cleanupOldNotifications(retentionDays: number = 30): Promise<boolean> {
    try {
      if (!this.supabase) {
        await this.initializeSupabase()
      }

      if (!this.supabase) {
        return false
      }

      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

      const { error } = await this.supabase
        .from('notifications')
        .delete()
        .lt('created_at', cutoffDate.toISOString())

      if (error) {
        return false
      }

      return true
    } catch (error) {
      return false
    }
  }
}

// Exportar instancia singleton
export const notificationService = NotificationService.getInstance()

// Funciones de conveniencia para usar en APIs
export async function createNotification(data: NotificationData): Promise<boolean> {
  return notificationService.createNotification(data)
}

export async function notifyNewReservation(reservationData: any): Promise<boolean> {
  return notificationService.notifyNewReservation(reservationData)
}

export async function notifyPaymentConfirmed(paymentData: any): Promise<boolean> {
  return notificationService.notifyPaymentConfirmed(paymentData)
}

export async function notifyChatMessage(chatData: any): Promise<boolean> {
  return notificationService.notifyChatMessage(chatData)
}

export async function notifySystemEvent(eventData: any): Promise<boolean> {
  return notificationService.notifySystemEvent(eventData)
}

export async function notifyError(errorData: any): Promise<boolean> {
  return notificationService.notifyError(errorData)
}

export async function notifySuccess(successData: any): Promise<boolean> {
  return notificationService.notifySuccess(successData)
}

export async function cleanupOldNotifications(retentionDays: number = 30): Promise<boolean> {
  return notificationService.cleanupOldNotifications(retentionDays)
}
