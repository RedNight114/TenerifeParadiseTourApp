'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  X, 
  Bell,
  BellOff
} from 'lucide-react';
import { useChat } from '@/hooks/use-chat';
import Link from 'next/link';

interface ChatNotificationBannerProps {
  className?: string;
}

export function ChatNotificationBanner({ className }: ChatNotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const { conversations } = useChat();

  // Mostrar banner si hay mensajes no leídos y no está descartado
  useEffect(() => {
    const unreadCount = conversations?.filter(c => (c.unread_count || 0) > 0).length || 0;
    
    if (unreadCount > 0 && !isDismissed && notificationsEnabled) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [conversations, isDismissed, notificationsEnabled]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    
    // Guardar en localStorage para recordar la preferencia
    localStorage.setItem('chat-banner-dismissed', 'true');
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    localStorage.setItem('chat-notifications-enabled', (!notificationsEnabled).toString());
  };

  // Cargar preferencias del usuario
  useEffect(() => {
    const dismissed = localStorage.getItem('chat-banner-dismissed') === 'true';
    const notifications = localStorage.getItem('chat-notifications-enabled') !== 'false';
    
    setIsDismissed(dismissed);
    setNotificationsEnabled(notifications);
  }, []);

  if (!isVisible) return null;

  const unreadCount = conversations?.filter(c => (c.unread_count || 0) > 0).length || 0;

  return (
    <div className={`fixed top-20 left-0 right-0 z-40 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg ${className}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-5 w-5 text-white" />
            <div className="flex items-center space-x-2">
              <span className="font-medium">
                Tienes {unreadCount} mensaje{unreadCount !== 1 ? 's' : ''} sin leer
              </span>
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleNotifications}
              className="text-white hover:bg-blue-600 h-8 w-8 p-0"
            >
              {notificationsEnabled ? (
                <Bell className="h-4 w-4" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="bg-white/20 hover:bg-white/30 text-white h-8 px-3 text-sm"
            >
              <Link href="/chat">
                Ver Chat
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-white hover:bg-blue-600 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

