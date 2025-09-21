'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '@/components/auth-provider'
import { useChatUnified } from '@/hooks/use-chat-unified'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MessageCircle, 
  Send, 
  Plus,
  Search,
  Circle,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface UnifiedChatV3Props {
  className?: string
  showHeader?: boolean
  compact?: boolean
}

export function UnifiedChatV3({ 
  className, 
  showHeader = true, 
  compact = false 
}: UnifiedChatV3Props) {
  const { user, isAuthenticated } = useAuthContext()
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    error,
    unreadCount,
    createConversation,
    sendMessage,
    selectConversation,
    closeActiveConversation,
    startTyping,
    stopTyping,
    markMessagesAsRead,
    clearError
  } = useChatUnified()

  // Auto-seleccionar primera conversación si no hay ninguna seleccionada
  useEffect(() => {
    if (conversations && conversations.length > 0 && !activeConversation) {
      selectConversation(conversations[0])
    }
  }, [conversations, activeConversation, selectConversation])

  // Marcar mensajes como leídos cuando se selecciona una conversación
  useEffect(() => {
    if (activeConversation?.id) {
      markMessagesAsRead(activeConversation.id)
    }
  }, [activeConversation?.id, markMessagesAsRead])

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || !activeConversation?.id) return

    try {
      await sendMessage({
        conversation_id: activeConversation.id,
        content: message.trim(),
        message_type: 'text'
      })
      setMessage('')
    } catch (error) {
      }
  }, [message, activeConversation?.id, sendMessage])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }, [handleSendMessage])

  const handleStartConversation = useCallback(async () => {
    try {
      const conversation = await createConversation({
        title: 'Nueva consulta',
        initial_message: 'Consulta iniciada desde el chat',
        priority: 'normal'
      })
      
      if (conversation) {
        selectConversation(conversation)
      }
    } catch (error) {
      }
  }, [createConversation, selectConversation])

  const handleTyping = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
    
    if (e.target.value.length > 0) {
      startTyping()
    } else {
      stopTyping()
    }
  }, [startTyping, stopTyping])

  // Filtrar conversaciones por búsqueda
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isAuthenticated) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6 text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Inicia sesión para chatear</h3>
          <p className="text-muted-foreground">
            Necesitas estar autenticado para usar el sistema de chat.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('flex h-full', className)}>
      {/* Panel de conversaciones */}
      <div className={cn(
        'flex flex-col border-r',
        compact ? 'w-64' : 'w-80'
      )}>
        {showHeader && (
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Chat</h2>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleStartConversation}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Lista de conversaciones */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                <p>No hay conversaciones</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartConversation}
                  className="mt-2"
                >
                  Iniciar conversación
                </Button>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    'p-3 rounded-lg cursor-pointer transition-colors mb-2',
                    activeConversation?.id === conversation.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                  onClick={() => selectConversation(conversation)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {conversation.title}
                      </h3>
                      {conversation.last_message && (
                        <p className="text-sm opacity-70 truncate mt-1">
                          {conversation.last_message.content}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-2">
                      {(conversation.unread_count || 0) > 0 && (
                        <Badge variant="destructive" className="text-xs h-5 w-5 p-0 flex items-center justify-center">
                          {conversation.unread_count}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1">
                        {conversation.status === 'active' ? (
                          <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                        ) : conversation.status === 'waiting' ? (
                          <Circle className="h-2 w-2 fill-yellow-500 text-yellow-500" />
                        ) : (
                          <Circle className="h-2 w-2 fill-gray-500 text-gray-500" />
                        )}
                        <span className="text-xs opacity-70">
                          {new Date(conversation.last_message_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Panel de mensajes */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Header de conversación */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{activeConversation.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={activeConversation.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {activeConversation.status}
                    </Badge>
                    <Badge 
                      variant={activeConversation.priority === 'urgent' ? 'destructive' : 'outline'}
                      className="text-xs"
                    >
                      {activeConversation.priority}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={closeActiveConversation}
                >
                  Cerrar
                </Button>
              </div>
            </div>

            {/* Mensajes */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex',
                      message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                        message.sender_id === user?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs opacity-70">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                        {message.sender_id === user?.id && (
                          <CheckCircle className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input de mensaje */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Escribe un mensaje..."
                  value={message}
                  onChange={handleTyping}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Selecciona una conversación</h3>
              <p>Elige una conversación para comenzar a chatear</p>
            </div>
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground p-4 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
