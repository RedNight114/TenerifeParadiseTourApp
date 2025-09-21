"use client"

import React from "react"
import { AdminLayoutModern } from "@/components/admin/admin-layout-modern"
import { AdminGuard } from "@/components/admin/admin-guard"
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Euro, Users, Baby, User } from "lucide-react"

export default function AdminPricing() {
  return (
    <AdminGuard>
      <AdminLayoutModern>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Precios</h1>
              <AdminBreadcrumbs 
                customItems={[
                  { label: 'Admin', href: '/admin/dashboard' },
                  { label: 'Precios' }
                ]}
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Adultos</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">€45 - €120</div>
                <p className="text-xs text-gray-500">Precio base</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Niños</CardTitle>
                <User className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">€25 - €65</div>
                <p className="text-xs text-gray-500">3-12 años</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Bebés</CardTitle>
                <Baby className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">Gratis</div>
                <p className="text-xs text-gray-500">0-2 años</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Grupos</CardTitle>
                <Euro className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">-15%</div>
                <p className="text-xs text-gray-500">+6 personas</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Euro className="w-5 h-5 mr-2 text-green-500" />
                Configuración de Precios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Tour del Teide</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Adultos:</span>
                        <span className="font-medium">€85</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Niños:</span>
                        <span className="font-medium">€45</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bebés:</span>
                        <span className="font-medium">Gratis</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Tour Loro Parque</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Adultos:</span>
                        <span className="font-medium">€120</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Niños:</span>
                        <span className="font-medium">€65</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bebés:</span>
                        <span className="font-medium">Gratis</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayoutModern>
    </AdminGuard>
  )
}
