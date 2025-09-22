/**
 * Servicio de chat unificado y optimizado para producción
 * Elimina duplicaciones y mejora el rendimiento
 */

import { getSupabaseClient } from '@/lib/supabase-unified'
import { unifiedCache } from '@/lib/unified-cache-system'
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

export class ChatServiceUnified {
  private static instance: ChatServiceUnified
  private cachePrefix = 'chat_'
  private defaultTTL = 5 * 60 * 1000 // 5 minutos

  private constructor() {}

  /**
   * Obtener información del perfil de un usuario
   */
  private async getUserProfile(userId: string) {
    try {
      const supabase = await getSupabaseClient()
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('id', userId)
        .single()
      
      return profile
    } catch (error) {
      return null
    }
  }

  static getInstance(): ChatServiceUnified {
    if (!this.instance) {
      this.instance = new ChatServiceUnified()
    }
    return this.instance
  }

  /**
   * Enviar mensaje optimizado
   */
  async sendMessage(
    request: SendMessageRequest, 
    senderId: string
  ): Promise<ChatServiceResponse<Message>> {
    try {
      // Validación de entrada
      if (!request.content?.trim()) {
        return {
          data: null as any,
          error: 'El contenido del mensaje no puede estar vacío',
          success: false
        }
      }

      if (!senderId) {
        return {
          data: null as any,
          error: 'Usuario no autenticado',
          success: false
        }
      }

      const supabase = await getSupabaseClient()

      // Verificar que el usuario esté autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user || user.id !== senderId) {
        return {
          data: null as any,
          error: 'Usuario no autenticado o sesión inválida',
          success: false
        }
      }

      // Verificar acceso a la conversación
      const { data: participant } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', request.conversation_id)
        .eq('user_id', senderId)
        .single()

      if (!participant) {
        return {
          data: null as any,
          error: 'No tienes acceso a esta conversación',
          success: false
        }
      }

      // Crear mensaje
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: request.conversation_id,
          sender_id: senderId,
          content: request.content.trim(),
          message_type: request.message_type || 'text',
          file_url: request.file_url,
          file_name: request.file_name,
          file_size: request.file_size,
          file_type: request.file_type,
          reply_to_id: request.reply_to_id,
          metadata: request.metadata || {}
        })
        .select('*')
        .single()

      if (error) {
        return {
          data: null as any,
          error: 'Error al enviar el mensaje',
          success: false
        }
      }

      // Actualizar última actividad de la conversación
      await supabase
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', request.conversation_id)

      // Actualizar caché local inmediatamente con el nuevo mensaje
      const messagesCacheKey = `${this.cachePrefix}messages_${request.conversation_id}_50_0`
      const cachedMessages = await unifiedCache.get<Message[]>(messagesCacheKey)
      if (cachedMessages) {
        await unifiedCache.set(messagesCacheKey, [...cachedMessages, message], { ttl: 2 * 60 * 1000 })
      }
      
      // Invalidar solo otros patrones de mensajes (no el que acabamos de actualizar)
      await unifiedCache.invalidateByPattern(new RegExp(`${this.cachePrefix}messages_${request.conversation_id}_(?!50_0).*`))

      return {
        data: message,
        error: null,
        success: true
      }

    } catch (error) {
      return {
        data: null as any,
        error: 'Error interno del servidor',
        success: false
      }
    }
  }

  /**
   * Crear conversación optimizada
   */
  async createConversation(
    request: CreateConversationRequest,
    userId: string
  ): Promise<ChatServiceResponse<Conversation>> {
    try {
      if (!userId) {
        return {
          data: null as any,
          error: 'Usuario no autenticado',
          success: false
        }
      }

      const supabase = await getSupabaseClient()

      // Verificar que el usuario esté autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user || user.id !== userId) {
        return {
          data: null as any,
          error: 'Usuario no autenticado o sesión inválida',
          success: false
        }
      }

      // Crear conversación
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          title: request.title,
          description: request.description,
          priority: request.priority || 'normal',
          category_id: request.category_id,
          tags: request.tags || []
        })
        .select('*')
        .single()

      if (error) {
        return {
          data: null as any,
          error: 'Error al crear la conversación',
          success: false
        }
      }

      // Obtener información del usuario para la respuesta
      const userProfile = await this.getUserProfile(userId)
      const conversationWithUser = {
        ...conversation,
        user: userProfile
      }

      // Agregar participante
      const { error: participantError } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: conversation.id,
          user_id: userId,
          role: 'participant'
        })

      if (participantError) {
        }

      // Enviar mensaje inicial si se proporciona
      if (request.initial_message) {
        const messageResult = await this.sendMessage({
          conversation_id: conversation.id,
          content: request.initial_message,
          message_type: 'text'
        }, userId)
        
        if (messageResult.success) {
          conversationWithUser.last_message = messageResult.data
        }
      }

      // Invalidar caché de conversaciones del usuario
      await unifiedCache.invalidateByPattern(new RegExp(`${this.cachePrefix}conversations_user_${userId}_.*`))

      return {
        data: conversationWithUser,
        error: null,
        success: true
      }

    } catch (error) {
      return {
        data: null as any,
        error: 'Error interno del servidor',
        success: false
      }
    }
  }

  /**
   * Obtener conversaciones del usuario con caché
   */
  async getUserConversations(userId: string): Promise<ChatServiceResponse<Conversation[]>> {
    try {
      if (!userId) {
        return {
          data: null as any,
          error: 'Usuario no autenticado',
          success: false
        }
      }

      const cacheKey = `${this.cachePrefix}conversations_user_${userId}`
      
      // Intentar obtener del caché
      const cached = await unifiedCache.get(cacheKey)
      if (cached && Array.isArray(cached)) {
        return {
          data: cached as Conversation[],
          error: null,
          success: true
        }
      }

      const supabase = await getSupabaseClient()

      // Verificar que el usuario esté autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user || user.id !== userId) {
        return {
          data: null as any,
          error: 'Usuario no autenticado o sesión inválida',
          success: false
        }
      }

      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants(
            user_id,
            role,
            last_read_at,
            is_online
          )
        `)
        .eq('user_id', userId)
        .order('last_message_at', { ascending: false })

      if (error) {
        return {
          data: null as any,
          error: 'Error al obtener las conversaciones',
          success: false
        }
      }

      // Calcular mensajes no leídos y obtener último mensaje
      const conversationsWithUnread = await Promise.all(
        (conversations || []).map(async (conv) => {
          // Obtener mensajes no leídos
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', userId)

          // Obtener último mensaje
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('id, content, sender_id, created_at, message_type')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          return {
            ...conv,
            unread_count: count || 0,
            last_message: lastMessage || null
          }
        })
      )

      // Guardar en caché
      await unifiedCache.set(cacheKey, conversationsWithUnread, { ttl: this.defaultTTL })

      return {
        data: conversationsWithUnread,
        error: null,
        success: true
      }

    } catch (error) {
      return {
        data: null as any,
        error: 'Error interno del servidor',
        success: false
      }
    }
  }

  /**
   * Obtener mensajes de conversación con paginación
   */
  async getConversationMessages(
    conversationId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ChatServiceResponse<Message[]>> {
    try {
      const cacheKey = `${this.cachePrefix}messages_${conversationId}_${limit}_${offset}`
      
      // Intentar obtener del caché
      const cached = await unifiedCache.get(cacheKey)
      if (cached && Array.isArray(cached)) {
        return {
          data: cached as Message[],
          error: null,
          success: true
        }
      }

      const supabase = await getSupabaseClient()

      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return {
          data: null as any,
          error: 'Error al obtener los mensajes',
          success: false
        }
      }

      // Guardar en caché por menos tiempo (mensajes cambian más frecuentemente)
      await unifiedCache.set(cacheKey, messages || [], { ttl: 2 * 60 * 1000 }) // 2 minutos

      return {
        data: messages || [],
        error: null,
        success: true
      }

    } catch (error) {
      return {
        data: null as any,
        error: 'Error interno del servidor',
        success: false
      }
    }
  }

  /**
   * Marcar mensajes como leídos
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<ChatServiceResponse<void>> {
    try {
      const supabase = await getSupabaseClient()

      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('is_read', false)

      // Actualizar último tiempo de lectura del participante
      await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)

      // Invalidar caché
      await this.invalidateConversationCache(conversationId)

      return {
        data: null as any,
        error: null,
        success: true
      }

    } catch (error) {
      return {
        data: null as any,
        error: 'Error interno del servidor',
        success: false
      }
    }
  }

  /**
   * Obtener todas las conversaciones (para admins)
   */
  async getAllConversations(filters: ChatFilters = {}): Promise<ChatServiceResponse<Conversation[]>> {
    try {
      const cacheKey = `${this.cachePrefix}conversations_all_${JSON.stringify(filters)}`
      
      // Intentar obtener del caché
      const cached = await unifiedCache.get(cacheKey)
      if (cached && Array.isArray(cached)) {
        return {
          data: cached as Conversation[],
          error: null,
          success: true
        }
      }

      const supabase = await getSupabaseClient()

      let query = supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants(
            user_id,
            role,
            last_read_at,
            is_online
          )
        `)

      // Aplicar filtros
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from)
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to)
      }

      const { data: conversations, error } = await query
        .order('last_message_at', { ascending: false })

      if (error) {
        return {
          data: null as any,
          error: 'Error al obtener las conversaciones',
          success: false
        }
      }

      // Calcular mensajes no leídos y obtener último mensaje para todas las conversaciones
      const conversationsWithUnread = await Promise.all(
        (conversations || []).map(async (conv) => {
          // Obtener mensajes no leídos
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)

          // Obtener último mensaje
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('id, content, sender_id, created_at, message_type')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          return {
            ...conv,
            unread_count: count || 0,
            last_message: lastMessage || null
          }
        })
      )

      // Guardar en caché
      await unifiedCache.set(cacheKey, conversationsWithUnread, { ttl: this.defaultTTL })

      return {
        data: conversationsWithUnread,
        error: null,
        success: true
      }

    } catch (error) {
      return {
        data: null as any,
        error: 'Error interno del servidor',
        success: false
      }
    }
  }

  /**
   * Invalidar caché de conversación
   */
  private async invalidateConversationCache(conversationId: string): Promise<void> {
    // Solo invalidar mensajes de esta conversación específica
    await unifiedCache.invalidateByPattern(new RegExp(`${this.cachePrefix}messages_${conversationId}_.*`))
    // Invalidar conversaciones del usuario específico solo si es necesario
    // await unifiedCache.invalidateByPattern(new RegExp(`${this.cachePrefix}conversations_user_.*`))
  }

  /**
   * Limpiar caché de chat
   */
  async clearChatCache(): Promise<void> {
    await unifiedCache.invalidateByPattern(new RegExp(`${this.cachePrefix}.*`))
  }
}

// Exportar instancia singleton
export const chatService = ChatServiceUnified.getInstance()
