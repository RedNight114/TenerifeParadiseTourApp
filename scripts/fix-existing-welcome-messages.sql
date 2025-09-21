-- Script para corregir mensajes de bienvenida existentes
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- IDENTIFICAR MENSAJES DE BIENVENIDA PROBLEMÁTICOS
-- =====================================================

-- Ver mensajes que contienen el texto de bienvenida
SELECT 
    'MENSAJES DE BIENVENIDA ACTUALES' as tipo,
    id,
    conversation_id,
    sender_id,
    sender_role,
    LEFT(content, 100) as content_preview,
    created_at
FROM messages 
WHERE content LIKE '%Hemos recibido tu consulta%'
ORDER BY created_at DESC;

-- =====================================================
-- CORREGIR MENSAJES DE BIENVENIDA EXISTENTES
-- =====================================================

-- Actualizar mensajes de bienvenida para que aparezcan como mensajes del sistema/soporte
UPDATE messages 
SET 
    sender_id = NULL,
    sender_role = 'support'
WHERE content LIKE '%Hemos recibido tu consulta%'
  AND sender_role IN ('client', 'user');

-- =====================================================
-- VERIFICAR CORRECCIÓN
-- =====================================================

-- Ver mensajes corregidos
SELECT 
    'MENSAJES CORREGIDOS' as tipo,
    id,
    conversation_id,
    sender_id,
    sender_role,
    LEFT(content, 100) as content_preview,
    created_at
FROM messages 
WHERE content LIKE '%Hemos recibido tu consulta%'
ORDER BY created_at DESC;

-- =====================================================
-- CREAR MENSAJE DE PRUEBA NUEVO
-- =====================================================

-- Insertar conversación de prueba
INSERT INTO conversations (
    title,
    user_id,
    status,
    priority,
    last_message_at
) VALUES (
    'Prueba Mensaje Corregido',
    (SELECT id FROM profiles WHERE role = 'client' LIMIT 1),
    'active',
    'normal',
    NOW()
);

-- Insertar mensaje inicial CORRECTO (sender_id = null, sender_role = 'support')
INSERT INTO messages (
    conversation_id,
    sender_id,
    sender_role,
    content,
    message_type
) VALUES (
    (SELECT id FROM conversations WHERE title = 'Prueba Mensaje Corregido' LIMIT 1),
    NULL, -- sender_id = null para mensajes del sistema
    'support', -- sender_role = 'support'
    '¡Hola, Claudia 👋! Hemos recibido tu consulta, en breve un miembro de soporte te responderá.

¿En qué podemos ayudarte hoy?',
    'text'
);

-- =====================================================
-- VERIFICAR MENSAJE DE PRUEBA
-- =====================================================

-- Ver el mensaje de prueba
SELECT 
    'MENSAJE DE PRUEBA' as tipo,
    id,
    conversation_id,
    sender_id,
    sender_role,
    content,
    created_at
FROM messages 
WHERE conversation_id = (SELECT id FROM conversations WHERE title = 'Prueba Mensaje Corregido' LIMIT 1)
ORDER BY created_at ASC;

-- =====================================================
-- MENSAJE FINAL
-- =====================================================

SELECT 'CORRECCIÓN COMPLETA: Mensajes de bienvenida actualizados correctamente' as status;
