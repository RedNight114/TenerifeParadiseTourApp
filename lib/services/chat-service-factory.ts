/**
 * Factory Pattern para el ChatService
 * Centraliza la creación y configuración del servicio de chat
 */

import { ChatServiceRefactored } from './chat-service-refactored'
import { ConfigService } from './config-service'
import { MockDataService } from './mock-data-service'
import { CacheService } from './cache-service'
import { RealtimeService } from './realtime-service'

export interface ChatServiceFactoryConfig {
  enableCaching: boolean
  enableRealTime: boolean
  enableMockData: boolean
  cacheConfig?: {
    defaultTTL: number
    maxSize: number
  }
}

export class ChatServiceFactory {
  private static instance: ChatServiceFactory
  private chatService: ChatServiceRefactored | null = null
  private config: ChatServiceFactoryConfig

  private constructor() {
    this.config = {
      enableCaching: true,
      enableRealTime: true,
      enableMockData: false
    }
  }

  static getInstance(): ChatServiceFactory {
    if (!this.instance) {
      this.instance = new ChatServiceFactory()
    }
    return this.instance
  }

  /**
   * Configurar el factory
   */
  configure(config: Partial<ChatServiceFactoryConfig>): void {
    this.config = { ...this.config, ...config }
    
    // Reconfigurar servicios si ya están inicializados
    if (this.chatService) {
      this.initializeServices()
    }
  }

  /**
   * Obtener instancia del ChatService
   */
  getChatService(): ChatServiceRefactored {
    if (!this.chatService) {
      this.initializeServices()
    }
    return this.chatService!
  }

  /**
   * Inicializar todos los servicios
   */
  private initializeServices(): void {
    // Inicializar servicios base
    const configService = ConfigService.getInstance()
    const mockDataService = MockDataService.getInstance()
    
    // Configurar caché si está habilitado
    if (this.config.enableCaching) {
      // CacheService no necesita configuración adicional
    }

    // Configurar tiempo real si está habilitado
    if (this.config.enableRealTime) {
      const realtimeService = RealtimeService.getInstance()
      // El servicio se conecta automáticamente cuando se necesita
    }

    // Crear instancia del ChatService
    this.chatService = ChatServiceRefactored.getInstance()

    }

  /**
   * Crear instancia para desarrollo (con mock data)
   */
  static createForDevelopment(): ChatServiceRefactored {
    const factory = ChatServiceFactory.getInstance()
    factory.configure({
      enableCaching: true,
      enableRealTime: false,
      enableMockData: true,
      cacheConfig: {
        defaultTTL: 1 * 60 * 1000, // 1 minuto en desarrollo
        maxSize: 100
      }
    })
    return factory.getChatService()
  }

  /**
   * Crear instancia para producción
   */
  static createForProduction(): ChatServiceRefactored {
    const factory = ChatServiceFactory.getInstance()
    factory.configure({
      enableCaching: true,
      enableRealTime: true,
      enableMockData: false,
      cacheConfig: {
        defaultTTL: 5 * 60 * 1000, // 5 minutos en producción
        maxSize: 1000
      }
    })
    return factory.getChatService()
  }

  /**
   * Crear instancia para testing
   */
  static createForTesting(): ChatServiceRefactored {
    const factory = ChatServiceFactory.getInstance()
    factory.configure({
      enableCaching: false,
      enableRealTime: false,
      enableMockData: true,
      cacheConfig: {
        defaultTTL: 0, // Sin caché en testing
        maxSize: 0
      }
    })
    return factory.getChatService()
  }

  /**
   * Resetear factory (útil para testing)
   */
  reset(): void {
    this.chatService = null
    this.config = {
      enableCaching: true,
      enableRealTime: true,
      enableMockData: false
    }
  }

  /**
   * Obtener configuración actual
   */
  getConfig(): ChatServiceFactoryConfig {
    return { ...this.config }
  }

  /**
   * Verificar si los servicios están inicializados
   */
  isInitialized(): boolean {
    return this.chatService !== null
  }

  /**
   * Obtener estadísticas de todos los servicios
   */
  getServicesStats(): {
    factory: ChatServiceFactoryConfig
    chat: any
  } {
    if (!this.chatService) {
      return {
        factory: this.config,
        chat: null
      }
    }

    return {
      factory: this.config,
      chat: this.chatService.getServiceStats()
    }
  }
}

// Exportar instancia por defecto
export const chatServiceFactory = ChatServiceFactory.getInstance()

// Exportar métodos de conveniencia
export const createChatService = () => chatServiceFactory.getChatService()
export const createChatServiceForDevelopment = () => ChatServiceFactory.createForDevelopment()
export const createChatServiceForProduction = () => ChatServiceFactory.createForProduction()
export const createChatServiceForTesting = () => ChatServiceFactory.createForTesting()
