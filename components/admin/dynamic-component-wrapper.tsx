"use client"

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

// Componente de loading por defecto
const DefaultLoading = () => (
  <Card>
    <CardContent className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm text-gray-600">Cargando contenido...</p>
      </div>
    </CardContent>
  </Card>
)

// Función helper para crear imports dinámicos seguros
export function createDynamicImport(importPath: string, options: {
  ssr?: boolean
  loading?: () => React.ReactElement
} = {}) {
  const { ssr = false, loading = DefaultLoading } = options
  
  return dynamic(
    () => import(importPath).then(mod => {
      // Verificar que el módulo tiene un export default
      if (!mod.default) {
        // Retornar un componente de error
        return {
          default: () => (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <p className="text-sm text-red-600">Error cargando componente</p>
                  <p className="text-xs text-gray-500">El módulo no tiene export default</p>
                </div>
              </CardContent>
            </Card>
          )
        }
      }
      return { default: mod.default }
    }),
    {
      ssr,
      loading
    }
  )
}

// Componente wrapper con Suspense
interface DynamicComponentWrapperProps {
  children: React.ReactNode
  fallback?: React.ComponentType
}

export function DynamicComponentWrapper({ 
  children, 
  fallback: FallbackComponent = DefaultLoading 
}: DynamicComponentWrapperProps) {
  return (
    <Suspense fallback={<FallbackComponent />}>
      {children}
    </Suspense>
  )
}


