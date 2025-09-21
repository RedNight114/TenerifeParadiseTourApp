-- Script para verificar la vista message_summary
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- VERIFICAR VISTA message_summary
-- =====================================================

-- Ver estructura de la vista
SELECT 
    'ESTRUCTURA DE LA VISTA' as tipo,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'message_summary' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- PROBAR VISTA CON DATOS REALES
-- =====================================================

-- Ver mensajes usando la vista message_summary
SELECT 
    'MENSAJES DESDE VISTA' as tipo,
    id,
    conversation_id,
    sender_id,
    sender_role,
    LEFT(content, 50) as content_preview,
    sender_full_name,
    sender_email,
    sender_avatar_url,
    created_at
FROM message_summary 
ORDER BY created_at DESC 
LIMIT 5;

-- =====================================================
-- COMPARAR CON TABLA DIRECTA
-- =====================================================

-- Ver mensajes directamente desde la tabla messages
SELECT 
    'MENSAJES DESDE TABLA' as tipo,
    id,
    conversation_id,
    sender_id,
    sender_role,
    LEFT(content, 50) as content_preview,
    created_at
FROM messages 
ORDER BY created_at DESC 
LIMIT 5;

-- =====================================================
-- VERIFICAR JOINS DE LA VISTA
-- =====================================================

-- Verificar que los joins funcionan correctamente
SELECT 
    'VERIFICAR JOINS' as tipo,
    m.id,
    m.sender_id,
    m.sender_role,
    p.full_name as profile_full_name,
    p.email as profile_email,
    p.role as profile_role,
    m.created_at
FROM messages m
LEFT JOIN profiles p ON m.sender_id = p.id
ORDER BY m.created_at DESC 
LIMIT 3;

-- =====================================================
-- MENSAJE FINAL
-- =====================================================

SELECT 'VERIFICACIÓN COMPLETA: Revisa si la vista incluye sender_role' as status;
