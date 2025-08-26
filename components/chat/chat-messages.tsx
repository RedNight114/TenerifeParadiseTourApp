'use client'

import React, { useEffect, useRef } from 'react'
import { Message } from '@/lib/types/chat'
import { EnhancedAvatar } from '@/components/ui/enhanced-avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface ChatMessagesProps {
  messages: Message[]
  currentUserId: string
  isLoading?: boolean
  className?: string
}

export function ChatMessages({ 
  messages, 
  currentUserId, 
  isLoading = false,
  className 
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll al final cuando lleguen nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center h-32", className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Cargando mensajes...</p>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-32", className)}>
        <div className="text-center text-muted-foreground">
          <div className="text-lg font-medium text-gray-600 mb-2">No hay mensajes aún</div>
          <p className="text-sm text-gray-500">Sé el primero en iniciar la conversación</p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className={cn("h-full pr-4", className)}>
      <div className="space-y-4 pb-4">
        {messages.map((message) => {
          const isOwnMessage = message.sender_id === currentUserId
          const messageTime = new Date(message.created_at)
          
          return (
            <div
              key={message.id}
              className={cn(
                "flex items-end gap-2 max-w-[80%]",
                isOwnMessage ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {/* Avatar del remitente */}
              {!isOwnMessage && (
                <EnhancedAvatar 
                  src={message.sender?.avatar_url} 
                  alt={`Avatar de ${message.sender?.full_name || 'Usuario'}`}
                  className="h-8 w-8 flex-shrink-0 border-2 border-gray-200 shadow-sm"
                />
              )}
              
              {/* Contenido del mensaje */}
              <div
                className={cn(
                  "rounded-2xl px-4 py-3 shadow-sm max-w-full break-words",
                  isOwnMessage
                    ? "bg-purple-600 text-white order-2"
                    : "bg-white border border-gray-200 text-gray-900 order-1"
                )}
              >
                {/* Información del remitente */}
                {!isOwnMessage && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium opacity-80">
                      {message.sender?.full_name || 'Usuario'}
                    </span>
                  </div>
                )}
                
                {/* Contenido del mensaje */}
                <div className="mb-2">
                  {message.message_type === 'text' && (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  )}
                  
                  {message.message_type === 'image' && (
                    <div className="space-y-2">
                      <img 
                        src={message.file_url} 
                        alt="Imagen adjunta"
                        className="max-w-full rounded-lg"
                      />
                      {message.content && (
                        <p className="text-sm leading-relaxed">
                          {message.content}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {message.message_type === 'file' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
                        <div className="text-lg">📎</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {message.file_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {message.file_size ? `${(message.file_size / 1024).toFixed(1)} KB` : 'Tamaño desconocido'}
                          </p>
                        </div>
                      </div>
                      {message.content && (
                        <p className="text-sm leading-relaxed">
                          {message.content}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Timestamp del mensaje */}
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-xs opacity-60",
                    isOwnMessage ? "text-white" : "text-gray-500"
                  )}>
                    {formatDistanceToNow(messageTime, { 
                      addSuffix: true, 
                      locale: es 
                    })}
                  </span>
                  
                  {/* Indicador de lectura */}
                  {isOwnMessage && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs opacity-60">
                        {message.is_read ? '✓✓' : '✓'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Avatar del usuario actual */}
              {isOwnMessage && (
                <EnhancedAvatar 
                  src="/admin-avatar.jpg" 
                  alt="Tu avatar"
                  className="h-8 w-8 flex-shrink-0 border-2 border-purple-200 shadow-sm"
                />
              )}
            </div>
          )
        })}
        
        {/* Referencia para auto-scroll */}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
}

