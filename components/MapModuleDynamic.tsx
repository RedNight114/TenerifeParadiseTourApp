"use client"

import dynamic from 'next/dynamic'
import { MapLoading3D } from '@/components/MapLoading3D'

// Importar MapModule dinámicamente para evitar errores de SSR
const MapModuleDynamic = dynamic(() => import('@/components/MapModule').then(mod => ({ default: mod.MapModule })), {
  ssr: false,
  loading: () => <MapLoading3D />
})

export { MapModuleDynamic }
export default MapModuleDynamic
