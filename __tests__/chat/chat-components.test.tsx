 /**
 * Pruebas para componentes del sistema de chat
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UnifiedChatWidget } from '@/components/chat/unified-chat-widget'
import { useAuth } from '@/components/auth-provider'
import { useChatOptimized } from '@/hooks/use-chat-optimized'

// Mock de hooks
vi.mock('@/components/auth-provider', () => ({
  useAuth: vi.fn()
}))

vi.mock('@/hooks/use-chat-optimized', () => ({
  useChatOptimized: vi.fn()
}))

// Mock de componentes UI
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  )
}))

vi.mock('@/components/ui/input', () => ({
  Input: ({ placeholder, value, onChange, ...props }: any) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      {...props}
    />
  )
}))

vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({ placeholder, value, onChange, onKeyPress, ...props }: any) => (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      {...props}
    />
  )
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className, ...props }: any) => (
    <h3 className={className} {...props}>
      {children}
    </h3>
  )
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className, ...props }: any) => (
    <span className={`badge ${variant} ${className}`} {...props}>
      {children}
    </span>
  )
}))

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
  AvatarImage: ({ src, ...props }: any) => <img src={src} {...props} />,
  AvatarFallback: ({ children, ...props }: any) => <div {...props}>{children}</div>
}))

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  )
}))

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>
}))

// Mock de iconos
vi.mock('lucide-react', () => ({
  MessageCircle: () => <div data-testid="message-circle-icon" />,
  X: () => <div data-testid="x-icon" />,
  Send: () => <div data-testid="send-icon" />,
  Search: () => <div data-testid="search-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  Reply: () => <div data-testid="reply-icon" />,
  Activity: () => <div data-testid="activity-icon" />,
  Wifi: () => <div data-testid="wifi-icon" />,
  WifiOff: () => <div data-testid="wifi-off-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  Maximize2: () => <div data-testid="maximize-icon" />,
  Minimize2: () => <div data-testid="minimize-icon" />,
  Paperclip: () => <div data-testid="paperclip-icon" />,
  Smile: () => <div data-testid="smile-icon" />,
  Plus: () => <div data-testid="plus-icon" />
}))

describe('UnifiedChatWidget', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'user'
  }

  const mockConversations = [
    {
      id: 'conv-1',
      title: 'Consulta sobre tours',
      user_id: 'test-user-id',
      status: 'active',
      priority: 'normal',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
      unread_count: 0,
      user_full_name: 'Usuario de Prueba',
      user_email: 'test@example.com'
    }
  ]

  const mockMessages = [
    {
      id: 'msg-1',
      conversation_id: 'conv-1',
      sender_id: 'test-user-id',
      content: 'Hola, tengo una consulta',
      message_type: 'text',
      metadata: {},
      created_at: new Date().toISOString(),
      is_read: false,
      sender_full_name: 'Usuario de Prueba',
      sender_email: 'test@example.com'
    }
  ]

  const mockChatActions = {
    loadConversations: vi.fn(),
    createConversation: vi.fn(),
    selectConversation: vi.fn(),
    closeActiveConversation: vi.fn(),
    sendMessage: vi.fn(),
    updateConversation: vi.fn(),
    startTyping: vi.fn(),
    stopTyping: vi.fn(),
    markMessagesAsRead: vi.fn(),
    getChatStats: vi.fn(),
    clearError: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock por defecto para useAuth
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn()
    })

    // Mock por defecto para useChatOptimized
    vi.mocked(useChatOptimized).mockReturnValue({
      conversations: mockConversations,
      activeConversation: null,
      messages: [],
      participants: [],
      isLoading: false,
      error: null,
      unreadCount: 0,
      typingUsers: [],
      isTyping: false,
      isConnected: true,
      ...mockChatActions
    })
  })

  describe('Renderizado básico', () => {
    it('debería renderizar el botón flotante cuando está cerrado', () => {
      render(<UnifiedChatWidget variant="floating" />)
      
      expect(screen.getByLabelText('Abrir chat de soporte')).toBeInTheDocument()
      expect(screen.getByTestId('message-circle-icon')).toBeInTheDocument()
    })

    it('debería mostrar el contador de mensajes no leídos', () => {
      vi.mocked(useChatOptimized).mockReturnValue({
        ...vi.mocked(useChatOptimized).mockReturnValue({} as any),
        unreadCount: 5
      })

      render(<UnifiedChatWidget variant="floating" />)
      
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('debería deshabilitar el botón si el usuario no está autenticado', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn()
      })

      render(<UnifiedChatWidget variant="floating" />)
      
      const button = screen.getByLabelText('Abrir chat de soporte')
      expect(button).toBeDisabled()
    })
  })

  describe('Interacciones del usuario', () => {
    it('debería abrir el chat cuando se hace clic en el botón', async () => {
      render(<UnifiedChatWidget variant="floating" />)
      
      const button = screen.getByLabelText('Abrir chat de soporte')
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(screen.getByText('Chat de Soporte')).toBeInTheDocument()
      })
    })

    it('debería mostrar la lista de conversaciones', async () => {
      render(<UnifiedChatWidget variant="floating" />)
      
      const button = screen.getByLabelText('Abrir chat de soporte')
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(screen.getByText('Conversaciones')).toBeInTheDocument()
        expect(screen.getByText('Consulta sobre tours')).toBeInTheDocument()
      })
    })

    it('debería permitir buscar conversaciones', async () => {
      render(<UnifiedChatWidget variant="floating" />)
      
      const button = screen.getByLabelText('Abrir chat de soporte')
      fireEvent.click(button)
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Buscar conversaciones...')
        expect(searchInput).toBeInTheDocument()
        
        fireEvent.change(searchInput, { target: { value: 'tours' } })
        expect(searchInput).toHaveValue('tours')
      })
    })
  })

  describe('Envío de mensajes', () => {
    beforeEach(() => {
      vi.mocked(useChatOptimized).mockReturnValue({
        ...vi.mocked(useChatOptimized).mockReturnValue({} as any),
        activeConversation: mockConversations[0],
        messages: mockMessages
      })
    })

    it('debería mostrar el área de mensajes cuando hay una conversación activa', async () => {
      render(<UnifiedChatWidget variant="floating" />)
      
      const button = screen.getByLabelText('Abrir chat de soporte')
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(screen.getByText('Consulta sobre tours')).toBeInTheDocument()
        expect(screen.getByText('Hola, tengo una consulta')).toBeInTheDocument()
      })
    })

    it('debería permitir escribir y enviar mensajes', async () => {
      render(<UnifiedChatWidget variant="floating" />)
      
      const button = screen.getByLabelText('Abrir chat de soporte')
      fireEvent.click(button)
      
      await waitFor(() => {
        const messageInput = screen.getByPlaceholderText('Escribe tu mensaje...')
        expect(messageInput).toBeInTheDocument()
        
        fireEvent.change(messageInput, { target: { value: 'Nuevo mensaje' } })
        expect(messageInput).toHaveValue('Nuevo mensaje')
        
        fireEvent.keyPress(messageInput, { key: 'Enter', code: 'Enter' })
        
        expect(mockChatActions.sendMessage).toHaveBeenCalledWith({
          conversation_id: 'conv-1',
          content: 'Nuevo mensaje',
          message_type: 'text'
        })
      })
    })

    it('debería manejar el indicador de escritura', async () => {
      render(<UnifiedChatWidget variant="floating" />)
      
      const button = screen.getByLabelText('Abrir chat de soporte')
      fireEvent.click(button)
      
      await waitFor(() => {
        const messageInput = screen.getByPlaceholderText('Escribe tu mensaje...')
        
        fireEvent.change(messageInput, { target: { value: 'Escribiendo...' } })
        expect(mockChatActions.startTyping).toHaveBeenCalled()
        
        fireEvent.change(messageInput, { target: { value: '' } })
        expect(mockChatActions.stopTyping).toHaveBeenCalled()
      })
    })
  })

  describe('Estados de carga y error', () => {
    it('debería mostrar estado de carga', () => {
      vi.mocked(useChatOptimized).mockReturnValue({
        ...vi.mocked(useChatOptimized).mockReturnValue({} as any),
        isLoading: true
      })

      render(<UnifiedChatWidget variant="floating" />)
      
      const button = screen.getByLabelText('Abrir chat de soporte')
      fireEvent.click(button)
      
      expect(screen.getByText('Cargando mensajes...')).toBeInTheDocument()
    })

    it('debería mostrar errores', () => {
      vi.mocked(useChatOptimized).mockReturnValue({
        ...vi.mocked(useChatOptimized).mockReturnValue({} as any),
        error: 'Error de conexión'
      })

      render(<UnifiedChatWidget variant="floating" />)
      
      const button = screen.getByLabelText('Abrir chat de soporte')
      fireEvent.click(button)
      
      expect(screen.getByText('Error de conexión')).toBeInTheDocument()
      expect(screen.getByText('Reintentar')).toBeInTheDocument()
    })
  })

  describe('Diferentes variantes', () => {
    it('debería renderizar como embedded', () => {
      render(<UnifiedChatWidget variant="embedded" />)
      
      expect(screen.getByText('Chat de Soporte')).toBeInTheDocument()
    })

    it('debería renderizar como fullscreen', () => {
      render(<UnifiedChatWidget variant="fullscreen" />)
      
      expect(screen.getByText('Chat de Soporte')).toBeInTheDocument()
    })
  })

  describe('Accesibilidad', () => {
    it('debería tener etiquetas ARIA apropiadas', () => {
      render(<UnifiedChatWidget variant="floating" />)
      
      const button = screen.getByLabelText('Abrir chat de soporte')
      expect(button).toBeInTheDocument()
    })

    it('debería manejar navegación por teclado', async () => {
      render(<UnifiedChatWidget variant="floating" />)
      
      const button = screen.getByLabelText('Abrir chat de soporte')
      fireEvent.click(button)
      
      await waitFor(() => {
        const messageInput = screen.getByPlaceholderText('Escribe tu mensaje...')
        expect(messageInput).toBeInTheDocument()
        
        // Simular navegación por teclado
        fireEvent.keyDown(messageInput, { key: 'Tab' })
        // En una implementación real, esto debería mover el foco al siguiente elemento
      })
    })
  })
})
