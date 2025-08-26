"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Eye, EyeOff, Star, StarOff, Loader2, X, MoreVertical, RefreshCw, Euro, Users, Clock, MapPin, Calendar, TrendingUp, TrendingDown, AlertCircle, Image as ImageIcon } from "lucide-react"
import { useUnifiedData } from "@/hooks/use-unified-data"
import { ServiceForm } from "./service-form"
import { AuditLogger } from "@/lib/audit-logger"
import type { Service } from "@/lib/supabase"
import { normalizeImageUrl } from "@/lib/utils"
import { toast } from "sonner"
import { getSupabaseClient } from "@/lib/supabase-optimized"

// Modal personalizado
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.body.style.overflow = "unset"
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b bg-white sticky top-0 z-10">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

// Menú desplegable personalizado CORREGIDO
interface ServiceMenuProps {
  service: Service
  onEdit: () => void
  onToggleAvailability: () => void
  onToggleFeatured: () => void
  onDelete: () => void
}

function ServiceMenu({ service, onEdit, onToggleAvailability, onToggleFeatured, onDelete }: ServiceMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleCloseMenu = () => {
    setIsOpen(false)
  }

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        if (!target.closest('.service-menu-container')) {
          handleCloseMenu()
        }
      }
      
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative service-menu-container">
      {/* Botón principal - MEJORADO */}
      <button
        type="button"
        className="w-9 h-9 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 rounded-full flex items-center justify-center border border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md transition-all duration-200"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <>
          {/* Backdrop invisible */}
          <div className="fixed inset-0 z-40" onClick={handleCloseMenu} />
          
          {/* Menú */}
          <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
            {/* Header */}
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900 truncate">{service.title}</p>
              <p className="text-xs text-gray-500">Opciones del servicio</p>
            </div>
            
            {/* Opciones */}
            <div className="py-1">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleCloseMenu()
                  onEdit()
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center transition-colors duration-150"
              >
                <Edit className="w-4 h-4 mr-3 text-blue-600" />
                Editar servicio
              </button>
              
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleCloseMenu()
                  onToggleAvailability()
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center transition-colors duration-150"
              >
                {service.available ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-3 text-orange-600" />
                    Desactivar servicio
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-3 text-green-600" />
                    Activar servicio
                  </>
                )}
              </button>
              
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleCloseMenu()
                  onToggleFeatured()
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 flex items-center transition-colors duration-150"
              >
                {service.featured ? (
                  <>
                    <StarOff className="w-4 h-4 mr-3 text-orange-600" />
                    Quitar destacado
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 mr-3 text-yellow-600" />
                    Destacar servicio
                  </>
                )}
              </button>
              
              {/* Separador */}
              <div className="border-t border-gray-100 my-1" />
              
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleCloseMenu()
                  if (window.confirm(`¿Estás seguro de que quieres eliminar "${service.title}"?`)) {
                    onDelete()
                  }
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 hover:text-red-800 flex items-center transition-colors duration-150"
              >
                <Trash2 className="w-4 h-4 mr-3 text-red-600" />
                Eliminar servicio
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Componente de tarjeta de servicio mejorada
interface ServiceCardProps {
  service: Service
  onEdit: () => void
  onToggleAvailability: () => void
  onToggleFeatured: () => void
  onDelete: () => void
}

