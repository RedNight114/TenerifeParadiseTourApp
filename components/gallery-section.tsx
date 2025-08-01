"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { getSupabaseClient } from "@/lib/supabase-optimized"
import { Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { normalizeImageUrl } from "@/lib/utils"

export function GallerySection() {
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [initialImages, setInitialImages] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServiceImages = async () => {
      setLoading(true)
      setError(null)
      
      try {
        console.log('🖼️ Cargando imágenes de todos los servicios...')
        const supabase = getSupabaseClient()
        
        // Fetch ALL services that have images (not just featured)
        const { data, error } = await supabase
          .from("services")
          .select("id, title, images, featured")
          .not("images", "is", null)
          .limit(50) // Increased limit to get more images

        if (error) {
          console.error('❌ Error cargando servicios:', error)
          setError(error.message)
          setLoading(false)
          return
        }

        console.log('📊 Servicios con imágenes encontrados:', data?.length || 0)
        
        if (!data || data.length === 0) {
          console.log('⚠️ No hay servicios con imágenes')
          setImages([])
          setInitialImages([])
          setLoading(false)
          return
        }

        // Log para debugging
        data.forEach((service, index) => {
          console.log(`📸 Servicio ${index + 1}: ${service.title} - ${service.images?.length || 0} imágenes (Destacado: ${service.featured ? 'Sí' : 'No'})`)
        })

        // Flatten the array of image arrays and shuffle them
        const allImages = data.flatMap((service: any) => service.images || []).filter(Boolean)
        const shuffledImages = allImages.sort(() => 0.5 - Math.random())

        console.log('🖼️ Total de imágenes encontradas:', allImages.length)
        console.log('🖼️ Imágenes después de filtrar:', shuffledImages.length)

        setImages(shuffledImages as string[])
        setInitialImages((shuffledImages.slice(0, 8) as string[]))
        setLoading(false)
        
      } catch (err) {
        console.error('❌ Error inesperado cargando imágenes:', err)
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
        ) : images.length > 0 ? (
          <>
            <div className="w-full flex flex-col items-center">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600">
                  Mostrando {displayedImages.length} de {images.length} imágenes disponibles
                </p>
              </div>
              
              <div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-6xl mx-auto"
              >
                {displayedImages.map((imgSrc, index) => (
                  <div key={index} className="overflow-hidden rounded-lg shadow-lg flex items-center justify-center bg-gray-100 aspect-square">
                    <Image
                      src={normalizeImageUrl(imgSrc)}
                      alt={`Galería de experiencia en Tenerife ${index + 1}`}
                      width={500}
                      height={500}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        console.error('❌ Error cargando imagen:', imgSrc)
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder.jpg'
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Botón Ver más/Ver menos */}
              {images.length > 8 && (
                <div className="text-center mt-8">
                  <Button
                    onClick={() => setShowAll(!showAll)}
                    variant="outline"
                    className="border-[#0061A8] text-[#0061A8] hover:bg-[#0061A8] hover:text-white font-semibold px-8 py-3 transition-all duration-300"
                  >
                    {showAll ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Ver Menos
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Ver Más ({images.length - 8} más)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No hay imágenes disponibles para mostrar en este momento.</p>
            <p className="text-sm text-muted-foreground">
              Sube imágenes a los servicios para que aparezcan aquí.
            </p>
            <div className="mt-4">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                size="sm"
              >
                Actualizar
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
