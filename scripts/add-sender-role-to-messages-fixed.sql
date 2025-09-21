-- Script para añadir campo sender_role a la tabla messages (CORREGIDO)
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- PASO 1: ELIMINAR FUNCIONES EXISTENTES
-- =====================================================

-- Eliminar función existente si existe
DROP FUNCTION IF EXISTS get_user_role(uuid);
DROP FUNCTION IF EXISTS get_user_role(UUID);

-- =====================================================
-- PASO 2: AÑADIR CAMPO sender_role A LA TABLA messages
-- =====================================================

-- Añadir columna sender_role si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'sender_role'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE messages 
        ADD COLUMN sender_role TEXT DEFAULT 'user' 
        CHECK (sender_role IN ('user', 'admin', 'moderator', 'support'));
    END IF;
END $$;

-- =====================================================
-- PASO 3: CREAR FUNCIÓN PARA DETERMINAR ROL DEL USUARIO
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
    SELECT role INTO user_role FROM profiles WHERE id = user_id_param;
    RETURN COALESCE(user_role, 'user');
END;
$$;

-- =====================================================
-- PASO 4: CREAR TRIGGER PARA AUTO-ASIGNAR sender_role
-- =====================================================

-- Función del trigger
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

-- Crear trigger
DROP TRIGGER IF EXISTS trigger_set_message_sender_role ON messages;
CREATE TRIGGER trigger_set_message_sender_role
    BEFORE INSERT OR UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION set_message_sender_role();

-- =====================================================
-- PASO 5: ACTUALIZAR MENSAJES EXISTENTES
-- =====================================================

-- Actualizar mensajes existentes con el rol correcto
UPDATE messages 
SET sender_role = get_user_role(sender_id)
WHERE sender_role IS NULL OR sender_role = 'user';

-- =====================================================
-- PASO 6: CREAR VISTA MEJORADA PARA MENSAJES
-- =====================================================

-- Crear vista message_summary con información del remitente
CREATE OR REPLACE VIEW message_summary AS
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
    m.updated_at,
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
-- PASO 7: VERIFICAR CAMBIOS
-- =====================================================

-- Verificar que la columna se añadió correctamente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'messages' 
  AND table_schema = 'public'
  AND column_name = 'sender_role';

-- Verificar algunos mensajes actualizados
SELECT 
    id,
    sender_id,
    sender_role,
    content,
    created_at
FROM messages 
ORDER BY created_at DESC 
LIMIT 5;

-- Verificar la vista
SELECT 
    id,
    sender_id,
    sender_role,
    sender_full_name,
    content
FROM message_summary 
ORDER BY created_at DESC 
LIMIT 5;
