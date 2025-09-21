"use client"

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Lazy loading del dashboard de admin
const LazyAdminDashboard = dynamic(
  () => import('./dashboard/page'),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0061A8] to-[#F4C762]">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold mb-2">Cargando panel de administración...</h2>
          <p className="text-sm opacity-90">Verificando permisos y cargando datos</p>
        </div>
      </div>
    ),
    ssr: false
  }
)

export default function LazyAdminDashboardWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0061A8] to-[#F4C762]">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold mb-2">Inicializando...</h2>
          <p className="text-sm opacity-90">Preparando panel de administración</p>
        </div>
      </div>
    }>
      <LazyAdminDashboard />
    </Suspense>
  )
}
