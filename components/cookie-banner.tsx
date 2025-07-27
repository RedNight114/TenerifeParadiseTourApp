"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Cookie, 
  Settings, 
  Check, 
  X, 
  Info,
  Shield,
  BarChart3,
  Users
} from "lucide-react"
import { cn } from "@/lib/utils"

// Extender la interfaz Window para incluir gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
}

interface CookieBannerProps {
  className?: string
}

export function CookieBanner({ className }: CookieBannerProps) {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Siempre true, no se puede desactivar
    analytics: false,
    marketing: false,
    functional: false
  })

  // Verificar si ya se han aceptado las cookies
  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent')
    if (!cookieConsent) {
      setShowBanner(true)
    } else {
      const savedPreferences = JSON.parse(cookieConsent)
      setPreferences(savedPreferences)
    }
  }, [])

  // Aplicar las preferencias de cookies
  const applyCookiePreferences = (newPreferences: CookiePreferences) => {
    // Cookies necesarias (siempre activas)
    if (newPreferences.necessary) {
      // Configurar cookies esenciales
      document.cookie = "session_id=; max-age=3600; path=/; SameSite=Strict"
    }

    // Cookies de analytics
    if (newPreferences.analytics) {
      // Configurar Google Analytics o similar
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          'analytics_storage': 'granted'
        })
      }
    } else {
      // Desactivar analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          'analytics_storage': 'denied'
        })
      }
    }

    // Cookies de marketing
    if (newPreferences.marketing) {
      // Configurar cookies de marketing
      document.cookie = "marketing_consent=true; max-age=31536000; path=/; SameSite=Lax"
    } else {
      // Eliminar cookies de marketing
      document.cookie = "marketing_consent=; max-age=0; path=/"
    }

    // Cookies funcionales
    if (newPreferences.functional) {
      // Configurar cookies funcionales
      document.cookie = "functional_consent=true; max-age=31536000; path=/; SameSite=Lax"
    } else {
      // Eliminar cookies funcionales
      document.cookie = "functional_consent=; max-age=0; path=/"
    }

    // Guardar preferencias en localStorage
    localStorage.setItem('cookieConsent', JSON.stringify(newPreferences))
    setPreferences(newPreferences)
  }

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    }
    applyCookiePreferences(allAccepted)
    setShowBanner(false)
  }

  const acceptNecessary = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    }
    applyCookiePreferences(necessaryOnly)
    setShowBanner(false)
  }

  const savePreferences = () => {
    applyCookiePreferences(preferences)
    setShowBanner(false)
    setShowSettings(false)
  }

  const openSettings = () => {
    setShowSettings(true)
  }

  const closeSettings = () => {
    setShowSettings(false)
  }

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return // No se puede desactivar
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  if (!showBanner && !showSettings) {
    return null
  }

  return (
    <>
      {/* Banner principal */}
      {showBanner && !showSettings && (
        <div className={cn(
          "fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg",
          className
        )}>
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Cookie className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Configuración de Cookies</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Utilizamos cookies para mejorar tu experiencia, analizar el tráfico y personalizar el contenido. 
                  Puedes gestionar tus preferencias en cualquier momento.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={acceptAll}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Aceptar Todas
                  </Button>
                  <Button
                    onClick={acceptNecessary}
                    variant="outline"
                    size="sm"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Solo Necesarias
                  </Button>
                  <Button
                    onClick={openSettings}
                    variant="outline"
                    size="sm"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Personalizar
                  </Button>
                </div>
              </div>
              <Button
                onClick={acceptNecessary}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de configuración */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <CardTitle>Configuración de Cookies</CardTitle>
                </div>
                <Button
                  onClick={closeSettings}
                  variant="ghost"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cookies Necesarias */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Cookies Necesarias</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Estas cookies son esenciales para el funcionamiento del sitio web y no se pueden desactivar.
                    </p>
                  </div>
                </div>
                <Switch checked={true} disabled />
              </div>

              {/* Cookies de Analytics */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Cookies de Analytics</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Nos ayudan a entender cómo interactúas con el sitio web recopilando información anónima.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.analytics}
                  onCheckedChange={(checked) => updatePreference('analytics', checked)}
                />
              </div>

              {/* Cookies de Marketing */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Cookies de Marketing</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Se utilizan para mostrar anuncios relevantes y medir la efectividad de las campañas.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.marketing}
                  onCheckedChange={(checked) => updatePreference('marketing', checked)}
                />
              </div>

              {/* Cookies Funcionales */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <Settings className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Cookies Funcionales</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Permiten recordar tus preferencias y mejorar la funcionalidad del sitio.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.functional}
                  onCheckedChange={(checked) => updatePreference('functional', checked)}
                />
              </div>

              {/* Información adicional */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">¿Qué son las cookies?</p>
                    <p>
                      Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo 
                      para mejorar tu experiencia de navegación. Puedes cambiar tus preferencias 
                      en cualquier momento desde la configuración de tu navegador.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  onClick={savePreferences}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Guardar Preferencias
                </Button>
                <Button
                  onClick={acceptAll}
                  variant="outline"
                  className="flex-1"
                >
                  Aceptar Todas
                </Button>
                <Button
                  onClick={acceptNecessary}
                  variant="outline"
                  className="flex-1"
                >
                  Solo Necesarias
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
} 