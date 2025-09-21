-- Script para corregir la recursión infinita en las políticas RLS
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- PASO 1: ELIMINAR TODAS LAS POLÍTICAS PROBLEMÁTICAS
-- =====================================================

-- Eliminar políticas de conversation_participants que causan recursión
DROP POLICY IF EXISTS "Users can view participants from their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can insert participants in their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON conversation_participants;
DROP POLICY IF EXISTS "participants_select_policy" ON conversation_participants;
DROP POLICY IF EXISTS "participants_insert_policy" ON conversation_participants;
DROP POLICY IF EXISTS "participants_update_policy" ON conversation_participants;
DROP POLICY IF EXISTS "admins_view_all_participants" ON conversation_participants;

-- Eliminar políticas de conversations que pueden causar problemas
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "conversations_select_policy" ON conversations;
DROP POLICY IF EXISTS "conversations_insert_policy" ON conversations;
DROP POLICY IF EXISTS "conversations_update_policy" ON conversations;
DROP POLICY IF EXISTS "admins_view_all_conversations" ON conversations;
DROP POLICY IF EXISTS "admins_delete_conversations" ON conversations;

-- Eliminar políticas de messages que pueden causar problemas
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "messages_select_policy" ON messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON messages;
DROP POLICY IF EXISTS "messages_update_policy" ON messages;
DROP POLICY IF EXISTS "admins_view_all_messages" ON messages;

-- Eliminar políticas de chat_notifications
DROP POLICY IF EXISTS "chat_notifications_policy" ON chat_notifications;
DROP POLICY IF EXISTS "chat_notifications_all_policy" ON chat_notifications;

-- =====================================================
-- PASO 2: DESHABILITAR RLS TEMPORALMENTE
-- =====================================================

ALTER TABLE chat_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASO 3: CREAR POLÍTICAS SIMPLES SIN RECURSIÓN
-- =====================================================

-- Habilitar RLS nuevamente
ALTER TABLE chat_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Política simple para chat_notifications (permite todo para usuarios autenticados)
CREATE POLICY "chat_notifications_simple" ON chat_notifications
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Política simple para conversations (sin recursión)
CREATE POLICY "conversations_simple_select" ON conversations
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "conversations_simple_insert" ON conversations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "conversations_simple_update" ON conversations
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Política simple para messages (sin recursión)
CREATE POLICY "messages_simple_select" ON messages
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "messages_simple_insert" ON messages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "messages_simple_update" ON messages
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Política simple para conversation_participants (SIN RECURSIÓN)
CREATE POLICY "participants_simple_select" ON conversation_participants
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "participants_simple_insert" ON conversation_participants
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "participants_simple_update" ON conversation_participants
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- =====================================================
-- PASO 4: VERIFICAR QUE LAS POLÍTICAS ESTÁN ACTIVAS
-- =====================================================

-- Verificar políticas activas
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check 
FROM pg_policies 
WHERE tablename IN ('messages', 'conversations', 'conversation_participants', 'chat_notifications')
ORDER BY tablename, policyname;

-- =====================================================
-- PASO 5: PROBAR CREACIÓN DE CONVERSACIÓN
-- =====================================================

-- Verificar que las tablas están listas para usar
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('conversations', 'messages', 'conversation_participants', 'profiles', 'chat_categories', 'chat_notifications')
ORDER BY table_name;
