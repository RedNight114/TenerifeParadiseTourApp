/**
 * Servicio de chat refactorizado con arquitectura modular
 * Implementa Factory Pattern y elimina duplicación de código
 */

import { getSupabaseClient } from '@/lib/supabase-unified'
import { ConfigService } from './config-service'
import { MockDataService } from './mock-data-service'
import { CacheService, CACHE_KEYS } from './cache-service'
import { RealtimeService } from './realtime-service'
import { 
  Message, 
  Conversation, 
  ConversationParticipant,
  SendMessageRequest,
  CreateConversationRequest,
  UpdateConversationRequest,
  ChatFilters,
  ChatStats,
  TypingIndicator
} from '@/lib/types/chat'

export interface ChatServiceResponse<T> {
  data: T
  error: string | null
  success: boolean
}

export class ChatServiceRefactored {
  private static instance: ChatServiceRefactored
  private configService: ConfigService
  private mockDataService: MockDataService
  private cacheService: CacheService
  private realtimeService: RealtimeService

  private constructor() {
    this.configService = ConfigService.getInstance()
    this.mockDataService = MockDataService.getInstance()
    this.cacheService = CacheService.getInstance()
    this.realtimeService = RealtimeService.getInstance()
  }

  static getInstance(): ChatServiceRefactored {
    if (!this.instance) {
      this.instance = new ChatServiceRefactored()
    }
    return this.instance
  }

  /**
   * Enviar mensaje
   */
  async sendMessage(
    request: SendMessageRequest, 
    senderId: string
  ): Promise<ChatServiceResponse<Message>> {
    try {
      // Validar entrada
      if (!request.content || request.content.trim() === '') {
        return {
          data: null as any,
          error: 'El contenido del mensaje no puede estar vacío',
          success: false
        }
      }

      // Usar datos mock si Supabase no está disponible
      if (this.configService.shouldUseMockData()) {
        const mockMessage = this.mockDataService.createMockMessage(
          request.conversation_id,
          senderId,
          request.content,
          request.message_type
        )

        // Simular respuesta automática del admin después de 2 segundos
        setTimeout(() => {
          this.mockDataService.simulateAdminResponse(request.conversation_id)
        }, 2000)

        return {
          data: mockMessage,
          error: null,
          success: true
        }
      }

      // Lógica real con Supabase
      const supabase = await getSupabaseClient()

      // Verificar que la conversación existe y está activa
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('id, status, user_id, admin_id')
        .eq('id', request.conversation_id)
        .eq('status', 'active')
        .single()

      if (convError || !convData) {
        return {
          data: null as any,
          error: 'Conversación no encontrada o inactiva',
          success: false
        }
      }

      // Obtener el rol del usuario antes de insertar el mensaje
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', senderId)
        .single()

      // Determinar el sender_role basado en el rol del usuario
      let senderRole: 'user' | 'admin' | 'moderator' | 'support' | 'client' = 'user'
      if (profile?.role) {
        switch (profile.role) {
          case 'admin':
            senderRole = 'admin'
            break
          case 'moderator':
            senderRole = 'moderator'
            break
          case 'support':
            senderRole = 'support'
            break
          case 'client':
            senderRole = 'client'
            break
          default:
            senderRole = 'user'
        }
      }

      // Insertar el mensaje
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: request.conversation_id,
          sender_id: senderId,
          sender_role: senderRole,
          content: request.content.trim(),
          message_type: request.message_type || 'text',
          metadata: request.metadata || {}
        })
        .select(`
          id, conversation_id, sender_id, sender_role, content, message_type,
          metadata, created_at
        `)
        .single()

      if (messageError) {
        return {
          data: null as any,
          error: `Error al enviar mensaje: ${messageError.message}`,
          success: false
        }
      }

      // Actualizar la conversación
      await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', request.conversation_id)

      // Invalidar caché
      this.cacheService.invalidatePattern(`messages:${request.conversation_id}`)
      this.cacheService.invalidatePattern(`conversations:${senderId}`)

