"use client"

import { useEffect } from "react"
import { X, Shield, FileText, Cookie } from "lucide-react"
import "@/styles/legal-modals-print.css"

interface LegalModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'privacy' | 'terms' | 'cookies'
}

export function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const copyToClipboard = async () => {
    try {
      const content = document.querySelector('.legal-modal-content-print')?.textContent || ''
      await navigator.clipboard.writeText(content)
      // Mostrar notificación de éxito
      const successMessage = document.createElement('div')
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
      successMessage.textContent = '✅ Contenido copiado al portapapeles'
      document.body.appendChild(successMessage)
      
      setTimeout(() => {
        document.body.removeChild(successMessage)
      }, 3000)
    } catch (error) {
      // Mostrar notificación de error
      const errorMessage = document.createElement('div')
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
      errorMessage.textContent = '❌ Error al copiar el contenido'
      document.body.appendChild(errorMessage)
      
      setTimeout(() => {
        document.body.removeChild(errorMessage)
      }, 3000)
    }
  }

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
                En <strong>TenerifeParadiseTour&Excursions</strong>, nos comprometemos a proteger tu privacidad y 
                garantizar la seguridad de tus datos personales. Esta política describe cómo recopilamos, 
                utilizamos, almacenamos y protegemos tu información personal de acuerdo con el Reglamento 
                General de Protección de Datos (RGPD) y la legislación española aplicable.
              </p>
              
              <h3 className="font-semibold text-gray-900 text-lg border-l-4 border-blue-500 pl-3 py-2 bg-blue-50 rounded-r-lg">
                Responsable del Tratamiento
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm">
                  <strong className="text-gray-900">TenerifeParadiseTour&Excursions</strong><br/>
                  <span className="text-gray-600">📧 Email:</span> Tenerifeparadisetoursandexcursions@hotmail.com<br/>
                  <span className="text-gray-600">📞 Teléfono:</span> +34 617 30 39 29<br/>
                  <span className="text-gray-600">📍 Dirección:</span> Santa Cruz de Tenerife, Islas Canarias, España
                </p>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg border-l-4 border-green-500 pl-3 py-2 bg-green-50 rounded-r-lg">
                Información que Recopilamos
              </h3>
              <ul className="list-none space-y-2">
                <li className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-green-500 text-lg">🆔</span>
                  <div>
                    <strong className="text-gray-900">Datos de identificación:</strong>
                    <p className="text-gray-600 text-sm">Nombre completo, DNI/pasaporte, fecha de nacimiento</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-blue-500 text-lg">📧</span>
                  <div>
                    <strong className="text-gray-900">Información de contacto:</strong>
                    <p className="text-gray-600 text-sm">Email, teléfono, dirección</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-purple-500 text-lg">📅</span>
                  <div>
                    <strong className="text-gray-900">Datos de reserva:</strong>
                    <p className="text-gray-600 text-sm">Fechas de viaje, número de personas, preferencias</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-orange-500 text-lg">💳</span>
                  <div>
                    <strong className="text-gray-900">Información de pago:</strong>
                    <p className="text-gray-600 text-sm">Datos de tarjeta (procesados por Redsys de forma segura)</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-red-500 text-lg">🌐</span>
                  <div>
                    <strong className="text-gray-900">Datos de navegación:</strong>
                    <p className="text-gray-600 text-sm">IP, cookies, historial de uso del sitio web</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-indigo-500 text-lg">💬</span>
                  <div>
                    <strong className="text-gray-900">Comunicaciones:</strong>
                    <p className="text-gray-600 text-sm">Mensajes, consultas y feedback</p>
                  </div>
                </li>
              </ul>

              <h3 className="font-semibold text-gray-900 text-lg border-l-4 border-purple-500 pl-3 py-2 bg-purple-50 rounded-r-lg">
                Finalidades del Tratamiento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <span className="text-purple-500 text-lg">📋</span>
                  <p className="text-gray-700 text-sm leading-relaxed">Gestionar reservas y confirmaciones de servicios turísticos</p>
                </div>
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <span className="text-purple-500 text-lg">💳</span>
                  <p className="text-gray-700 text-sm leading-relaxed">Procesar pagos y facturación</p>
                </div>
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <span className="text-purple-500 text-lg">📞</span>
                  <p className="text-gray-700 text-sm leading-relaxed">Comunicarnos contigo sobre tu reserva y servicios</p>
                </div>
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <span className="text-purple-500 text-lg">📢</span>
                  <p className="text-gray-700 text-sm leading-relaxed">Enviar información promocional (con tu consentimiento)</p>
                </div>
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <span className="text-purple-500 text-lg">🚀</span>
                  <p className="text-gray-700 text-sm leading-relaxed">Mejorar nuestros servicios y experiencia del usuario</p>
                </div>
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <span className="text-purple-500 text-lg">⚖️</span>
                  <p className="text-gray-700 text-sm leading-relaxed">Cumplir con obligaciones legales y fiscales</p>
                </div>
                <div className="p-4 bg-white border border-gray-200 rounded-lg md:col-span-2">
                  <span className="text-purple-500 text-lg">🎯</span>
                  <p className="text-gray-700 text-sm leading-relaxed">Gestionar reclamaciones y atención al cliente</p>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg border-l-4 border-indigo-500 pl-3 py-2 bg-indigo-50 rounded-r-lg">
                Base Legal
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-indigo-500 text-lg">📜</span>
                  <div>
                    <strong className="text-gray-900">Ejecución del contrato:</strong>
                    <p className="text-gray-600 text-sm">Para gestionar tus reservas</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-indigo-500 text-lg">✅</span>
                  <div>
                    <strong className="text-gray-900">Consentimiento:</strong>
                    <p className="text-gray-600 text-sm">Para marketing y comunicaciones promocionales</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-indigo-500 text-lg">🎯</span>
                  <div>
                    <strong className="text-gray-900">Interés legítimo:</strong>
                    <p className="text-gray-600 text-sm">Para mejorar servicios y seguridad</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-indigo-500 text-lg">⚖️</span>
                  <div>
                    <strong className="text-gray-900">Obligación legal:</strong>
                    <p className="text-gray-600 text-sm">Para cumplir con normativas fiscales y turísticas</p>
                  </div>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg border-l-4 border-teal-500 pl-3 py-2 bg-teal-50 rounded-r-lg">
                Conservación de Datos
              </h3>
              <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                <div className="flex items-start space-x-3">
                  <span className="text-teal-500 text-lg">⏳</span>
                  <p className="text-gray-700">
                Conservamos tus datos durante el tiempo necesario para cumplir con las finalidades descritas, 
                    generalmente <strong>5 años</strong> para datos contables y fiscales, y hasta que revoques tu consentimiento 
                para marketing.
              </p>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg border-l-4 border-pink-500 pl-3 py-2 bg-pink-50 rounded-r-lg">
                Compartir Datos
              </h3>
              <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                <div className="flex items-start space-x-3">
                  <span className="text-pink-500 text-lg">🤝</span>
                  <p className="text-gray-700">
                    Solo compartimos tus datos con <strong>proveedores de servicios esenciales</strong> (pagos, hosting) y 
                    <strong>autoridades</strong> cuando es legalmente requerido. <strong>Nunca vendemos</strong> tus datos a terceros.
                  </p>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg border-l-4 border-green-500 pl-3 py-2 bg-green-50 rounded-r-lg">
                Tus Derechos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-green-500 text-lg">👁️</span>
                  <div>
                    <strong className="text-gray-900">Acceso:</strong>
                    <p className="text-gray-600 text-sm">Conocer qué datos tenemos sobre ti</p>
                  </div>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-green-500 text-lg">✏️</span>
                  <div>
                    <strong className="text-gray-900">Rectificación:</strong>
                    <p className="text-gray-600 text-sm">Corregir datos inexactos</p>
                  </div>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-green-500 text-lg">🗑️</span>
                  <div>
                    <strong className="text-gray-900">Supresión:</strong>
                    <p className="text-gray-600 text-sm">Eliminar tus datos (derecho al olvido)</p>
                  </div>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-green-500 text-lg">⛔</span>
                  <div>
                    <strong className="text-gray-900">Limitación:</strong>
                    <p className="text-gray-600 text-sm">Restringir el tratamiento</p>
                  </div>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-green-500 text-lg">📤</span>
                  <div>
                    <strong className="text-gray-900">Portabilidad:</strong>
                    <p className="text-gray-600 text-sm">Recibir tus datos en formato estructurado</p>
                  </div>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-green-500 text-lg">🚫</span>
                  <div>
                    <strong className="text-gray-900">Oposición:</strong>
                    <p className="text-gray-600 text-sm">Oponerte al tratamiento</p>
                  </div>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg md:col-span-2">
                  <span className="text-green-500 text-lg">↩️</span>
                  <div>
                    <strong className="text-gray-900">Revocación:</strong>
                    <p className="text-gray-600 text-sm">Retirar el consentimiento</p>
                  </div>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg border-l-4 border-orange-500 pl-3 py-2 bg-orange-50 rounded-r-lg">
                Ejercer tus Derechos
              </h3>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-gray-700 mb-3">
                  Para ejercer cualquiera de estos derechos, contáctanos en:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-500">📧</span>
                    <span className="text-gray-700">
                      <strong>Email:</strong> Tenerifeparadisetoursandexcursions@hotmail.com
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-500">📞</span>
                    <span className="text-gray-700">
                <strong>Teléfono:</strong> +34 617 30 39 29
                    </span>
                  </div>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg border-l-4 border-red-500 pl-3 py-2 bg-red-50 rounded-r-lg">
                Autoridad de Control
              </h3>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-start space-x-3">
                  <span className="text-red-500 text-lg">⚖️</span>
                  <p className="text-gray-700">
                    Tienes derecho a presentar una reclamación ante la <strong>Agencia Española de Protección de Datos 
                    (AEPD)</strong> si consideras que el tratamiento no se ajusta a la normativa vigente.
                  </p>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg border-l-4 border-emerald-500 pl-3 py-2 bg-emerald-50 rounded-r-lg">
                Seguridad
              </h3>
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <div className="flex items-start space-x-3">
                  <span className="text-emerald-500 text-lg">🔒</span>
                  <p className="text-gray-700">
                Implementamos medidas técnicas y organizativas apropiadas para proteger tus datos personales 
                contra acceso no autorizado, alteración, divulgación o destrucción, incluyendo encriptación 
                SSL y protocolos de seguridad avanzados.
              </p>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg border-l-4 border-cyan-500 pl-3 py-2 bg-cyan-50 rounded-r-lg">
                Actualizaciones
              </h3>
              <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                <div className="flex items-start space-x-3">
                  <span className="text-cyan-500 text-lg">🔄</span>
                  <p className="text-gray-700">
                Esta política puede actualizarse. Te notificaremos cualquier cambio significativo por email 
                o mediante un aviso en nuestro sitio web.
              </p>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-6 mb-8">
                <strong>Última actualización:</strong> Enero 2025
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
                Estos términos y condiciones rigen el uso de los servicios ofrecidos por 
                <strong> TenerifeParadiseTour&Excursions</strong>. Al utilizar nuestros servicios, 
                aceptas estos términos en su totalidad. Te recomendamos leerlos cuidadosamente 
                antes de realizar cualquier reserva.
              </p>

              <h3 className="font-semibold text-gray-900 text-lg border-l-4 border-green-500 pl-3 py-2 bg-green-50 rounded-r-lg">
                Información de la Empresa
              </h3>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm">
                  <strong className="text-gray-900">TenerifeParadiseTour&Excursions</strong><br/>
                  <span className="text-gray-600">📧 Email:</span> Tenerifeparadisetoursandexcursions@hotmail.com<br/>
                  <span className="text-gray-600">📞 Teléfono:</span> +34 617 30 39 29<br/>
                  <span className="text-gray-600">📍 Dirección:</span> Santa Cruz de Tenerife, Islas Canarias, España
                </p>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg border-l-4 border-blue-500 pl-3 py-2 bg-blue-50 rounded-r-lg">
                Servicios Ofrecidos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <span className="text-blue-500 text-lg">🗺️</span>
                  <p className="text-gray-700 text-sm leading-relaxed">Tours guiados por Tenerife</p>
                </div>
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <span className="text-blue-500 text-lg">🏔️</span>
                  <p className="text-gray-700 text-sm leading-relaxed">Excursiones y actividades de aventura</p>
                </div>
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <span className="text-blue-500 text-lg">🚙</span>
                  <p className="text-gray-700 text-sm leading-relaxed">Alquiler de vehículos 4x4</p>
                </div>
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <span className="text-blue-500 text-lg">🍽️</span>
                  <p className="text-gray-700 text-sm leading-relaxed">Experiencias gastronómicas</p>
                </div>
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <span className="text-blue-500 text-lg">🚌</span>
                  <p className="text-gray-700 text-sm leading-relaxed">Servicios de transporte turístico</p>
                </div>
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <span className="text-blue-500 text-lg">🏊‍♂️</span>
                  <p className="text-gray-700 text-sm leading-relaxed">Actividades acuáticas y terrestres</p>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg border-l-4 border-indigo-500 pl-3 py-2 bg-indigo-50 rounded-r-lg">
                Reservas y Confirmación
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-indigo-500 text-lg">💳</span>
                  <div>
                    <p className="text-gray-700 text-sm">Las reservas se confirman únicamente al recibir el pago completo</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-indigo-500 text-lg">📧</span>
                  <div>
                    <p className="text-gray-700 text-sm">Recibirás confirmación por email con todos los detalles</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-indigo-500 text-lg">🆔</span>
                  <div>
                    <p className="text-gray-700 text-sm">Es obligatorio presentar identificación válida (DNI/pasaporte)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-indigo-500 text-lg">💰</span>
                  <div>
                    <p className="text-gray-700 text-sm">Los precios incluyen IVA (21%) y todas las tasas aplicables</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-indigo-500 text-lg">👥</span>
                  <div>
                    <p className="text-gray-700 text-sm">Se requiere un mínimo de participantes para algunos tours</p>
                  </div>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg border-l-4 border-emerald-500 pl-3 py-2 bg-emerald-50 rounded-r-lg">
                Métodos de Pago
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <span className="text-emerald-500 text-lg">💳</span>
                  <p className="text-gray-700 text-sm leading-relaxed">Aceptamos pagos seguros a través de Redsys (Visa, MasterCard, Maestro)</p>
                </div>
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <span className="text-emerald-500 text-lg">🏦</span>
                  <p className="text-gray-700 text-sm leading-relaxed">Transferencia bancaria (solo para reservas anticipadas)</p>
                </div>
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <span className="text-emerald-500 text-lg">💵</span>
                  <p className="text-gray-700 text-sm leading-relaxed">Pago en efectivo (solo en oficina y con recibo)</p>
                </div>
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <span className="text-emerald-500 text-lg">€</span>
                  <p className="text-gray-700 text-sm leading-relaxed">Todos los pagos se procesan en euros (€)</p>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg border-l-4 border-orange-500 pl-3 py-2 bg-orange-50 rounded-r-lg">
                Política de Cancelaciones
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-green-500 text-lg">✅</span>
                  <div>
                    <strong className="text-gray-900">Cancelación gratuita:</strong>
                    <p className="text-gray-600 text-sm">Hasta 24 horas antes del servicio</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-orange-500 text-lg">⚠️</span>
                  <div>
                    <strong className="text-gray-900">Cancelación tardía:</strong>
                    <p className="text-gray-600 text-sm">50% de reembolso entre 24h y 12h antes</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-red-500 text-lg">❌</span>
                  <div>
                    <strong className="text-gray-900">Sin reembolso:</strong>
                    <p className="text-gray-600 text-sm">Menos de 12 horas antes o no presentarse</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-blue-500 text-lg">🌤️</span>
                  <div>
                    <strong className="text-gray-900">Cancelación por clima:</strong>
                    <p className="text-gray-600 text-sm">Reembolso completo o reprogramación</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-purple-500 text-lg">🏢</span>
                  <div>
                    <strong className="text-gray-900">Cancelación por la empresa:</strong>
                    <p className="text-gray-600 text-sm">Reembolso completo + compensación</p>
                  </div>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg border-l-4 border-purple-500 pl-3 py-2 bg-purple-50 rounded-r-lg">
                Condiciones de Participación
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <span className="text-purple-500 text-lg">🎂</span>
                  <p className="text-gray-700 text-sm leading-relaxed"><strong>Edad mínima:</strong> 18 años (menores acompañados por adultos)</p>
                </div>
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <span className="text-purple-500 text-lg">💪</span>
                  <p className="text-gray-700 text-sm leading-relaxed"><strong>Estado físico:</strong> Adecuado para las actividades contratadas</p>
                </div>
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <span className="text-purple-500 text-lg">🤝</span>
                  <p className="text-gray-700 text-sm leading-relaxed"><strong>Respeto:</strong> Hacia otros participantes y el medio ambiente</p>
                </div>
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <span className="text-purple-500 text-lg">🛡️</span>
                  <p className="text-gray-700 text-sm leading-relaxed"><strong>Seguridad:</strong> Cumplimiento de las instrucciones de seguridad</p>
                </div>
                <div className="p-4 bg-white border border-gray-200 rounded-lg md:col-span-2">
                  <span className="text-purple-500 text-lg">🚫</span>
                  <p className="text-gray-700 text-sm leading-relaxed"><strong>Alcohol:</strong> No se permite el consumo durante actividades</p>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg border-l-4 border-red-500 pl-3 py-2 bg-red-50 rounded-r-lg">
                Seguridad y Responsabilidades
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-red-500 text-lg">📋</span>
                  <p className="text-gray-700 text-sm">Cumplimos con todas las regulaciones de seguridad turística</p>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-red-500 text-lg">👨‍🏫</span>
                  <p className="text-gray-700 text-sm">Nuestros guías están certificados y asegurados</p>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-red-500 text-lg">🛡️</span>
                  <p className="text-gray-700 text-sm">Equipamiento de seguridad incluido en todas las actividades</p>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-red-500 text-lg">📄</span>
                  <p className="text-gray-700 text-sm">Seguro de responsabilidad civil incluido en todos los servicios</p>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-red-500 text-lg">🚨</span>
                  <p className="text-gray-700 text-sm">Protocolos de emergencia establecidos</p>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-red-500 text-lg">🏥</span>
                  <p className="text-gray-700 text-sm">Botiquín de primeros auxilios disponible</p>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg border-l-4 border-cyan-500 pl-3 py-2 bg-cyan-50 rounded-r-lg">
                Horarios y Puntualidad
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-cyan-500 text-lg">⏰</span>
                  <div>
                    <p className="text-gray-700 text-sm">Los horarios son orientativos y pueden variar</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-cyan-500 text-lg">⏱️</span>
                  <div>
                    <p className="text-gray-700 text-sm">Es obligatorio llegar 15 minutos antes del inicio</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-cyan-500 text-lg">⏳</span>
                  <div>
                    <p className="text-gray-700 text-sm">No se espera más de 10 minutos a participantes tardíos</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-cyan-500 text-lg">🚫</span>
                  <div>
                    <p className="text-gray-700 text-sm">Los retrasos no dan derecho a reembolso</p>
                  </div>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg border-l-4 border-amber-500 pl-3 py-2 bg-amber-50 rounded-r-lg">
                Equipamiento y Material
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-amber-500 text-lg">🎒</span>
                  <p className="text-gray-700 text-sm">Proporcionamos todo el equipamiento necesario</p>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-amber-500 text-lg">👤</span>
                  <p className="text-gray-700 text-sm">El cliente es responsable del cuidado del material</p>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-amber-500 text-lg">💰</span>
                  <p className="text-gray-700 text-sm">Daños por mal uso serán cobrados al cliente</p>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-amber-500 text-lg">👕</span>
                  <p className="text-gray-700 text-sm">Recomendamos ropa y calzado cómodo</p>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg border-l-4 border-gray-500 pl-3 py-2 bg-gray-50 rounded-r-lg">
                Limitaciones de Responsabilidad
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-gray-500 text-lg">⚠️</span>
                  <div>
                    <p className="text-gray-700 text-sm">No nos hacemos responsables por daños indirectos o consecuentes</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-gray-500 text-lg">💼</span>
                  <div>
                    <p className="text-gray-700 text-sm">Nuestra responsabilidad se limita al valor del servicio contratado</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-gray-500 text-lg">🚗</span>
                  <div>
                    <p className="text-gray-700 text-sm">No cubrimos gastos de transporte no incluidos en el servicio</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-gray-500 text-lg">📱</span>
                  <div>
                    <p className="text-gray-700 text-sm">No nos responsabilizamos por objetos personales perdidos</p>
                  </div>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg border-l-4 border-indigo-500 pl-3 py-2 bg-indigo-50 rounded-r-lg">
                Protección de Datos
              </h3>
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <div className="flex items-start space-x-3">
                  <span className="text-indigo-500 text-lg">🔒</span>
                  <p className="text-gray-700">
                    El tratamiento de tus datos personales se rige por nuestra <strong>Política de Privacidad</strong>, 
                que forma parte integrante de estos términos y condiciones.
              </p>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg border-l-4 border-red-500 pl-3 py-2 bg-red-50 rounded-r-lg">
                Ley Aplicable y Jurisdicción
              </h3>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-start space-x-3">
                  <span className="text-red-500 text-lg">⚖️</span>
                  <p className="text-gray-700">
                    Estos términos se rigen por la <strong>legislación española</strong>. Cualquier disputa será resuelta 
                    en los tribunales de <strong>Santa Cruz de Tenerife</strong>, salvo que la ley establezca otra jurisdicción.
                  </p>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg border-l-4 border-yellow-500 pl-3 py-2 bg-yellow-50 rounded-r-lg">
                Modificaciones
              </h3>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <span className="text-yellow-500 text-lg">🔄</span>
                  <p className="text-gray-700">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                Los cambios serán notificados en nuestro sitio web y serán efectivos inmediatamente.
              </p>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg border-l-4 border-blue-500 pl-3 py-2 bg-blue-50 rounded-r-lg">
                Contacto
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-gray-700 mb-3">
                  Para cualquier consulta sobre estos términos:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-500">📧</span>
                    <span className="text-gray-700">
                      <strong>Email:</strong> Tenerifeparadisetoursandexcursions@hotmail.com
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-500">📞</span>
                    <span className="text-gray-700">
                <strong>Teléfono:</strong> +34 617 30 39 29
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-6 mb-8">
                <strong>Última actualización:</strong> Enero 2025
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
                <strong>TenerifeParadiseTour&Excursions</strong> utiliza cookies para mejorar tu experiencia 
                en nuestro sitio web. Esta política explica qué cookies utilizamos, por qué las usamos 
                y cómo puedes gestionarlas de acuerdo con la normativa vigente.
              </p>

              <h3 className="font-semibold text-gray-900">¿Qué son las Cookies?</h3>
              <p>
                Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo 
                (ordenador, tablet, móvil) cuando visitas nuestro sitio web. Estas cookies 
                nos ayudan a recordar tus preferencias, mejorar la funcionalidad del sitio 
                y proporcionarte una experiencia personalizada.
              </p>

              <h3 className="font-semibold text-gray-900">Tipos de Cookies que Utilizamos</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium text-gray-900">Cookies Necesarias (Técnicas)</h4>
                  <p className="text-xs text-gray-500 mb-2">
                    Esenciales para el funcionamiento básico del sitio web. No se pueden desactivar.
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Autenticación y sesión de usuario</li>
                    <li>• Carrito de compras y reservas</li>
                    <li>• Preferencias de idioma</li>
                    <li>• Seguridad y protección CSRF</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-gray-900">Cookies de Análisis (Analíticas)</h4>
                  <p className="text-xs text-gray-500 mb-2">
                    Nos ayudan a entender cómo interactúas con nuestro sitio web para mejorarlo.
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Google Analytics (tráfico y comportamiento)</li>
                    <li>• Métricas de rendimiento del sitio</li>
                    <li>• Análisis de páginas más visitadas</li>
                    <li>• Tiempo de permanencia en el sitio</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-medium text-gray-900">Cookies de Marketing</h4>
                  <p className="text-xs text-gray-500 mb-2">
                    Se utilizan para mostrar anuncios relevantes y medir su efectividad.
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Google Ads y remarketing</li>
                    <li>• Facebook Pixel</li>
                    <li>• Anuncios personalizados</li>
                    <li>• Medición de conversiones</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium text-gray-900">Cookies Funcionales</h4>
                  <p className="text-xs text-gray-500 mb-2">
                    Permiten recordar tus preferencias y personalizar tu experiencia.
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Preferencias de búsqueda</li>
                    <li>• Configuración de filtros</li>
                    <li>• Historial de servicios visitados</li>
                    <li>• Personalización de contenido</li>
                  </ul>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900">Cookies de Terceros</h3>
              <p>
                Utilizamos servicios de terceros que pueden establecer cookies:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li><strong>Google Analytics:</strong> Análisis de tráfico web</li>
                <li><strong>Google Ads:</strong> Publicidad y remarketing</li>
                <li><strong>Facebook Pixel:</strong> Seguimiento de conversiones</li>
                <li><strong>Redsys:</strong> Procesamiento de pagos seguros</li>
                <li><strong>Supabase:</strong> Base de datos y autenticación</li>
              </ul>

              <h3 className="font-semibold text-gray-900">Duración de las Cookies</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Cookies de sesión:</strong> Se eliminan al cerrar el navegador</li>
                <li><strong>Cookies persistentes:</strong> Permanecen hasta su expiración (máximo 2 años)</li>
                <li><strong>Cookies de terceros:</strong> Según la política de cada proveedor</li>
              </ul>

              <h3 className="font-semibold text-gray-900">Gestionar tus Preferencias</h3>
              <p>
                Puedes gestionar tus preferencias de cookies de las siguientes maneras:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Panel de configuración:</strong> Utiliza nuestro panel de cookies</li>
                <li><strong>Configuración del navegador:</strong> Ajusta la configuración de tu navegador</li>
                <li><strong>Herramientas de terceros:</strong> Utiliza extensiones de bloqueo de cookies</li>
              </ul>

              <h3 className="font-semibold text-gray-900">Configuración por Navegador</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies
                </div>
                <div>
                  <strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies
                </div>
                <div>
                  <strong>Safari:</strong> Preferencias → Privacidad → Cookies
                </div>
                <div>
                  <strong>Edge:</strong> Configuración → Cookies y permisos del sitio
                </div>
              </div>

              <h3 className="font-semibold text-gray-900">Consecuencias de Desactivar Cookies</h3>
              <p>
                Ten en cuenta que desactivar ciertas cookies puede afectar la funcionalidad del sitio:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>No podrás iniciar sesión o mantener tu sesión activa</li>
                <li>El carrito de compras no funcionará correctamente</li>
                <li>Algunas funciones personalizadas no estarán disponibles</li>
                <li>La experiencia de navegación puede verse afectada</li>
              </ul>

              <h3 className="font-semibold text-gray-900">Actualizaciones de la Política</h3>
              <p>
                Esta política puede actualizarse para reflejar cambios en nuestras prácticas 
                o por otros motivos operativos, legales o reglamentarios. Te notificaremos 
                cualquier cambio significativo.
              </p>

              <h3 className="font-semibold text-gray-900 text-lg border-l-4 border-blue-500 pl-3 py-2 bg-blue-50 rounded-r-lg">
                Contacto
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-gray-700 mb-3">
                  Para cualquier consulta sobre nuestra política de cookies:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-500">📧</span>
                    <span className="text-gray-700">
                      <strong>Email:</strong> Tenerifeparadisetoursandexcursions@hotmail.com
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-500">📞</span>
                    <span className="text-gray-700">
                <strong>Teléfono:</strong> +34 617 30 39 29
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-6 mb-8">
                <strong>Última actualización:</strong> Enero 2025
              </p>
            </div>
          )
        }
    }
  }

  const content = getModalContent()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6 print:relative print:bg-white print:inset-auto legal-modal-print" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[85vh] overflow-hidden shadow-2xl print:shadow-none print:max-h-none print:rounded-none mb-8" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-gray-50 to-white sticky top-0 z-10 print:static legal-modal-header-print">
          <div className="flex items-center space-x-3">
            {content.icon}
            <h2 className="text-xl font-semibold text-gray-900">{content.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full print:hidden"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 pb-20 overflow-y-auto max-h-[calc(85vh-200px)] print:overflow-visible print:max-h-none legal-modal-content-print">
          {content.content}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-8 pb-20 border-t bg-gradient-to-r from-gray-50 to-white space-y-4 sm:space-y-0 print:hidden legal-modal-footer-print">
          <div className="text-xs text-gray-500 text-center sm:text-left">
            <strong>Última actualización:</strong> Enero 2025
          </div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 w-full sm:w-auto">
            {/* Grupo de botones de acción */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={copyToClipboard}
                title="Copiar contenido al portapapeles"
                className="px-6 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-300 font-medium border border-blue-300 hover:border-blue-400 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                <span>📋</span>
                <span>Copiar</span>
              </button>
              <button
                onClick={() => window.print()}
                title="Imprimir documento legal"
                className="px-6 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all duration-300 font-medium border border-green-300 hover:border-green-400 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                <span>🖨️</span>
                <span>Imprimir</span>
              </button>
            </div>
            
            {/* Separador visual */}
            <div className="hidden sm:block w-px h-12 bg-gray-300 mx-2 self-center"></div>
            
            {/* Grupo de botones de cierre */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={onClose}
                title="Cerrar modal sin confirmar"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 font-medium border border-gray-300 hover:border-gray-400 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                <span>❌</span>
                <span>Cerrar</span>
              </button>
          <button
            onClick={onClose}
                title="Confirmar lectura del documento"
                className="px-6 py-3 bg-gradient-to-r from-[#0061A8] to-[#1E40AF] text-white rounded-lg hover:from-[#004A87] hover:to-[#1E3A8A] transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
                <span>✅</span>
                <span>Entendido</span>
          </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 