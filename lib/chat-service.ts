import { createClient } from '@supabase/supabase-js'
import { Message, SendMessageRequest, Conversation, ChatFilters, ChatStats, TypingIndicator } from './types/chat'

// Crear cliente Supabase estándar
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export class ChatService {
  /**
   * Enviar mensaje
   */
  static async sendMessage(request: SendMessageRequest, senderId: string): Promise<Message> {
    try {
      // Enviando mensaje

      // Validar que el contenido no esté vacío
      if (!request.content || request.content.trim() === '') {
        throw new Error('El contenido del mensaje no puede estar vacío')
      }

      // 1. Verificar que la conversación existe y está activa
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select(`
          id, 
          title, 
          user_id, 
          status
        `)
        .eq('id', request.conversation_id)
        .eq('status', 'active')
        .single();

      if (convError || !convData) {
        // Error al obtener conversación
        throw new Error(`Conversación no encontrada o inactiva: ${convError?.message || 'Conversación no existe'}`);
      }

      // 2. Verificar permisos del usuario
      const isCreator = convData.user_id === senderId;
      
      if (!isCreator) {
        // Si no es el creador, verificar si es admin
        // Usuario no es creador, verificando si es admin
        
        const { data: adminData, error: adminError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', senderId)
          .eq('role', 'admin')
          .single();

        const isAdmin = !adminError && adminData?.role === 'admin';
        
        if (!isAdmin) {
          throw new Error('No tienes permisos para enviar mensajes en esta conversación');
        }
        
        // Usuario es admin, permitiendo envío de mensaje
      } else {
        // Usuario es creador de la conversación, permitiendo envío de mensaje
      }

      // 3. Insertar el mensaje
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: request.conversation_id,
          sender_id: senderId,
          content: request.content.trim(), // Asegurar que no esté vacío
          message_type: request.message_type || 'text',
          file_url: request.file_url,
          file_name: request.file_name,
          file_size: request.file_size,
          file_type: request.file_type
        })
        .select()
        .single();

      if (messageError) {
        // Error al insertar mensaje
        throw new Error(`Error al insertar mensaje: ${messageError.message}`);
      }

      // 4. Actualizar timestamp de la conversación
      await supabase
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', request.conversation_id);

      // 5. Si es admin, agregarlo como participante (opcional, para tracking)
      if (!isCreator) {
        try {
          await supabase
            .from('conversation_participants')
            .upsert({
              conversation_id: request.conversation_id,
              user_id: senderId,
              role: 'admin',
              joined_at: new Date().toISOString(),
              last_read_at: new Date().toISOString(),
              is_online: true
            });
        } catch (error) {
          // No se pudo agregar admin como participante
        }
      }
return message;
    } catch (error) {
throw error;
    }
  }

  /**
   * Crear conversación
   */
  static async createConversation(
    title: string,
    userId: string,
    messageContent: string
  ): Promise<Conversation> {
    try {
// Validar que el mensaje inicial no esté vacío
      if (!messageContent || messageContent.trim() === '') {
        messageContent = 'Nueva consulta iniciada'; // Mensaje por defecto
      }

      // 1. Crear la conversación
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          title: title || 'Nueva consulta',
          user_id: userId,
          status: 'active',
          priority: 'normal',
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (convError) {
throw convError;
      }

      // 2. Agregar el usuario como participante
      const { error: participantError } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: conversation.id,
          user_id: userId,
          role: 'user',
          joined_at: new Date().toISOString(),
          last_read_at: new Date().toISOString(),
          is_online: true
        });

      if (participantError) {
throw participantError;
      }

      // 3. Crear el mensaje inicial
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: userId,
          content: messageContent.trim(), // Asegurar que no esté vacío
          message_type: 'text'
        })
        .select()
        .single();

      if (messageError) {
throw messageError;
      }
