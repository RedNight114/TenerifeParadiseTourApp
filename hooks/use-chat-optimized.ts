/**
 * Hook optimizado para el chat con soporte de tiempo real
 * Elimina duplicación y mejora el rendimiento
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useAuth } from './use-auth'
import { createChatService } from '@/lib/services/chat-service-factory'
import { 
  Conversation, 
  Message, 
  ConversationParticipant, 
  TypingIndicator,
  CreateConversationRequest,
  SendMessageRequest,
  UpdateConversationRequest,
  ChatFilters
} from '@/lib/types/chat'

export interface ChatState {
  conversations: Conversation[]
  activeConversation: Conversation | null
  messages: Message[]
  participants: ConversationParticipant[]
  isLoading: boolean
  error: string | null
  unreadCount: number
  typingUsers: TypingIndicator[]
  isTyping: boolean
  isConnected: boolean
}

export interface ChatActions {
  loadConversations: () => Promise<void>
  createConversation: (request: CreateConversationRequest) => Promise<Conversation | null>
  selectConversation: (conversation: Conversation) => Promise<void>
  closeActiveConversation: () => void
  sendMessage: (request: SendMessageRequest) => Promise<Message | null>
  updateConversation: (conversationId: string, updates: UpdateConversationRequest) => Promise<Conversation | null>
  startTyping: () => void
  stopTyping: () => void
  markMessagesAsRead: (conversationId: string) => Promise<void>
  getChatStats: () => Promise<any>
  clearError: () => void
}

export function useChatOptimized(): ChatState & ChatActions {
  const { user } = useAuth()
  const isAuthenticated = !!user
  
  // Estado del chat
  const [state, setState] = useState<ChatState>({
    conversations: [],
    activeConversation: null,
    messages: [],
    participants: [],
    isLoading: false,
    error: null,
    unreadCount: 0,
    typingUsers: [],
    isTyping: false,
    isConnected: false
  })

  // Referencias para manejo de tiempo real
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const messageSubscriptionRef = useRef<any>(null)
  const typingSubscriptionRef = useRef<any>(null)
  const deletionSubscriptionRef = useRef<any>(null)

  // Servicio de chat (memoizado para evitar recreación)
  const chatService = useMemo(() => createChatService(), [])

  /**
   * Cargar conversaciones
   */
  const loadConversations = useCallback(async () => {
    if (!user?.id) {
      return
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const response = await chatService.getUserConversations(user.id)
      
      if (response.success) {
        const conversations = response.data || []
        const unreadCount = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)
        
        setState(prev => ({
          ...prev,
          conversations,
          unreadCount,
          isLoading: false
        }))
        
        } else {
        setState(prev => ({
          ...prev,
          error: response.error || 'Error al cargar conversaciones',
          isLoading: false
        }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error desconocido',
        isLoading: false
      }))
    }
  }, [user?.id, chatService])

  /**
   * Crear nueva conversación
   */
  const createConversation = useCallback(async (
    request: CreateConversationRequest
  ): Promise<Conversation | null> => {
    if (!user?.id) {
      setState(prev => ({ ...prev, error: 'Usuario no autenticado' }))
      return null
    }

    try {
      setState(prev => ({ ...prev, error: null }))
      
      const response = await chatService.createConversation(request, user.id)
      
      if (response.success && response.data) {
        const conversation = response.data
        
        // Agregar a la lista de conversaciones
        setState(prev => ({
          ...prev,
          conversations: [conversation, ...prev.conversations]
        }))
        
        return conversation
      } else {
        setState(prev => ({ ...prev, error: response.error || 'Error al crear conversación' }))
        return null
      }
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Error al crear conversación' }))
      return null
    }
  }, [user?.id, chatService])

  /**
   * Seleccionar conversación
   */
  const selectConversation = useCallback(async (conversation: Conversation) => {
    try {
      setState(prev => ({
        ...prev,
        activeConversation: conversation,
        messages: [],
        participants: [],
        typingUsers: [],
        error: null
      }))

      // Cargar mensajes
      const messagesResponse = await chatService.getConversationMessages(conversation.id)

      if (messagesResponse.success) {
        setState(prev => ({
          ...prev,
          messages: messagesResponse.data || []
        }))
      }

      // Configurar suscripciones de tiempo real
      await setupRealtimeSubscriptions(conversation.id)

      } catch (error) {
      setState(prev => ({ ...prev, error: 'Error al cargar conversación' }))
    }
  }, [chatService])

  /**
   * Configurar suscripciones de tiempo real
   */
  const setupRealtimeSubscriptions = useCallback(async (conversationId: string) => {
    const realtimeService = chatService.getRealtimeService()
    
    if (!realtimeService.isAvailable()) {
      return
    }

    try {
      // Suscribirse a nuevos mensajes
      messageSubscriptionRef.current = await realtimeService.subscribeToMessages(
        conversationId,
        {
          onNewMessage: (message: Message) => {
            setState(prev => ({
              ...prev,
              messages: [...prev.messages, message]
            }))
            
            // Actualizar conversación en la lista
            setState(prev => ({
              ...prev,
              conversations: prev.conversations.map(conv => 
                conv.id === conversationId 
                  ? { ...conv, last_message: message, last_message_at: message.created_at }
                  : conv
              )
            }))
            
            // Actualizar contador de no leídos si el mensaje no es del usuario actual
            if (message.sender_id !== user?.id) {
              setState(prev => ({
                ...prev,
                conversations: prev.conversations.map(conv => 
                  conv.id === conversationId 
                    ? { ...conv, unread_count: (conv.unread_count || 0) + 1 }
                    : conv
                ),
                unreadCount: prev.unreadCount + 1
              }))
            }
          },
          onError: (error: Error) => {
            setState(prev => ({ ...prev, error: 'Error de conexión en tiempo real' }))
          }
        }
      )

      // Suscribirse a indicadores de escritura
      if (realtimeService.isAvailable()) {
        typingSubscriptionRef.current = await realtimeService.subscribeToTypingIndicators(
          conversationId,
          {
            onTypingStart: (indicator: TypingIndicator) => {
              if (indicator.user_id !== user?.id) {
                setState(prev => ({
                  ...prev,
                  typingUsers: [...prev.typingUsers.filter(t => t.user_id !== indicator.user_id), indicator]
                }))
              }
            },
            onTypingStop: (indicator: TypingIndicator) => {
              setState(prev => ({
                ...prev,
                typingUsers: prev.typingUsers.filter(t => t.user_id !== indicator.user_id)
              }))
            }
          }
        )
      }

      // Suscribirse a notificaciones de eliminación
      deletionSubscriptionRef.current = await realtimeService.subscribeToConversationDeletion({
        onConversationDeleted: (deletedConversationId: string) => {
          if (deletedConversationId === conversationId) {
            setState(prev => ({
              ...prev,
              activeConversation: null,
              messages: [],
              participants: [],
              typingUsers: []
            }))
          }
          
          // Remover de la lista de conversaciones
          setState(prev => ({
            ...prev,
            conversations: prev.conversations.filter(conv => conv.id !== deletedConversationId)
          }))
        }
      })

      setState(prev => ({ ...prev, isConnected: true }))
      } catch (error) {
      setState(prev => ({ ...prev, isConnected: false }))
    }
  }, [chatService, user?.id])

  /**
   * Cerrar conversación activa
   */
  const closeActiveConversation = useCallback(() => {
    // Limpiar suscripciones
    if (messageSubscriptionRef.current) {
      messageSubscriptionRef.current.unsubscribe()
      messageSubscriptionRef.current = null
    }
    if (typingSubscriptionRef.current) {
      typingSubscriptionRef.current.unsubscribe()
      typingSubscriptionRef.current = null
    }
    if (deletionSubscriptionRef.current) {
      deletionSubscriptionRef.current.unsubscribe()
      deletionSubscriptionRef.current = null
    }

    setState(prev => ({
      ...prev,
      activeConversation: null,
      messages: [],
      participants: [],
      typingUsers: [],
      isTyping: false,
      isConnected: false
    }))

    // Limpiar timeout de escritura
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }, [])

  /**
   * Enviar mensaje
   */
  const sendMessage = useCallback(async (
    request: SendMessageRequest
  ): Promise<Message | null> => {
    if (!user?.id) {
      setState(prev => ({ ...prev, error: 'Usuario no autenticado' }))
      return null
    }

    try {
      setState(prev => ({ ...prev, error: null }))
      
      const response = await chatService.sendMessage(request, user.id)
      
      if (response.success && response.data) {
        const message = response.data
        
        // Agregar mensaje al estado local
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, message]
        }))
        
        // Actualizar conversación en la lista
        setState(prev => ({
          ...prev,
          conversations: prev.conversations.map(conv => 
            conv.id === request.conversation_id 
              ? { ...conv, last_message: message, last_message_at: message.created_at }
              : conv
          )
        }))
        
        // Detener indicador de escritura
        setState(prev => ({ ...prev, isTyping: false }))
        await chatService.updateTypingIndicator(request.conversation_id, user.id, false)
        
        return message
      } else {
        setState(prev => ({ ...prev, error: response.error || 'Error al enviar mensaje' }))
        return null
      }
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Error al enviar mensaje' }))
      return null
    }
  }, [user?.id, chatService])

  /**
   * Manejar indicador de escritura
   */
  const handleTyping = useCallback(async (isUserTyping: boolean) => {
    if (!state.activeConversation?.id || !user?.id) return

    setState(prev => ({ ...prev, isTyping: isUserTyping }))
    await chatService.updateTypingIndicator(state.activeConversation.id, user.id, isUserTyping)
  }, [state.activeConversation?.id, user?.id, chatService])

  /**
   * Iniciar escritura
   */
  const startTyping = useCallback(() => {
    if (!state.isTyping) {
      handleTyping(true)
    }
    
    // Limpiar timeout existente
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Configurar timeout para detener indicador
    typingTimeoutRef.current = setTimeout(() => {
      handleTyping(false)
    }, 2000)
  }, [state.isTyping, handleTyping])

  /**
   * Detener escritura
   */
  const stopTyping = useCallback(() => {
    handleTyping(false)
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }, [handleTyping])

  /**
   * Marcar mensajes como leídos
   */
  const markMessagesAsRead = useCallback(async (conversationId: string) => {
    if (!user?.id) return

    try {
      await chatService.markMessagesAsRead(conversationId, user.id)
      
      // Actualizar contador de no leídos
      setState(prev => {
        const conversation = prev.conversations.find(c => c.id === conversationId)
        const unreadCount = conversation?.unread_count || 0
        
        return {
          ...prev,
          conversations: prev.conversations.map(conv => 
            conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
          ),
          unreadCount: prev.unreadCount - unreadCount
        }
      })
    } catch (error) {
      }
  }, [user?.id, chatService])

  /**
   * Obtener estadísticas del chat
   */
  const getChatStats = useCallback(async () => {
    try {
      const response = await chatService.getChatStats()
      return response.success ? response.data : null
    } catch (error) {
      return null
    }
  }, [chatService])

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Cargar conversaciones cuando cambie el usuario
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadConversations()
    }
  }, [isAuthenticated, user?.id, loadConversations])

  // Limpiar suscripciones al desmontar
  useEffect(() => {
    return () => {
      closeActiveConversation()
    }
  }, [closeActiveConversation])

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  return {
    // Estado
    ...state,
    
    // Acciones
    loadConversations,
    createConversation,
    selectConversation,
    closeActiveConversation,
    sendMessage,
    updateConversation: async () => null, // Implementar si es necesario
    startTyping,
    stopTyping,
    markMessagesAsRead,
    getChatStats,
    clearError
  }
}
