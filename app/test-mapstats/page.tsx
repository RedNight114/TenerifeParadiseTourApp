"use client"

import { MapStats } from '@/components/MapStats'

export default function TestMapStats() {
  const mockMapData = {
    hoteles: [
      { id: '1', nombre: 'Hotel Test', visible_en_mapa: true, estrellas: 4 },
      { id: '2', nombre: 'Hotel Test 2', visible_en_mapa: true, estrellas: 5 }
    ],
    servicios: [
      { id: '1', title: 'Servicio Test', visible_en_mapa: true, price: 50 },
      { id: '2', title: 'Servicio Test 2', visible_en_mapa: true, price: 100 }
    ]
  }

  const mockFilters = {
    showHotels: true,
    showServices: true,
    priceRange: [0, 200] as [number, number],
    category: 'all',
    stars: [],
    searchTerm: ''
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test MapStats</h1>
      <MapStats mapData={mockMapData} filters={mockFilters} />
    </div>
  )
}
