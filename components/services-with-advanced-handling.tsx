"use client"

import { useState } from 'react'
import { useServicesAdvanced } from '@/hooks/use-services-advanced'
import { AdvancedLoading, SectionLoading, TableLoading } from '@/components/advanced-loading'
import { AdvancedError, ValidationError } from '@/components/advanced-error-handling'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Plus, Search, Filter } from 'lucide-react'

export function ServicesWithAdvancedHandling() {
  const {
    // Datos
    services,
    categories,
    subcategories,
    
    // Estados de loading
    isLoading,
    isInitialLoading,
    isRefreshing,
    isCreating,
    isUpdating,
    isDeleting,
    
    // Estados de error
    error,
    hasError,
    
    // Acciones
    fetchServices,
    refreshServices,
    clearError,
    
    // Utilidades
    searchServices,
    
    // Estadísticas
    totalServices,
    servicesByCategory,
    servicesByStatus
  } = useServicesAdvanced()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Filtrar servicios
  const filteredServices = searchQuery 
    ? searchServices(searchQuery)
    : selectedCategory !== 'all'
    ? services.filter(service => service.category_id === selectedCategory)
    : services

  // Loading inicial
  if (isInitialLoading) {
    return (
      <div className="min-h-screen">
        <AdvancedLoading
          isLoading={true}
          variant="fullscreen"
          showProgress={true}
          size="lg"
        />
      </div>
    )
  }

  // Error crítico
  if (hasError && error?.type === 'network') {
    return (
      <div className="min-h-screen">
        <AdvancedError
          error={error}
          variant="fullscreen"
          onRetry={refreshServices}
          showDetails={true}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header con estadísticas */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Servicios</h1>
          <p className="text-muted-foreground">
            {totalServices} servicios disponibles
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={refreshServices}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
          
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Servicio
          </Button>
        </div>
      </div>

      {/* Error no crítico */}
      {hasError && error && (
        <AdvancedError
          error={error}
          variant="inline"
          onRetry={refreshServices}
          onDismiss={clearError}
          showDetails={false}
        />
      )}

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar servicios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            
            {/* Filtro por categoría */}
            <div className="sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Estadísticas rápidas */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              Total: {totalServices}
            </Badge>
            {Object.entries(servicesByCategory).slice(0, 3).map(([category, count]) => (
              <Badge key={category} variant="outline">
                {category}: {count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de servicios */}
      <div className="space-y-4">
        {/* Loading de tabla */}
        {isLoading && !isInitialLoading && (
          <Card>
            <CardContent className="p-6">
              <TableLoading columns={4} rows={5} />
            </CardContent>
          </Card>
        )}

        {/* Servicios encontrados */}
        {!isLoading && filteredServices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(service => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                      <CardDescription>
                        {service.category?.name} • {service.subcategory?.name}
                      </CardDescription>
                    </div>
                    <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                      {service.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {service.description?.substring(0, 100)}...
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">
                      €{service.price}
                    </span>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Ver detalles
                      </Button>
                      <Button size="sm" variant="outline">
                        Reservar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Sin resultados */}
        {!isLoading && filteredServices.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <div className="text-6xl">🔍</div>
                <h3 className="text-xl font-semibold">No se encontraron servicios</h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? `No hay servicios que coincidan con "${searchQuery}"`
                    : 'No hay servicios disponibles en esta categoría'
                  }
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                  variant="outline"
                >
                  Limpiar filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Loading de acciones */}
      {(isCreating || isUpdating || isDeleting) && (
        <div className="fixed bottom-4 right-4 z-50">
          <AdvancedLoading
            isLoading={true}
            variant="toast"
            size="sm"
            message={
              isCreating ? 'Creando servicio...' :
              isUpdating ? 'Actualizando servicio...' :
              isDeleting ? 'Eliminando servicio...' :
              'Procesando...'
            }
          />
        </div>
      )}
    </div>
  )
}

// Componente de ejemplo para una página de servicio individual
export function ServiceDetailWithAdvancedHandling({ serviceId }: { serviceId: string }) {
  const {
    getServiceById,
    fetchServiceById,
    isLoading,
    error,
    hasError
  } = useServicesAdvanced()

  const service = getServiceById(serviceId)

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <SectionLoading message="Cargando detalles del servicio..." />
      </div>
    )
  }

  // Error
  if (hasError && error) {
    return (
      <div className="min-h-screen">
        <AdvancedError
          error={error}
          variant="fullscreen"
          onRetry={() => fetchServiceById(serviceId)}
          showDetails={true}
        />
      </div>
    )
  }

  // Servicio no encontrado
  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="text-6xl">❌</div>
              <h3 className="text-xl font-semibold">Servicio no encontrado</h3>
              <p className="text-muted-foreground">
                El servicio que buscas no existe o ha sido eliminado.
              </p>
              <Button onClick={() => window.history.back()}>
                Volver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{service.title}</CardTitle>
          <CardDescription>
            {service.category?.name} • {service.subcategory?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4">{service.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">€{service.price}</span>
            <Button>Reservar Ahora</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 