import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cookie, Shield, BarChart3, Users, Settings, Info } from "lucide-react"

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Información sobre el uso de cookies en Tenerife Paradise Tours",
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Cookie className="h-8 w-8 text-white" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Política de Cookies
            </h1>
          </div>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Información detallada sobre cómo utilizamos las cookies para mejorar tu experiencia
          </p>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-8">
            {/* ¿Qué son las cookies? */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  ¿Qué son las cookies?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo 
                  (ordenador, tablet o móvil) cuando visitas nuestro sitio web. Estas cookies 
                  nos ayudan a:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Recordar tus preferencias y configuraciones</li>
                  <li>Analizar cómo utilizas nuestro sitio web</li>
                  <li>Mejorar la funcionalidad y experiencia de usuario</li>
                  <li>Proporcionar contenido personalizado</li>
                  <li>Garantizar la seguridad del sitio web</li>
                </ul>
              </CardContent>
            </Card>

            {/* Tipos de cookies que utilizamos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cookie className="h-5 w-5 text-blue-600" />
                  Tipos de cookies que utilizamos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cookies Necesarias */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Cookies Necesarias</h4>
                      <p className="text-gray-600 mt-1">
                        Estas cookies son esenciales para el funcionamiento del sitio web y no se pueden desactivar. 
                        Incluyen cookies de sesión, autenticación y seguridad.
                      </p>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-2 ml-4">
                        <li>Mantener tu sesión activa</li>
                        <li>Recordar tu estado de autenticación</li>
                        <li>Garantizar la seguridad del sitio</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Cookies de Analytics */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Cookies de Analytics</h4>
                      <p className="text-gray-600 mt-1">
                        Nos ayudan a entender cómo interactúas con nuestro sitio web recopilando 
                        información anónima sobre el uso.
                      </p>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-2 ml-4">
                        <li>Analizar el tráfico del sitio web</li>
                        <li>Identificar páginas populares</li>
                        <li>Mejorar la experiencia del usuario</li>
                        <li>Optimizar el rendimiento del sitio</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Cookies de Marketing */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Cookies de Marketing</h4>
                      <p className="text-gray-600 mt-1">
                        Se utilizan para mostrar anuncios relevantes y medir la efectividad 
                        de nuestras campañas publicitarias.
                      </p>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-2 ml-4">
                        <li>Mostrar anuncios personalizados</li>
                        <li>Medir la efectividad de campañas</li>
                        <li>Recordar tus preferencias de marketing</li>
                        <li>Proporcionar contenido relevante</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Cookies Funcionales */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Settings className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Cookies Funcionales</h4>
                      <p className="text-gray-600 mt-1">
                        Permiten recordar tus preferencias y mejorar la funcionalidad del sitio web.
                      </p>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-2 ml-4">
                        <li>Recordar tu idioma preferido</li>
                        <li>Guardar configuraciones de accesibilidad</li>
                        <li>Mantener preferencias de búsqueda</li>
                        <li>Personalizar la interfaz de usuario</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cómo gestionar las cookies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Cómo gestionar las cookies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Puedes gestionar tus preferencias de cookies de varias maneras:
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">1. Configuración del sitio web</h4>
                    <p className="text-gray-600">
                      Utiliza nuestro banner de cookies para personalizar tus preferencias 
                      en cualquier momento.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">2. Configuración del navegador</h4>
                    <p className="text-gray-600">
                      Puedes configurar tu navegador para rechazar todas las cookies o 
                      para que te avise cuando se envíe una cookie.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">3. Eliminar cookies existentes</h4>
                    <p className="text-gray-600">
                      Puedes eliminar las cookies existentes desde la configuración de tu navegador.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>Nota importante:</strong> Si desactivas las cookies, es posible que 
                    algunas funciones del sitio web no funcionen correctamente.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Información legal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Información legal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Esta política de cookies cumple con el Reglamento General de Protección de Datos (RGPD) 
                  y la Ley de Servicios de la Sociedad de la Información (LSSI).
                </p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">Responsable del tratamiento</h4>
                    <p className="text-gray-600">Tenerife Paradise Tours</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">Finalidad del tratamiento</h4>
                    <p className="text-gray-600">
                      Mejorar la experiencia del usuario, analizar el uso del sitio web y 
                      proporcionar funcionalidades personalizadas.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">Base legal</h4>
                    <p className="text-gray-600">
                      Consentimiento del usuario para cookies no esenciales. Interés legítimo 
                      para cookies necesarias.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">Derechos del usuario</h4>
                    <p className="text-gray-600">
                      Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición 
                      contactando con nosotros.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contacto */}
            <Card>
              <CardHeader>
                <CardTitle>¿Tienes preguntas?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Si tienes alguna pregunta sobre nuestra política de cookies, no dudes en contactarnos:
                </p>
                <div className="space-y-2 text-gray-600">
                  <p>📧 Email: privacy@tenerifeparadise.com</p>
                  <p>📞 Teléfono: +34 922 123 456</p>
                  <p>📍 Dirección: Tenerife, Islas Canarias, España</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
} 