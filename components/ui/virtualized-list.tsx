"use client"

import React, { useMemo, useCallback, useState, useRef } from 'react'
import { FixedSizeList as List, VariableSizeList as VariableList } from 'react-window'
import { useResizeObserver } from '@/hooks/use-resize-observer'
import { Loader2, RefreshCw } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'

interface VirtualizedListProps<T> {
  items: T[]
  height?: number
  itemHeight?: number
  itemWidth?: number
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode
  loading?: boolean
  error?: string | null
  onRefresh?: () => void
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  filterable?: boolean
  filters?: Array<{
    key: string
    label: string
    options: Array<{ value: string; label: string }>
    value: string
    onChange: (value: string) => void
  }>
  emptyMessage?: string
  className?: string
}

export function VirtualizedList<T>({
  items,
  height = 600,
  itemHeight = 200,

  renderItem,
  loading = false,
  error = null,
  onRefresh,
  searchable = false,
  searchPlaceholder = "Buscar...",
  onSearch,
  filterable = false,
  filters = [],
  emptyMessage = "No hay elementos para mostrar",
  className = ""
}: VirtualizedListProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<List>(null)

  // Debouncing para búsqueda
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      onSearch?.(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, onSearch])

  // Observer para redimensionamiento
  const { height: containerHeight } = useResizeObserver()

  // Altura dinámica basada en el contenedor
  const dynamicHeight = useMemo(() => {
    return Math.min(height, containerHeight || height)
  }, [height, containerHeight])

  // Función para renderizar cada elemento
  const renderRow = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index]
    if (!item) return null

    return renderItem(item, index, style)
  }, [items, renderItem])



  // Función para limpiar búsqueda
  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setDebouncedSearchQuery('')
    onSearch?.('')
  }, [onSearch])

  // Función para refrescar
  const handleRefresh = useCallback(() => {
    onRefresh?.()
    // Limpiar búsqueda al refrescar
    clearSearch()
  }, [onRefresh, clearSearch])

  // Mensaje cuando no hay elementos
  if (items.length === 0 && !loading) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {emptyMessage}
          </h3>
          {onRefresh && (
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refrescar
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-red-600 mb-2">
            Error al cargar datos
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          {onRefresh && (
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
          <div ref={containerRef} className={`flex flex-col ${className}`}>
      {/* Header con controles */}
      {(searchable || filterable || onRefresh) && (
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 border-b">
          {/* Búsqueda */}
          {searchable && (
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          )}

          {/* Filtros */}
          {filterable && filters.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {filters.map((filter) => (
                <select
                  key={filter.key}
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">{filter.label}</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          )}

          {/* Botón de refrescar */}
          {onRefresh && (
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refrescar
            </Button>
          )}
        </div>
      )}

      {/* Lista virtualizada */}
      <div className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Cargando...</span>
          </div>
        ) : (
          <List
            ref={listRef}
            height={dynamicHeight}
            itemCount={items.length}
            itemSize={itemHeight}
            width="100%"
            overscanCount={5} // Pre-renderizar 5 elementos extra
            onScroll={() => {
              // Aquí puedes implementar lógica adicional de scroll
              // Por ejemplo, infinite scroll, analytics, etc.
            }}
          >
            {renderRow}
          </List>
        )}
      </div>

      {/* Footer con estadísticas */}
      <div className="p-4 bg-gray-50 border-t text-sm text-gray-600">
        <div className="flex justify-between items-center">
          <span>
            Mostrando {items.length} elementos
            {debouncedSearchQuery && (
              <span className="ml-2">
                (búsqueda: "{debouncedSearchQuery}")
              </span>
            )}
          </span>
          {onRefresh && (
            <Button
              onClick={handleRefresh}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Hook para usar con listas variables
export function useVariableSizeList<T>(
  items: T[],
  getItemSize: (index: number) => number
) {
  const listRef = useRef<VariableList>(null)

  // Recalcular tamaños cuando cambian los items
  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0)
    }
  }, [items])

  const scrollToItem = useCallback((index: number) => {
    listRef.current?.scrollToItem(index, 'center')
  }, [])

  return { listRef, scrollToItem }
}

// Componente especializado para servicios
export function VirtualizedServicesList({ 
  services, 
  renderService,
  ...props 
}: Omit<VirtualizedListProps<any>, 'items' | 'renderItem'> & {
  services: any[]
  renderService: (service: any, index: number, style: React.CSSProperties) => React.ReactNode
}) {
  return (
    <VirtualizedList
      items={services}
      renderItem={renderService}
      itemHeight={250} // Altura típica de una tarjeta de servicio
      searchable={true}
      searchPlaceholder="Buscar servicios..."
      filterable={true}
      filters={[
        {
          key: 'category',
          label: 'Categoría',
          options: [
            { value: 'all', label: 'Todas las categorías' },
            { value: 'featured', label: 'Destacados' },
            { value: 'available', label: 'Disponibles' }
          ],
          value: 'all',
          onChange: () => {} // Implementar lógica de filtrado
        }
      ]}
      {...props}
    />
  )
}