      return {
        data: { ...message, is_read: false } as Message,
        error: null,
        success: true
      }

    } catch (error) {
      return {
        data: null as any,
        error: error instanceof Error ? error.message : 'Error desconocido',
        success: false
      }
    }
  }

  /**
   * Generar mensaje predeterminado según el contexto
   */
  private async generateDefaultMessage(userId: string, isAdmin: boolean): Promise<string> {
    if (isAdmin) {
      // Para admin, obtener información del usuario
      try {
        const supabase = await getSupabaseClient()
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', userId)
          .single()
        
        const userName = profile?.full_name || profile?.email || 'Usuario'
        return `Nueva consulta abierta por ${userName}. El usuario está esperando respuesta.`;
      } catch (error) {
        return "Nueva consulta abierta por el usuario. El usuario está esperando respuesta.";
      }
    } else {
      // Para usuario, mensaje más personalizado
      try {
        const supabase = await getSupabaseClient()
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', userId)
          .single()
        
        const userName = profile?.full_name ? `, ${profile.full_name}` : ''
        return `¡Hola${userName} 👋! Hemos recibido tu consulta, en breve un miembro de soporte te responderá.\n\n¿En qué podemos ayudarte hoy?`;
      } catch (error) {
        return "¡Hola 👋! Hemos recibido tu consulta, en breve un miembro de soporte te responderá.\n\n¿En qué podemos ayudarte hoy?";
      }
    }
  }

  /**
   * Crear conversación
   */
  async createConversation(
    request: CreateConversationRequest,
    userId: string,
    isAdmin: boolean = false
  ): Promise<ChatServiceResponse<Conversation>> {
    try {
      const title = request.title || 'Nueva consulta'
      const messageContent = request.initial_message || await this.generateDefaultMessage(userId, isAdmin)

      // Usar datos mock si Supabase no está disponible
      if (this.configService.shouldUseMockData()) {
        const mockConversation = this.mockDataService.createMockConversation(
          title,
          userId,
          messageContent
        )

        return {
          data: mockConversation,
          error: null,
          success: true
        }
      }

      // Lógica real con Supabase
      const supabase = await getSupabaseClient()

      // Crear la conversación
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          title,
          user_id: userId,
          status: 'active',
          priority: request.priority || 'normal',
          last_message_at: new Date().toISOString()
        })
        .select()
        .single()

      if (convError) {
        return {
          data: null as any,
          error: `Error al crear conversación: ${convError.message}`,
          success: false
        }
      }

      // Determinar sender_id y sender_role para el mensaje inicial
      let initialMessageSenderId: string | null = null
      let initialMessageSenderRole: 'user' | 'admin' | 'moderator' | 'support' | 'client'

      if (isAdmin) {
        // Admin crea la conversación, el mensaje inicial es del admin
        initialMessageSenderId = userId
        initialMessageSenderRole = 'admin'
      } else {
        // Usuario crea la conversación, el mensaje inicial es de bienvenida del sistema/soporte
        initialMessageSenderId = null // null para mensajes del sistema/soporte
        initialMessageSenderRole = 'support'
      }

      // Crear el mensaje inicial
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: initialMessageSenderId,
          content: messageContent,
          message_type: 'text',
          sender_role: initialMessageSenderRole,
          metadata: {}
        })
        .select(`
          id, conversation_id, sender_id, sender_role, content, message_type,
          metadata, created_at
        `)
        .single()

      if (messageError) {
        // Si falla el mensaje, eliminar la conversación creada
        await supabase.from('conversations').delete().eq('id', conversation.id)
        return {
          data: null as any,
          error: `Error al crear mensaje inicial: ${messageError.message}`,
          success: false
        }
      }

      // Agregar al usuario como participante
      await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: conversation.id,
          user_id: userId,
          role: 'user',
          joined_at: new Date().toISOString()
        })

      // Invalidar caché
      this.cacheService.invalidatePattern(`conversations:${userId}`)

      return {
        data: { ...conversation, messages: [message] } as Conversation,
        error: null,
        success: true
      }

    } catch (error) {
      return {
        data: null as any,
        error: error instanceof Error ? error.message : 'Error desconocido',
        success: false
      }
    }
  }

  /**
   * Obtener mensajes de una conversación
   */
  async getConversationMessages(
    conversationId: string,
    limit?: number,
    offset?: number
  ): Promise<ChatServiceResponse<Message[]>> {
    try {
      const cacheKey = CACHE_KEYS.MESSAGES(conversationId)
      const maxLimit = this.configService.getMaxMessagesPerPage()

      // Usar datos mock si Supabase no está disponible
      if (this.configService.shouldUseMockData()) {
        const mockMessages = this.mockDataService.getMockMessages(conversationId)
        return {
          data: mockMessages,
          error: null,
          success: true
        }
      }

      // Intentar obtener del caché primero
      const cachedMessages = this.cacheService.get<Message[]>(cacheKey)
      if (cachedMessages) {
        return {
          data: cachedMessages,
          error: null,
          success: true
        }
      }

      // Lógica real con Supabase
      const supabase = await getSupabaseClient()

      let query = supabase
        .from('message_summary')
        .select(`
          id, conversation_id, sender_id, sender_role, content, message_type,
          metadata, created_at, sender_full_name, sender_email, sender_avatar_url
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (limit) {
        query = query.limit(Math.min(limit, maxLimit))
      }

      if (offset) {
        query = query.range(offset, offset + (limit || maxLimit) - 1)
      }

      const { data: messages, error } = await query

      if (error) {
        return {
          data: null as any,
          error: `Error al obtener mensajes: ${error.message}`,
          success: false
        }
      }

      const result = (messages || []).map(msg => ({
        ...msg,
        is_read: false
      })) as Message[]

      // Guardar en caché
      this.cacheService.set(cacheKey, result, 2 * 60 * 1000) // 2 minutos

      return {
        data: result,
        error: null,
        success: true
      }

    } catch (error) {
      return {
        data: null as any,
        error: error instanceof Error ? error.message : 'Error desconocido',
        success: false
      }
    }
  }

  /**
   * Obtener conversaciones del usuario
   */
  async getUserConversations(userId: string): Promise<ChatServiceResponse<Conversation[]>> {
    try {
      const cacheKey = CACHE_KEYS.CONVERSATIONS(userId)

      // Usar datos mock si Supabase no está disponible
      if (this.configService.shouldUseMockData()) {
        const mockConversations = this.mockDataService.getMockConversations(userId)
        return {
          data: mockConversations,
          error: null,
          success: true
        }
      }

      // Intentar obtener del caché primero
      const cachedConversations = this.cacheService.get<Conversation[]>(cacheKey)
      if (cachedConversations) {
        return {
          data: cachedConversations,
          error: null,
          success: true
        }
      }

      // Lógica real con Supabase
      const supabase = await getSupabaseClient()

      const { data: conversations, error } = await supabase
        .from('conversation_summary')
        .select(`
          id, title, description, user_id, admin_id, status, priority,
          created_at, updated_at, last_message_at, unread_count,
          user_full_name, user_email
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false })

      if (error) {
        return {
          data: null as any,
          error: `Error al obtener conversaciones: ${error.message}`,
          success: false
        }
      }

      // Guardar en caché
      this.cacheService.set(cacheKey, conversations || [], 5 * 60 * 1000) // 5 minutos

      return {
        data: conversations || [],
        error: null,
        success: true
      }

    } catch (error) {
      return {
        data: null as any,
        error: error instanceof Error ? error.message : 'Error desconocido',
        success: false
      }
    }
  }

  /**
   * Obtener todas las conversaciones (para administradores)
   */
  async getAllConversations(filters?: ChatFilters): Promise<ChatServiceResponse<Conversation[]>> {
    try {
      // Usar datos mock si Supabase no está disponible
      if (this.configService.shouldUseMockData()) {
        const mockConversations = this.mockDataService.getMockConversations()
        return {
          data: mockConversations,
          error: null,
          success: true
        }
      }

      // Lógica real con Supabase
      const supabase = await getSupabaseClient()

      let query = supabase
        .from('conversation_summary')
        .select(`
          id, title, description, user_id, admin_id, status, priority,
          created_at, updated_at, last_message_at, unread_count,
          user_full_name, user_email
        `)
        .eq('status', 'active')

      // Aplicar filtros
      if (filters) {
        if (filters.status) {
          query = query.eq('status', filters.status)
        }
        if (filters.priority) {
          query = query.eq('priority', filters.priority)
        }
      }

      query = query.order('last_message_at', { ascending: false })

      const { data: conversations, error } = await query

      if (error) {
        return {
          data: null as any,
          error: `Error al obtener conversaciones: ${error.message}`,
          success: false
        }
      }

      return {
        data: conversations || [],
        error: null,
        success: true
      }

    } catch (error) {
      return {
        data: null as any,
        error: error instanceof Error ? error.message : 'Error desconocido',
        success: false
      }
    }
  }

  /**
   * Marcar mensajes como leídos
   */
  async markMessagesAsRead(
    conversationId: string,
    userId: string
  ): Promise<ChatServiceResponse<void>> {
    try {
      if (this.configService.shouldUseMockData()) {
        // En modo mock, no hacer nada
        return {
          data: undefined,
          error: null,
          success: true
        }
      }

      const supabase = await getSupabaseClient()

      const { error } = await supabase
        .from('conversation_participants')
        .update({
          last_read_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)

      if (error) {
        return {
          data: undefined,
          error: `Error al marcar mensajes como leídos: ${error.message}`,
          success: false
        }
      }

      // Invalidar caché
      this.cacheService.invalidatePattern(`conversations:${userId}`)

      return {
        data: undefined,
        error: null,
        success: true
      }

    } catch (error) {
      return {
        data: undefined,
        error: error instanceof Error ? error.message : 'Error desconocido',
        success: false
      }
    }
  }

  /**
   * Actualizar indicador de escritura
   */
  async updateTypingIndicator(
    conversationId: string,
    userId: string,
    isTyping: boolean
  ): Promise<ChatServiceResponse<void>> {
    try {
      if (this.configService.shouldUseMockData()) {
        // En modo mock, no hacer nada
        return {
          data: undefined,
          error: null,
          success: true
        }
      }

      await this.realtimeService.updateTypingIndicator(conversationId, userId, isTyping)

      return {
        data: undefined,
        error: null,
        success: true
      }

    } catch (error) {
      return {
        data: undefined,
        error: error instanceof Error ? error.message : 'Error desconocido',
        success: false
      }
    }
  }

  /**
   * Obtener estadísticas del chat
   */
  async getChatStats(): Promise<ChatServiceResponse<ChatStats>> {
    try {
      const cacheKey = CACHE_KEYS.CHAT_STATS

      // Intentar obtener del caché primero
      const cachedStats = this.cacheService.get<ChatStats>(cacheKey)
      if (cachedStats) {
        return {
          data: cachedStats,
          error: null,
          success: true
        }
      }

      if (this.configService.shouldUseMockData()) {
        const mockStats: ChatStats = {
          total_conversations: 2,
          active_conversations: 2,
          waiting_conversations: 0,
          closed_conversations: 0,
          total_messages: 5,
          avg_response_time: 120,
          conversations_by_priority: { normal: 1, high: 1 },
          conversations_by_category: {},
          conversations_by_status: { active: 2 }
        }

        return {
          data: mockStats,
          error: null,
          success: true
        }
      }

      // Lógica real con Supabase
      const supabase = await getSupabaseClient()

      const { data: stats, error } = await supabase
        .from('conversations')
        .select('status, priority')
        .eq('status', 'active')

      if (error) {
        return {
          data: null as any,
          error: `Error al obtener estadísticas: ${error.message}`,
          success: false
        }
      }

      const totalConversations = stats?.length || 0
      const priorityCounts = stats?.reduce((acc: any, conv: any) => {
        acc[conv.priority] = (acc[conv.priority] || 0) + 1
        return acc
      }, {}) || {}

      const chatStats: ChatStats = {
        total_conversations: totalConversations,
        active_conversations: totalConversations,
        waiting_conversations: 0,
        closed_conversations: 0,
        total_messages: 0,
        avg_response_time: 0,
        conversations_by_priority: priorityCounts,
        conversations_by_category: {},
        conversations_by_status: { active: totalConversations }
      }

      // Guardar en caché
      this.cacheService.set(cacheKey, chatStats, 10 * 60 * 1000) // 10 minutos

      return {
        data: chatStats,
        error: null,
        success: true
      }

    } catch (error) {
      return {
        data: null as any,
        error: error instanceof Error ? error.message : 'Error desconocido',
        success: false
      }
    }
  }

  /**
   * Obtener el servicio de tiempo real
   */
  getRealtimeService(): RealtimeService {
    return this.realtimeService
  }

  /**
   * Limpiar caché
   */
  clearCache(): void {
    this.cacheService.clear()
  }

  /**
   * Obtener estadísticas del servicio
   */
  /**
   * Eliminar una conversación
   */
  async deleteConversation(
    conversationId: string,
    userId: string
  ): Promise<ChatServiceResponse<boolean>> {
    try {
      // Usar datos mock si Supabase no está disponible
      if (this.configService.shouldUseMockData()) {
        return {
          data: true,
          error: null,
          success: true
        }
      }

      // Lógica real con Supabase
      const supabase = await getSupabaseClient()

      // Verificar que la conversación existe y obtener información
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('id, user_id, admin_id, title')
        .eq('id', conversationId)
        .single()

      if (convError || !conversation) {
        return {
          data: null as any,
          error: 'Conversación no encontrada',
          success: false
        }
      }

      // Verificar permisos del usuario
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (!profile) {
        return {
          data: null as any,
          error: 'Usuario no encontrado',
          success: false
        }
      }

      // Verificar permisos: solo el usuario propietario o un admin pueden eliminar
      const canDelete = conversation.user_id === userId || 
                       conversation.admin_id === userId || 
                       profile.role === 'admin' || 
                       profile.role === 'moderator'

      if (!canDelete) {
        return {
          data: null as any,
          error: 'No tienes permisos para eliminar esta conversación',
          success: false
        }
      }

      // Usar método directo para eliminar (sin función RPC)
      // Intentar eliminar usando una transacción
      try {
        // Paso 1: Eliminar mensajes
        const { data: deletedMessages, error: messagesError } = await supabase
          .from('messages')
          .delete()
          .eq('conversation_id', conversationId)
          .select()

        if (messagesError) {
          } else {
          }

        // Paso 2: Eliminar participantes
        const { data: deletedParticipants, error: participantsError } = await supabase
          .from('conversation_participants')
          .delete()
          .eq('conversation_id', conversationId)
          .select()

        if (participantsError) {
          } else {
          }

        // Paso 3: Eliminar la conversación
        const { data: deletedConversation, error: convDeleteError } = await supabase
          .from('conversations')
          .delete()
          .eq('id', conversationId)
          .select()

        if (convDeleteError) {
          return {
            data: null as any,
            error: `Error al eliminar conversación: ${convDeleteError.message}`,
            success: false
          }
        }

        // Verificar si realmente se eliminó
        if (!deletedConversation || deletedConversation.length === 0) {
          // Intentar verificar si la conversación aún existe
          const { data: stillExists } = await supabase
            .from('conversations')
            .select('id')
            .eq('id', conversationId)
            .single()

          if (stillExists) {
            return {
              data: null as any,
              error: 'No se pudo eliminar la conversación. Las políticas RLS pueden estar bloqueando la eliminación.',
              success: false
            }
          }
        }
        
        } catch (error) {
        return {
          data: null as any,
          error: `Error durante la eliminación: ${error instanceof Error ? error.message : 'Error desconocido'}`,
          success: false
        }
      }

      // Invalidar caché
      this.cacheService.invalidatePattern(`conversations:${userId}`)
      this.cacheService.invalidatePattern(`messages:${conversationId}`)

      return {
        data: true,
        error: null,
        success: true
      }

    } catch (error) {
      return {
        data: null as any,
        error: error instanceof Error ? error.message : 'Error desconocido',
        success: false
      }
    }
  }

  getServiceStats(): {
    config: any
    cache: any
    realtime: any
  } {
    return {
      config: this.configService.getConfig(),
      cache: this.cacheService.getStats(),
      realtime: this.realtimeService.getConnectionStatus()
    }
  }
}
