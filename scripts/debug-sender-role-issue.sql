-- Script para debuggear el problema de sender_role
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- PASO 1: VERIFICAR CONFIGURACIÓN ACTUAL
-- =====================================================

-- Verificar que la columna existe
SELECT 
    'VERIFICACIÓN COLUMNA' as tipo,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'messages' 
  AND table_schema = 'public'
  AND column_name = 'sender_role';

-- Verificar el constraint
SELECT 
    'VERIFICACIÓN CONSTRAINT' as tipo,
    conname as constraint_name
FROM pg_constraint 
WHERE conname = 'messages_sender_role_check';

-- Verificar la función
SELECT 
    'VERIFICACIÓN FUNCIÓN' as tipo,
    proname as function_name
FROM pg_proc 
WHERE proname = 'get_user_role';

-- Verificar el trigger
SELECT 
    'VERIFICACIÓN TRIGGER' as tipo,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_set_message_sender_role';

-- =====================================================
-- PASO 2: VERIFICAR MENSAJES ACTUALES
-- =====================================================

-- Ver mensajes actuales y sus roles
SELECT 
    'MENSAJES ACTUALES' as tipo,
    id,
    sender_id,
    sender_role,
    LEFT(content, 50) as content_preview,
    created_at
FROM messages 
ORDER BY created_at DESC 
LIMIT 10;

-- Ver roles únicos en mensajes
SELECT 
    'ROLES EN MENSAJES' as tipo,
    sender_role,
    COUNT(*) as cantidad
FROM messages 
GROUP BY sender_role
ORDER BY sender_role;

-- =====================================================
-- PASO 3: VERIFICAR PERFILES DE USUARIOS
-- =====================================================

-- Ver perfiles de usuarios y sus roles
SELECT 
    'PERFILES USUARIOS' as tipo,
    id,
    full_name,
    email,
    role,
    created_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- Ver roles únicos en perfiles
SELECT 
    'ROLES EN PERFILES' as tipo,
    role,
    COUNT(*) as cantidad
FROM profiles 
GROUP BY role
ORDER BY role;

-- =====================================================
-- PASO 4: PROBAR LA FUNCIÓN MANUALMENTE
-- =====================================================

-- Probar la función con algunos usuarios
SELECT 
    'PRUEBA FUNCIÓN' as tipo,
    p.id as user_id,
    p.full_name,
    p.role as profile_role,
    get_user_role(p.id) as function_result
FROM profiles p
LIMIT 5;

-- =====================================================
-- PASO 5: FORZAR ACTUALIZACIÓN DE MENSAJES
-- =====================================================

-- Actualizar mensajes existentes con el rol correcto
UPDATE messages 
SET sender_role = get_user_role(sender_id)
WHERE sender_role IS NULL OR sender_role = 'user';

-- Verificar mensajes actualizados
SELECT 
    'MENSAJES ACTUALIZADOS' as tipo,
    id,
    sender_id,
    sender_role,
    LEFT(content, 50) as content_preview,
    created_at
FROM messages 
ORDER BY created_at DESC 
LIMIT 10;

-- =====================================================
-- PASO 6: VERIFICAR TRIGGER FUNCIONANDO
-- =====================================================

-- Crear un mensaje de prueba para verificar el trigger
INSERT INTO messages (
    conversation_id,
    sender_id,
    content,
    message_type
) VALUES (
    (SELECT id FROM conversations LIMIT 1),
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    'Mensaje de prueba para verificar trigger',
    'text'
);

-- Ver el mensaje insertado
SELECT 
    'MENSAJE DE PRUEBA' as tipo,
    id,
    sender_id,
    sender_role,
    content,
    created_at
FROM messages 
WHERE content = 'Mensaje de prueba para verificar trigger'
ORDER BY created_at DESC 
LIMIT 1;

-- =====================================================
-- MENSAJE FINAL
-- =====================================================

SELECT 'DEBUG COMPLETADO: Revisa los resultados arriba' as status;
