'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAuthContext } from '@/components/auth-provider'
import { ChatServiceRefactored } from '@/lib/services/chat-service-refactored'
import { Conversation, Message, ConversationParticipant } from '@/lib/types/chat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EnhancedAvatar } from '@/components/ui/enhanced-avatar'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  Eye,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Star,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Archive,
  Tag,
  Filter,
  SortAsc,
  SortDesc,
  Download,
  Upload,
  Settings,
  Bell,
  BellOff,
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Zap,
  Heart,
  Smile,
  Frown,
  Meh,
  Minus,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  RotateCw,
  Copy,
  Edit,
  Save,
  Share,
  Link,
  ExternalLink,
  Maximize,
  Minimize,
  Move,
  GripVertical,
  MoreHorizontal,
  Dot,
  Square,
  Triangle,
  Diamond,
  Hexagon,
  Octagon,
  Pentagon
} from 'lucide-react'
import { DeleteButton } from '@/components/ui/delete-button'
import { ConversationActionButtons } from '@/components/ui/responsive-action-buttons'
import { cn } from '@/lib/utils'
import { UnifiedChatWidget } from '@/components/chat/unified-chat-widget'
import '@/styles/admin-chat-avatars.css'

interface AdminChatDashboardProps {
  showHeader?: boolean
  showNavbar?: boolean
}

