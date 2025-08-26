'use client';

import React from 'react';
import { ChatWidgetFloating } from '@/components/chat/chat-widget-floating';
import { ChatWidget } from '@/components/chat/chat-widget';

/**
 * Ejemplo de implementación del chat de soporte mejorado
 * 
 * Este archivo muestra diferentes formas de implementar el chat
 * en tu aplicación Tenerife Paradise Tour
 */

export default function ChatImplementationExample() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Chat de Soporte - Ejemplos de Implementación
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ejemplo 1: Chat Flotante (Recomendado para la mayoría de páginas) */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              🚀 Chat Flotante
            </h2>
            <p className="text-gray-600 mb-4">
              Widget flotante que aparece en la esquina inferior derecha.
              Ideal para páginas de tours, servicios y contacto.
            </p>
            
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700">Características:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Botón flotante discreto</li>
                <li>• Ventana emergente elegante</li>
                <li>• Responsive y mobile-friendly</li>
                <li>• Indicador de notificaciones</li>
                <li>• Mensaje de bienvenida personalizado</li>
              </ul>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <code className="text-sm text-blue-800">
                {`import { ChatWidgetFloating } from '@/components/chat/chat-widget-floating';

// En tu layout o página
<ChatWidgetFloating />`}
              </code>
            </div>
          </div>

          {/* Ejemplo 2: Chat Expandido (Para páginas dedicadas) */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              💬 Chat Expandido
            </h2>
            <p className="text-gray-600 mb-4">
              Chat completo con panel de conversaciones y mensajes.
              Perfecto para páginas dedicadas de soporte.
            </p>
            
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700">Características:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Panel de conversaciones</li>
                <li>• Búsqueda de chats</li>
                <li>• Vista expandida de mensajes</li>
                <li>• Gestión completa de conversaciones</li>
                <li>• Indicadores de escritura</li>
              </ul>
            </div>
            
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <code className="text-sm text-green-800">
                {`import { ChatWidget } from '@/components/chat/chat-widget';

// En tu página de soporte
<ChatWidget 
  initialMessage="Hola, necesito ayuda con mi reserva"
  serviceId="tour-123"
/>`}
              </code>
            </div>
          </div>
        </div>

        {/* Implementación en Layout */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            🏗️ Implementación en Layout
          </h2>
          <p className="text-gray-600 mb-4">
            Para que el chat esté disponible en todas las páginas, agrégalo a tu layout principal:
          </p>
          
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-green-400 text-sm">
{`// app/layout.tsx
import { ChatWidgetFloating } from '@/components/chat/chat-widget-floating';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
        
        {/* Chat de soporte disponible en todas las páginas */}
        <ChatWidgetFloating />
      </body>
    </html>
  );
}`}
            </pre>
          </div>
        </div>

        {/* Personalización */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            🎨 Personalización
          </h2>
          <p className="text-gray-600 mb-4">
            El chat se puede personalizar con diferentes props y estilos:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Props Disponibles:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <code className="bg-gray-100 px-1 rounded">className</code> - Clases CSS personalizadas</li>
                <li>• <code className="bg-gray-100 px-1 rounded">initialMessage</code> - Mensaje inicial</li>
                <li>• <code className="bg-gray-100 px-1 rounded">serviceId</code> - ID del servicio</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Estilos CSS:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <code className="bg-gray-100 px-1 rounded">--chat-primary</code> - Color principal</li>
                <li>• <code className="bg-gray-100 px-1 rounded">--chat-shadow</code> - Sombras</li>
                <li>• <code className="bg-gray-100 px-1 rounded">--chat-border-radius</code> - Bordes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Funcionalidades Avanzadas */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            ⚡ Funcionalidades Avanzadas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 text-xl">🔔</span>
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Notificaciones</h3>
              <p className="text-sm text-gray-600">
                Badge animado para mensajes no leídos
              </p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 text-xl">📱</span>
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Responsive</h3>
              <p className="text-sm text-gray-600">
                Adaptación automática a todos los dispositivos
              </p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 text-xl">🎨</span>
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Temas</h3>
              <p className="text-sm text-gray-600">
                Soporte automático para modo claro y oscuro
              </p>
            </div>
          </div>
        </div>

        {/* Notas de Implementación */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-yellow-800 mb-4">
            ⚠️ Notas Importantes
          </h2>
          
          <div className="space-y-3 text-yellow-800">
            <div className="flex items-start gap-3">
              <span className="text-yellow-600 mt-1">•</span>
              <p className="text-sm">
                <strong>Autenticación:</strong> El chat requiere que el usuario esté autenticado. 
                Asegúrate de que tu sistema de auth esté configurado correctamente.
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-yellow-600 mt-1">•</span>
              <p className="text-sm">
                <strong>Base de datos:</strong> Verifica que las tablas del chat estén creadas 
                en Supabase según el script de implementación.
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-yellow-600 mt-1">•</span>
              <p className="text-sm">
                <strong>Variables de entorno:</strong> Configura las variables de Supabase 
                en tu archivo .env.local
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-yellow-600 mt-1">•</span>
              <p className="text-sm">
                <strong>Realtime:</strong> Habilita las suscripciones en tiempo real 
                en tu proyecto de Supabase.
              </p>
            </div>
          </div>
        </div>

        {/* Enlaces Útiles */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">
            🔗 Enlaces Útiles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href="/admin/chat" 
              className="p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
            >
              <h3 className="font-medium text-blue-800 mb-2">Panel de Administración</h3>
              <p className="text-sm text-blue-600">
                Gestiona todas las conversaciones del chat
              </p>
            </a>
            
            <a 
              href="/chat" 
              className="p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
            >
              <h3 className="font-medium text-blue-800 mb-2">Página de Chat</h3>
              <p className="text-sm text-blue-600">
                Chat expandido para usuarios registrados
              </p>
            </a>
          </div>
        </div>
      </div>
      
      {/* Chat flotante de ejemplo */}
      <ChatWidgetFloating />
    </div>
  );
}
