/**
 * Widget de chat unificado con soporte de tiempo real
 * Reemplaza los widgets duplicados con una implementación única y escalable
 */

'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useAuthContext } from '@/components/auth-provider'
import { useChatUnified } from '@/hooks/use-chat-unified'
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
  Maximize2,
  Minimize2,
  Wifi,
  WifiOff
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import '@/styles/enhanced-chat.css'
import '@/styles/chat-widget.css'

export type ChatWidgetVariant = 'floating' | 'embedded' | 'fullscreen'

interface UnifiedChatWidgetProps {
  variant?: ChatWidgetVariant
  className?: string
  initialMessage?: string
  serviceId?: string
  showHeader?: boolean
  showConversationList?: boolean
  maxHeight?: string
  onClose?: () => void
}

export function UnifiedChatWidget({
  variant = 'floating',
  className,
  initialMessage,
  serviceId,
  showHeader = true,
  showConversationList = true,
  maxHeight = '600px',
  onClose
}: UnifiedChatWidgetProps) {
  const { user, isAuthenticated } = useAuthContext()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState(initialMessage || '')
  const [showSettings, setShowSettings] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    error,
    unreadCount,
    typingUsers,
    isTyping,
    createConversation,
    selectConversation,
    closeActiveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    markMessagesAsRead,
    clearError
  } = useChatUnified()
  
  // Estado de conexión simulado (en una implementación real esto vendría del servicio)
  const [isConnected, setIsConnected] = useState(true)

  // Auto-scroll al final cuando lleguen nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Manejar tecla Escape para cerrar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  // Verificar autenticación
  useEffect(() => {
    if (!isAuthenticated) {
      setIsOpen(false)
    }
  }, [isAuthenticated])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    closeActiveConversation()
    onClose?.()
  }, [closeActiveConversation, onClose])

  const handleMinimize = useCallback(() => {
    setIsMinimized(!isMinimized)
  }, [isMinimized])

  const handleSendMessage = useCallback(async () => {
    if (!message.trim()) return

    const messageContent = message.trim()
    setMessage('')

    try {
      if (!activeConversation) {
        // Crear nueva conversación
        const newConversation = await createConversation({
          title: 'Nueva consulta',
          description: messageContent,
          priority: 'normal'
        })
        
        if (newConversation) {
          await selectConversation(newConversation)
          await sendMessage({
            conversation_id: newConversation.id,
            content: messageContent,
            message_type: 'text'
          })
        }
      } else {
        // Enviar mensaje a conversación existente
        await sendMessage({
          conversation_id: activeConversation.id,
          content: messageContent,
          message_type: 'text'
        })
      }
    } catch (error) {
      }
  }, [message, activeConversation, createConversation, selectConversation, sendMessage])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }, [handleSendMessage])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    
    if (e.target.value.trim()) {
      startTyping()
    } else {
      stopTyping()
    }
  }, [startTyping, stopTyping])

  // Renderizar botón flotante si está cerrado
  if (!isOpen && variant === 'floating') {
    return (
      <div className={cn("chat-widget-container", className)}>
        <button
          onClick={() => setIsOpen(true)}
          className="chat-widget-button"
          aria-label="Abrir chat de soporte"
          disabled={!isAuthenticated}
        >
          <MessageCircle className="h-6 w-6" />
        </button>
        
        {unreadCount > 0 && (
          <div className="chat-notification-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </div>
    )
  }

  // Renderizar contenido del chat
  const renderChatContent = () => (
    <div className="chat-window">
      {/* Header */}
      {showHeader && (
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-header-icon">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="chat-header-title">Chat de Soporte</div>
              <div className="chat-header-status">
                <div className={cn("connection-indicator", isConnected ? "connected" : "disconnected")} />
                <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
                {isConnected ? <Wifi className="h-3 w-3 ml-1" /> : <WifiOff className="h-3 w-3 ml-1" />}
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
            
            {variant === 'floating' && (
              <button
                onClick={handleMinimize}
                className="chat-control-button"
                aria-label={isMinimized ? "Maximizar" : "Minimizar"}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
            )}
            
            <button
              onClick={handleClose}
              className="chat-control-button close"
              aria-label="Cerrar chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="chat-content">
        {/* Lista de conversaciones */}
        {showConversationList && !activeConversation && (
          <div className="chat-conversations-list">
            <div className="chat-conversations-header">
              <h3 className="text-lg font-semibold">Conversaciones</h3>
              <Button
                size="sm"
                onClick={() => {
                  // Crear nueva conversación
                  createConversation({
                    title: 'Nueva consulta',
                    description: 'Nueva consulta iniciada',
                    priority: 'normal'
                  })
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva
              </Button>
            </div>
            
            <ScrollArea className="h-96">
              {conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className={cn(
                    "mb-2 cursor-pointer hover:shadow-md transition-all duration-200",
                    (conversation.unread_count || 0) > 0 && "ring-2 ring-blue-500"
                  )}
                  onClick={() => selectConversation(conversation)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {conversation.title}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {conversation.user_full_name || conversation.user_email}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={conversation.priority === 'high' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {conversation.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {conversation.status}
                          </Badge>
                        </div>
                      </div>
                      
                      {(conversation.unread_count || 0) > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {conversation.unread_count || 0}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          </div>
        )}

        {/* Área de mensajes */}
        {activeConversation && (
          <div className="chat-messages-container">
            {/* Header de conversación */}
            <div className="chat-conversation-header">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/images/user-avatar.jpg" />
                  <AvatarFallback>
                    {activeConversation.user_full_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{activeConversation.title}</h3>
                  <p className="text-xs text-gray-500">
                    {activeConversation.user_full_name || activeConversation.user_email}
                  </p>
                </div>
              </div>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  closeActiveConversation()
                  markMessagesAsRead(activeConversation.id)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Mensajes */}
            <ScrollArea className="chat-messages" style={{ maxHeight }}>
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Cargando mensajes...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center text-red-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">{error}</p>
                    <Button size="sm" onClick={clearError} className="mt-2">
                      Reintentar
                    </Button>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center text-gray-500">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No hay mensajes aún</p>
                    <p className="text-xs">Sé el primero en iniciar la conversación</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 p-4">
                  {messages.map((message) => {
                    const isOwnMessage = message.sender_id === user?.id
                    const isAdminMessage = message.sender_role === 'admin' || message.sender_role === 'moderator' || message.sender_role === 'support'
                    const isUserMessage = message.sender_role === 'user'
                    const messageTime = new Date(message.created_at)
                    
                    // Determinar alineación: Admin siempre a la izquierda, Usuario a la derecha
                    const isFromCurrentUser = isOwnMessage
                    const shouldAlignRight = isUserMessage && isFromCurrentUser
                    const shouldAlignLeft = isAdminMessage || (!isFromCurrentUser && !isUserMessage)
                    
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
                        
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-3 shadow-sm max-w-full break-words",
                            shouldAlignRight
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                              : "bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 text-gray-900"
                          )}
                        >
                          {shouldAlignLeft && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-gray-700">
                                Soporte
                              </span>
                              <Badge 
                                variant="secondary"
                                className="text-xs bg-gray-100 text-gray-700"
                              >
                                Admin
                              </Badge>
                            </div>
                          )}
                          
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
                              {formatDistanceToNow(messageTime, { 
                                addSuffix: true, 
                                locale: es 
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
                        
                        {shouldAlignRight && (
                          <Avatar className="h-8 w-8 flex-shrink-0 user-avatar-custom">
                            <AvatarImage src={user?.user_metadata?.avatar_url || user?.avatar_url || "/images/user-avatar.jpg"} />
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                              {user?.email?.[0]?.toUpperCase() || user?.full_name?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    )
                  })}
                  
                  {/* Indicadores de escritura */}
                  {typingUsers.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span>
                        {typingUsers.map(t => t.user_name).join(', ')} está escribiendo...
                      </span>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input de mensaje */}
            <div className="chat-input-container">
              <div className="chat-input-wrapper">
                <Textarea
                  ref={inputRef}
                  placeholder={
                    activeConversation 
                      ? "Escribe tu mensaje..." 
                      : "Escribe tu consulta aquí..."
                  }
                  value={message}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="chat-input resize-none"
                  disabled={isLoading}
                  rows={1}
                />
                
                <div className="chat-input-attachments">
                  <button
                    className="chat-attachment-button"
                    aria-label="Adjuntar archivo"
                    title="Adjuntar archivo"
                  >
                    <Paperclip className="h-3 w-3" />
                  </button>
                  <button
                    className="chat-attachment-button"
                    aria-label="Emojis"
                    title="Emojis"
                  >
                    <Smile className="h-3 w-3" />
                  </button>
                </div>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                  className="chat-send-button"
                  aria-label="Enviar mensaje"
                  title="Enviar mensaje"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
              
              {/* Estado de conexión */}
              <div className="chat-connection-status">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                  )} />
                  <span className="text-xs font-medium">
                    {isConnected ? "Conectado" : "Desconectado"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // Renderizar según la variante
  if (variant === 'embedded') {
    return (
      <div className={cn("chat-embedded", className)}>
        {renderChatContent()}
      </div>
    )
  }

  if (variant === 'fullscreen') {
    return (
      <div className={cn("chat-fullscreen", className)}>
        {renderChatContent()}
      </div>
    )
  }

  // Variante flotante (por defecto)
  return (
    <div className={cn("chat-widget-floating", className)}>
      {renderChatContent()}
    </div>
  )
}
