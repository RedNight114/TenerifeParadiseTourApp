"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createDynamicImport, DynamicComponentWrapper } from './dynamic-component-wrapper'
import TabLoading from './tab-loading'

// Componente de prueba para verificar imports dinámicos
const TestComponent = createDynamicImport("@/components/admin/services-management", {
  ssr: false,
  loading: TabLoading
})

export default function TestDynamicLoading() {
  const [showComponent, setShowComponent] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prueba de Carga Dinámica</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={() => setShowComponent(!showComponent)}
            variant="outline"
          >
            {showComponent ? 'Ocultar' : 'Mostrar'} Componente
          </Button>
          
          {showComponent && (
            <DynamicComponentWrapper fallback={TabLoading}>
              <TestComponent />
            </DynamicComponentWrapper>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


