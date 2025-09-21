'use client'

import { useChatOptimized } from '@/hooks/use-chat-optimized'
import { useAuth } from '@/hooks/use-auth'

export default function ChatTestPage() {
  const { user, getSessionInfo } = useAuth()
  const { isAuthenticated } = getSessionInfo()
  const { 
    conversations, 
    isLoading, 
    error, 
    loadConversations 
  } = useChatOptimized()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Test de Chat - Estado del Sistema
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Estado de Autenticación */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Estado de Autenticación
            </h2>
            <div className="space-y-2">
              <p><strong>Autenticado:</strong> {isAuthenticated ? '✅ Sí' : '❌ No'}</p>
              <p><strong>Usuario ID:</strong> {user?.id || 'No disponible'}</p>
              <p><strong>Email:</strong> {user?.email || 'No disponible'}</p>
            </div>
          </div>

          {/* Estado del Chat */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Estado del Chat
            </h2>
            <div className="space-y-2">
              <p><strong>Cargando:</strong> {isLoading ? '⏳ Sí' : '✅ No'}</p>
              <p><strong>Error:</strong> {error || 'Ninguno'}</p>
              <p><strong>Conversaciones:</strong> {conversations?.length || 0}</p>
            </div>
          </div>

          {/* Lista de Conversaciones */}
          <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Conversaciones ({conversations?.length || 0})
              </h2>
              <button
                onClick={loadConversations}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Recargar Conversaciones
              </button>
            </div>

            {isLoading && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-600">Cargando conversaciones...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
                <p className="text-red-800"><strong>Error:</strong> {error}</p>
              </div>
            )}

            {conversations && conversations.length > 0 ? (
              <div className="space-y-3">
                {conversations.map((conv) => (
                  <div key={conv.id} className="border border-gray-200 rounded p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">{conv.title}</h3>
                        <p className="text-gray-600 text-sm">{conv.description || 'Sin descripción'}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          Estado: {conv.status} | Prioridad: {conv.priority}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(conv.created_at).toLocaleDateString()}
                        </p>
                        {(conv.unread_count || 0) > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {conv.unread_count || 0}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !isLoading && (
              <div className="text-center py-8 text-gray-500">
                <p>No hay conversaciones disponibles</p>
                <p className="text-sm mt-2">Haz clic en "Recargar Conversaciones" para intentar cargar datos</p>
              </div>
            )}
          </div>

          {/* Información de Debug */}
          <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Información de Debug
            </h2>
            <div className="bg-gray-100 rounded p-4">
              <pre className="text-sm text-gray-700 overflow-auto">
                {JSON.stringify({
                  isAuthenticated,
                  userId: user?.id || 'dev-user-123',
                  conversationsCount: conversations?.length || 0,
                  isLoading,
                  error: error || null,
                  conversations: conversations?.map(conv => ({
                    id: conv.id,
                    title: conv.title,
                    status: conv.status,
                    unread_count: conv.unread_count
                  })) || []
                }, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


