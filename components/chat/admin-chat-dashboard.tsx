"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageCircle, Search, Trash2, Eye, Clock, User, Mail } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

// Tipos simplificados
interface Conversation {
  id: string
  title: string
  user_id: string
  status: 'active' | 'waiting' | 'closed' | 'archived'
  priority: 'low' | 'medium' | 'high'
  created_at: string
  updated_at: string
  last_message_at: string
  unread_count: number
  user_full_name: string
  user_email: string
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: 'system' | 'text' | 'image' | 'file' | 'notification'
  metadata: Record<string, any>
  created_at: string
  is_read: boolean
  sender_full_name: string
  sender_email: string
}

interface AdminChatDashboardProps {
  showHeader?: boolean
  showNavbar?: boolean
}

export default function AdminChatDashboard({ showHeader = true, showNavbar = true }: AdminChatDashboardProps) {
  const { user, profile } = useAuth()
  const [unassignedConversations, setUnassignedConversations] = useState<Conversation[]>([])
  const [assignedConversations, setAssignedConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [participants, setParticipants] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar conversaciones
  const loadConversations = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('🔍 Chat: Cargando conversaciones...')
      const response = await fetch('/api/chat/v3/conversations', {
        method: 'GET',
        credentials: 'include', // Incluir cookies de autenticación
        headers: {
          'Content-Type': 'application/json',
        },
      })
      console.log('🔍 Chat: Respuesta recibida:', response.status, response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Chat: Datos recibidos:', data)
        
        // Separar conversaciones por estado
        const unassigned = data.conversations.filter((conv: Conversation) => conv.status === 'waiting')
        const assigned = data.conversations.filter((conv: Conversation) => conv.status === 'active')
        
        console.log('🔍 Chat: Conversaciones sin asignar:', unassigned.length)
        console.log('🔍 Chat: Conversaciones asignadas:', assigned.length)
        
        setUnassignedConversations(unassigned)
        setAssignedConversations(assigned)
      } else {
        const errorText = await response.text()
        console.error('🔍 Chat: Error en respuesta:', response.status, errorText)
        setError('Error cargando conversaciones')
      }
    } catch (err: unknown) {
      console.error('🔍 Chat: Error en carga:', err)
      setError(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Cargar mensajes de una conversación
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/v3/messages?conversation_id=${conversationId}`, {
        method: 'GET',
        credentials: 'include', // Incluir cookies de autenticación
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (err: unknown) {
      console.error('Error cargando mensajes:', err)
    }
  }, [])

  // Seleccionar conversación
  const selectConversation = useCallback(async (conversation: Conversation) => {
    setActiveConversation(conversation)
    await loadMessages(conversation.id)
  }, [loadMessages])

  // Eliminar conversación
  const deleteConversation = async (conversation: Conversation) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/chat/v3/conversations/${conversation.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Remover del estado local
        setUnassignedConversations(prev => prev.filter(c => c.id !== conversation.id))
        setAssignedConversations(prev => prev.filter(c => c.id !== conversation.id))
        
        // Cerrar la conversación activa si es la que se eliminó
        if (activeConversation?.id === conversation.id) {
          setActiveConversation(null)
          setMessages([])
          setParticipants([])
        }
      } else {
        setError('Error al eliminar conversación')
      }
    } catch (err: unknown) {
      setError(`Error al eliminar conversación: ${err instanceof Error ? err.message : 'Error desconocido'}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar conversaciones por búsqueda
  const filteredPending = unassignedConversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredRead = assignedConversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Cargar conversaciones al montar el componente
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Debes iniciar sesión para acceder al panel de administración del chat.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      {showHeader && (
        <>
          {/* Header mejorado */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Panel de Administración del Chat</h1>
                  <p className="text-sm text-gray-500">Gestiona las conversaciones de soporte</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {unassignedConversations.length} Pendientes
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {assignedConversations.length} Activas
                </Badge>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Panel izquierdo - Lista de conversaciones */}
        <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col">
          {/* Barra de búsqueda */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar conversaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabs para diferentes estados */}
          <Tabs defaultValue="pending" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pendientes ({filteredPending.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Activas ({filteredRead.length})
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="pending" className="m-0 h-full">
                <div className="p-4 space-y-2">
                  {filteredPending.map((conversation) => (
                    <Card
                      key={conversation.id}
                      className={`cursor-pointer transition-colors ${
                        activeConversation?.id === conversation.id
                          ? 'ring-2 ring-purple-500 bg-purple-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => selectConversation(conversation)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {conversation.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <User className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500 truncate">
                                {conversation.user_full_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500 truncate">
                                {conversation.user_email}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {conversation.unread_count > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unread_count}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {conversation.priority}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="active" className="m-0 h-full">
                <div className="p-4 space-y-2">
                  {filteredRead.map((conversation) => (
                    <Card
                      key={conversation.id}
                      className={`cursor-pointer transition-colors ${
                        activeConversation?.id === conversation.id
                          ? 'ring-2 ring-purple-500 bg-purple-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => selectConversation(conversation)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {conversation.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <User className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500 truncate">
                                {conversation.user_full_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500 truncate">
                                {conversation.user_email}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {conversation.unread_count > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unread_count}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {conversation.priority}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Panel derecho - Detalles de la conversación */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Header de la conversación */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {activeConversation.title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {activeConversation.user_full_name} • {activeConversation.user_email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {activeConversation.priority}
                    </Badge>
                    <Badge variant="secondary">
                      {activeConversation.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteConversation(activeConversation)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === user.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(message.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecciona una conversación
                </h3>
                <p className="text-gray-500">
                  Elige una conversación de la lista para ver los mensajes
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Cargando...</p>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  )
}