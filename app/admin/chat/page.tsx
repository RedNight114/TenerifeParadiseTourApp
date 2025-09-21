import AdminChatDashboard from '@/components/chat/admin-chat-dashboard'
import { AdminLayoutModern } from "@/components/admin/admin-layout-modern"
import { AdminGuard } from "@/components/admin/admin-guard"
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs"
import { MessageCircle, Users, Clock, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminChatPage() {
  return (
    <AdminGuard>
      <AdminLayoutModern>
        <div className="space-y-6">
          {/* Breadcrumbs */}
          <AdminBreadcrumbs
            customItems={[
              { label: "Dashboard", href: "/admin/dashboard" },
              { label: "Chat de Soporte", href: "/admin/chat" }
            ]}
          />

          {/* Header mejorado */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">💬 Chat de Soporte</h1>
                  <p className="text-gray-700 font-medium">Gestiona conversaciones con clientes en tiempo real</p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  <Users className="w-3 h-3 mr-1" />
                  Soporte Activo
                </Badge>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">Tiempo promedio</div>
                  <div className="text-lg font-bold text-blue-600">2.3 min</div>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-900">24</div>
                    <div className="text-sm text-blue-600">Conversaciones</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-900">8</div>
                    <div className="text-sm text-orange-600">Pendientes</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-900">16</div>
                    <div className="text-sm text-green-600">Resueltas</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-900">4.8</div>
                    <div className="text-sm text-purple-600">Satisfacción</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel de chat principal */}
          <Card className="border-0 shadow-lg bg-white flex-1">
            <CardContent className="p-0 h-full">
              <div className="h-[calc(100vh-50px)] min-h-[900px] max-h-[1400px]">
                <AdminChatDashboard showHeader={false} showNavbar={false} />
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayoutModern>
    </AdminGuard>
  )
}

