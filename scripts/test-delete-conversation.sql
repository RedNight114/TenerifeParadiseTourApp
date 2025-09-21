-- Script para probar la eliminación de conversaciones
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- CREAR CONVERSACIÓN DE PRUEBA PARA ELIMINAR
-- =====================================================

-- Insertar conversación de prueba
INSERT INTO conversations (
    title,
    user_id,
    status,
    priority,
    last_message_at
) VALUES (
    'Conversación de Prueba para Eliminar',
    (SELECT id FROM profiles WHERE role = 'client' LIMIT 1),
    'active',
    'normal',
    NOW()
);

-- Insertar algunos mensajes de prueba
INSERT INTO messages (
    conversation_id,
    sender_id,
    sender_role,
    content,
    message_type
) VALUES (
    (SELECT id FROM conversations WHERE title = 'Conversación de Prueba para Eliminar' LIMIT 1),
    NULL,
    'support',
    'Mensaje de prueba 1',
    'text'
);

INSERT INTO messages (
    conversation_id,
    sender_id,
    sender_role,
    content,
    message_type
) VALUES (
    (SELECT id FROM conversations WHERE title = 'Conversación de Prueba para Eliminar' LIMIT 1),
    (SELECT id FROM profiles WHERE role = 'client' LIMIT 1),
    'client',
    'Mensaje de prueba 2',
    'text'
);

-- =====================================================
-- VERIFICAR CONVERSACIÓN CREADA
-- =====================================================

-- Ver la conversación creada
SELECT 
    'CONVERSACIÓN CREADA' as tipo,
    c.id,
    c.title,
    c.user_id,
    c.status,
    c.created_at,
    p.full_name as user_name
FROM conversations c
LEFT JOIN profiles p ON c.user_id = p.id
WHERE c.title = 'Conversación de Prueba para Eliminar';

-- Ver los mensajes de la conversación
SELECT 
    'MENSAJES DE LA CONVERSACIÓN' as tipo,
    m.id,
    m.conversation_id,
    m.sender_id,
    m.sender_role,
    m.content,
    m.created_at
FROM messages m
WHERE m.conversation_id = (
    SELECT id FROM conversations WHERE title = 'Conversación de Prueba para Eliminar' LIMIT 1
);

-- =====================================================
-- SIMULAR ELIMINACIÓN MANUAL (PARA PRUEBAS)
-- =====================================================

-- NOTA: Este paso es solo para demostrar cómo se eliminaría
-- En la práctica, la aplicación usará la función deleteConversation

/*
-- Eliminar mensajes primero
DELETE FROM messages 
WHERE conversation_id = (
    SELECT id FROM conversations WHERE title = 'Conversación de Prueba para Eliminar' LIMIT 1
);

-- Eliminar conversación
DELETE FROM conversations 
WHERE title = 'Conversación de Prueba para Eliminar';
*/

-- =====================================================
-- VERIFICAR RLS POLICIES PARA ELIMINACIÓN
-- =====================================================

-- Verificar políticas RLS en la tabla conversations
SELECT 
    'POLÍTICAS RLS CONVERSATIONS' as tipo,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'conversations';

-- Verificar políticas RLS en la tabla messages
SELECT 
    'POLÍTICAS RLS MESSAGES' as tipo,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'messages';

-- =====================================================
-- MENSAJE FINAL
-- =====================================================

SELECT 'PRUEBA COMPLETA: Conversación de prueba creada para eliminar' as status;
