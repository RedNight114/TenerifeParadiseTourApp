-- Script para verificar la estructura actual de las tablas del chat
-- Ejecutar en Supabase SQL Editor para diagnosticar el problema

-- =====================================================
-- PASO 1: VERIFICAR ESTRUCTURA DE TABLAS
-- =====================================================

-- Verificar estructura de conversation_participants
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'conversation_participants' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estructura de conversations
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'conversations' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estructura de messages
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'messages' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- PASO 2: VERIFICAR DATOS EXISTENTES
-- =====================================================

-- Ver conversaciones existentes
SELECT 
  id,
  title,
  user_id,
  status,
  created_at
FROM conversations 
ORDER BY created_at DESC 
LIMIT 5;

-- Ver participantes existentes
SELECT 
  id,
  conversation_id,
  user_id,
  role,
  joined_at
FROM conversation_participants 
ORDER BY joined_at DESC 
LIMIT 5;

-- Ver mensajes existentes
SELECT 
  id,
  conversation_id,
  sender_id,
  content,
  created_at
FROM messages 
ORDER BY created_at DESC 
LIMIT 5;

-- =====================================================
-- PASO 3: VERIFICAR POLÍTICAS RLS
-- =====================================================

-- Verificar políticas RLS activas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('conversations', 'messages', 'conversation_participants')
ORDER BY tablename, cmd;

-- =====================================================
-- PASO 4: VERIFICAR PERMISOS
-- =====================================================

-- Verificar permisos de usuario actual
SELECT current_user, session_user;

-- Verificar si RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('conversations', 'messages', 'conversation_participants');
