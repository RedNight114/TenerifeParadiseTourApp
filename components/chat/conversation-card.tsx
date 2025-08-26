'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EnhancedAvatar } from '@/components/ui/enhanced-avatar'
import { Eye, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { parseConversationData, ParsedConversationData } from '@/lib/utils/chat-data-parser'

interface ConversationCardProps {
  conversation: any
  isActive: boolean
  onSelect: (conversation: any) => void
  onMarkAsRead?: (conversation: any) => void
  onDelete?: (conversation: any) => void
  showActions?: boolean
}

export function ConversationCard({
  conversation,
  isActive,
  onSelect,
  onMarkAsRead,
  onDelete,
  showActions = true
}: ConversationCardProps) {
  // Parsear los datos de la conversación para corregir problemas de visualización
  const parsedData = parseConversationData(conversation)

  return (
    <Card
      className={cn(
        "mb-3 cursor-pointer hover:shadow-md transition-all duration-200 border-gray-200",
        isActive && "ring-2 ring-purple-500 bg-purple-50"
      )}
      onClick={() => onSelect(conversation)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <EnhancedAvatar 
                src={conversation.user_avatar_url} 
                alt={`Avatar de ${parsedData.user_full_name || parsedData.user_email}`}
                className="h-8 w-8 conversation-user-avatar avatar-fade-in"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-900 truncate">
                  {parsedData.title}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  {parsedData.user_full_name || parsedData.user_email}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant={parsedData.priority === 'urgent' ? 'destructive' : 
                       parsedData.priority === 'high' ? 'default' : 'secondary'} 
                className="text-xs"
              >
                {parsedData.priority === 'urgent' ? 'Urgente' :
                 parsedData.priority === 'high' ? 'Alta' :
                 parsedData.priority === 'normal' ? 'Normal' : 'Baja'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {parsedData.category_name || 'General'}
              </Badge>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                {parsedData.status}
              </Badge>
            </div>
            
            {conversation.last_message && (
              <p className="text-xs text-gray-500 mt-1 truncate">
                Último: {conversation.last_message}
              </p>
            )}
            
            <p className="text-xs text-gray-400 mt-1">
              {new Date(conversation.created_at || conversation.updated_at).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </p>
          </div>
          
          {showActions && (
            <div className="flex gap-1.5">
              {onMarkAsRead && (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMarkAsRead(conversation)
                  }}
                  className="h-7 px-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Eye className="h-3 w-3 mr-1.5" />
                  Leída
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(conversation)
                  }}
                  className="h-7 px-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Trash2 className="h-3 w-3 mr-1.5" />
                  Eliminar
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

