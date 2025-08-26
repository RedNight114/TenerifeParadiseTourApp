'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { ChatService } from '@/lib/chat-service'
import { Conversation, Message, ConversationParticipant } from '@/lib/types/chat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EnhancedAvatar } from '@/components/ui/enhanced-avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageCircle, 
  Send, 
  Plus,
  Search,
  LogOut,
  Shield,
  Circle,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Trash2,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChatMessages } from '@/components/chat/chat-messages'
import '@/styles/admin-chat-avatars.css'

interface AdminChatDashboardProps {
  showHeader?: boolean
  showNavbar?: boolean
}

export function AdminChatDashboard({ showHeader = true, showNavbar = true }: AdminChatDashboardProps) {
  const { user, profile, logout } = useAuth()
  const [unassignedConversations, setUnassignedConversations] = useState<Conversation[]>([])
  const [assignedConversations, setAssignedConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [participants, setParticipants] = useState<ConversationParticipant[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('pending')

  // Cargar conversaciones
  const loadConversations = useCallback(async () => {
    if (!user?.id) {
return
    }

    try {


setIsLoading(true)
      setError(null)

      // Llamar a las funciones del servicio con más logging
      console.log('Cargando conversaciones no asignadas...')
      const pending = await ChatService.getUnassignedConversations()

      console.log('Cargando conversaciones del admin...')
      const read = await ChatService.getAdminConversations(user.id)
// Debug: Verificar la estructura de los datos
      if (pending && pending.length > 0) {
}

      // Verificar que los datos sean arrays válidos
      const validPending = Array.isArray(pending) ? pending : []
      const validRead = Array.isArray(read) ? read : []
setUnassignedConversations(validPending)
      setAssignedConversations(validRead)
    } catch (err: any) {

setError(`Error al cargar conversaciones: ${err?.message || 'Error desconocido'}`)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, profile])

  // Asignar conversación a sí mismo
  const assignConversation = useCallback(async (conversationId: string) => {
    if (!user?.id) return

    try {
      setError(null)
      const updatedConversation = await ChatService.assignAdminToConversation(conversationId, user.id)
      
      // Actualizar listas
      setUnassignedConversations(prev => prev.filter(c => c.id !== conversationId))
      setAssignedConversations(prev => [updatedConversation, ...prev])
      
      // Seleccionar la conversación asignada
      setActiveConversation(updatedConversation)
      await loadMessages(conversationId)
    } catch (err) {
      setError('Error al asignar conversación')
}
  }, [user?.id])

  // Cargar mensajes de una conversación
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      setError(null)
      const [conversationMessages, conversationParticipants] = await Promise.all([
        ChatService.getConversationMessages(conversationId),
        ChatService.getConversationParticipants(conversationId)
      ])
      
      setMessages(conversationMessages)
      setParticipants(conversationParticipants)
    } catch (err) {
      setError('Error al cargar mensajes')
}
  }, [])

  // Seleccionar conversación
  const selectConversation = useCallback(async (conversation: Conversation) => {
    setActiveConversation(conversation)
    await loadMessages(conversation.id)
  }, [loadMessages])

  // Enviar mensaje
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation?.id || !user?.id) return

    try {
      setError(null)
      const message = await ChatService.sendMessage(
        {
          conversation_id: activeConversation.id,
          content: newMessage.trim()
        },
        user.id
      )

      setMessages(prev => [...prev, message])
      setNewMessage('')
      
      // Actualizar conversación en la lista
      setAssignedConversations(prev => prev.map(conv => 
        conv.id === activeConversation.id 
          ? { ...conv, last_message: message, last_message_at: message.created_at }
          : conv
      ))
    } catch (err) {
      setError('Error al enviar mensaje')
}
  }

  // Marcar conversación como leída
  const markAsRead = async (conversation: Conversation) => {
    try {
      // Aquí implementarías la lógica para marcar como leída
      // Por ahora, movemos la conversación de pendiente a leída
      setUnassignedConversations(prev => prev.filter(c => c.id !== conversation.id))
      setAssignedConversations(prev => [conversation, ...prev])
      setActiveConversation(null)
      setMessages([])
    } catch (err) {
      setError('Error al marcar como leída')
}
  }

  // Eliminar conversación
  const deleteConversation = async (conversation: Conversation) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta conversación? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      // Eliminar la conversación usando el servicio real
      await ChatService.deleteConversation(conversation.id)
      
      // Notificar a todos los usuarios conectados que la conversación se eliminó
      await ChatService.notifyConversationDeleted(conversation.id)
      
      // Remover del estado local
      setUnassignedConversations(prev => prev.filter(c => c.id !== conversation.id))
      setAssignedConversations(prev => prev.filter(c => c.id !== conversation.id))
      
      // Cerrar la conversación activa si es la que se eliminó
      if (activeConversation?.id === conversation.id) {
        setActiveConversation(null)
        setMessages([])
        setParticipants([])
      }
} catch (err: any) {
      setError(`Error al eliminar conversación: ${err.message || 'Error desconocido'}`)
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

  // Logs de debug para el renderizado
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
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {showHeader && (
        <>
          {/* Header mejorado */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
                  <p className="text-sm text-gray-600">TenerifeParadiseTour&Excursions</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <EnhancedAvatar 
                    src={profile?.avatar_url} 
                    alt={`Avatar de ${profile?.full_name || 'Administrador'}`}
                    className="h-12 w-12 border-3 border-green-300 shadow-lg admin-header-avatar avatar-fade-in"
                  />
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{profile?.full_name || 'Administrador'}</p>
                    <p className="text-xs text-gray-500">{profile?.email}</p>
                    <div className="flex items-center gap-1 mt-1 online-indicator">
                      <Circle className="h-2 w-2 text-green-500 fill-current" />
                      <span className="text-xs text-green-600 font-medium">En línea</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={logout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>

          {/* Estadísticas del chat */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-900">{filteredPending.length + filteredRead.length}</p>
                    <p className="text-sm text-blue-600">Total Conversaciones</p>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-900">{filteredPending.length}</p>
                    <p className="text-sm text-orange-600">Pendientes</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-900">{filteredRead.length}</p>
                    <p className="text-sm text-green-600">Leídas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex-1 flex gap-6 p-6">
        {/* Panel izquierdo - Lista de conversaciones */}
        <div className="w-1/3 flex flex-col">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, email o título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <Button
                onClick={() => loadConversations()}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="flex-shrink-0"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 mt-4">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1">
              <TabsTrigger 
                value="pending" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Pendientes ({filteredPending.length})
              </TabsTrigger>
              <TabsTrigger 
                value="read" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Leídas ({filteredRead.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="flex-1 mt-4">
              <ScrollArea className="h-[600px] pr-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Cargando conversaciones...</p>
                    </div>
                  </div>
                ) : filteredPending.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-base font-medium text-gray-700 mb-2">No hay conversaciones pendientes</p>
                    <p className="text-sm text-gray-500">Todas las conversaciones han sido leídas o no hay conversaciones activas</p>
                  </div>
                ) : (
                  filteredPending.map((conversation) => (
                    <Card
                      key={conversation.id}
                      className={cn(
                        "mb-3 cursor-pointer hover:shadow-md transition-all duration-200 border-gray-200",
                        activeConversation?.id === conversation.id && "ring-2 ring-purple-500 bg-purple-50"
                      )}
                      onClick={() => selectConversation(conversation)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <EnhancedAvatar 
                                src={conversation.user_avatar_url} 
                                alt={`Avatar de ${conversation.user_full_name || conversation.user_email}`}
                                className="h-8 w-8 conversation-user-avatar avatar-fade-in"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-gray-900 truncate">
                                  {conversation.title}
                                </h4>
                                <p className="text-xs text-gray-500 truncate">
                                  {conversation.user_full_name || conversation.user_email}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge 
                                variant={conversation.priority === 'urgent' ? 'destructive' : 
                                       conversation.priority === 'high' ? 'default' : 'secondary'} 
                                className="text-xs"
                              >
                                {conversation.priority === 'urgent' ? 'Urgente' :
                                 conversation.priority === 'high' ? 'Alta' :
                                 conversation.priority === 'normal' ? 'Normal' : 'Baja'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                General
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-400">
                              {new Date(conversation.created_at).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(conversation)
                              }}
                              className="h-7 px-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              <Eye className="h-3 w-3 mr-1.5" />
                              Leída
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteConversation(conversation)
                              }}
                              className="h-7 px-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              <Trash2 className="h-3 w-3 mr-1.5" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="read" className="flex-1 mt-4">
              <ScrollArea className="h-[600px] pr-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Cargando conversaciones...</p>
                    </div>
                  </div>
                ) : filteredRead.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-base font-medium text-gray-700 mb-2">No hay conversaciones leídas</p>
                    <p className="text-sm text-gray-500">Marca conversaciones como leídas para verlas aquí</p>
                  </div>
                ) : (
                  filteredRead.map((conversation) => (
                    <Card
                      key={conversation.id}
                      className={cn(
                        "mb-3 cursor-pointer hover:shadow-md transition-all duration-200 border-gray-200",
                        activeConversation?.id === conversation.id && "ring-2 ring-purple-500 bg-purple-50"
                      )}
                      onClick={() => selectConversation(conversation)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <EnhancedAvatar 
                                src={conversation.user_avatar_url} 
                                alt={`Avatar de ${conversation.user_full_name || conversation.user_email}`}
                                className="h-8 w-8 conversation-user-avatar avatar-fade-in"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-gray-900 truncate">
                                  {conversation.title}
                                </h4>
                                <p className="text-xs text-gray-500 truncate">
                                  {conversation.user_full_name || conversation.user_email}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge 
                                variant={conversation.priority === 'urgent' ? 'destructive' : 
                                       conversation.priority === 'high' ? 'default' : 'secondary'} 
                                className="text-xs"
                              >
                                {conversation.priority === 'urgent' ? 'Urgente' :
                                 conversation.priority === 'high' ? 'Alta' :
                                 conversation.priority === 'normal' ? 'Normal' : 'Baja'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                General
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                {conversation.status}
                              </Badge>
                            </div>
                            {conversation.last_message && (
                              <p className="text-xs text-gray-500 mt-1 truncate">
                                Último: {conversation.last_message.content}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(conversation.updated_at).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteConversation(conversation)
                              }}
                              className="h-7 px-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              <Trash2 className="h-3 w-3 mr-1.5" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Panel derecho - Chat activo */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Header de la conversación mejorado */}
              <Card className="mb-4 border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <EnhancedAvatar 
                        src={activeConversation.user_avatar_url} 
                        alt={`Avatar de ${activeConversation.user_full_name || activeConversation.user_email}`}
                        className="h-12 w-12 active-conversation-avatar avatar-fade-in"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{activeConversation.title}</h3>
                        <p className="text-sm text-gray-600">
                          {activeConversation.user_full_name || activeConversation.user_email}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={activeConversation.priority === 'urgent' ? 'destructive' : 
                                   activeConversation.priority === 'high' ? 'default' : 'secondary'} 
                            className="text-xs"
                          >
                            {activeConversation.priority === 'urgent' ? 'Urgente' :
                             activeConversation.priority === 'high' ? 'Alta' :
                             activeConversation.priority === 'normal' ? 'Normal' : 'Baja'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            General
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            {activeConversation.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        Creada: {new Date(activeConversation.created_at).toLocaleDateString('es-ES')}
                      </p>
                      <p className="text-xs text-gray-500">
                        Última: {new Date(activeConversation.updated_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mensajes del chat usando el nuevo componente */}
              <Card className="flex-1 mb-4 border-gray-200">
                <CardContent className="p-4 h-[500px] flex flex-col">
                  <ChatMessages 
                    messages={messages}
                    currentUserId={user.id}
                    isLoading={false}
                    className="flex-1"
                  />

                  {/* Input para enviar mensaje mejorado */}
                  <div className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Input
                      placeholder="Escribe tu respuesta..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={!newMessage.trim()}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Enviar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="flex-1 border-gray-200">
              <CardContent className="p-6 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50 text-gray-400" />
                  <p className="text-lg font-medium text-gray-600 mb-2">Selecciona una conversación</p>
                  <p className="text-sm text-gray-500">Elige una conversación del panel izquierdo para comenzar a chatear</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Mensaje de error mejorado */}
      {error && (
        <div className="px-6 pb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

