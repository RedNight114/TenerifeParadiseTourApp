"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  MessageSquare, 
  Eye, 
  EyeOff, 
  Reply, 
  Archive, 
  Trash2, 
  Loader2, 
  Filter,
  RefreshCw,
  Clock,
  User,
  MapPin
} from "lucide-react"
import { useContactMessages, type ContactMessage } from "@/hooks/use-contact-messages"

// Modal para ver detalles del mensaje
interface MessageModalProps {
  message: ContactMessage | null
  isOpen: boolean
  onClose: () => void
  onUpdateStatus: (id: string, status: string, notes?: string) => Promise<boolean>
}

function MessageModal({ message, isOpen, onClose, onUpdateStatus }: MessageModalProps) {
  const [status, setStatus] = useState<string>(message?.status || 'new')
  const [adminNotes, setAdminNotes] = useState<string>(message?.admin_notes || '')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (message) {
      setStatus(message.status)
      setAdminNotes(message.admin_notes || '')
    }
  }, [message])

  const handleUpdateStatus = async () => {
    if (!message) return
    
    setIsUpdating(true)
    const success = await onUpdateStatus(message.id, status, adminNotes)
    setIsUpdating(false)
    
    if (success) {
      onClose()
    }
  }

  if (!isOpen || !message) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b bg-white sticky top-0 z-10">
          <h2 className="text-xl font-semibold">Detalles del Mensaje</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <span className="sr-only">Cerrar</span>
            ×
          </Button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {/* Información del cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Cliente</span>
                </div>
                <p className="text-gray-700">{message.name}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Email</span>
                </div>
                <a href={`mailto:${message.email}`} className="text-blue-600 hover:underline">
                  {message.email}
                </a>
              </div>
              
              {message.phone && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Teléfono</span>
                  </div>
                  <a href={`tel:${message.phone}`} className="text-blue-600 hover:underline">
                    {message.phone}
                  </a>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Fecha de envío</span>
                </div>
                <p className="text-gray-700">
                  {new Date(message.created_at).toLocaleString('es-ES')}
                </p>
              </div>
            </div>

            {/* Información del servicio */}
            {(message.service || message.date || message.guests) && (
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Información del Servicio</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {message.service && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Servicio</span>
                      </div>
                      <p className="text-gray-700">{message.service}</p>
                    </div>
                  )}
                  
                  {message.date && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Fecha</span>
                      </div>
                      <p className="text-gray-700">{message.date}</p>
                    </div>
                  )}
                  
                  {message.guests && !isNaN(message.guests) && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Personas</span>
                      </div>
                      <p className="text-gray-700">{message.guests}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mensaje */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Mensaje</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
              </div>
            </div>

            {/* Gestión del mensaje */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Gestión</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Estado</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white"
                  >
                    <option value="new">Nuevo</option>
                    <option value="read">Leído</option>
                    <option value="replied">Respondido</option>
                    <option value="archived">Archivado</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Notas del administrador</label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Añadir notas sobre la gestión de este mensaje..."
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdateStatus}
                    disabled={isUpdating}
                    className="flex-1"
                  >
                    {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Actualizar Estado
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ContactMessages() {
  const { 
    messages, 
    loading, 
    error, 
    totalCount,
    fetchMessages, 
    updateMessageStatus, 
    deleteMessage,
    getMessageStats 
  } = useContactMessages()
  
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    read: 0,
    replied: 0,
    archived: 0,
  })

  // Cargar estadísticas
  useEffect(() => {
    const loadStats = async () => {
      const messageStats = await getMessageStats()
      setStats(messageStats)
    }
    loadStats()
  }, [getMessageStats])

  // Filtrar mensajes
  const filteredMessages = messages.filter((message) => {
    const matchesSearch = 
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (message.service && message.service.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || message.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message)
    setIsModalOpen(true)
  }

  const handleUpdateStatus = async (id: string, status: string, notes?: string) => {
    const success = await updateMessageStatus(id, status, notes)
    if (success) {
      // Recargar estadísticas
      const messageStats = await getMessageStats()
      setStats(messageStats)
    }
    return success
  }

  const handleDeleteMessage = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este mensaje?")) {
      const success = await deleteMessage(id)
      if (success) {
        // Recargar estadísticas
        const messageStats = await getMessageStats()
        setStats(messageStats)
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { color: "bg-red-100 text-red-800", text: "Nuevo" },
      read: { color: "bg-blue-100 text-blue-800", text: "Leído" },
      replied: { color: "bg-green-100 text-green-800", text: "Respondido" },
      archived: { color: "bg-gray-100 text-gray-800", text: "Archivado" },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new
    return <Badge className={config.color}>{config.text}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mensajes de Contacto</h1>
          <p className="text-gray-600">Gestiona las solicitudes de información de los clientes</p>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchMessages()}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refrescar
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.new}</p>
              <p className="text-sm text-gray-600">Nuevos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.read}</p>
              <p className="text-sm text-gray-600">Leídos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.replied}</p>
              <p className="text-sm text-gray-600">Respondidos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{stats.archived}</p>
              <p className="text-sm text-gray-600">Archivados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, email, servicio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="all">Todos los estados</option>
                <option value="new">Nuevos</option>
                <option value="read">Leídos</option>
                <option value="replied">Respondidos</option>
                <option value="archived">Archivados</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                }}
                className="w-full"
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de mensajes */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando mensajes...</span>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      ) : filteredMessages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No se encontraron mensajes</p>
            {(searchTerm || statusFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                }}
                className="mt-2"
              >
                Limpiar filtros
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <Card key={message.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{message.name}</h3>
                        <p className="text-gray-600">{message.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(message.status)}
                        <span className="text-sm text-gray-500">
                          {new Date(message.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      {message.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          {message.phone}
                        </div>
                      )}
                      {message.service && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          {message.service}
                        </div>
                      )}
                      {message.guests && !isNaN(message.guests) && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          {message.guests} personas
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-700 line-clamp-2">
                      {message.message}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 lg:flex-col">
                    <Button
                      size="sm"
                      onClick={() => handleViewMessage(message)}
                      className="flex-1 lg:flex-none"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteMessage(message.id)}
                      className="flex-1 lg:flex-none"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      <MessageModal
        message={selectedMessage}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedMessage(null)
        }}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  )
} 