function ServiceCard({ service, onEdit, onToggleAvailability, onToggleFeatured, onDelete }: ServiceCardProps) {
  const formatPrice = (price: number, priceType: string) => {
    return `€${price} ${priceType === "per_person" ? "/persona" : "total"}`
  }

  const getStatusColor = (available: boolean) => {
    return available ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"
  }

  const getStatusIcon = (available: boolean) => {
    return available ? <AlertCircle className="h-3 w-3 text-green-600" /> : <AlertCircle className="h-3 w-3" />
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-0 shadow-md relative">
      {/* Imagen del servicio */}
      <div className="aspect-video relative overflow-hidden isolate">
        {service.images && Array.isArray(service.images) && service.images.length > 0 && service.images[0] ? (
          <img
            src={normalizeImageUrl(service.images[0])}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback en caso de error de imagen
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              target.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        
        {/* Fallback cuando no hay imagen o hay error */}
        <div className={`w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${service.images && Array.isArray(service.images) && service.images.length > 0 && service.images[0] ? 'hidden' : ''}`}>
          <div className="text-center">
            <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <span className="text-gray-500 text-sm">Sin imagen</span>
          </div>
        </div>
        
        {/* Overlay con badges */}
        <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-2">
          {service.featured && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
              <Star className="h-3 w-3 mr-1" />
              Destacado
            </Badge>
          )}
          <Badge variant="secondary" className={getStatusColor(service.available)}>
            {getStatusIcon(service.available)}
            <span className="ml-1">{service.available ? "Disponible" : "No disponible"}</span>
          </Badge>
        </div>

        {/* Overlay de hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>

      {/* Botón de menú mejorado - CORREGIDO */}
      <div className="absolute top-3 right-3 z-10">
        <ServiceMenu
          service={service}
          onEdit={onEdit}
          onToggleAvailability={onToggleAvailability}
          onToggleFeatured={onToggleFeatured}
          onDelete={onDelete}
        />
      </div>

      {/* Contenido de la tarjeta */}
      <CardContent className="p-5">
        {/* Título y precio */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 leading-tight flex-1 mr-3">
            {service.title}
          </h3>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">
              {formatPrice(service.price, service.price_type)}
            </div>
            {service.price_children && service.price_children > 0 && (
              <div className="text-sm text-gray-600">
                Niños: €{service.price_children}
              </div>
            )}
          </div>
        </div>

        {/* Descripción */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
          {service.description}
        </p>

        {/* Información detallada */}
        <div className="space-y-3">
          {/* Duración y ubicación */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span>{service.duration ? `${service.duration} min` : 'Duración no especificada'}</span>
            </div>
            {service.location && (
              <div className="flex items-center text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="truncate max-w-[120px]">{service.location}</span>
              </div>
            )}
          </div>

          {/* Capacidad del grupo */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-500">
              <Users className="h-4 w-4 mr-1" />
              <span>
                {service.min_group_size || 1}-{service.max_group_size || 1} personas
              </span>
            </div>
            {service.capacity && (
              <div className="flex items-center text-gray-500">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>Cap: {service.capacity}</span>
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            {service.difficulty_level && (
              <Badge variant="outline" className="text-xs">
                {service.difficulty_level}
              </Badge>
            )}
            {service.min_age && (
              <Badge variant="outline" className="text-xs">
                +{service.min_age} años
              </Badge>
            )}
            {service.license_required && (
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                Licencia
              </Badge>
            )}
            {service.vehicle_type && (
              <Badge variant="outline" className="text-xs">
                {service.vehicle_type}
              </Badge>
            )}
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
            <div className="text-center">
              <div className="font-semibold text-gray-700">
                {service.included_services?.length || 'N/A'}
              </div>
              <div>Incluido</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-700">
                {service.images?.length || 'N/A'}
              </div>
              <div>Imágenes</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-700">
                {service.schedule?.length || 'N/A'}
              </div>
              <div>Horarios</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ServicesManagement() {
  const {
    services,
    categories,
    loading: servicesLoading,
    error: servicesError,
    refreshData: refreshServices,
    clearCache,
    servicesByCategory,
    isInitialized
  } = useUnifiedData()
  
  // ✅ NUEVO: Estado local para actualizaciones en tiempo real
  const [localServices, setLocalServices] = useState<Service[]>([])
  
  // ✅ OPTIMIZADO: Un solo useEffect para manejar la inicialización
  useEffect(() => {
// ✅ CRÍTICO: Solo sincronizar si ya hay datos
    if (services && services.length > 0) {
      setLocalServices(services)
    }
    
    // ✅ CRÍTICO: Solo forzar carga si no está inicializado y no hay datos
    if (!isInitialized && (!services || services.length === 0) && !servicesLoading && !servicesError) {
refreshServices()
    }
  }, [services, isInitialized, servicesLoading, servicesError]) // Dependencias correctas
  
  // ✅ NUEVO: Log de debug para el dashboard
  useEffect(() => {
    console.log('Dashboard debug:', {
      servicesCount: services?.length,
      localServicesCount: localServices.length,
      loading: servicesLoading,
      error: servicesError,
      initialized: isInitialized,
      timestamp: new Date().toISOString()
    })
  }, [services?.length, localServices.length, servicesLoading, servicesError, isInitialized])
  
  // ✅ NUEVO: Usar localServices para el renderizado
  const displayServices = localServices.length > 0 ? localServices : services
  
  // ✅ NUEVO: Función para actualizar servicio en estado local
  const updateLocalService = async (id: string, data: any) => {
    setLocalServices(prevServices => 
      prevServices.map(service => 
        service.id === id 
          ? { ...service, ...data, updated_at: new Date().toISOString() }
          : service
      )
    )
  }
  
  // ✅ NUEVO: Función para agregar servicio al estado local
  const addLocalService = async (newService: any) => {
    setLocalServices(prevServices => [newService, ...prevServices])
  }
  
  // ✅ NUEVO: Función para eliminar servicio del estado local
  const removeLocalService = async (id: string) => {
    setLocalServices(prevServices => prevServices.filter(service => service.id !== id))
  }
  
  // Funciones de producción para gestión de servicios
  const createService = async (data: any) => {
    try {
      const supabaseClient = getSupabaseClient()
      const supabase = await supabaseClient.getClient()
      
      if (!supabase) {
        throw new Error('No se pudo conectar a la base de datos')
      }

      const { data: result, error } = await supabase.rpc('create_service_simple', {
        service_data: data
      })

      if (error) {
        throw new Error(`Error al crear servicio: ${error.message}`)
      }

      return result
    } catch (error) {
throw error
    }
  }

  const updateService = async (id: string, data: any) => {
    try {
      const supabaseClient = getSupabaseClient()
      const supabase = await supabaseClient.getClient()
      
      if (!supabase) {
        throw new Error('No se pudo conectar a la base de datos')
      }

      // Si solo se están actualizando imágenes
      if (data.images !== undefined && Object.keys(data).length === 1) {
        const { data: result, error } = await supabase.rpc('update_service_images_only', {
          service_id: id,
          images_array: data.images || []
        })

        if (error) {
throw new Error(`Error al actualizar imágenes: ${error.message}`)
        }

        return result
      }

      // Para otras actualizaciones, usar la función completa
      // IMPORTANTE: PostgREST espera los parámetros en orden inverso
      const { data: result, error } = await supabase.rpc('update_service_simple', {
        p_service_data: data,
        p_service_id: id
      })

      if (error) {
throw new Error(`Error al actualizar servicio: ${error.message}`)
      }

      // ✅ MEJORADO: Manejar respuesta TRUE/FALSE correctamente
      if (result === true) {
return { success: true, message: 'Servicio actualizado correctamente' }
      } else if (result === false) {
return { success: false, message: 'No se pudo actualizar el servicio' }
      } else {
return { success: true, message: 'Servicio actualizado (respuesta inesperada)' }
      }
    } catch (error) {
throw error
    }
  }

  const deleteService = async (id: string) => {
    try {
const supabaseClient = getSupabaseClient()
      const supabase = await supabaseClient.getClient()
      
      if (!supabase) {
        throw new Error('No se pudo conectar a la base de datos')
      }
// Intentar primero con la función RPC
      let result, error
      
      try {
        const rpcResult = await supabase.rpc('delete_service_simple', {
          service_id: id
        })
        result = rpcResult.data
        error = rpcResult.error
      } catch (rpcError) {
// Fallback: usar SQL directo
        const { data: sqlResult, error: sqlError } = await supabase
          .from('services')
          .delete()
          .eq('id', id)
          .select()
        
        result = sqlResult
        error = sqlError
      }
if (error) {
throw new Error(`Error al eliminar servicio: ${error.message}`)
      }
// Actualizar cache local inmediatamente
      if (result) {
// Limpiar cache global para forzar recarga
        clearCache()
        
        // Esperar un momento para que se procese la limpieza
        await new Promise(resolve => setTimeout(resolve, 50))
        
        // Forzar recarga de datos
        await refreshServices()
}

      return result
    } catch (error) {
throw error
    }
  }

  // Las categorías y subcategorías ya están incluidas en servicesByCategory

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Los servicios y categorías ya se cargan automáticamente en el hook
  // No es necesario cargar datos adicionales

  // Verificar estado de los datos y debug
  useEffect(() => {
if (servicesError) {

}
  }, [displayServices.length, categories.length, servicesLoading, servicesError])

  // Filtrar servicios
  const filteredServices = displayServices.filter((service) => {
    const matchesSearch =
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || service.category_id === selectedCategory

    const matchesAvailability =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && service.available) ||
      (availabilityFilter === "unavailable" && !service.available)

    return matchesSearch && matchesCategory && matchesAvailability
  })

  // Estadísticas
  const stats = {
    total: displayServices.length,
    available: displayServices.filter(s => s.available).length,
    featured: displayServices.filter(s => s.featured).length,
    unavailable: displayServices.filter(s => !s.available).length
  }

  const handleCreateService = () => {
    try {
      setEditingService(null)
      setIsModalOpen(true)
    } catch (error) {
alert('Error al abrir el formulario de creación. Inténtalo de nuevo.')
    }
  }

  const handleEditService = (service: Service) => {
    try {
      setEditingService(service)
      setIsModalOpen(true)
      
    } catch (error) {
toast.error('Error al abrir editor', {
        description: 'Error al abrir el editor del servicio. Inténtalo de nuevo.',
        duration: 5000,
      })
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingService(null)
  }

  const handleSubmitService = async (serviceData: any) => {
    try {
      setIsSubmitting(true)
      
      if (editingService) {
        const result = await updateService(editingService.id, serviceData)
        
        // ✅ MEJORADO: Manejar respuesta estructurada
        if (result && result.success) {
          toast.success('Servicio actualizado exitosamente', {
            description: result.message || 'El servicio se ha actualizado correctamente',
            duration: 3000,
          })
          
          // ✅ OPTIMIZADO: Actualizar solo el servicio específico en el estado local
          await updateLocalService(editingService.id, serviceData)
          
        } else {
          const errorMsg = result?.message || 'Error desconocido al actualizar'
          toast.error('Error al actualizar servicio', {
            description: errorMsg,
            duration: 5000,
          })
          return // No cerrar modal si hay error
        }
      } else {
        const result = await createService(serviceData)
        if (result) {
          // ✅ OPTIMIZADO: Agregar nuevo servicio al estado local
          await addLocalService(result)
        }
      }

      handleCloseModal()
      
      // ✅ OPTIMIZADO: Solo refrescar si es necesario (para sincronizar con BD)
      setTimeout(() => {
        refreshServices()
      }, 500) // Pequeño delay para evitar conflictos
      
      // ✅ MEJORADO: Mensaje de éxito más específico
      if (editingService) {
        toast.success('Servicio actualizado', {
          description: `"${editingService.title}" ha sido actualizado exitosamente.`,
          duration: 3000,
        })
      } else {
        toast.success('Servicio creado', {
          description: 'El nuevo servicio ha sido creado exitosamente.',
          duration: 3000,
        })
      }
    } catch (error) {

// Mostrar error más detallado
      let errorMessage = 'Error desconocido al guardar el servicio'
      
      if (error instanceof Error) {
        errorMessage = error.message
        
        // Analizar tipos específicos de errores
        if (error.message.includes('duplicate key')) {
          errorMessage = 'Ya existe un servicio con ese título'
        } else if (error.message.includes('foreign key')) {
          errorMessage = 'La categoría seleccionada no existe'
        } else if (error.message.includes('not null')) {
          errorMessage = 'Faltan campos requeridos'
        } else if (error.message.includes('permission')) {
          errorMessage = 'No tienes permisos para guardar servicios'
        } else if (error.message.includes('network')) {
          errorMessage = 'Error de conexión. Verifica tu internet'
        } else if (error.message.includes('autenticación')) {
          errorMessage = 'Error de autenticación. Por favor, inicia sesión nuevamente'
        }
      }
      
      toast.error('Error al guardar servicio', {
        description: errorMessage,
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteService = async (service: Service) => {
    if (confirm(`¿Estás seguro de que quieres eliminar "${service.title}"?\n\nEsta acción no se puede deshacer.`)) {
      try {
// Eliminar el servicio
        const result = await deleteService(service.id)
        
        if (result) {
// ✅ OPTIMIZADO: Actualizar estado local inmediatamente
          removeLocalService(service.id)
          
          // Limpiar cache y recargar servicios en background
          clearCache()
          
          // ✅ OPTIMIZADO: Recargar datos en background sin bloquear UI
          setTimeout(async () => {
            await refreshServices()
}, 100)
// Verificar que el estado se actualizó
toast.success('Servicio eliminado', {
            description: `"${service.title}" ha sido eliminado exitosamente.`,
            duration: 3000,
          })
        } else {
          throw new Error('No se recibió confirmación de eliminación')
        }
        
      } catch (error) {
let errorMessage = "Error al eliminar el servicio"
        
        if (error instanceof Error) {
          errorMessage = error.message
          
          // Mostrar mensajes más específicos
          if (error.message.includes('permisos')) {
            errorMessage = '❌ No tienes permisos para eliminar servicios. Contacta al administrador.'
          } else if (error.message.includes('reservas')) {
            errorMessage = '❌ No se puede eliminar el servicio porque tiene reservas asociadas. Primero cancela las reservas.'
          } else if (error.message.includes('autenticación')) {
            errorMessage = '❌ Error de autenticación. Por favor, inicia sesión nuevamente.'
          } else if (error.message.includes('no encontrado')) {
            errorMessage = '❌ El servicio ya no existe o fue eliminado por otro usuario.'
          } else if (error.message.includes('network')) {
            errorMessage = '❌ Error de conexión. Verifica tu internet.'
          }
        }
        
        toast.error('Error al eliminar servicio', {
          description: errorMessage,
          duration: 5000,
        })
      }
    }
  }

  const handleToggleAvailability = async (service: Service) => {
          try {
      
      // Verificar que updateService existe
      if (typeof updateService !== 'function') {
        throw new Error('updateService function is not available')
      }
      
      // Actualizar el servicio
      await updateService(service.id, { available: !service.available })
      
      // Limpiar cache y recargar servicios
      clearCache()
      await refreshServices()
      
      // Mostrar notificación de éxito
      const action = service.available ? 'desactivado' : 'activado'
      toast.success(`Servicio ${action}`, {
        description: `"${service.title}" ha sido ${action} exitosamente.`,
        duration: 3000,
      })
      
    } catch (error) {
let errorMessage = "Error al cambiar disponibilidad del servicio"
      
      if (error instanceof Error) {
        errorMessage = error.message
        
        if (error.message.includes('permisos')) {
          errorMessage = '❌ No tienes permisos para modificar servicios. Contacta al administrador.'
        } else if (error.message.includes('no encontrado')) {
          errorMessage = '❌ El servicio ya no existe o fue eliminado.'
        } else if (error.message.includes('autenticación')) {
          errorMessage = '❌ Error de autenticación. Por favor, inicia sesión nuevamente.'
        } else if (error.message.includes('network')) {
          errorMessage = '❌ Error de conexión. Verifica tu internet.'
        }
      }
      
      toast.error('Error al cambiar disponibilidad', {
        description: errorMessage,
        duration: 5000,
      })
    }
  }

  const handleToggleFeatured = async (service: Service) => {
    try {
      // Actualizar el servicio
      await updateService(service.id, { featured: !service.featured })
      
      // Limpiar cache y recargar servicios
      clearCache()
      await refreshServices()
      
      // Mostrar notificación de éxito
      const action = service.featured ? 'quitado de destacados' : 'destacado'
      toast.success(`Servicio ${action}`, {
        description: `"${service.title}" ha sido ${action} exitosamente.`,
        duration: 3000,
      })
      
    } catch (error) {
let errorMessage = "Error al cambiar destacado del servicio"
      
      if (error instanceof Error) {
        errorMessage = error.message
        
        if (error.message.includes('permisos')) {
          errorMessage = '❌ No tienes permisos para modificar servicios. Contacta al administrador.'
        } else if (error.message.includes('no encontrado')) {
          errorMessage = '❌ El servicio ya no existe o fue eliminado.'
        } else if (error.message.includes('autenticación')) {
          errorMessage = '❌ Error de autenticación. Por favor, inicia sesión nuevamente.'
        } else if (error.message.includes('network')) {
          errorMessage = '❌ Error de conexión. Verifica tu internet.'
        }
      }
      
      toast.error('Error al cambiar destacado', {
        description: errorMessage,
        duration: 5000,
      })
    }
  }



  if (servicesError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error al cargar datos</h3>
          <p className="text-red-600 text-sm mt-1">{servicesError}</p>
          <Button
            onClick={() => {
              refreshServices()
            }}
            className="mt-2"
            size="sm"
          >
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header mejorado */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Servicios</h2>
          <p className="text-gray-600 mb-4">
            Administra todos los servicios de la plataforma
          </p>
          
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Total</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Disponibles</p>
                  <p className="text-2xl font-bold text-green-900">{stats.available}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-600">Destacados</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.featured}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-600">No disponibles</p>
                  <p className="text-2xl font-bold text-red-900">{stats.unavailable}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button onClick={handleCreateService} disabled={servicesLoading} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Añadir Servicio
          </Button>
          

        </div>
      </div>

      {/* Filtros mejorados - Diseño compacto */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Buscar servicios</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por título o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-9"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Disponibilidad</label>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-9"
              >
                <option value="all">Todos los servicios</option>
                <option value="available">Solo disponibles</option>
                <option value="unavailable">Solo no disponibles</option>
              </select>
            </div>

            {/* Botones de Herramientas - Simplificados */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={refreshServices}
                disabled={servicesLoading}
                className="flex-1 min-w-[120px] h-9"
                title="Refrescar datos desde la base de datos"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${servicesLoading ? 'animate-spin' : ''}`} />
                Refrescar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                  setAvailabilityFilter("all")
                }}
                className="flex-1 min-w-[120px] h-9"
                title="Limpiar todos los filtros aplicados"
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
              <Button
                variant="outline"
                onClick={clearCache}
                disabled={servicesLoading}
                className="flex-1 min-w-[120px] h-9 bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
                title="Limpiar cache y forzar recarga completa"
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar Cache
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de servicios mejorada */}
      {servicesLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando servicios...</p>
          </div>
        </div>
      ) : !isInitialized && !servicesLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
            </div>
            <h3 className="text-lg font-medium text-orange-900 mb-2">Inicializando sistema...</h3>
            <p className="text-orange-600 mb-6">Configurando conexión con la base de datos</p>
            <Button 
              onClick={refreshServices}
              variant="outline"
              className="border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </div>
      ) : !isInitialized && !servicesLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
            </div>
            <h3 className="text-lg font-medium text-orange-900 mb-2">Inicializando sistema...</h3>
            <p className="text-orange-600 mb-6">Configurando conexión con la base de datos</p>
            <Button 
              onClick={refreshServices}
              variant="outline"
              className="border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </div>
      ) : servicesError ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-red-900 mb-2">Error al cargar servicios</h3>
              <p className="text-red-600 mb-6">{servicesError}</p>
              <Button 
                onClick={refreshServices}
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (!services || services.length === 0) && !servicesLoading ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
              <h3 className="text-lg font-medium text-yellow-900 mb-2">No hay servicios disponibles</h3>
              <p className="text-yellow-600 mb-6">Los servicios no se han cargado. Intenta recargar la página.</p>
              <Button 
                onClick={refreshServices}
                variant="outline"
                className="border-yellow-200 text-yellow-700 hover:bg-yellow-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Cargar Servicios
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredServices.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron servicios</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedCategory !== "all" || availabilityFilter !== "all" 
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza creando tu primer servicio"
                }
              </p>
              {searchTerm || selectedCategory !== "all" || availabilityFilter !== "all" ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                    setAvailabilityFilter("all")
                  }}
                >
                  Limpiar filtros
                </Button>
              ) : (
                <Button onClick={handleCreateService}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primer servicio
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Información de resultados */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Mostrando {filteredServices.length} de {displayServices.length} servicios
            </p>
            <div className="text-sm text-gray-500">
              {searchTerm && `Buscando: "${searchTerm}"`}
            </div>
          </div>
          


          {/* Grid de tarjetas mejorado */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={() => handleEditService(service)}
                onToggleAvailability={() => handleToggleAvailability(service)}
                onToggleFeatured={() => handleToggleFeatured(service)}
                onDelete={() => handleDeleteService(service)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingService ? `Editar: ${editingService.title}` : "Nuevo Servicio"}
      >
        <ServiceForm
          service={editingService}
          onSubmit={handleSubmitService}
          onCancel={handleCloseModal}
          loading={isSubmitting}
        />
      </Modal>
    </div>
  )
}

