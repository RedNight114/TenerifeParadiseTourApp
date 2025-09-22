"use client"

import { useState, useEffect } from "react"

export default function DebugPage() {
  const [cookies, setCookies] = useState<string>('')
  const [localStorage, setLocalStorage] = useState<Record<string, string>>({})
  const [sessionStorage, setSessionStorage] = useState<Record<string, string>>({})

  useEffect(() => {
    // Obtener cookies
    setCookies(document.cookie)

    // Obtener localStorage
    const localData: Record<string, string> = {}
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i)
        if (key) {
          localData[key] = window.localStorage.getItem(key) || ''
        }
      }
    } catch (e) {
      localData['error'] = 'No se pudo acceder a localStorage'
    }
    setLocalStorage(localData)

    // Obtener sessionStorage
    const sessionData: Record<string, string> = {}
    try {
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i)
        if (key) {
          sessionData[key] = window.sessionStorage.getItem(key) || ''
        }
      }
    } catch (e) {
      sessionData['error'] = 'No se pudo acceder a sessionStorage'
    }
    setSessionStorage(sessionData)
  }, [])

  const clearAll = () => {
    // Limpiar cookies
    const cookiesToDelete = [
      'sb-access-token',
      'sb-refresh-token', 
      'sb-session-active',
      'supabase.auth.token'
    ]

    cookiesToDelete.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    })

    // Limpiar localStorage
    try {
      window.localStorage.clear()
    } catch (e) {
      console.error('Error clearing localStorage:', e)
    }

    // Limpiar sessionStorage
    try {
      window.sessionStorage.clear()
    } catch (e) {
      console.error('Error clearing sessionStorage:', e)
    }

    // Recargar página
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug de Autenticación</h1>
        
        <div className="space-y-8">
          {/* Cookies */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Cookies</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {cookies || 'No hay cookies'}
            </pre>
          </div>

          {/* LocalStorage */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">LocalStorage</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(localStorage, null, 2)}
            </pre>
          </div>

          {/* SessionStorage */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">SessionStorage</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(sessionStorage, null, 2)}
            </pre>
          </div>

          {/* Botón de limpieza */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Acciones</h2>
            <button
              onClick={clearAll}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Limpiar Todo y Recargar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
