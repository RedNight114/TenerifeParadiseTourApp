"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

// Función para normalizar URLs de imágenes
const normalizeImageUrl = (url: string) => {
  if (!url) return null
  
  // Si ya es una URL completa de Supabase, usarla tal como está
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // Si no es una URL válida, retornar null
  return null
}

export function GallerySection() {
  const [images, setImages] = useState<string[]>([])
  const [initialImages, setInitialImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const fetchServiceImages = async () => {
      try {
        setLoading(true)
        setError(null)
// Crear cliente de Supabase directamente
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (!url || !key) {
          throw new Error('Variables de entorno de Supabase no configuradas')
        }

        const supabase = createClient(url, key)

        // Obtener servicios con imágenes
        const { data: services, error: servicesError } = await supabase
          .from('services')
          .select('images, title')
          .eq('available', true)
          .not('images', 'is', null)

        if (servicesError) {
          throw new Error(`Error obteniendo servicios: ${servicesError.message}`)
        }

        if (!services || services.length === 0) {
setImages([])
          setInitialImages([])
          setLoading(false)
          return
        }

        // Extraer todas las URLs de imágenes válidas
        const allImageUrls: string[] = []
        services.forEach(service => {
          if (service.images && Array.isArray(service.images)) {
            service.images.forEach((imageUrl: string) => {
              const normalizedUrl = normalizeImageUrl(imageUrl)
              if (normalizedUrl) {
                allImageUrls.push(normalizedUrl)
              }
            })
          }
        })

        // Filtrar URLs duplicadas y válidas
        const uniqueImageUrls = [...new Set(allImageUrls)].filter(url => url && url.length > 0)
if (uniqueImageUrls.length === 0) {
          setImages([])
          setInitialImages([])
        } else {
          // Mostrar las primeras 8 imágenes inicialmente
          const initial = uniqueImageUrls.slice(0, 8)
          setInitialImages(initial)
          setImages(uniqueImageUrls)
        }

        setLoading(false)
        
      } catch (err) {
setError(err instanceof Error ? err.message : 'Error desconocido')
        setLoading(false)
      }
    }

    fetchServiceImages()
  }, [])

  const displayedImages = showAll ? images : initialImages

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Galería de Experiencias</h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Un vistazo a las aventuras, paisajes y momentos que te esperan en Tenerife.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-[#0061A8]" />
          </div>
        ) : error ? (
          <div className="text-center py-12 border-2 border-dashed border-red-200 rounded-lg bg-red-50">
            <p className="text-red-600 font-medium">Error cargando la galería</p>
            <p className="text-sm text-red-500 mt-2">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Reintentar
            </Button>
          </div>
        ) : displayedImages.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
            <p className="text-gray-600 font-medium">No hay imágenes disponibles</p>
            <p className="text-sm text-gray-500 mt-2">
              Las imágenes aparecerán aquí cuando se suban a los servicios
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {displayedImages.map((imageUrl, index) => (
                <div key={index} className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="aspect-square relative">
                    <Image
                      src={imageUrl}
                      alt={`Experiencia ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              ))}
            </div>

            {images.length > initialImages.length && (
              <div className="text-center">
                <Button
                  onClick={() => setShowAll(!showAll)}
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  {showAll ? 'Mostrar Menos' : `Ver Todas (${images.length})`}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

