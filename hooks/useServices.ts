"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key environment variables.')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Service {
  id: string
  title: string
  description: string
  price: number
  lat?: number
  lng?: number
  visible_en_mapa?: boolean
  location?: string
  images?: string[]
  category_id?: string
  subcategory_id?: string
  available: boolean
  featured: boolean
  duration?: string
  max_participants?: number
  rating?: number
  created_at: string
  updated_at: string
}

export interface Hotel {
  id: string
  nombre: string
  direccion: string
  lat: number
  lng: number
  visible_en_mapa: boolean
  estrellas?: number
  telefono?: string
  descripcion?: string
  created_at: string
  updated_at: string
}

export interface MapData {
  hoteles: Hotel[]
  servicios: Service[]
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('Iniciando carga de datos...')

        // Verificar variables de entorno
        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error('Variables de entorno de Supabase no configuradas')
        }

        // Fetch services con timeout
        const servicesPromise = supabase
          .from('services')
          .select('*')
          .eq('available', true)
          .eq('visible_en_mapa', true)
          .not('lat', 'is', null)
          .not('lng', 'is', null)
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false })

        // Fetch hotels con timeout
        const hotelsPromise = supabase
          .from('hoteles')
          .select('*')
          .eq('visible_en_mapa', true)
          .order('estrellas', { ascending: false })

        // Ejecutar ambas consultas con timeout
        const [servicesResult, hotelsResult] = await Promise.all([
          Promise.race([
            servicesPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout servicios')), 10000))
          ]),
          Promise.race([
            hotelsPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout hoteles')), 10000))
          ])
        ])

        if (servicesResult.error) {
          console.error('Error fetching services:', servicesResult.error)
          throw servicesResult.error
        }

        if (hotelsResult.error) {
          console.error('Error fetching hotels:', hotelsResult.error)
          throw hotelsResult.error
        }

        console.log('Datos cargados exitosamente:', {
          services: servicesResult.data?.length || 0,
          hotels: hotelsResult.data?.length || 0
        })

        setServices(servicesResult.data || [])
        setHotels(hotelsResult.data || [])
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
        
        // Datos de fallback para desarrollo
        if (process.env.NODE_ENV === 'development') {
          console.log('Usando datos de fallback para desarrollo')
          setServices([
            {
              id: '1',
              title: 'Blue Oceany Catamarán',
              description: 'Disfruta de un día inolvidable en el océano Atlántico',
              price: 60,
              lat: 28.0783,
              lng: -16.7378,
              visible_en_mapa: true,
              available: true,
              featured: true,
              images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])
          setHotels([
            {
              id: '1',
              nombre: 'Hotel de Ejemplo',
              direccion: 'Costa Adeje, Tenerife',
              lat: 28.0967,
              lng: -16.7217,
              visible_en_mapa: true,
              estrellas: 5,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const mapData: MapData = {
    hoteles: hotels,
    servicios: services
  }

  return {
    services,
    hotels,
    mapData,
    loading,
    error,
    refetch: () => {
      setLoading(true)
      // Re-trigger the useEffect
      setServices([])
      setHotels([])
    }
  }
}
