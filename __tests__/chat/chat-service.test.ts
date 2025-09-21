/**
 * Pruebas unitarias para el ChatService refactorizado
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ChatServiceRefactored } from '@/lib/services/chat-service-refactored'
import { ConfigService } from '@/lib/services/config-service'
import { MockDataService } from '@/lib/services/mock-data-service'
import { CacheService } from '@/lib/services/cache-service'
import { RealtimeService } from '@/lib/services/realtime-service'

// Mock de Supabase
vi.mock('@/lib/supabase-unified', () => ({
  getSupabaseClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: 'test-message-id' },
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null
        }))
      }))
    }))
  }))
}))

describe('ChatServiceRefactored', () => {
  let chatService: ChatServiceRefactored
  let configService: ConfigService
  let mockDataService: MockDataService
  let cacheService: CacheService
  let realtimeService: RealtimeService

  beforeEach(() => {
    // Limpiar instancias singleton
    vi.clearAllMocks()
    
    // Configurar servicios
    configService = ConfigService.getInstance()
    mockDataService = MockDataService.getInstance()
    cacheService = CacheService.getInstance()
    realtimeService = RealtimeService.getInstance()
    
    chatService = ChatServiceRefactored.getInstance()
  })

  afterEach(() => {
    // Limpiar caché después de cada prueba
    cacheService.clear()
    mockDataService.clearMockData()
  })

  describe('sendMessage', () => {
    it('debería enviar un mensaje exitosamente en modo mock', async () => {
      // Configurar para usar datos mock
      vi.spyOn(configService, 'shouldUseMockData').mockReturnValue(true)
      
      const request = {
        conversation_id: 'test-conversation-id',
        content: 'Hola, este es un mensaje de prueba',
        message_type: 'text' as const
      }
      
      const senderId = 'test-user-id'
      
      const result = await chatService.sendMessage(request, senderId)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.content).toBe(request.content)
      expect(result.data.conversation_id).toBe(request.conversation_id)
      expect(result.data.sender_id).toBe(senderId)
      expect(result.error).toBeNull()
    })

    it('debería fallar si el contenido está vacío', async () => {
      const request = {
        conversation_id: 'test-conversation-id',
        content: '',
        message_type: 'text' as const
      }
      
      const senderId = 'test-user-id'
      
      const result = await chatService.sendMessage(request, senderId)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('El contenido del mensaje no puede estar vacío')
      expect(result.data).toBeNull()
    })

    it('debería fallar si el contenido solo tiene espacios en blanco', async () => {
      const request = {
        conversation_id: 'test-conversation-id',
        content: '   ',
        message_type: 'text' as const
      }
      
      const senderId = 'test-user-id'
      
      const result = await chatService.sendMessage(request, senderId)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('El contenido del mensaje no puede estar vacío')
      expect(result.data).toBeNull()
    })
  })

  describe('createConversation', () => {
    it('debería crear una conversación exitosamente en modo mock', async () => {
      vi.spyOn(configService, 'shouldUseMockData').mockReturnValue(true)
      
      const request = {
        title: 'Nueva consulta de prueba',
        description: 'Esta es una consulta de prueba',
        priority: 'normal' as const
      }
      
      const userId = 'test-user-id'
      
      const result = await chatService.createConversation(request, userId)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.title).toBe(request.title)
      expect(result.data.user_id).toBe(userId)
      expect(result.data.status).toBe('active')
      expect(result.data.priority).toBe(request.priority)
      expect(result.error).toBeNull()
    })

    it('debería usar valores por defecto si no se proporcionan', async () => {
      vi.spyOn(configService, 'shouldUseMockData').mockReturnValue(true)
      
      const request = {}
      const userId = 'test-user-id'
      
      const result = await chatService.createConversation(request, userId)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.title).toBe('Nueva consulta')
      expect(result.data.priority).toBe('normal')
      expect(result.data.status).toBe('active')
    })
  })

  describe('getConversationMessages', () => {
    it('debería obtener mensajes de una conversación en modo mock', async () => {
      vi.spyOn(configService, 'shouldUseMockData').mockReturnValue(true)
      
      const conversationId = 'conv-1'
      
      const result = await chatService.getConversationMessages(conversationId)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data.length).toBeGreaterThan(0)
      expect(result.error).toBeNull()
    })

    it('debería respetar los límites de paginación', async () => {
      vi.spyOn(configService, 'shouldUseMockData').mockReturnValue(true)
      
      const conversationId = 'conv-1'
      const limit = 2
      const offset = 0
      
      const result = await chatService.getConversationMessages(conversationId, limit, offset)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.length).toBeLessThanOrEqual(limit)
    })
  })

  describe('getUserConversations', () => {
    it('debería obtener conversaciones del usuario en modo mock', async () => {
      vi.spyOn(configService, 'shouldUseMockData').mockReturnValue(true)
      
      const userId = 'demo-user-123'
      
      const result = await chatService.getUserConversations(userId)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data.every(conv => conv.user_id === userId)).toBe(true)
      expect(result.error).toBeNull()
    })

    it('debería devolver array vacío para usuario sin conversaciones', async () => {
      vi.spyOn(configService, 'shouldUseMockData').mockReturnValue(true)
      
      const userId = 'user-sin-conversaciones'
      
      const result = await chatService.getUserConversations(userId)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data.length).toBe(0)
    })
  })

  describe('markMessagesAsRead', () => {
    it('debería marcar mensajes como leídos exitosamente', async () => {
      vi.spyOn(configService, 'shouldUseMockData').mockReturnValue(true)
      
      const conversationId = 'test-conversation-id'
      const userId = 'test-user-id'
      
      const result = await chatService.markMessagesAsRead(conversationId, userId)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeUndefined()
      expect(result.error).toBeNull()
    })
  })

  describe('updateTypingIndicator', () => {
    it('debería actualizar indicador de escritura exitosamente', async () => {
      vi.spyOn(configService, 'shouldUseMockData').mockReturnValue(true)
      
      const conversationId = 'test-conversation-id'
      const userId = 'test-user-id'
      const isTyping = true
      
      const result = await chatService.updateTypingIndicator(conversationId, userId, isTyping)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeUndefined()
      expect(result.error).toBeNull()
    })
  })

  describe('getChatStats', () => {
    it('debería obtener estadísticas del chat en modo mock', async () => {
      vi.spyOn(configService, 'shouldUseMockData').mockReturnValue(true)
      
      const result = await chatService.getChatStats()
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.total_conversations).toBeDefined()
      expect(result.data.active_conversations).toBeDefined()
      expect(result.data.total_messages).toBeDefined()
      expect(result.data.conversations_by_priority).toBeDefined()
      expect(result.data.conversations_by_status).toBeDefined()
      expect(result.error).toBeNull()
    })
  })

  describe('getServiceStats', () => {
    it('debería obtener estadísticas del servicio', () => {
      const stats = chatService.getServiceStats()
      
      expect(stats).toBeDefined()
      expect(stats.config).toBeDefined()
      expect(stats.cache).toBeDefined()
      expect(stats.realtime).toBeDefined()
    })
  })

  describe('clearCache', () => {
    it('debería limpiar el caché correctamente', () => {
      // Agregar algo al caché
      cacheService.set('test-key', 'test-value')
      expect(cacheService.get('test-key')).toBe('test-value')
      
      // Limpiar caché
      chatService.clearCache()
      
      // Verificar que se limpió
      expect(cacheService.get('test-key')).toBeNull()
    })
  })

  describe('getRealtimeService', () => {
    it('debería devolver el servicio de tiempo real', () => {
      const realtime = chatService.getRealtimeService()
      
      expect(realtime).toBeDefined()
      expect(realtime).toBeInstanceOf(RealtimeService)
    })
  })
})
