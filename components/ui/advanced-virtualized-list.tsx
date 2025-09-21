// Componente de virtualización avanzada para listas largas
// Optimiza el rendimiento renderizando solo los elementos visibles

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

interface VirtualizedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  itemHeight?: number | ((index: number) => number)
  overscan?: number
  className?: string
  containerHeight?: number
  containerWidth?: number | string
  enableDynamicHeight?: boolean
  enableInfiniteScroll?: boolean
  onLoadMore?: () => Promise<void>
  loadingComponent?: React.ReactNode
  emptyComponent?: React.ReactNode
  scrollToIndex?: number
  onScroll?: (scrollTop: number) => void
  enableSmoothScrolling?: boolean
  enableKeyboardNavigation?: boolean
  enableFocusManagement?: boolean
}

function AdvancedVirtualizedList<T>({
  items,
  renderItem,
  itemHeight = 50,
  overscan = 5,
  className = '',
  containerHeight = 400,
  containerWidth = '100%',
  enableDynamicHeight = false,
  enableInfiniteScroll = false,
  onLoadMore,
  loadingComponent,
  emptyComponent,
  scrollToIndex,
  onScroll,
  enableSmoothScrolling = true,
  enableKeyboardNavigation = true,
  enableFocusManagement = true
}: VirtualizedListProps<T>) {
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const parentRef = useRef<HTMLDivElement>(null)
  const scrollElementRef = useRef<HTMLDivElement>(null)

  // Configuración de virtualización
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: useCallback((index: number) => {
      if (typeof itemHeight === 'function') {
        return itemHeight(index)
      }
      return itemHeight
    }, [itemHeight]),
    overscan,
  })

  // Scroll automático a índice específico
  useEffect(() => {
    if (scrollToIndex !== undefined && scrollToIndex >= 0 && scrollToIndex < items.length) {
      virtualizer.scrollToIndex(scrollToIndex, { align: 'center' })
    }
  }, [scrollToIndex, items.length, virtualizer])

  // Carga infinita
  const handleScroll = useCallback(async (e: React.UIEvent<HTMLDivElement>) => {
    if (!enableInfiniteScroll || !onLoadMore || isLoading || !hasMore) return

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight

    // Cargar más cuando el usuario esté al 80% del scroll
    if (scrollPercentage > 0.8) {
      try {
        setIsLoading(true)
        await onLoadMore()
      } catch (error) {
        setHasMore(false)
      } finally {
        setIsLoading(false)
      }
    }

    // Callback de scroll personalizado
    onScroll?.(scrollTop)
  }, [enableInfiniteScroll, onLoadMore, isLoading, hasMore, onScroll])

  // Navegación por teclado
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!enableKeyboardNavigation) return

    const currentIndex = Math.floor((virtualizer.scrollOffset || 0) / (typeof itemHeight === 'function' ? itemHeight(0) : itemHeight))

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        virtualizer.scrollToIndex(
          Math.min(currentIndex + 1, items.length - 1),
          { align: 'start' }
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        virtualizer.scrollToIndex(
          Math.max(currentIndex - 1, 0),
          { align: 'end' }
        )
        break
      case 'Home':
        e.preventDefault()
        virtualizer.scrollToIndex(0, { align: 'start' })
        break
      case 'End':
        e.preventDefault()
        virtualizer.scrollToIndex(items.length - 1, { align: 'end' })
        break
      case 'PageDown':
        e.preventDefault()
        const pageSize = Math.floor(containerHeight / (typeof itemHeight === 'function' ? itemHeight(0) : itemHeight))
        virtualizer.scrollToIndex(
          Math.min(currentIndex + pageSize, items.length - 1),
          { align: 'start' }
        )
        break
      case 'PageUp':
        e.preventDefault()
        const pageSizeUp = Math.floor(containerHeight / (typeof itemHeight === 'function' ? itemHeight(0) : itemHeight))
        virtualizer.scrollToIndex(
          Math.max(currentIndex - pageSizeUp, 0),
          { align: 'end' }
        )
        break
    }
  }, [enableKeyboardNavigation, virtualizer, items.length, containerHeight, itemHeight])

  // Gestión de foco
  const handleItemFocus = useCallback((index: number) => {
    if (enableFocusManagement) {
      virtualizer.scrollToIndex(index, { align: 'center' })
    }
  }, [enableFocusManagement, virtualizer])

  // Componente de carga
  const LoadingIndicator = useMemo(() => {
    if (!loadingComponent) {
      return (
        <div className="flex items-center justify-center p-4 text-muted-foreground">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
          Cargando más elementos...
        </div>
      )
    }
    return loadingComponent
  }, [loadingComponent])

  // Componente vacío
  const EmptyState = useMemo(() => {
    if (!emptyComponent) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-lg font-medium mb-2">No hay elementos</h3>
          <p className="text-sm">No se encontraron elementos para mostrar</p>
        </div>
      )
    }
    return emptyComponent
  }, [emptyComponent])

  // Renderizar elementos virtualizados
  const virtualItems = virtualizer.getVirtualItems()

  // Calcular altura total para scrollbar
  const totalHeight = useMemo(() => {
    if (typeof itemHeight === 'function') {
      return items.reduce((total, _, index) => total + itemHeight(index), 0)
    }
    return items.length * itemHeight
  }, [items, itemHeight])

  if (items.length === 0) {
    return (
      <div className={`w-full ${className}`} style={{ height: containerHeight }}>
        {EmptyState}
      </div>
    )
  }

  return (
    <div
      ref={parentRef}
      className={`relative ${className}`}
      style={{
        height: containerHeight,
        width: containerWidth
      }}
    >
      {/* Contenedor de scroll */}
      <div
        ref={scrollElementRef}
        className="h-full overflow-auto"
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        tabIndex={enableKeyboardNavigation ? 0 : -1}
        role="listbox"
        aria-label="Lista virtualizada"
        style={{
          scrollBehavior: enableSmoothScrolling ? 'smooth' : 'auto'
        }}
      >
        {/* Contenedor virtual con altura total */}
        <div
          style={{
            height: `${totalHeight}px`,
            width: '100%',
            position: 'relative'
          }}
        >
          {/* Elementos visibles */}
          {virtualItems.map((virtualItem) => {
            const item = items[virtualItem.index]
            const itemHeightValue = typeof itemHeight === 'function' 
              ? itemHeight(virtualItem.index) 
              : itemHeight

            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                className="absolute top-0 left-0 w-full"
                style={{
                  transform: `translateY(${virtualItem.start}px)`,
                  height: `${itemHeightValue}px`
                }}
                onFocus={() => handleItemFocus(virtualItem.index)}
                tabIndex={enableFocusManagement ? 0 : -1}
                role="option"
                aria-selected={false}
              >
                {renderItem(item, virtualItem.index)}
              </div>
            )
          })}
        </div>
      </div>

      {/* Indicador de carga */}
      {enableInfiniteScroll && isLoading && hasMore && (
        <div className="absolute bottom-0 left-0 right-0">
          {LoadingIndicator}
        </div>
      )}

      {/* Indicador de fin de lista */}
      {enableInfiniteScroll && !hasMore && items.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-muted-foreground text-sm">
          No hay más elementos para cargar
        </div>
      )}

      {/* Información de debug (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 bg-black/80 text-white text-xs p-2 rounded">
          <div>Elementos: {items.length}</div>
          <div>Visibles: {virtualItems.length}</div>
          <div>Scroll: {Math.round(virtualizer.scrollOffset || 0)}px</div>
        </div>
      )}
    </div>
  )
}

export default AdvancedVirtualizedList

// Hook personalizado para virtualización
export function useVirtualization<T>(
  items: T[],
  options: {
    itemHeight: number | ((index: number) => number)
    overscan?: number
    containerHeight: number
  }
) {
  const parentRef = useRef<HTMLDivElement>(null)
  const scrollElementRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: useCallback((index: number) => {
      if (typeof options.itemHeight === 'function') {
        return options.itemHeight(index)
      }
      return options.itemHeight
    }, [options.itemHeight]),
    overscan: options.overscan || 5
  })

  return {
    virtualizer,
    parentRef,
    scrollElementRef,
    virtualItems: virtualizer.getVirtualItems(),
    scrollToIndex: virtualizer.scrollToIndex,
    scrollOffset: virtualizer.scrollOffset
  }
}

// Componente de placeholder para elementos en carga
export function VirtualizedItemPlaceholder({ height }: { height: number }) {
  return (
    <div 
      className="animate-pulse bg-muted rounded"
      style={{ height: `${height}px` }}
    />
  )
}

// Componente de skeleton para listas
export function VirtualizedListSkeleton({ 
  count, 
  itemHeight, 
  containerHeight 
}: { 
  count: number
  itemHeight: number
  containerHeight: number 
}) {
  return (
    <div className="space-y-2" style={{ height: containerHeight }}>
      {Array.from({ length: count }).map((_, index) => (
        <VirtualizedItemPlaceholder key={index} height={itemHeight} />
      ))}
    </div>
  )
}
