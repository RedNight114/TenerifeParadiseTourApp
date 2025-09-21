'use client'

import { usePathname } from 'next/navigation'
import { UnifiedChatWidget } from './chat/unified-chat-widget'

export function ConditionalChatWidget() {
  const pathname = usePathname()
  
  // No mostrar el widget en páginas de administración ni en la página de chat
  if (pathname === '/chat' || pathname?.startsWith('/admin')) {
    return null
  }
  
  return <UnifiedChatWidget variant="floating" />
}
