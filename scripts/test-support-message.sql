-- Script para probar que los mensajes de soporte aparecen correctamente
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- LIMPIAR MENSAJES DE PRUEBA ANTERIORES
-- =====================================================

-- Eliminar mensajes de prueba anteriores
DELETE FROM messages WHERE content LIKE '%Prueba Mensaje Mejorado%';
DELETE FROM conversations WHERE title LIKE '%Prueba Mensaje Mejorado%';

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
    'Prueba Mensaje Soporte',
    (SELECT id FROM profiles WHERE role = 'client' LIMIT 1),
    'active',
    'normal',
    NOW()
);

-- Insertar mensaje inicial de SOPORTE (no del cliente)
INSERT INTO messages (
    conversation_id,
    sender_id,
    sender_role,
    content,
    message_type
) VALUES (
    (SELECT id FROM conversations WHERE title = 'Prueba Mensaje Soporte' LIMIT 1),
    NULL, -- sender_id = null para mensajes del sistema/soporte
    'support', -- sender_role = 'support'
    '¡Hola, Claudia 👋! Hemos recibido tu consulta, en breve un miembro de soporte te responderá.

¿En qué podemos ayudarte hoy?',
    'text'
);

-- =====================================================
-- CREAR MENSAJE DE USUARIO DE RESPUESTA
-- =====================================================

-- Insertar mensaje de respuesta del usuario
INSERT INTO messages (
    conversation_id,
    sender_id,
    sender_role,
    content,
    message_type
) VALUES (
    (SELECT id FROM conversations WHERE title = 'Prueba Mensaje Soporte' LIMIT 1),
    (SELECT id FROM profiles WHERE role = 'client' LIMIT 1),
    'client',
    'Hola, tengo una pregunta sobre mi reserva',
    'text'
);

-- =====================================================
-- CREAR MENSAJE DE ADMIN DE RESPUESTA
-- =====================================================

-- Insertar mensaje de respuesta del admin
INSERT INTO messages (
    conversation_id,
    sender_id,
    sender_role,
    content,
    message_type
) VALUES (
    (SELECT id FROM conversations WHERE title = 'Prueba Mensaje Soporte' LIMIT 1),
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    'admin',
    'Hola Claudia, ¿en qué puedo ayudarte con tu reserva?',
    'text'
);

-- =====================================================
-- VERIFICAR RESULTADOS
-- =====================================================

-- Ver todos los mensajes de la conversación de prueba
SELECT 
    'MENSAJES DE PRUEBA' as tipo,
    id,
    sender_id,
    sender_role,
    content,
    created_at
FROM messages 
WHERE conversation_id = (SELECT id FROM conversations WHERE title = 'Prueba Mensaje Soporte' LIMIT 1)
ORDER BY created_at ASC;

-- =====================================================
-- VERIFICAR CONVERSACIÓN
-- =====================================================

-- Ver la conversación de prueba
SELECT 
    'CONVERSACIÓN DE PRUEBA' as tipo,
    id,
    title,
    user_id,
    status,
    created_at
FROM conversations 
WHERE title = 'Prueba Mensaje Soporte';

-- =====================================================
-- MENSAJE FINAL
-- =====================================================

SELECT 'PRUEBA COMPLETA: Mensaje de soporte creado correctamente' as status;
