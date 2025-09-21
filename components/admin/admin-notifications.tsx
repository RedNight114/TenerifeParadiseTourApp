"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Bell, X, Check, AlertCircle, Info, CheckCircle, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { createClient } from '@supabase/supabase-js'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'reservation' | 'payment' | 'chat' | 'system'
  time: string
  read: boolean
  created_at: string
  data?: any
}

interface AdminNotificationsProps {
  className?: string
}

export function AdminNotifications({ className }: AdminNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  // Función para formatear tiempo relativo
  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Hace unos segundos'
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`
    return `Hace ${Math.floor(diffInSeconds / 86400)} días`
  }

  // Cargar notificaciones
  const loadNotifications = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    setError(null)

    try {
      // Por ahora, hacer la petición sin autenticación para probar
      const headers: HeadersInit = {}

      const response = await fetch('/api/notifications?limit=20', {
        headers
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error cargando notificaciones: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      
      // Formatear notificaciones
      const formattedNotifications = data.notifications?.map((notification: any) => ({
        ...notification,
        time: formatTimeAgo(notification.created_at)
      })) || []

      setNotifications(formattedNotifications)
    } catch (err) {
      setError('Error cargando notificaciones')
    } finally {
      if (showLoading) setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Marcar notificación como leída
  const markAsRead = async (id: string) => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ notification_id: id })
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        )
      }
    } catch (err) {
      }
  }

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ mark_all: true })
      })

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      }
    } catch (err) {
      }
  }

  // Refrescar notificaciones
  const refreshNotifications = () => {
    setRefreshing(true)
    loadNotifications(false)
  }

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  // Actualizar notificaciones cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen) { // Solo actualizar si el panel no está abierto
        loadNotifications(false)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [isOpen, loadNotifications])

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'reservation':
        return <Bell className="w-4 h-4 text-blue-500" />
      case 'payment':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'chat':
        return <AlertCircle className="w-4 h-4 text-purple-500" />
      case 'system':
        return <Info className="w-4 h-4 text-gray-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs p-0"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel de notificaciones */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notificaciones</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshNotifications}
                  disabled={refreshing}
                  className="p-1 h-auto"
                >
                  <RefreshCw className={cn("w-3 h-3", refreshing && "animate-spin")} />
                </Button>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Marcar todas como leídas
                  </Button>
                )}
              </div>
            </div>
          </div>
            
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-blue-500" />
                  <p>Cargando notificaciones...</p>
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm">{error}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => loadNotifications()}
                    className="mt-2"
                  >
                    Reintentar
                  </Button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No hay notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 hover:bg-gray-50 transition-colors",
                        !notification.read && "bg-blue-50/50"
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={cn(
                              "text-sm font-medium",
                              !notification.read ? "text-gray-900" : "text-gray-700"
                            )}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.time}
                          </p>
                        </div>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="flex-shrink-0 p-1 h-auto"
                          >
                            <Check className="w-3 h-3 text-gray-400" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-gray-600 hover:text-gray-700"
              >
                Ver todas las notificaciones
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}