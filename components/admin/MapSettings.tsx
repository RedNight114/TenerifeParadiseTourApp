"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Palette, 
  MapPin, 
  Eye, 
  Layers, 
  Zap,
  Save,
  RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'

interface MapSettingsProps {
  className?: string
}

export function MapSettings({ className }: MapSettingsProps) {
  const [settings, setSettings] = useState({
    // Configuración de marcadores
    markerSize: 40,
    markerAnimation: true,
    markerShadows: true,
    
    // Configuración de colores
    hotelColor: '#3B82F6',
    serviceColor: '#10B981',
    userLocationColor: '#EF4444',
    
    // Configuración de comportamiento
    autoZoom: true,
    showPopups: true,
    clusteringEnabled: true,
    clusteringRadius: 50,
    
    // Configuración de capas
    showBuildings: true,
    showTerrain: true,
    showSkyLayer: true,
    terrainExaggeration: 1.5,
    
    // Configuración de interacción
    enableRotation: true,
    enablePitch: true,
    enableZoom: true,
    enablePan: true
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const saveSettings = () => {
    // Aquí se guardarían las configuraciones en la base de datos
    localStorage.setItem('mapSettings', JSON.stringify(settings))
    toast.success('Configuraciones guardadas')
  }

  const resetSettings = () => {
    const defaultSettings = {
      markerSize: 40,
      markerAnimation: true,
      markerShadows: true,
      hotelColor: '#3B82F6',
      serviceColor: '#10B981',
      userLocationColor: '#EF4444',
      autoZoom: true,
      showPopups: true,
      clusteringEnabled: true,
      clusteringRadius: 50,
      showBuildings: true,
      showTerrain: true,
      showSkyLayer: true,
      terrainExaggeration: 1.5,
      enableRotation: true,
      enablePitch: true,
      enableZoom: true,
      enablePan: true
    }
    setSettings(defaultSettings)
    toast.success('Configuraciones restablecidas')
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" /> Configuración del Mapa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuración de Marcadores */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Marcadores
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="markerSize">Tamaño de marcadores</Label>
              <div className="flex items-center gap-2">
                <Slider
                  id="markerSize"
                  value={[settings.markerSize]}
                  onValueChange={(value) => handleSettingChange('markerSize', value[0])}
                  max={80}
                  min={20}
                  step={5}
                  className="flex-1"
                />
                <Badge variant="secondary">{settings.markerSize}px</Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clusteringRadius">Radio de agrupación</Label>
              <div className="flex items-center gap-2">
                <Slider
                  id="clusteringRadius"
                  value={[settings.clusteringRadius]}
                  onValueChange={(value) => handleSettingChange('clusteringRadius', value[0])}
                  max={100}
                  min={20}
                  step={5}
                  className="flex-1"
                />
                <Badge variant="secondary">{settings.clusteringRadius}px</Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="markerAnimation">Animación de marcadores</Label>
              <Switch
                id="markerAnimation"
                checked={settings.markerAnimation}
                onCheckedChange={(checked) => handleSettingChange('markerAnimation', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="markerShadows">Sombras de marcadores</Label>
              <Switch
                id="markerShadows"
                checked={settings.markerShadows}
                onCheckedChange={(checked) => handleSettingChange('markerShadows', checked)}
              />
            </div>
          </div>
        </div>

        {/* Configuración de Colores */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Palette className="h-4 w-4" /> Colores
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hotelColor">Color de hoteles</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="hotelColor"
                  type="color"
                  value={settings.hotelColor}
                  onChange={(e) => handleSettingChange('hotelColor', e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Badge variant="secondary" style={{ backgroundColor: settings.hotelColor, color: 'white' }}>
                  Hoteles
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serviceColor">Color de servicios</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="serviceColor"
                  type="color"
                  value={settings.serviceColor}
                  onChange={(e) => handleSettingChange('serviceColor', e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Badge variant="secondary" style={{ backgroundColor: settings.serviceColor, color: 'white' }}>
                  Servicios
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="userLocationColor">Color de ubicación</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="userLocationColor"
                  type="color"
                  value={settings.userLocationColor}
                  onChange={(e) => handleSettingChange('userLocationColor', e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Badge variant="secondary" style={{ backgroundColor: settings.userLocationColor, color: 'white' }}>
                  Usuario
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Configuración de Capas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="h-4 w-4" /> Capas del Mapa
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="showBuildings">Mostrar edificios 3D</Label>
              <Switch
                id="showBuildings"
                checked={settings.showBuildings}
                onCheckedChange={(checked) => handleSettingChange('showBuildings', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showTerrain">Mostrar terreno</Label>
              <Switch
                id="showTerrain"
                checked={settings.showTerrain}
                onCheckedChange={(checked) => handleSettingChange('showTerrain', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showSkyLayer">Mostrar cielo</Label>
              <Switch
                id="showSkyLayer"
                checked={settings.showSkyLayer}
                onCheckedChange={(checked) => handleSettingChange('showSkyLayer', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="clusteringEnabled">Agrupación de marcadores</Label>
              <Switch
                id="clusteringEnabled"
                checked={settings.clusteringEnabled}
                onCheckedChange={(checked) => handleSettingChange('clusteringEnabled', checked)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="terrainExaggeration">Exageración del terreno</Label>
            <div className="flex items-center gap-2">
              <Slider
                id="terrainExaggeration"
                value={[settings.terrainExaggeration]}
                onValueChange={(value) => handleSettingChange('terrainExaggeration', value[0])}
                max={3}
                min={0.5}
                step={0.1}
                className="flex-1"
              />
              <Badge variant="secondary">{settings.terrainExaggeration}x</Badge>
            </div>
          </div>
        </div>

        {/* Configuración de Interacción */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4" /> Interacción
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="autoZoom">Zoom automático</Label>
              <Switch
                id="autoZoom"
                checked={settings.autoZoom}
                onCheckedChange={(checked) => handleSettingChange('autoZoom', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showPopups">Mostrar popups</Label>
              <Switch
                id="showPopups"
                checked={settings.showPopups}
                onCheckedChange={(checked) => handleSettingChange('showPopups', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="enableRotation">Rotación habilitada</Label>
              <Switch
                id="enableRotation"
                checked={settings.enableRotation}
                onCheckedChange={(checked) => handleSettingChange('enableRotation', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="enablePitch">Inclinación habilitada</Label>
              <Switch
                id="enablePitch"
                checked={settings.enablePitch}
                onCheckedChange={(checked) => handleSettingChange('enablePitch', checked)}
              />
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={saveSettings} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Guardar Configuración
          </Button>
          <Button variant="outline" onClick={resetSettings} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Restablecer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
