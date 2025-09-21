import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase-unified'

export interface AgePriceRange {
  id: number
  serviceId: string
  rangeName: string
  minAge: number
  maxAge: number
  price: number
  priceType: string
  description?: string
  ageLabel: string
}

export interface ServicePricing {
  serviceId: string
  serviceName: string
  adultPrice: number
  ageRanges: AgePriceRange[]
}

export interface Participant {
  id: string
  type: string
  age: number
  price: number
  ageRange: string
}

export function useAgePricing() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Obtener precios por edad para un servicio específico
  const getServicePricing = useCallback(async (serviceId: string): Promise<ServicePricing | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const client = await getSupabaseClient()
      
      if (!client) {
        throw new Error('No se pudo inicializar el cliente de Supabase')
      }
      
      // Obtener información del servicio
      const { data: service, error: serviceError } = await client
        .from('services')
        .select('id, title, price')
        .eq('id', serviceId)
        .single()
      
      if (serviceError) {
        throw new Error(`Error obteniendo servicio: ${serviceError.message}`)
      }
      
      if (!service) {
        throw new Error('Servicio no encontrado')
      }
      
      // Obtener rangos de edad y precios
      const { data: ageRanges, error: ageRangesError } = await client
        .from('age_price_ranges')
        .select('*')
        .eq('service_id', serviceId)
        .eq('is_active', true)
        .order('min_age')
      
      if (ageRangesError) {
        // Si no hay tabla de rangos de edad, crear precios por defecto
        const defaultAgeRanges: AgePriceRange[] = [
          {
            id: 1,
            serviceId: service.id,
            rangeName: 'Bebés',
            minAge: 0,
            maxAge: 2,
            price: service.price * 0.5,
            priceType: 'per_person',
            description: 'Gratis para bebés',
            ageLabel: 'Bebés (0-2 años)'
          },
          {
            id: 2,
            serviceId: service.id,
            rangeName: 'Niños',
            minAge: 3,
            maxAge: 11,
            price: service.price * 0.7,
            priceType: 'per_person',
            description: '50% del precio adulto',
            ageLabel: 'Niños (3-11 años)'
          },
          {
            id: 3,
            serviceId: service.id,
            rangeName: 'Adolescentes',
            minAge: 12,
            maxAge: 17,
            price: service.price * 0.9,
            priceType: 'per_person',
            description: '90% del precio adulto',
            ageLabel: 'Adolescentes (12-17 años)'
          },
          {
            id: 4,
            serviceId: service.id,
            rangeName: 'Adultos',
            minAge: 18,
            maxAge: 64,
            price: service.price,
            priceType: 'per_person',
            description: 'Precio completo',
            ageLabel: 'Adultos (18-64 años)'
          },
          {
            id: 5,
            serviceId: service.id,
            rangeName: 'Seniors',
            minAge: 65,
            maxAge: 120,
            price: service.price * 0.8,
            priceType: 'per_person',
            description: '20% descuento para seniors',
            ageLabel: 'Seniors (65+ años)'
          }
        ]
        
        return {
          serviceId: service.id,
          serviceName: service.title,
          adultPrice: service.price,
          ageRanges: defaultAgeRanges
        }
      }
      
                 // Formatear los datos si existen rangos de edad
           const formattedAgeRanges: AgePriceRange[] = (ageRanges || []).map((range: any) => ({
             id: range.id,
             serviceId: range.service_id,
             rangeName: range.range_name,
             minAge: range.min_age,
             maxAge: range.max_age,
             price: range.price,
             priceType: range.price_type,
             description: range.description,
             ageLabel: getAgeRangeLabel(range.min_age, range.max_age)
           }))
      
      return {
        serviceId: service.id,
        serviceName: service.title,
        adultPrice: service.price,
        ageRanges: formattedAgeRanges
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Calcular precio para una edad específica
  const calculatePriceForAge = useCallback((ageRanges: AgePriceRange[], age: number): number => {
    const range = ageRanges.find(r => age >= r.minAge && age <= r.maxAge)
    return range ? range.price : 0
  }, [])

  // Obtener tipo de participante basado en la edad
  const getParticipantType = useCallback((ageRanges: AgePriceRange[], age: number): string => {
    const range = ageRanges.find(r => age >= r.minAge && age <= r.maxAge)
    return range ? range.priceType : 'adult'
  }, [])

  // Obtener etiqueta de rango de edad
  const getAgeRangeLabel = useCallback((minAge: number, maxAge: number): string => {
    if (minAge === 0 && maxAge === 2) return 'Bebés (0-2 años)'
    if (minAge === 3 && maxAge === 11) return 'Niños (3-11 años)'
    if (minAge === 12 && maxAge === 17) return 'Adolescentes (12-17 años)'
    if (minAge === 18 && maxAge === 64) return 'Adultos (18-64 años)'
    if (minAge === 65 && maxAge === 120) return 'Seniors (65+ años)'
    return `${minAge}-${maxAge} años`
  }, [])

  // Calcular precio total para una lista de participantes
  const calculateTotalPrice = useCallback((participants: Participant[]): number => {
    return participants.reduce((total, participant) => total + participant.price, 0)
  }, [])

  // Crear participante con precio calculado
  const createParticipant = useCallback((
    ageRanges: AgePriceRange[], 
    type: string, 
    age: number
  ): Participant => {
    const price = calculatePriceForAge(ageRanges, age)
    const ageRange = getAgeRangeLabel(
      ageRanges.find(r => r.priceType === type)?.minAge || 0,
      ageRanges.find(r => r.priceType === type)?.maxAge || 120
    )
    
    return {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      age,
      price,
      ageRange
    }
  }, [calculatePriceForAge, getAgeRangeLabel])

  // Validar edad para un tipo de participante
  const validateAgeForType = useCallback((ageRanges: AgePriceRange[], type: string, age: number): boolean => {
    const range = ageRanges.find(r => r.priceType === type)
    if (!range) return false
    return age >= range.minAge && age <= range.maxAge
  }, [])

  // Obtener rangos de edad disponibles para un servicio
  const getAvailableAgeRanges = useCallback((ageRanges: AgePriceRange[]) => {
    return ageRanges.map(range => ({
      type: range.priceType,
      label: range.ageLabel,
      minAge: range.minAge,
      maxAge: range.maxAge,
      price: range.price
    }))
  }, [])

  // Obtener estadísticas de participantes
  const getParticipantStats = useCallback((participants: Participant[]) => {
    const stats = {
      total: participants.length,
      babies: participants.filter(p => p.type === 'baby').length,
      children: participants.filter(p => p.type === 'child').length,
      adults: participants.filter(p => p.type === 'adult').length,
      seniors: participants.filter(p => p.type === 'senior').length,
      totalPrice: calculateTotalPrice(participants)
    }
    
    return stats
  }, [calculateTotalPrice])

  // Exportar datos de participantes para reserva
  const exportParticipantsForReservation = useCallback((participants: Participant[]) => {
    return participants.map(p => ({
      participant_type: p.type,
      age: p.age,
      price: p.price,
      age_range: p.ageRange
    }))
  }, [])

  return {
    loading,
    error,
    getServicePricing,
    calculatePriceForAge,
    getParticipantType,
    getAgeRangeLabel,
    calculateTotalPrice,
    createParticipant,
    validateAgeForType,
    getAvailableAgeRanges,
    getParticipantStats,
    exportParticipantsForReservation
  }
}


