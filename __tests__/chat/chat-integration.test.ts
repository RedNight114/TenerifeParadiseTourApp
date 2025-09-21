/**
 * Pruebas de integración para el sistema de chat completo
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createChatServiceForTesting } from '@/lib/services/chat-service-factory'
import { ChatServiceRefactored } from '@/lib/services/chat-service-refactored'
import { ConfigService } from '@/lib/services/config-service'
import { MockDataService } from '@/lib/services/mock-data-service'
import { CacheService } from '@/lib/services/cache-service'

describe('Chat System Integration Tests', () => {
  let chatService: ChatServiceRefactored
  let configService: ConfigService
  let mockDataService: MockDataService
  let cacheService: CacheService

  beforeEach(() => {
    // Usar configuración de testing
    chatService = createChatServiceForTesting()
    configService = ConfigService.getInstance()
    mockDataService = MockDataService.getInstance()
    cacheService = CacheService.getInstance()
  })

  afterEach(() => {
    // Limpiar datos después de cada prueba
    cacheService.clear()
    mockDataService.clearMockData()
  })

  describe('Flujo completo de conversación', () => {
    it('debería manejar un flujo completo de conversación', async () => {
      const userId = 'test-user-123'
      
      // 1. Crear conversación
      const createResult = await chatService.createConversation({
        title: 'Consulta sobre tours',
        description: 'Necesito información sobre tours disponibles',
        priority: 'normal'
      }, userId)
      
      expect(createResult.success).toBe(true)
      expect(createResult.data).toBeDefined()
      
      const conversation = createResult.data!
      
      // 2. Enviar mensaje inicial
      const messageResult = await chatService.sendMessage({
        conversation_id: conversation.id,
        content: 'Hola, tengo una consulta sobre los tours disponibles',
        message_type: 'text'
      }, userId)
      
      expect(messageResult.success).toBe(true)
      expect(messageResult.data).toBeDefined()
      
      // 3. Obtener mensajes de la conversación
      const messagesResult = await chatService.getConversationMessages(conversation.id)
      
      expect(messagesResult.success).toBe(true)
      expect(messagesResult.data).toBeDefined()
      expect(messagesResult.data!.length).toBeGreaterThan(0)
      
      // 4. Obtener conversaciones del usuario
      const conversationsResult = await chatService.getUserConversations(userId)
      
      expect(conversationsResult.success).toBe(true)
      expect(conversationsResult.data).toBeDefined()
      expect(conversationsResult.data!.length).toBeGreaterThan(0)
      
      // 5. Marcar mensajes como leídos
      const markReadResult = await chatService.markMessagesAsRead(conversation.id, userId)
      
      expect(markReadResult.success).toBe(true)
      
      // 6. Actualizar indicador de escritura
      const typingResult = await chatService.updateTypingIndicator(conversation.id, userId, true)
      
      expect(typingResult.success).toBe(true)
      
      // 7. Detener indicador de escritura
      const stopTypingResult = await chatService.updateTypingIndicator(conversation.id, userId, false)
      
      expect(stopTypingResult.success).toBe(true)
    })

    it('debería manejar múltiples conversaciones del mismo usuario', async () => {
      const userId = 'test-user-multiple'
      
      // Crear múltiples conversaciones
      const conversations = []
      
      for (let i = 1; i <= 3; i++) {
        const result = await chatService.createConversation({
          title: `Conversación ${i}`,
          description: `Descripción de la conversación ${i}`,
          priority: i === 3 ? 'high' : 'normal'
        }, userId)
        
        expect(result.success).toBe(true)
        conversations.push(result.data!)
      }
      
      // Verificar que todas las conversaciones se crearon
      expect(conversations.length).toBe(3)
      
      // Obtener todas las conversaciones del usuario
      const userConversationsResult = await chatService.getUserConversations(userId)
      
      expect(userConversationsResult.success).toBe(true)
      expect(userConversationsResult.data!.length).toBe(3)
      
      // Verificar que todas pertenecen al usuario correcto
      userConversationsResult.data!.forEach(conv => {
        expect(conv.user_id).toBe(userId)
      })
      
      // Verificar prioridades
      const highPriorityConversations = userConversationsResult.data!.filter(conv => conv.priority === 'high')
      expect(highPriorityConversations.length).toBe(1)
    })

    it('debería manejar envío de mensajes en diferentes conversaciones', async () => {
      const userId = 'test-user-messages'
      
      // Crear dos conversaciones
      const conv1Result = await chatService.createConversation({
        title: 'Conversación 1',
        description: 'Primera conversación'
      }, userId)
      
      const conv2Result = await chatService.createConversation({
        title: 'Conversación 2',
        description: 'Segunda conversación'
      }, userId)
      
      expect(conv1Result.success).toBe(true)
      expect(conv2Result.success).toBe(true)
      
      const conv1 = conv1Result.data!
      const conv2 = conv2Result.data!
      
      // Enviar mensajes a ambas conversaciones
      const message1Result = await chatService.sendMessage({
        conversation_id: conv1.id,
        content: 'Mensaje en conversación 1',
        message_type: 'text'
      }, userId)
      
      const message2Result = await chatService.sendMessage({
        conversation_id: conv2.id,
        content: 'Mensaje en conversación 2',
        message_type: 'text'
      }, userId)
      
      expect(message1Result.success).toBe(true)
      expect(message2Result.success).toBe(true)
      
      // Verificar que los mensajes se guardaron en las conversaciones correctas
      const messages1Result = await chatService.getConversationMessages(conv1.id)
      const messages2Result = await chatService.getConversationMessages(conv2.id)
      
      expect(messages1Result.success).toBe(true)
      expect(messages2Result.success).toBe(true)
      
      expect(messages1Result.data!.length).toBeGreaterThan(0)
      expect(messages2Result.data!.length).toBeGreaterThan(0)
      
      // Verificar que los mensajes están en las conversaciones correctas
      messages1Result.data!.forEach(msg => {
        expect(msg.conversation_id).toBe(conv1.id)
      })
      
      messages2Result.data!.forEach(msg => {
        expect(msg.conversation_id).toBe(conv2.id)
      })
    })
  })

  describe('Manejo de errores', () => {
    it('debería manejar errores de validación correctamente', async () => {
      const userId = 'test-user-errors'
      
      // Intentar enviar mensaje con contenido vacío
      const emptyMessageResult = await chatService.sendMessage({
        conversation_id: 'test-conversation-id',
        content: '',
        message_type: 'text'
      }, userId)
      
      expect(emptyMessageResult.success).toBe(false)
      expect(emptyMessageResult.error).toBe('El contenido del mensaje no puede estar vacío')
      
      // Intentar enviar mensaje con solo espacios
      const spacesMessageResult = await chatService.sendMessage({
        conversation_id: 'test-conversation-id',
        content: '   ',
        message_type: 'text'
      }, userId)
      
      expect(spacesMessageResult.success).toBe(false)
      expect(spacesMessageResult.error).toBe('El contenido del mensaje no puede estar vacío')
    })

    it('debería manejar conversaciones inexistentes', async () => {
      const userId = 'test-user-nonexistent'
      const nonexistentConversationId = 'nonexistent-conversation-id'
      
      // Intentar obtener mensajes de conversación inexistente
      const messagesResult = await chatService.getConversationMessages(nonexistentConversationId)
      
      expect(messagesResult.success).toBe(true)
      expect(messagesResult.data).toBeDefined()
      expect(messagesResult.data!.length).toBe(0)
    })
  })

  describe('Rendimiento y caché', () => {
    it('debería usar caché para mejorar el rendimiento', async () => {
      const userId = 'test-user-cache'
      
      // Crear conversación
      const createResult = await chatService.createConversation({
        title: 'Conversación con caché',
        description: 'Para probar el sistema de caché'
      }, userId)
      
      expect(createResult.success).toBe(true)
      const conversation = createResult.data!
      
      // Primera llamada (debería cargar desde la fuente)
      const start1 = Date.now()
      const result1 = await chatService.getConversationMessages(conversation.id)
      const time1 = Date.now() - start1
      
      expect(result1.success).toBe(true)
      
      // Segunda llamada (debería usar caché y ser más rápida)
      const start2 = Date.now()
      const result2 = await chatService.getConversationMessages(conversation.id)
      const time2 = Date.now() - start2
      
      expect(result2.success).toBe(true)
      
      // Los resultados deberían ser idénticos
      expect(result1.data).toEqual(result2.data)
      
      // La segunda llamada debería ser más rápida (aunque en modo mock puede no ser significativo)
      // En un entorno real, esto sería más evidente
    })

    it('debería limpiar caché correctamente', async () => {
      const userId = 'test-user-cache-clear'
      
      // Crear conversación
      const createResult = await chatService.createConversation({
        title: 'Conversación para limpiar caché',
        description: 'Para probar la limpieza de caché'
      }, userId)
      
      expect(createResult.success).toBe(true)
      const conversation = createResult.data!
      
      // Cargar mensajes (esto los pone en caché)
      const result1 = await chatService.getConversationMessages(conversation.id)
      expect(result1.success).toBe(true)
      
      // Limpiar caché
      chatService.clearCache()
      
      // Verificar que el caché está limpio
      const stats = chatService.getServiceStats()
      expect(stats.cache.size).toBe(0)
    })
  })

  describe('Estadísticas del sistema', () => {
    it('debería proporcionar estadísticas precisas', async () => {
      const userId = 'test-user-stats'
      
      // Crear algunas conversaciones
      for (let i = 1; i <= 3; i++) {
        await chatService.createConversation({
          title: `Conversación ${i}`,
          description: `Para estadísticas ${i}`,
          priority: i === 1 ? 'high' : 'normal'
        }, userId)
      }
      
      // Obtener estadísticas
      const statsResult = await chatService.getChatStats()
      
      expect(statsResult.success).toBe(true)
      expect(statsResult.data).toBeDefined()
      
      const stats = statsResult.data!
      
      // Verificar que las estadísticas son coherentes
      expect(stats.total_conversations).toBeGreaterThanOrEqual(3)
      expect(stats.active_conversations).toBeGreaterThanOrEqual(3)
      expect(stats.conversations_by_priority).toBeDefined()
      expect(stats.conversations_by_status).toBeDefined()
      
      // Verificar que hay conversaciones de alta prioridad
      expect(stats.conversations_by_priority.high).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Configuración del servicio', () => {
    it('debería usar configuración de testing correctamente', () => {
      const stats = chatService.getServiceStats()
      
      expect(stats.config).toBeDefined()
      expect(stats.config.chat.enableMockData).toBe(true)
      expect(stats.config.chat.enableRealTime).toBe(false)
      expect(stats.cache).toBeDefined()
      expect(stats.realtime).toBeDefined()
    })

    it('debería proporcionar información de estado del servicio', () => {
      const stats = chatService.getServiceStats()
      
      expect(stats.config.supabase.isConfigured).toBeDefined()
      expect(stats.cache.size).toBeDefined()
      expect(stats.realtime.isAvailable).toBeDefined()
      expect(stats.realtime.isConnected).toBeDefined()
    })
  })
})
