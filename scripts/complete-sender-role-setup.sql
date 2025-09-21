-- Script COMPLETO para configurar sender_role en la tabla messages
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- PASO 1: VERIFICAR SI LA COLUMNA EXISTE
-- =====================================================

-- Verificar si la columna sender_role existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'sender_role'
        AND table_schema = 'public'
    ) THEN
        -- Añadir la columna si no existe
        ALTER TABLE messages 
        ADD COLUMN sender_role TEXT DEFAULT 'user';
        
        RAISE NOTICE 'Columna sender_role añadida a la tabla messages';
    ELSE
        RAISE NOTICE 'Columna sender_role ya existe en la tabla messages';
    END IF;
END $$;

-- =====================================================
-- PASO 2: ELIMINAR CONSTRAINT EXISTENTE SI EXISTE
-- =====================================================

-- Eliminar constraint existente si existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'messages_sender_role_check'
    ) THEN
        ALTER TABLE messages DROP CONSTRAINT messages_sender_role_check;
        RAISE NOTICE 'Constraint messages_sender_role_check eliminado';
    ELSE
        RAISE NOTICE 'No existe constraint messages_sender_role_check';
    END IF;
END $$;

-- =====================================================
-- PASO 3: AÑADIR NUEVO CONSTRAINT CON TODOS LOS VALORES
-- =====================================================

-- Añadir nuevo constraint
ALTER TABLE messages 
ADD CONSTRAINT messages_sender_role_check 
CHECK (sender_role IN ('user', 'admin', 'moderator', 'support', 'client'));

-- =====================================================
-- PASO 4: ELIMINAR FUNCIONES EXISTENTES
-- =====================================================

-- Eliminar funciones existentes
DROP FUNCTION IF EXISTS get_user_role(uuid);
DROP FUNCTION IF EXISTS get_user_role(UUID);
DROP FUNCTION IF EXISTS set_message_sender_role();

-- =====================================================
-- PASO 5: CREAR FUNCIÓN PARA DETERMINAR ROL DEL USUARIO
-- =====================================================

-- Función para obtener el rol de un usuario
CREATE OR REPLACE FUNCTION get_user_role(user_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Obtener el rol del usuario desde la tabla profiles
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
-- PASO 6: CREAR FUNCIÓN DEL TRIGGER
-- =====================================================

-- Función del trigger para auto-asignar sender_role
CREATE OR REPLACE FUNCTION set_message_sender_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Si sender_role no está definido, determinarlo automáticamente
    IF NEW.sender_role IS NULL THEN
        NEW.sender_role := get_user_role(NEW.sender_id);
    END IF;
    
    RETURN NEW;
END;
$$;

-- =====================================================
-- PASO 7: CREAR TRIGGER
-- =====================================================

-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS trigger_set_message_sender_role ON messages;

-- Crear nuevo trigger
CREATE TRIGGER trigger_set_message_sender_role
    BEFORE INSERT OR UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION set_message_sender_role();

-- =====================================================
-- PASO 8: ACTUALIZAR MENSAJES EXISTENTES
-- =====================================================

-- Actualizar mensajes existentes con el rol correcto
UPDATE messages 
SET sender_role = get_user_role(sender_id)
WHERE sender_role IS NULL OR sender_role = 'user';

-- =====================================================
-- PASO 9: CREAR VISTA MEJORADA PARA MENSAJES
-- =====================================================

-- Eliminar vista existente si existe
DROP VIEW IF EXISTS message_summary;

-- Crear vista message_summary con información del remitente
CREATE VIEW message_summary AS
SELECT 
    m.id,
    m.conversation_id,
    m.sender_id,
    m.sender_role,
    m.content,
    m.message_type,
    m.file_url,
    m.file_name,
    m.file_size,
    m.file_type,
    m.reply_to_id,
    m.metadata,
    m.is_read,
    m.is_edited,
    m.edited_at,
    m.created_at,
    -- Información del perfil del remitente
    p.full_name as sender_full_name,
    p.email as sender_email,
    p.avatar_url as sender_avatar_url,
    p.role as sender_profile_role,
    -- Información del mensaje al que responde
    reply_msg.content as reply_to_content,
    reply_p.full_name as reply_to_sender_name
FROM messages m
LEFT JOIN profiles p ON m.sender_id = p.id
LEFT JOIN messages reply_msg ON m.reply_to_id = reply_msg.id
LEFT JOIN profiles reply_p ON reply_msg.sender_id = reply_p.id;

-- =====================================================
-- PASO 10: VERIFICAR CONFIGURACIÓN COMPLETA
-- =====================================================

-- Verificar que la columna existe
SELECT 
    'COLUMNA' as tipo,
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
    'CONSTRAINT' as tipo,
    conname as constraint_name,
    'CHECK constraint exists' as constraint_definition
FROM pg_constraint 
WHERE conname = 'messages_sender_role_check';

-- Verificar la función
SELECT 
    'FUNCION' as tipo,
    proname as function_name,
    proargtypes
FROM pg_proc 
WHERE proname = 'get_user_role';

-- Verificar el trigger
SELECT 
    'TRIGGER' as tipo,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_set_message_sender_role';

-- Verificar roles únicos en mensajes
SELECT 
    'ROLES' as tipo,
    sender_role,
    COUNT(*) as cantidad
FROM messages 
GROUP BY sender_role
ORDER BY sender_role;

-- Verificar algunos mensajes recientes
SELECT 
    'MENSAJES' as tipo,
    id,
    sender_id,
    sender_role,
    LEFT(content, 50) as content_preview,
    created_at
FROM messages 
ORDER BY created_at DESC 
LIMIT 5;

-- =====================================================
-- MENSAJE FINAL
-- =====================================================

SELECT 'CONFIGURACIÓN COMPLETA: sender_role configurado correctamente' as status;
