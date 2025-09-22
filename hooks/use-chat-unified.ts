/**
 * Hook de chat unificado y optimizado para producción
 * Elimina duplicaciones y mejora el rendimiento
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useAuthContext } from '@/components/auth-provider'
import { chatService } from '@/lib/services/chat-service-unified'
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
  isCreatingConversation: boolean
  isSendingMessage: boolean
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

export function useChatUnified(): ChatState & ChatActions {
  const { user, profile, isAuthenticated, isInitialized } = useAuthContext()
  const isAdmin = profile?.role === 'admin'
  
  // Estado del chat
  const [state, setState] = useState<ChatState>({
    conversations: [],
    activeConversation: null,
    messages: [],
    participants: [],
    isLoading: false,
    isCreatingConversation: false,
    isSendingMessage: false,
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
  const reloadTimeoutRef = useRef<NodeJS.Timeout>()

  /**
   * Cargar conversaciones
   */
  const loadConversations = useCallback(async () => {
    if (!user?.id || !isAuthenticated || !isInitialized) {
      return
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      // Los administradores ven todas las conversaciones, los usuarios solo las suyas
      const response = isAdmin 
        ? await chatService.getAllConversations()
        : await chatService.getUserConversations(user.id)
      
      if (response.success) {
        const conversations = response.data || []
        const unreadCount = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)
        
        setState(prev => ({
          ...prev,
          conversations,
          unreadCount,
          isLoading: false,
          error: null // Limpiar errores al cargar exitosamente
        }))
        
        } else {
        setState(prev => ({
          ...prev,
          error: response.error || 'Error al cargar las conversaciones',
          isLoading: false
        }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Error al cargar las conversaciones',
        isLoading: false
      }))
    }
  }, [user?.id, isAuthenticated, isInitialized, isAdmin])

  /**
   * Crear conversación
   */
  const createConversation = useCallback(async (request: CreateConversationRequest): Promise<Conversation | null> => {
    if (!user?.id || !isAuthenticated) return null

    try {
      setState(prev => ({ ...prev, isCreatingConversation: true, error: null }))
      
      const response = await chatService.createConversation(request, user.id)
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          conversations: [response.data, ...prev.conversations],
          isCreatingConversation: false
        }))
        
        return response.data
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || 'Error al crear la conversación',
          isCreatingConversation: false
        }))
        return null
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Error al crear la conversación',
        isCreatingConversation: false
      }))
      return null
    }
  }, [user?.id, isAuthenticated])

  /**
   * Seleccionar conversación
   */
  const selectConversation = useCallback(async (conversation: Conversation) => {
    try {
      // Solo limpiar mensajes si es una conversación diferente
      setState(prev => ({ 
        ...prev, 
        activeConversation: conversation, 
        messages: prev.activeConversation?.id === conversation.id ? prev.messages : [],
        error: null 
      }))
      
      // Solo cargar mensajes si no los tenemos ya
      if (state.activeConversation?.id !== conversation.id) {
        const response = await chatService.getConversationMessages(conversation.id, 50, 0)
        
        if (response.success) {
          setState(prev => ({
            ...prev,
            messages: response.data || []
          }))
        } else {
          setState(prev => ({
            ...prev,
            error: response.error || 'Error al cargar los mensajes'
          }))
        }
      }

      // Marcar mensajes como leídos
      if (user?.id) {
        await chatService.markMessagesAsRead(conversation.id, user.id)
      }

      } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Error al cargar los mensajes'
      }))
    }
  }, [user?.id, state.activeConversation?.id])

  /**
   * Cerrar conversación activa
   */
  const closeActiveConversation = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeConversation: null,
      messages: [],
      participants: [],
      error: null
    }))
  }, [])

  /**
   * Enviar mensaje
   */
  const sendMessage = useCallback(async (request: SendMessageRequest): Promise<Message | null> => {
    if (!user?.id || !isAuthenticated) return null

    try {
      setState(prev => ({ ...prev, isSendingMessage: true, error: null }))
      
      // Crear mensaje optimista para mostrar inmediatamente
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: request.conversation_id,
        sender_id: user.id,
        content: request.content,
        message_type: request.message_type || 'text',
        file_url: request.file_url,
        file_name: request.file_name,
        file_size: request.file_size,
        file_type: request.file_type,
        reply_to_id: request.reply_to_id,
        metadata: request.metadata || {},
        is_read: false,
        created_at: new Date().toISOString()
      }

      // Mostrar mensaje optimista inmediatamente
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, optimisticMessage]
      }))

      const response = await chatService.sendMessage(request, user.id)
      
      if (response.success && response.data) {
        // Reemplazar mensaje optimista con el real
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === optimisticMessage.id ? response.data : msg
          ),
          isSendingMessage: false,
          error: null
        }))
        
        // Actualizar la conversación en la lista con el último mensaje
        setState(prev => ({
          ...prev,
          conversations: prev.conversations.map(conv => 
            conv.id === request.conversation_id 
              ? { ...conv, last_message: response.data, last_message_at: response.data.created_at }
              : conv
          )
        }))
        
        return response.data
      } else {
        // Remover mensaje optimista en caso de error
        setState(prev => ({
          ...prev,
          messages: prev.messages.filter(msg => msg.id !== optimisticMessage.id),
          error: response.error || 'Error al enviar el mensaje',
          isSendingMessage: false
        }))
        return null
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Error al enviar el mensaje',
        isSendingMessage: false
      }))
      return null
    }
  }, [user?.id, isAuthenticated])

  /**
   * Actualizar conversación
   */
  const updateConversation = useCallback(async (
    conversationId: string, 
    updates: UpdateConversationRequest
  ): Promise<Conversation | null> => {
    try {
      // Esta funcionalidad se implementaría en el servicio
      // Por ahora retornamos null
      return null
    } catch (error) {
      return null
    }
  }, [])

  /**
   * Iniciar indicador de escritura
   */
  const startTyping = useCallback(() => {
    if (!user?.id || !state.activeConversation?.id) return

    setState(prev => ({ ...prev, isTyping: true }))

    // Limpiar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Auto-detener después de 3 segundos
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping()
    }, 3000)
  }, [user?.id, state.activeConversation?.id])

  /**
   * Detener indicador de escritura
   */
  const stopTyping = useCallback(() => {
    if (!user?.id || !state.activeConversation?.id) return

    setState(prev => ({ ...prev, isTyping: false }))

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }, [user?.id, state.activeConversation?.id])

  /**
   * Marcar mensajes como leídos
   */
  const markMessagesAsRead = useCallback(async (conversationId: string) => {
    if (!user?.id || !isAuthenticated) return

    try {
      await chatService.markMessagesAsRead(conversationId, user.id)
      
      // Actualizar estado local
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unread_count: 0 }
            : conv
        ),
        unreadCount: prev.conversations.reduce((sum, conv) => 
          sum + (conv.id === conversationId ? 0 : conv.unread_count || 0), 0
        )
      }))
    } catch (error) {
      }
  }, [user?.id, isAuthenticated])

  /**
   * Obtener estadísticas de chat
   */
  const getChatStats = useCallback(async () => {
    try {
      // Esta funcionalidad se implementaría en el servicio
      return null
    } catch (error) {
      return null
    }
  }, [])

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Cargar conversaciones al autenticarse
  useEffect(() => {
    if (isAuthenticated && user?.id && isInitialized) {
      loadConversations()
    } else {
      setState(prev => ({
        ...prev,
        conversations: [],
        activeConversation: null,
        messages: [],
        unreadCount: 0,
        error: null
      }))
    }
  }, [isAuthenticated, user?.id, isInitialized, loadConversations])

  // Recargar conversaciones solo cuando realmente no existen (no durante operaciones)
  useEffect(() => {
    if (
      isAuthenticated && 
      user?.id && 
      isInitialized && 
      !state.isLoading && 
      !state.isCreatingConversation && 
      !state.isSendingMessage &&
      state.conversations.length === 0 &&
      !state.error // No recargar si hay un error activo
    ) {
      // Debounce para evitar recargas múltiples
      if (reloadTimeoutRef.current) {
        clearTimeout(reloadTimeoutRef.current)
      }
      
      reloadTimeoutRef.current = setTimeout(() => {
        loadConversations()
      }, 1000) // Esperar 1 segundo antes de recargar
    }
  }, [isAuthenticated, user?.id, isInitialized, state.isLoading, state.isCreatingConversation, state.isSendingMessage, state.conversations.length, state.error, loadConversations])

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (reloadTimeoutRef.current) {
        clearTimeout(reloadTimeoutRef.current)
      }
    }
  }, [])

  return {
    ...state,
    loadConversations,
    createConversation,
    selectConversation,
    closeActiveConversation,
    sendMessage,
    updateConversation,
    startTyping,
    stopTyping,
    markMessagesAsRead,
    getChatStats,
    clearError
  }
}
