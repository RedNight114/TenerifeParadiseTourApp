"use client"

import { MapModule } from "@/components/MapModule"

export default function TestMapPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Test del Mapa de Tenerife</h1>
        <div className="bg-white rounded-lg shadow-lg p-4">
          <MapModule 
            className="w-full h-[600px] rounded-lg"
            showControls={true}
          />
        </div>
      </div>
    </div>
  )
}