function AdminChatDashboard({ showHeader = true, showNavbar = true }: AdminChatDashboardProps) {
  const { user, profile, signOut } = useAuthContext()
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll al final cuando lleguen nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cargar conversaciones
  const loadConversations = useCallback(async () => {
    if (!user?.id) {
      return
    }

    try {


setIsLoading(true)
      setError(null)

      // Llamar a las funciones del servicio con más logging
      const allConversations = await ChatServiceRefactored.getInstance().getAllConversations()
      
      // Filtrar conversaciones no asignadas (sin admin_id)
      const pending = allConversations.data?.filter(conv => !conv.admin_id) || []
      
      // Filtrar conversaciones asignadas al admin actual
      const read = allConversations.data?.filter(conv => conv.admin_id === user.id) || []
// Debug: Verificar la estructura de los datos
      if (pending && pending.length > 0) {
        }

      // Verificar que los datos sean arrays válidos
      const validPending = Array.isArray(pending) ? pending : []
      const validRead = Array.isArray(read) ? read : []
      
      setUnassignedConversations(validPending)
      setAssignedConversations(validRead)
    } catch (err: unknown) {
      setError(`Error al cargar conversaciones: ${err instanceof Error ? err.message : 'Error desconocido'}`)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, profile])

  // Asignar conversación a sí mismo
  const assignConversation = useCallback(async (conversationId: string) => {
    if (!user?.id) return

    try {
      setError(null)
      // TODO: Implementar actualización de conversación
      // Por ahora, simulamos la actualización
      const updatedConversation = { id: conversationId, admin_id: user.id } as any
      
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
      setIsLoading(true)
      
      const response = await ChatServiceRefactored.getInstance().getConversationMessages(conversationId)
      
      if (response.success) {
        setMessages(response.data || [])
      } else {
        setError(response.error || 'Error al cargar mensajes')
        setMessages([])
      }
      
      // TODO: Implementar carga de participantes
      setParticipants([])
    } catch (err) {
      setError('Error al cargar mensajes')
      setMessages([])
    } finally {
      setIsLoading(false)
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
      const response = await ChatServiceRefactored.getInstance().sendMessage({
        conversation_id: activeConversation.id,
        content: newMessage.trim(),
        message_type: 'text'
      }, user.id)

      if (response.success && response.data) {
        setMessages(prev => [...prev, response.data])
        setNewMessage('')
        
        // Actualizar conversación en la lista
        setAssignedConversations(prev => prev.map(conv => 
          conv.id === activeConversation.id 
            ? { ...conv, last_message: response.data, last_message_at: response.data?.created_at }
            : conv
        ))
        
        setUnassignedConversations(prev => prev.map(conv => 
          conv.id === activeConversation.id 
            ? { ...conv, last_message: response.data, last_message_at: response.data?.created_at }
            : conv
        ))
      } else {
        setError(response.error || 'Error al enviar mensaje')
      }
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

    if (!user?.id) {
      setError('Usuario no autenticado')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      // Llamar al servicio para eliminar la conversación
      const response = await ChatServiceRefactored.getInstance().deleteConversation(
        conversation.id,
        user.id
      )
      
      if (response.success) {
        // Remover del estado local
        setUnassignedConversations(prev => prev.filter(c => c.id !== conversation.id))
        setAssignedConversations(prev => prev.filter(c => c.id !== conversation.id))
        
        // Cerrar la conversación activa si es la que se eliminó
        if (activeConversation?.id === conversation.id) {
          setActiveConversation(null)
          setMessages([])
          setParticipants([])
        }
        
        // Mostrar mensaje de éxito
        } else {
        setError(response.error || 'Error al eliminar conversación')
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
                  onClick={signOut}
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

      <div className="flex-1 flex flex-col lg:flex-row gap-1 lg:gap-2 p-0 min-h-0">
        {/* Panel izquierdo - Lista de conversaciones */}
        <div className={`w-full flex flex-col min-h-0 ${activeConversation ? 'lg:w-1/3' : 'lg:w-full'}`}>
          <div className="mb-0">
            <div className="flex items-center gap-2 mb-0">
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

          <div className="flex-1 flex flex-col min-h-0 mt-0">
            <div className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg mb-4">
              <button
                onClick={() => setActiveTab('pending')}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  activeTab === 'pending' 
                    ? "bg-white shadow-sm text-gray-900" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                Pendientes ({filteredPending.length})
              </button>
              <button
                onClick={() => setActiveTab('read')}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  activeTab === 'read' 
                    ? "bg-white shadow-sm text-gray-900" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                Leídas ({filteredRead.length})
              </button>
            </div>

            {activeTab === 'pending' && (
              <div className="flex-1 flex flex-col min-h-0">
              <ScrollArea className="flex-1 pr-0">
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
                    <div
                      key={conversation.id}
                      className={cn(
                        "mb-2 cursor-pointer transition-all duration-200 border-l-4 border-r border-t border-b rounded-r-lg group",
                        activeConversation?.id === conversation.id 
                          ? "border-l-orange-500 bg-orange-50 shadow-sm" 
                          : "border-l-gray-200 border-gray-100 bg-white hover:border-l-orange-400 hover:bg-orange-50/50"
                      )}
                      onClick={() => selectConversation(conversation)}
                    >
                      <div className="p-3">
                        {/* Header minimalista */}
                        <div className="flex items-center gap-3 mb-2">
                          <div className="relative">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {conversation.user_full_name?.charAt(0) || 'U'}
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm truncate">
                              {conversation.title || 'Nueva consulta'}
                            </h4>
                            <p className="text-xs text-gray-600 truncate">
                              {conversation.user_full_name || 'Usuario'}
                            </p>
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(conversation.created_at).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit'
                            })}
                          </div>
                        </div>

                        {/* Información compacta */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">
                              Pendiente
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                              {(conversation as any).message_count || 0} msgs
                            </span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(conversation)
                              }}
                              className="p-1 text-green-600 hover:bg-green-100 rounded"
                              title="Marcar como leída"
                            >
                              <Eye className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                selectConversation(conversation)
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              title="Abrir chat"
                            >
                              <MessageCircle className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteConversation(conversation)
                              }}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title="Eliminar"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
              </div>
            )}

            {activeTab === 'read' && (
              <div className="flex-1 flex flex-col min-h-0">
              <ScrollArea className="flex-1 pr-0">
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
                    <div
                      key={conversation.id}
                      className={cn(
                        "mb-2 cursor-pointer transition-all duration-200 border-l-4 border-r border-t border-b rounded-r-lg group",
                        activeConversation?.id === conversation.id 
                          ? "border-l-green-500 bg-green-50 shadow-sm" 
                          : "border-l-gray-200 border-gray-100 bg-white hover:border-l-green-400 hover:bg-green-50/50"
                      )}
                      onClick={() => selectConversation(conversation)}
                    >
                      <div className="p-3">
                        {/* Header minimalista */}
                        <div className="flex items-center gap-3 mb-2">
                          <div className="relative">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {conversation.user_full_name?.charAt(0) || 'U'}
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                              <CheckCircle className="w-2 h-2 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm truncate">
                              {conversation.title || 'Conversación leída'}
                            </h4>
                            <p className="text-xs text-gray-600 truncate">
                              {conversation.user_full_name || 'Usuario'}
                            </p>
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(conversation.created_at).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit'
                            })}
                          </div>
                        </div>

                        {/* Información compacta */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                              Leída
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                              {(conversation as any).message_count || 0} msgs
                            </span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                selectConversation(conversation)
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              title="Reabrir chat"
                            >
                              <MessageCircle className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteConversation(conversation)
                              }}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title="Eliminar"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
              </div>
            )}
          </div>
        </div>

        {/* Panel derecho - Chat activo */}
        {activeConversation && (
          <div className="w-full lg:w-2/3 flex flex-col min-h-0">
              {/* Header de la conversación mejorado */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4 border border-blue-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <EnhancedAvatar 
                      src={activeConversation.user_avatar_url} 
                      alt={`Avatar de ${activeConversation.user_full_name || activeConversation.user_email}`}
                      className="h-12 w-12 active-conversation-avatar avatar-fade-in border-2 border-white shadow-lg"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{activeConversation.title}</h3>
                      <p className="text-sm text-gray-600 font-medium">
                        {activeConversation.user_full_name || activeConversation.user_email}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge 
                          variant={activeConversation.priority === 'urgent' ? 'destructive' : 
                                 activeConversation.priority === 'high' ? 'default' : 'secondary'} 
                          className="text-xs font-semibold"
                        >
                          {activeConversation.priority === 'urgent' ? '🚨 Urgente' :
                           activeConversation.priority === 'high' ? '⚠️ Alta' :
                           activeConversation.priority === 'normal' ? '📝 Normal' : '📌 Baja'}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          💬 General
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          ✅ {activeConversation.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-left lg:text-right">
                    <div className="text-xs text-gray-500 mb-1">
                      <span className="font-medium">Creada:</span> {new Date(activeConversation.created_at).toLocaleDateString('es-ES')}
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Última:</span> {new Date(activeConversation.updated_at).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mensajes del chat */}
              <div className="flex-1 mb-4 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col min-h-0">
                <div className="p-4 flex-1 flex flex-col min-h-0">
                  {/* Área de mensajes */}
                  <ScrollArea className="flex-1 mb-4">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                          <p className="text-sm text-gray-500">Cargando mensajes...</p>
                        </div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="text-center text-gray-500">
                          <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">No hay mensajes aún</p>
                          <p className="text-xs">Comienza la conversación</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 p-4">
                        {messages.map((message) => {
                          const messageTime = new Date(message.created_at)
                          
                          // Determinar el rol del remitente basado en sender_role
                          const isAdminMessage = message.sender_role === 'admin' || message.sender_role === 'moderator' || message.sender_role === 'support'
                          const isUserMessage = message.sender_role === 'user'
                          
                          // En el dashboard de admin:
                          // - Mensajes de admin (desde este dashboard) van a la izquierda
                          // - Mensajes de usuario van a la derecha
                          const shouldAlignLeft = isAdminMessage
                          const shouldAlignRight = isUserMessage
                          
                          // Debug log para verificar roles
                          })
                          
                          return (
                            <div
                              key={message.id}
                              className={cn(
                                "flex items-end gap-2 max-w-[80%]",
                                shouldAlignRight ? "ml-auto flex-row-reverse" : "mr-auto"
                              )}
                            >
                              {shouldAlignLeft && (
                                <Avatar className="h-8 w-8 flex-shrink-0 admin-avatar-fixed">
                                  <AvatarImage src="/images/tenerife-logo.jpg" />
                                  <AvatarFallback className="admin-avatar-icon">
                                    <Shield className="h-4 w-4 text-white" />
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              
                              {shouldAlignRight && (
                                <Avatar className="h-8 w-8 flex-shrink-0 user-avatar-custom">
                                  <AvatarImage src={message.sender_avatar_url || "/images/user-avatar.jpg"} />
                                  <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                                    {message.sender_full_name?.[0]?.toUpperCase() || message.sender_email?.[0]?.toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              
                              <div
                                className={cn(
                                  "rounded-2xl px-4 py-3 shadow-sm max-w-full break-words",
                                  shouldAlignRight
                                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                                    : "bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 text-gray-900"
                                )}
                              >
                                {/* Badge de identificación del remitente */}
                                <div className="flex items-center gap-2 mb-1">
                                  {shouldAlignLeft ? (
                                    <>
                                      <span className="text-xs font-medium text-gray-700">
                                        {message.sender_role === 'support' ? 'Sistema' : 
                                         message.sender_role === 'admin' ? 'Soporte' : 'Admin'}
                                      </span>
                                      <Badge 
                                        variant="secondary"
                                        className="text-xs bg-gray-100 text-gray-700"
                                      >
                                        {message.sender_role === 'support' ? 'Soporte' : 
                                         message.sender_role === 'admin' ? 'Admin' : 'Soporte'}
                                      </Badge>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-xs font-medium text-blue-700">
                                        Usuario
                                      </span>
                                      <Badge 
                                        variant="outline"
                                        className="text-xs bg-blue-100 text-blue-700 border-blue-200"
                                      >
                                        Cliente
                                      </Badge>
                                    </>
                                  )}
                                </div>
                                
                                <div className="mb-2">
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {message.content}
                                  </p>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <span className={cn(
                                    "text-xs font-medium",
                                    shouldAlignRight ? "text-blue-100" : "text-gray-600"
                                  )}>
                                    {messageTime.toLocaleTimeString('es-ES', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                  
                                  {shouldAlignRight && (
                                    <div className="flex items-center gap-1">
                                      <span className={cn(
                                        "text-xs font-medium",
                                        message.is_read ? "text-green-200" : "text-blue-200"
                                      )}>
                                        {message.is_read ? '✓✓' : '✓'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Input para enviar mensaje mejorado */}
                  <div className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 flex-shrink-0">
                    <Input
                      placeholder="Escribe tu respuesta..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      disabled={isLoading}
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={!newMessage.trim() || isLoading}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 flex-shrink-0"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Enviar
                    </Button>
                  </div>
                </div>
              </div>
          </div>
        )}
      </div>

      {/* Mensaje de error mejorado */}
      {error && (
        <div className="px-4 lg:px-6 pb-4 lg:pb-6 flex-shrink-0">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminChatDashboard


