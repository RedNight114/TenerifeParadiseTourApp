"use client"

import { useAuth } from '@/hooks/use-auth'
import { useChatUnified } from '@/hooks/use-chat-unified'
import { useEffect, useState } from 'react'
import { AuthDebug } from '@/components/auth/auth-debug'

export default function ChatDebugPage() {
  const { user, profile, isInitialized, isLoading: authLoading } = useAuth()
  const { 
    conversations, 
    activeConversation, 
    messages, 
    isLoading: chatLoading, 
    error: chatError,
    loadConversations 
  } = useChatUnified()
  
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    const info = {
      auth: {
        user: user ? {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        } : null,
        profile: profile ? {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role
        } : null,
        isInitialized,
        authLoading
      },
      chat: {
        conversations: conversations?.length || 0,
        activeConversation: activeConversation ? {
          id: activeConversation.id,
          title: activeConversation.title,
          status: activeConversation.status
        } : null,
        messages: messages?.length || 0,
        chatLoading,
        chatError
      }
    }
    setDebugInfo(info)
  }, [user, profile, isInitialized, authLoading, conversations, activeConversation, messages, chatLoading, chatError])

  const handleLoadConversations = async () => {
    try {
      await loadConversations()
    } catch (error) {
      }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug del Chat</h1>
        
        {/* Componente de debug de autenticación */}
        <div className="mb-8">
          <AuthDebug />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Estado de Autenticación */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Estado de Autenticación</h2>
            <div className="space-y-2">
              <p><strong>Usuario:</strong> {user ? 'Autenticado' : 'No autenticado'}</p>
              <p><strong>ID:</strong> {user?.id || 'N/A'}</p>
              <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
              <p><strong>Perfil:</strong> {profile ? 'Cargado' : 'No cargado'}</p>
              <p><strong>Rol:</strong> {profile?.role || 'N/A'}</p>
              <p><strong>Inicializado:</strong> {isInitialized ? 'Sí' : 'No'}</p>
              <p><strong>Cargando:</strong> {authLoading ? 'Sí' : 'No'}</p>
            </div>
          </div>

          {/* Estado del Chat */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Estado del Chat</h2>
            <div className="space-y-2">
              <p><strong>Conversaciones:</strong> {conversations?.length || 0}</p>
              <p><strong>Conversación Activa:</strong> {activeConversation ? 'Sí' : 'No'}</p>
              <p><strong>Mensajes:</strong> {messages?.length || 0}</p>
              <p><strong>Cargando:</strong> {chatLoading ? 'Sí' : 'No'}</p>
              <p><strong>Error:</strong> {chatError || 'Ninguno'}</p>
            </div>
            <button 
              onClick={handleLoadConversations}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Cargar Conversaciones
            </button>
          </div>
        </div>

        {/* Información Detallada */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Información Detallada</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        {/* Lista de Conversaciones */}
        {conversations && conversations.length > 0 && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Conversaciones</h2>
            <div className="space-y-2">
              {conversations.map((conv) => (
                <div key={conv.id} className="border p-3 rounded">
                  <p><strong>ID:</strong> {conv.id}</p>
                  <p><strong>Título:</strong> {conv.title}</p>
                  <p><strong>Estado:</strong> {conv.status}</p>
                  <p><strong>Usuario:</strong> {conv.user_full_name || conv.user_email}</p>
                  <p><strong>Último mensaje:</strong> {conv.last_message_at ? new Date(conv.last_message_at).toLocaleString() : 'N/A'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}