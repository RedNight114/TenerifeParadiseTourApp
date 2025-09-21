-- Script para corregir el constraint CHECK de sender_role
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- PASO 1: ELIMINAR CONSTRAINT EXISTENTE
-- =====================================================

-- Eliminar el constraint existente
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_role_check;

-- =====================================================
-- PASO 2: AÑADIR NUEVO CONSTRAINT CON VALOR "client"
-- =====================================================

-- Añadir nuevo constraint que incluye "client"
ALTER TABLE messages 
ADD CONSTRAINT messages_sender_role_check 
CHECK (sender_role IN ('user', 'admin', 'moderator', 'support', 'client'));

-- =====================================================
-- PASO 3: ACTUALIZAR FUNCIÓN PARA MANEJAR "client"
-- =====================================================

-- Función mejorada para obtener el rol de un usuario
CREATE OR REPLACE FUNCTION get_user_role(user_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM profiles WHERE id = user_id_param;
    
    -- Mapear roles de la base de datos a roles del chat
    CASE user_role
        WHEN 'admin' THEN RETURN 'admin';
        WHEN 'moderator' THEN RETURN 'moderator';
        WHEN 'support' THEN RETURN 'support';
        WHEN 'client' THEN RETURN 'client';
        ELSE RETURN 'user';
    END CASE;
END;
$$;

-- =====================================================
-- PASO 4: ACTUALIZAR MENSAJES EXISTENTES CON ROLES CORRECTOS
-- =====================================================

-- Actualizar mensajes existentes con el rol correcto
UPDATE messages 
SET sender_role = get_user_role(sender_id)
WHERE sender_role IS NULL OR sender_role NOT IN ('user', 'admin', 'moderator', 'support', 'client');

-- =====================================================
-- PASO 5: VERIFICAR CAMBIOS
-- =====================================================

-- Verificar el constraint
SELECT 
    conname as constraint_name,
    consrc as constraint_definition
FROM pg_constraint 
WHERE conname = 'messages_sender_role_check';

-- Verificar roles únicos en mensajes
SELECT 
    sender_role,
    COUNT(*) as cantidad
FROM messages 
GROUP BY sender_role
ORDER BY sender_role;

-- Verificar algunos mensajes recientes
SELECT 
    id,
    sender_id,
    sender_role,
    content,
    created_at
FROM messages 
ORDER BY created_at DESC 
LIMIT 10;
