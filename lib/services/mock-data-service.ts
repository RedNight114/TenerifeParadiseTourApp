/**
 * Servicio centralizado para datos mock del chat
 * Elimina la duplicación de datos mock en todo el sistema
 */

import { Message, Conversation, ConversationParticipant } from '@/lib/types/chat'

export class MockDataService {
  private static instance: MockDataService
  private mockConversations: Conversation[]
  private mockMessages: Message[]
  private mockParticipants: ConversationParticipant[]

  private constructor() {
    this.mockConversations = this.generateMockConversations()
    this.mockMessages = this.generateMockMessages()
    this.mockParticipants = this.generateMockParticipants()
  }

  static getInstance(): MockDataService {
    if (!this.instance) {
      this.instance = new MockDataService()
    }
    return this.instance
  }

  private generateMockConversations(): Conversation[] {
    return [
      {
        id: 'conv-1',
        title: 'Consulta sobre tours de senderismo',
        description: 'Información sobre tours disponibles en Anaga',
        user_id: 'demo-user-123',
        admin_id: undefined,
        status: 'active',
        priority: 'normal',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
        unread_count: 0,
        user_full_name: 'Usuario de Prueba',
        user_email: 'usuario@ejemplo.com'
      },
      {
        id: 'conv-2',
        title: 'Consulta sobre reservas y precios',
        description: 'Información sobre disponibilidad y precios',
        user_id: 'demo-user-123',
        admin_id: undefined,
        status: 'active',
        priority: 'high',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
        unread_count: 2,
        user_full_name: 'Usuario de Prueba',
        user_email: 'usuario@ejemplo.com'
      }
    ]
  }

  private generateMockMessages(): Message[] {
    return [
      {
        id: 'msg-1',
        conversation_id: 'conv-1',
        sender_id: 'demo-user-123',
        content: 'Hola, tengo una consulta sobre los tours disponibles',
        message_type: 'text',
        metadata: {},
        created_at: new Date(Date.now() - 3600000).toISOString(),
        is_read: true,
      },
      {
        id: 'msg-2',
        conversation_id: 'conv-1',
        sender_id: 'admin-user-456',
        content: '¡Hola! Estaré encantado de ayudarte con información sobre nuestros tours. ¿Qué tipo de experiencia estás buscando?',
        message_type: 'text',
        metadata: {},
        created_at: new Date(Date.now() - 1800000).toISOString(),
        is_read: true,
      },
      {
        id: 'msg-3',
        conversation_id: 'conv-1',
        sender_id: 'demo-user-123',
        content: 'Me interesan los tours de senderismo y los paseos en barco',
        message_type: 'text',
        metadata: {},
        created_at: new Date().toISOString(),
        is_read: false,
      },
      {
        id: 'msg-4',
        conversation_id: 'conv-2',
        sender_id: 'demo-user-123',
        content: '¿Cuáles son los precios para el próximo mes?',
        message_type: 'text',
        metadata: {},
        created_at: new Date(Date.now() - 7200000).toISOString(),
        is_read: true,
      },
      {
        id: 'msg-5',
        conversation_id: 'conv-2',
        sender_id: 'admin-user-456',
        content: 'Te envío la información de precios por email',
        message_type: 'text',
        metadata: {},
        created_at: new Date(Date.now() - 3600000).toISOString(),
        is_read: false,
      }
    ]
  }

  private generateMockParticipants(): ConversationParticipant[] {
    return [
      {
        conversation_id: 'conv-1',
        user_id: 'demo-user-123',
        role: 'user',
        joined_at: new Date(Date.now() - 3600000).toISOString(),
        last_read_at: new Date().toISOString(),
        is_online: true,
        is_typing: false,
        notification_preferences: {
          email: true,
          push: true,
          sms: false
        },
        user: {
          id: 'demo-user-123',
          email: 'usuario@ejemplo.com',
          full_name: 'Usuario de Prueba',
          avatar_url: '/images/user-avatar.jpg',
          role: 'user',
          is_online: true
        },
        unread_count: 0
      },
      {
        conversation_id: 'conv-1',
        user_id: 'admin-user-456',
        role: 'admin',
        joined_at: new Date(Date.now() - 1800000).toISOString(),
        last_read_at: new Date().toISOString(),
        is_online: true,
        is_typing: false,
        notification_preferences: {
          email: true,
          push: true,
          sms: false
        },
        user: {
          id: 'admin-user-456',
          email: 'soporte@tenerifeparadise.com',
          full_name: 'Soporte Tenerife Paradise Tour',
          avatar_url: '/images/logo-tenerife.png',
          role: 'admin',
          is_online: true
        },
        unread_count: 0
      }
    ]
  }

  // Métodos para obtener datos mock
  getMockConversations(userId?: string): Conversation[] {
    if (userId) {
      return this.mockConversations.filter(conv => conv.user_id === userId)
    }
    return this.mockConversations
  }

  getMockMessages(conversationId: string): Message[] {
    return this.mockMessages.filter(msg => msg.conversation_id === conversationId)
  }

  getMockParticipants(conversationId: string): ConversationParticipant[] {
    return this.mockParticipants.filter(participant => participant.conversation_id === conversationId)
  }

  // Métodos para crear datos mock dinámicos
  createMockMessage(
    conversationId: string, 
    senderId: string, 
    content: string, 
    messageType: 'text' | 'image' | 'file' | 'system' | 'notification' = 'text'
  ): Message {
    const message: Message = {
      id: `mock-msg-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      message_type: messageType,
      metadata: {},
      created_at: new Date().toISOString(),
      is_read: false,
    }

    this.mockMessages.push(message)
    return message
  }

  createMockConversation(
    title: string,
    userId: string,
    messageContent: string
  ): Conversation {
    const conversation: Conversation = {
      id: `mock-conv-${Date.now()}`,
      title,
      description: messageContent,
      user_id: userId,
      admin_id: undefined,
      status: 'active',
      priority: 'normal',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
      unread_count: 0,
      user_full_name: 'Usuario de Prueba',
      user_email: 'usuario@ejemplo.com'
    }

    this.mockConversations.unshift(conversation)
    
    // Crear mensaje inicial
    this.createMockMessage(conversation.id, userId, messageContent)
    
    return conversation
  }

  // Método para simular respuestas automáticas del admin
  simulateAdminResponse(conversationId: string): Message {
    const responses = [
      '¡Hola! Gracias por contactarnos. ¿En qué puedo ayudarte?',
      'Perfecto, te ayudo con esa información.',
      'Excelente pregunta. Te envío los detalles por email.',
      '¡Por supuesto! Estoy aquí para ayudarte.',
      'Entiendo tu consulta. Te proporciono la información que necesitas.'
    ]
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    
    return this.createMockMessage(conversationId, 'admin-user-456', randomResponse)
  }

  // Método para limpiar datos mock (útil para testing)
  clearMockData(): void {
    this.mockConversations = []
    this.mockMessages = []
    this.mockParticipants = []
  }
}
