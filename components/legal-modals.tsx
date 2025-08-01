"use client"

import { X, Shield, FileText, Cookie } from "lucide-react"

interface LegalModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'privacy' | 'terms' | 'cookies'
}

export function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  if (!isOpen) return null

  const getModalContent = () => {
    switch (type) {
      case 'privacy':
        return {
          title: "Política de Privacidad",
          icon: <Shield className="h-6 w-6 text-blue-600" />,
          content: (
            <div className="space-y-4 text-sm text-gray-600">
              <p>
                En TenerifeParadiseTour&Excursions, nos comprometemos a proteger tu privacidad. 
                Esta política describe cómo recopilamos, utilizamos y protegemos tu información personal.
              </p>
              
              <h3 className="font-semibold text-gray-900">Información que Recopilamos</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Información de contacto (nombre, email, teléfono)</li>
                <li>Datos de reserva y preferencias de viaje</li>
                <li>Información de pago (procesada de forma segura)</li>
                <li>Datos de uso del sitio web</li>
              </ul>

              <h3 className="font-semibold text-gray-900">Cómo Utilizamos tu Información</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Procesar y confirmar tus reservas</li>
                <li>Comunicarnos contigo sobre tu viaje</li>
                <li>Mejorar nuestros servicios</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>

              <h3 className="font-semibold text-gray-900">Protección de Datos</h3>
              <p>
                Implementamos medidas de seguridad técnicas y organizativas para proteger tu información 
                personal contra acceso no autorizado, alteración, divulgación o destrucción.
              </p>

              <h3 className="font-semibold text-gray-900">Tus Derechos</h3>
              <p>
                Tienes derecho a acceder, rectificar, cancelar y oponerte al tratamiento de tus datos personales. 
                Para ejercer estos derechos, contáctanos en Tenerifeparadisetoursandexcursions@hotmail.com
              </p>
            </div>
          )
        }
      
      case 'terms':
        return {
          title: "Términos y Condiciones",
          icon: <FileText className="h-6 w-6 text-green-600" />,
          content: (
            <div className="space-y-4 text-sm text-gray-600">
              <p>
                Al utilizar nuestros servicios, aceptas estos términos y condiciones. 
                Te recomendamos leerlos cuidadosamente antes de realizar una reserva.
              </p>

              <h3 className="font-semibold text-gray-900">Reservas y Pagos</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Las reservas se confirman al recibir el pago completo</li>
                <li>Los precios incluyen IVA y tasas aplicables</li>
                <li>Aceptamos pagos seguros a través de Redsys</li>
                <li>Se requiere identificación válida para todos los servicios</li>
              </ul>

              <h3 className="font-semibold text-gray-900">Cancelaciones y Reembolsos</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Cancelación gratuita hasta 24 horas antes del servicio</li>
                <li>Cancelaciones tardías pueden incurrir en cargos</li>
                <li>No se realizan reembolsos por no presentarse</li>
                <li>Condiciones especiales para cancelaciones por clima</li>
              </ul>

              <h3 className="font-semibold text-gray-900">Responsabilidades</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Cumplimos con todas las regulaciones de seguridad</li>
                <li>Nuestros guías están certificados y asegurados</li>
                <li>Equipamiento de seguridad incluido en actividades</li>
                <li>Seguro de responsabilidad civil incluido</li>
              </ul>

              <h3 className="font-semibold text-gray-900">Limitaciones</h3>
              <p>
                No nos hacemos responsables por daños indirectos, incidentales o consecuentes. 
                Nuestra responsabilidad se limita al valor del servicio contratado.
              </p>
            </div>
          )
        }
      
      case 'cookies':
        return {
          title: "Política de Cookies",
          icon: <Cookie className="h-6 w-6 text-orange-600" />,
          content: (
            <div className="space-y-4 text-sm text-gray-600">
              <p>
                Utilizamos cookies para mejorar tu experiencia en nuestro sitio web. 
                Esta política explica qué cookies usamos y cómo puedes gestionarlas.
              </p>

              <h3 className="font-semibold text-gray-900">¿Qué son las Cookies?</h3>
              <p>
                Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo 
                cuando visitas nuestro sitio web. Nos ayudan a recordar tus preferencias y 
                mejorar la funcionalidad del sitio.
              </p>

              <h3 className="font-semibold text-gray-900">Tipos de Cookies que Utilizamos</h3>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">Cookies Necesarias</h4>
                  <p className="text-xs text-gray-500">
                    Esenciales para el funcionamiento del sitio web. No se pueden desactivar.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Cookies de Análisis</h4>
                  <p className="text-xs text-gray-500">
                    Nos ayudan a entender cómo interactúas con nuestro sitio web.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Cookies de Marketing</h4>
                  <p className="text-xs text-gray-500">
                    Se utilizan para mostrar anuncios relevantes y medir su efectividad.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Cookies Funcionales</h4>
                  <p className="text-xs text-gray-500">
                    Permiten recordar tus preferencias y personalizar tu experiencia.
                  </p>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900">Gestionar Cookies</h3>
              <p>
                Puedes gestionar tus preferencias de cookies en cualquier momento. 
                Ten en cuenta que desactivar ciertas cookies puede afectar la funcionalidad del sitio.
              </p>

              <h3 className="font-semibold text-gray-900">Cookies de Terceros</h3>
              <p>
                Algunos servicios de terceros (como Google Analytics) pueden establecer cookies. 
                No tenemos control sobre estas cookies y te recomendamos revisar sus políticas.
              </p>
            </div>
          )
        }
    }
  }

  const content = getModalContent()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            {content.icon}
            <h2 className="text-xl font-semibold text-gray-900">{content.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {content.content}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
} 