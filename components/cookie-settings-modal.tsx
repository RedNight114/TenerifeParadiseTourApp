"use client"

import { useState, useEffect } from "react"
import { X, Settings } from "lucide-react"
import { useCookies } from "@/hooks/use-cookies"

interface CookieSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CookieSettingsModal({ isOpen, onClose }: CookieSettingsModalProps) {
  const { preferences, updatePreferences, resetPreferences } = useCookies()
  const [localPreferences, setLocalPreferences] = useState(preferences)

  useEffect(() => {
    setLocalPreferences(preferences)
  }, [preferences])

  const handleSave = () => {
    updatePreferences(localPreferences)
    onClose()
  }

  const handleReset = () => {
    resetPreferences()
    setLocalPreferences(preferences)
  }

  const handlePreferenceChange = (key: keyof typeof localPreferences, value: boolean) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Configuración de Cookies</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-600">
            Utilizamos cookies para mejorar tu experiencia en nuestro sitio web. 
            Puedes personalizar tus preferencias a continuación.
          </p>

          {/* Cookie Types */}
          <div className="space-y-4">
            {/* Necessary Cookies */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={localPreferences.necessary}
                disabled
                className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-900">Cookies Necesarias</label>
                <p className="text-xs text-gray-500 mt-1">
                  Estas cookies son esenciales para el funcionamiento del sitio web y no se pueden desactivar.
                </p>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={localPreferences.analytics}
                onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-900">Cookies de Análisis</label>
                <p className="text-xs text-gray-500 mt-1">
                  Nos ayudan a entender cómo interactúas con nuestro sitio web.
                </p>
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={localPreferences.marketing}
                onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-900">Cookies de Marketing</label>
                <p className="text-xs text-gray-500 mt-1">
                  Se utilizan para mostrar anuncios relevantes y medir su efectividad.
                </p>
              </div>
            </div>

            {/* Functional Cookies */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={localPreferences.functional}
                onChange={(e) => handlePreferenceChange('functional', e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-900">Cookies Funcionales</label>
                <p className="text-xs text-gray-500 mt-1">
                  Permiten recordar tus preferencias y personalizar tu experiencia.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={handleReset}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Restablecer
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 