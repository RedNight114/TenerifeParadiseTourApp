"use client"

import React from 'react'
import { AdminLayoutModern } from '@/components/admin/admin-layout-modern'
import { AdminGuard } from '@/components/admin/admin-guard'
import { MapManager } from '@/components/admin/MapManager'
import { MapStatsAdmin } from '@/components/admin/MapStatsAdmin'
import { MapPreview } from '@/components/admin/MapPreview'
import { MapSettings } from '@/components/admin/MapSettings'

export default function MapManagementPage() {
  return (
    <AdminGuard>
      <AdminLayoutModern>
        <div className="space-y-6">
          {/* Header */}
          <div className="border-b border-gray-200 pb-4">
            <h1 className="text-3xl font-bold text-gray-900">Gestión del Mapa</h1>
            <p className="mt-1 text-gray-600">
              Administra hoteles y servicios en el mapa interactivo de Tenerife
            </p>
          </div>

          {/* Vista previa del mapa */}
          <div className="mb-6">
            <MapPreview />
          </div>

          {/* Contenido principal */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2">
              <MapManager />
            </div>
            <div className="lg:col-span-1">
              <MapStatsAdmin />
            </div>
            <div className="lg:col-span-1">
              <MapSettings />
            </div>
          </div>
        </div>
      </AdminLayoutModern>
    </AdminGuard>
  )
}
