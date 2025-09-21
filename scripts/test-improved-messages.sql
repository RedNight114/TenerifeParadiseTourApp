-- Script para probar los mensajes mejorados
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- VERIFICAR MENSAJES ACTUALES
-- =====================================================

-- Ver mensajes recientes con roles
SELECT 
    'MENSAJES ACTUALES' as tipo,
    id,
    sender_id,
    sender_role,
    LEFT(content, 100) as content_preview,
    created_at
FROM messages 
ORDER BY created_at DESC 
LIMIT 5;

-- =====================================================
-- CREAR CONVERSACIÓN DE PRUEBA DESDE USUARIO
-- =====================================================

-- Insertar conversación de prueba
INSERT INTO conversations (
    title,
    user_id,
    status,
    priority,
    last_message_at
) VALUES (
    'Prueba Mensaje Mejorado Usuario',
    (SELECT id FROM profiles WHERE role = 'client' LIMIT 1),
    'active',
    'normal',
    NOW()
);

-- Insertar mensaje inicial de usuario
INSERT INTO messages (
    conversation_id,
    sender_id,
    content,
    message_type
) VALUES (
    (SELECT id FROM conversations WHERE title = 'Prueba Mensaje Mejorado Usuario' LIMIT 1),
    (SELECT id FROM profiles WHERE role = 'client' LIMIT 1),
    '¡Hola, Claudia 👋! Hemos recibido tu consulta, en breve un miembro de soporte te responderá.

¿En qué podemos ayudarte hoy?',
    'text'
);

-- =====================================================
-- CREAR CONVERSACIÓN DE PRUEBA DESDE ADMIN
-- =====================================================

-- Insertar conversación de prueba
INSERT INTO conversations (
    title,
    user_id,
    status,
    priority,
    last_message_at
) VALUES (
    'Prueba Mensaje Mejorado Admin',
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    'active',
    'normal',
    NOW()
);

-- Insertar mensaje inicial de admin
INSERT INTO messages (
    conversation_id,
    sender_id,
    content,
    message_type
) VALUES (
    (SELECT id FROM conversations WHERE title = 'Prueba Mensaje Mejorado Admin' LIMIT 1),
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    'Nueva consulta abierta por Brian Afonso. El usuario está esperando respuesta.',
    'text'
);

-- =====================================================
-- VERIFICAR MENSAJES DE PRUEBA
-- =====================================================

-- Ver los mensajes de prueba insertados
SELECT 
    'MENSAJES DE PRUEBA' as tipo,
    id,
    sender_id,
    sender_role,
    content,
    created_at
FROM messages 
WHERE content LIKE '%Prueba Mensaje Mejorado%' OR content LIKE '%Claudia 👋%' OR content LIKE '%Brian Afonso%'
ORDER BY created_at DESC;

-- =====================================================
-- VERIFICAR CONVERSACIONES DE PRUEBA
-- =====================================================

-- Ver las conversaciones de prueba
SELECT 
    'CONVERSACIONES DE PRUEBA' as tipo,
    id,
    title,
    user_id,
    status,
    created_at
FROM conversations 
WHERE title LIKE '%Prueba Mensaje Mejorado%'
ORDER BY created_at DESC;

-- =====================================================
-- MENSAJE FINAL
-- =====================================================

SELECT 'PRUEBA COMPLETA: Mensajes mejorados creados correctamente' as status;
