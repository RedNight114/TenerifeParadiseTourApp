'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, AlertTriangle, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DeleteButtonProps {
  onDelete: () => void
  itemName?: string
  className?: string
  size?: 'sm' | 'lg' | 'default' | 'icon'
  variant?: 'default' | 'destructive' | 'outline'
  disabled?: boolean
  isLoading?: boolean
  confirmText?: string
  cancelText?: string
  deleteText?: string
  confirmMessage?: string
}

export function DeleteButton({
  onDelete,
  itemName = 'este elemento',
  className,
  size = 'sm',
  variant = 'destructive',
  disabled = false,
  isLoading = false,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  deleteText = 'Eliminar',
  confirmMessage
}: DeleteButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete()
      setShowConfirm(false)
    } catch (error) {
      } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel()
    } else if (e.key === 'Enter' && showConfirm) {
      handleDelete()
    }
  }

  // Tamaños responsivos
  const sizeClasses = {
    sm: 'h-7 px-2.5 text-xs',
    default: 'h-8 px-3 text-sm',
    lg: 'h-10 px-4 text-base',
    icon: 'h-8 w-8 p-0'
  }

  // Variantes de color
  const variantClasses = {
    default: 'bg-gray-500 hover:bg-gray-600 text-white',
    destructive: 'bg-red-500 hover:bg-red-600 text-white',
    outline: 'border border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600'
  }

  if (showConfirm) {
    return (
      <div className="flex gap-1.5 items-center">
        <Button
          size={size}
          onClick={handleDelete}
          disabled={disabled || isDeleting}
          className={cn(
            sizeClasses[size],
            'bg-red-600 hover:bg-red-700 text-white font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
            className
          )}
          aria-label={`Confirmar eliminación de ${itemName}`}
          onKeyDown={handleKeyDown}
        >
          {isDeleting ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1.5" />
              Eliminando...
            </>
          ) : (
            <>
              <Check className="h-3 w-3 mr-1.5" />
              {confirmText}
            </>
          )}
        </Button>
        <Button
          size={size}
          onClick={handleCancel}
          disabled={disabled || isDeleting}
          variant="outline"
          className={cn(
            sizeClasses[size],
            'border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-md transition-all duration-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
          )}
          aria-label="Cancelar eliminación"
          onKeyDown={handleKeyDown}
        >
          <X className="h-3 w-3 mr-1.5" />
          {cancelText}
        </Button>
      </div>
    )
  }

  return (
    <Button
      size={size}
      onClick={(e) => {
        e.stopPropagation()
        setShowConfirm(true)
      }}
      disabled={disabled || isLoading}
      className={cn(
        sizeClasses[size],
        variantClasses[variant],
        'font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
        // Responsive classes
        'sm:h-7 sm:px-2.5 sm:text-xs',
        'md:h-8 md:px-3 md:text-sm',
        'lg:h-9 lg:px-4 lg:text-sm',
        className
      )}
      aria-label={`Eliminar ${itemName}`}
      title={confirmMessage || `Eliminar ${itemName}`}
      onKeyDown={handleKeyDown}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1.5" />
          Eliminando...
        </>
      ) : (
        <>
          <Trash2 className="h-3 w-3 mr-1.5" />
          {deleteText}
        </>
      )}
    </Button>
  )
}

// Componente para confirmación con modal (alternativa más accesible)
interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  itemName?: string
  isLoading?: boolean
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  itemName = 'este elemento',
  isLoading = false
}: DeleteConfirmModalProps) {
  if (!isOpen) return null

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
        </div>
        
        <h3
          id="delete-modal-title"
          className="text-lg font-medium text-gray-900 text-center mb-2"
        >
          ¿Eliminar {itemName}?
        </h3>
        
        <p className="text-sm text-gray-500 text-center mb-6">
          Esta acción no se puede deshacer. Se eliminará permanentemente.
        </p>
        
        <div className="flex gap-3 justify-center">
          <Button
            onClick={onClose}
            disabled={isLoading}
            variant="outline"
            className="px-6 py-2"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
