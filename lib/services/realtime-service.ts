/**
 * Servicio de tiempo real para el chat
 * Maneja WebSockets, suscripciones y notificaciones en tiempo real
 */

import { getSupabaseClient } from '@/lib/supabase-unified'
import { ConfigService } from './config-service'
import { Message, TypingIndicator } from '@/lib/types/chat'

export interface RealtimeSubscription {
  unsubscribe: () => void
}

export interface RealtimeCallbacks {
  onNewMessage?: (message: Message) => void
  onTypingStart?: (indicator: TypingIndicator) => void
  onTypingStop?: (indicator: TypingIndicator) => void
  onUserOnline?: (userId: string) => void
  onUserOffline?: (userId: string) => void
  onConversationDeleted?: (conversationId: string) => void
  onError?: (error: Error) => void
}

export class RealtimeService {
  private static instance: RealtimeService
  private configService: ConfigService
  private activeSubscriptions = new Map<string, RealtimeSubscription>()
  private isConnected = false

  private constructor() {
    this.configService = ConfigService.getInstance()
  }

  static getInstance(): RealtimeService {
    if (!this.instance) {
      this.instance = new RealtimeService()
    }
    return this.instance
  }

  /**
   * Verificar si el servicio de tiempo real está disponible
   */
  isAvailable(): boolean {
    return this.configService.isSupabaseAvailable() && 
           this.configService.isFeatureEnabled('enableTypingIndicators')
  }

  /**
   * Conectar al servicio de tiempo real
   */
  async connect(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false
    }

    try {
      const supabase = await getSupabaseClient()
      this.isConnected = true
      return true
    } catch (error) {
      this.isConnected = false
      return false
    }
  }

  /**
   * Desconectar del servicio de tiempo real
   */
  disconnect(): void {
    this.activeSubscriptions.forEach(subscription => {
      subscription.unsubscribe()
    })
    this.activeSubscriptions.clear()
    this.isConnected = false
    }

  /**
   * Suscribirse a mensajes de una conversación
   */
  async subscribeToMessages(
    conversationId: string,
    callbacks: RealtimeCallbacks
  ): Promise<RealtimeSubscription> {
    if (!this.isAvailable()) {
      return { unsubscribe: () => {} }
    }

    try {
      const supabase = await getSupabaseClient()
      const channelName = `conversation-${conversationId}`
      
      const channel = supabase.channel(channelName)
      
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            if (callbacks.onNewMessage) {
              callbacks.onNewMessage(payload.new as Message)
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            // Manejar actualizaciones de mensajes (ej: marcado como leído)
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            }
        })

      const subscription: RealtimeSubscription = {
        unsubscribe: () => {
          channel.unsubscribe()
          this.activeSubscriptions.delete(channelName)
        }
      }

      this.activeSubscriptions.set(channelName, subscription)
      return subscription

    } catch (error) {
      if (callbacks.onError) {
        callbacks.onError(error as Error)
      }
      return { unsubscribe: () => {} }
    }
  }

  /**
   * Suscribirse a indicadores de escritura
   */
  async subscribeToTypingIndicators(
    conversationId: string,
    callbacks: RealtimeCallbacks
  ): Promise<RealtimeSubscription> {
    if (!this.isAvailable()) {
      return { unsubscribe: () => {} }
    }

    try {
      const supabase = await getSupabaseClient()
      const channelName = `typing-${conversationId}`
      
      const channel = supabase.channel(channelName)
      
      channel
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'conversation_participants',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            if (payload.new.is_typing !== payload.old.is_typing) {
              const indicator: TypingIndicator = {
                conversation_id: conversationId,
                user_id: payload.new.user_id,
                user_name: payload.new.user_id, // Se podría obtener del perfil
                is_typing: payload.new.is_typing,
                timestamp: Date.now()
              }

              if (payload.new.is_typing && callbacks.onTypingStart) {
                callbacks.onTypingStart(indicator)
              } else if (!payload.new.is_typing && callbacks.onTypingStop) {
                callbacks.onTypingStop(indicator)
              }
            }
          }
        )
        .subscribe()

      const subscription: RealtimeSubscription = {
        unsubscribe: () => {
          channel.unsubscribe()
          this.activeSubscriptions.delete(channelName)
        }
      }

      this.activeSubscriptions.set(channelName, subscription)
      return subscription

    } catch (error) {
      if (callbacks.onError) {
        callbacks.onError(error as Error)
      }
      return { unsubscribe: () => {} }
    }
  }

  /**
   * Suscribirse a notificaciones de eliminación de conversaciones
   */
  async subscribeToConversationDeletion(
    callbacks: RealtimeCallbacks
  ): Promise<RealtimeSubscription> {
    if (!this.isAvailable()) {
      return { unsubscribe: () => {} }
    }

    try {
      const supabase = await getSupabaseClient()
      const channelName = 'conversation-deletion-notifications'
      
      const channel = supabase.channel(channelName)
      
      channel
        .on('broadcast', { event: 'conversation-deleted' }, (payload) => {
          if (payload.payload?.conversation_id && callbacks.onConversationDeleted) {
            callbacks.onConversationDeleted(payload.payload.conversation_id)
          }
        })
        .subscribe()

      const subscription: RealtimeSubscription = {
        unsubscribe: () => {
          channel.unsubscribe()
          this.activeSubscriptions.delete(channelName)
        }
      }

      this.activeSubscriptions.set(channelName, subscription)
      return subscription

    } catch (error) {
      if (callbacks.onError) {
        callbacks.onError(error as Error)
      }
      return { unsubscribe: () => {} }
    }
  }

  /**
   * Actualizar indicador de escritura
   */
  async updateTypingIndicator(
    conversationId: string,
    userId: string,
    isTyping: boolean
  ): Promise<void> {
    if (!this.isAvailable()) {
      return
    }

    try {
      const supabase = await getSupabaseClient()
      
      await supabase
        .from('conversation_participants')
        .update({
          is_typing: isTyping,
          typing_since: isTyping ? new Date().toISOString() : null
        })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)

      } catch (error) {
      }
  }

  /**
   * Notificar eliminación de conversación
   */
  async notifyConversationDeleted(conversationId: string): Promise<void> {
    if (!this.isAvailable()) {
      return
    }

    try {
      const supabase = await getSupabaseClient()
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

  /**
   * Obtener estado de conexión
   */
  getConnectionStatus(): {
    isConnected: boolean
    isAvailable: boolean
    activeSubscriptions: number
  } {
    return {
      isConnected: this.isConnected,
      isAvailable: this.isAvailable(),
      activeSubscriptions: this.activeSubscriptions.size
    }
  }

  /**
   * Limpiar todas las suscripciones
   */
  cleanup(): void {
    this.disconnect()
  }
}
