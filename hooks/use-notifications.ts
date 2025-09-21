import { useCallback } from 'react'

interface CreateNotificationParams {
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'reservation' | 'payment' | 'chat' | 'system'
  data?: any
  user_id?: string
}

export function useNotifications() {
  const createNotification = useCallback(async (params: CreateNotificationParams) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        return false
      }

      return true
    } catch (error) {
      return false
    }
  }, [])

  // Funciones específicas para diferentes tipos de notificaciones
  const notifyNewReservation = useCallback((reservationData: any) => {
    return createNotification({
      title: 'Nueva Reserva',
      message: `Nueva reserva recibida: ${reservationData.service_title || 'Servicio'} para ${reservationData.guests || 1} personas`,
      type: 'reservation',
      data: reservationData
    })
  }, [createNotification])

  const notifyPaymentConfirmed = useCallback((paymentData: any) => {
    return createNotification({
      title: 'Pago Confirmado',
      message: `Pago de €${paymentData.amount || '0'} confirmado para la reserva #${paymentData.reservation_id || 'N/A'}`,
      type: 'payment',
      data: paymentData
    })
  }, [createNotification])

  const notifyChatMessage = useCallback((chatData: any) => {
    return createNotification({
      title: 'Nuevo Mensaje de Chat',
      message: `Nuevo mensaje de ${chatData.user_name || 'Usuario'}: ${chatData.message?.substring(0, 50) || ''}...`,
      type: 'chat',
      data: chatData
    })
  }, [createNotification])

  const notifySystemEvent = useCallback((eventData: any) => {
    return createNotification({
      title: eventData.title || 'Evento del Sistema',
      message: eventData.message || 'Se ha producido un evento en el sistema',
      type: 'system',
      data: eventData
    })
  }, [createNotification])

  const notifyError = useCallback((errorData: any) => {
    return createNotification({
      title: 'Error del Sistema',
      message: errorData.message || 'Se ha producido un error en el sistema',
      type: 'error',
      data: errorData
    })
  }, [createNotification])

  const notifySuccess = useCallback((successData: any) => {
    return createNotification({
      title: successData.title || 'Operación Exitosa',
      message: successData.message || 'La operación se completó correctamente',
      type: 'success',
      data: successData
    })
  }, [createNotification])

  return {
    createNotification,
    notifyNewReservation,
    notifyPaymentConfirmed,
    notifyChatMessage,
    notifySystemEvent,
    notifyError,
    notifySuccess
  }
}
