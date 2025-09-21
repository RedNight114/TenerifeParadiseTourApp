-- Script para verificar los datos del dashboard de administración
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- VERIFICAR MENSAJES CON SUS ROLES
-- =====================================================

-- Ver mensajes recientes con información completa
SELECT 
    'MENSAJES CON ROLES' as tipo,
    m.id,
    m.conversation_id,
    m.sender_id,
    m.sender_role,
    LEFT(m.content, 80) as content_preview,
    p.full_name as sender_name,
    p.role as profile_role,
    m.created_at
FROM messages m
LEFT JOIN profiles p ON m.sender_id = p.id
ORDER BY m.created_at DESC 
LIMIT 10;

-- =====================================================
-- VERIFICAR MENSAJES DE BIENVENIDA
-- =====================================================

-- Ver específicamente mensajes de bienvenida
SELECT 
    'MENSAJES DE BIENVENIDA' as tipo,
    m.id,
    m.conversation_id,
    m.sender_id,
    m.sender_role,
    m.content,
    p.full_name as sender_name,
    p.role as profile_role,
    m.created_at
FROM messages m
LEFT JOIN profiles p ON m.sender_id = p.id
WHERE m.content LIKE '%Hemos recibido tu consulta%'
ORDER BY m.created_at DESC;

-- =====================================================
-- VERIFICAR CONVERSACIONES ACTIVAS
-- =====================================================

-- Ver conversaciones activas
SELECT 
    'CONVERSACIONES ACTIVAS' as tipo,
    c.id,
    c.title,
    c.user_id,
    c.status,
    c.last_message_at,
    p.full_name as user_name,
    p.role as user_role,
    c.created_at
FROM conversations c
LEFT JOIN profiles p ON c.user_id = p.id
WHERE c.status = 'active'
ORDER BY c.last_message_at DESC 
LIMIT 5;

-- =====================================================
-- VERIFICAR ROLES ÚNICOS
-- =====================================================

-- Ver roles únicos en mensajes
SELECT 
    'ROLES EN MENSAJES' as tipo,
    sender_role,
    COUNT(*) as cantidad,
    MIN(created_at) as primer_mensaje,
    MAX(created_at) as ultimo_mensaje
FROM messages 
GROUP BY sender_role
ORDER BY sender_role;

-- =====================================================
-- VERIFICAR PERFILES
-- =====================================================

-- Ver perfiles y sus roles
SELECT 
    'PERFILES Y ROLES' as tipo,
    id,
    full_name,
    email,
    role,
    created_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- =====================================================
-- MENSAJE FINAL
-- =====================================================

SELECT 'VERIFICACIÓN COMPLETA: Revisa los datos arriba' as status;
