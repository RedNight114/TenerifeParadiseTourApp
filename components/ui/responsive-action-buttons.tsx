'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { DeleteButton } from '@/components/ui/delete-button'
import { cn } from '@/lib/utils'

interface ActionButtonProps {
  onClick: () => void
  icon: React.ReactNode
  label: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
  size?: 'sm' | 'lg' | 'default' | 'icon'
  disabled?: boolean
  className?: string
}

interface ResponsiveActionButtonsProps {
  actions: ActionButtonProps[]
  deleteAction?: {
    onDelete: () => void
    itemName: string
    confirmMessage?: string
  }
  className?: string
  showLabels?: boolean
}

export function ResponsiveActionButtons({
  actions,
  deleteAction,
  className,
  showLabels = true
}: ResponsiveActionButtonsProps) {
  return (
    <div className={cn(
      'flex gap-1.5 items-center',
      // Responsive behavior
      'flex-wrap sm:flex-nowrap',
      className
    )}>
      {/* Action buttons */}
      {actions.map((action, index) => (
        <Button
          key={index}
          size={action.size || 'sm'}
          onClick={action.onClick}
          disabled={action.disabled}
          variant={action.variant || 'default'}
          className={cn(
            // Base styles
            'h-7 px-2.5 text-xs font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200',
            // Responsive sizing
            'sm:h-7 sm:px-2.5 sm:text-xs',
            'md:h-8 md:px-3 md:text-sm',
            'lg:h-9 lg:px-4 lg:text-sm',
            // Focus styles
            'focus:ring-2 focus:ring-offset-1',
            action.variant === 'destructive' ? 'focus:ring-red-500' : 'focus:ring-blue-500',
            // Mobile optimizations
            'min-w-[2rem] sm:min-w-0',
            action.className
          )}
          aria-label={action.label}
          title={action.label}
        >
          <span className="flex items-center gap-1.5">
            {action.icon}
            {/* Show labels on larger screens or when explicitly enabled */}
            <span className={cn(
              'hidden sm:inline',
              showLabels && 'sm:inline'
            )}>
              {action.label}
            </span>
          </span>
        </Button>
      ))}

      {/* Delete button */}
      {deleteAction && (
        <DeleteButton
          onDelete={deleteAction.onDelete}
          itemName={deleteAction.itemName}
          size="sm"
          variant="destructive"
          confirmMessage={deleteAction.confirmMessage}
          className={cn(
            'focus:ring-2 focus:ring-red-500 focus:ring-offset-1',
            // Mobile optimizations
            'min-w-[2rem] sm:min-w-0'
          )}
        />
      )}
    </div>
  )
}

// Componente específico para botones de conversación
interface ConversationActionButtonsProps {
  onMarkAsRead?: () => void
  onDelete: () => void
  conversationTitle?: string
  isLoading?: boolean
  showMarkAsRead?: boolean
  className?: string
}

export function ConversationActionButtons({
  onMarkAsRead,
  onDelete,
  conversationTitle = 'conversación',
  isLoading = false,
  showMarkAsRead = true,
  className
}: ConversationActionButtonsProps) {
  const actions: ActionButtonProps[] = []

  if (showMarkAsRead && onMarkAsRead) {
    actions.push({
      onClick: onMarkAsRead,
      icon: <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>,
      label: 'Leída',
      variant: 'default',
      disabled: isLoading,
      className: 'bg-emerald-500 hover:bg-emerald-600 text-white'
    })
  }

  return (
    <ResponsiveActionButtons
      actions={actions}
      deleteAction={{
        onDelete,
        itemName: `conversación "${conversationTitle}"`,
        confirmMessage: '¿Estás seguro de que quieres eliminar esta conversación? Esta acción no se puede deshacer.'
      }}
      className={className}
    />
  )
}
