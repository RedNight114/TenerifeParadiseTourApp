"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Settings, Save, RefreshCw, Loader2, AlertCircle, CheckCircle, Info, Shield, Globe, CreditCard, Users, Bell, Database, Search, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getSupabaseClient } from '@/lib/supabase-unified'

interface SystemSetting {
  value: any
  type: string
  category: string
  description: string
  is_public: boolean
}

interface AdminSettingsProps {
  className?: string
}

export function AdminSettings({ className }: AdminSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<Record<string, SystemSetting>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('general')

  const categories = [
    { key: 'General', label: 'General', icon: Globe },
    { key: 'Admin', label: 'Administración', icon: Shield },
    { key: 'Reservas', label: 'Reservas', icon: Users },
    { key: 'Pagos', label: 'Pagos', icon: CreditCard },
    { key: 'Características', label: 'Características', icon: Settings },
    { key: 'Notificaciones', label: 'Notificaciones', icon: Bell },
    { key: 'Sistema', label: 'Sistema', icon: Database },
    { key: 'SEO', label: 'SEO', icon: Search },
    { key: 'Contacto', label: 'Contacto', icon: Phone }
  ]

  // Cargar configuraciones
  const loadSettings = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Por ahora, hacer la petición sin autenticación para probar
      const headers: HeadersInit = {}

      const response = await fetch('/api/settings', {
        headers
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error cargando configuraciones: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      setSettings(data.settings || {})
    } catch (err) {
      setError('Error cargando configuraciones del sistema')
    } finally {
      setLoading(false)
    }
  }, [])

  // Guardar configuración
  const saveSetting = async (key: string, value: any) => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = await getSupabaseClient()
      
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const setting = settings[key]
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ key, value, type: setting?.type })
      })

      if (!response.ok) throw new Error('Error guardando configuración')

      // Actualizar estado local
      setSettings(prev => ({
        ...prev,
        [key]: { ...prev[key], value }
      }))

      setSuccess('Configuración guardada correctamente')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Error guardando configuración')
    } finally {
      setSaving(false)
    }
  }

  // Renderizar campo de configuración
  const renderSettingField = (key: string, setting: SystemSetting) => {
    const { value, type, description } = setting

    switch (type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={value === true}
              onCheckedChange={(checked) => saveSetting(key, checked)}
              disabled={saving}
            />
            <Label className="text-sm">{value ? 'Activado' : 'Desactivado'}</Label>
          </div>
        )

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => {
              const newValue = e.target.value ? parseFloat(e.target.value) : 0
              saveSetting(key, newValue)
            }}
            disabled={saving}
            className="max-w-32"
          />
        )

      case 'json':
        return (
          <Textarea
            value={JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                const newValue = JSON.parse(e.target.value)
                saveSetting(key, newValue)
              } catch {
                // Ignorar errores de JSON mientras se escribe
              }
            }}
            disabled={saving}
            rows={3}
            className="font-mono text-xs"
          />
        )

      default:
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => saveSetting(key, e.target.value)}
            disabled={saving}
          />
        )
    }
  }

  // Cargar configuraciones al montar
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // Obtener configuraciones por categoría
  const getSettingsByCategory = (category: string) => {
    return Object.entries(settings).filter(([_, setting]) => setting.category === category)
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100"
      >
        <Settings className="w-5 h-5 text-gray-600" />
      </Button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel de configuración */}
          <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Configuración del Sistema</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadSettings}
                    disabled={loading}
                    className="p-1 h-auto"
                  >
                    <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Categorías */}
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto">
                {categories.map((category) => {
                  const Icon = category.icon
                  const settingsCount = getSettingsByCategory(category.key).length
                  
                  return (
                    <button
                      key={category.key}
                      onClick={() => setActiveCategory(category.key)}
                      className={cn(
                        "flex items-center space-x-2 px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                        activeCategory === category.key
                          ? "border-blue-500 text-blue-600 bg-blue-50"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{category.label}</span>
                      {settingsCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {settingsCount}
                        </Badge>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-600">Cargando configuraciones...</span>
                </div>
              ) : error ? (
                <div className="flex items-center space-x-2 text-red-500 py-4">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadSettings}
                    className="ml-auto"
                  >
                    Reintentar
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Estadísticas de configuraciones */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <Card className="p-4">
                      <div className="flex items-center space-x-2">
                        <Settings className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Total Configuraciones
                          </p>
                          <p className="text-2xl font-bold text-blue-600">
                            {Object.keys(settings).length}
                          </p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Públicas
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            {Object.values(settings).filter(s => s.is_public).length}
                          </p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Privadas
                          </p>
                          <p className="text-2xl font-bold text-orange-600">
                            {Object.values(settings).filter(s => !s.is_public).length}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                  {getSettingsByCategory(activeCategory).map(([key, setting]) => (
                    <Card key={key} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="font-medium text-gray-900">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Label>
                          <div className="flex items-center space-x-2">
                            {setting.is_public && (
                              <Badge variant="outline" className="text-xs">
                                Público
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {setting.type}
                            </Badge>
                          </div>
                        </div>
                        
                        {setting.description && (
                          <p className="text-sm text-gray-600">{setting.description}</p>
                        )}
                        
                        {renderSettingField(key, setting)}
                      </div>
                    </Card>
                  ))}
                  
                  {getSettingsByCategory(activeCategory).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Settings className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No hay configuraciones en esta categoría</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer con mensajes de estado */}
            {(error || success) && (
              <div className="p-4 border-t border-gray-200">
                {error && (
                  <div className="flex items-center space-x-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="flex items-center space-x-2 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>{success}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
