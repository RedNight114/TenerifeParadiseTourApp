"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Eye, EyeOff, Star, StarOff, Loader2, X, MoreVertical } from "lucide-react"
import { useServices } from "@/hooks/use-services"
import { useCategories } from "@/hooks/use-categories"
import { ServiceForm } from "./service-form"
import type { Service } from "@/lib/supabase"

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
      <div className="relative bg-white rounded-lg shadow-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
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

// Menú desplegable personalizado
interface ServiceMenuProps {
  service: Service
  onEdit: () => void
  onToggleAvailability: () => void
  onToggleFeatured: () => void
  onDelete: () => void
}

function ServiceMenu({ service, onEdit, onToggleAvailability, onToggleFeatured, onDelete }: ServiceMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Menu */}
          <div className="absolute right-0 top-8 z-20 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1">
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsOpen(false)
                onEdit()
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </button>

            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsOpen(false)
                onToggleAvailability()
              }}
            >
              {service.available ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Desactivar
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Activar
                </>
              )}
            </button>

            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsOpen(false)
                onToggleFeatured()
              }}
            >
              {service.featured ? (
                <>
                  <StarOff className="h-4 w-4 mr-2" />
                  Quitar destacado
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Destacar
                </>
              )}
            </button>

            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center text-red-600"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsOpen(false)
                onDelete()
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function ServicesManagement() {
  const {
    services,
    loading: servicesLoading,
    error: servicesError,
    fetchServices,
    createService,
    updateService,
    deleteService,
  } = useServices()

  const { categories, loadingCategories, error: categoriesError, fetchCategories } = useCategories()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchServices()
    fetchCategories()
  }, [fetchServices, fetchCategories])

  // Filtrar servicios
  const filteredServices = services.filter((service) => {
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

  const handleCreateService = () => {
    setEditingService(null)
    setIsModalOpen(true)
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingService(null)
  }

  const handleSubmitService = async (serviceData: any) => {
    try {
      setIsSubmitting(true)
      if (editingService) {
        await updateService(editingService.id, serviceData)
        } else {
        await createService(serviceData)
        }

      handleCloseModal()
      await fetchServices() // Recargar servicios
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al guardar el servicio")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteService = async (service: Service) => {
    if (confirm(`¿Estás seguro de que quieres eliminar "${service.title}"?`)) {
      try {
        await deleteService(service.id)
        } catch (error) {
        alert(error instanceof Error ? error.message : "Error al eliminar el servicio")
      }
    }
  }

  const handleToggleAvailability = async (service: Service) => {
    try {
      await updateService(service.id, { available: !service.available })
      } catch (error) {
      alert(error instanceof Error ? error.message : "Error al cambiar disponibilidad")
    }
  }

  const handleToggleFeatured = async (service: Service) => {
    try {
      await updateService(service.id, { featured: !service.featured })
      } catch (error) {
      alert(error instanceof Error ? error.message : "Error al cambiar destacado")
    }
  }

  if (servicesError || categoriesError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error al cargar datos</h3>
          <p className="text-red-600 text-sm mt-1">{servicesError || categoriesError}</p>
          <Button
            onClick={() => {
              fetchServices()
              fetchCategories()
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Servicios</h2>
          <p className="text-gray-600">
            {services.length} servicios totales, {filteredServices.length} mostrados
          </p>
        </div>
        <Button onClick={handleCreateService} disabled={servicesLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Añadir Servicio
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar servicios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Disponibilidad</label>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="all">Todos</option>
                <option value="available">Disponibles</option>
                <option value="unavailable">No disponibles</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                  setAvailabilityFilter("all")
                }}
                className="w-full"
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de servicios */}
      {servicesLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando servicios...</span>
        </div>
      ) : filteredServices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No se encontraron servicios</p>
            {searchTerm || selectedCategory !== "all" || availabilityFilter !== "all" ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                  setAvailabilityFilter("all")
                }}
                className="mt-2"
              >
                Limpiar filtros
              </Button>
            ) : (
              <Button onClick={handleCreateService} className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Crear primer servicio
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="overflow-hidden">
              <div className="aspect-video relative">
                {service.images && service.images.length > 0 ? (
                  <img
                    src={service.images[0] || "/placeholder.svg"}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Sin imagen</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  {service.featured && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Destacado
                    </Badge>
                  )}
                  <Badge variant={service.available ? "default" : "secondary"}>
                    {service.available ? "Disponible" : "No disponible"}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{service.title}</h3>
                  <ServiceMenu
                    service={service}
                    onEdit={() => handleEditService(service)}
                    onToggleAvailability={() => handleToggleAvailability(service)}
                    onToggleFeatured={() => handleToggleFeatured(service)}
                    onDelete={() => handleDeleteService(service)}
                  />
                </div>

                <p className="text-gray-600 text-sm line-clamp-2 mb-3">{service.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Precio:</span>
                    <span className="font-medium">
                      €{service.price} {service.price_type === "per_person" ? "/persona" : "total"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duración:</span>
                    <span>{service.duration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Capacidad:</span>
                    <span>
                      {service.min_group_size}-{service.max_group_size} personas
                    </span>
                  </div>
                  {service.location && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ubicación:</span>
                      <span className="truncate ml-2">{service.location}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
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