return conversation;
    } catch (error) {
throw error;
    }
  }

  /**
   * Obtener mensajes de una conversación
   */
  static async getConversationMessages(
    conversationId: string, 
    limit?: number, 
    offset?: number
  ): Promise<Message[]> {
    try {
let query = supabase
        .from('message_summary')
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          message_type,
          file_url,
          file_name,
          file_size,
          file_type,
          is_read,
          created_at,
          sender_full_name,
          sender_email,
          sender_role,
          sender_avatar_url,
          reply_to_content,
          reply_to_sender_id,
          reply_to_sender_name
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      // Aplicar paginación si se proporciona
      if (limit) {
        query = query.limit(limit);
      }
      if (offset) {
        query = query.range(offset, offset + (limit || 50) - 1);
      }

      const { data: messages, error } = await query;

      if (error) {
throw error;
      }
return messages || [];
    } catch (error) {
throw error;
    }
  }

  /**
   * Obtener participantes de una conversación
   */
  static async getConversationParticipants(conversationId: string): Promise<any[]> {
    try {
const { data: participants, error } = await supabase
        .from('conversation_participants')
        .select(`
          id,
          conversation_id,
          user_id,
          role,
          joined_at,
          last_read_at,
          is_online
        `)
        .eq('conversation_id', conversationId);

      if (error) {
throw error;
      }
return participants || [];
    } catch (error) {
throw error;
    }
  }

  /**
   * Obtener conversaciones no asignadas (para administradores)
   */
  static async getUnassignedConversations(): Promise<any[]> {
    try {
const { data: conversations, error } = await supabase
        .from('conversation_summary')
        .select(`
          id,
          title,
          description,
          user_id,
          admin_id,
          status,
          priority,
          category_id,
          tags,
          created_at,
          last_message_at,
          updated_at,
          last_message_content,
          last_message_created_at,
          last_message_sender_id,
          user_full_name,
          user_email,
          user_role,
          user_avatar_url,
          admin_full_name,
          admin_email,
          admin_role,
          category_name,
          unread_count,
          total_messages
        `)
        .is('admin_id', null)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
throw error;
      }
return conversations || [];
    } catch (error) {
throw error;
    }
  }

  /**
   * Obtener conversaciones del administrador
   */
  static async getAdminConversations(adminId: string): Promise<any[]> {
    try {
const { data: conversations, error } = await supabase
        .from('conversation_summary')
        .select(`
          id,
          title,
          description,
          user_id,
          admin_id,
          status,
          priority,
          category_id,
          tags,
          created_at,
          last_message_at,
          updated_at,
          last_message_content,
          last_message_created_at,
          last_message_sender_id,
          user_full_name,
          user_email,
          user_role,
          user_avatar_url,
          admin_full_name,
          admin_email,
          admin_role,
          category_name,
          unread_count,
          total_messages
        `)
        .eq('admin_id', adminId)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false });

      if (error) {
}
return conversations || [];
    } catch (error) {
throw error;
    }
  }

  /**
   * Obtener todas las conversaciones (para administradores)
   */
  static async getAllConversations(filters?: ChatFilters): Promise<any[]> {
    try {
let query = supabase
        .from('conversation_summary')
        .select(`
          id,
          title,
          description,
          user_id,
          admin_id,
          status,
          priority,
          category_id,
          tags,
          created_at,
          last_message_at,
          updated_at,
          last_message_content,
          last_message_created_at,
          last_message_sender_id,
          user_full_name,
          user_email,
          user_role,
          user_avatar_url,
          admin_full_name,
          admin_email,
          admin_role,
          category_name,
          unread_count,
          total_messages
        `)
        .order('last_message_at', { ascending: false });

      // Aplicar filtros si están presentes
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,user_email.ilike.%${filters.search}%,user_full_name.ilike.%${filters.search}%`);
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data: conversations, error } = await query;

      if (error) {
throw error;
      }
return conversations || [];
    } catch (error) {
throw error;
    }
  }

  /**
   * Eliminar conversación
   */
  static async deleteConversation(conversationId: string): Promise<void> {
    try {
// Primero eliminar mensajes
      await supabase.from('messages').delete().eq('conversation_id', conversationId);
      // Luego eliminar participantes
      await supabase.from('conversation_participants').delete().eq('conversation_id', conversationId);
      // Finalmente eliminar la conversación
      await supabase.from('conversations').delete().eq('id', conversationId);
} catch (error) {
throw error;
    }
  }

  /**
   * Marcar mensajes como leídos
   */
  static async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
const { error } = await supabase
        .from('conversation_participants')
        .update({
          last_read_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);

      if (error) {
throw error;
      }
} catch (error) {
throw error;
    }
  }

  /**
   * Obtener conversaciones del usuario
   */
  static async getUserConversations(userId: string): Promise<any[]> {
    try {
const { data: conversations, error } = await supabase
        .from('conversation_summary')
        .select(`
          id,
          title,
          description,
          user_id,
          admin_id,
          status,
          priority,
          category_id,
          tags,
          created_at,
          last_message_at,
          updated_at,
          last_message_content,
          last_message_created_at,
          last_message_sender_id,
          user_full_name,
          user_email,
          user_role,
          user_avatar_url,
          admin_full_name,
          admin_email,
          admin_role,
          category_name,
          unread_count,
          total_messages
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false });

      if (error) {
throw error;
      }
