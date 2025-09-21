-- Script para habilitar RLS con políticas muy simples
-- Ejecutar DESPUÉS de que el chat funcione sin RLS

-- =====================================================
-- HABILITAR RLS CON POLÍTICAS BÁSICAS
-- =====================================================

-- Habilitar RLS
ALTER TABLE chat_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREAR POLÍTICAS MUY SIMPLES (SIN RECURSIÓN)
-- =====================================================

-- Política para chat_notifications: Solo usuarios autenticados
CREATE POLICY "chat_notifications_auth_only" ON chat_notifications
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Política para conversations: Solo usuarios autenticados
CREATE POLICY "conversations_auth_only" ON conversations
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Política para messages: Solo usuarios autenticados
CREATE POLICY "messages_auth_only" ON messages
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Política para conversation_participants: Solo usuarios autenticados
CREATE POLICY "participants_auth_only" ON conversation_participants
  FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- VERIFICAR POLÍTICAS
-- =====================================================

-- Verificar que las políticas están activas
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd,
  permissive
FROM pg_policies 
WHERE tablename IN ('messages', 'conversations', 'conversation_participants', 'chat_notifications')
ORDER BY tablename, policyname;

-- Verificar estado de RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('conversations', 'messages', 'conversation_participants', 'chat_notifications')
ORDER BY tablename;
