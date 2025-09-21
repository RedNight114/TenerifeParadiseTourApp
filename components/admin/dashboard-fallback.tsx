"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface DashboardFallbackProps {
  error?: string
  onRetry?: () => void
}

export function DashboardFallback({ error, onRetry }: DashboardFallbackProps) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center text-red-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          Error en el Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-red-600 mb-4">
          {error || "Ha ocurrido un error al cargar el dashboard"}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        )}
      </CardContent>
    </Card>
  )
}