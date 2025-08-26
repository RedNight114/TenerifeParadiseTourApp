'use client';

import React, { useState, useEffect } from 'react';
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
import { useChat } from '@/hooks/use-chat';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    error,
    createConversation,
    sendMessage,
    markMessagesAsRead,
    startTyping,
    stopTyping
  } = useChat();

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0].id);
    }
  }, [conversations, selectedConversation]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation) return;

    try {
      await sendMessage({
        conversation_id: selectedConversation,
        content: message.trim(),
        message_type: 'text'
      });
      setMessage('');
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
    try {
      const conversation = await createConversation({
        title: 'Nueva consulta',
        initial_message: 'Consulta iniciada desde la página de chat',
        priority: 'normal'
      });
      
      if (conversation) {
        setSelectedConversation(conversation.id);
      }
    } catch (error) {
}
  };

  const filteredConversations = conversations?.filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const currentConv = conversations?.find(c => c.id === selectedConversation);
  const currentMessages = messages?.filter(m => m.conversation_id === selectedConversation) || [];

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
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={cn(
                        "p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-l-4",
                        selectedConversation === conversation.id
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
                            {conversation.description || 'Sin descripción'}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge 
                              variant={conversation.status === 'active' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {conversation.status === 'active' ? 'Activa' : 'Cerrada'}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {new Date(conversation.updated_at).toLocaleDateString('es-ES')}
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
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder-user.jpg" />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{currentConv?.title}</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {currentConv?.status === 'active' ? 'En línea' : 'Fuera de línea'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                        <MoreVertical className="h-4 w-4" />
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
                      <div className="flex items-center justify-center h-full text-red-500">
                        <AlertCircle className="h-6 w-6 mr-2" />
                        Error al cargar los mensajes
                      </div>
                    ) : currentMessages.length > 0 ? (
                      <div className="space-y-4">
                        {currentMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex items-start space-x-3",
                              msg.sender_id === currentConv?.user_id ? "justify-end" : "justify-start"
                            )}
                          >
                            {msg.sender_id !== currentConv?.user_id && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src="/placeholder-user.jpg" />
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div
                              className={cn(
                                "max-w-md rounded-lg px-4 py-2",
                                msg.sender_id === currentConv?.user_id
                                  ? "bg-blue-600 text-white ml-auto"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              )}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <div className={cn(
                                "text-xs mt-2 flex items-center space-x-2",
                                msg.sender_id === currentConv?.user_id
                                  ? "text-blue-100"
                                  : "text-gray-500 dark:text-gray-400"
                              )}>
                                <Clock className="h-3 w-3" />
                                <span>
                                  {new Date(msg.created_at).toLocaleTimeString('es-ES', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                {msg.is_read && (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <MessageCircle className="h-16 w-16 mb-4 opacity-50" />
                        <p className="text-center text-lg mb-2">
                          ¡Hola! ¿En qué puedo ayudarte?
                        </p>
                        <p className="text-center text-sm">
                          Escribe tu mensaje para comenzar la conversación
                        </p>
                      </div>
                    )}
                  </ScrollArea>

                  {/* Input Area */}
                  <div className="p-6 border-t bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-end space-x-3">
                      <div className="flex-1 relative">
                        <Textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Escribe tu mensaje..."
                          className="min-h-[60px] max-h-[120px] resize-none pr-24"
                        />
                        <div className="absolute bottom-2 right-2 flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                          >
                            <Paperclip className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                          >
                            <Smile className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        size="lg"
                        className="h-[60px] px-6 bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="h-5 w-5 mr-2" />
                        Enviar
                      </Button>
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
    </div>
  );
}


