import React, { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface EnhancedAvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showStatus?: boolean
  statusColor?: 'green' | 'red' | 'yellow' | 'gray'
}

const sizeClasses = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
}

const statusColors = {
  green: 'bg-green-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  gray: 'bg-gray-500'
}

export function EnhancedAvatar({
  src,
  alt = 'Avatar',
  fallback = 'U',
  size = 'md',
  className,
  showStatus = false,
  statusColor = 'green'
}: EnhancedAvatarProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!src) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setImageError(false)


    const img = new Image()
    
    img.onload = () => {
      setIsLoading(false)
    }

    img.onerror = () => {
      setImageError(true)
      setIsLoading(false)
    }

    img.src = src

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  const shouldShowFallback = !src || imageError || isLoading

  // Extraer el tamaño de las clases CSS si se proporcionan
  const hasCustomSize = className && (className.includes('h-') || className.includes('w-'))
  const finalSizeClass = hasCustomSize ? '' : sizeClasses[size]

  return (
    <div className="relative inline-block">
      <Avatar 
        className={cn(
          finalSizeClass,
          'avatar-container',
          'conversation-user-avatar',
          'avatar-fade-in',
          className
        )}
      >
        {!shouldShowFallback && (
          <AvatarImage
            src={src}
            alt={alt}
            className="avatar-image"
            onLoad={() => {}}
            onError={() => setImageError(true)}
          />
        )}
        
        {shouldShowFallback && (
          <AvatarFallback 
            className={cn(
              'avatar-fallback',
              isLoading && 'avatar-loading',
              'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 font-semibold'
            )}
          >
            {isLoading ? '...' : fallback}
          </AvatarFallback>
        )}
      </Avatar>

      {/* Indicador de estado */}
      {showStatus && (
        <div 
          className={cn(
            'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm',
            statusColors[statusColor]
          )}
        />
      )}
    </div>
  )
}
