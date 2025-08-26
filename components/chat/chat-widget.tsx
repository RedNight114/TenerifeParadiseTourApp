'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { ChatService } from '@/lib/chat-service'
import { Conversation, Message, ConversationParticipant, TypingIndicator } from '@/lib/types/chat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  MessageCircle, 
  X, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Clock,
  User,
  Shield,
  AlertCircle,
  CheckCircle,
  Archive,
  Trash2,
  Settings,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Monitor,
  Plus,
  Search,
  Filter,
  Maximize2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import '@/styles/chat-widget.css'

interface ChatWidgetProps {
  className?: string
  initialMessage?: string
  serviceId?: string
}

export function ChatWidget({ className, initialMessage, serviceId }: ChatWidgetProps) {
  const { user, profile } = useAuth()
  const isAuthenticated = !!user
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [participants, setParticipants] = useState<ConversationParticipant[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const chatService = useRef(new ChatService())

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      const userConversations = await ChatService.getUserConversations(user.id)
      setConversations(userConversations)
      
      // Calculate total unread count
      const totalUnread = userConversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)
      setUnreadCount(totalUnread)

      // If there's an initial message and no conversations, create one
      if (initialMessage && userConversations.length === 0) {
        await createNewConversation()
      }
    } catch (err) {
      setError('Error al cargar conversaciones')
} finally {
      setIsLoading(false)
    }
  }, [user?.id, initialMessage])

  // Create new conversation
  const createNewConversation = async () => {
    if (!user?.id) return

    try {
      const title = serviceId ? 'Consulta sobre servicio' : 'Nueva conversación'
      const conversation = await ChatService.createConversationWithRequest(
        {
          title,
          initial_message: initialMessage || 'Hola, tengo una pregunta',
          priority: 'normal'
        },
        user.id
      )

      setActiveConversation(conversation)
      await loadConversations()
    } catch (err) {
      setError('Error al crear conversación')
}
  }

  // Load messages for active conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const conversationMessages = await ChatService.getConversationMessages(conversationId)
      setMessages(conversationMessages)
      
      // Load participants
      const conversationParticipants = await ChatService.getConversationParticipants(conversationId)
      setParticipants(conversationParticipants)
      
      scrollToBottom()
    } catch (err) {
      setError('Error al cargar mensajes')
}
  }, [scrollToBottom])

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation?.id || !user?.id) return

    try {
      const message = await ChatService.sendMessage(
        {
          conversation_id: activeConversation.id,
          content: newMessage.trim()
        },
        user.id
      )

      setMessages(prev => [...prev, message])
      setNewMessage('')
      scrollToBottom()

      // Update typing indicator
      setIsTyping(false)
      await ChatService.updateTypingIndicator(activeConversation.id, user.id, false)
    } catch (err) {
      setError('Error al enviar mensaje')
}
  }

  // Handle typing indicator
  const handleTyping = useCallback(async (isUserTyping: boolean) => {
    if (!activeConversation?.id || !user?.id) return

    setIsTyping(isUserTyping)
    await ChatService.updateTypingIndicator(activeConversation.id, user.id, isUserTyping)
  }, [activeConversation?.id, user?.id])

  // Handle input change with typing indicator
  const handleInputChange = (value: string) => {
    setNewMessage(value)
    
    if (value.trim()) {
      if (!isTyping) {
        handleTyping(true)
      }
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        handleTyping(false)
      }, 2000)
    } else {
      handleTyping(false)
    }
  }

  // Subscribe to real-time updates
  useEffect(() => {
    if (!activeConversation?.id) return

    const messageSubscription = ChatService.subscribeToConversation(
      activeConversation.id,
      (newMessage) => {
        setMessages(prev => [...prev, newMessage])
        scrollToBottom()
      }
    )

    const typingSubscription = ChatService.subscribeToTypingIndicators(
      activeConversation.id,
      (typingData) => {
        setTypingUsers(prev => {
          // Filtrar indicadores existentes del mismo usuario
          const filtered = prev.filter(t => t.user_id !== typingData.user_id)
          // Agregar el nuevo indicador si está escribiendo
          if (typingData.is_typing) {
            return [...filtered, typingData]
          }
          // Si no está escribiendo, solo filtrar
          return filtered
        })
      }
    )

    return () => {
      messageSubscription?.unsubscribe()
      typingSubscription?.unsubscribe()
    }
  }, [activeConversation?.id, scrollToBottom])

  // Load conversations on mount
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadConversations()
    }
  }, [isAuthenticated, user?.id, loadConversations])

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isAuthenticated) {
    return (
      <div className="chat-widget-container">
        <div className="chat-widget-button">
          <User className="h-6 w-6" />
        </div>
      </div>
    )
  }

  // Botón flotante cuando está cerrado
  if (!isOpen) {
    return (
      <div className={cn("chat-widget-container", className)}>
        <button
          onClick={() => setIsOpen(true)}
          className="chat-widget-button"
          aria-label="Abrir chat de soporte"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
        
        {/* Indicador de notificaciones */}
        {unreadCount > 0 && (
          <div className="chat-notification-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </div>
    )
  }

  // Chat abierto
  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-header-icon">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="chat-header-title">Chat de Soporte</div>
            <div className="chat-header-status">
              <div className="online-indicator" />
              <span>En línea</span>
            </div>
          </div>
        </div>
        
        <div className="chat-header-controls">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="chat-control-button"
            aria-label="Configuración"
          >
            <Settings className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="chat-control-button"
            aria-label="Minimizar"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setIsOpen(false)}
            className="chat-control-button close"
            aria-label="Cerrar chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Contenido del chat */}
      <div className="chat-content">
        {/* Panel izquierdo - Lista de conversaciones */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Barra de búsqueda */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar conversaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Lista de conversaciones */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="chat-loading">
                <div className="chat-loading-spinner" />
                <p className="ml-3 text-sm text-gray-600">Cargando...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay conversaciones</p>
              </div>
            ) : (
              <div className="p-2">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors",
                      activeConversation?.id === conversation.id && "bg-blue-50 border border-blue-200"
                    )}
                    onClick={() => {
                      setActiveConversation(conversation)
                      loadMessages(conversation.id)
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={conversation.user_avatar_url} />
                        <AvatarFallback className="text-xs">
                          {conversation.user_full_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate">
                          {conversation.title}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {conversation.description}
                        </p>
                        {(conversation.unread_count || 0) > 0 && (
                          <Badge variant="destructive" className="mt-1 text-xs">
                            {conversation.unread_count || 0} nuevo{(conversation.unread_count || 0) > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botón para nueva conversación */}
          <div className="p-4 border-t border-gray-200">
            <Button
              onClick={createNewConversation}
              className="w-full"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Conversación
            </Button>
          </div>
        </div>

        {/* Panel derecho - Chat activo */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Header de la conversación */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{activeConversation.title}</h3>
                    <p className="text-sm text-gray-600">{activeConversation.description}</p>
                  </div>
                  <Badge variant="outline">
                    {activeConversation.status || 'Activa'}
                  </Badge>
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "chat-message",
                        message.sender_id === user.id ? "user" : "admin"
                      )}
                    >
                      {message.sender_id !== user.id && (
                        <div className="chat-message-avatar admin">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.sender?.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {message.sender?.full_name?.[0] || 'A'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                      
                      <div className="chat-message-bubble">
                        <div className="chat-message-content">
                          {message.content}
                        </div>
                        <div className="chat-message-time">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(message.created_at).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>

                      {message.sender_id === user.id && (
                        <div className="chat-message-avatar user">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={profile?.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {profile?.full_name?.[0] || 'T'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Indicadores de escritura */}
                  {typingUsers.map((typingUser) => (
                    <div key={typingUser.user_id} className="chat-message admin">
                      <div className="chat-message-avatar admin">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {typingUser.user_name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="chat-message-bubble">
                        <div className="flex items-center gap-1">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                          <span className="text-xs text-gray-500">escribiendo...</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input para enviar mensaje */}
              <div className="chat-input-container">
                <div className="chat-input-wrapper">
                  <Input
                    placeholder="Escribe tu mensaje..."
                    value={newMessage}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="chat-input"
                  />
                  
                  <div className="chat-input-attachments">
                    <button
                      className="chat-attachment-button"
                      aria-label="Adjuntar archivo"
                    >
                      <Paperclip className="h-3 w-3" />
                    </button>
                    <button
                      className="chat-attachment-button"
                      aria-label="Emojis"
                    >
                      <Smile className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isLoading}
                  className="chat-send-button"
                  aria-label="Enviar mensaje"
                >
                  <Send className="h-4 w-4" />
                </button>
                
                {/* Estado de conexión */}
                <div className="chat-connection-status">
                  <div className="chat-connection-indicator">
                    <div className="chat-connection-dot" />
                    <span className="font-medium">Conectado</span>
                  </div>
                  <span className="font-medium">En línea</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Selecciona una conversación</p>
                <p className="text-sm">Elige una conversación del panel izquierdo para comenzar a chatear</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="absolute bottom-4 left-4 right-4">
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

