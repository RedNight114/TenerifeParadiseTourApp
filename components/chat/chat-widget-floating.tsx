'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedAvatar } from '@/components/ui/enhanced-avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  MessageCircle, 
  X, 
  Maximize2, 
  Send, 
  Paperclip, 
  Smile,
  Settings,
  Bell,
  BellOff,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Zap,
  MapPin
} from 'lucide-react';
import { useChat } from '@/hooks/use-chat';
import { cn } from '@/lib/utils';
import '@/styles/chat-widget.css';
import { ChatService } from '@/lib/chat-service';

interface ChatWidgetFloatingProps {
  className?: string;
}

export function ChatWidgetFloating({ className }: ChatWidgetFloatingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  
  // Estados persistentes
  const [chatPreferences, setChatPreferences] = useState({
    autoOpen: false,
    soundEnabled: true,
    fontSize: 'medium' as 'small' | 'medium' | 'large'
  });

  // Estado local para mensajes temporales
  const [localMessages, setLocalMessages] = useState<Array<{
    id: string;
    content: string;
    sender_id: string;
    created_at: Date;
    isLocal: boolean;
  }>>([]);

  // Estado para notificaciones del sistema
  const [systemNotification, setSystemNotification] = useState<{
    type: 'info' | 'warning' | 'error';
    message: string;
    show: boolean;
  } | null>(null);

  const {
    conversations,
    activeConversation: currentConversation,
    messages,
    isLoading,
    error,
    createConversation,
    selectConversation,
    sendMessage,
    startTyping,
    stopTyping
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Función para cerrar el chat y limpiar estado
  const handleCloseChat = () => {
    setIsOpen(false);
    setLocalMessages([]);
    // NO limpiar la conversación activa para mantener persistencia
  };

  // Función para limpiar estado persistente completamente
  const clearPersistentState = () => {
    try {
      localStorage.removeItem('chat-widget-state');
} catch (error) {
}
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, localMessages]);

  // Handle escape key to close chat
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCloseChat();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Cargar estado persistente al montar
  useEffect(() => {
    const loadPersistentState = () => {
      try {
        const savedState = localStorage.getItem('chat-widget-state');
        if (savedState) {
          const parsed = JSON.parse(savedState);
          setIsOpen(parsed.isOpen || false);
          setIsMinimized(parsed.isMinimized || false);
          setChatPreferences(parsed.chatPreferences || {
            autoOpen: false,
            soundEnabled: true,
            fontSize: 'medium'
          });
          setTheme(parsed.theme || 'light');
          setNotificationsEnabled(parsed.notificationsEnabled !== false);
        }
      } catch (error) {
}
    };

    loadPersistentState();
  }, []);

  // Restaurar conversación activa cuando se cargan las conversaciones
  useEffect(() => {
    const savedState = localStorage.getItem('chat-widget-state');
    if (savedState && conversations.length > 0 && !currentConversation) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.activeConversationId) {
          const conversationToRestore = conversations.find(conv => conv.id === parsed.activeConversationId);
          if (conversationToRestore) {
selectConversation(conversationToRestore);
          }
        }
      } catch (error) {
}
    }
  }, [conversations, currentConversation, selectConversation]);

  // Guardar estado persistente
  useEffect(() => {
    const savePersistentState = () => {
      try {
        const stateToSave = {
          isOpen,
          isMinimized,
          chatPreferences,
          theme,
          notificationsEnabled,
          activeConversationId: currentConversation?.id || null,
          lastOpened: isOpen ? new Date().toISOString() : null
        };
        localStorage.setItem('chat-widget-state', JSON.stringify(stateToSave));
      } catch (error) {
}
    };

    savePersistentState();
  }, [isOpen, isMinimized, chatPreferences, theme, notificationsEnabled, currentConversation?.id]);

  // Auto-abrir chat si está configurado
  useEffect(() => {
    if (chatPreferences.autoOpen && !isOpen) {
      setIsOpen(true);
    }
  }, [chatPreferences.autoOpen, isOpen]);

  // Escuchar notificaciones de eliminación de conversaciones
  useEffect(() => {
    if (!currentConversation?.id) return;

    const channel = ChatService.subscribeToConversationDeletion((deletedConversationId: string) => {
      if (deletedConversationId === currentConversation.id) {
        // La conversación activa fue eliminada
        // Cerrar el chat ya que la conversación fue eliminada
        handleCloseChat();
        
        // Mostrar notificación al usuario
        setSystemNotification({
          type: 'warning',
          message: 'Tu conversación ha sido eliminada por un administrador',
          show: true
        });
        
        // Cerrar la notificación después de 5 segundos
        setTimeout(() => {
          setSystemNotification(null);
        }, 5000);
      }
    });

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [currentConversation?.id]);

  // Mostrar mensaje de bienvenida cuando se abre el chat
  useEffect(() => {
    if (isOpen && !hasShownWelcome && !currentConversation) {
      setHasShownWelcome(true);
    }
  }, [isOpen, hasShownWelcome, currentConversation]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const messageContent = message.trim();
    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      sender_id: 'user',
      created_at: new Date(),
      isLocal: true
    };

    // Agregar mensaje temporal inmediatamente
    setLocalMessages(prev => [...prev, tempMessage]);
    setMessage('');
    inputRef.current?.focus();

    try {
      if (!currentConversation) {
        // Crear nueva conversación si no existe
        const newConversation = await createConversation({
          title: 'Nueva consulta',
          description: messageContent,
          priority: 'normal',
          category_id: 'general'
        });
        
        // Seleccionar la nueva conversación
        await selectConversation(newConversation);
        
        // Enviar el mensaje real
        await sendMessage({
          conversation_id: newConversation.id,
          content: messageContent,
          message_type: 'text'
        });
      } else {
        // Enviar mensaje a conversación existente
        await sendMessage({
          conversation_id: currentConversation.id,
          content: messageContent,
          message_type: 'text'
        });
      }
      
      // Remover mensaje temporal después de enviar exitosamente
      setLocalMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    } catch (error) {
// Mantener el mensaje temporal si hay error
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartConversation = async () => {
    if (!message.trim()) return;
    
    const messageContent = message.trim();
    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      sender_id: 'user',
      created_at: new Date(),
      isLocal: true
    };

    // Agregar mensaje temporal inmediatamente
    setLocalMessages(prev => [...prev, tempMessage]);
    setMessage('');

    try {
      const newConversation = await createConversation({
        title: 'Nueva consulta',
        description: messageContent,
        priority: 'normal',
        category_id: 'general'
      });
      
      // Seleccionar la nueva conversación
      await selectConversation(newConversation);
      
      // Enviar el mensaje real
      await sendMessage({
        conversation_id: newConversation.id,
        content: messageContent,
        message_type: 'text'
      });
      
      // Remover mensaje temporal después de enviar exitosamente
      setLocalMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    } catch (error) {
// Mantener el mensaje temporal si hay error
    }
  };

  // Botón flotante simplificado
  if (!isOpen) {
    return (
      <div className={cn("chat-widget-container", className)}>
        <button
          onClick={() => setIsOpen(true)}
          className="chat-widget-button"
          aria-label="Abrir chat de soporte"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
        
        {/* Indicador de notificaciones discreto */}
        {conversations.length > 0 && (
          <div className="chat-notification-badge">
            {conversations.length > 9 ? '9+' : conversations.length}
          </div>
        )}
      </div>
    );
  }

  // Chat abierto
  return (
    <div className="chat-window">
      {/* Header mejorado */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-header-icon">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="chat-header-title">Chat de Soporte</div>
            <div className="chat-header-status">
              <div className="online-indicator" />
              <span>En línea</span>
            </div>
          </div>
        </div>
        
        <div className="chat-header-controls">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="chat-control-button"
            aria-label="Configuración"
          >
            <Settings className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="chat-control-button"
            aria-label="Minimizar"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          
          <button
            onClick={handleCloseChat}
            className="chat-control-button close"
            aria-label="Cerrar chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Contenido del chat */}
      <div className="chat-content">
        {/* Notificación del sistema */}
        {systemNotification && (
          <div className={`chat-system-notification ${systemNotification.type}`}>
            <div className="chat-system-notification-content">
              <span className="chat-system-notification-message">
                {systemNotification.message}
              </span>
              <button
                onClick={() => setSystemNotification(null)}
                className="chat-system-notification-close"
                aria-label="Cerrar notificación"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        
        {/* Área de mensajes */}
        <div className="chat-messages">
          {isLoading ? (
            <div className="chat-loading">
              <div className="chat-loading-spinner" />
              <p className="ml-3 text-sm text-gray-600 font-medium">Conectando...</p>
            </div>
          ) : error ? (
            <div className="chat-error">
              <AlertCircle className="chat-error-icon" />
              <span className="text-sm font-medium">Error al conectar</span>
            </div>
          ) : (messages && messages.length > 0) || localMessages.length > 0 ? (
            <div className="space-y-4">
              {/* Mensajes del servidor */}
              {messages && messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "chat-message",
                    msg.sender_id === currentConversation?.user_id ? "user" : "admin"
                  )}
                >
                  {msg.sender_id !== currentConversation?.user_id && (
                    <div className="chat-message-avatar admin">
                      <img 
                        src="/images/tenerife-logo.jpg" 
                        alt="Tenerife Paradise Tour"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="chat-message-bubble">
                    <div className="chat-message-content">
                      {msg.content}
                    </div>
                    <div className="chat-message-time">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(msg.created_at).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {msg.sender_id === currentConversation?.user_id && (
                    <div className="chat-message-avatar user">
                      <img 
                        src="/images/user-avatar.jpg" 
                        alt="Tú"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Mensajes temporales locales */}
              {localMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="chat-message user"
                >
                  <div className="chat-message-avatar user">
                    <img 
                      src="/images/user-avatar.jpg" 
                      alt="Tú"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                  
                  <div className="chat-message-bubble">
                    <div className="chat-message-content">
                      {msg.content}
                    </div>
                    <div className="chat-message-time">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(msg.created_at).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="chat-welcome">
              {/* Mensaje de bienvenida del administrador */}
              <div className="mb-6">
                <div className="chat-welcome-avatar">
                  <img 
                    src="/images/tenerife-logo.jpg" 
                    alt="Tenerife Paradise Tour"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
                
                <div className="chat-welcome-card">
                  <div className="chat-welcome-header">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="chat-welcome-title">Tenerife Paradise Tour</span>
                  </div>
                  <p className="chat-welcome-text">
                    ¡Hola! Soy tu asistente personal de Tenerife Paradise Tour. 
                    ¿En qué puedo ayudarte hoy? Estoy aquí para resolver todas tus dudas 
                    sobre nuestros tours y experiencias únicas en la isla.
                  </p>
                </div>
              </div>
              
              <div className="chat-welcome-icon">
                <Sparkles className="chat-welcome-sparkle" />
              </div>
              <h3 className="chat-welcome-heading">
                ¿Listo para comenzar?
              </h3>
              <p className="chat-welcome-subtitle">
                Escribe tu consulta y te responderé de inmediato
              </p>
              <div className="chat-welcome-feature">
                <Zap className="chat-welcome-feature-icon" />
                <span className="font-medium">Respuesta rápida garantizada</span>
              </div>
            </div>
          )}
        </div>

        {/* Input del chat reorganizado con botón de enviar integrado */}
        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <Input
              ref={inputRef}
              placeholder={
                currentConversation 
                  ? "Escribe tu mensaje..." 
                  : "Describe tu consulta..."
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="chat-input"
            />
            
            <div className="chat-input-attachments">
              <button
                className="chat-attachment-button"
                aria-label="Adjuntar archivo"
              >
                <Paperclip className="h-3 w-3" />
              </button>
              <button
                className="chat-attachment-button"
                aria-label="Emojis"
              >
                <Smile className="h-3 w-3" />
              </button>
            </div>
            
            <button
              onClick={currentConversation ? handleSendMessage : handleStartConversation}
              disabled={!message.trim() || isLoading}
              className="chat-send-button"
              aria-label="Enviar mensaje"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          
          {/* Estado de conexión */}
          <div className="chat-connection-status">
            <div className="chat-connection-indicator">
              <div className="chat-connection-dot" />
              <span className="font-medium">Conectado</span>
            </div>
            <span className="font-medium">En línea</span>
          </div>
        </div>
      </div>
    </div>
  );
}


