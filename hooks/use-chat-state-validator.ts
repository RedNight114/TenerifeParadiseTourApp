/**
 * Hook para validar y prevenir estados vacíos falsos en el chat
 */

import { useCallback, useRef } from 'react'
import { Conversation, Message } from '@/lib/types/chat'

interface ChatStateValidatorProps {
  conversations: Conversation[]
  messages: Message[]
  isLoading: boolean
  isCreatingConversation: boolean
  isSendingMessage: boolean
  error: string | null
}

export function useChatStateValidator({
  conversations,
  messages,
  isLoading,
  isCreatingConversation,
  isSendingMessage,
  error
}: ChatStateValidatorProps) {
  const lastValidStateRef = useRef<{
    conversations: Conversation[]
    messages: Message[]
    timestamp: number
  }>({
    conversations: [],
    messages: [],
    timestamp: 0
  })

  /**
   * Validar si el estado actual es válido (no es un estado vacío falso)
   */
  const isValidState = useCallback(() => {
    // Si hay operaciones en curso, el estado es válido
    if (isLoading || isCreatingConversation || isSendingMessage) {
      return true
    }

    // Si hay un error activo, no es un estado válido
    if (error) {
      return false
    }

    // Si tenemos conversaciones o mensajes, el estado es válido
    if (conversations.length > 0 || messages.length > 0) {
      return true
    }

    // Si no hay nada pero tampoco hay operaciones, podría ser un estado vacío real
    return false
  }, [conversations.length, messages.length, isLoading, isCreatingConversation, isSendingMessage, error])

  /**
   * Guardar estado válido para recuperación
   */
  const saveValidState = useCallback(() => {
    if (conversations.length > 0 || messages.length > 0) {
      lastValidStateRef.current = {
        conversations: [...conversations],
        messages: [...messages],
        timestamp: Date.now()
      }
    }
  }, [conversations, messages])

  /**
   * Obtener último estado válido si el actual no es válido
   */
  const getLastValidState = useCallback(() => {
    const now = Date.now()
    const timeDiff = now - lastValidStateRef.current.timestamp
    
    // Solo usar estado anterior si es reciente (menos de 30 segundos)
    if (timeDiff < 30000) {
      return lastValidStateRef.current
    }
    
    return null
  }, [])

  /**
   * Verificar si necesitamos recuperar estado anterior
   */
  const shouldRecoverState = useCallback(() => {
    if (!isValidState() && !isLoading && !isCreatingConversation && !isSendingMessage) {
      const lastValid = getLastValidState()
      return lastValid !== null
    }
    return false
  }, [isValidState, isLoading, isCreatingConversation, isSendingMessage, getLastValidState])

  return {
    isValidState,
    saveValidState,
    getLastValidState,
    shouldRecoverState
  }
}
