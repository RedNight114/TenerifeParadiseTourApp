-- Script final para verificar que los roles funcionan correctamente
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- VERIFICAR ESTADO ACTUAL
-- =====================================================

-- Ver mensajes recientes con roles
SELECT 
    'MENSAJES RECIENTES' as tipo,
    id,
    sender_id,
    sender_role,
    LEFT(content, 50) as content_preview,
    created_at
FROM messages 
ORDER BY created_at DESC 
LIMIT 5;

-- Ver roles únicos en mensajes
SELECT 
    'ROLES EN MENSAJES' as tipo,
    sender_role,
    COUNT(*) as cantidad
FROM messages 
GROUP BY sender_role
ORDER BY sender_role;

-- Ver perfiles y sus roles
SELECT 
    'PERFILES' as tipo,
    id,
    full_name,
    email,
    role
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- =====================================================
-- CREAR MENSAJE DE PRUEBA DESDE ADMIN
-- =====================================================

-- Insertar mensaje desde admin para probar
INSERT INTO messages (
    conversation_id,
    sender_id,
    content,
    message_type
) VALUES (
    (SELECT id FROM conversations LIMIT 1),
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    'Mensaje de prueba desde admin - debería tener sender_role = admin',
    'text'
);

-- =====================================================
-- CREAR MENSAJE DE PRUEBA DESDE CLIENTE
-- =====================================================

-- Insertar mensaje desde cliente para probar
INSERT INTO messages (
    conversation_id,
    sender_id,
    content,
    message_type
) VALUES (
    (SELECT id FROM conversations LIMIT 1),
    (SELECT id FROM profiles WHERE role = 'client' LIMIT 1),
    'Mensaje de prueba desde cliente - debería tener sender_role = client',
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
WHERE content LIKE '%Mensaje de prueba%'
ORDER BY created_at DESC;

-- =====================================================
-- MENSAJE FINAL
-- =====================================================

SELECT 'PRUEBA COMPLETA: Los roles deberían funcionar correctamente ahora' as status;
