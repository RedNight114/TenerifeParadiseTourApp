"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Users, Clock, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Conversation {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  status: string
  profiles?: {
    full_name: string
    email: string
  }[]
}

export default function AdminChatDashboardSimple() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadConversations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { getSupabaseClient } = await import("@/lib/supabase-unified")
      const supabase = await getSupabaseClient()
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          user_id,
          created_at,
          updated_at,
          status,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setConversations(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando conversaciones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConversations()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Activa</Badge>
      case 'closed':
        return <Badge variant="secondary">Cerrada</Badge>
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">Cargando conversaciones...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Chat de Administración</h2>
          <p className="text-gray-600">Gestiona las conversaciones con usuarios</p>
        </div>
        <Button onClick={loadConversations}>
          <MessageSquare className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{conversations.length}</div>
            <p className="text-xs text-muted-foreground">Total Conversaciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {conversations.filter(c => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Activas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {conversations.filter(c => c.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Conversations List */}
      <Card>
        <CardHeader>
          <CardTitle>Conversaciones Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {conversations.length > 0 ? (
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <div key={conversation.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {conversation.profiles?.[0]?.full_name || 'Usuario'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {conversation.profiles?.[0]?.email || 'Sin email'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Última actividad: {new Date(conversation.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="mb-2">
                      {getStatusBadge(conversation.status)}
                    </div>
                    <Button size="sm">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Abrir Chat
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay conversaciones disponibles</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
