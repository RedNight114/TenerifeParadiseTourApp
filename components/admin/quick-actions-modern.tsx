"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Package, 
  MessageSquare, 
  Euro,
  Users,
  Plus,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface QuickActionProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: 'blue' | 'green' | 'purple' | 'orange'
  onClick?: () => void
}

function QuickAction({ title, description, icon: Icon, color, onClick }: QuickActionProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md hover:scale-105" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className={cn("p-3 rounded-xl bg-gradient-to-r", colorClasses[color])}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600 mb-3">{description}</p>
            <div className="flex items-center text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
              <span>Acceder</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function QuickActionsModern() {
  const router = useRouter()

  const handleNewReservation = () => {
    // Navegar a la página de nueva reserva
    router.push('/admin/reservations/new')
  }

  const handleAddService = () => {
    // Navegar a la página de servicios
    router.push('/admin/services')
  }

  const handleSupportChat = () => {
    // Navegar a la página de chat
    router.push('/admin/chat')
  }

  const handleManagePrices = () => {
    // Navegar a la página de precios
    router.push('/admin/pricing')
  }

  const actions: QuickActionProps[] = [
    {
      title: "Nueva Reserva",
      description: "Crear una reserva manual para un cliente",
      icon: Calendar,
      color: "blue",
      onClick: handleNewReservation
    },
    {
      title: "Agregar Servicio",
      description: "Crear un nuevo tour o actividad",
      icon: Package,
      color: "green",
      onClick: handleAddService
    },
    {
      title: "Chat de Soporte",
      description: "Responder mensajes de clientes",
      icon: MessageSquare,
      color: "purple",
      onClick: handleSupportChat
    },
    {
      title: "Gestionar Precios",
      description: "Actualizar tarifas y descuentos",
      icon: Euro,
      color: "orange",
      onClick: handleManagePrices
    }
  ]

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg">
          <Sparkles className="w-5 h-5 mr-2 text-blue-500" />
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function SystemStatusModern() {
  const [systemStatus, setSystemStatus] = React.useState({
    database: 'checking',
    cache: 'checking',
    api: 'checking',
    storage: 'checking'
  })
  const [lastCheck, setLastCheck] = React.useState<Date>(new Date())

  React.useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        // Simular verificación del estado del sistema
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setSystemStatus({
          database: 'operational',
          cache: 'optimized',
          api: 'operational',
          storage: 'operational'
        })
        setLastCheck(new Date())
      } catch (error) {
        setSystemStatus({
          database: 'error',
          cache: 'error',
          api: 'error',
          storage: 'error'
        })
      }
    }

    checkSystemStatus()
    
    // Verificar cada 30 segundos
    const interval = setInterval(checkSystemStatus, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'operational':
        return { color: 'green', text: 'Operativo', icon: '●' }
      case 'optimized':
        return { color: 'blue', text: 'Optimizado', icon: '●' }
      case 'checking':
        return { color: 'yellow', text: 'Verificando...', icon: '●' }
      case 'error':
        return { color: 'red', text: 'Error', icon: '●' }
      default:
        return { color: 'gray', text: 'Desconocido', icon: '●' }
    }
  }

  const getVersion = () => {
    return process.env.NEXT_PUBLIC_APP_VERSION || 'v2.0'
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          Estado del Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Estado General</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-600">Operativo</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Última Verificación</span>
            <span className="text-sm font-medium text-gray-900">{lastCheck.toLocaleTimeString()}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Versión del Panel</span>
            <span className="text-sm font-medium text-gray-900">{getVersion()}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Base de Datos</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 bg-${getStatusInfo(systemStatus.database).color}-500 rounded-full ${
                systemStatus.database === 'checking' ? 'animate-pulse' : ''
              }`}></div>
              <span className={`text-sm font-medium text-${getStatusInfo(systemStatus.database).color}-600`}>
                {getStatusInfo(systemStatus.database).text}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Caché</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 bg-${getStatusInfo(systemStatus.cache).color}-500 rounded-full ${
                systemStatus.cache === 'checking' ? 'animate-pulse' : ''
              }`}></div>
              <span className={`text-sm font-medium text-${getStatusInfo(systemStatus.cache).color}-600`}>
                {getStatusInfo(systemStatus.cache).text}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">API</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 bg-${getStatusInfo(systemStatus.api).color}-500 rounded-full ${
                systemStatus.api === 'checking' ? 'animate-pulse' : ''
              }`}></div>
              <span className={`text-sm font-medium text-${getStatusInfo(systemStatus.api).color}-600`}>
                {getStatusInfo(systemStatus.api).text}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Almacenamiento</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 bg-${getStatusInfo(systemStatus.storage).color}-500 rounded-full ${
                systemStatus.storage === 'checking' ? 'animate-pulse' : ''
              }`}></div>
              <span className={`text-sm font-medium text-${getStatusInfo(systemStatus.storage).color}-600`}>
                {getStatusInfo(systemStatus.storage).text}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function UserInfoModern() {
  const [userInfo, setUserInfo] = React.useState({
    name: 'Cargando...',
    email: 'Cargando...',
    role: 'admin',
    avatar: 'A',
    sessionStart: new Date()
  })

  React.useEffect(() => {
    const loadUserInfo = async () => {
      try {
        // Simular carga de información del usuario
        await new Promise(resolve => setTimeout(resolve, 500))
        
        setUserInfo({
          name: 'Brian Afonso',
          email: 'brian@tenerifeparadisetours.com',
          role: 'admin',
          avatar: 'B',
          sessionStart: new Date()
        })
      } catch (error) {
        }
    }

    loadUserInfo()
  }, [])

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg">
          <Users className="w-5 h-5 mr-2 text-purple-500" />
          Información de Sesión
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {userInfo.name === 'Cargando...' ? 'A' : getInitials(userInfo.name)}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{userInfo.name}</p>
            <p className="text-sm text-gray-500">{userInfo.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {userInfo.role}
              </span>
              <span className="text-xs text-gray-400">
                Sesión: {userInfo.sessionStart.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
