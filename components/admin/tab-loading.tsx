"use client"

import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function TabLoading() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Cargando contenido...</p>
        </div>
      </CardContent>
    </Card>
  )
}