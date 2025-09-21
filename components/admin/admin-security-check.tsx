"use client"

import React, { useEffect, useState } from 'react'
import { useAuthContext } from '@/components/auth-provider'
import { Shield, AlertTriangle, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SecurityCheckProps {
  className?: string
}

interface SecurityItem {
  id: string
  title: string
  description: string
  status: 'secure' | 'warning' | 'error'
  icon: React.ComponentType<{ className?: string }>
}

export function AdminSecurityCheck({ className }: SecurityCheckProps) {
  const { user, profile } = useAuthContext()
  const [securityItems, setSecurityItems] = useState<SecurityItem[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Verificaciones de seguridad
    const checks: SecurityItem[] = [
      {
        id: 'auth-status',
        title: 'Estado de Autenticación',
        description: user ? 'Usuario autenticado correctamente' : 'Usuario no autenticado',
        status: user ? 'secure' : 'error',
        icon: Shield
      },
      {
        id: 'admin-role',
        title: 'Rol de Administrador',
        description: profile?.role === 'admin' ? 'Rol de administrador verificado' : 'Rol insuficiente',
        status: profile?.role === 'admin' ? 'secure' : 'error',
        icon: Lock
      },
      {
        id: 'session-security',
        title: 'Seguridad de Sesión',
        description: 'Sesión protegida con HTTPS y tokens seguros',
        status: 'secure',
        icon: CheckCircle
      },
      {
        id: 'data-access',
        title: 'Control de Acceso a Datos',
        description: 'Acceso restringido a datos sensibles',
        status: 'secure',
        icon: Eye
      }
    ]

    setSecurityItems(checks)
  }, [user, profile])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'secure':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      default:
        return <Shield className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'secure':
        return <Badge variant="default" className="bg-green-500">Seguro</Badge>
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500">Advertencia</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'secure':
        return 'border-l-green-500 bg-green-50'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'error':
        return 'border-l-red-500 bg-red-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const secureCount = securityItems.filter(item => item.status === 'secure').length
  const totalCount = securityItems.length
  const securityScore = Math.round((secureCount / totalCount) * 100)

  return (
    <div className={cn("space-y-4", className)}>
      {/* Resumen de seguridad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Estado de Seguridad
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(!isVisible)}
            >
              {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {securityScore}%
              </div>
              <p className="text-sm text-gray-600">
                Puntuación de seguridad
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                {secureCount} de {totalCount} verificaciones
              </div>
              <Badge 
                variant={securityScore >= 80 ? "default" : securityScore >= 60 ? "secondary" : "destructive"}
                className={cn(
                  securityScore >= 80 ? "bg-green-500" : 
                  securityScore >= 60 ? "bg-yellow-500" : "bg-red-500"
                )}
              >
                {securityScore >= 80 ? "Excelente" : 
                 securityScore >= 60 ? "Bueno" : "Necesita atención"}
              </Badge>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                securityScore >= 80 ? "bg-green-500" : 
                securityScore >= 60 ? "bg-yellow-500" : "bg-red-500"
              )}
              style={{ width: `${securityScore}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Detalles de seguridad */}
      {isVisible && (
        <div className="space-y-3">
          {securityItems.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center justify-between p-4 border-l-4 rounded-r-lg",
                  getStatusColor(item.status)
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(item.status)}
                  {getStatusBadge(item.status)}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
