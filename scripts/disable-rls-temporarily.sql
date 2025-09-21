-- Script para deshabilitar temporalmente RLS en las tablas del chat
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- DESHABILITAR RLS TEMPORALMENTE PARA DEBUGGING
-- =====================================================

-- Deshabilitar RLS en conversations
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS en messages
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS en conversation_participants
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICAR ESTADO DE RLS
-- =====================================================

-- Verificar que RLS está deshabilitado
SELECT 
    'RLS STATUS' as tipo,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('conversations', 'messages', 'conversation_participants')
AND schemaname = 'public';

SELECT 'RLS DESHABILITADO TEMPORALMENTE PARA DEBUGGING' as status;