return conversations || [];
    } catch (error) {
throw error;
    }
  }

  /**
   * Crear conversación con request
   */
  static async createConversationWithRequest(request: any, userId: string): Promise<any> {
    try {
const title = request.title || 'Nueva consulta'
      const messageContent = request.initial_message || 'Nueva consulta iniciada'

      return await this.createConversation(title, userId, messageContent)
    } catch (error) {
throw error;
    }
  }

  /**
   * Actualizar conversación
   */
  static async updateConversation(conversationId: string, updates: any): Promise<any> {
    try {
const { data: conversation, error } = await supabase
        .from('conversations')
        .update(updates)
        .eq('id', conversationId)
        .select()
        .single();

      if (error) {
throw error;
      }
return conversation;
    } catch (error) {
throw error;
    }
  }

  /**
   * Actualizar indicador de escritura
   */
  static async updateTypingIndicator(conversationId: string, userId: string, isTyping: boolean): Promise<void> {
    try {
const { error } = await supabase
        .from('conversation_participants')
        .update({
          is_typing: isTyping,
          typing_since: isTyping ? new Date().toISOString() : null
        })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);

      if (error) {
throw error;
      }
} catch (error) {
throw error;
    }
  }

  /**
   * Obtener estadísticas del chat
   */
  static async getChatStats(): Promise<ChatStats> {
    try {
const { data: stats, error } = await supabase
        .from('conversations')
        .select('status, priority')
        .eq('status', 'active');

      if (error) {
throw error;
      }

      const totalConversations = stats?.length || 0
      const activeConversations = stats?.filter(s => s.status === 'active').length || 0

      const result: ChatStats = {
        total_conversations: totalConversations,
        active_conversations: activeConversations,
        waiting_conversations: 0,
        closed_conversations: 0,
        total_messages: 0,
        avg_response_time: 0,
        conversations_by_priority: {},
        conversations_by_category: {},
        conversations_by_status: { active: activeConversations }
      }
return result;
    } catch (error) {
throw error;
    }
  }

  /**
   * Suscribirse a conversación para mensajes en tiempo real
   */
  static subscribeToConversation(conversationId: string, callback: (message: any) => void) {
    try {
const channel = supabase.channel(`conversation-${conversationId}`)
      
      channel
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          }, 
          (payload) => {
callback(payload.new)
          }
        )
        .subscribe()

      return {
        unsubscribe: () => {
channel.unsubscribe()
        }
      }
    } catch (error) {
return {
        unsubscribe: () => {}
      }
    }
  }

  /**
   * Suscribirse a indicadores de escritura
   */
  static subscribeToTypingIndicators(conversationId: string, callback: (typingIndicator: TypingIndicator) => void) {
    try {
const channel = supabase.channel(`typing-${conversationId}`)
      
      channel
        .on('postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'conversation_participants',
            filter: `conversation_id=eq.${conversationId}`
          }, 
          (payload) => {
            if (payload.new.is_typing !== payload.old.is_typing) {
callback({
                conversation_id: conversationId,
                user_id: payload.new.user_id,
                user_name: payload.new.user_id, // Usar ID como nombre temporal
                is_typing: payload.new.is_typing,
                timestamp: Date.now()
              })
            }
          }
        )
        .subscribe()

      return {
        unsubscribe: () => {
channel.unsubscribe()
        }
      }
    } catch (error) {
return {
        unsubscribe: () => {}
      }
    }
  }

  /**
   * Suscribirse a notificaciones de eliminación de conversaciones
   */
  static subscribeToConversationDeletion(callback: (deletedConversationId: string) => void) {
    try {
const channel = supabase.channel('conversation-deletion-notifications')
      
      channel
        .on('broadcast', { event: 'conversation-deleted' }, (payload) => {
          if (payload.payload?.conversation_id) {
callback(payload.payload.conversation_id)
          }
        })
        .subscribe()

      return {
        unsubscribe: () => {
channel.unsubscribe()
        }
      }
    } catch (error) {
return {
        unsubscribe: () => {}
      }
    }
  }

  /**
   * Asignar administrador a una conversación
   */
  static async assignAdminToConversation(conversationId: string, adminId: string): Promise<any> {
    try {
// Actualizar la conversación con el admin asignado
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .update({
          admin_id: adminId,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)
        .select()
        .single();

      if (convError) {
throw convError;
      }

      // Agregar el admin como participante
      const { error: participantError } = await supabase
        .from('conversation_participants')
        .upsert({
          conversation_id: conversationId,
          user_id: adminId,
          role: 'admin',
          joined_at: new Date().toISOString(),
          last_read_at: new Date().toISOString(),
          is_online: true
        });

      if (participantError) {
}
return conversation;
    } catch (error) {
throw error;
    }
  }

  /**
   * Notificar que una conversación ha sido eliminada
   */
  static async notifyConversationDeleted(conversationId: string): Promise<void> {
    try {
const channel = supabase.channel('conversation-deleted')
      await channel.subscribe()
      await channel.send({
        type: 'broadcast',
        event: 'conversation-deleted',
        payload: {
          conversation_id: conversationId,
          deleted_at: new Date().toISOString()
        }
      })
      await channel.unsubscribe()
} catch (error) {
}
  }
}


