"use client"

import { useState, useCallback, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone?: string
  service?: string
  date?: string
  guests?: number
  message: string
  user_agent?: string
  ip_address?: string
  status: 'new' | 'read' | 'replied' | 'archived'
  admin_notes?: string
  created_at: string
  updated_at: string
}

interface UseContactMessagesOptions {
  status?: string
  page?: number
  limit?: number
}

export function useContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const fetchMessages = useCallback(async (options: UseContactMessagesOptions = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const { status, page = 1, limit = 50 } = options
      
      let query = supabase
        .from("contact_messages")
        .select('*', { count: 'exact' })
        .order("created_at", { ascending: false })

      if (status && status !== 'all') {
        query = query.eq("status", status)
      }

      // Paginación
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      const { data, error: fetchError, count } = await query

      if (fetchError) {
        throw fetchError
      }

      setMessages((data || []).map((msg: any) => ({
        id: String(msg.id),
        name: String(msg.name),
        email: String(msg.email),
        phone: msg.phone ? String(msg.phone) : undefined,
        service: msg.service ? String(msg.service) : undefined,
        date: msg.date ? String(msg.date) : undefined,
        guests: msg.guests ? (isNaN(Number(msg.guests)) ? undefined : Number(msg.guests)) : undefined,
        message: String(msg.message),
        user_agent: msg.user_agent ? String(msg.user_agent) : undefined,
        ip_address: msg.ip_address ? String(msg.ip_address) : undefined,
        status: msg.status as 'new' | 'read' | 'replied' | 'archived',
        admin_notes: msg.admin_notes ? String(msg.admin_notes) : undefined,
        created_at: String(msg.created_at),
        updated_at: String(msg.updated_at),
      })))
      
      setTotalCount(count || 0)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar mensajes"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateMessageStatus = useCallback(async (id: string, status: string, adminNotes?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const updates: any = { status }
      if (adminNotes !== undefined) {
        updates.admin_notes = adminNotes
      }
      
      const { error: updateError } = await supabase
        .from("contact_messages")
        .update(updates)
        .eq("id", id)

      if (updateError) {
        throw updateError
      }

      // Actualizar el mensaje en el estado local
      setMessages((prev) => prev.map((msg) => 
        msg.id === id 
          ? { ...msg, status: status as any, admin_notes: adminNotes, updated_at: new Date().toISOString() }
          : msg
      ))

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar mensaje"
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteMessage = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error: deleteError } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", id)

      if (deleteError) {
        throw deleteError
      }

      // Eliminar el mensaje del estado local
      setMessages((prev) => prev.filter((msg) => msg.id !== id))
      setTotalCount((prev) => prev - 1)

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar mensaje"
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const getMessageStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("status")

      if (error) {
        throw error
      }

      const stats = {
        total: data.length,
        new: data.filter((msg: any) => msg.status === 'new').length,
        read: data.filter((msg: any) => msg.status === 'read').length,
        replied: data.filter((msg: any) => msg.status === 'replied').length,
        archived: data.filter((msg: any) => msg.status === 'archived').length,
      }

      return stats
    } catch (err) {
      console.error('Error obteniendo estadísticas:', err)
      return {
        total: 0,
        new: 0,
        read: 0,
        replied: 0,
        archived: 0,
      }
    }
  }, [])

  // Cargar mensajes automáticamente al inicializar el hook
  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  return {
    messages,
    loading,
    error,
    totalCount,
    fetchMessages,
    updateMessageStatus,
    deleteMessage,
    getMessageStats,
  }
} 