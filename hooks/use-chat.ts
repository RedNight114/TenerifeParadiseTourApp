import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './use-auth'
import { ChatService } from '@/lib/chat-service'
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

export function useChat() {
  const { user } = useAuth()
  const isAuthenticated = !!user
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [participants, setParticipants] = useState<ConversationParticipant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([])
  const [isTyping, setIsTyping] = useState(false)

  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const messageSubscriptionRef = useRef<any>(null)
  const typingSubscriptionRef = useRef<any>(null)

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      setError(null)
      const userConversations = await ChatService.getUserConversations(user.id)
      setConversations(userConversations)
      
      // Calculate total unread count
      const totalUnread = userConversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)
      setUnreadCount(totalUnread)
    } catch (err) {
      setError('Error al cargar conversaciones')
      // Error loading conversations
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  // Create new conversation
  const createConversation = useCallback(async (request: CreateConversationRequest): Promise<Conversation> => {
    if (!user?.id) throw new Error('Usuario no autenticado')

    try {
      setError(null)
      const conversation = await ChatService.createConversationWithRequest(request, user.id)
      
      // Add to conversations list
      setConversations(prev => [conversation, ...prev])
      
      return conversation
    } catch (err) {
      setError('Error al crear conversación')
      // Error creating conversation
      throw err
    }
  }, [user?.id])

  // Select conversation
  const selectConversation = useCallback(async (conversation: Conversation) => {
    setActiveConversation(conversation)
    setMessages([])
    setParticipants([])
    setTypingUsers([])
    
    // Load messages and participants
    try {
      const [conversationMessages, conversationParticipants] = await Promise.all([
        ChatService.getConversationMessages(conversation.id),
        ChatService.getConversationParticipants(conversation.id)
      ])
      
      setMessages(conversationMessages)
      setParticipants(conversationParticipants)
    } catch (err) {
      setError('Error al cargar mensajes')
      // Error loading messages
    }
  }, [])

  // Close active conversation
  const closeActiveConversation = useCallback(() => {
    setActiveConversation(null)
    setMessages([])
    setParticipants([])
    setTypingUsers([])
    setIsTyping(false)
    
    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }, [])

  // Send message
  const sendMessage = useCallback(async (request: SendMessageRequest): Promise<Message> => {
    if (!user?.id) throw new Error('Usuario no autenticado')

    try {
      setError(null)
      const message = await ChatService.sendMessage(request, user.id)
      
      // Add message to local state
      setMessages(prev => [...prev, message])
      
      // Update conversation in list with last message
      setConversations(prev => prev.map(conv => 
        conv.id === request.conversation_id 
          ? { ...conv, last_message: message, last_message_at: message.created_at }
          : conv
      ))
      
      // Update typing indicator
      setIsTyping(false)
      await ChatService.updateTypingIndicator(request.conversation_id, user.id, false)
      
      return message
    } catch (err) {
      setError('Error al enviar mensaje')
      // Error sending message
      throw err
    }
  }, [user?.id])

  // Update conversation
  const updateConversation = useCallback(async (
    conversationId: string,
    updates: UpdateConversationRequest
  ): Promise<Conversation> => {
    try {
      setError(null)
      const updatedConversation = await ChatService.updateConversation(conversationId, updates)
      
      // Update in conversations list
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, ...updatedConversation } : conv
      ))
      
      // Update active conversation if it's the current one
      if (activeConversation?.id === conversationId) {
        setActiveConversation(prev => prev ? { ...prev, ...updatedConversation } : null)
      }
      
      return updatedConversation
    } catch (err) {
      setError('Error al actualizar conversación')
throw err
    }
  }, [activeConversation?.id])

  // Handle typing indicator
  const handleTyping = useCallback(async (isUserTyping: boolean) => {
    if (!activeConversation?.id || !user?.id) return

    setIsTyping(isUserTyping)
    await ChatService.updateTypingIndicator(activeConversation.id, user.id, isUserTyping)
  }, [activeConversation?.id, user?.id])

  // Start typing
  const startTyping = useCallback(() => {
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
  }, [isTyping, handleTyping])

  // Stop typing
  const stopTyping = useCallback(() => {
    handleTyping(false)
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }, [handleTyping])

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (conversationId: string) => {
    if (!user?.id) return

    try {
      await ChatService.markMessagesAsRead(conversationId, user.id)
      
      // Update unread count in conversations
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
      ))
      
      // Recalculate total unread count
      setUnreadCount(prev => {
        const conversation = conversations.find(c => c.id === conversationId)
        return prev - (conversation?.unread_count || 0)
      })
    } catch (err) {
}
  }, [user?.id, conversations])

  // Get chat stats (for admins)
  const getChatStats = useCallback(async () => {
    try {
      return await ChatService.getChatStats()
    } catch (err) {
throw err
    }
  }, [])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!activeConversation?.id || !user?.id) return

    // Subscribe to new messages
    messageSubscriptionRef.current = ChatService.subscribeToConversation(
      activeConversation.id,
      (newMessage) => {
        setMessages(prev => [...prev, newMessage])
        
        // Update conversation in list
        setConversations(prev => prev.map(conv => 
          conv.id === activeConversation.id 
            ? { ...conv, last_message: newMessage, last_message_at: newMessage.created_at }
            : conv
        ))
        
        // Update unread count if message is from another user
        if (newMessage.sender_id !== user.id) {
          setConversations(prev => prev.map(conv => 
            conv.id === activeConversation.id 
              ? { ...conv, unread_count: (conv.unread_count || 0) + 1 }
              : conv
          ))
          
          setUnreadCount(prev => prev + 1)
        }
      }
    )

    // Subscribe to typing indicators
    typingSubscriptionRef.current = ChatService.subscribeToTypingIndicators(
      activeConversation.id,
      (typingIndicator) => {
        if (typingIndicator.user_id !== user.id) {
          setTypingUsers(prev => {
            const filtered = prev.filter(t => t.user_id !== typingIndicator.user_id)
            if (typingIndicator.is_typing) {
              return [...filtered, typingIndicator]
            }
            return filtered
          })
        }
      }
    )

    // Subscribe to conversation deletion notifications
    const deletionChannel = ChatService.subscribeToConversationDeletion((deletedConversationId) => {
      if (deletedConversationId === activeConversation.id) {
        // La conversación activa fue eliminada, cerrarla
        setActiveConversation(null)
        setMessages([])
        setParticipants([])
        setTypingUsers([])
        
        // Remover de la lista de conversaciones
        setConversations(prev => prev.filter(conv => conv.id !== deletedConversationId))
        
        // Mostrar notificación al usuario
        // Tu conversación ha sido eliminada por un administrador
      }
    })

    return () => {
      if (messageSubscriptionRef.current) {
        messageSubscriptionRef.current.unsubscribe()
      }
      if (typingSubscriptionRef.current) {
        typingSubscriptionRef.current.unsubscribe()
      }
      if (deletionChannel) {
        deletionChannel.unsubscribe()
      }
    }
  }, [activeConversation?.id, user?.id])

  // Load conversations when user changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadConversations()
    }
  }, [isAuthenticated, user?.id, loadConversations])

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  return {
    // State
    conversations,
    activeConversation,
    messages,
    participants,
    isLoading,
    error,
    unreadCount,
    typingUsers,
    isTyping,
    
    // Actions
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
    
    // Utilities
    clearError: () => setError(null)
  }
}

