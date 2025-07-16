"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export function GallerySection() {
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServiceImages = async () => {
      setLoading(true)
      // Fetch services that are featured and have images
      const { data, error } = await supabase
        .from("services")
        .select("images")
        .eq("featured", true)
        .not("images", "is", null)
        .limit(10) // Limit to 10 services to not overload the gallery

      if (error) {
        setLoading(false)
        return
      }

      // Flatten the array of image arrays and shuffle them
      const allImages = data.flatMap((service) => service.images)
      const shuffledImages = allImages.sort(() => 0.5 - Math.random()).slice(0, 12) // Take up to 12 random images

      setImages(shuffledImages)
      setLoading(false)
    }

    fetchServiceImages()
  }, [])

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
        ) : images.length > 0 ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {images.map((imgSrc, index) => (
              <div key={index} className="overflow-hidden rounded-lg shadow-lg break-inside-avoid">
                <Image
                  src={imgSrc || "/placeholder.svg"}
                  alt={`Galería de experiencia en Tenerife ${index + 1}`}
                  width={500}
                  height={500}
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No hay imágenes destacadas para mostrar en este momento.</p>
            <p className="text-sm text-muted-foreground">
              Añade servicios destacados con imágenes para que aparezcan aquí.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
