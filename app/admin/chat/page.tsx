import { AdminChatDashboard } from '@/components/chat/admin-chat-dashboard'

export default function AdminChatPage() {
  return (
    <div className="container mx-auto p-6 h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Chat de Soporte</h1>
        <p className="text-gray-600 mt-2">
          Gestiona todas las conversaciones de soporte con los usuarios registrados
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100vh-200px)]">
        <AdminChatDashboard />
      </div>
    </div>
  )
}

