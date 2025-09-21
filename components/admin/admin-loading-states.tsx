"use client"

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface LoadingCardProps {
  className?: string
}

export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <Card className={cn("animate-pulse", className)}>
      <CardHeader className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </CardContent>
    </Card>
  )
}

interface LoadingStatsProps {
  count?: number
  className?: string
}

export function LoadingStats({ count = 4, className }: LoadingStatsProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
      {[...Array(count)].map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  )
}

interface LoadingTableProps {
  rows?: number
  columns?: number
  className?: string
}

export function LoadingTable({ rows = 5, columns = 4, className }: LoadingTableProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-6 w-1/4" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Header */}
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {[...Array(columns)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
          
          {/* Rows */}
          {[...Array(rows)].map((_, rowIndex) => (
            <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {[...Array(columns)].map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-8 w-full" />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface LoadingListProps {
  items?: number
  className?: string
}

export function LoadingList({ items = 5, className }: LoadingListProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {[...Array(items)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function LoadingSpinner({ size = 'md', text, className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex items-center space-x-2">
        <Loader2 className={cn("animate-spin text-blue-500", sizeClasses[size])} />
        {text && (
          <span className="text-gray-600 font-medium">{text}</span>
        )}
      </div>
    </div>
  )
}

interface LoadingPageProps {
  title?: string
  className?: string
}

export function LoadingPage({ title = "Cargando...", className }: LoadingPageProps) {
  return (
    <div className={cn("min-h-screen bg-gray-50 flex items-center justify-center p-4", className)}>
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600">
              Por favor, espera mientras cargamos el contenido...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface LoadingDashboardProps {
  className?: string
}

export function LoadingDashboard({ className }: LoadingDashboardProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>

      {/* Stats */}
      <LoadingStats />

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LoadingCard />
        <LoadingCard />
      </div>

      {/* Table */}
      <LoadingTable />
    </div>
  )
}
