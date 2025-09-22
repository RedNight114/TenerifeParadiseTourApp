'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  MessageCircle, 
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
  Plus,
  Search,
  Filter,
  MoreVertical,
  Phone,
  Video,
  Mail
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useChatUnified } from '@/hooks/use-chat-unified';
import { ChatAuthWrapper } from '@/components/auth/chat-auth-wrapper';
import { cn } from '@/lib/utils';
import '@/styles/enhanced-chat.css';

function ChatPageContent() {
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  const { user, profile, isLoading: authLoading, isInitialized } = useAuth();
  const isAuthenticated = !!user && isInitialized;
  const isAdmin = profile?.role === 'admin';

  // Referencias para elementos del DOM
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Emojis populares para el selector
  const popularEmojis = ['😊', '😢', '😮', '😡', '👍', '👎', '❤️', '🎉', '🔥', '💯', '✨', '🚀', '💡', '🎯', '⭐', '🏆'];

  // Acciones rápidas predefinidas
  const quickActions = [
    { label: 'Información sobre tours', message: 'Hola, me gustaría información sobre los tours disponibles.' },
    { label: 'Problema con reserva', message: 'Tengo un problema con mi reserva, ¿podrían ayudarme?' },
    { label: 'Cambiar fecha', message: 'Necesito cambiar la fecha de mi tour, ¿es posible?' },
    { label: 'Cancelar reserva', message: 'Quiero cancelar mi reserva, ¿cuál es el proceso?' },
    { label: 'Información de pago', message: 'Tengo dudas sobre el proceso de pago.' },
    { label: 'Feedback del tour', message: 'Quiero dejar mi opinión sobre el tour que hice.' }
  ];

  // Función para manejar selección de archivo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('El archivo es demasiado grande. El límite es 10MB.');
        return;
      }
      setSelectedFile(file);
    }
  };

  // Función para subir archivo
  const handleFileUpload = async () => {
    if (!selectedFile || !activeConversation?.id) return;

    setIsUploading(true);
    try {
      // Aquí implementarías la lógica de subida de archivos
      // Por ahora simulamos la subida
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const fileUrl = URL.createObjectURL(selectedFile);
      await sendMessage({
        conversation_id: activeConversation.id,
        content: `📎 Archivo adjunto: ${selectedFile.name}`,
        message_type: 'file',
        file_url: fileUrl,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        file_type: selectedFile.type
      });
      
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      alert('Error al subir el archivo. Inténtalo de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  // Función para añadir emoji al mensaje
  const addEmojiToMessage = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Función para usar acción rápida
  const useQuickAction = (actionMessage: string) => {
    setMessage(actionMessage);
    setShowQuickActions(false);
  };

  // Función para reproducir sonido de notificación
  const playNotificationSound = () => {
    if (soundEnabled && 'Audio' in window) {
      try {
        // Crear un sonido simple usando Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (error) {
        }
    }
  };

  // Función para mostrar notificación
  const showNotificationMessage = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Función para solicitar permisos de notificación
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        showNotificationMessage('✅ Notificaciones activadas');
      }
    }
  };

  // Función para generar mensaje predeterminado según el rol
  const getDefaultMessage = () => {
    if (isAdmin) {
      return "Nueva consulta abierta por el usuario. El usuario está esperando respuesta.";
    } else {
      const userName = user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''
      return `¡Hola${userName} 👋! Hemos recibido tu consulta, en breve un miembro de soporte te responderá.\n\n¿En qué podemos ayudarte hoy?`;
    }
  };

  // Función para generar título de conversación según el rol
  const getDefaultTitle = () => {
    if (isAdmin) {
      return 'Consulta Administrativa';
    } else {
      return 'Nueva Consulta';
    }
  };
  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isCreatingConversation,
    isSendingMessage,
    error,
    createConversation,
    sendMessage,
    selectConversation,
    markMessagesAsRead,
    startTyping,
    stopTyping,
    loadConversations,
    clearError
  } = useChatUnified();

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (conversations && conversations.length > 0 && !activeConversation) {
      selectConversation(conversations[0]);
    }
  }, [conversations, activeConversation, selectConversation]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (activeConversation?.id) {
      markMessagesAsRead(activeConversation.id);
    }
  }, [activeConversation?.id, markMessagesAsRead]);

  const handleSendMessage = async () => {
    if ((!message.trim() && !selectedFile) || !activeConversation?.id) return;

    try {
      // Si hay archivo seleccionado, subirlo primero
      if (selectedFile) {
        await handleFileUpload();
        if (message.trim()) {
          // Si también hay mensaje de texto, enviarlo por separado
          await sendMessage({
            conversation_id: activeConversation.id,
            content: message.trim(),
            message_type: 'text'
          });
        }
      } else {
        // Enviar solo mensaje de texto
        const result = await sendMessage({
          conversation_id: activeConversation.id,
          content: message.trim(),
          message_type: 'text'
        });
        
        if (result) {
          // Guardar en historial para sugerencias
          setChatHistory(prev => [...prev.slice(-9), message.trim()]);
          // Reproducir sonido de envío
          playNotificationSound();
          // Mostrar notificación de éxito
          showNotificationMessage('✅ Mensaje enviado');
        }
      }
      
      setMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartConversation = async () => {
    if (!isAuthenticated || !user) {
      alert('Debes iniciar sesión para usar el chat de soporte');
      return;
    }

    try {
      const conversation = await createConversation({
        title: getDefaultTitle(),
        initial_message: getDefaultMessage(),
        priority: isAdmin ? 'high' : 'normal'
      });
      
      if (conversation) {
        await selectConversation(conversation);
      }
    } catch (error) {
      alert('Error al crear la conversación. Por favor, intenta de nuevo.');
    }
  };

  const handleConversationSelect = async (conversation: any) => {
    try {
      await selectConversation(conversation);
    } catch (error) {
      }
  };

  const filteredConversations = conversations?.filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Mostrar loading mientras se inicializa
  if (!isInitialized || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verificando sesión</h2>
          <p className="text-gray-600">Por favor, espera un momento...</p>
        </div>
      </div>
    );
  }

  // Mostrar estado de autenticación
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Chat de Soporte
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comunícate con nuestro equipo de soporte en tiempo real
            </p>
          </div>

          {/* Estado de autenticación */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <MessageCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Inicia sesión para usar el chat
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Necesitas estar autenticado para acceder al sistema de chat de soporte.
            </p>
            <div className="space-x-4">
              <Button 
                onClick={() => window.location.href = '/auth/login'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Iniciar Sesión
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/auth/register'}
              >
                Registrarse
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Chat de Soporte
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comunícate con nuestro equipo de soporte en tiempo real
          </p>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Conectado como: {user?.email}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Sidebar - Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Conversaciones</CardTitle>
                <Button
                  onClick={handleStartConversation}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva
                </Button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar conversaciones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-1">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleConversationSelect(conversation)}
                      className={cn(
                        "p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-l-4",
                        activeConversation?.id === conversation.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-transparent"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                              {conversation.title}
                            </h3>
                            {(conversation.unread_count || 0) > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unread_count || 0}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {conversation.last_message?.content || conversation.description || 'Sin descripción'}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge 
                              variant={conversation.status === 'active' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {conversation.status === 'active' ? 'Activa' : 'Cerrada'}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {new Date(conversation.last_message_at || conversation.updated_at).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {filteredConversations.length === 0 && (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay conversaciones</p>
                      <p className="text-sm">Crea una nueva para comenzar</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Main Chat Area */}
          <Card className="lg:col-span-2 flex flex-col">
            {activeConversation ? (
              <>
                {/* Chat Header Mejorado */}
                <CardHeader className="pb-4 border-b bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-gray-200 shadow-sm">
                          <AvatarImage 
                            src="/images/logo-tenerife.png" 
                            className="object-contain p-1"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (target.src !== "/images/placeholder.jpg") {
                                target.src = "/images/placeholder.jpg";
                                target.className = "object-cover";
                              }
                            }}
                          />
                          <AvatarFallback className="bg-gray-100 text-gray-600 font-bold text-lg">
                            TP
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-900 font-semibold">
                          {activeConversation.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm text-gray-600 font-medium">
                              En línea
                            </span>
                          </div>
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-medium border border-green-200">
                            Soporte Activo
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-9 w-9 p-0 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                        title="Llamar"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-9 w-9 p-0 hover:bg-green-100 hover:text-green-600 transition-colors"
                        title="Videollamada"
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-9 w-9 p-0 hover:bg-purple-100 hover:text-purple-600 transition-colors"
                        title="Enviar email"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={cn(
                          "h-9 w-9 p-0 transition-colors",
                          soundEnabled 
                            ? "hover:bg-yellow-100 hover:text-yellow-600" 
                            : "hover:bg-gray-100 hover:text-gray-600"
                        )}
                        title={soundEnabled ? "Sonidos activados" : "Sonidos desactivados"}
                      >
                        {soundEnabled ? "🔊" : "🔇"}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={requestNotificationPermission}
                        className="h-9 w-9 p-0 hover:bg-orange-100 hover:text-orange-600 transition-colors"
                        title="Activar notificaciones"
                      >
                        <Bell className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowSettings(!showSettings)}
                        className="h-9 w-9 p-0 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        title="Configuración"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages Area */}
                <CardContent className="flex-1 p-0 flex flex-col">
                  <ScrollArea className="flex-1 p-6">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : error ? (
                      <div className="flex flex-col items-center justify-center h-full text-red-500">
                        <div className="flex items-center mb-4">
                          <AlertCircle className="h-6 w-6 mr-2" />
                          {error}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={clearError}
                          className="text-red-500 border-red-500 hover:bg-red-50"
                        >
                          Reintentar
                        </Button>
                      </div>
                    ) : (messages && messages.length > 0) || isSendingMessage ? (
                      <div className="space-y-4">
                        {messages.map((msg, index) => {
                          // Determinar si es mensaje del usuario o del admin
                          const isUserMessage = msg.sender_id === activeConversation.user_id;
                          const isAdminMessage = !isUserMessage;
                          const isNewMessage = index === messages.length - 1; // Último mensaje es nuevo
                          
                          return (
                            <div
                              key={msg.id}
                              className={cn(
                                "chat-message",
                                isUserMessage ? "user" : "admin",
                                isNewMessage && "new-message"
                              )}
                              style={{
                                animationDelay: isNewMessage ? '0.1s' : '0s'
                              }}
                            >
                              {/* Avatar del admin (izquierda) */}
                              {isAdminMessage && (
                                <div className="chat-message-avatar admin">
                                  <img 
                                    src="/images/logo-tenerife.png" 
                                    alt="Tenerife Paradise Tour"
                                    className="object-contain p-1"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      if (target.src !== "/images/placeholder.jpg") {
                                        target.src = "/images/placeholder.jpg";
                                        target.className = "object-cover";
                                      }
                                    }}
                                  />
                                </div>
                              )}
                              
                              {/* Burbuja del mensaje */}
                              <div className={cn(
                                "chat-message-bubble",
                                isNewMessage && "new-message"
                              )}>
                                {/* Información del remitente para admin */}
                                {isAdminMessage && (
                                  <div className="chat-sender-info">
                                    <span className="chat-sender-name">
                                      Tenerife Paradise Tour
                                    </span>
                                    <span className="chat-sender-badge admin">
                                      🔧 Soporte Técnico
                                    </span>
                                  </div>
                                )}
                                
                                {/* Información del remitente para usuario */}
                                {isUserMessage && (
                                  <div className="chat-sender-info">
                                    <span className="chat-sender-name">
                                      {isAdmin ? 'Administrador' : 'Cliente'}
                                    </span>
                                    <span className={`chat-sender-badge ${isAdmin ? 'admin' : 'user'}`}>
                                      {isAdmin ? '🔧 Admin' : '👤 Cliente'}
                                    </span>
                                  </div>
                                )}
                                
                                {/* Contenido del mensaje */}
                                <div className="chat-message-content">
                                  {msg.content}
                                </div>
                                
                                {/* Timestamp y estado */}
                                <div className="chat-message-time">
                                  <span>
                                    {new Date(msg.created_at).toLocaleTimeString('es-ES', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                  {isUserMessage && (
                                    <span className="chat-message-status sent">
                                      ✓ Enviado
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Avatar del usuario (derecha) */}
                              {isUserMessage && (
                                <div className="chat-message-avatar user">
                                  <img 
                                    src={activeConversation.user_avatar_url || "/images/user-avatar.jpg"} 
                                    alt="Usuario"
                                    className="object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      if (target.src !== "/images/user-avatar.jpg") {
                                        target.src = "/images/user-avatar.jpg";
                                      }
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                        
                        {/* Indicador de escritura */}
                        {isTyping && (
                          <div className="chat-typing-indicator">
                            <div className="chat-message-avatar admin">
                              <img 
                                src="/images/logo-tenerife.png" 
                                alt="Tenerife Paradise Tour"
                                className="object-contain p-1"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  if (target.src !== "/images/placeholder.jpg") {
                                    target.src = "/images/placeholder.jpg";
                                    target.className = "object-cover";
                                  }
                                }}
                              />
                            </div>
                            <div className="chat-typing-dots">
                              <div className="chat-typing-dot"></div>
                              <div className="chat-typing-dot"></div>
                              <div className="chat-typing-dot"></div>
                            </div>
                            <span className="text-sm text-gray-500 ml-2">Tenerife Paradise Tour está escribiendo...</span>
                          </div>
                        )}
                        
                        {/* Indicador de mensaje enviándose */}
                        {isSendingMessage && (
                          <div className="flex justify-end sending-indicator">
                            <div className="bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-lg max-w-xs shadow-sm border border-blue-200 dark:border-blue-700">
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-sm text-blue-600 dark:text-blue-300 font-medium">Enviando...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="chat-welcome">
                        {/* Mensaje de bienvenida mejorado */}
                        <div className="mb-6">
                          <div className="chat-welcome-avatar">
                            <img 
                              src="/images/logo-tenerife.png" 
                              alt="Tenerife Paradise Tour"
                              className="object-contain p-2"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (target.src !== "/images/placeholder.jpg") {
                                  target.src = "/images/placeholder.jpg";
                                  target.className = "object-cover";
                                }
                              }}
                            />
                          </div>
                          
                          <div className="chat-welcome-card">
                            <div className="chat-welcome-header">
                              <MessageCircle className="h-5 w-5 text-blue-600" />
                              <span className="chat-welcome-title">Tenerife Paradise Tour</span>
                            </div>
                            <p className="chat-welcome-text">
                              {isAdmin ? 
                                '🔧 Bienvenido al panel de chat administrativo. Aquí puedes gestionar consultas y comunicarte con el equipo.' :
                                '👋 ¡Hola! Bienvenido a nuestro chat de soporte. Estoy aquí para ayudarte con cualquier consulta sobre nuestros tours, reservas o experiencias únicas en Tenerife. ¿En qué puedo asistirte hoy?'
                              }
                            </p>
                          </div>
                        </div>
                        
                        <h3 className="chat-welcome-heading">
                          {isAdmin ? '🔧 Panel Administrativo' : '¡Comencemos tu aventura! 🏝️'}
                        </h3>
                        <p className="chat-welcome-subtitle">
                          {isAdmin ? 'Gestiona consultas y comunícate con el equipo' : 'Escribe tu mensaje abajo y te responderemos al instante'}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="chat-welcome-feature">
                            <CheckCircle className="chat-welcome-feature-icon" />
                            <span className="font-medium">Respuesta inmediata</span>
                          </div>
                          <div className="chat-welcome-feature">
                            <Clock className="chat-welcome-feature-icon" />
                            <span className="font-medium">Disponible 24/7</span>
                          </div>
                          <div className="chat-welcome-feature">
                            <User className="chat-welcome-feature-icon" />
                            <span className="font-medium">Atención personalizada</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </ScrollArea>

                  {/* Acciones Rápidas */}
                  {showQuickActions && (
                    <div className="p-4 border-t bg-blue-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-blue-900">Acciones Rápidas</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowQuickActions(false)}
                          className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {quickActions.map((action, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => useQuickAction(action.message)}
                            className="text-left justify-start h-auto py-2 px-3 text-xs border-blue-200 hover:bg-blue-100"
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selector de Emojis */}
                  {showEmojiPicker && (
                    <div className="p-4 border-t bg-gray-50" ref={emojiPickerRef}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">Emojis</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowEmojiPicker(false)}
                          className="h-6 w-6 p-0 text-gray-600 hover:text-gray-800"
                        >
                          ×
                        </Button>
                      </div>
                      <div className="grid grid-cols-8 gap-2">
                        {popularEmojis.map((emoji, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            onClick={() => addEmojiToMessage(emoji)}
                            className="h-8 w-8 p-0 text-lg hover:bg-gray-200"
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Archivo Seleccionado */}
                  {selectedFile && (
                    <div className="p-4 border-t bg-green-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <Paperclip className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-green-900 truncate">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-green-600">
                              {(selectedFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Input Area Mejorada */}
                  <div className="p-4 border-t bg-gradient-to-r from-white to-gray-50">
                    <div className="flex items-end space-x-3">
                      <div className="flex-1 relative">
                        <Textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder={
                            activeConversation 
                              ? "Escribe tu mensaje..." 
                              : "Escribe tu consulta aquí..."
                          }
                          className="min-h-[60px] max-h-[120px] resize-none pr-24 border-2 border-gray-200 focus:border-blue-500 transition-all duration-200 shadow-sm focus:shadow-md"
                          disabled={isLoading || isUploading}
                        />
                        <div className="absolute bottom-2 right-2 flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
                            title="Adjuntar archivo"
                            disabled={isUploading}
                          >
                            <Paperclip className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
                            title="Emojis"
                          >
                            <Smile className="h-4 w-4" />
                          </Button>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={handleFileSelect}
                          className="hidden"
                          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                        />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button
                          onClick={handleSendMessage}
                          disabled={(!message.trim() && !selectedFile) || isLoading || isUploading}
                          size="lg"
                          className="h-[60px] px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          {isLoading || isUploading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                          ) : (
                            <Send className="h-5 w-5 mr-2" />
                          )}
                          {isUploading ? "Subiendo..." : isLoading ? "Enviando..." : "Enviar"}
                        </Button>
                        
                        {/* Botón de acciones rápidas */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowQuickActions(!showQuickActions)}
                          className="h-8 px-3 text-xs border-blue-200 hover:bg-blue-50"
                        >
                          💡 Ayuda rápida
                        </Button>
                      </div>
                    </div>
                    
                    {/* Estado de conexión mejorado */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm text-gray-600 font-medium">
                          Conectado
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          En línea
                        </span>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Selecciona una conversación</p>
                  <p className="text-sm">O crea una nueva para comenzar</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Notificación Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {notificationMessage}
                </p>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return <ChatPageContent />;
}