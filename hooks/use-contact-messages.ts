"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase-unified"

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  created_at: string
  status: "pending" | "read" | "replied"
}

export function useContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError(null)

      const client = await getSupabaseClient()
      
      if (!client) {
        throw new Error('No se pudo obtener el cliente de Supabase')
      }

      const { data, error } = await client
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setMessages(data || [])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      const client = await getSupabaseClient()
      
      if (!client) {
        throw new Error('No se pudo obtener el cliente de Supabase')
      }

      const { error } = await client
        .from('contact_messages')
        .update({ read: true })
        .eq('id', messageId)

      if (error) {
        throw error
      }

      // Actualizar estado local
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(errorMessage)
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      const client = await getSupabaseClient()
      
      if (!client) {
        throw new Error('No se pudo obtener el cliente de Supabase')
      }

      const { error } = await client
        .from('contact_messages')
        .delete()
        .eq('id', messageId)

      if (error) {
        throw error
      }

      // Actualizar estado local
      setMessages(prev => prev.filter(msg => msg.id !== messageId))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(errorMessage)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  return {
    messages,
    loading,
    error,
    fetchMessages,
    markAsRead,
    deleteMessage,
  }
} 
