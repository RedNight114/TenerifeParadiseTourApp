"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function DebugCategoriesPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (!url || !key) {
          throw new Error('Variables de entorno no configuradas')
        }

        const supabase = createClient(url, key)

        // Obtener categorías directamente
        const { data: categories, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name')

        if (categoriesError) {
}

        // Obtener subcategorías directamente
        const { data: subcategories, error: subcategoriesError } = await supabase
          .from('subcategories')
          .select('*')
          .order('name')

        if (subcategoriesError) {
}

        // Obtener servicios con categorías
        const { data: services, error: servicesError } = await supabase
          .from('services')
          .select(`
            id, title, category_id,
            category:categories(id, name, description),
            subcategory:subcategories(id, name, description)
          `)
          .eq('available', true)
          .limit(5)

        if (servicesError) {
}

        setData({
          categories: categories || [],
          subcategories: subcategories || [],
          services: services || [],
          categoriesError,
          subcategoriesError,
          servicesError
        })

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="p-8">Cargando datos de debug...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Debug - Datos de Categorías</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categorías */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-green-600">
            Categorías ({data?.categories?.length || 0})
          </h2>
          {data?.categoriesError && (
            <div className="bg-red-100 p-3 rounded mb-4">
              <p className="text-red-700 text-sm">Error: {data.categoriesError.message}</p>
            </div>
          )}
          <div className="space-y-2">
            {data?.categories?.map((cat: any) => (
              <div key={cat.id} className="border-l-4 border-green-500 pl-3">
                <p className="font-medium">{cat.name}</p>
                <p className="text-sm text-gray-600">ID: {cat.id}</p>
                <p className="text-sm text-gray-500">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Subcategorías */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">
            Subcategorías ({data?.subcategories?.length || 0})
          </h2>
          {data?.subcategoriesError && (
            <div className="bg-red-100 p-3 rounded mb-4">
              <p className="text-red-700 text-sm">Error: {data.subcategoriesError.message}</p>
            </div>
          )}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data?.subcategories?.map((sub: any) => (
              <div key={sub.id} className="border-l-4 border-blue-500 pl-3">
                <p className="font-medium">{sub.name}</p>
                <p className="text-sm text-gray-600">ID: {sub.id}</p>
                <p className="text-sm text-gray-500">Categoría: {sub.category_id}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Servicios */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-purple-600">
            Servicios con Categorías ({data?.services?.length || 0})
          </h2>
          {data?.servicesError && (
            <div className="bg-red-100 p-3 rounded mb-4">
              <p className="text-red-700 text-sm">Error: {data.servicesError.message}</p>
            </div>
          )}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {data?.services?.map((service: any) => (
              <div key={service.id} className="border-l-4 border-purple-500 pl-3">
                <p className="font-medium">{service.title}</p>
                <p className="text-sm text-gray-600">ID: {service.id}</p>
                <p className="text-sm text-gray-500">
                  Categoría: {service.category?.name || 'Sin categoría'} ({service.category_id})
                </p>
                <p className="text-sm text-gray-500">
                  Subcategoría: {service.subcategory?.name || 'Sin subcategoría'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="mt-8 bg-gray-100 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Resumen</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded text-center">
            <p className="text-2xl font-bold text-green-600">{data?.categories?.length || 0}</p>
            <p className="text-sm text-gray-600">Categorías</p>
          </div>
          <div className="bg-white p-4 rounded text-center">
            <p className="text-2xl font-bold text-blue-600">{data?.subcategories?.length || 0}</p>
            <p className="text-sm text-gray-600">Subcategorías</p>
          </div>
          <div className="bg-white p-4 rounded text-center">
            <p className="text-2xl font-bold text-purple-600">{data?.services?.length || 0}</p>
            <p className="text-sm text-gray-600">Servicios</p>
          </div>
          <div className="bg-white p-4 rounded text-center">
            <p className="text-2xl font-bold text-orange-600">
              {data?.services?.filter((s: any) => s.category).length || 0}
            </p>
            <p className="text-sm text-gray-600">Con Categoría</p>
          </div>
        </div>
      </div>
    </div>
  )
}



