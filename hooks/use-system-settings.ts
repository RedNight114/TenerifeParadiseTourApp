import { useState, useEffect, useCallback } from 'react'

interface SystemSetting {
  value: any
  type: string
  category: string
  description: string
  is_public: boolean
}

export function useSystemSettings() {
  const [settings, setSettings] = useState<Record<string, SystemSetting>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar configuraciones
  const loadSettings = useCallback(async (category?: string, publicOnly = false) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      if (publicOnly) params.append('public_only', 'true')

      const response = await fetch(`/api/settings?${params.toString()}`)
      if (!response.ok) throw new Error('Error cargando configuraciones')

      const data = await response.json()
      setSettings(data.settings || {})
    } catch (err) {
      setError('Error cargando configuraciones del sistema')
    } finally {
      setLoading(false)
    }
  }, [])

  // Obtener valor de configuración
  const getSetting = useCallback((key: string, defaultValue?: any) => {
    return settings[key]?.value ?? defaultValue
  }, [settings])

  // Verificar si una configuración está habilitada
  const isEnabled = useCallback((key: string) => {
    return getSetting(key, false) === true
  }, [getSetting])

  // Obtener configuración como número
  const getNumberSetting = useCallback((key: string, defaultValue = 0) => {
    const value = getSetting(key, defaultValue)
    return typeof value === 'number' ? value : parseFloat(value) || defaultValue
  }, [getSetting])

  // Obtener configuración como JSON
  const getJsonSetting = useCallback((key: string, defaultValue = {}) => {
    const value = getSetting(key, defaultValue)
    if (typeof value === 'object') return value
    try {
      return JSON.parse(value) || defaultValue
    } catch {
      return defaultValue
    }
  }, [getSetting])

  // Actualizar configuración
  const updateSetting = useCallback(async (key: string, value: any) => {
    try {
      const setting = settings[key]
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, type: setting?.type })
      })

      if (!response.ok) throw new Error('Error actualizando configuración')

      // Actualizar estado local
      setSettings(prev => ({
        ...prev,
        [key]: { ...prev[key], value }
      }))

      return true
    } catch (err) {
      return false
    }
  }, [settings])

  // Cargar configuraciones al montar
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // Configuraciones específicas comunes
  const siteName = getSetting('site_name', 'Tenerife Paradise Tours')
  const siteDescription = getSetting('site_description', 'Tours y excursiones en Tenerife')
  const adminEmail = getSetting('admin_email', 'admin@tenerife-paradise.com')
  const maxReservationsPerUser = getNumberSetting('max_reservations_per_user', 5)
  const bookingAdvanceDays = getNumberSetting('booking_advance_days', 30)
  const enableChat = isEnabled('enable_chat')
  const enableNotifications = isEnabled('enable_notifications')
  const maintenanceMode = isEnabled('maintenance_mode')
  const defaultCurrency = getSetting('default_currency', 'EUR')
  const paymentMethods = getJsonSetting('payment_methods', ['card', 'paypal', 'bank_transfer'])
  const notificationRetentionDays = getNumberSetting('notification_retention_days', 30)
  const autoConfirmReservations = isEnabled('auto_confirm_reservations')

  return {
    settings,
    loading,
    error,
    loadSettings,
    getSetting,
    isEnabled,
    getNumberSetting,
    getJsonSetting,
    updateSetting,
    // Configuraciones específicas
    siteName,
    siteDescription,
    adminEmail,
    maxReservationsPerUser,
    bookingAdvanceDays,
    enableChat,
    enableNotifications,
    maintenanceMode,
    defaultCurrency,
    paymentMethods,
    notificationRetentionDays,
    autoConfirmReservations
  }
}
