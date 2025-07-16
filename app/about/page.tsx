"use client"

import { useState } from "react"
import Image from "next/image"
import { Star, Users, Award, Heart, Shield, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AboutPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  const values = [
    {
      icon: Heart,
      title: "Pasión por Tenerife",
      description:
        "Amamos nuestra isla y queremos compartir su belleza contigo. Cada experiencia está diseñada con cariño y conocimiento local.",
    },
    {
      icon: Shield,
      title: "Seguridad Primero",
      description:
        "Tu seguridad es nuestra prioridad. Todos nuestros servicios cumplen con los más altos estándares de calidad y seguridad.",
    },
    {
      icon: Users,
      title: "Experiencia Personal",
      description:
        "Creemos en experiencias únicas y personalizadas. No somos solo una empresa, somos tus amigos locales en Tenerife.",
    },
    {
      icon: Award,
      title: "Excelencia Garantizada",
      description:
        "Nos esforzamos por superar tus expectativas en cada servicio. Tu satisfacción es nuestro mayor logro.",
    },
  ]

  const testimonials = [
    {
      name: "María González",
      location: "Madrid, España",
      rating: 5,
      text: "Una experiencia increíble. El equipo de Tenerife Paradise hizo que nuestras vacaciones fueran inolvidables. Conocen cada rincón de la isla y nos llevaron a lugares que jamás habríamos encontrado solos.",
      service: "Tour al Teide",
    },
    {
      name: "John Smith",
      location: "Londres, Reino Unido",
      rating: 5,
      text: "Professional service and amazing local knowledge. They showed us the real Tenerife, not just the tourist spots. Highly recommended for anyone wanting an authentic experience.",
      service: "Avistamiento de Ballenas",
    },
    {
      name: "Sophie Dubois",
      location: "París, Francia",
      rating: 5,
      text: "Service exceptionnel ! L'équipe est passionnée et cela se ressent dans chaque détail. Nous avons découvert des endroits magiques grâce à eux. Merci pour ces souvenirs inoubliables !",
      service: "Tour Gastronómico",
    },
  ]

  const stats = [
    { number: "2025", label: "Año de Fundación", icon: "🏛️" },
    { number: "500+", label: "Aventuras Realizadas", icon: "🎯" },
    { number: "4.9", label: "Rating Promedio", icon: "⭐" },
    { number: "24/7", label: "Soporte Disponible", icon: "🕒" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/hero-about.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0061A8]/85 via-[#0061A8]/70 to-[#F4C762]/50" />
        <div className="relative container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">Sobre Tenerife Paradise</h1>
            <p className="text-xl md:text-2xl text-white/95 leading-relaxed drop-shadow-md">
              Tu puerta de entrada a las experiencias más auténticas de Tenerife. Somos más que una empresa de turismo,
              somos tus amigos locales en la isla de la eterna primavera.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient">Nuestra Historia</h2>
              <div className="space-y-6 text-gray-600 leading-relaxed">
                <p className="text-lg">
                  Tenerife Paradise Tours & Excursions nació en 2025 del amor profundo por nuestra isla y el deseo de
                  compartir sus tesoros ocultos con viajeros de todo el mundo.
                </p>
                <p>
                  Como nativos de Tenerife, hemos crecido explorando cada rincón de esta isla mágica. Desde los senderos
                  secretos del Teide hasta las calas escondidas de la costa, conocemos los lugares que hacen que
                  Tenerife sea verdaderamente especial.
                </p>
                <p>
                  Nuestra misión es simple: crear experiencias auténticas que conecten a nuestros huéspedes con la
                  verdadera esencia de Tenerife. No somos solo guías turísticos, somos embajadores de nuestra cultura,
                  nuestra naturaleza y nuestra forma de vida canaria.
                </p>
                <p className="font-semibold text-[#0061A8]">
                  Cada aventura que diseñamos lleva un pedacito de nuestro corazón canario.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="Equipo de Tenerife Paradise en el Teide"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-[#F4C762] rounded-2xl p-6 shadow-xl">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#0061A8]">100%</div>
                  <div className="text-sm font-medium text-gray-700">Locales</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-[#0061A8] to-[#F4C762]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-sm md:text-base opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient">Nuestros Valores</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Los principios que guían cada experiencia que creamos para ti
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon
              return (
                <Card
                  key={index}
                  className="text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-[#F4C762]/20"
                >
                  <CardContent className="p-0">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#0061A8] to-[#F4C762] rounded-full flex items-center justify-center mx-auto mb-6">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-gray-900">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient">Lo Que Dicen Nuestros Huéspedes</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Las experiencias reales de quienes han vivido la magia de Tenerife con nosotros
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="p-8 shadow-xl border-2 border-[#F4C762]/20">
              <CardContent className="p-0">
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 text-[#F4C762] fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-xl md:text-2xl text-gray-700 italic leading-relaxed mb-6">
                    "{testimonials[activeTestimonial].text}"
                  </blockquote>
                  <div className="flex flex-col items-center">
                    <div className="font-bold text-lg text-gray-900">{testimonials[activeTestimonial].name}</div>
                    <div className="text-gray-600">{testimonials[activeTestimonial].location}</div>
                    <Badge className="mt-2 bg-[#0061A8] text-white">{testimonials[activeTestimonial].service}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial Navigation */}
            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeTestimonial ? "bg-[#F4C762] scale-125" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Ver testimonio ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient">¿Por Qué Elegir Tenerife Paradise?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-[#0061A8] to-[#F4C762] rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Conocimiento Local Auténtico</h3>
              <p className="text-gray-600 leading-relaxed">
                Somos nativos de Tenerife con décadas de experiencia explorando cada rincón de la isla. Te llevamos a
                lugares que solo los locales conocen.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-[#F4C762] to-[#0061A8] rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Atención Personalizada 24/7</h3>
              <p className="text-gray-600 leading-relaxed">
                Estamos disponibles cuando nos necesites. Desde la planificación hasta el final de tu aventura, te
                acompañamos en cada paso.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-[#0061A8] to-[#F4C762] rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Experiencias con Alma</h3>
              <p className="text-gray-600 leading-relaxed">
                No vendemos tours, creamos recuerdos. Cada experiencia está diseñada para conectarte con la verdadera
                esencia de Tenerife.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-[#0061A8] to-[#F4C762]">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Listo para Conocernos?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Contáctanos y descubre por qué somos la mejor opción para explorar Tenerife
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-white text-[#0061A8] hover:bg-white/90 font-semibold px-8 py-4 text-lg">
              <a href="/contact">Contactar Ahora</a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-[#0061A8] font-semibold px-8 py-4 text-lg bg-transparent"
            >
              <a href="/services">Ver Nuestros Servicios</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
